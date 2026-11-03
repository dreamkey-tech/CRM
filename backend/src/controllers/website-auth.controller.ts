import type { Context } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import type { AppEnv } from '../db'
import {
  hashPassword,
  verifyPassword,
  generateWebsiteSessionToken,
  generate4DigitOtp,
  getWebsiteAuthCookieOptions,
  WEBSITE_AUTH_COOKIE_NAME,
  WEBSITE_SESSION_MAX_AGE_SECONDS,
} from '../lib/website-auth'
import {
  sendWebsiteLoginOtpEmail,
  sendWebsiteResetPasswordOtpEmail,
} from '../services/email'

/**
 * Register a new website user
 * Endpoint: POST /v1/user/auth/register
 */
export const websiteRegisterController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const body = await c.req.json<{ email: string; password: string; name?: string }>()

  if (!body.email || !body.password) {
    return c.json({ message: 'Email and password are required.' }, 400)
  }

  if (body.password.length < 6) {
    return c.json({ message: 'Password must be at least 6 characters long.' }, 400)
  }

  const normalizedEmail = body.email.toLowerCase().trim()

  const existingUser = await prisma.websiteUser.findUnique({
    where: { email: normalizedEmail },
  })

  if (existingUser) {
    return c.json({ message: 'An account with this email address already exists.' }, 400)
  }

  const passwordHash = await hashPassword(body.password)
  const now = new Date()

  // Create the website user with initial login tracking
  const user = await prisma.websiteUser.create({
    data: {
      email: normalizedEmail,
      name: body.name?.trim() || null,
      passwordHash,
      emailVerified: false,
      authProvider: 'EMAIL',
      lastAuthProvider: 'EMAIL',
      loginCount: 1,
      lastLoginAt: now,
      lastActiveAt: now,
    },
  })

  // Generate session & cookie
  const token = generateWebsiteSessionToken()
  const expiresAt = new Date(Date.now() + WEBSITE_SESSION_MAX_AGE_SECONDS * 1000)
  const userAgent = c.req.header('user-agent') || null
  const ipAddress = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || null

  await prisma.websiteUserSession.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
      userAgent,
      ipAddress,
      lastUsedAt: now,
    },
  })

  const isHttps =
    c.req.url.startsWith('https://') ||
    c.req.header('x-forwarded-proto') === 'https' ||
    (c.env?.BACKEND_URL && c.env.BACKEND_URL.startsWith('https://')) ||
    false
  const cookieOpts = getWebsiteAuthCookieOptions(isHttps)
  setCookie(c, cookieOpts.name, token, {
    path: cookieOpts.path,
    httpOnly: cookieOpts.httpOnly,
    secure: cookieOpts.secure,
    sameSite: cookieOpts.sameSite,
    maxAge: cookieOpts.maxAge,
  })
  setCookie(c, 'better-auth.session_token', token, {
    path: cookieOpts.path,
    httpOnly: cookieOpts.httpOnly,
    secure: cookieOpts.secure,
    sameSite: cookieOpts.sameSite,
    maxAge: cookieOpts.maxAge,
  })

  return c.json(
    {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
      },
    },
    201
  )
}

/**
 * Step 1: Login website user (Email & Password verification -> Generate 4-digit OTP)
 * Endpoint: POST /v1/user/auth/login
 */
export const websiteLoginController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const body = await c.req.json<{ email: string; password: string }>()

  if (!body.email || !body.password) {
    return c.json({ message: 'Invalid email or password' }, 401)
  }

  const normalizedEmail = body.email.toLowerCase().trim()

  const user = await prisma.websiteUser.findUnique({
    where: { email: normalizedEmail },
  })

  if (!user) {
    return c.json({ message: 'Invalid email or password' }, 401)
  }

  if (!user.isActive) {
    return c.json({ message: 'Your account has been deactivated. Please contact support.' }, 403)
  }

  // If user registered with Google and has not set a password yet
  if (!user.passwordHash) {
    return c.json(
      {
        message: 'This account was created with Google. Please sign in using Google.',
        code: 'USE_GOOGLE_LOGIN',
      },
      400
    )
  }

  const isValidPassword = await verifyPassword(body.password, user.passwordHash)
  if (!isValidPassword) {
    return c.json({ message: 'Invalid email or password' }, 401)
  }

  // Cooldown check: prevent email flooding if OTP was generated within the last 60s
  const sixtySecondsAgo = new Date(Date.now() - 60 * 1000)
  const recentOtp = await prisma.websiteUserOtp.findFirst({
    where: {
      email: normalizedEmail,
      purpose: 'LOGIN',
      used: false,
      createdAt: { gte: sixtySecondsAgo },
    },
  })

  if (recentOtp) {
    return c.json({
      success: true,
      requiresOtp: true,
      message: 'A verification code was recently sent. Please check your email or wait 60 seconds before requesting a new code.',
      email: normalizedEmail,
    })
  }

  // Password is valid! Generate cryptographically secure 4-digit OTP valid for 5 minutes
  const otp = generate4DigitOtp()
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

  // Invalidate any existing unused LOGIN OTPs for this email
  await prisma.websiteUserOtp.updateMany({
    where: {
      email: normalizedEmail,
      purpose: 'LOGIN',
      used: false,
    },
    data: {
      used: true,
    },
  })

  // Store new 4-digit OTP
  await prisma.websiteUserOtp.create({
    data: {
      email: normalizedEmail,
      otp,
      purpose: 'LOGIN',
      expiresAt,
    },
  })

  // Dispatch OTP email from info@dreamkeykol.com
  await sendWebsiteLoginOtpEmail(
    {
      to: normalizedEmail,
      name: user.name,
      email: normalizedEmail,
      otp,
      expiresInMinutes: 5,
      from: 'DreamKey <info@dreamkeykol.com>',
    },
    c.env
  )

  return c.json({
    success: true,
    requiresOtp: true,
    message: 'A 4-digit verification code has been sent to your email. Valid for 5 minutes.',
    email: normalizedEmail,
  })
}

/**
 * Step 2: Verify Login OTP -> Email Verified -> Authenticate & Establish Session
 * Endpoint: POST /v1/user/auth/verify-login-otp
 */
export const websiteVerifyLoginOtpController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const body = await c.req.json<{ email: string; otp: string }>()

  if (!body.email || !body.otp) {
    return c.json({ message: 'Email and 4-digit OTP are required.' }, 400)
  }

  const normalizedEmail = body.email.toLowerCase().trim()
  const cleanOtp = body.otp.trim()

  const user = await prisma.websiteUser.findUnique({
    where: { email: normalizedEmail },
  })

  if (!user) {
    return c.json({ message: 'Account not found. Please register or check your email.' }, 404)
  }

  if (!user.isActive) {
    return c.json({ message: 'Your account has been deactivated. Please contact support.' }, 403)
  }

  const now = new Date()

  // Find active, unused OTP for this email and purpose
  const activeOtp = await prisma.websiteUserOtp.findFirst({
    where: {
      email: normalizedEmail,
      purpose: 'LOGIN',
      used: false,
      expiresAt: { gt: now },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!activeOtp) {
    return c.json(
      { message: 'Invalid or expired OTP. Please verify the code or request a new one.' },
      400
    )
  }

  // Validate OTP code with 5-attempt limit to prevent brute force
  if (activeOtp.otp !== cleanOtp) {
    const updatedAttempts = activeOtp.attempts + 1
    const maxAttempts = 5
    const isExceeded = updatedAttempts >= maxAttempts

    await prisma.websiteUserOtp.update({
      where: { id: activeOtp.id },
      data: {
        attempts: updatedAttempts,
        used: isExceeded ? true : false,
      },
    })

    if (isExceeded) {
      return c.json(
        { message: 'Too many incorrect attempts. This verification code has been deactivated. Please request a new code.' },
        400
      )
    }

    const remaining = maxAttempts - updatedAttempts
    return c.json(
      { message: `Invalid verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.` },
      400
    )
  }

  // Mark OTP as used
  await prisma.websiteUserOtp.update({
    where: { id: activeOtp.id },
    data: { used: true },
  })

  // Mark emailVerified: true and update login tracking
  const updatedUser = await prisma.websiteUser.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      loginCount: { increment: 1 },
      lastAuthProvider: 'EMAIL',
      lastLoginAt: now,
      lastActiveAt: now,
    },
  })

  // Create session & cookies
  const token = generateWebsiteSessionToken()
  const expiresAt = new Date(Date.now() + WEBSITE_SESSION_MAX_AGE_SECONDS * 1000)
  const userAgent = c.req.header('user-agent') || null
  const ipAddress = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || null

  await prisma.websiteUserSession.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
      userAgent,
      ipAddress,
      lastUsedAt: now,
    },
  })

  const isHttps =
    c.req.url.startsWith('https://') ||
    c.req.header('x-forwarded-proto') === 'https' ||
    (c.env?.BACKEND_URL && c.env.BACKEND_URL.startsWith('https://')) ||
    false
  const cookieOpts = getWebsiteAuthCookieOptions(isHttps)

  setCookie(c, cookieOpts.name, token, {
    path: cookieOpts.path,
    httpOnly: cookieOpts.httpOnly,
    secure: cookieOpts.secure,
    sameSite: cookieOpts.sameSite,
    maxAge: cookieOpts.maxAge,
  })
  setCookie(c, 'better-auth.session_token', token, {
    path: cookieOpts.path,
    httpOnly: cookieOpts.httpOnly,
    secure: cookieOpts.secure,
    sameSite: cookieOpts.sameSite,
    maxAge: cookieOpts.maxAge,
  })

  return c.json({
    success: true,
    message: 'Login successful. Email verified.',
    user: {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      emailVerified: updatedUser.emailVerified,
    },
  })
}

/**
 * Resend OTP for either Login or Password Reset
 * Endpoint: POST /v1/user/auth/resend-otp
 */
export const websiteResendOtpController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const body = await c.req.json<{ email: string; purpose?: 'LOGIN' | 'PASSWORD_RESET' }>()

  if (!body.email) {
    return c.json({ message: 'Email is required.' }, 400)
  }

  const normalizedEmail = body.email.toLowerCase().trim()
  const purpose = body.purpose || 'LOGIN'

  const user = await prisma.websiteUser.findUnique({
    where: { email: normalizedEmail },
  })

  // Prevent account enumeration by returning generic success even if user not found
  if (!user) {
    return c.json({
      success: true,
      message: 'If an account exists with this email address, a verification code has been sent.',
      email: normalizedEmail,
    })
  }

  if (!user.isActive) {
    return c.json({ message: 'Your account has been deactivated. Please contact support.' }, 403)
  }

  // Cooldown check: prevent flooding if OTP was generated in the last 60s
  const sixtySecondsAgo = new Date(Date.now() - 60 * 1000)
  const recentOtp = await prisma.websiteUserOtp.findFirst({
    where: {
      email: normalizedEmail,
      purpose,
      used: false,
      createdAt: { gte: sixtySecondsAgo },
    },
  })

  if (recentOtp) {
    return c.json(
      { message: 'Please wait at least 60 seconds before requesting another verification code.' },
      429
    )
  }

  // Invalidate previous unused OTPs for this purpose
  await prisma.websiteUserOtp.updateMany({
    where: {
      email: normalizedEmail,
      purpose,
      used: false,
    },
    data: {
      used: true,
    },
  })

  // Generate new 4-digit OTP valid for 5 minutes
  const otp = generate4DigitOtp()
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

  await prisma.websiteUserOtp.create({
    data: {
      email: normalizedEmail,
      otp,
      purpose,
      expiresAt,
    },
  })

  if (purpose === 'PASSWORD_RESET') {
    await sendWebsiteResetPasswordOtpEmail(
      {
        to: normalizedEmail,
        name: user.name,
        email: normalizedEmail,
        otp,
        expiresInMinutes: 5,
        from: 'DreamKey <info@dreamkeykol.com>',
      },
      c.env
    )
  } else {
    await sendWebsiteLoginOtpEmail(
      {
        to: normalizedEmail,
        name: user.name,
        email: normalizedEmail,
        otp,
        expiresInMinutes: 5,
        from: 'DreamKey <info@dreamkeykol.com>',
      },
      c.env
    )
  }

  return c.json({
    success: true,
    message: 'A new 4-digit verification code has been sent to your email. Valid for 5 minutes.',
    email: normalizedEmail,
  })
}

/**
 * Step 1 (Reset Password): Request 4-digit OTP for password reset
 * Endpoint: POST /v1/user/auth/forgot-password
 */
export const websiteForgotPasswordController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const body = await c.req.json<{ email: string }>()

  if (!body.email) {
    return c.json({ message: 'Email address is required.' }, 400)
  }

  const normalizedEmail = body.email.toLowerCase().trim()

  const user = await prisma.websiteUser.findUnique({
    where: { email: normalizedEmail },
  })

  // Prevent user enumeration
  if (!user) {
    return c.json({
      success: true,
      message: 'If an account is associated with this email, a 4-digit password reset code has been sent.',
      email: normalizedEmail,
    })
  }

  if (!user.isActive) {
    return c.json({ message: 'Your account has been deactivated. Please contact support.' }, 403)
  }

  // Cooldown check: prevent email spamming if OTP requested in the last 60s
  const sixtySecondsAgo = new Date(Date.now() - 60 * 1000)
  const recentOtp = await prisma.websiteUserOtp.findFirst({
    where: {
      email: normalizedEmail,
      purpose: 'PASSWORD_RESET',
      used: false,
      createdAt: { gte: sixtySecondsAgo },
    },
  })

  if (recentOtp) {
    return c.json(
      { message: 'Please wait at least 60 seconds before requesting another password reset code.' },
      429
    )
  }

  // Invalidate previous unused PASSWORD_RESET OTPs
  await prisma.websiteUserOtp.updateMany({
    where: {
      email: normalizedEmail,
      purpose: 'PASSWORD_RESET',
      used: false,
    },
    data: {
      used: true,
    },
  })

  // Generate 4-digit OTP valid for 5 minutes
  const otp = generate4DigitOtp()
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

  await prisma.websiteUserOtp.create({
    data: {
      email: normalizedEmail,
      otp,
      purpose: 'PASSWORD_RESET',
      expiresAt,
    },
  })

  // Dispatch password reset OTP from info@dreamkeykol.com
  await sendWebsiteResetPasswordOtpEmail(
    {
      to: normalizedEmail,
      name: user.name,
      email: normalizedEmail,
      otp,
      expiresInMinutes: 5,
      from: 'DreamKey <info@dreamkeykol.com>',
    },
    c.env
  )

  return c.json({
    success: true,
    message: 'A 4-digit password reset code has been sent to your email. Valid for 5 minutes.',
    email: normalizedEmail,
  })
}

/**
 * Step 2 (Reset Password): Verify 4-digit OTP before entering new password
 * Endpoint: POST /v1/user/auth/verify-reset-otp
 */
export const websiteVerifyResetOtpController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const body = await c.req.json<{ email: string; otp: string }>()

  if (!body.email || !body.otp) {
    return c.json({ message: 'Email and 4-digit OTP are required.' }, 400)
  }

  const normalizedEmail = body.email.toLowerCase().trim()
  const cleanOtp = body.otp.trim()

  const now = new Date()

  const activeOtp = await prisma.websiteUserOtp.findFirst({
    where: {
      email: normalizedEmail,
      purpose: 'PASSWORD_RESET',
      used: false,
      expiresAt: { gt: now },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!activeOtp) {
    return c.json(
      { message: 'Invalid or expired OTP. Please check the code or request a new one.' },
      400
    )
  }

  if (activeOtp.otp !== cleanOtp) {
    const updatedAttempts = activeOtp.attempts + 1
    const maxAttempts = 5
    const isExceeded = updatedAttempts >= maxAttempts

    await prisma.websiteUserOtp.update({
      where: { id: activeOtp.id },
      data: {
        attempts: updatedAttempts,
        used: isExceeded ? true : false,
      },
    })

    if (isExceeded) {
      return c.json(
        { message: 'Too many incorrect attempts. This code has been deactivated. Please request a new code.' },
        400
      )
    }

    const remaining = maxAttempts - updatedAttempts
    return c.json(
      { message: `Invalid verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.` },
      400
    )
  }

  return c.json({
    success: true,
    message: 'OTP verified successfully. You may now enter your new password.',
    email: normalizedEmail,
  })
}

/**
 * Step 3 (Reset Password): Submit OTP + New Password -> Done
 * Endpoint: POST /v1/user/auth/reset-password
 */
export const websiteResetPasswordController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  const body = await c.req.json<{ email: string; otp: string; newPassword: string }>()

  if (!body.email || !body.otp || !body.newPassword) {
    return c.json({ message: 'Email, OTP, and new password are required.' }, 400)
  }

  if (body.newPassword.length < 6) {
    return c.json({ message: 'New password must be at least 6 characters long.' }, 400)
  }

  const normalizedEmail = body.email.toLowerCase().trim()
  const cleanOtp = body.otp.trim()

  const user = await prisma.websiteUser.findUnique({
    where: { email: normalizedEmail },
  })

  if (!user) {
    return c.json({ message: 'User not found.' }, 404)
  }

  const now = new Date()

  // Validate OTP with 5-attempt brute-force protection
  const activeOtp = await prisma.websiteUserOtp.findFirst({
    where: {
      email: normalizedEmail,
      purpose: 'PASSWORD_RESET',
      used: false,
      expiresAt: { gt: now },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!activeOtp) {
    return c.json(
      { message: 'Invalid or expired OTP. Please request a new code.' },
      400
    )
  }

  if (activeOtp.otp !== cleanOtp) {
    const updatedAttempts = activeOtp.attempts + 1
    const maxAttempts = 5
    const isExceeded = updatedAttempts >= maxAttempts

    await prisma.websiteUserOtp.update({
      where: { id: activeOtp.id },
      data: {
        attempts: updatedAttempts,
        used: isExceeded ? true : false,
      },
    })

    if (isExceeded) {
      return c.json(
        { message: 'Too many incorrect attempts. This code has been deactivated. Please request a new code.' },
        400
      )
    }

    const remaining = maxAttempts - updatedAttempts
    return c.json(
      { message: `Invalid verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.` },
      400
    )
  }

  // Mark OTP as used
  await prisma.websiteUserOtp.update({
    where: { id: activeOtp.id },
    data: { used: true },
  })

  // Hash new password and update user
  const passwordHash = await hashPassword(body.newPassword)

  await prisma.websiteUser.update({
    where: { id: user.id },
    data: {
      passwordHash,
      emailVerified: true,
      updatedAt: now,
    },
  })

  // Revoke all existing sessions for security
  await prisma.websiteUserSession.deleteMany({
    where: { userId: user.id },
  }).catch(() => {})

  return c.json({
    success: true,
    message: 'Password reset successfully. You can now login with your new password.',
  })
}


/**
 * Get current website user profile
 * Endpoint: GET /v1/user/auth/me
 */
export const websiteGetMeController = async (c: Context<AppEnv>) => {
  const websiteUser = c.get('websiteUser')

  if (!websiteUser) {
    return c.json({ message: 'Unauthorized' }, 401)
  }

  const prisma = c.get('prisma')
  const user = await prisma.websiteUser.findUnique({
    where: { id: websiteUser.id },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
    },
  })

  return c.json({
    user: user || {
      id: websiteUser.id,
      name: websiteUser.name,
      email: websiteUser.email,
      emailVerified: false,
    },
  })
}

/**
 * Refresh current website user session
 * Endpoint: POST /v1/user/auth/refresh
 */
export const websiteRefreshTokenController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  let token = getCookie(c, WEBSITE_AUTH_COOKIE_NAME) || getCookie(c, 'better-auth.session_token')

  if (!token) {
    const authHeader = c.req.header('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim()
    }
  }

  if (!token) {
    deleteCookie(c, WEBSITE_AUTH_COOKIE_NAME, { path: '/' })
    deleteCookie(c, 'better-auth.session_token', { path: '/' })
    return c.json({ message: 'Unauthorized' }, 401)
  }

  const session = await prisma.websiteUserSession.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!session || session.expiresAt < new Date() || !session.user.isActive) {
    deleteCookie(c, WEBSITE_AUTH_COOKIE_NAME, { path: '/' })
    deleteCookie(c, 'better-auth.session_token', { path: '/' })
    return c.json({ message: 'Unauthorized' }, 401)
  }

  // Generate new token & extend session
  const newToken = generateWebsiteSessionToken()
  const newExpiresAt = new Date(Date.now() + WEBSITE_SESSION_MAX_AGE_SECONDS * 1000)
  const now = new Date()

  await prisma.websiteUserSession.update({
    where: { id: session.id },
    data: {
      token: newToken,
      expiresAt: newExpiresAt,
      lastUsedAt: now,
    },
  })

  const isHttps =
    c.req.url.startsWith('https://') ||
    c.req.header('x-forwarded-proto') === 'https' ||
    (c.env?.BACKEND_URL && c.env.BACKEND_URL.startsWith('https://')) ||
    false
  const cookieOpts = getWebsiteAuthCookieOptions(isHttps)
  setCookie(c, cookieOpts.name, newToken, {
    path: cookieOpts.path,
    httpOnly: cookieOpts.httpOnly,
    secure: cookieOpts.secure,
    sameSite: cookieOpts.sameSite,
    maxAge: cookieOpts.maxAge,
  })
  setCookie(c, 'better-auth.session_token', newToken, {
    path: cookieOpts.path,
    httpOnly: cookieOpts.httpOnly,
    secure: cookieOpts.secure,
    sameSite: cookieOpts.sameSite,
    maxAge: cookieOpts.maxAge,
  })

  return c.json({ message: 'Token refreshed successfully' })
}

/**
 * Logout website user: Delete session and clear cookie
 * Endpoint: POST /v1/user/auth/logout
 */
export const websiteLogoutController = async (c: Context<AppEnv>) => {
  const prisma = c.get('prisma')
  let token = getCookie(c, WEBSITE_AUTH_COOKIE_NAME) || getCookie(c, 'better-auth.session_token')

  if (!token) {
    const authHeader = c.req.header('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim()
    }
  }

  if (token) {
    await prisma.websiteUserSession.deleteMany({
      where: { token },
    }).catch(() => {})
  }

  deleteCookie(c, WEBSITE_AUTH_COOKIE_NAME, { path: '/' })
  deleteCookie(c, 'better-auth.session_token', { path: '/' })

  return c.json({ message: 'Logged out successfully' })
}
