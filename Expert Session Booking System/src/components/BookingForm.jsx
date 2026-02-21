import { useEffect, useMemo, useState } from 'react'
import { io } from 'socket.io-client'
import { API_BASE, fetchJson } from '../lib/api'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function BookingForm({ expertId, preselectedSlot, onBooked }) {
  const [experts, setExperts] = useState([])
  const [selectedExpertId, setSelectedExpertId] = useState(expertId || '')
  const [availability, setAvailability] = useState([])
  const [selectedDate, setSelectedDate] = useState(preselectedSlot?.date || '')
  const [selectedTime, setSelectedTime] = useState(
    preselectedSlot?.timeSlot || '',
  )
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [detailError, setDetailError] = useState('')

  const loadExperts = async () => {
    try {
      const data = await fetchJson('/api/experts?limit=100&page=1')
      setExperts(data.data || [])
      if (!selectedExpertId && data.data?.length) {
        setSelectedExpertId(data.data[0]._id)
      }
    } catch (err) {
      setDetailError(err.message)
    }
  }

  const loadAvailability = async (expert) => {
    if (!expert) return

    try {
      const data = await fetchJson(`/api/experts/${expert}`)
      setAvailability(data.data?.availability || [])
      setDetailError('')
    } catch (err) {
      setDetailError(err.message)
    }
  }

  useEffect(() => {
    loadExperts()
  }, [])

  useEffect(() => {
    if (!selectedExpertId) return

    loadAvailability(selectedExpertId)
  }, [selectedExpertId])

  useEffect(() => {
    if (!expertId) return

    setSelectedExpertId(expertId)
  }, [expertId])

  useEffect(() => {
    if (preselectedSlot?.date) {
      setSelectedDate(preselectedSlot.date)
      setSelectedTime(preselectedSlot.timeSlot || '')
    }
  }, [preselectedSlot])

  useEffect(() => {
    if (!selectedExpertId) return

    const socket = io(API_BASE, { transports: ['websocket'] })

    socket.on('slotBooked', (payload) => {
      if (!payload || payload.expertId !== selectedExpertId) return

      setAvailability((prev) =>
        prev.map((day) =>
          day.date === payload.date
            ? {
                ...day,
                slots: day.slots.map((slot) =>
                  slot.time === payload.timeSlot
                    ? { ...slot, isBooked: true }
                    : slot,
                ),
              }
            : day,
        ),
      )
    })

    return () => socket.disconnect()
  }, [selectedExpertId])

  const formatDate = (dateStr) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  const availableDates = useMemo(
    () => availability.map((item) => item.date),
    [availability],
  )

  const timeOptions = useMemo(() => {
    const day = availability.find((item) => item.date === selectedDate)
    return day ? day.slots : []
  }, [availability, selectedDate])

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormValues((prev) => ({ ...prev, [name]: value }))
  }

  const validate = () => {
    const nextErrors = {}

    if (!formValues.name.trim()) nextErrors.name = 'Name is required.'
    if (!emailRegex.test(formValues.email)) {
      nextErrors.email = 'Valid email is required.'
    }
    if (!formValues.phone.trim()) nextErrors.phone = 'Phone is required.'
    if (!selectedExpertId) nextErrors.expert = 'Select an expert.'
    if (!selectedDate) nextErrors.date = 'Choose a date.'
    if (!selectedTime) nextErrors.timeSlot = 'Choose a time slot.'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSuccess('')

    if (!validate()) return

    setLoading(true)
    setErrors({})

    try {
      await fetchJson('/api/bookings', {
        method: 'POST',
        body: JSON.stringify({
          expertId: selectedExpertId,
          name: formValues.name,
          email: formValues.email,
          phone: formValues.phone,
          date: selectedDate,
          timeSlot: selectedTime,
          notes: formValues.notes,
        }),
      })

      setSuccess('Booking confirmed. You will receive updates by email.')
      setFormValues({ name: '', email: '', phone: '', notes: '' })
      setSelectedTime('')
      onBooked()
    } catch (err) {
      setErrors({ form: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Book an Expert</h2>
          <p className="muted">Fill in your details and secure a slot.</p>
        </div>
      </div>

      {detailError && <p className="state error">{detailError}</p>}
      {success && <p className="state success">{success}</p>}

      <form className="booking-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="field">
            <span>Name</span>
            <input
              className="text-input"
              name="name"
              value={formValues.name}
              onChange={handleInputChange}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </label>
          <label className="field">
            <span>Email</span>
            <input
              className="text-input"
              name="email"
              value={formValues.email}
              onChange={handleInputChange}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </label>
          <label className="field">
            <span>Phone</span>
            <input
              className="text-input"
              name="phone"
              value={formValues.phone}
              onChange={handleInputChange}
            />
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </label>
          <label className="field">
            <span>Expert</span>
            <select
              className="select-input"
              value={selectedExpertId}
              onChange={(event) => setSelectedExpertId(event.target.value)}
            >
              <option value="">Select expert</option>
              {experts.map((expert) => (
                <option key={expert._id} value={expert._id}>
                  {expert.name} - {expert.category}
                </option>
              ))}
            </select>
            {errors.expert && (
              <span className="error-text">{errors.expert}</span>
            )}
          </label>
          <label className="field">
            <span>Date</span>
            <select
              className="select-input"
              value={selectedDate}
              onChange={(event) => {
                setSelectedDate(event.target.value)
                setSelectedTime('')
              }}
            >
              <option value="">Choose date</option>
              {availableDates.map((date) => (
                <option key={date} value={date}>
                  {formatDate(date)}
                </option>
              ))}
            </select>
            {errors.date && <span className="error-text">{errors.date}</span>}
          </label>
          <label className="field">
            <span>Time Slot</span>
            <select
              className="select-input"
              value={selectedTime}
              onChange={(event) => setSelectedTime(event.target.value)}
              disabled={!selectedDate}
            >
              <option value="">Choose time</option>
              {timeOptions.map((slot) => {
                const slotTime = typeof slot === 'string' ? slot : slot.time
                const isBooked = typeof slot === 'string' ? false : slot.isBooked
                return (
                  <option
                    key={slotTime}
                    value={slotTime}
                    disabled={isBooked}
                  >
                    {slotTime} {isBooked ? '(Booked)' : ''}
                  </option>
                )
              })}
            </select>
            {errors.timeSlot && (
              <span className="error-text">{errors.timeSlot}</span>
            )}
          </label>
          <label className="field field-full">
            <span>Notes</span>
            <textarea
              className="text-input"
              name="notes"
              rows="4"
              value={formValues.notes}
              onChange={handleInputChange}
            />
          </label>
        </div>

        {errors.form && <p className="error-text">{errors.form}</p>}

        <button className="primary" type="submit" disabled={loading}>
          {loading ? 'Booking...' : 'Confirm booking'}
        </button>
      </form>
    </section>
  )
}

export default BookingForm
