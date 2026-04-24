import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'

export function SearchBox() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    navigate({
      to: '/examples/',
      search: q ? { q } : {},
    })
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search examples…"
        className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </form>
  )
}
