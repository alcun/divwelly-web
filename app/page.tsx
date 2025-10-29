import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="full-height" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="container-sm text-center">
        <div style={{
          display: 'inline-block',
          border: '2px solid #10b981',
          padding: '0.25rem 0.75rem',
          marginBottom: '2rem',
          textTransform: 'uppercase',
          fontSize: '0.75rem',
          letterSpacing: '0.1em'
        }}>
          Beta
        </div>

        <h1 style={{ fontSize: '3.5rem', marginBottom: '4rem' }}>DIVWELLY</h1>
        <p className="text-lg text-muted mb-xl">
          Household expense splitting for flatmates.
        </p>

        <Link href="/login" className="btn btn-primary" style={{ fontSize: '1.25rem', padding: '1rem 2rem' }}>
          Sign In
        </Link>
      </div>
    </div>
  )
}
