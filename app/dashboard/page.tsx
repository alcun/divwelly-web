import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import DashboardClient from './dashboard-client'

async function getHouseholds() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('better-auth.session_token')
  
  console.log('Session token:', sessionToken)
  
  if (!sessionToken) {
    console.log('No session token found, redirecting to login')
    redirect('/')
  }
  
  try {
    console.log('Fetching households from:', `${process.env.NEXT_PUBLIC_API_URL}/api/households`)
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/households`, {
      headers: {
        Cookie: `better-auth.session_token=${sessionToken.value}`,
      },
      cache: 'no-store',
    })
    
    console.log('Households response status:', res.status)
    
    if (!res.ok) {
      console.log('Failed to fetch households, redirecting to login')
      redirect('/')
    }
    
    const data = await res.json()
    console.log('Households data:', data)
    return data.households
  } catch (error) {
    console.error('Error fetching households:', error)
    redirect('/')
  }
}

export default async function DashboardPage() {
  const households = await getHouseholds()
  
  return <DashboardClient initialHouseholds={households} />
}