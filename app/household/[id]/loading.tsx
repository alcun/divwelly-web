export default function Loading() {
  return (
    <div className="container">
      <div className="mb-lg">
        <div className="skeleton" style={{ width: '120px', height: '24px' }}></div>
      </div>

      <div className="card">
        <div className="flex-between mb-lg">
          <div>
            <div className="skeleton" style={{ width: '200px', height: '32px', marginBottom: '12px' }}></div>
            <div className="skeleton" style={{ width: '150px', height: '16px' }}></div>
          </div>
          <div className="skeleton" style={{ width: '120px', height: '40px' }}></div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="skeleton" style={{ width: '180px', height: '24px' }}></div>
        </div>
        <div style={{ padding: '20px' }}>
          <div className="skeleton" style={{ width: '100%', height: '60px', marginBottom: '12px' }}></div>
          <div className="skeleton" style={{ width: '100%', height: '60px', marginBottom: '12px' }}></div>
          <div className="skeleton" style={{ width: '100%', height: '60px' }}></div>
        </div>
      </div>
    </div>
  )
}
