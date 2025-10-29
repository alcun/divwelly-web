import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect /dashboard and /household routes
  if (!pathname.startsWith('/dashboard') && !pathname.startsWith('/household')) {
    return NextResponse.next()
  }

  console.log('=== MIDDLEWARE DEBUG ===')
  console.log('Pathname:', pathname)
  console.log('All cookies:', request.cookies.getAll())

  // Check if cookie exists
  const sessionCookie = request.cookies.get('better-auth.session_token')
  console.log('Session cookie:', sessionCookie)

  if (!sessionCookie) {
    console.log('❌ MIDDLEWARE: No session cookie found, redirecting to /')
    return NextResponse.redirect(new URL('/', request.url))
  }

  console.log('✓ MIDDLEWARE: Session cookie found, allowing access')
  return NextResponse.next()
}