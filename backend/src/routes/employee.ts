import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import type { AppEnv } from '../db'
import { authMiddleware, requirePermission } from '../middleware/auth'
import { zodValidationHook } from '../lib/validator'
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  resetEmployeePasswordSchema,
  employeeQuerySchema,
} from '../zod/employee'
import {
  listEmployeesController,
  getEmployeeByIdController,
  createEmployeeController,
  updateEmployeeController,
  resetEmployeePasswordController,
  deleteEmployeeController,
} from '../controllers/employee.controller'

export const employeeRoutes = new Hono<AppEnv>()

// All employee routes require authentication
employeeRoutes.use('*', authMiddleware)

// List employees
employeeRoutes.get(
  '/',
  requirePermission('employees:read'),
  zValidator('query', employeeQuerySchema, zodValidationHook),
  listEmployeesController
)

// Get employee by ID
employeeRoutes.get('/:id', requirePermission('employees:read'), getEmployeeByIdController)

// Create employee
employeeRoutes.post(
  '/',
  requirePermission('employees:manage'),
  zValidator('json', createEmployeeSchema, zodValidationHook),
  createEmployeeController
)

// Update employee
employeeRoutes.patch(
  '/:id',
  requirePermission('employees:manage'),
  zValidator('json', updateEmployeeSchema, zodValidationHook),
  updateEmployeeController
)

// Reset employee password
employeeRoutes.post(
  '/:id/reset-password',
  requirePermission('employees:manage'),
  zValidator('json', resetEmployeePasswordSchema, zodValidationHook),
  resetEmployeePasswordController
)

// Delete employee (Super Admin / manage permission)
employeeRoutes.delete(
  '/:id',
  requirePermission('employees:manage'),
  deleteEmployeeController
)
