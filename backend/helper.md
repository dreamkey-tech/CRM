# Frontend Integration Guide (DreamKey Website & CRM Auth)

This document provides complete instructions, architecture flows, API contracts, and copy-pasteable Next.js TypeScript code examples for integrating both **Google OAuth** and **Email/Password Authentication** with the backend.

---

## 🌐 Environments & Documentation

* **Production Backend URL**: `https://backend.dreamkey-crm.workers.dev`
* **Local Backend URL**: `http://localhost:8787`
* **Interactive Swagger UI**: [https://backend.dreamkey-crm.workers.dev/docs](https://backend.dreamkey-crm.workers.dev/docs)
* **OpenAPI JSON Spec**: `https://backend.dreamkey-crm.workers.dev/openapi.json`

---

## ⚙️ Global Frontend Rules (Critical)

1. **HttpOnly Cookies**: All sessions are stored in secure HttpOnly cookies (`access_token` and `better-auth.session_token`). 
2. **`withCredentials: true`**: Every request made via Axios or Fetch **MUST** include credentials:
   * **Axios**: `withCredentials: true`
   * **Fetch API**: `credentials: 'include'`
3. **401 Unauthorized Response**: If an endpoint returns `401 Unauthorized`, the session is expired or missing. The frontend must clear local user state and redirect to `/login`.

---

## 📋 Table of Endpoints

### A. Google OAuth (Better Auth Compatible)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/sign-in/social` | Initiates Google login; returns the Google consent URL. |
| `GET` | `/api/auth/callback/google` | *(Internal)* Google redirects here; backend sets cookie and redirects to frontend `callbackURL`. |
| `GET` | `/api/auth/get-session` | Returns current user & session object (or `null` if unauthenticated). |
| `POST` | `/api/auth/sign-out` | Logs out the user and clears the session cookie. |

### B. Website User Email / Password Authentication (4-Digit OTP Flow)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/v1/user/auth/register` | Creates account, sets cookie, returns `{ user: { id, name, email, emailVerified } }`. |
| `POST` | `/v1/user/auth/login` | Step 1: Validates credentials, generates 4-digit OTP valid for 5 min, sent from `info@dreamkeykol.com`. |
| `POST` | `/v1/user/auth/verify-login-otp` | Step 2: Verifies 4-digit OTP, sets `emailVerified=true`, sets HttpOnly session cookies, logs in. |
| `POST` | `/v1/user/auth/resend-otp` | Resends 4-digit OTP for either `LOGIN` or `PASSWORD_RESET` (valid for 5 mins). |
| `POST` | `/v1/user/auth/forgot-password` | Step 1: Dispatches 4-digit password reset OTP to email from `info@dreamkeykol.com` (valid for 5 mins). |
| `POST` | `/v1/user/auth/verify-reset-otp` | Step 2: (Optional) Pre-checks if the 4-digit reset OTP is valid. |
| `POST` | `/v1/user/auth/reset-password` | Step 3: Submits email + 4-digit OTP + new password. Updates password, invalidates old sessions. |
| `GET` | `/v1/user/auth/me` | Hydrates current user profile (including `emailVerified`) from cookie. |
| `POST` | `/v1/user/auth/refresh` | Extends/rotates the session cookie. |
| `POST` | `/v1/user/auth/logout` | Clears cookie and terminates session. |

### C. CRM Dashboard Analytics
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/v1/admin/website-users/stats` | Returns total users, returning users, active users (7d/30d), and registration trends. |
| `GET` | `/v1/admin/website-users` | Paginated list of website users with search & filter. |

### D. Website Property Enquiries
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/v1/website/enquiry` | Public endpoint to submit a property enquiry. |
| `GET` | `/v1/admin/website-users/enquiries/stats` | Summary stats & counts for enquiries. |
| `GET` | `/v1/admin/website-users/enquiries` | Paginated list of enquiries with status & property filters. |
| `PATCH` | `/v1/admin/website-users/enquiries/:id/status` | Update enquiry status (`NEW`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`) & notes. |
| `DELETE` | `/v1/admin/website-users/enquiries/:id` | Delete an enquiry. |

---

## 🚀 Authentication Flow Details

### Flow 1: Google OAuth Login

```
1. User clicks "Sign in with Google" button.
2. Frontend sends: POST /api/auth/sign-in/social
   Body: {
     "provider": "google",
     "callbackURL": "http://localhost:3000/dashboard",
     "errorCallbackURL": "http://localhost:3000/login"
   }
3. Backend returns: { "url": "https://accounts.google.com/o/oauth2/v2/auth?..." }
4. Frontend redirects browser: window.location.href = data.url
5. User logs in on Google screen.
6. Google redirects to Backend: GET /api/auth/callback/google?code=...
7. Backend sets HttpOnly cookie and redirects browser to http://localhost:3000/dashboard.
8. Dashboard page loads and calls: GET /api/auth/get-session to get the user data.
```

---

### Flow 2: Website User 4-Digit OTP Login Flow

```
1. User enters email & password.
2. Frontend sends: POST /v1/user/auth/login
   Body: { "email": "user@example.com", "password": "securepassword123" }
3. Backend validates credentials, generates a 4-digit numeric OTP (e.g. "4829") valid for 5 minutes.
4. Backend dispatches OTP email from: info@dreamkeykol.com
   Response (200 OK):
   {
     "success": true,
     "requiresOtp": true,
     "message": "A 4-digit verification code has been sent to your email. Valid for 5 minutes.",
     "email": "user@example.com"
   }
5. Frontend transitions to the OTP entry screen / modal (showing 5-minute timer countdown).
6. User enters the 4-digit code.
7. Frontend sends: POST /v1/user/auth/verify-login-otp
   Body: { "email": "user@example.com", "otp": "4829" }
8. Backend checks OTP:
   - Validates OTP matches and has not expired (< 5 mins).
   - Marks emailVerified = true in database.
   - Sets secure HttpOnly session cookies (access_token & better-auth.session_token).
   - Returns:
     {
       "success": true,
       "message": "Login successful. Email verified.",
       "user": {
         "id": "uuid-here",
         "name": "Jane Doe",
         "email": "user@example.com",
         "emailVerified": true
       }
     }
9. User is now fully logged in and verified.
```

#### Resending OTP: `POST /v1/user/auth/resend-otp`
If the 5 minutes expire or the user didn't receive the email:
* **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "purpose": "LOGIN"
  }
  ```
* **Success (200 OK)**:
  ```json
  {
    "success": true,
    "message": "A new 4-digit verification code has been sent to your email. Valid for 5 minutes.",
    "email": "user@example.com"
  }
  ```

---

### Flow 3: Website User Password Reset Flow (4-Digit OTP)

```
1. User clicks "Forgot Password?" on login screen.
2. User enters their email address.
3. Frontend sends: POST /v1/user/auth/forgot-password
   Body: { "email": "user@example.com" }
4. Backend finds user, generates 4-digit OTP valid for 5 minutes, and sends email from info@dreamkeykol.com.
   Response (200 OK):
   {
     "success": true,
     "message": "A 4-digit password reset code has been sent to your email. Valid for 5 minutes.",
     "email": "user@example.com"
   }
5. Frontend displays OTP & New Password form.
   (Optional Step: call POST /v1/user/auth/verify-reset-otp { email, otp } to pre-check code)
6. User enters 4-digit OTP and new password (min 6 characters).
7. Frontend sends: POST /v1/user/auth/reset-password
   Body: {
     "email": "user@example.com",
     "otp": "4829",
     "newPassword": "newSecurePassword123"
   }
8. Backend verifies OTP, updates passwordHash, marks emailVerified=true, revokes older sessions.
   Response (200 OK):
   {
     "success": true,
     "message": "Password reset successfully. You can now login with your new password."
   }
9. Frontend redirects user to Login screen with success toast notification.
```

---

#### 4. Hydrate User (On Page Refresh): `GET /v1/user/auth/me`
* Call this inside your root `AuthProvider` or layout `useEffect`.
* **Success (200 OK)**:
  ```json
  {
    "user": {
      "id": "uuid-here",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "emailVerified": true
    }
  }
  ```
* **Failure (401 Unauthorized)**: Clear user state in store/context.

#### 5. Logout: `POST /v1/user/auth/logout`
* Clears cookie and terminates session.
* Redirect user to `/login`.

---

## 💻 Next.js Implementation Code (Copy-Paste Ready)

### 1. Axios API Client (`lib/api.ts`)

```typescript
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend.dreamkey-crm.workers.dev';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // CRITICAL: Sends and receives HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatic 401 Interceptor: Auto-logout on expired session
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

---

### 2. Authentication Context (`context/AuthContext.tsx`)

```tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface User {
  id: string;
  name: string | null;
  email: string;
  emailVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check current session on initial page load / refresh
  const refreshUser = async () => {
    try {
      // 1. Try Better Auth / OAuth session endpoint first
      const oauthRes = await api.get('/api/auth/get-session');
      if (oauthRes.data?.user) {
        setUser(oauthRes.data.user);
        return;
      }

      // 2. Fallback to standard email/password session endpoint
      const meRes = await api.get('/v1/user/auth/me');
      if (meRes.data?.user) {
        setUser(meRes.data.user);
        return;
      }

      setUser(null);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  // Initiate Google Login Flow
  const loginWithGoogle = async () => {
    try {
      const frontendOrigin = window.location.origin;
      const res = await api.post('/api/auth/sign-in/social', {
        provider: 'google',
        callbackURL: `${frontendOrigin}/dashboard`,
        errorCallbackURL: `${frontendOrigin}/login`,
      });

      if (res.data?.url) {
        // Redirect browser to Google Consent screen
        window.location.href = res.data.url;
      }
    } catch (error) {
      console.error('Failed to initiate Google login:', error);
    }
  };

  // Logout Flow
  const logout = async () => {
    try {
      await api.post('/api/auth/sign-out').catch(() => {});
      await api.post('/v1/user/auth/logout').catch(() => {});
    } finally {
      setUser(null);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

---

### 3. Google Sign-In Button Component (`components/GoogleSignInButton.tsx`)

```tsx
'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';

export const GoogleSignInButton = () => {
  const { loginWithGoogle } = useAuth();

  return (
    <button
      onClick={loginWithGoogle}
      type="button"
      className="flex items-center justify-center gap-3 w-full py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 text-gray-700 font-medium transition"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        />
      </svg>
      Continue with Google
    </button>
  );
};
```

---

### 4. Email/Password Login Form (`components/LoginForm.tsx`)

```tsx
'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { GoogleSignInButton } from './GoogleSignInButton';

export const LoginForm = () => {
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.post('/v1/user/auth/login', { email, password });
      await refreshUser();
      window.location.href = '/dashboard';
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData?.code === 'USE_GOOGLE_LOGIN') {
        setError('This account was created with Google. Please click "Continue with Google" below.');
      } else {
        setError(errorData?.message || 'Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto p-6 bg-white rounded-xl shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-center text-gray-800">Welcome Back</h2>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
        >
          {loading ? 'Signing in...' : 'Sign In with Password'}
        </button>
      </form>

      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="flex-shrink mx-4 text-gray-400 text-sm">OR</span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>

      <GoogleSignInButton />
    </div>
  );
};
```

---

## 📊 CRM Analytics API Integration (For CRM Dashboard)

To display website user growth and returning visitor metrics on your CRM admin dashboard:

```typescript
// Fetch analytics summary for CRM admin
const fetchWebsiteUserStats = async () => {
  const res = await api.get('/v1/admin/website-users/stats');
  console.log(res.data.stats);
  /*
    Returns:
    {
      "totalUsers": 120,
      "returningUsers": 45,
      "returningRatePercentage": 37.5,
      "activeUsers7d": 58,
      "activeUsers30d": 92,
      "newUsersToday": 6,
      "newUsersThisWeek": 28,
      "newUsersThisMonth": 74
    }
  */
};
```

---

## 🏡 Website Property APIs

These endpoints power the public property catalogue and authenticated property details on the DreamKey website. Properties only appear when the admin toggles **"Show on Website"** (`showInWebsite: true`).

### Endpoints Table

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/website/properties/list` (or `/v1/website/properties/list`) | **No (Public)** | Returns all public properties with `showInWebsite: true`. Only public card fields + R2 cover image. Supports search & filters. |
| `POST` | `/website/properties/list/:id/click` (or `/:id/click`) | **Yes (Website Auth)** | Records user click / view interest for that property in `website_property_clicks`. |
| `GET` | `/website/properties/list/:id` (or `/:id`) | **Yes (Website Auth)** | Returns full sanitized property details. Strictly excludes sensitive CRM broker/owner info, notes, and private PDFs. |

---

### 1. Public Property Listing API

* **URL**: `GET /website/properties/list` (or `GET /v1/website/properties/list`)
* **Auth**: None (Public)
* **Optional Query Parameters**:
  * `page`: Page number (default: 1)
  * `limit`: Page size (default: 12, max: 50)
  * `search`: Society / building name, location, or city
  * `locationArea`: Location / area filter (e.g. `New Town`, `Bandra`)
  * `city`: City filter (e.g. `Kolkata`, `Mumbai`)
  * `propertyType`: `FLAT`, `LAND`, `WAREHOUSE`, `COMMERCIAL`, `OTHER`
  * `pricingType`: `SALE` or `RENT`
  * `minPrice`: Minimum asking price in INR
  * `maxPrice`: Maximum asking price in INR
  * `bedrooms`: Bedrooms (e.g. `2`, `3`, `4`, `4+`)
  * `sortBy`: `createdAt`, `askingPrice`, `carpetAreaSqFt`, `societyBuildingName`
  * `sortOrder`: `desc` or `asc`

#### Example Response:
```json
{
  "success": true,
  "properties": [
    {
      "id": "e8d64115-3bd1-4043-b9df-cf822cb2adba",
      "propertyType": "FLAT",
      "societyBuildingName": "DreamKey Altura",
      "locationArea": "New Town Action Area II",
      "city": "Kolkata",
      "carpetAreaSqFt": 1850,
      "superBuiltUpAreaSqFt": 2750,
      "askingPrice": 18500000,
      "pricingType": "SALE",
      "bedrooms": 3,
      "bathrooms": 3,
      "amenities": ["Lake Facing", "Sky Lounge", "Gymnasium", "Swimming Pool"],
      "availabilityStatus": "AVAILABLE",
      "coverImage": "https://pub-xxx.r2.dev/properties/e8d.../cover.jpg",
      "previewImages": [
        "https://pub-xxx.r2.dev/properties/e8d.../cover.jpg",
        "https://pub-xxx.r2.dev/properties/e8d.../living.jpg"
      ]
    }
  ],
  "pagination": {
    "total": 8,
    "page": 1,
    "limit": 12,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

### 2. Property Click / Interest Tracking API

* **URL**: `POST /website/properties/list/:id/click` (or `POST /v1/website/properties/list/:id/click`)
* **Auth**: **Website Auth Required** (Pass session cookie or `Authorization: Bearer <token>`)
* **Description**: Call this when a logged-in user clicks on a property card to view details. Logs the user's ID, property ID, IP address, and User-Agent.

#### Example Request:
```typescript
await api.post(`/website/properties/list/${propertyId}/click`, {}, { withCredentials: true });
```

#### Example Response:
```json
{
  "success": true,
  "message": "Property click recorded successfully",
  "data": {
    "clickId": "c9284fae-f6bb-495c-9c02-7634f5debc98",
    "propertyId": "e8d64115-3bd1-4043-b9df-cf822cb2adba",
    "societyBuildingName": "DreamKey Altura",
    "userId": "9618f096-7a13-4f18-bb9f-5182069e2ae2",
    "userEmail": "user@gmail.com",
    "recordedAt": "2026-11-01T11:20:00.000Z"
  }
}
```

---

### 3. Authenticated Property Details API

* **URL**: `GET /website/properties/list/:id` (or `GET /v1/website/properties/list/:id`)
* **Auth**: **Website Auth Required** (Pass session cookie or `Authorization: Bearer <token>`)
* **Description**: Returns all public specifications, floor details, amenities, and safe media (photographs, videos, floor plans).
* **Security**: Automatically strips all internal CRM notes, broker/owner personal contacts, and confidential internal documents.

#### Example Response:
```json
{
  "success": true,
  "property": {
    "id": "e8d64115-3bd1-4043-b9df-cf822cb2adba",
    "propertyType": "FLAT",
    "societyBuildingName": "DreamKey Altura",
    "locationArea": "New Town Action Area II",
    "city": "Kolkata",
    "pincode": "700156",
    "floorNumber": 14,
    "totalFloors": 25,
    "bedrooms": 3,
    "bathrooms": 3,
    "balconies": 2,
    "carpetAreaSqFt": 1850,
    "superBuiltUpAreaSqFt": 2750,
    "pricingType": "SALE",
    "askingPrice": 18500000,
    "availabilityStatus": "AVAILABLE",
    "availabilityDate": null,
    "builderName": "DreamKey Infra",
    "yearOfConstruction": 2024,
    "totalUnits": 150,
    "amenities": ["Lake Facing", "Sky Lounge", "Gymnasium", "Swimming Pool"],
    "reraNumber": "WBRERA/P/KOL/2024/001",
    "coverImage": "https://pub-xxx.r2.dev/properties/e8d.../cover.jpg",
    "media": [
      {
        "id": "media-1",
        "category": "PHOTOGRAPH",
        "title": "Front Elevation",
        "url": "https://pub-xxx.r2.dev/properties/e8d.../cover.jpg",
        "thumbnailUrl": null,
        "isCover": true,
        "order": 0
      },
      {
        "id": "media-2",
        "category": "FLOOR_PLAN",
        "title": "3 BHK Master Layout",
        "url": "https://pub-xxx.r2.dev/properties/e8d.../floorplan.jpg",
        "thumbnailUrl": null,
        "isCover": false,
        "order": 1
      }
    ],
    "createdAt": "2026-10-30T10:15:00.000Z"
  }
}
```

