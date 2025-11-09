import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if cookie exists (try both secure and non-secure variants)
  const sessionCookie = request.cookies.get('__Secure-better-auth.session_token')
    || request.cookies.get('better-auth.session_token')

  const isLoggedIn = !!sessionCookie

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && (pathname === '/login' || pathname === '/signup' || pathname === '/')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Protect dashboard and household routes
  if (!isLoggedIn && (pathname.startsWith('/dashboard') || pathname.startsWith('/household'))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}