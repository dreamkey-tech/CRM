import { Hono } from 'hono'
import type { AppEnv } from '../db'
import {
  oauthSignInSocialController,
  oauthGoogleCallbackController,
  oauthGetSessionController,
  oauthSignOutController,
} from '../controllers/oauth.controller'

export const oauthRoutes = new Hono<AppEnv>()

/**
 * OAuth & Better Auth Compatible Routes
 * Base path mounted at: /api/auth
 */
oauthRoutes.post('/sign-in/social', oauthSignInSocialController)
oauthRoutes.get('/callback/google', oauthGoogleCallbackController)
oauthRoutes.get('/get-session', oauthGetSessionController)
oauthRoutes.post('/sign-out', oauthSignOutController)
