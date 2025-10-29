'use client'

import { useState } from 'react'
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

type Household = {
  id: string
  name: string
  inviteCode: string
}

type HouseholdClientProps = {
  initialHousehold: Household
  initialMembers: Member[]
  initialExpenses: Expense[]
  initialBalances: Balance[]
}

export default function HouseholdClient({
  initialHousehold,
  initialMembers,
  initialExpenses,
  initialBalances,
}: HouseholdClientProps) {
  const router = useRouter()
  const [members] = useState<Member[]>(initialMembers)
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses)
  const [balances, setBalances] = useState<Balance[]>(initialBalances)
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [error, setError] = useState('')

  const loadHouseholdData = async () => {
    try {
      const expensesRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/households/${initialHousehold.id}/expenses`,
        { credentials: 'include' }
      )
      if (expensesRes.ok) {
        const expensesData = await expensesRes.json()
        setExpenses(expensesData.expenses || [])
      }

      const balancesRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/households/${initialHousehold.id}/balances`,
        { credentials: 'include' }
      )
      if (balancesRes.ok) {
        const balancesData = await balancesRes.json()
        setBalances(balancesData.balances || [])
      }
    } catch (err) {
      console.error('Error reloading data:', err)
    }
  }

  const expenseForm = useForm({
    defaultValues: {
      description: '',
      amount: '',
    },
    onSubmit: async ({ value }) => {
      setError('')
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/expenses`,
          {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              householdId: initialHousehold.id,
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

  return (
    <div className="container">
      <div className="mb-lg">
        <Link href="/dashboard" className="link">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="card">
        <div className="flex-between mb-lg">
          <div>
            <h1 className="mb-sm">{initialHousehold.name}</h1>
            <p className="text-sm text-muted">Invite Code: {initialHousehold.inviteCode}</p>
          </div>
          <button
            onClick={() => setShowAddExpense(true)}
            className="btn btn-primary"
          >
            Add Expense
          </button>
        </div>
      </div>

      {/* Balances */}
      {balances.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2>Balances</h2>
          </div>
          <div>
            {balances.map((balance, idx) => (
              <div key={idx} className="list-item flex-between" style={{ cursor: 'default' }}>
                <span>
                  <strong>{balance.from}</strong> owes <strong>{balance.to}</strong>
                </span>
                <span className="text-bold" style={{ color: 'var(--accent)' }}>£{balance.amount}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members */}
      <div className="card">
        <div className="card-header">
          <h2>Members ({members.length})</h2>
        </div>
        <div>
          {members.map((member) => (
            <div key={member.id} className="list-item flex-between" style={{ cursor: 'default' }}>
              <div>
                <p className="text-bold mb-sm">{member.name}</p>
                <p className="text-sm text-muted">{member.email}</p>
              </div>
              <span className="badge">{member.role}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Expenses */}
      <div className="card">
        <div className="card-header">
          <h2>Recent Expenses ({expenses.length})</h2>
        </div>
        {expenses.length === 0 ? (
          <p className="text-muted">No expenses yet. Add one above!</p>
        ) : (
          <div>
            {expenses.map((expense) => (
              <div key={expense.id} className="list-item flex-between" style={{ cursor: 'default' }}>
                <div>
                  <p className="text-bold mb-sm">{expense.description}</p>
                  <p className="text-sm text-muted">
                    Paid by {expense.paidByName} • {new Date(expense.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-bold">£{expense.amount}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title">Add Expense</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                expenseForm.handleSubmit()
              }}
            >
              <expenseForm.Field name="description">
                {(field) => (
                  <div className="form-group">
                    <label htmlFor="description" className="form-label">
                      Description
                    </label>
                    <input
                      id="description"
                      type="text"
                      required
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="form-input"
                      placeholder="e.g. Groceries, Rent, Electricity"
                    />
                  </div>
                )}
              </expenseForm.Field>

              <expenseForm.Field name="amount">
                {(field) => (
                  <div className="form-group">
                    <label htmlFor="amount" className="form-label">
                      Amount (£)
                    </label>
                    <input
                      id="amount"
                      type="number"
                      step="0.01"
                      required
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="form-input"
                      placeholder="0.00"
                    />
                  </div>
                )}
              </expenseForm.Field>

              {error && <div className="error">{error}</div>}

              <div className="grid grid-2 gap-md mt-md">
                <button
                  type="submit"
                  className="btn btn-primary"
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
                  className="btn btn-secondary"
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
