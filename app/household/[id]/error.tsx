'use client'

import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="container">
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <h2 style={{ marginBottom: '16px' }}>Something went wrong!</h2>
        <p style={{ marginBottom: '24px', color: '#666' }}>
          {error.message || 'An error occurred while loading the household.'}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={reset}
            className="btn btn-primary"
          >
            Try again
          </button>
          <Link href="/dashboard" className="btn btn-secondary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
