const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { createRequire } = require('node:module')
const { transformSync } = createRequire(require.resolve('wrangler/package.json'))('esbuild')

// Run the actual provider with deterministic hooks and mocked HTTP boundaries.
function harness(api) {
  const hooks = [], effects = []
  let cursor = 0, scheduled = false, value
  const render = () => {
    scheduled = false; cursor = 0
    value = provider({ children: null }).props.value
    while (effects.length) effects.shift()()
  }
  const schedule = () => { if (!scheduled) { scheduled = true; queueMicrotask(render) } }
  const react = {
    createContext: () => ({ Provider: 'provider' }), useContext: () => value,
    useState: (initial) => {
      const slot = cursor++
      if (!(slot in hooks)) hooks[slot] = initial
      return [hooks[slot], (next) => {
        const result = typeof next === 'function' ? next(hooks[slot]) : next
        if (!Object.is(result, hooks[slot])) { hooks[slot] = result; schedule() }
      }]
    },
    useRef: (initial) => hooks[cursor++] ||= { current: initial },
    useCallback: (callback) => hooks[cursor++] ||= callback,
    useEffect: (effect, dependencies) => {
      const slot = cursor++, previous = hooks[slot]
      if (!previous || dependencies.some((dep, i) => !Object.is(dep, previous[i]))) {
        hooks[slot] = dependencies; effects.push(effect)
      }
    },
  }
  const filename = path.resolve(__dirname, '../../frontend/context/MediaUploadContext.tsx')
  const code = transformSync(fs.readFileSync(filename, 'utf8'), { loader: 'tsx', format: 'cjs', jsx: 'automatic' }).code
  const module = { exports: {} }
  new Function('require', 'module', 'exports', 'window', code)((name) => {
    if (name === 'react') return react
    if (name === 'react/jsx-runtime') return { jsx: (type, props) => ({ type, props }) }
    if (name === '../api/properties') return api
    if (name === '../utils/toast') return { toast: { error() {}, success() {}, info() {} } }
    throw new Error(`Unexpected dependency: ${name}`)
  }, module, module.exports, { addEventListener() {}, removeEventListener() {} })
  const provider = module.exports.MediaUploadProvider
  render()
  return () => value
}
const file = (name) => ({ file: { name, size: 100, type: 'image/jpeg' }, category: 'PHOTOGRAPH' })
const sign = async ({ propertyId, files }) => ({ urls: [{ key: `properties/${propertyId}/${files[0].filename}`,
  publicUrl: 'https://media.example.com/file.jpg', uploadUrl: 'https://upload.example.com/file' }] })
const attach = async (_, media) => media.map((item) => ({ id: item.key, ...item }))
async function until(condition) {
  for (let i = 0; i < 100; i++) { if (condition()) return; await new Promise((resolve) => setImmediate(resolve)) }
  assert.fail('Queue did not reach the expected state')
}

test('queue allows three uploads and starts the fourth when a slot opens', async () => {
  const releases = []
  let active = 0, maximum = 0
  const get = harness({ generateUploadUrls: sign, attachPropertyMedia: attach,
    uploadFileToR2: async () => {
      active++; maximum = Math.max(maximum, active)
      await new Promise((resolve) => releases.push(resolve)); active--
    } })
  await get().startUploadBatch('property-1', ['1.jpg', '2.jpg', '3.jpg', '4.jpg'].map(file))
  await until(() => releases.length === 3)
  assert.equal(maximum, 3)
  releases[0]()
  await until(() => releases.length === 4)
  releases.slice(1).forEach((release) => release())
  await until(() => get().completedCount === 4)
  assert.equal(maximum, 3)
})

test('attachment stays active and retry does not upload the file again', async () => {
  let puts = 0, signs = 0, calls = 0, rejectAttachment
  const get = harness({ generateUploadUrls: async (input) => { signs++; return sign(input) },
    uploadFileToR2: async () => { puts++ },
    attachPropertyMedia: async (_, media) => {
      if (++calls === 1) await new Promise((_, reject) => { rejectAttachment = reject })
      return attach('property-1', media)
    } })
  await get().startUploadBatch('property-1', [file('1.jpg')])
  await until(() => get().tasks[0].status === 'ATTACHING' && rejectAttachment)
  assert.equal(get().completedCount, 0)
  assert.equal(get().isUploading, true)
  rejectAttachment(new Error('Temporary attachment error'))
  await until(() => get().tasks[0].status === 'ERROR')
  get().retryTask(get().tasks[0].id)
  await until(() => get().completedCount === 1)
  assert.equal(puts, 1); assert.equal(signs, 1); assert.equal(calls, 2)
})

test('PUT retry requests a fresh presigned URL', async () => {
  let signs = 0, puts = 0
  const requestedKeys = []
  const get = harness({ generateUploadUrls: async (input) => { signs++; requestedKeys.push(input.files[0].existingKey); return sign(input) },
    uploadFileToR2: async () => { if (++puts === 1) throw new Error('Expired URL') }, attachPropertyMedia: attach })
  await get().startUploadBatch('property-1', [file('1.jpg')])
  await until(() => get().tasks[0].status === 'ERROR')
  get().retryTask(get().tasks[0].id)
  await until(() => get().completedCount === 1)
  assert.equal(signs, 2); assert.equal(puts, 2)
  assert.equal(requestedKeys[1], 'properties/property-1/1.jpg')
})

test('cancel aborts an active PUT without attaching it', async () => {
  let signal, attachments = 0
  const get = harness({ generateUploadUrls: sign, discardPropertyUpload: async () => {}, uploadFileToR2: async (_, __, ___, abortSignal) => {
    signal = abortSignal
    await new Promise((_, reject) => signal.addEventListener('abort', () => reject(new Error('Aborted'))))
  }, attachPropertyMedia: async () => { attachments++; return [] } })
  await get().startUploadBatch('property-1', [file('1.jpg')])
  await until(() => signal)
  await get().cancelTask(get().tasks[0].id)
  await until(() => get().tasks[0].status === 'CANCELLED')
  assert.equal(signal.aborted, true); assert.equal(attachments, 0)
})
