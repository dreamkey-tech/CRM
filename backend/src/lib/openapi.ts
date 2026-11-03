/**
 * OpenAPI 3.0.0 Specification for DreamKey CRM Backend API
 */
const directoryIdParameter = { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }
const ownerRequestProperties = {
  name: { type: 'string', minLength: 2, maxLength: 120 },
  phone: { type: 'string', description: 'Required Indian mobile number.' },
  email: { type: 'string', format: 'email', nullable: true },
  whatsappNumber: { type: 'string', nullable: true },
  address: { type: 'string', maxLength: 500, nullable: true },
  primaryContactPartnerId: { type: 'string', format: 'uuid', nullable: true, description: 'Defaults to the signed-in user when omitted. Null explicitly leaves it unassigned.' },
  notes: { type: 'string', maxLength: 2000, nullable: true },
  status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
}
const ownerUpdateOperation = {
  tags: ['Owners'], summary: 'Update owner fields',
  description: 'Only supplied fields change. The authenticated creator is immutable.',
  parameters: [directoryIdParameter],
  requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: ownerRequestProperties } } } },
  responses: { '200': { description: 'Owner updated.' }, '400': { description: 'Field validation failed.' }, '401': { description: 'Sign-in required.' }, '404': { description: 'Owner not found.' } },
}
const linkedPropertiesOperation = (tag: string) => ({
  tags: [tag], summary: 'List linked published properties',
  description: 'Relationships update automatically when a listing is linked or reassigned. Drafts are excluded; archived listings remain accessible.',
  parameters: [directoryIdParameter, { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } }, { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 } }],
  responses: { '200': { description: 'Properties with thumbnails and pagination.' }, '401': { description: 'Sign-in required.' }, '404': { description: 'Directory record not found.' } },
})

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
      url: 'https://backend.dreamkey-crm.workers.dev',
      description: 'Production Cloudflare Worker',
    },
    {
      url: 'http://localhost:8787',
      description: 'Local Development Server',
    },
    {
      url: '/',
      description: 'Current Origin',
    },
  ],
  tags: [
    { name: 'Auth', description: 'Authentication & Session operations' },
    { name: 'Website User Auth', description: 'Public Website Customer Authentication (Separate access_token session)' },
    { name: 'Admin - Website Users', description: 'CRM Website User Management, Analytics & Returning Visitor Tracking' },
    { name: 'Admin - Website Enquiries', description: 'CRM Website Property Enquiry Management' },
    { name: 'Admin - Roles & Permissions', description: 'Role-Based Access Control (RBAC) management' },
    { name: 'Properties', description: 'Property Listings, Drafts, Media Storage (Cloudflare R2), Advanced Filtering & Audit History' },
    { name: 'Property Media & R2 Storage', description: 'Cloudflare R2 Presigned Uploads, Attach & Reorder' },
    { name: 'Property Filter Presets', description: 'Saved search and filter preset management' },
    { name: 'Owners', description: 'Authenticated owner directory, preferences, primary partners and linked listings' },
    { name: 'Brokers', description: 'CRM Broker Directory Management (CRUD, Search, Filtering)' },
    { name: 'Leads', description: 'CRM Lead management' },
    { name: 'OAuth & Social Auth', description: 'Google OAuth / Better Auth login flow' },
    { name: 'Website Enquiries', description: 'Public property enquiry submission endpoints' },
    { name: 'Website Properties', description: 'Public property listing, customer click tracking, and authenticated safe property details for the DreamKey website' },
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
        summary: 'Website User Login (Step 1: Credentials -> Send 4-Digit OTP)',
        description: 'Validates email and password, generates a 4-digit OTP valid for 5 minutes, and sends it to the user email from info@dreamkeykol.com.',
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
            description: 'OTP sent to email. Valid for 5 minutes.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    requiresOtp: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'A 4-digit verification code has been sent to your email. Valid for 5 minutes.' },
                    email: { type: 'string', example: 'john@example.com' },
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
          '403': {
            description: 'Account deactivated.',
          },
        },
      },
    },
    '/v1/user/auth/verify-login-otp': {
      post: {
        tags: ['Website User Auth'],
        summary: 'Verify Login OTP (Step 2: Match OTP -> Mark Email Verified -> Login)',
        description: 'Verifies the 4-digit OTP (valid for 5 minutes). On success, marks emailVerified=true, tracks login stats, creates session and sets HttpOnly cookies.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'otp'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'john@example.com' },
                  otp: { type: 'string', minLength: 4, maxLength: 4, example: '4829' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful. Email verified.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Login successful. Email verified.' },
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        email: { type: 'string' },
                        emailVerified: { type: 'boolean', example: true },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Invalid or expired OTP.',
          },
        },
      },
    },
    '/v1/user/auth/resend-otp': {
      post: {
        tags: ['Website User Auth'],
        summary: 'Resend 4-Digit OTP',
        description: 'Generates and dispatches a fresh 4-digit OTP (valid for 5 minutes) from info@dreamkeykol.com for either LOGIN or PASSWORD_RESET.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'john@example.com' },
                  purpose: { type: 'string', enum: ['LOGIN', 'PASSWORD_RESET'], default: 'LOGIN' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'New OTP dispatched.',
          },
        },
      },
    },
    '/v1/user/auth/forgot-password': {
      post: {
        tags: ['Website User Auth'],
        summary: 'Forgot Password (Step 1: Request 4-Digit Reset OTP)',
        description: 'Dispatches a 4-digit password reset OTP (valid for 5 minutes) to the user email from info@dreamkeykol.com.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'john@example.com' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Reset OTP sent to email.',
          },
          '404': {
            description: 'No account found with this email.',
          },
        },
      },
    },
    '/v1/user/auth/verify-reset-otp': {
      post: {
        tags: ['Website User Auth'],
        summary: 'Verify Reset Password OTP (Step 2: Pre-check OTP)',
        description: 'Validates if the provided 4-digit password reset OTP is valid and within the 5-minute window.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'otp'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'john@example.com' },
                  otp: { type: 'string', minLength: 4, maxLength: 4, example: '4829' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'OTP verified successfully.',
          },
          '400': {
            description: 'Invalid or expired OTP.',
          },
        },
      },
    },
    '/v1/user/auth/reset-password': {
      post: {
        tags: ['Website User Auth'],
        summary: 'Reset Password (Step 3: OTP + New Password -> Complete)',
        description: 'Validates 4-digit OTP, updates user passwordHash, marks emailVerified=true, revokes older sessions, and confirms reset.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'otp', 'newPassword'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'john@example.com' },
                  otp: { type: 'string', minLength: 4, maxLength: 4, example: '4829' },
                  newPassword: { type: 'string', minLength: 6, example: 'newPassword123' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Password reset successfully.',
          },
          '400': {
            description: 'Invalid or expired OTP or invalid password.',
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
          { name: 'hasClickedProperty', in: 'query', description: 'Filter users who have clicked on properties (true | false | all)', schema: { type: 'string', enum: ['true', 'false', 'all'] } },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['createdAt', 'updatedAt', 'lastLoginAt', 'lastActiveAt', 'loginCount', 'name', 'email', 'authProvider', 'emailVerified'] } },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
        ],
        responses: {
          '200': { description: 'Paginated website users list with totalPropertyClicks and hasClickedProperty indicators.' },
        },
      },
    },
    '/v1/admin/website-users/{id}': {
      get: {
        tags: ['Admin - Website Users'],
        summary: 'Get Website User Details & Property Click History',
        description: 'Full profile, recent session history, and full list of properties clicked by this user with exact timestamps.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'User profile, session history, and propertyClicks history with exact dates, property names, and pricing.' },
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
    '/v1/brokers/stats': {
      get: {
        tags: ['Brokers'],
        summary: 'Get Broker Statistics & KPI Metrics',
        description: 'Returns real-time counts of total, active, inactive, blocked, new brokers, and top areas of operation.',
        responses: {
          '200': {
            description: 'Broker statistics payload.',
          },
        },
      },
    },
    '/v1/owners': {
      get: {
        tags: ['Owners'], summary: 'Search and filter the owner directory',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'ALL'] } },
          { name: 'primaryContactPartnerId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['name', 'createdAt', 'updatedAt', 'status'] } },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
        ], responses: { '200': { description: 'Owner directory with linked property counts and pagination.' }, '400': { description: 'Invalid query.' }, '401': { description: 'Sign-in required.' } },
      },
      post: {
        tags: ['Owners'], summary: 'Create owner', description: 'Creator always comes from the authenticated CRM user; createdById in request data is ignored.',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name', 'phone'], properties: ownerRequestProperties } } } },
        responses: { '201': { description: 'Owner created with creator and primary partner details.' }, '400': { description: 'Invalid fields or inactive contact partner.' }, '401': { description: 'Sign-in required.' } },
      },
    },
    '/v1/owners/stats': { get: { tags: ['Owners'], summary: 'Owner totals by status and current primary partner', responses: { '200': { description: 'Owner statistics.' }, '401': { description: 'Sign-in required.' } } } },
    '/v1/owners/partners': { get: { tags: ['Owners'], summary: 'List active CRM primary contact partners', responses: { '200': { description: 'Partner IDs, names and emails.' }, '401': { description: 'Sign-in required.' } } } },
    '/v1/brokers/partners': { get: { tags: ['Brokers'], summary: 'List active CRM primary contact partners', responses: { '200': { description: 'Partner IDs, names and emails.' }, '401': { description: 'Sign-in required.' } } } },
    '/v1/owners/{id}': {
      get: { tags: ['Owners'], summary: 'Get owner profile', parameters: [directoryIdParameter], responses: { '200': { description: 'Owner details, creator, partner and property count.' }, '401': { description: 'Sign-in required.' }, '404': { description: 'Owner not found.' } } },
      put: ownerUpdateOperation, patch: ownerUpdateOperation,
      delete: { tags: ['Owners'], summary: 'Delete owner and clear its listing links', description: 'Properties and their media are preserved.', parameters: [directoryIdParameter], responses: { '200': { description: 'Owner removed.' }, '401': { description: 'Sign-in required.' }, '404': { description: 'Owner not found.' } } },
    },
    '/v1/owners/{id}/properties': { get: linkedPropertiesOperation('Owners') },
    '/v1/brokers/{id}/properties': { get: linkedPropertiesOperation('Brokers') },
    '/v1/brokers': {
      get: {
        tags: ['Brokers'],
        summary: 'List Brokers with Pagination & Filters',
        description: 'Fetch list of brokers supporting search, status filter, partner filter, area filter, sorting, and pagination.',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'BLOCKED', 'ALL'] } },
          { name: 'primaryContactPartnerId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'areaOfOperation', in: 'query', schema: { type: 'string' } },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['name', 'createdAt', 'updatedAt', 'minDealValue', 'status'], default: 'createdAt' } },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
        ],
        responses: {
          '200': {
            description: 'Paginated list of brokers.',
          },
        },
      },
      post: {
        tags: ['Brokers'],
        summary: 'Create Broker',
        description: 'Register a new broker in the directory with area expertise and minimum deal value.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', minLength: 2, example: 'Rajesh Sharma' },
                  phone: { type: 'string', nullable: true, example: '+91 9876543210' },
                  email: { type: 'string', format: 'email', nullable: true, example: 'rajesh@brokerage.com' },
                  whatsappNumber: { type: 'string', nullable: true, example: '+91 9876543210' },
                  areaOfOperation: { type: 'string', nullable: true, example: 'Bandra West & Khar, Mumbai' },
                  primaryContactPartnerId: { type: 'string', format: 'uuid', nullable: true },
                  minDealValue: { type: 'number', nullable: true, example: 5000000 },
                  societyExpertise: { type: 'array', items: { type: 'string' }, example: ['Parijat Apartments', 'Silver Beach'] },
                  status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'BLOCKED'], default: 'ACTIVE' },
                  notes: { type: 'string', nullable: true, example: 'Key broker for luxury sea-facing properties.' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Broker created successfully.' },
          '400': { description: 'Validation error or invalid partner.' },
        },
      },
    },
    '/v1/brokers/{id}': {
      get: {
        tags: ['Brokers'],
        summary: 'Get Broker Details',
        description: 'Fetch full profile and primary partner information for a broker.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Broker details retrieved.' },
          '404': { description: 'Broker not found.' },
        },
      },
      put: {
        tags: ['Brokers'],
        summary: 'Update Broker',
        description: 'Update broker information, contact details, status, or partner relationship.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  phone: { type: 'string', nullable: true },
                  email: { type: 'string', format: 'email', nullable: true },
                  whatsappNumber: { type: 'string', nullable: true },
                  areaOfOperation: { type: 'string', nullable: true },
                  primaryContactPartnerId: { type: 'string', format: 'uuid', nullable: true },
                  minDealValue: { type: 'number', nullable: true },
                  societyExpertise: { type: 'array', items: { type: 'string' } },
                  status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'BLOCKED'] },
                  notes: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Broker updated successfully.' },
          '404': { description: 'Broker not found.' },
        },
      },
      delete: {
        tags: ['Brokers'],
        summary: 'Delete Broker',
        description: 'Remove a broker from the CRM directory.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Broker deleted successfully.' },
          '404': { description: 'Broker not found.' },
        },
      },
    },

    // ==========================================
    // PROPERTIES & MEDIA ENDPOINTS
    // ==========================================
    '/v1/properties/config/media-limits': {
      get: {
        tags: ['Property Media & R2 Storage'],
        summary: 'Get Media Upload Limits & Rules',
        description: 'Returns dynamic configuration limits (max count, max MB, allowed MIME types for photographs, videos, floor plans, brochures).',
        responses: {
          '200': {
            description: 'Property media upload configuration.',
          },
        },
      },
    },
    '/v1/properties/media/upload-urls': {
      post: {
        tags: ['Property Media & R2 Storage'],
        summary: 'Generate Presigned R2 Upload URLs',
        description: 'Generates short-lived (5 min) S3 Presigned PUT URLs for direct browser-to-Cloudflare R2 streaming. Validates file size and MIME types.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['files'],
                properties: {
                  propertyId: { type: 'string', format: 'uuid', description: 'Optional ID of existing property or draft' },
                  files: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['filename', 'contentType', 'sizeBytes'],
                      properties: {
                        filename: { type: 'string', example: 'living-room.jpg' },
                        contentType: { type: 'string', example: 'image/jpeg' },
                        sizeBytes: { type: 'integer', example: 2500000 },
                        category: { type: 'string', enum: ['PHOTOGRAPH', 'VIDEO', 'FLOOR_PLAN', 'BROCHURE', 'OTHER'], default: 'PHOTOGRAPH' },
                        customKey: { type: 'string', example: 'brochure' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Presigned upload URLs generated.',
          },
          '400': { description: 'Validation error (file too large or unsupported MIME type).' },
        },
      },
    },
    '/v1/properties/draft': {
      post: {
        tags: ['Properties'],
        summary: 'Create Draft Property',
        description: 'Creates a lightweight draft property for instant background uploads.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  societyBuildingName: { type: 'string', example: 'Untitled Draft Property' },
                  locationArea: { type: 'string', example: 'Bandra West' },
                  pincode: { type: 'string', example: '400050' },
                  carpetAreaSqFt: { type: 'number', example: 850 },
                  askingPrice: { type: 'number', example: 25000000 },
                  propertyType: { type: 'string', enum: ['FLAT', 'LAND', 'WAREHOUSE', 'COMMERCIAL', 'OTHER'], default: 'FLAT' },
                  pricingType: { type: 'string', enum: ['SALE', 'RENT'], default: 'SALE' },
                  availabilityStatus: { type: 'string', enum: ['AVAILABLE', 'UNDER_NEGOTIATION', 'TOKEN_PAID', 'DEAL_DONE', 'RENTED_OUT', 'SOLD', 'UPCOMING'], default: 'AVAILABLE' },
                  accessType: { type: 'string', enum: ['DIRECT', 'BROKER'], default: 'DIRECT' },
                  ownerId: { type: 'string', format: 'uuid', nullable: true, description: 'Required when publishing a DIRECT listing. Mutually exclusive with brokerId.' },
                  brokerId: { type: 'string', format: 'uuid', nullable: true },
                  notes: { type: 'string', nullable: true },
                  media: { type: 'array', items: { type: 'object' } },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Draft property created.' },
        },
      },
    },
    '/v1/properties': {
      get: {
        tags: ['Properties'],
        summary: 'List Properties with Advanced Filters & Full-Text Search',
        description: 'Advanced property query supporting FR-SF-01 to FR-SF-08: property types, budget range, location, bedrooms (Studio, 1BHK, 2BHK, 3BHK, 4BHK+), availability status, access type (Direct / Broker), source partner, and full-text search.',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'search', in: 'query', description: 'Full-text search across society name, location, remarks, builder, RERA', schema: { type: 'string' } },
          { name: 'propertyType', in: 'query', description: 'Filter by property type (e.g. FLAT or FLAT,COMMERCIAL,OTHER)', schema: { type: 'string' } },
          { name: 'pricingType', in: 'query', description: 'SALE or RENT', schema: { type: 'string' } },
          { name: 'minPrice', in: 'query', description: 'Minimum price in INR', schema: { type: 'number' } },
          { name: 'maxPrice', in: 'query', description: 'Maximum price in INR', schema: { type: 'number' } },
          { name: 'locationArea', in: 'query', description: 'Area/locality name (supports comma-separated)', schema: { type: 'string' } },
          { name: 'pincode', in: 'query', schema: { type: 'string' } },
          { name: 'bedroomTypes', in: 'query', description: 'STUDIO, 1BHK, 2BHK, 3BHK, 4BHK_PLUS (comma-separated)', schema: { type: 'string' } },
          { name: 'bedrooms', in: 'query', description: '0, 1, 2, 3, 4+ (comma-separated)', schema: { type: 'string' } },
          { name: 'availabilityStatus', in: 'query', description: 'AVAILABLE, UNDER_NEGOTIATION, TOKEN_PAID, etc.', schema: { type: 'string' } },
          { name: 'accessType', in: 'query', description: 'DIRECT or BROKER (or +1)', schema: { type: 'string' } },
          { name: 'sourcePartnerId', in: 'query', schema: { type: 'string' } },
          { name: 'ownerId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'brokerId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'isDraft', in: 'query', schema: { type: 'string', enum: ['true', 'false', 'all'] } },
          { name: 'isArchived', in: 'query', schema: { type: 'string', enum: ['true', 'false', 'all'] } },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['createdAt', 'updatedAt', 'askingPrice', 'carpetAreaSqFt', 'societyBuildingName'] } },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
        ],
        responses: {
          '200': { description: 'Paginated list of filtered properties.' },
        },
      },
      post: {
        tags: ['Properties'],
        summary: 'Create Full Property Listing',
        description: 'Creates a complete property listing with media, mandatory fields, society insights, and partner attribution.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['societyBuildingName', 'locationArea', 'pincode', 'carpetAreaSqFt', 'askingPrice'],
                properties: {
                  propertyType: { type: 'string', enum: ['FLAT', 'LAND', 'WAREHOUSE', 'COMMERCIAL', 'OTHER'], default: 'FLAT' },
                  societyBuildingName: { type: 'string', example: 'Oberoi Sky City' },
                  locationArea: { type: 'string', example: 'Borivali East' },
                  pincode: { type: 'string', example: '400066' },
                  city: { type: 'string', default: 'Mumbai' },
                  floorNumber: { type: 'integer', example: 18 },
                  totalFloors: { type: 'integer', example: 45 },
                  bedrooms: { type: 'integer', example: 3 },
                  bathrooms: { type: 'integer', example: 3 },
                  balconies: { type: 'integer', example: 2 },
                  carpetAreaSqFt: { type: 'number', example: 1250 },
                  superBuiltUpAreaSqFt: { type: 'number', example: 1650 },
                  pricingType: { type: 'string', enum: ['SALE', 'RENT'], default: 'SALE' },
                  askingPrice: { type: 'number', example: 34000000 },
                  availabilityStatus: { type: 'string', enum: ['AVAILABLE', 'UNDER_NEGOTIATION', 'TOKEN_PAID', 'DEAL_DONE', 'RENTED_OUT', 'SOLD', 'UPCOMING'], default: 'AVAILABLE' },
                  availabilityDate: { type: 'string', format: 'date-time', nullable: true },
                  accessType: { type: 'string', enum: ['DIRECT', 'BROKER'], default: 'DIRECT' },
                  ownerId: { type: 'string', format: 'uuid', nullable: true, description: 'Required when publishing a DIRECT listing. Mutually exclusive with brokerId.' },
                  brokerId: { type: 'string', format: 'uuid', nullable: true },
                  builderName: { type: 'string', example: 'Oberoi Realty' },
                  yearOfConstruction: { type: 'integer', example: 2023 },
                  totalUnits: { type: 'integer', example: 600 },
                  amenities: { type: 'array', items: { type: 'string' }, example: ['parking', 'gym', 'lift', 'security', 'power_backup', 'swimming_pool'] },
                  reraNumber: { type: 'string', example: 'P51800003582' },
                  notes: { type: 'string', nullable: true, example: 'High floor, sea facing, ready for immediate possession.' },
                  media: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['key', 'url', 'mimeType', 'sizeBytes'],
                      properties: {
                        category: { type: 'string', enum: ['PHOTOGRAPH', 'VIDEO', 'FLOOR_PLAN', 'BROCHURE', 'OTHER'] },
                        title: { type: 'string', nullable: true },
                        key: { type: 'string' },
                        url: { type: 'string' },
                        thumbnailUrl: { type: 'string', nullable: true },
                        mimeType: { type: 'string' },
                        sizeBytes: { type: 'integer' },
                        order: { type: 'integer' },
                        isCover: { type: 'boolean' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Property created successfully.' },
          '400': { description: 'Validation error.' },
        },
      },
    },
    '/v1/properties/{id}': {
      get: {
        tags: ['Properties'],
        summary: 'Get Property Details',
        description: 'Fetch complete property profile with media array, broker info, source partner info, and audit history.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Property details retrieved.' },
          '404': { description: 'Property not found.' },
        },
      },
      put: {
        tags: ['Properties'],
        summary: 'Update Property',
        description: 'Update property details and automatically generate audit log entry.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' },
            },
          },
        },
        responses: {
          '200': { description: 'Property updated successfully.' },
          '404': { description: 'Property not found.' },
        },
      },
      delete: {
        tags: ['Properties'],
        summary: 'Delete Property & Purge R2 Media',
        description: 'Permanently removes the property from PostgreSQL and batch-purges all associated media files from Cloudflare R2.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Property and all R2 files permanently deleted.' },
          '404': { description: 'Property not found.' },
        },
      },
    },
    '/v1/properties/{id}/status': {
      patch: {
        tags: ['Properties'],
        summary: 'Update Property Availability Status',
        description: 'Quick status changer with status change audit log and optional remarks note.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['availabilityStatus'],
                properties: {
                  availabilityStatus: { type: 'string', enum: ['AVAILABLE', 'UNDER_NEGOTIATION', 'TOKEN_PAID', 'DEAL_DONE', 'RENTED_OUT', 'SOLD', 'UPCOMING'] },
                  availabilityDate: { type: 'string', format: 'date-time', nullable: true },
                  note: { type: 'string', nullable: true, example: 'Token amount received from buyer.' },
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
    '/v1/properties/{id}/website-settings': {
      patch: {
        tags: ['Properties'],
        summary: 'Update Website Visibility & Best Property Showcase',
        description: 'Updates showInWebsite and/or isBestProperty for a property. Automatically sets showInWebsite=true when isBestProperty is enabled, auto-resets isBestProperty=false if unpublished, and enforces a strict maximum quota of 3 best properties.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  showInWebsite: { type: 'boolean', description: 'Whether the property is visible on the public website listing.' },
                  isBestProperty: { type: 'boolean', description: 'Whether the property is featured in Best Properties (max 3).' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Website settings updated successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    property: { type: 'object' },
                    bestPropertiesCount: { type: 'integer', example: 1 },
                  },
                },
              },
            },
          },
          '400': { description: 'Validation failed or quota exceeded (BEST_PROPERTIES_LIMIT_EXCEEDED).' },
          '401': { description: 'Authentication required.' },
          '403': { description: 'Permission properties:update required.' },
          '404': { description: 'Property not found.' },
        },
      },
    },
    '/v1/properties/{id}/media': {
      post: {
        tags: ['Property Media & R2 Storage'],
        summary: 'Attach Uploaded Media to Property',
        description: 'Background upload hook: attaches completed R2 uploads to an existing property/draft.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['media'],
                properties: {
                  media: { type: 'array', items: { type: 'object' } },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Media attached successfully.' },
        },
      },
    },
    '/v1/properties/{id}/media/reorder': {
      put: {
        tags: ['Property Media & R2 Storage'],
        summary: 'Reorder Media & Set Cover Image',
        description: 'Updates sorting order and primary cover photo flag for property media.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['mediaOrders'],
                properties: {
                  mediaOrders: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['id', 'order'],
                      properties: {
                        id: { type: 'string', format: 'uuid' },
                        order: { type: 'integer' },
                        isCover: { type: 'boolean' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Media order updated.' },
        },
      },
    },
    '/v1/properties/{id}/media/{mediaId}': {
      delete: {
        tags: ['Property Media & R2 Storage'],
        summary: 'Delete Single Media File',
        description: 'Deletes a media item from the database and purges the object from Cloudflare R2.',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'mediaId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Media file deleted from database and Cloudflare R2.' },
          '404': { description: 'Media not found.' },
        },
      },
    },
    '/v1/properties/{id}/archive': {
      patch: {
        tags: ['Properties'],
        summary: 'Archive / Restore Property',
        description: 'Toggles archive state without deleting listing history.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Property archive state toggled.' },
        },
      },
    },
    '/v1/properties/filters/presets': {
      get: {
        tags: ['Property Filter Presets'],
        summary: 'List Saved Filter Presets',
        description: 'Returns all search filter presets saved by the user.',
        responses: {
          '200': { description: 'List of saved filter presets.' },
        },
      },
      post: {
        tags: ['Property Filter Presets'],
        summary: 'Save Filter Preset',
        description: 'Saves current search and filter criteria as a reusable preset.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'filters'],
                properties: {
                  name: { type: 'string', example: 'Bandra 2BHK under 3Cr' },
                  filters: { type: 'object' },
                  isDefault: { type: 'boolean', default: false },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Filter preset saved.' },
        },
      },
    },
    '/v1/properties/filters/presets/{presetId}': {
      delete: {
        tags: ['Property Filter Presets'],
        summary: 'Delete Filter Preset',
        parameters: [{ name: 'presetId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Filter preset deleted.' },
          '404': { description: 'Preset not found.' },
        },
      },
    },
    '/best-properties': {
      get: {
        tags: ['Website Properties'],
        summary: 'Public Best Properties Showcase',
        description: 'Returns up to 3 featured "Best Properties" where isBestProperty is true and showInWebsite is true. Excludes drafts, archived listings, and sensitive CRM fields. Format is identical to the public listing endpoint.',
        responses: {
          '200': {
            description: 'List of up to 3 best properties.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    properties: { type: 'array', items: { type: 'object' } },
                    total: { type: 'integer', example: 3 },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/v1/best-properties': {
      get: {
        tags: ['Website Properties'],
        summary: 'Public Best Properties Showcase (v1 alias)',
        description: 'Returns up to 3 featured "Best Properties" where isBestProperty is true and showInWebsite is true. Excludes drafts, archived listings, and sensitive CRM fields.',
        responses: {
          '200': {
            description: 'List of up to 3 best properties.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    properties: { type: 'array', items: { type: 'object' } },
                    total: { type: 'integer', example: 3 },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/v1/website/properties/list': {
      get: {
        tags: ['Website Properties'],
        summary: 'Public Website Property Listing',
        description: 'Returns all public properties where "showInWebsite" is true. Excludes drafts, archived listings, and sensitive internal CRM data. Returns public card fields with R2 cover image, amenities, and pricing.',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Page number' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 12, maximum: 50 }, description: 'Items per page' },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search society/building, location, or city' },
          { name: 'locationArea', in: 'query', schema: { type: 'string' }, description: 'Location or area name' },
          { name: 'city', in: 'query', schema: { type: 'string' }, description: 'City name' },
          { name: 'propertyType', in: 'query', schema: { type: 'string', enum: ['FLAT', 'LAND', 'WAREHOUSE', 'COMMERCIAL', 'OTHER'] } },
          { name: 'pricingType', in: 'query', schema: { type: 'string', enum: ['SALE', 'RENT'] } },
          { name: 'minPrice', in: 'query', schema: { type: 'number' }, description: 'Min asking price in INR' },
          { name: 'maxPrice', in: 'query', schema: { type: 'number' }, description: 'Max asking price in INR' },
          { name: 'bedrooms', in: 'query', schema: { type: 'string' }, description: 'e.g. "2", "3", "4", "4+"' },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['createdAt', 'askingPrice', 'carpetAreaSqFt', 'societyBuildingName'], default: 'createdAt' } },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
        ],
        responses: {
          '200': {
            description: 'Public property listing with cover images and pagination.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    properties: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', format: 'uuid' },
                          propertyType: { type: 'string', example: 'FLAT' },
                          societyBuildingName: { type: 'string', example: 'DreamKey Altura' },
                          locationArea: { type: 'string', example: 'New Town Action Area II' },
                          city: { type: 'string', example: 'Kolkata' },
                          carpetAreaSqFt: { type: 'number', example: 1850 },
                          superBuiltUpAreaSqFt: { type: 'number', example: 2750 },
                          askingPrice: { type: 'number', example: 18500000 },
                          pricingType: { type: 'string', example: 'SALE' },
                          bedrooms: { type: 'integer', example: 3 },
                          bathrooms: { type: 'integer', example: 3 },
                          amenities: { type: 'array', items: { type: 'string' }, example: ['Lake Facing', 'Sky Lounge'] },
                          availabilityStatus: { type: 'string', example: 'AVAILABLE' },
                          coverImage: { type: 'string', format: 'uri', example: 'https://pub-xxx.r2.dev/properties/123/cover.jpg' },
                          previewImages: { type: 'array', items: { type: 'string', format: 'uri' } },
                        },
                      },
                    },
                    pagination: {
                      type: 'object',
                      properties: {
                        total: { type: 'integer', example: 1 },
                        page: { type: 'integer', example: 1 },
                        limit: { type: 'integer', example: 12 },
                        totalPages: { type: 'integer', example: 1 },
                        hasNextPage: { type: 'boolean' },
                        hasPrevPage: { type: 'boolean' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/v1/website/properties/list/{id}/click': {
      post: {
        tags: ['Website Properties'],
        summary: 'Record Website User Property Click / Interest',
        description: 'Requires website customer authentication. Records that this logged-in user clicked on a specific property, including client IP, user agent, and timestamp.',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Property UUID' },
        ],
        responses: {
          '201': {
            description: 'Property click recorded successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Property click recorded successfully' },
                    data: {
                      type: 'object',
                      properties: {
                        clickId: { type: 'string', format: 'uuid' },
                        propertyId: { type: 'string', format: 'uuid' },
                        societyBuildingName: { type: 'string', example: 'DreamKey Altura' },
                        userId: { type: 'string', format: 'uuid' },
                        userEmail: { type: 'string', format: 'email' },
                        recordedAt: { type: 'string', format: 'date-time' },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': { description: 'Website login required (Session cookie or Bearer token).' },
          '404': { description: 'Property not found or not published on website.' },
        },
      },
    },
    '/v1/website/properties/list/{id}': {
      get: {
        tags: ['Website Properties'],
        summary: 'Get Authenticated Property Details (Sanitized)',
        description: 'Requires website customer authentication. Returns complete property specifications and public media (photos, floor plans). Strictly strips internal CRM notes, broker/owner personal details, and private PDFs.',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Property UUID' },
        ],
        responses: {
          '200': {
            description: 'Sanitized property details.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    property: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', format: 'uuid' },
                        propertyType: { type: 'string' },
                        societyBuildingName: { type: 'string' },
                        locationArea: { type: 'string' },
                        city: { type: 'string' },
                        pincode: { type: 'string' },
                        floorNumber: { type: 'integer', nullable: true },
                        totalFloors: { type: 'integer', nullable: true },
                        bedrooms: { type: 'integer', nullable: true },
                        bathrooms: { type: 'integer', nullable: true },
                        balconies: { type: 'integer', nullable: true },
                        carpetAreaSqFt: { type: 'number' },
                        superBuiltUpAreaSqFt: { type: 'number', nullable: true },
                        pricingType: { type: 'string' },
                        askingPrice: { type: 'number' },
                        availabilityStatus: { type: 'string' },
                        availabilityDate: { type: 'string', nullable: true },
                        builderName: { type: 'string', nullable: true },
                        yearOfConstruction: { type: 'integer', nullable: true },
                        totalUnits: { type: 'integer', nullable: true },
                        amenities: { type: 'array', items: { type: 'string' } },
                        reraNumber: { type: 'string', nullable: true },
                        coverImage: { type: 'string', nullable: true },
                        media: { type: 'array', items: { type: 'object' } },
                        createdAt: { type: 'string', format: 'date-time' },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': { description: 'Website login required (Session cookie or Bearer token).' },
          '404': { description: 'Property not found or not published on website.' },
        },
      },
    },
  },
}
