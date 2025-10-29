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
  address?: string | null
  postcode?: string | null
  wifiName?: string | null
  wifiPassword?: string | null
  binCollection?: string | null
  emergencyContacts?: string | null
  notes?: string | null
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
  const [showEditInfo, setShowEditInfo] = useState(false)
  const [showWifiPassword, setShowWifiPassword] = useState(false)
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

      {/* Household Info */}
      <div className="card">
        <div className="card-header">
          <div className="flex-between">
            <h2>Household Info</h2>
            <button onClick={() => setShowEditInfo(true)} className="btn btn-secondary">
              Edit Info
            </button>
          </div>
        </div>

        <div className="grid grid-2 gap-md">
          {initialHousehold.address && (
            <div>
              <p className="text-sm text-bold text-upper mb-sm">Address</p>
              <p className="text-md">{initialHousehold.address}</p>
            </div>
          )}

          {initialHousehold.postcode && (
            <div>
              <p className="text-sm text-bold text-upper mb-sm">Postcode</p>
              <p className="text-md">{initialHousehold.postcode}</p>
            </div>
          )}

          {initialHousehold.wifiName && (
            <div>
              <p className="text-sm text-bold text-upper mb-sm">WiFi Name</p>
              <p className="text-md">{initialHousehold.wifiName}</p>
            </div>
          )}

          {initialHousehold.wifiPassword && (
            <div>
              <p className="text-sm text-bold text-upper mb-sm">WiFi Password</p>
              <div className="flex gap-sm">
                <p className="text-md" style={{ fontFamily: 'monospace' }}>
                  {showWifiPassword ? initialHousehold.wifiPassword : '••••••••'}
                </p>
                <button
                  onClick={() => setShowWifiPassword(!showWifiPassword)}
                  className="btn btn-secondary"
                  style={{ padding: '4px 8px', fontSize: '10px' }}
                >
                  {showWifiPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          )}

          {initialHousehold.binCollection && (
            <div style={{ gridColumn: '1 / -1' }}>
              <p className="text-sm text-bold text-upper mb-sm">Bin Collection</p>
              <p className="text-md" style={{ whiteSpace: 'pre-wrap' }}>{initialHousehold.binCollection}</p>
            </div>
          )}

          {initialHousehold.emergencyContacts && (
            <div style={{ gridColumn: '1 / -1' }}>
              <p className="text-sm text-bold text-upper mb-sm">Emergency Contacts</p>
              <p className="text-md" style={{ whiteSpace: 'pre-wrap' }}>{initialHousehold.emergencyContacts}</p>
            </div>
          )}

          {initialHousehold.notes && (
            <div style={{ gridColumn: '1 / -1' }}>
              <p className="text-sm text-bold text-upper mb-sm">Notes</p>
              <p className="text-md" style={{ whiteSpace: 'pre-wrap' }}>{initialHousehold.notes}</p>
            </div>
          )}

          {!initialHousehold.address && !initialHousehold.postcode && !initialHousehold.wifiName &&
           !initialHousehold.wifiPassword && !initialHousehold.binCollection &&
           !initialHousehold.emergencyContacts && !initialHousehold.notes && (
            <p className="text-muted" style={{ gridColumn: '1 / -1' }}>
              No household info yet. Click "Edit Info" to add details.
            </p>
          )}
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
              <div className="flex gap-sm">
                <span className="badge">{member.role}</span>
                {member.role === 'member' && (
                  <button
                    onClick={async () => {
                      if (!confirm(`Promote ${member.name} to admin?`)) return

                      try {
                        const res = await fetch(
                          `${process.env.NEXT_PUBLIC_API_URL}/api/households/${initialHousehold.id}/members/${member.id}/promote`,
                          {
                            method: 'PATCH',
                            credentials: 'include',
                          }
                        )

                        if (!res.ok) {
                          const data = await res.json()
                          throw new Error(data.error || 'Failed to promote member')
                        }

                        router.refresh()
                      } catch (err: any) {
                        alert(err.message)
                      }
                    }}
                    className="btn btn-primary"
                    style={{ padding: '4px 8px', fontSize: '10px' }}
                  >
                    Promote
                  </button>
                )}
              </div>
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

      {/* Edit Household Info Modal */}
      {showEditInfo && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title">Edit Household Info</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)

                try {
                  const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/households/${initialHousehold.id}/info`,
                    {
                      method: 'PATCH',
                      credentials: 'include',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        address: formData.get('address') || undefined,
                        postcode: formData.get('postcode') || undefined,
                        wifiName: formData.get('wifiName') || undefined,
                        wifiPassword: formData.get('wifiPassword') || undefined,
                        binCollection: formData.get('binCollection') || undefined,
                        emergencyContacts: formData.get('emergencyContacts') || undefined,
                        notes: formData.get('notes') || undefined,
                      }),
                    }
                  )

                  if (!res.ok) {
                    throw new Error('Failed to update household info')
                  }

                  setShowEditInfo(false)
                  router.refresh()
                } catch (err: any) {
                  setError(err.message)
                }
              }}
            >
              <div className="form-group">
                <label htmlFor="address" className="form-label">Address</label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  defaultValue={initialHousehold.address || ''}
                  className="form-input"
                  placeholder="123 Main St"
                />
              </div>

              <div className="form-group">
                <label htmlFor="postcode" className="form-label">Postcode</label>
                <input
                  id="postcode"
                  name="postcode"
                  type="text"
                  defaultValue={initialHousehold.postcode || ''}
                  className="form-input"
                  placeholder="SW1A 1AA"
                />
              </div>

              <div className="form-group">
                <label htmlFor="wifiName" className="form-label">WiFi Name</label>
                <input
                  id="wifiName"
                  name="wifiName"
                  type="text"
                  defaultValue={initialHousehold.wifiName || ''}
                  className="form-input"
                  placeholder="MyWiFi"
                />
              </div>

              <div className="form-group">
                <label htmlFor="wifiPassword" className="form-label">WiFi Password</label>
                <input
                  id="wifiPassword"
                  name="wifiPassword"
                  type="text"
                  defaultValue={initialHousehold.wifiPassword || ''}
                  className="form-input"
                  placeholder="password123"
                />
              </div>

              <div className="form-group">
                <label htmlFor="binCollection" className="form-label">Bin Collection</label>
                <textarea
                  id="binCollection"
                  name="binCollection"
                  defaultValue={initialHousehold.binCollection || ''}
                  className="form-input"
                  placeholder="Grey bin every 2 weeks Thursday&#10;Green bin alternating Thursdays"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label htmlFor="emergencyContacts" className="form-label">Emergency Contacts</label>
                <textarea
                  id="emergencyContacts"
                  name="emergencyContacts"
                  defaultValue={initialHousehold.emergencyContacts || ''}
                  className="form-input"
                  placeholder="Landlord: 07123 456789&#10;Plumber: 07987 654321"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes" className="form-label">General Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  defaultValue={initialHousehold.notes || ''}
                  className="form-input"
                  placeholder="Any other useful information..."
                  rows={3}
                />
              </div>

              {error && <div className="error">{error}</div>}

              <div className="grid grid-2 gap-md mt-md">
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditInfo(false)
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
