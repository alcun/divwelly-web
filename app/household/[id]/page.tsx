import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import HouseholdClient from './household-client'

async function getHouseholdData(householdId: string) {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('__Secure-better-auth.session_token')
    || cookieStore.get('better-auth.session_token')

  if (!sessionToken) {
    redirect('/login')
  }

  const cookieName = sessionToken.name

  try {
    // Fetch all data in parallel for 4x faster loading
    const [householdRes, membersRes, expensesRes, balancesRes] = await Promise.all([
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/households/${householdId}`,
        {
          headers: {
            Cookie: `${cookieName}=${sessionToken.value}`,
          },
          cache: 'no-store',
        }
      ),
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/households/${householdId}/members`,
        {
          headers: {
            Cookie: `${cookieName}=${sessionToken.value}`,
          },
          cache: 'no-store',
        }
      ),
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/households/${householdId}/expenses`,
        {
          headers: {
            Cookie: `${cookieName}=${sessionToken.value}`,
          },
          cache: 'no-store',
        }
      ),
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/households/${householdId}/balances`,
        {
          headers: {
            Cookie: `${cookieName}=${sessionToken.value}`,
          },
          cache: 'no-store',
        }
      ),
    ])

    if (!householdRes.ok) {
      redirect('/dashboard')
    }

    const [householdData, membersData, expensesData, balancesData] = await Promise.all([
      householdRes.json(),
      membersRes.ok ? membersRes.json() : { members: [] },
      expensesRes.ok ? expensesRes.json() : { expenses: [] },
      balancesRes.ok ? balancesRes.json() : { balances: [] },
    ])

    return {
      household: householdData.household,
      members: membersData.members || [],
      expenses: expensesData.expenses || [],
      balances: balancesData.balances || [],
    }
  } catch (error) {
    console.error('Error fetching household data:', error)
    redirect('/dashboard')
  }
}

export default async function HouseholdDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { household, members, expenses, balances } = await getHouseholdData(id)

  return (
    <HouseholdClient
      initialHousehold={household}
      initialMembers={members}
      initialExpenses={expenses}
      initialBalances={balances}
    />
  )
}