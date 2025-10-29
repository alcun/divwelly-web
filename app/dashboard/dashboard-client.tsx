'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from '@tanstack/react-form'
import Link from 'next/link'
import { logout } from '@/lib/auth-actions'

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

  const refreshHouseholds = () => {
    router.refresh()
  }

  const handleLogout = async () => {
    await logout()
  }

  const createForm = useForm({
    defaultValues: {
      name: '',
    },
    onSubmit: async ({ value }) => {
      setError('')
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

        setShowCreateModal(false)
        createForm.reset()
        refreshHouseholds()
      } catch (err: any) {
        setError(err.message)
      }
    },
  })

  const joinForm = useForm({
    defaultValues: {
      inviteCode: '',
    },
    onSubmit: async ({ value }) => {
      setError('')
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

        setShowJoinModal(false)
        joinForm.reset()
        refreshHouseholds()
      } catch (err: any) {
        setError(err.message)
      }
    },
  })

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Divwelly</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
          >
            Logout
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Your Households</h2>
          
          {households.length === 0 ? (
            <p className="text-gray-600">No households yet. Create one or join with an invite code.</p>
          ) : (
            <div className="space-y-4">
              {households.map(({ household, member }) => (
                <Link 
                  key={household.id} 
                  href={`/household/${household.id}`}
                  className="block border border-gray-200 rounded p-4 hover:border-blue-500 hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{household.name}</h3>
                      <p className="text-sm text-gray-600">
                        Role: {member.role} • Code: {household.inviteCode}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-6 flex gap-4">
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create Household
            </button>
            <button 
              onClick={() => setShowJoinModal(true)}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Join with Code
            </button>
          </div>
        </div>
      </div>

      {/* Create Household Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Create Household</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                createForm.handleSubmit()
              }}
            >
              <createForm.Field name="name">
                {(field) => (
                  <div className="mb-4">
                    <label htmlFor="householdName" className="block text-sm font-medium text-gray-700 mb-1">
                      Household Name
                    </label>
                    <input
                      id="householdName"
                      type="text"
                      required
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="e.g. Flat 42, Smith Family"
                    />
                  </div>
                )}
              </createForm.Field>

              {error && (
                <div className="mb-4 text-red-600 text-sm">{error}</div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    createForm.reset()
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

      {/* Join Household Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Join Household</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                joinForm.handleSubmit()
              }}
            >
              <joinForm.Field name="inviteCode">
                {(field) => (
                  <div className="mb-4">
                    <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 mb-1">
                      Invite Code
                    </label>
                    <input
                      id="inviteCode"
                      type="text"
                      required
                      maxLength={6}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-lg tracking-wider"
                      placeholder="ABC123"
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter the 6-character code</p>
                  </div>
                )}
              </joinForm.Field>

              {error && (
                <div className="mb-4 text-red-600 text-sm">{error}</div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Join
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowJoinModal(false)
                    joinForm.reset()
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