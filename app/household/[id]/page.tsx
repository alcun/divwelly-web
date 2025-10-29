'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from '@tanstack/react-form'
import Link from 'next/link'

type Member = {
  id: string
  name: string
  email: string
  role: string
}

type Expense = {
  id: string
  description: string
  amount: string
  paidById: string
  paidByName: string
  createdAt: string
}

type Balance = {
  from: string
  to: string
  amount: string
}

export default function HouseholdDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [householdId, setHouseholdId] = useState<string | null>(null)
  const [household, setHousehold] = useState<any>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [balances, setBalances] = useState<Balance[]>([])
  const [loading, setLoading] = useState(true)
  
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Handle params properly for Next.js 15
    const resolveParams = async () => {
      const resolvedParams = await Promise.resolve(params)
      setHouseholdId(resolvedParams.id)
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (householdId) {
      loadHouseholdData()
    }
  }, [householdId])

  const loadHouseholdData = async () => {
    if (!householdId) return
    
    try {
      const householdRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/households/${householdId}`,
        { credentials: 'include' }
      )
      if (!householdRes.ok) throw new Error('Failed to load household')
      const householdData = await householdRes.json()
      setHousehold(householdData.household)

      const membersRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/households/${householdId}/members`,
        { credentials: 'include' }
      )
      if (membersRes.ok) {
        const membersData = await membersRes.json()
        setMembers(membersData.members || [])
      }

      const expensesRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/households/${householdId}/expenses`,
        { credentials: 'include' }
      )
      if (expensesRes.ok) {
        const expensesData = await expensesRes.json()
        setExpenses(expensesData.expenses || [])
      }

      const balancesRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/households/${householdId}/balances`,
        { credentials: 'include' }
      )
      if (balancesRes.ok) {
        const balancesData = await balancesRes.json()
        setBalances(balancesData.balances || [])
      }

    } catch (err) {
      console.error(err)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const expenseForm = useForm({
    defaultValues: {
      description: '',
      amount: '',
    },
    onSubmit: async ({ value }) => {
      if (!householdId) return
      
      setError('')
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/expenses`,
          {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              householdId: householdId,
              description: value.description,
              amount: parseFloat(value.amount),
            }),
          }
        )

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Failed to add expense')
        }

        await loadHouseholdData()
        setShowAddExpense(false)
        expenseForm.reset()
      } catch (err: any) {
        setError(err.message)
      }
    },
  })

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (!household) {
    return <div className="p-8">Household not found</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold">{household.name}</h1>
              <p className="text-gray-600">Invite Code: {household.inviteCode}</p>
            </div>
            <button
              onClick={() => setShowAddExpense(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Expense
            </button>
          </div>
        </div>

        {/* Balances */}
        {balances.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Balances</h2>
            <div className="space-y-2">
              {balances.map((balance, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span>
                    <strong>{balance.from}</strong> owes <strong>{balance.to}</strong>
                  </span>
                  <span className="font-bold text-green-600">£{balance.amount}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Members */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Members ({members.length})</h2>
          <div className="space-y-2">
            {members.map((member) => (
              <div key={member.id} className="flex justify-between items-center p-3 border border-gray-200 rounded">
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-gray-600">{member.email}</p>
                </div>
                <span className="text-sm text-gray-500 capitalize">{member.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Recent Expenses ({expenses.length})</h2>
          {expenses.length === 0 ? (
            <p className="text-gray-600">No expenses yet. Add one above!</p>
          ) : (
            <div className="space-y-2">
              {expenses.map((expense) => (
                <div key={expense.id} className="flex justify-between items-center p-3 border border-gray-200 rounded">
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-sm text-gray-600">
                      Paid by {expense.paidByName} • {new Date(expense.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="font-bold">£{expense.amount}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Add Expense</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                expenseForm.handleSubmit()
              }}
            >
              <expenseForm.Field name="description">
                {(field) => (
                  <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      id="description"
                      type="text"
                      required
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="e.g. Groceries, Rent, Electricity"
                    />
                  </div>
                )}
              </expenseForm.Field>

              <expenseForm.Field name="amount">
                {(field) => (
                  <div className="mb-4">
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                      Amount (£)
                    </label>
                    <input
                      id="amount"
                      type="number"
                      step="0.01"
                      required
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="0.00"
                    />
                  </div>
                )}
              </expenseForm.Field>

              {error && (
                <div className="mb-4 text-red-600 text-sm">{error}</div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Expense
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddExpense(false)
                    expenseForm.reset()
                    setError('')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}