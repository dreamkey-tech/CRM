const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { createRequire } = require('node:module')
const { transformSync } = createRequire(require.resolve('wrangler/package.json'))('esbuild')
const source = fs.readFileSync(path.resolve(__dirname, '../src/lib/r2.ts'), 'utf8')
const code = transformSync(source, { loader: 'ts', format: 'cjs' }).code
const loaded = { exports: {} }
new Function('require', 'module', 'exports', code)(require, loaded, loaded.exports)
const { getR2PublicUrl } = loaded.exports

test('existing R2_PUBLIC_URL configuration produces usable media URLs', () => {
  assert.equal(getR2PublicUrl({ R2_PUBLIC_URL: 'https://media.example.com/' }, '/properties/photo.jpeg'),
    'https://media.example.com/properties/photo.jpeg')
})
test('R2_PUBLIC_DOMAIN takes precedence over the compatibility alias', () => {
  assert.equal(getR2PublicUrl({ R2_PUBLIC_DOMAIN: 'https://domain.example.com', R2_PUBLIC_URL: 'https://alias.example.com' }, 'photo.jpeg'),
    'https://domain.example.com/photo.jpeg')
})
test('missing public URL gives a configuration error', () => {
  assert.throws(() => getR2PublicUrl({}, 'photo.jpeg'), /R2_PUBLIC_DOMAIN or R2_PUBLIC_URL/)
})

test('S3 API endpoint cannot be used as the public image domain', () => {
  assert.throws(() => getR2PublicUrl({ R2_PUBLIC_URL: 'https://account-id.r2.cloudflarestorage.com' }, 'photo.jpeg'), /private S3 API endpoint/)
})
