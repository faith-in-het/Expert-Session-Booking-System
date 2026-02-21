import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { API_BASE, fetchJson } from '../lib/api'

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

function ExpertDetail({ expertId, onBookSlot, onBack }) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadDetail = async () => {
    if (!expertId) return

    setLoading(true)
    setError('')

    try {
      const data = await fetchJson(`/api/experts/${expertId}`)
      setDetail(data.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDetail()
  }, [expertId])

  useEffect(() => {
    if (!expertId) return

    const socket = io(API_BASE, { transports: ['websocket'] })

    socket.on('slotBooked', (payload) => {
      if (!payload || payload.expertId !== expertId) return

      setDetail((prev) => {
        if (!prev) return prev

        const availability = prev.availability.map((day) => {
          if (day.date !== payload.date) return day

          return {
            ...day,
            slots: day.slots.map((slot) =>
              slot.time === payload.timeSlot
                ? { ...slot, isBooked: true }
                : slot,
            ),
          }
        })

        return { ...prev, availability }
      })
    })

    return () => socket.disconnect()
  }, [expertId])

  if (!expertId) {
    return (
      <section className="panel">
        <div className="state">
          <p>Select an expert to view their details.</p>
          <button className="secondary" type="button" onClick={onBack}>
            Back to experts
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Expert Detail</h2>
          <p className="muted">Review profile and live availability.</p>
        </div>
        <button className="ghost" type="button" onClick={onBack}>
          Back to list
        </button>
      </div>

      {loading && <p className="state">Loading expert profile...</p>}
      {error && (
        <div className="state error">
          <p>{error}</p>
          <button className="secondary" type="button" onClick={loadDetail}>
            Retry
          </button>
        </div>
      )}

      {detail && (
        <div className="detail-grid">
          <article className="detail-card">
            <div className="detail-header">
              <div>
                <h3>{detail.name}</h3>
                <p className="muted">{detail.title}</p>
              </div>
              <span className="pill">{detail.category}</span>
            </div>
            <p className="detail-bio">{detail.bio}</p>
            <div className="detail-metrics">
              <div>
                <p className="label">Experience</p>
                <p className="value">{detail.experienceYears} years</p>
              </div>
              <div>
                <p className="label">Rating</p>
                <p className="value">{detail.rating}</p>
              </div>
              <div>
                <p className="label">Languages</p>
                <p className="value">{detail.languages.join(', ')}</p>
              </div>
            </div>
            <div className="tag-row">
              {detail.skills.map((skill) => (
                <span key={skill} className="tag">
                  {skill}
                </span>
              ))}
            </div>
          </article>

          <article className="detail-card">
            <h3>Available time slots</h3>
            <p className="muted">Slots update in real time as they are booked.</p>
            {detail.availability.length === 0 && (
              <p className="state">No upcoming availability.</p>
            )}
            {detail.availability.map((day) => (
              <div key={day.date} className="slot-day">
                <p className="slot-date">{formatDate(day.date)}</p>
                <div className="slot-grid">
                  {day.slots.map((slot) => {
                    const slotTime = typeof slot === 'string' ? slot : slot.time
                    const isBooked = typeof slot === 'string' ? false : slot.isBooked
                    return (
                      <button
                        key={slotTime}
                        type="button"
                        className={isBooked ? 'slot-chip booked' : 'slot-chip'}
                        disabled={isBooked}
                        onClick={() => onBookSlot(detail._id, day.date, slotTime)}
                      >
                        <span>{slotTime}</span>
                        {isBooked ? 'Booked' : 'Book'}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </article>
        </div>
      )}
    </section>
  )
}

export default ExpertDetail
