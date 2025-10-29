import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import DashboardClient from './dashboard-client'

async function getHouseholds() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('better-auth.session_token')

  if (!sessionToken) {
    redirect('/')
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/households`, {
      headers: {
        Cookie: `better-auth.session_token=${sessionToken.value}`,
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      redirect('/')
    }

    const data = await res.json()
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