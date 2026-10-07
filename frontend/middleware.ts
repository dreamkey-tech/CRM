import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('auth_session')
  const { pathname } = request.nextUrl

  // Root URL: Seamlessly route to /dashboard if authenticated, otherwise /login
  if (pathname === '/') {
    if (sessionCookie) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Protected paths that require an active session cookie
  const isProtectedPath = pathname.startsWith('/dashboard') || pathname.startsWith('/admin')

  // Auth pages (login/register) where already-logged-in users should not go
  const isAuthPath = pathname === '/login' || pathname === '/register'

  if (isProtectedPath && !sessionCookie) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthPath && sessionCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/admin/:path*', '/login', '/register'],
}
