'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function getSession() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('__Secure-better-auth.session_token')
    || cookieStore.get('better-auth.session_token')

  if (!sessionToken) {
    return null
  }

  const cookieName = sessionToken.name

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/get-session`, {
      headers: {
        Cookie: `${cookieName}=${sessionToken.value}`,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Failed to get session:', error)
    return null
  }
}

export async function logout() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('__Secure-better-auth.session_token')
    || cookieStore.get('better-auth.session_token')

  if (sessionToken) {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/sign-out`, {
        method: 'POST',
        headers: {
          Cookie: `${sessionToken.name}=${sessionToken.value}`,
        },
      })
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // Delete both possible cookie names
  cookieStore.delete('__Secure-better-auth.session_token')
  cookieStore.delete('better-auth.session_token')
  redirect('/login')
}