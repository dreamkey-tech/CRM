import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Bindings } from '../db'

/**
 * Creates or retrieves configured S3Client instance targeting Cloudflare R2
 */
export function getR2Client(env: Bindings): S3Client {
  const accountId = env.R2_ACCOUNT_ID
  const accessKeyId = env.R2_ACCESS_KEY_ID
  const secretAccessKey = env.R2_SECRET_ACCESS_KEY

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      'Cloudflare R2 credentials are not configured. Please verify R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY in your environment variables.'
    )
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  })
}

/**
 * Returns the public CDN / custom domain URL for an R2 key
 */
export function getR2PublicUrl(env: Bindings, key: string): string {
  const publicDomain = (env.R2_PUBLIC_DOMAIN || env.R2_PUBLIC_URL || '').trim().replace(/\/+$/, '')
  if (!publicDomain) throw new Error('R2_PUBLIC_DOMAIN or R2_PUBLIC_URL must be configured to display uploaded files.')
  const domain = new URL(publicDomain)
  if (domain.hostname.endsWith('.r2.cloudflarestorage.com')) {
    throw new Error("R2_PUBLIC_URL points to the private S3 API endpoint. Use your bucket's public r2.dev URL or custom domain.")
  }
  if (!['https:', 'http:'].includes(domain.protocol)) throw new Error('R2 public URL must use HTTPS or HTTP.')
  const cleanKey = key.replace(/^\/+/, '')
  return `${publicDomain}/${cleanKey}`
}

/**
 * Generates a presigned PUT URL for direct browser-to-R2 upload
 */
export async function generatePresignedUploadUrl(
  env: Bindings,
  params: {
    key: string
    contentType: string
    contentLength?: number
    expiresIn?: number // in seconds, default 300 (5 mins)
  }
): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
  const s3 = getR2Client(env)
  const bucket = env.R2_BUCKET_NAME

  if (!bucket) {
    throw new Error('R2_BUCKET_NAME is not configured in environment variables.')
  }

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: params.key,
    ContentType: params.contentType,
    ...(params.contentLength ? { ContentLength: params.contentLength } : {}),
  })

  const uploadUrl = await getSignedUrl(s3, command, {
    expiresIn: params.expiresIn || 300,
  })

  const publicUrl = getR2PublicUrl(env, params.key)

  return {
    uploadUrl,
    publicUrl,
    key: params.key,
  }
}

/**
 * Deletes a single file from Cloudflare R2
 */
export async function deleteR2Object(env: Bindings, key: string): Promise<boolean> {
  if (!key) return true
  try {
    const s3 = getR2Client(env)
    const bucket = env.R2_BUCKET_NAME
    if (!bucket) return false

    await s3.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    )
    return true
  } catch (error) {
    console.error(`Failed to delete object from R2 (key: ${key}):`, error)
    return false
  }
}

/**
 * Batch deletes multiple files from Cloudflare R2
 */
export async function deleteR2Objects(env: Bindings, keys: string[]): Promise<boolean> {
  const validKeys = keys.filter(Boolean)
  if (validKeys.length === 0) return true

  try {
    const s3 = getR2Client(env)
    const bucket = env.R2_BUCKET_NAME
    if (!bucket) return false

    // S3 DeleteObjects supports up to 1000 objects per request
    const batchSize = 1000
    for (let i = 0; i < validKeys.length; i += batchSize) {
      const batch = validKeys.slice(i, i + batchSize)
      const result = await s3.send(
        new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: {
            Objects: batch.map((Key) => ({ Key })),
            Quiet: true,
          },
        })
      )
      if (result.Errors?.length) return false
    }
    return true
  } catch (error) {
    console.error('Failed to batch delete objects from R2:', error)
    return false
  }
}

/**
 * Creates a sanitized, collision-resistant R2 object key
 */
export function buildPropertyMediaKey(params: {
  propertyId: string
  category: string
  filename: string
}): string {
  const sanitize = (str: string) =>
    str.toLowerCase().replace(/[^a-z0-9.-]/g, '_')

  const ext = params.filename.includes('.')
    ? params.filename.split('.').pop()!
    : 'bin'

  const randomId = crypto.randomUUID().slice(0, 8)
  const timestamp = Date.now()
  const cleanCategory = sanitize(params.category || 'media')
  const cleanFilename = sanitize(params.filename.replace(/\.[^/.]+$/, ''))

  return `properties/${params.propertyId}/${cleanCategory}/${timestamp}-${randomId}-${cleanFilename}.${ext}`
}

/** Verify that an attachment represents an object actually uploaded to this bucket. */
export async function verifyR2Object(env: Bindings, key: string, sizeBytes: number, mimeType: string): Promise<boolean> {
  const object = await getR2Client(env).send(new HeadObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key }))
  return object.ContentLength === sizeBytes && object.ContentType === mimeType
}
