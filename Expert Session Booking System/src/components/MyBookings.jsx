import { useState } from 'react'
import { fetchJson } from '../lib/api'
import StatusPill from './StatusPill.jsx'

function MyBookings() {
  const [email, setEmail] = useState('')
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadBookings = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const data = await fetchJson(`/api/bookings?email=${email.trim()}`)
      setBookings(data.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>My Bookings</h2>
          <p className="muted">Search by email to see your bookings.</p>
        </div>
      </div>

      <form className="inline-form" onSubmit={loadBookings}>
        <input
          className="text-input"
          placeholder="name@email.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <button className="primary" type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Find bookings'}
        </button>
      </form>

      {error && <p className="state error">{error}</p>}

      {!loading && !error && bookings.length === 0 && (
        <p className="state">No bookings found yet.</p>
      )}

      <div className="card-grid">
        {bookings.map((booking) => (
          <article key={booking._id} className="card">
            <div className="card-header">
              <div>
                <h3>{booking.expert?.name || 'Expert'}</h3>
                <p className="muted">{booking.expert?.category}</p>
              </div>
              <StatusPill status={booking.status} />
            </div>
            <div className="card-body">
              <div>
                <p className="label">Date</p>
                <p className="value">{booking.date}</p>
              </div>
              <div>
                <p className="label">Time</p>
                <p className="value">{booking.timeSlot}</p>
              </div>
            </div>
            <p className="muted">Booked for {booking.name}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default MyBookings
