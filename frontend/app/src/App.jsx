import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data) => {
        setMessage(data.message)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return (
    <div className="app">
      <section className="hero-section">
        <h1>The Rental Farm</h1>
        <div className="api-card">
          <h2>Backend API Response</h2>
          {loading && <p className="status loading">Connecting to backend...</p>}
          {error && <p className="status error">Error: {error}</p>}
          {message && <p className="status success">{message}</p>}
        </div>
      </section>
    </div>
  )
}

export default App
