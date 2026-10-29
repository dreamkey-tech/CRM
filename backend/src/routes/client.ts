import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import type { AppEnv } from '../db'
import { authMiddleware, requirePermission } from '../middleware/auth'
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
clientRoutes.get('/stats', requirePermission('clients:read'), controller.getClientStatsController)
clientRoutes.get('/partners', requirePermission('clients:read'), getDirectoryPartnersController)
clientRoutes.get('/property-options', requirePermission('clients:read'), zValidator('query', z.object({ search: z.string().trim().max(200).optional(), page: z.coerce.number().int().positive().max(100000).default(1) }), zodValidationHook), controller.clientPropertyOptionsController)
clientRoutes.get('/', requirePermission('clients:read'), zValidator('query', clientQuerySchema, zodValidationHook), controller.listClientsController)
clientRoutes.post('/', requirePermission('clients:create'), zValidator('json', createClientSchema, zodValidationHook), controller.createClientController)
clientRoutes.get('/:id', requirePermission('clients:read'), param(record), controller.getClientController)
clientRoutes.patch('/:id', requirePermission('clients:update'), param(record), zValidator('json', updateClientSchema, zodValidationHook), controller.updateClientController)
clientRoutes.put('/:id', requirePermission('clients:update'), param(record), zValidator('json', updateClientSchema, zodValidationHook), controller.updateClientController)
clientRoutes.delete('/:id', requirePermission('clients:delete'), param(record), controller.deleteClientController)
clientRoutes.put('/:id/partners', requirePermission('clients:update'), param(record), zValidator('json', assignClientPartnersSchema, zodValidationHook), controller.updateClientController)
clientRoutes.post('/:id/shortlist', requirePermission('clients:update'), param(record), zValidator('json', addClientShortlistSchema, zodValidationHook), controller.addClientShortlistController)
clientRoutes.patch('/:id/shortlist/:shortlistId', requirePermission('clients:update'), param(shortlist), zValidator('json', updateClientShortlistSchema, zodValidationHook), controller.updateClientShortlistController)
clientRoutes.delete('/:id/shortlist/:shortlistId', requirePermission('clients:update'), param(shortlist), controller.removeClientShortlistController)
clientRoutes.post('/:id/shares', requirePermission('clients:update'), param(record), zValidator('json', createClientPropertyShareSchema, zodValidationHook), controller.createClientShareController)
clientRoutes.patch('/:id/shares/:shareId/status', requirePermission('clients:update'), param(share), zValidator('json', updateClientShareStatusSchema, zodValidationHook), controller.updateClientShareStatusController)
clientRoutes.delete('/:id/shares/:shareId', requirePermission('clients:update'), param(share), controller.revokeClientShareController)
clientRoutes.post('/:id/documents/upload-urls', requirePermission('clients:update'), param(record), zValidator('json', generateClientDocumentUploadUrlsSchema, zodValidationHook), controller.generateClientDocumentUploadController)
clientRoutes.post('/:id/documents', requirePermission('clients:update'), param(record), zValidator('json', attachClientDocumentSchema, zodValidationHook), controller.attachClientDocumentController)
clientRoutes.delete('/:id/documents/uploads', requirePermission('clients:update'), param(record), zValidator('json', z.object({ key: z.string().min(1).max(1024) }).strict(), zodValidationHook), controller.discardClientDocumentUploadController)
clientRoutes.get('/:id/documents/:documentId/download', requirePermission('clients:read'), param(document), controller.downloadClientDocumentController)
clientRoutes.delete('/:id/documents/:documentId', requirePermission('clients:delete'), param(document), controller.deleteClientDocumentController)

export const publicClientShareRoutes = new Hono<AppEnv>()
publicClientShareRoutes.get('/:token', zValidator('param', z.object({ token: z.string().regex(/^[a-f0-9]{64}$/, 'This property link is invalid.') }), zodValidationHook), controller.publicClientShareController)
