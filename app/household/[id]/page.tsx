import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import HouseholdClient from './household-client'

async function getHouseholdData(householdId: string) {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('better-auth.session_token')

  if (!sessionToken) {
    redirect('/')
  }

  try {
    // Fetch household
    const householdRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/households/${householdId}`,
      {
        headers: {
          Cookie: `better-auth.session_token=${sessionToken.value}`,
        },
        cache: 'no-store',
      }
    )

    if (!householdRes.ok) {
      redirect('/dashboard')
    }

    const householdData = await householdRes.json()

    // Fetch members
    const membersRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/households/${householdId}/members`,
      {
        headers: {
          Cookie: `better-auth.session_token=${sessionToken.value}`,
        },
        cache: 'no-store',
      }
    )

    const membersData = membersRes.ok ? await membersRes.json() : { members: [] }

    // Fetch expenses
    const expensesRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/households/${householdId}/expenses`,
      {
        headers: {
          Cookie: `better-auth.session_token=${sessionToken.value}`,
        },
        cache: 'no-store',
      }
    )

    const expensesData = expensesRes.ok ? await expensesRes.json() : { expenses: [] }

    // Fetch balances
    const balancesRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/households/${householdId}/balances`,
      {
        headers: {
          Cookie: `better-auth.session_token=${sessionToken.value}`,
        },
        cache: 'no-store',
      }
    )

    const balancesData = balancesRes.ok ? await balancesRes.json() : { balances: [] }

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