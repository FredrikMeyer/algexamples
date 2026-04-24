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
      {/* Mobile toggle — always visible outside the aside */}
      <button
        className="md:hidden fixed top-3 left-3 z-50 p-2 bg-white border rounded shadow text-sm"
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle sidebar"
      >
        {open ? '✕' : '☰'}
      </button>

      {/*
        data-open drives CSS for both mobile and desktop:
          mobile:  transform-based slide-in/out (position: fixed overlay)
          desktop: width-based collapse (position: static, in layout flow)
        See .sidebar rules in global.css.
      */}
      <aside
        data-open={open}
        className="sidebar fixed md:static top-0 left-0 h-full z-40 bg-white border-r border-gray-200 flex flex-col overflow-hidden flex-shrink-0"
      >
        {/* Desktop header — always rendered so the toggle button survives collapse */}
        <div
          className={`hidden md:flex items-center flex-shrink-0 p-3 border-b border-gray-100 ${
            open ? 'justify-between' : 'justify-center'
          }`}
        >
          {open && (
            <Link to="/" className="font-semibold text-gray-800 hover:text-blue-600 truncate">
              AG Examples
            </Link>
          )}
          <button
            onClick={() => setOpen((o) => !o)}
            className="text-gray-400 hover:text-gray-600 text-sm flex-shrink-0"
            aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {open ? '◀' : '▶'}
          </button>
        </div>

        {/* Scrollable content — hidden when collapsed */}
        {open && (
          <div className="flex-1 overflow-y-auto p-4">
            {/* Mobile header */}
            <div className="md:hidden font-semibold text-gray-800 mb-4">
              <Link to="/" className="hover:text-blue-600">AG Examples</Link>
            </div>

            <SearchBox />

            <nav className="mb-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Browse by type
              </p>
              <ul className="space-y-1">
                <li>
                  <Link to="/examples/" search={{ type: 'variety' }} className="block text-sm text-gray-700 hover:text-blue-600 py-0.5">
                    Varieties
                  </Link>
                </li>
                <li>
                  <Link to="/examples/" search={{ type: 'computation' }} className="block text-sm text-gray-700 hover:text-blue-600 py-0.5">
                    Computations
                  </Link>
                </li>
                <li>
                  <Link to="/examples/" search={{ type: 'counterexample' }} className="block text-sm text-gray-700 hover:text-blue-600 py-0.5">
                    Counterexamples
                  </Link>
                </li>
              </ul>
            </nav>

            <nav className="mb-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Fields
              </p>
              <ul className="space-y-1">
                {FIELDS.map((f) => (
                  <li key={f.id}>
                    <Link
                      to="/fields/$field"
                      params={{ field: f.id }}
                      className="block text-sm text-gray-700 hover:text-blue-600 py-0.5"
                    >
                      {f.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {allTags.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Tags
                </p>
                <div className="flex flex-wrap gap-1">
                  {visibleTags.map((tag) => (
                    <Link
                      key={tag}
                      to="/tags/$tag"
                      params={{ tag }}
                      className="text-xs bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-600 px-2 py-0.5 rounded"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
                {allTags.length > 12 && (
                  <button
                    onClick={() => setShowAllTags((s) => !s)}
                    className="mt-1 text-xs text-blue-500 hover:underline"
                  >
                    {showAllTags ? 'Show fewer' : `+${allTags.length - 12} more`}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  )
}
