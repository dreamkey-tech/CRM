import { PutObjectCommand, GetObjectCommand, HeadObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import type { Bindings } from '../db'
import { getR2Client } from './r2'
import { AppError } from './errors'
import type { ClientDocumentCategory } from '../config/media-config'

function bucket(env: Bindings) {
  const name = env.R2_CLIENT_DOCUMENTS_BUCKET?.trim() || env.R2_BUCKET_NAME?.trim()
  if (!name) throw new AppError('Client document storage is not configured. Please configure the R2 bucket.', 503, 'DOCUMENT_STORAGE_NOT_CONFIGURED')
  return name
}
export function validateClientDocumentKey(clientId: string, key: string, category?: ClientDocumentCategory) {
  const prefix = `clients/${clientId}/documents/`
  const suffix = key.slice(prefix.length)
  if (!key.startsWith(prefix) || !/^(AADHAAR|PAYMENT_RECEIPT|CLIENT_DOCUMENT|PCC_APPLICATION|CERTIFICATE|KYC)\/[a-f0-9-]{36}\.(pdf|jpg|png|webp)$/.test(suffix) || (category && !suffix.startsWith(`${category}/`))) {
    throw new AppError('This document does not belong to the selected client or category.', 400, 'INVALID_DOCUMENT_KEY')
  }
}
export async function signClientDocumentUpload(env: Bindings, clientId: string, file: { category: ClientDocumentCategory; mimeType: string; sizeBytes: number }) {
  const extension = ({ 'application/pdf': 'pdf', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' } as Record<string, string>)[file.mimeType]
  const key = `clients/${clientId}/documents/${file.category}/${crypto.randomUUID()}.${extension}`
  const uploadUrl = await getSignedUrl(getR2Client(env), new PutObjectCommand({ Bucket: bucket(env), Key: key, ContentType: file.mimeType, ContentLength: file.sizeBytes }), { expiresIn: 300 })
  return { key, uploadUrl }
}
export function matchesDocumentSignature(bytes: Uint8Array, mimeType: string) {
  const starts = (values: number[]) => values.every((value, index) => bytes[index] === value)
  if (mimeType === 'application/pdf') return starts([37, 80, 68, 70, 45])
  if (mimeType === 'image/jpeg') return starts([255, 216, 255])
  if (mimeType === 'image/png') return starts([137, 80, 78, 71, 13, 10, 26, 10])
  if (mimeType === 'image/webp') return starts([82, 73, 70, 70]) && [87, 69, 66, 80].every((value, index) => bytes[index + 8] === value)
  return false
}
export async function verifyClientDocument(env: Bindings, key: string, sizeBytes: number, mimeType: string) {
  const storage = getR2Client(env), Bucket = bucket(env)
  const head = await storage.send(new HeadObjectCommand({ Bucket, Key: key }))
  if (head.ContentLength !== sizeBytes || head.ContentType !== mimeType) throw new AppError('Uploaded document details do not match. Please upload the file again.', 400, 'DOCUMENT_MISMATCH')
  const object = await storage.send(new GetObjectCommand({ Bucket, Key: key, Range: 'bytes=0-15' }))
  const bytes = await object.Body?.transformToByteArray()
  if (!bytes || !matchesDocumentSignature(bytes, mimeType)) throw new AppError('The file content does not match its PDF or image type.', 400, 'INVALID_DOCUMENT_CONTENT')
}
export async function signClientDocumentDownload(env: Bindings, document: { key: string; originalName: string; mimeType: string }, inline: boolean) {
  const name = document.originalName.replace(/[\r\n"\\]/g, '_')
  return getSignedUrl(getR2Client(env), new GetObjectCommand({ Bucket: bucket(env), Key: document.key,
    ResponseContentType: document.mimeType, ResponseContentDisposition: `${inline ? 'inline' : 'attachment'}; filename="${name.replace(/[^\x20-\x7e]/g, '_')}"; filename*=UTF-8''${encodeURIComponent(name)}`,
  }), { expiresIn: 120 })
}
export async function removeClientDocumentObject(env: Bindings, key: string) {
  await getR2Client(env).send(new DeleteObjectCommand({ Bucket: bucket(env), Key: key }))
}
