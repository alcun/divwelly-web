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
  dueDate?: string | null
}

type Payment = {
  id: string
  amount: number
  isPaid: boolean
  paidAt: string | null
  receiptUrl: string | null
  user: {
    id: string
    name: string
    email: string
  }
}

type Balance = {
  from: string
  to: string
  amount: string
}

type RecurringExpense = {
  id: string
  description: string
  amount: number
  frequency: 'monthly' | 'weekly' | 'yearly'
  startDate: string
  endDate: string | null
  dayOfMonth: number | null
  dayOfWeek: number | null
  isActive: boolean
  lastGenerated: string | null
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
  const [expandedExpense, setExpandedExpense] = useState<string | null>(null)
  const [expensePayments, setExpensePayments] = useState<Record<string, Payment[]>>({})
  const [loadingPayments, setLoadingPayments] = useState<string | null>(null)
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([])
  const [showAddRecurring, setShowAddRecurring] = useState(false)
  const [showRecurringList, setShowRecurringList] = useState(false)

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

  const loadPayments = async (expenseId: string) => {
    if (expensePayments[expenseId]) {
      return // Already loaded
    }

    setLoadingPayments(expenseId)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/expenses/${expenseId}/payments`,
        { credentials: 'include' }
      )
      if (res.ok) {
        const data = await res.json()
        setExpensePayments(prev => ({
          ...prev,
          [expenseId]: data.payments.map((p: any) => ({
            id: p.payment.id,
            amount: p.payment.amount,
            isPaid: p.payment.is_paid,
            paidAt: p.payment.paid_at,
            receiptUrl: p.payment.receipt_url,
            user: p.user,
          }))
        }))
      }
    } catch (err) {
      console.error('Error loading payments:', err)
    } finally {
      setLoadingPayments(null)
    }
  }

  const toggleExpenseExpanded = async (expenseId: string) => {
    if (expandedExpense === expenseId) {
      setExpandedExpense(null)
    } else {
      setExpandedExpense(expenseId)
      await loadPayments(expenseId)
    }
  }

  const markAsPaid = async (expenseId: string, paymentId: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/expenses/${expenseId}/payments/${paymentId}/mark-paid`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        }
      )

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to mark as paid')
      }

      // Reload payments for this expense
      delete expensePayments[expenseId]
      await loadPayments(expenseId)
      await loadHouseholdData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const loadRecurringExpenses = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/recurring-expenses/household/${initialHousehold.id}`,
        { credentials: 'include' }
      )
      if (res.ok) {
        const data = await res.json()
        setRecurringExpenses(data.recurringExpenses || [])
      }
    } catch (err) {
      console.error('Error loading recurring expenses:', err)
    }
  }

  const deleteRecurringExpense = async (id: string) => {
    if (!confirm('Delete this recurring expense?')) return

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/recurring-expenses/${id}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      )

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete')
      }

      await loadRecurringExpenses()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const expenseForm = useForm({
    defaultValues: {
      description: '',
      amount: '',
      dueDate: '',
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
              dueDate: value.dueDate ? new Date(value.dueDate).toISOString() : undefined,
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

  const recurringForm = useForm({
    defaultValues: {
      description: '',
      amount: '',
      frequency: 'monthly' as 'monthly' | 'weekly' | 'yearly',
      dayOfMonth: '',
      startDate: '',
    },
    onSubmit: async ({ value }) => {
      setError('')
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/recurring-expenses`,
          {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              householdId: initialHousehold.id,
              description: value.description,
              amount: parseFloat(value.amount),
              frequency: value.frequency,
              startDate: new Date(value.startDate).toISOString(),
              dayOfMonth: value.frequency === 'monthly' ? parseInt(value.dayOfMonth) : undefined,
            }),
          }
        )

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Failed to add recurring expense')
        }

        await loadRecurringExpenses()
        setShowAddRecurring(false)
        recurringForm.reset()
      } catch (err: any) {
        setError(err.message)
      }
    },
  })

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

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
          <div className="flex gap-sm">
            <button
              onClick={() => {
                setShowRecurringList(true)
                loadRecurringExpenses()
              }}
              className="btn btn-secondary"
            >
              Recurring Bills
            </button>
            <button
              onClick={() => setShowAddExpense(true)}
              className="btn btn-primary"
            >
              Add Expense
            </button>
          </div>
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

      {/* Expenses with Payment Tracking */}
      <div className="card">
        <div className="card-header">
          <h2>Recent Expenses ({expenses.length})</h2>
        </div>
        {expenses.length === 0 ? (
          <p className="text-muted">No expenses yet. Add one above!</p>
        ) : (
          <div>
            {expenses.map((expense) => {
              const isExpanded = expandedExpense === expense.id
              const payments = expensePayments[expense.id] || []

              return (
                <div key={expense.id} className="list-item" style={{ cursor: 'pointer', flexDirection: 'column', alignItems: 'stretch' }}>
                  <div onClick={() => toggleExpenseExpanded(expense.id)} className="flex-between">
                    <div>
                      <p className="text-bold mb-sm">{expense.description}</p>
                      <p className="text-sm text-muted">
                        Paid by {expense.paidByName} • {new Date(expense.createdAt).toLocaleDateString()}
                        {expense.dueDate && ` • Due ${new Date(expense.dueDate).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="flex gap-sm" style={{ alignItems: 'center' }}>
                      <span className="text-bold">£{expense.amount}</span>
                      <span style={{ fontSize: '12px' }}>{isExpanded ? '▼' : '▶'}</span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #ccc' }}>
                      {loadingPayments === expense.id ? (
                        <p className="text-sm text-muted">Loading payment statuses...</p>
                      ) : payments.length > 0 ? (
                        <div>
                          <p className="text-sm text-bold text-upper mb-sm">Payment Status</p>
                          <div style={{ display: 'grid', gap: '8px' }}>
                            {payments.map((payment) => (
                              <div key={payment.id} className="flex-between" style={{ padding: '8px', background: '#f9f9f9', border: '1px solid #ddd' }}>
                                <div>
                                  <p className="text-sm text-bold">
                                    {getInitials(payment.user.name)}: {payment.isPaid ? 'P' : 'O'}£{(payment.amount / 100).toFixed(2)}
                                  </p>
                                  <p className="text-sm text-muted">{payment.user.name}</p>
                                  {payment.paidAt && (
                                    <p className="text-sm text-muted">Paid on {new Date(payment.paidAt).toLocaleDateString()}</p>
                                  )}
                                </div>
                                {!payment.isPaid && (
                                  <button
                                    onClick={() => markAsPaid(expense.id, payment.id)}
                                    className="btn btn-primary"
                                    style={{ padding: '4px 12px', fontSize: '10px' }}
                                  >
                                    Mark as Paid
                                  </button>
                                )}
                                {payment.isPaid && (
                                  <span className="badge" style={{ background: 'var(--accent)' }}>PAID</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted">No payment records found</p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
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

              <expenseForm.Field name="dueDate">
                {(field) => (
                  <div className="form-group">
                    <label htmlFor="dueDate" className="form-label">
                      Due Date (Optional)
                    </label>
                    <input
                      id="dueDate"
                      type="date"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="form-input"
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
                  defaultValue={initialHousehold.wifiPassword || ''}
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

      {/* Recurring Expenses List Modal */}
      {showRecurringList && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title">Recurring Bills</h2>

            {recurringExpenses.length === 0 ? (
              <p className="text-muted mb-md">No recurring bills yet. Add one to auto-generate expenses monthly!</p>
            ) : (
              <div className="mb-md">
                {recurringExpenses.map((recurring) => (
                  <div key={recurring.id} className="list-item flex-between" style={{ cursor: 'default' }}>
                    <div>
                      <p className="text-bold mb-sm">{recurring.description}</p>
                      <p className="text-sm text-muted">
                        £{(recurring.amount / 100).toFixed(2)} • {recurring.frequency}
                        {recurring.dayOfMonth && ` • Day ${recurring.dayOfMonth} of month`}
                      </p>
                      {recurring.lastGenerated && (
                        <p className="text-sm text-muted">
                          Last generated: {new Date(recurring.lastGenerated).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => deleteRecurringExpense(recurring.id)}
                      className="btn btn-secondary"
                      style={{ padding: '4px 12px', fontSize: '10px' }}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-2 gap-md mt-md">
              <button
                onClick={() => {
                  setShowRecurringList(false)
                  setShowAddRecurring(true)
                }}
                className="btn btn-primary"
              >
                Add Recurring Bill
              </button>
              <button
                onClick={() => setShowRecurringList(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Recurring Expense Modal */}
      {showAddRecurring && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title">Add Recurring Bill</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                recurringForm.handleSubmit()
              }}
            >
              <recurringForm.Field name="description">
                {(field) => (
                  <div className="form-group">
                    <label htmlFor="recurring-description" className="form-label">
                      Description
                    </label>
                    <input
                      id="recurring-description"
                      type="text"
                      required
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="form-input"
                      placeholder="e.g. Rent, Council Tax, Internet"
                    />
                  </div>
                )}
              </recurringForm.Field>

              <recurringForm.Field name="amount">
                {(field) => (
                  <div className="form-group">
                    <label htmlFor="recurring-amount" className="form-label">
                      Amount (£)
                    </label>
                    <input
                      id="recurring-amount"
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
              </recurringForm.Field>

              <recurringForm.Field name="frequency">
                {(field) => (
                  <div className="form-group">
                    <label htmlFor="recurring-frequency" className="form-label">
                      Frequency
                    </label>
                    <select
                      id="recurring-frequency"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value as 'monthly' | 'weekly' | 'yearly')}
                      className="form-input"
                      required
                    >
                      <option value="monthly">Monthly</option>
                      <option value="weekly">Weekly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                )}
              </recurringForm.Field>

              <recurringForm.Field name="dayOfMonth">
                {(field) => (
                  <div className="form-group">
                    <label htmlFor="recurring-day" className="form-label">
                      Day of Month (for monthly bills)
                    </label>
                    <input
                      id="recurring-day"
                      type="number"
                      min="1"
                      max="31"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="form-input"
                      placeholder="e.g. 1, 6, 15"
                    />
                    <p className="text-sm text-muted" style={{ marginTop: '4px' }}>
                      Leave blank for weekly/yearly bills
                    </p>
                  </div>
                )}
              </recurringForm.Field>

              <recurringForm.Field name="startDate">
                {(field) => (
                  <div className="form-group">
                    <label htmlFor="recurring-start" className="form-label">
                      Start Date
                    </label>
                    <input
                      id="recurring-start"
                      type="date"
                      required
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="form-input"
                    />
                  </div>
                )}
              </recurringForm.Field>

              {error && <div className="error">{error}</div>}

              <div className="grid grid-2 gap-md mt-md">
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Add Recurring Bill
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddRecurring(false)
                    recurringForm.reset()
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
