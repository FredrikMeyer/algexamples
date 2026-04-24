import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'

export function SearchBox() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    navigate({
      to: '/search',
      search: q ? { q } : {},
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search…"
        className="w-full rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2"
        style={{
          background: '#312e81',
          border: '1px solid #4338ca',
          color: '#e0e7ff',
          colorScheme: 'dark',
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = '#818cf8')}
        onBlur={(e) => (e.currentTarget.style.borderColor = '#4338ca')}
      />
    </form>
  )
}
