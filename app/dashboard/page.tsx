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
                <div key={household.id} className="border border-gray-200 rounded p-4">
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
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Create Household
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
              Join with Code
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}