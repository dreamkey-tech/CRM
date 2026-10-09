import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import type { AppEnv } from '../db'
import { authMiddleware } from '../middleware/auth'
import { zodValidationHook } from '../lib/validator'
import { getDirectoryPartnersController } from '../lib/directory'
import { createClientSchema, updateClientSchema, clientQuerySchema, assignClientPartnersSchema, addClientShortlistSchema, updateClientShortlistSchema, createClientPropertyShareSchema, updateClientShareStatusSchema, generateClientDocumentUploadUrlsSchema, attachClientDocumentSchema } from '../zod/client'
import * as controller from '../controllers/client.controller'

const record = z.object({ id: z.string().uuid('Please select a valid client.') })
const shortlist = record.extend({ shortlistId: z.string().uuid('Please select a valid shortlisted property.') })
const share = record.extend({ shareId: z.string().uuid('Please select a valid sharing record.') })
const document = record.extend({ documentId: z.string().uuid('Please select a valid document.') })
const param = (schema: typeof record | typeof shortlist | typeof share | typeof document) => zValidator('param', schema, zodValidationHook)
export const clientRoutes = new Hono<AppEnv>()
clientRoutes.use('*', authMiddleware)
clientRoutes.use('*', async (c, next) => { c.header('Cache-Control', 'no-store'); await next() })
clientRoutes.get('/stats', controller.getClientStatsController)
clientRoutes.get('/partners', getDirectoryPartnersController)
clientRoutes.get('/property-options', zValidator('query', z.object({ search: z.string().trim().max(200).optional(), page: z.coerce.number().int().positive().max(100000).default(1) }), zodValidationHook), controller.clientPropertyOptionsController)
clientRoutes.get('/', zValidator('query', clientQuerySchema, zodValidationHook), controller.listClientsController)
clientRoutes.post('/', zValidator('json', createClientSchema, zodValidationHook), controller.createClientController)
clientRoutes.get('/:id', param(record), controller.getClientController)
clientRoutes.patch('/:id', param(record), zValidator('json', updateClientSchema, zodValidationHook), controller.updateClientController)
clientRoutes.put('/:id', param(record), zValidator('json', updateClientSchema, zodValidationHook), controller.updateClientController)
clientRoutes.delete('/:id', param(record), controller.deleteClientController)
clientRoutes.put('/:id/partners', param(record), zValidator('json', assignClientPartnersSchema, zodValidationHook), controller.updateClientController)
clientRoutes.post('/:id/shortlist', param(record), zValidator('json', addClientShortlistSchema, zodValidationHook), controller.addClientShortlistController)
clientRoutes.patch('/:id/shortlist/:shortlistId', param(shortlist), zValidator('json', updateClientShortlistSchema, zodValidationHook), controller.updateClientShortlistController)
clientRoutes.delete('/:id/shortlist/:shortlistId', param(shortlist), controller.removeClientShortlistController)
clientRoutes.post('/:id/shares', param(record), zValidator('json', createClientPropertyShareSchema, zodValidationHook), controller.createClientShareController)
clientRoutes.patch('/:id/shares/:shareId/status', param(share), zValidator('json', updateClientShareStatusSchema, zodValidationHook), controller.updateClientShareStatusController)
clientRoutes.delete('/:id/shares/:shareId', param(share), controller.revokeClientShareController)
clientRoutes.post('/:id/documents/upload-urls', param(record), zValidator('json', generateClientDocumentUploadUrlsSchema, zodValidationHook), controller.generateClientDocumentUploadController)
clientRoutes.post('/:id/documents', param(record), zValidator('json', attachClientDocumentSchema, zodValidationHook), controller.attachClientDocumentController)
clientRoutes.delete('/:id/documents/uploads', param(record), zValidator('json', z.object({ key: z.string().min(1).max(1024) }).strict(), zodValidationHook), controller.discardClientDocumentUploadController)
clientRoutes.get('/:id/documents/:documentId/download', param(document), controller.downloadClientDocumentController)
clientRoutes.delete('/:id/documents/:documentId', param(document), controller.deleteClientDocumentController)

export const publicClientShareRoutes = new Hono<AppEnv>()
publicClientShareRoutes.get('/:token', zValidator('param', z.object({ token: z.string().regex(/^[a-f0-9]{64}$/, 'This property link is invalid.') }), zodValidationHook), controller.publicClientShareController)
