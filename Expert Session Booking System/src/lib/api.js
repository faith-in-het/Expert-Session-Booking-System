export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export const apiUrl = (path) => `${API_BASE}${path}`

export async function fetchJson(path, options = {}) {
  const response = await fetch(apiUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  const raw = await response.text()
  let data = {}

  if (raw) {
    try {
      data = JSON.parse(raw)
    } catch {
      data = {}
    }
  }

  if (!response.ok) {
    throw new Error(data.message || 'Request failed')
  }

  return data
}
