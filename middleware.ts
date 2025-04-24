import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Create a Supabase client configured for the middleware
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  // Refresh the session if it exists
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is not signed in and the current path is not login or home page,
  // redirect the user to the login page
  if (!session && 
      request.nextUrl.pathname !== '/' && 
      request.nextUrl.pathname !== '/login' &&
      !request.nextUrl.pathname.startsWith('/_next') &&
      !request.nextUrl.pathname.startsWith('/api/')) {
    // Check if there's demo access
    const hasDemo = request.cookies.get('demo_access')?.value === 'true'
    
    // Allow demo access to bypass authentication
    if (hasDemo) {
      return res
    }
    
    return NextResponse.redirect(new URL('/', request.url))
  }

  return res
}

// Add paths that should trigger the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
} 