'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function getSession() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('better-auth.session_token')
  
  if (!sessionToken) {
    return null
  }
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/get-session`, {
      headers: {
        Cookie: `better-auth.session_token=${sessionToken.value}`,
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
  
  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/sign-out`, {
      method: 'POST',
      credentials: 'include',
    })
  } catch (error) {
    console.error('Logout failed:', error)
  }
  
  cookieStore.delete('better-auth.session_token')
  redirect('/')
}