export default function Loading() {
  return (
    <div className="container">
      <div className="flex-between mb-lg">
        <div className="skeleton" style={{ width: '150px', height: '36px' }}></div>
        <div className="skeleton" style={{ width: '80px', height: '36px' }}></div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="skeleton" style={{ width: '180px', height: '24px' }}></div>
        </div>

        <div style={{ padding: '20px' }}>
          <div className="skeleton" style={{ width: '100%', height: '80px', marginBottom: '12px' }}></div>
          <div className="skeleton" style={{ width: '100%', height: '80px' }}></div>
        </div>
      </div>
    </div>
  )
}
