import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Only protect /dashboard and /household routes
  if (!pathname.startsWith('/dashboard') && !pathname.startsWith('/household')) {
    return NextResponse.next()
  }
  
  // Check if cookie exists
  const sessionCookie = request.cookies.get('better-auth.session_token')
  
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  return NextResponse.next()
}