import { useEffect, useState } from 'react'
import { fetchJson } from '../lib/api'

const PAGE_SIZE = 6

function ExpertList({ onSelectExpert }) {
  const [experts, setExperts] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadExperts = async () => {
    setLoading(true)
    setError('')

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      })

      if (search.trim()) {
        params.set('search', search.trim())
      }

      if (category) {
        params.set('category', category)
      }

      const data = await fetchJson(`/api/experts?${params.toString()}`)
      setExperts(data.data || [])
      setMeta({
        total: data.total || 0,
        page: data.page || 1,
        pages: data.pages || 1,
      })
      setCategories(data.categories || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadExperts()
  }, [search, category, page])

  const handleSearchChange = (event) => {
    setSearch(event.target.value)
    setPage(1)
  }

  const handleCategoryChange = (event) => {
    setCategory(event.target.value)
    setPage(1)
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Expert Listing</h2>
          <p className="muted">Search by name and filter by category.</p>
        </div>
        <div className="panel-controls">
          <input
            className="text-input"
            placeholder="Search expert name"
            value={search}
            onChange={handleSearchChange}
          />
          <select
            className="select-input"
            value={category}
            onChange={handleCategoryChange}
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && <p className="state">Loading experts...</p>}
      {error && (
        <div className="state error">
          <p>{error}</p>
          <button className="secondary" type="button" onClick={loadExperts}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && experts.length === 0 && (
        <p className="state">No experts match your search.</p>
      )}

      <div className="card-grid">
        {experts.map((expert) => (
          <article key={expert._id} className="card">
            <div className="card-header">
              <div>
                <h3>{expert.name}</h3>
                <p className="muted">{expert.title}</p>
              </div>
              <span className="pill">{expert.category}</span>
            </div>
            <div className="card-body">
              <div>
                <p className="label">Experience</p>
                <p className="value">{expert.experienceYears} years</p>
              </div>
              <div>
                <p className="label">Rating</p>
                <p className="value">{expert.rating}</p>
              </div>
            </div>
            <button
              className="primary"
              type="button"
              onClick={() => onSelectExpert(expert._id)}
            >
              View details
            </button>
          </article>
        ))}
      </div>

      <div className="pagination">
        <button
          className="secondary"
          type="button"
          disabled={meta.page <= 1}
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
        >
          Previous
        </button>
        <span className="muted">
          Page {meta.page} of {meta.pages}
        </span>
        <button
          className="secondary"
          type="button"
          disabled={meta.page >= meta.pages}
          onClick={() => setPage((prev) => Math.min(meta.pages, prev + 1))}
        >
          Next
        </button>
      </div>
    </section>
  )
}

export default ExpertList
