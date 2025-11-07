'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from '@tanstack/react-form'
import Link from 'next/link'
import { toast } from 'sonner'

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
  notes: string | null
  isActive: boolean
  lastGenerated: string | null
}

type RecurringBillPayment = {
  id: string
  month: string
  paidAt: string | null
  user: {
    id: string
    name: string
    email: string
  }
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
  currentUserId?: string
  currentUserRole?: string
}

export default function HouseholdClient({
  initialHousehold,
  initialMembers,
  initialExpenses,
  initialBalances,
  currentUserId,
  currentUserRole = 'member',
}: HouseholdClientProps) {
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>(initialMembers)
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
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingHouseholdData, setLoadingHouseholdData] = useState(false)
  const [paymentLoadingStates, setPaymentLoadingStates] = useState<Record<string, boolean>>({})
  const [recurringBillPayments, setRecurringBillPayments] = useState<Record<string, RecurringBillPayment[]>>({})
  const [expandedRecurringBill, setExpandedRecurringBill] = useState<string | null>(null)

  // Load recurring expenses on mount
  useEffect(() => {
    loadRecurringExpenses()
  }, [])

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
    // Set loading state
    setPaymentLoadingStates(prev => ({ ...prev, [paymentId]: true }))

    // Optimistic update
    const previousPayments = expensePayments[expenseId]
    setExpensePayments(prev => ({
      ...prev,
      [expenseId]: prev[expenseId].map(p =>
        p.id === paymentId ? { ...p, isPaid: true, paidAt: new Date().toISOString() } : p
      )
    }))

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

      // Reload balances in background
      const balancesRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/households/${initialHousehold.id}/balances`,
        { credentials: 'include' }
      )
      if (balancesRes.ok) {
        const balancesData = await balancesRes.json()
        setBalances(balancesData.balances || [])
      }

      toast.success('Payment marked as paid')
    } catch (err: any) {
      // Rollback on error
      setExpensePayments(prev => ({
        ...prev,
        [expenseId]: previousPayments
      }))
      toast.error(err.message || 'Failed to mark as paid')
    } finally {
      setPaymentLoadingStates(prev => ({ ...prev, [paymentId]: false }))
    }
  }

  const deleteExpense = async (expenseId: string) => {
    if (!confirm('Delete this expense? This will remove all payment records.')) return

    setIsSubmitting(true)
    // Optimistic update
    const previousExpenses = expenses
    setExpenses(expenses.filter(e => e.id !== expenseId))
    setExpandedExpense(null)

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/expenses/${expenseId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      )

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete expense')
      }

      // Reload balances in background
      const balancesRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/households/${initialHousehold.id}/balances`,
        { credentials: 'include' }
      )
      if (balancesRes.ok) {
        const balancesData = await balancesRes.json()
        setBalances(balancesData.balances || [])
      }

      toast.success('Expense deleted successfully')
    } catch (err: any) {
      // Rollback
      setExpenses(previousExpenses)
      toast.error(err.message || 'Failed to delete expense')
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateExpense = async (expenseId: string, description: string, amount: string, dueDate: string) => {
    setIsSubmitting(true)
    // Optimistic update
    const previousExpenses = expenses
    setExpenses(expenses.map(e =>
      e.id === expenseId
        ? { ...e, description, amount: (parseFloat(amount) * 100).toString(), dueDate: dueDate || null }
        : e
    ))
    setEditingExpense(null)

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/expenses/${expenseId}`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description,
            amount: parseFloat(amount),
            dueDate: dueDate ? new Date(dueDate).toISOString() : null,
          }),
        }
      )

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update expense')
      }

      toast.success('Expense updated successfully')
    } catch (err: any) {
      // Rollback
      setExpenses(previousExpenses)
      setEditingExpense(editingExpense)
      toast.error(err.message || 'Failed to update expense')
    } finally {
      setIsSubmitting(false)
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

  const loadRecurringBillPayments = async (recurringExpenseId: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/recurring-expenses/${recurringExpenseId}/payments`,
        { credentials: 'include' }
      )
      if (res.ok) {
        const data = await res.json()
        setRecurringBillPayments(prev => ({
          ...prev,
          [recurringExpenseId]: data.payments?.map((p: any) => ({
            id: p.payment.id,
            month: p.payment.month,
            paidAt: p.payment.paidAt,
            user: p.user,
          })) || []
        }))
      }
    } catch (err) {
      console.error('Error loading recurring bill payments:', err)
    }
  }

  const markRecurringBillPaid = async (recurringExpenseId: string, userId?: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/recurring-expenses/${recurringExpenseId}/mark-paid`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        }
      )

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to mark as paid')
      }

      // Reload payments
      await loadRecurringBillPayments(recurringExpenseId)
      toast.success('Marked as paid')
    } catch (err: any) {
      toast.error(err.message || 'Failed to mark as paid')
    }
  }

  const toggleRecurringBillExpanded = async (recurringExpenseId: string) => {
    if (expandedRecurringBill === recurringExpenseId) {
      setExpandedRecurringBill(null)
    } else {
      setExpandedRecurringBill(recurringExpenseId)
      await loadRecurringBillPayments(recurringExpenseId)
    }
  }

  const deleteRecurringExpense = async (id: string) => {
    if (!confirm('Delete this recurring expense?')) return

    setIsSubmitting(true)
    const previousRecurring = recurringExpenses
    setRecurringExpenses(recurringExpenses.filter(r => r.id !== id))

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

      toast.success('Recurring bill deleted')
    } catch (err: any) {
      setRecurringExpenses(previousRecurring)
      toast.error(err.message || 'Failed to delete recurring bill')
    } finally {
      setIsSubmitting(false)
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
      notes: '',
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
              notes: value.notes || undefined,
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

  const getDaySuffix = (day: number) => {
    if (day > 3 && day < 21) return 'th'
    switch (day % 10) {
      case 1: return 'st'
      case 2: return 'nd'
      case 3: return 'rd'
      default: return 'th'
    }
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
            <h1 className="mb-sm">🏡 {initialHousehold.name}</h1>
            <p className="text-sm text-muted">Invite Code: {initialHousehold.inviteCode}</p>
          </div>
          <div className="flex gap-sm">
            <button
              onClick={() => setShowAddExpense(true)}
              className="btn btn-primary"
            >
              Add Expense
            </button>
          </div>
        </div>
      </div>

      {/* Recurring Bills - Front and Center */}
      {recurringExpenses.length > 0 && (
        <div className="card" style={{ border: '3px solid var(--accent)' }}>
          <div className="card-header">
            <div className="flex-between">
              <h2>Your Recurring Bills</h2>
              {currentUserRole === 'admin' && (
                <button
                  onClick={() => setShowAddRecurring(true)}
                  className="btn btn-secondary"
                >
                  Add Bill
                </button>
              )}
            </div>
          </div>
          <div>
            {recurringExpenses.map((recurring) => {
              const yourShare = recurring.amount / members.length
              const isExpanded = expandedRecurringBill === recurring.id
              const payments = recurringBillPayments[recurring.id] || []

              // Get current month (YYYY-MM-01)
              const now = new Date()
              const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

              // Filter current month payments
              const currentMonthPayments = payments.filter(p => {
                const paymentMonth = new Date(p.month)
                return paymentMonth.getFullYear() === now.getFullYear() &&
                       paymentMonth.getMonth() === now.getMonth()
              })

              return (
                <div key={recurring.id} className="list-item" style={{ flexDirection: 'column', alignItems: 'stretch', cursor: 'pointer' }} onClick={() => toggleRecurringBillExpanded(recurring.id)}>
                  <div className="flex-between mb-sm">
                    <div>
                      <p className="text-bold" style={{ fontSize: '18px' }}>{recurring.description}</p>
                      <p className="text-sm text-muted">
                        {recurring.frequency.charAt(0).toUpperCase() + recurring.frequency.slice(1)}
                        {recurring.dayOfMonth && ` • Due ${recurring.dayOfMonth}${getDaySuffix(recurring.dayOfMonth)} of each month`}
                      </p>
                    </div>
                    <div className="flex gap-sm" style={{ alignItems: 'center' }}>
                      {currentUserRole === 'admin' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteRecurringExpense(recurring.id)
                          }}
                          className="btn btn-secondary"
                          style={{ padding: '4px 12px', fontSize: '10px' }}
                        >
                          Delete
                        </button>
                      )}
                      <span style={{ fontSize: '12px' }}>{isExpanded ? '▼' : '▶'}</span>
                    </div>
                  </div>

                  <div style={{ padding: '16px', background: '#f9f9f9', border: '2px solid #000' }}>
                    <div className="flex-between mb-sm">
                      <div>
                        <p className="text-sm text-muted">Total Bill</p>
                        <p className="text-bold" style={{ fontSize: '16px' }}>£{(recurring.amount / 100).toFixed(2)}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p className="text-sm text-muted">Your Share</p>
                        <p className="text-bold" style={{ fontSize: '20px', color: 'var(--accent)' }}>£{(yourShare / 100).toFixed(2)}</p>
                      </div>
                    </div>

                    {recurring.notes && (
                      <div style={{ paddingTop: '12px', borderTop: '1px solid #ddd', marginBottom: '12px' }}>
                        <p className="text-sm text-bold text-upper mb-sm">Payment Info</p>
                        <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{recurring.notes}</p>
                      </div>
                    )}

                    {isExpanded && (
                      <div style={{ paddingTop: '12px', borderTop: '1px solid #ddd' }}>
                        <p className="text-sm text-bold text-upper mb-sm">
                          {new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                        </p>
                        <div style={{ display: 'grid', gap: '8px' }}>
                          {members.map(member => {
                            const payment = currentMonthPayments.find(p => p.user.id === member.id)
                            const isPaid = payment?.paidAt
                            const isCurrentUser = member.id === currentUserId

                            return (
                              <div key={member.id} className="flex-between" style={{ padding: '8px', background: '#fff', border: '1px solid #ddd' }}>
                                <div>
                                  <p className="text-sm text-bold">{member.name}</p>
                                  <p className="text-sm text-muted">£{(yourShare / 100).toFixed(2)}</p>
                                  {isPaid && payment?.paidAt && (
                                    <p className="text-sm text-muted">Paid {new Date(payment.paidAt).toLocaleDateString()}</p>
                                  )}
                                </div>
                                <div>
                                  {isPaid ? (
                                    <span className="badge" style={{ background: 'var(--accent)' }}>✓ PAID</span>
                                  ) : isCurrentUser ? (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        markRecurringBillPaid(recurring.id)
                                      }}
                                      className="btn btn-primary"
                                      style={{ padding: '4px 12px', fontSize: '10px' }}
                                    >
                                      Mark as Paid
                                    </button>
                                  ) : currentUserRole === 'admin' ? (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        markRecurringBillPaid(recurring.id, member.id)
                                      }}
                                      className="btn btn-secondary"
                                      style={{ padding: '4px 12px', fontSize: '10px' }}
                                    >
                                      Mark {member.name.split(' ')[0]} Paid
                                    </button>
                                  ) : (
                                    <span className="badge" style={{ background: '#ccc' }}>UNPAID</span>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {recurringExpenses.length === 0 && currentUserRole === 'admin' && (
        <div className="card" style={{ border: '2px dashed #ccc', background: '#f9f9f9' }}>
          <div className="text-center" style={{ padding: '24px' }}>
            <p className="text-bold mb-sm">No recurring bills yet</p>
            <p className="text-sm text-muted mb-md">Set up bills like rent, council tax, and utilities so everyone knows what they owe each month.</p>
            <button
              onClick={() => setShowAddRecurring(true)}
              className="btn btn-primary"
            >
              Add Your First Bill
            </button>
          </div>
        </div>
      )}

      {/* Household Info */}
      <div className="card">
        <div className="card-header">
          <div className="flex-between">
            <h2>Household Info</h2>
            {currentUserRole === 'admin' && (
              <button onClick={() => setShowEditInfo(true)} className="btn btn-secondary">
                Edit Info
              </button>
            )}
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
                {currentUserRole === 'admin' && member.role === 'member' && (
                  <button
                    onClick={async () => {
                      if (!confirm(`Promote ${member.name} to admin?`)) return

                      const previousMembers = members
                      setMembers(members.map(m =>
                        m.id === member.id ? { ...m, role: 'admin' } : m
                      ))

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

                        toast.success(`${member.name} promoted to admin`)
                      } catch (err: any) {
                        setMembers(previousMembers)
                        toast.error(err.message || 'Failed to promote member')
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
                        Created by {expense.paidByName} • {new Date(expense.createdAt).toLocaleDateString()}
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
                                {!payment.isPaid && payment.user.id === currentUserId && (
                                  <button
                                    onClick={() => markAsPaid(expense.id, payment.id)}
                                    disabled={paymentLoadingStates[payment.id]}
                                    className="btn btn-primary"
                                    style={{ padding: '4px 12px', fontSize: '10px' }}
                                  >
                                    {paymentLoadingStates[payment.id] ? 'Marking...' : 'Mark as Paid'}
                                  </button>
                                )}
                                {!payment.isPaid && payment.user.id !== currentUserId && (
                                  <span className="badge" style={{ background: '#ccc' }}>UNPAID</span>
                                )}
                                {payment.isPaid && (
                                  <span className="badge" style={{ background: 'var(--accent)' }}>PAID</span>
                                )}
                              </div>
                            ))}
                          </div>
                          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #ddd', display: 'flex', gap: '8px' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingExpense(expense)
                              }}
                              className="btn btn-secondary"
                              style={{ padding: '4px 12px', fontSize: '10px' }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteExpense(expense.id)
                              }}
                              className="btn btn-secondary"
                              style={{ padding: '4px 12px', fontSize: '10px', background: '#dc3545', color: 'white' }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm text-muted mb-sm">No payment records found</p>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingExpense(expense)
                              }}
                              className="btn btn-secondary"
                              style={{ padding: '4px 12px', fontSize: '10px' }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteExpense(expense.id)
                              }}
                              className="btn btn-secondary"
                              style={{ padding: '4px 12px', fontSize: '10px', background: '#dc3545', color: 'white' }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
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
                  disabled={isSubmitting}
                  className="btn btn-primary"
                >
                  {isSubmitting ? 'Adding...' : 'Add Expense'}
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
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
                setIsSubmitting(true)

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
                  setError('')
                  toast.success('Household info updated')
                  router.refresh() // Keep this one as it's for household meta info
                } catch (err: any) {
                  setError(err.message)
                  toast.error(err.message || 'Failed to update household info')
                } finally {
                  setIsSubmitting(false)
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

              <recurringForm.Field name="notes">
                {(field) => (
                  <div className="form-group">
                    <label htmlFor="recurring-notes" className="form-label">
                      Notes (Optional)
                    </label>
                    <textarea
                      id="recurring-notes"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="form-input"
                      placeholder="e.g. 'Pay to John's account', 'Reference: Rent', 'Due: 6th of month'"
                      rows={3}
                    />
                    <p className="text-sm text-muted" style={{ marginTop: '4px' }}>
                      Add payment instructions, account details, or reference info
                    </p>
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

      {/* Edit Expense Modal */}
      {editingExpense && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title">Edit Expense</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                updateExpense(
                  editingExpense.id,
                  formData.get('description') as string,
                  formData.get('amount') as string,
                  formData.get('dueDate') as string
                )
              }}
            >
              <div className="form-group">
                <label htmlFor="edit-description" className="form-label">
                  Description
                </label>
                <input
                  id="edit-description"
                  name="description"
                  type="text"
                  required
                  defaultValue={editingExpense.description}
                  className="form-input"
                  placeholder="e.g. Groceries, Rent, Electricity"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-amount" className="form-label">
                  Amount (£)
                </label>
                <input
                  id="edit-amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  required
                  defaultValue={(parseFloat(editingExpense.amount) / 100).toFixed(2)}
                  className="form-input"
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-dueDate" className="form-label">
                  Due Date (Optional)
                </label>
                <input
                  id="edit-dueDate"
                  name="dueDate"
                  type="date"
                  defaultValue={editingExpense.dueDate ? new Date(editingExpense.dueDate).toISOString().split('T')[0] : ''}
                  className="form-input"
                />
              </div>

              {error && <div className="error">{error}</div>}

              <div className="grid grid-2 gap-md mt-md">
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingExpense(null)
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
