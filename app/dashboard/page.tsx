'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

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

export default function DashboardPage() {
  const router = useRouter()
  const [households, setHouseholds] = useState<Household[]>([])
  const [loading, setLoading] = useState(true)
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  
  // Form states
  const [householdName, setHouseholdName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadHouseholds()
  }, [])

  const loadHouseholds = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/households`, {
        credentials: 'include',
      })
      
      if (!res.ok) {
        router.push('/')
        return
      }
      
      const data = await res.json()
      setHouseholds(data.households)
    } catch (err) {
      console.error(err)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateHousehold = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/households`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: householdName }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create household')
      }

      // Reload households and close modal
      await loadHouseholds()
      setShowCreateModal(false)
      setHouseholdName('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleJoinHousehold = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/households/join`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: inviteCode.toUpperCase() }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to join household')
      }

      // Reload households and close modal
      await loadHouseholds()
      setShowJoinModal(false)
      setInviteCode('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Divwelly</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Your Households</h2>
          
          {households.length === 0 ? (
            <p className="text-gray-600">No households yet. Create one or join with an invite code.</p>
          ) : (
            <div className="space-y-4">
              {households.map(({ household, member }) => (
                <div key={household.id} className="border border-gray-200 rounded p-4 hover:border-gray-300 cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{household.name}</h3>
                      <p className="text-sm text-gray-600">
                        Role: {member.role} • Code: {household.inviteCode}
                      </p>
                    </div>
                  </div>
                </div>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Create Household</h2>
            <form onSubmit={handleCreateHousehold}>
              <div className="mb-4">
                <label htmlFor="householdName" className="block text-sm font-medium text-gray-700 mb-1">
                  Household Name
                </label>
                <input
                  id="householdName"
                  type="text"
                  required
                  value={householdName}
                  onChange={(e) => setHouseholdName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g. Flat 42, Smith Family"
                />
              </div>

              {error && (
                <div className="mb-4 text-red-600 text-sm">{error}</div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setHouseholdName('')
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Join Household</h2>
            <form onSubmit={handleJoinHousehold}>
              <div className="mb-4">
                <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Invite Code
                </label>
                <input
                  id="inviteCode"
                  type="text"
                  required
                  maxLength={6}
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-lg tracking-wider"
                  placeholder="ABC123"
                />
                <p className="text-xs text-gray-500 mt-1">Enter the 6-character code</p>
              </div>

              {error && (
                <div className="mb-4 text-red-600 text-sm">{error}</div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting || inviteCode.length !== 6}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Joining...' : 'Join'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowJoinModal(false)
                    setInviteCode('')
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