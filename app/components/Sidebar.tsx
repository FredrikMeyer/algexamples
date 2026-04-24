import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { SearchBox } from './SearchBox'

const FIELDS = [
  { id: 'algebraic-geometry', label: 'Algebraic Geometry' },
  { id: 'commutative-algebra', label: 'Commutative Algebra' },
  { id: 'algebraic-topology', label: 'Algebraic Topology' },
  { id: 'number-theory', label: 'Number Theory' },
  { id: 'complex-geometry', label: 'Complex Geometry' },
] as const

interface SidebarProps {
  allTags: string[]
}

export function Sidebar({ allTags }: SidebarProps) {
  const [open, setOpen] = useState(true)
  const [showAllTags, setShowAllTags] = useState(false)
  const visibleTags = showAllTags ? allTags : allTags.slice(0, 12)

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="md:hidden fixed top-3 left-3 z-50 p-2 bg-indigo-950 text-indigo-200 border border-indigo-800 rounded shadow text-sm"
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle sidebar"
      >
        {open ? '✕' : '☰'}
      </button>

      <aside
        data-open={open}
        className="sidebar fixed md:static top-0 left-0 min-h-screen md:min-h-0 z-40 flex flex-col overflow-hidden flex-shrink-0"
        style={{ background: '#1e1b4b', color: '#c7d2fe' }}
      >
        {/* Header row */}
        <div
          className={`hidden md:flex items-center flex-shrink-0 px-4 py-4 border-b ${
            open ? 'justify-between' : 'justify-center'
          }`}
          style={{ borderColor: '#312e81' }}
        >
          {open && (
            <Link
              to="/"
              className="font-semibold text-white hover:text-indigo-200 truncate tracking-tight"
              style={{ fontFamily: "'EB Garamond', Georgia, serif", fontSize: '1.1rem' }}
            >
              AG Examples
            </Link>
          )}
          <button
            onClick={() => setOpen((o) => !o)}
            className="text-indigo-400 hover:text-white text-sm flex-shrink-0"
            aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {open ? '◀' : '▶'}
          </button>
        </div>

        {open && (
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
            {/* Mobile header */}
            <div className="md:hidden font-semibold text-white mb-2">
              <Link to="/" className="hover:text-indigo-200">AG Examples</Link>
            </div>

            <SearchBox />

            {/* Browse by type */}
            <nav>
              <p className="text-xs font-medium text-indigo-400 mb-2 uppercase tracking-widest">Type</p>
              <ul className="space-y-0.5">
                {[
                  { to: '/examples/', search: { type: 'variety' as const }, label: 'Varieties' },
                  { to: '/examples/', search: { type: 'computation' as const }, label: 'Computations' },
                  { to: '/examples/', search: { type: 'counterexample' as const }, label: 'Counterexamples' },
                ].map(({ to, search, label }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      search={search}
                      className="block text-sm py-1 px-2 rounded text-indigo-200 hover:text-white hover:bg-indigo-800 transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div style={{ borderTop: '1px solid #312e81' }} />

            {/* Fields */}
            <nav>
              <p className="text-xs font-medium text-indigo-400 mb-2 uppercase tracking-widest">Field</p>
              <ul className="space-y-0.5">
                {FIELDS.map((f) => (
                  <li key={f.id}>
                    <Link
                      to="/fields/$field"
                      params={{ field: f.id }}
                      className="block text-sm py-1 px-2 rounded text-indigo-200 hover:text-white hover:bg-indigo-800 transition-colors"
                    >
                      {f.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {allTags.length > 0 && (
              <>
                <div style={{ borderTop: '1px solid #312e81' }} />
                <div>
                  <p className="text-xs font-medium text-indigo-400 mb-2 uppercase tracking-widest">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {visibleTags.map((tag) => (
                      <Link
                        key={tag}
                        to="/tags/$tag"
                        params={{ tag }}
                        className="text-xs px-2 py-0.5 rounded transition-colors"
                        style={{ background: '#312e81', color: '#a5b4fc' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#4338ca'
                          e.currentTarget.style.color = '#fff'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#312e81'
                          e.currentTarget.style.color = '#a5b4fc'
                        }}
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                  {allTags.length > 12 && (
                    <button
                      onClick={() => setShowAllTags((s) => !s)}
                      className="mt-2 text-xs text-indigo-400 hover:text-indigo-200"
                    >
                      {showAllTags ? 'Show fewer' : `+${allTags.length - 12} more`}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </aside>
    </>
  )
}
