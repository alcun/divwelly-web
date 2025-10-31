'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from '@tanstack/react-form'
import Link from 'next/link'
import { logout } from '@/lib/auth-actions'
import { toast } from 'sonner'

type Household = {
  household: {
    id: string
    name: string
    inviteCode: string
    createdAt: string
  }
  member: {
    role: string
    joinedAt: string
  }
}

type Props = {
  initialHouseholds: Household[]
}

export default function DashboardClient({ initialHouseholds }: Props) {
  const router = useRouter()
  const [households, setHouseholds] = useState<Household[]>(initialHouseholds)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLogout = async () => {
    await logout()
  }

  const createForm = useForm({
    defaultValues: {
      name: '',
    },
    onSubmit: async ({ value }) => {
      setError('')
      setIsSubmitting(true)
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/households`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: value.name }),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Failed to create household')
        }

        const data = await res.json()
        // Optimistic update
        setHouseholds(prev => [...prev, {
          household: data.household,
          member: { role: 'admin', joinedAt: new Date().toISOString() }
        }])

        setShowCreateModal(false)
        createForm.reset()
        toast.success('Household created successfully')
      } catch (err: any) {
        setError(err.message)
        toast.error(err.message || 'Failed to create household')
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  const joinForm = useForm({
    defaultValues: {
      inviteCode: '',
    },
    onSubmit: async ({ value }) => {
      setError('')
      setIsSubmitting(true)
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/households/join`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inviteCode: value.inviteCode.toUpperCase() }),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Failed to join household')
        }

        const data = await res.json()
        // Optimistic update
        setHouseholds(prev => [...prev, {
          household: data.household,
          member: { role: 'member', joinedAt: new Date().toISOString() }
        }])

        setShowJoinModal(false)
        joinForm.reset()
        toast.success(`Joined ${data.household.name}`)
      } catch (err: any) {
        setError(err.message)
        toast.error(err.message || 'Failed to join household')
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  return (
    <div className="container">
      <div className="flex-between mb-lg">
        <h1>Divwelly</h1>
        <button
          onClick={handleLogout}
          className="btn btn-secondary"
        >
          Logout
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Your Households</h2>
        </div>

        {households.length === 0 ? (
          <p className="text-muted mb-lg">No households yet. Create one or join with an invite code.</p>
        ) : (
          <div className="mb-lg">
            {households.map(({ household, member }) => (
              <Link
                key={household.id}
                href={`/household/${household.id}`}
                className="list-item"
              >
                <div className="flex-between">
                  <div>
                    <h3 className="mb-sm">{household.name}</h3>
                    <p className="text-sm text-muted">
                      Role: {member.role} • Code: {household.inviteCode}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="grid grid-2 gap-md">
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            Create Household
          </button>
          <button
            onClick={() => setShowJoinModal(true)}
            className="btn btn-secondary"
          >
            Join with Code
          </button>
        </div>
      </div>

      {/* Create Household Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title">Create Household</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                createForm.handleSubmit()
              }}
            >
              <createForm.Field name="name">
                {(field) => (
                  <div className="form-group">
                    <label htmlFor="householdName" className="form-label">
                      Household Name
                    </label>
                    <input
                      id="householdName"
                      type="text"
                      required
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="form-input"
                      placeholder="e.g. Flat 42, Smith Family"
                    />
                  </div>
                )}
              </createForm.Field>

              {error && <div className="error">{error}</div>}

              <div className="grid grid-2 gap-md mt-md">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                >
                  {isSubmitting ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setShowCreateModal(false)
                    createForm.reset()
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

      {/* Join Household Modal */}
      {showJoinModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title">Join Household</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                joinForm.handleSubmit()
              }}
            >
              <joinForm.Field name="inviteCode">
                {(field) => (
                  <div className="form-group">
                    <label htmlFor="inviteCode" className="form-label">
                      Invite Code
                    </label>
                    <input
                      id="inviteCode"
                      type="text"
                      required
                      maxLength={6}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
                      className="form-input"
                      placeholder="ABC123"
                      style={{ fontFamily: 'inherit', fontSize: '16px', letterSpacing: '2px', textAlign: 'center' }}
                    />
                    <p className="text-sm text-muted mt-sm">Enter the 6-character code</p>
                  </div>
                )}
              </joinForm.Field>

              {error && <div className="error">{error}</div>}

              <div className="grid grid-2 gap-md mt-md">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                >
                  {isSubmitting ? 'Joining...' : 'Join'}
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setShowJoinModal(false)
                    joinForm.reset()
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