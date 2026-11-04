import { Hono } from 'hono'
import type { AppEnv } from '../db'
import { authMiddleware, requirePermission, requireAnyPermission } from '../middleware/auth'
import {
  getWebsiteUserStatsController,
  getWebsiteUsersListController,
  getWebsiteUserDetailController,
  updateWebsiteUserStatusController,
  getWebsiteEnquiriesListController,
  getWebsiteEnquiryStatsController,
  updateWebsiteEnquiryStatusController,
  deleteWebsiteEnquiryController,
} from '../controllers/admin-website-users.controller'

export const adminWebsiteUserRoutes = new Hono<AppEnv>()

/**
 * CRM Admin Website User & Enquiry Management
 * Base path mounted at: /v1/admin/website-users
 */

// All admin website user and enquiry management endpoints require authentication
adminWebsiteUserRoutes.use('*', authMiddleware)

// Analytics & Stats for CRM Dashboard
adminWebsiteUserRoutes.get('/stats', requireAnyPermission(['users:read', 'employees:read']), getWebsiteUserStatsController)

// Website Enquiries Management Routes
adminWebsiteUserRoutes.get('/enquiries/stats', requireAnyPermission(['users:read', 'clients:read']), getWebsiteEnquiryStatsController)
adminWebsiteUserRoutes.get('/enquiries', requireAnyPermission(['users:read', 'clients:read']), getWebsiteEnquiriesListController)
adminWebsiteUserRoutes.patch('/enquiries/:id/status', requireAnyPermission(['users:update', 'clients:update']), updateWebsiteEnquiryStatusController)
adminWebsiteUserRoutes.delete('/enquiries/:id', requireAnyPermission(['users:delete', 'clients:delete']), deleteWebsiteEnquiryController)

// List website users with search, pagination, filters
adminWebsiteUserRoutes.get('/', requireAnyPermission(['users:read', 'employees:read']), getWebsiteUsersListController)

// Get website user profile & session history
adminWebsiteUserRoutes.get('/:id', requireAnyPermission(['users:read', 'employees:read']), getWebsiteUserDetailController)

// Update user status (active / deactive)
adminWebsiteUserRoutes.patch('/:id/status', requireAnyPermission(['users:update', 'employees:manage']), updateWebsiteUserStatusController)

