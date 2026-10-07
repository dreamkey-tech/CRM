import { Hono } from 'hono'
import type { AppEnv } from '../db'
import { authMiddleware, requirePermission } from '../middleware/auth'
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

// Analytics & Stats for CRM Dashboard
adminWebsiteUserRoutes.get('/stats', getWebsiteUserStatsController)

// Website Enquiries Management Routes
adminWebsiteUserRoutes.get('/enquiries/stats', getWebsiteEnquiryStatsController)
adminWebsiteUserRoutes.get('/enquiries', getWebsiteEnquiriesListController)
adminWebsiteUserRoutes.patch('/enquiries/:id/status', updateWebsiteEnquiryStatusController)
adminWebsiteUserRoutes.delete('/enquiries/:id', deleteWebsiteEnquiryController)

// List website users with search, pagination, filters
adminWebsiteUserRoutes.get('/', getWebsiteUsersListController)

// Get website user profile & session history
adminWebsiteUserRoutes.get('/:id', getWebsiteUserDetailController)

// Update user status (active / deactive)
adminWebsiteUserRoutes.patch('/:id/status', updateWebsiteUserStatusController)

