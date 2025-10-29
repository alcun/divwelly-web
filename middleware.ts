import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect /dashboard and /household routes
  if (!pathname.startsWith('/dashboard') && !pathname.startsWith('/household')) {
    return NextResponse.next()
  }

  // Check if cookie exists (try both secure and non-secure variants)
  const sessionCookie = request.cookies.get('__Secure-better-auth.session_token')
    || request.cookies.get('better-auth.session_token')

  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}