/**
 * OpenAPI 3.0.0 Specification for DreamKey CRM Backend API
 */
export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'DreamKey CRM API',
    version: '1.0.0',
    description:
      'Production-grade REST API for DreamKey CRM featuring RBAC permission guards, session management, roles, and leads.',
  },
  servers: [
    {
      url: 'http://localhost:8787',
      description: 'Local Development Server',
    },
  ],
  tags: [
    { name: 'Auth', description: 'Authentication & Session operations' },
    { name: 'Website User Auth', description: 'Public Website Customer Authentication (Separate access_token session)' },
    { name: 'Admin - Website Users', description: 'CRM Website User Management, Analytics & Returning Visitor Tracking' },
    { name: 'Admin - Website Enquiries', description: 'CRM Website Property Enquiry Management' },
    { name: 'Admin - Roles & Permissions', description: 'Role-Based Access Control (RBAC) management' },
    { name: 'Leads', description: 'CRM Lead management' },
    { name: 'OAuth & Social Auth', description: 'Google OAuth / Better Auth login flow' },
    { name: 'Website Enquiries', description: 'Public property enquiry submission endpoints' },
  ],
  paths: {
    '/v1/website/enquiry': {
      post: {
        tags: ['Website Enquiries'],
        summary: 'Submit Property Enquiry',
        description: 'Public endpoint for website visitors to submit a property enquiry. No authentication required.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['fullName', 'mobileNo', 'email', 'propertyType', 'preferredLocation', 'estimatedBudgetBand'],
                properties: {
                  fullName: { type: 'string', minLength: 2, example: 'Rahul Sharma' },
                  mobileNo: { type: 'string', minLength: 5, example: '+91 98765 43210' },
                  email: { type: 'string', format: 'email', example: 'rahul@example.com' },
                  propertyType: { type: 'string', example: '2BHK Apartment' },
                  preferredLocation: { type: 'string', example: 'Andheri West, Mumbai' },
                  estimatedBudgetBand: { type: 'string', example: '50L - 80L' },
                  specificRequirements: { type: 'string', nullable: true, example: 'Near metro station, parking required' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Enquiry submitted successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Your enquiry has been submitted successfully. Our team will contact you shortly.' },
                    enquiry: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        fullName: { type: 'string' },
                        mobileNo: { type: 'string' },
                        email: { type: 'string' },
                        propertyType: { type: 'string' },
                        preferredLocation: { type: 'string' },
                        estimatedBudgetBand: { type: 'string' },
                        specificRequirements: { type: 'string', nullable: true },
                        status: { type: 'string', example: 'NEW' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Validation error — missing or invalid fields.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    error: { type: 'string' },
                    code: { type: 'string', example: 'VALIDATION_ERROR' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/v1/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        description: 'Creates a new user account. First user is automatically designated as SUPER_ADMIN.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Alex Smith' },
                  email: { type: 'string', format: 'email', example: 'admin@dreamkey.io' },
                  password: { type: 'string', format: 'password', minLength: 6, example: 'secret123' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'User registered successfully and session cookie set.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Account created successfully' },
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        email: { type: 'string' },
                        name: { type: 'string' },
                        roles: { type: 'array', items: { type: 'string' } },
                        permissions: { type: 'array', items: { type: 'string' } },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Validation error or email already exists.',
          },
        },
      },
    },
    '/v1/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Log in user',
        description: 'Authenticates with email and password, returning user data and setting HttpOnly auth_session cookie.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'admin@dreamkey.io' },
                  password: { type: 'string', format: 'password', example: 'secret123' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Login successful' },
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        email: { type: 'string' },
                        name: { type: 'string' },
                        roles: { type: 'array', items: { type: 'string' } },
                        permissions: { type: 'array', items: { type: 'string' } },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Invalid email or password.',
          },
        },
      },
    },
    '/v1/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user profile',
        description: 'Retrieves active user profile and compiled permissions using the session cookie.',
        responses: {
          '200': {
            description: 'Current user profile.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        email: { type: 'string' },
                        name: { type: 'string' },
                        roles: { type: 'array', items: { type: 'string' } },
                        permissions: { type: 'array', items: { type: 'string' } },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized - invalid or missing session cookie.',
          },
        },
      },
    },
    '/v1/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Log out user',
        description: 'Destroys the session in the database and clears the HttpOnly cookie.',
        responses: {
          '200': {
            description: 'Logged out successfully.',
          },
        },
      },
    },
    '/v1/admin/permissions': {
      get: {
        tags: ['Admin - Roles & Permissions'],
        summary: 'List all atomic permissions',
        description: 'Requires roles:read permission.',
        responses: {
          '200': {
            description: 'List of all system permissions.',
          },
          '403': {
            description: 'Forbidden.',
          },
        },
      },
    },
    '/v1/admin/roles': {
      get: {
        tags: ['Admin - Roles & Permissions'],
        summary: 'List all roles with permissions',
        description: 'Requires roles:read permission.',
        responses: {
          '200': {
            description: 'List of all roles.',
          },
        },
      },
      post: {
        tags: ['Admin - Roles & Permissions'],
        summary: 'Create a custom role',
        description: 'Requires roles:create permission.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', example: 'SUPPORT_LEAD' },
                  description: { type: 'string', example: 'Customer support team lead' },
                  permissionIds: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Role created.',
          },
        },
      },
    },
    '/v1/admin/roles/{id}': {
      put: {
        tags: ['Admin - Roles & Permissions'],
        summary: 'Update a role',
        description: 'Requires roles:update permission.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  permissionIds: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Role updated.',
          },
        },
      },
    },
    '/v1/admin/users/{id}/roles': {
      post: {
        tags: ['Admin - Roles & Permissions'],
        summary: 'Assign roles to a user',
        description: 'Requires users:update permission.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['roleIds'],
                properties: {
                  roleIds: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'User roles updated.',
          },
        },
      },
    },
    '/v1/leads': {
      get: {
        tags: ['Leads'],
        summary: 'List leads',
        description: 'Protected by leads:read permission.',
        responses: {
          '200': {
            description: 'List of CRM leads.',
          },
          '403': {
            description: 'Forbidden.',
          },
        },
      },
      post: {
        tags: ['Leads'],
        summary: 'Create lead',
        description: 'Protected by leads:create permission.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Cyberdyne Systems' },
                  value: { type: 'string', example: '$250,000' },
                  status: { type: 'string', example: 'NEW' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Lead created.',
          },
        },
      },
    },
    '/v1/user/auth/register': {
      post: {
        tags: ['Website User Auth'],
        summary: 'Website User Registration',
        description: 'Creates a new website customer account and sets HttpOnly access_token cookie.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  name: { type: 'string', example: 'John Doe' },
                  email: { type: 'string', format: 'email', example: 'john@example.com' },
                  password: { type: 'string', format: 'password', minLength: 6, example: 'securepassword123' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'User registered successfully and access_token cookie set.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        email: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': { description: 'Validation error or email already exists.' },
        },
      },
    },
    '/v1/user/auth/login': {
      post: {
        tags: ['Website User Auth'],
        summary: 'Website User Login',
        description: 'Authenticates website user, sets HttpOnly access_token cookie, tracks returning visits.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'john@example.com' },
                  password: { type: 'string', format: 'password', example: 'securepassword123' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        email: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Invalid email or password.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Invalid email or password' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/v1/user/auth/me': {
      get: {
        tags: ['Website User Auth'],
        summary: 'Get Current Website User',
        description: 'Hydrates user session from HttpOnly access_token cookie.',
        responses: {
          '200': {
            description: 'Current user profile.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        email: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized / expired session.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Unauthorized' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/v1/user/auth/refresh': {
      post: {
        tags: ['Website User Auth'],
        summary: 'Refresh Website Session Token',
        description: 'Refreshes session and rotates access_token cookie.',
        responses: {
          '200': {
            description: 'Token refreshed.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Token refreshed successfully' },
                  },
                },
              },
            },
          },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/v1/user/auth/logout': {
      post: {
        tags: ['Website User Auth'],
        summary: 'Website User Logout',
        description: 'Invalidates session and clears access_token cookie.',
        responses: {
          '200': {
            description: 'Logged out successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Logged out successfully' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/v1/admin/website-users/stats': {
      get: {
        tags: ['Admin - Website Users'],
        summary: 'Get Website User Analytics & Returning Visitor Metrics',
        description: 'Returns total users, active users, returning users, and registration trends.',
        responses: {
          '200': {
            description: 'Analytics summary for CRM dashboard.',
          },
          '401': { description: 'CRM authentication required.' },
        },
      },
    },
    '/v1/admin/website-users': {
      get: {
        tags: ['Admin - Website Users'],
        summary: 'List Website Users',
        description: 'Paginated and searchable list of website users with returning visit indicators.',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['active', 'inactive', 'all'] } },
          { name: 'authProvider', in: 'query', description: 'Filter by auth provider (e.g. EMAIL, GOOGLE)', schema: { type: 'string', enum: ['EMAIL', 'GOOGLE'] } },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['createdAt', 'updatedAt', 'lastLoginAt', 'lastActiveAt', 'loginCount', 'name', 'email', 'authProvider', 'emailVerified'] } },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
        ],
        responses: {
          '200': { description: 'Paginated website users list.' },
        },
      },
    },
    '/v1/admin/website-users/{id}': {
      get: {
        tags: ['Admin - Website Users'],
        summary: 'Get Website User Details',
        description: 'Full profile and recent session history of a website user.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'User profile and session history.' },
          '404': { description: 'User not found.' },
        },
      },
    },
    '/v1/admin/website-users/{id}/status': {
      patch: {
        tags: ['Admin - Website Users'],
        summary: 'Update Website User Status (Active / Deactivated)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['isActive'],
                properties: {
                  isActive: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Status updated.' },
        },
      },
    },
    '/v1/admin/website-users/enquiries/stats': {
      get: {
        tags: ['Admin - Website Enquiries'],
        summary: 'Get Website Enquiry Stats',
        description: 'Returns aggregate counts for all enquiries — total, new today, new this week, pending (NEW), in-progress, and resolved.',
        responses: {
          '200': {
            description: 'Enquiry stats summary.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    stats: {
                      type: 'object',
                      properties: {
                        total: { type: 'integer', example: 200 },
                        newToday: { type: 'integer', example: 5 },
                        newThisWeek: { type: 'integer', example: 28 },
                        pending: { type: 'integer', example: 80 },
                        inProgress: { type: 'integer', example: 45 },
                        resolved: { type: 'integer', example: 75 },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': { description: 'CRM authentication required.' },
        },
      },
    },
    '/v1/admin/website-users/enquiries': {
      get: {
        tags: ['Admin - Website Enquiries'],
        summary: 'List Website Enquiries',
        description: 'Paginated, searchable list of property enquiries with status filtering. Also returns inline aggregate stats for the dashboard.',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'search', in: 'query', description: 'Searches across fullName, email, mobileNo, propertyType, preferredLocation, estimatedBudgetBand, specificRequirements', schema: { type: 'string' } },
          { name: 'status', in: 'query', description: 'Filter by enquiry status. Use ALL to skip filter.', schema: { type: 'string', enum: ['ALL', 'NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] } },
          { name: 'propertyType', in: 'query', description: 'Filter by property type. Use ALL to skip filter.', schema: { type: 'string' } },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['createdAt', 'updatedAt', 'fullName', 'email', 'mobileNo', 'propertyType', 'preferredLocation', 'estimatedBudgetBand', 'status'] } },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
        ],
        responses: {
          '200': {
            description: 'Paginated enquiry list with inline stats.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    enquiries: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          fullName: { type: 'string' },
                          mobileNo: { type: 'string' },
                          email: { type: 'string' },
                          propertyType: { type: 'string' },
                          preferredLocation: { type: 'string' },
                          estimatedBudgetBand: { type: 'string' },
                          specificRequirements: { type: 'string', nullable: true },
                          status: { type: 'string', enum: ['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] },
                          notes: { type: 'string', nullable: true },
                          createdAt: { type: 'string', format: 'date-time' },
                          updatedAt: { type: 'string', format: 'date-time' },
                        },
                      },
                    },
                    stats: {
                      type: 'object',
                      properties: {
                        totalEnquiries: { type: 'integer' },
                        newToday: { type: 'integer' },
                        pendingCount: { type: 'integer' },
                        inProgressCount: { type: 'integer' },
                        resolvedCount: { type: 'integer' },
                      },
                    },
                    pagination: {
                      type: 'object',
                      properties: {
                        total: { type: 'integer' },
                        page: { type: 'integer' },
                        limit: { type: 'integer' },
                        totalPages: { type: 'integer' },
                        hasNextPage: { type: 'boolean' },
                        hasPrevPage: { type: 'boolean' },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': { description: 'CRM authentication required.' },
        },
      },
    },
    '/v1/admin/website-users/enquiries/{id}/status': {
      patch: {
        tags: ['Admin - Website Enquiries'],
        summary: 'Update Enquiry Status & Notes',
        description: 'Updates the status and/or internal notes of a website property enquiry.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', enum: ['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], example: 'IN_PROGRESS' },
                  notes: { type: 'string', example: 'Called customer, scheduled site visit for next week.' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Enquiry updated successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Enquiry updated successfully' },
                    enquiry: { type: 'object' },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Enquiry not found.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    error: { type: 'string', example: 'Website enquiry not found' },
                    code: { type: 'string', example: 'ENQUIRY_NOT_FOUND' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/v1/admin/website-users/enquiries/{id}': {
      delete: {
        tags: ['Admin - Website Enquiries'],
        summary: 'Delete Website Enquiry',
        description: 'Permanently deletes a website property enquiry by its ID.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Enquiry deleted successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Enquiry deleted successfully' },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Enquiry not found.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    error: { type: 'string', example: 'Website enquiry not found' },
                    code: { type: 'string', example: 'ENQUIRY_NOT_FOUND' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/sign-in/social': {
      post: {
        tags: ['OAuth & Social Auth'],
        summary: 'Initiate Google OAuth Login',
        description: 'Returns the Google OAuth consent URL for frontend redirect.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['provider'],
                properties: {
                  provider: { type: 'string', example: 'google' },
                  callbackURL: { type: 'string', example: 'http://localhost:3000/dashboard' },
                  errorCallbackURL: { type: 'string', example: 'http://localhost:3000/login' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Google URL returned.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    url: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/callback/google': {
      get: {
        tags: ['OAuth & Social Auth'],
        summary: 'Google OAuth Callback (Redirect Handler)',
        description: 'Exchanges code with Google, upserts user, sets better-auth.session_token cookie, redirects to callbackURL.',
        parameters: [
          { name: 'code', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'state', in: 'query', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '302': { description: 'Redirect to frontend callback URL.' },
        },
      },
    },
    '/api/auth/get-session': {
      get: {
        tags: ['OAuth & Social Auth'],
        summary: 'Get Current Session & User (Better Auth / Me)',
        description: 'Hydrates user and session from better-auth.session_token cookie.',
        responses: {
          '200': {
            description: 'User and Session object or null.',
          },
        },
      },
    },
    '/api/auth/sign-out': {
      post: {
        tags: ['OAuth & Social Auth'],
        summary: 'Logout OAuth / Better Auth Session',
        description: 'Invalidates session and clears better-auth.session_token cookie.',
        responses: {
          '200': {
            description: 'Logged out successfully.',
          },
        },
      },
    },
  },
}
