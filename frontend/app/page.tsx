import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

/**
 * Root Route (/)
 * In DreamKey CRM, there is no public landing page.
 * Users are automatically routed to /dashboard if authenticated, or /login if not.
 */
export default async function HomePage() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('auth_session')

  if (sessionCookie) {
    redirect('/dashboard')
  } else {
    redirect('/login')
  }
}
