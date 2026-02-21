import { useMemo, useState } from 'react'
import ExpertList from './components/ExpertList.jsx'
import ExpertDetail from './components/ExpertDetail.jsx'
import BookingForm from './components/BookingForm.jsx'
import MyBookings from './components/MyBookings.jsx'
import './App.css'

const VIEWS = [
  { id: 'list', label: 'Experts' },
  { id: 'detail', label: 'Expert Detail' },
  { id: 'booking', label: 'Book Session' },
  { id: 'bookings', label: 'My Bookings' },
]

function App() {
  const [view, setView] = useState('list')
  const [selectedExpertId, setSelectedExpertId] = useState(null)
  const [preselectedSlot, setPreselectedSlot] = useState(null)

  const heroCopy = useMemo(() => {
    if (view === 'booking') {
      return 'Lock in a focused session with the exact expert you need.'
    }
    if (view === 'bookings') {
      return 'Keep your sessions organized and track every booking status.'
    }
    if (view === 'detail') {
      return 'Explore expertise, availability, and book a slot in seconds.'
    }
    return 'Find the right expert fast and book with confidence.'
  }, [view])

  const handleSelectExpert = (expertId) => {
    setSelectedExpertId(expertId)
    setView('detail')
  }

  const handleBookSlot = (expertId, date, timeSlot) => {
    setSelectedExpertId(expertId)
    setPreselectedSlot({ date, timeSlot })
    setView('booking')
  }

  const handleNavigate = (nextView) => {
    setView(nextView)
    if (nextView !== 'booking') {
      setPreselectedSlot(null)
    }
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">ES</span>
          <div>
            <p className="brand-title">Expert Sessions</p>
            <p className="brand-subtitle">Precision booking platform</p>
          </div>
        </div>
        <nav className="app-nav">
          {VIEWS.map((item) => (
            <button
              key={item.id}
              className={view === item.id ? 'nav-button active' : 'nav-button'}
              onClick={() => handleNavigate(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">FEB 20, 2026</p>
          <h1>Book expert time without the back-and-forth.</h1>
          <p className="hero-copy">{heroCopy}</p>
        </div>
        <div className="hero-card">
          <p className="hero-card-title">Live availability</p>
          <p className="hero-card-copy">
            Every slot updates in real time. No double bookings, no delays.
          </p>
          <div className="hero-metrics">
            <div>
              <p className="metric-label">Avg rating</p>
              <p className="metric-value">4.9</p>
            </div>
            <div>
              <p className="metric-label">Active experts</p>
              <p className="metric-value">18</p>
            </div>
          </div>
        </div>
      </section>

      <main className="app-main">
        {view === 'list' && <ExpertList onSelectExpert={handleSelectExpert} />}
        {view === 'detail' && (
          <ExpertDetail
            expertId={selectedExpertId}
            onBookSlot={handleBookSlot}
            onBack={() => handleNavigate('list')}
          />
        )}
        {view === 'booking' && (
          <BookingForm
            expertId={selectedExpertId}
            preselectedSlot={preselectedSlot}
            onBooked={() => handleNavigate('bookings')}
          />
        )}
        {view === 'bookings' && <MyBookings />}
      </main>
    </div>
  )
}

export default App
