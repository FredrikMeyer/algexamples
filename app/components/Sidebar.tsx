import { useState } from 'react'
import { Link } from '@tanstack/react-router'

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
      {/* Mobile toggle button */}
      <button
        className="md:hidden fixed top-3 left-3 z-50 p-2 bg-white border rounded shadow text-sm"
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle sidebar"
      >
        {open ? '✕' : '☰'}
      </button>

      <aside
        style={{
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 200ms',
        }}
        className="md:translate-x-0 md:static fixed top-0 left-0 h-full z-40 w-64 bg-white border-r border-gray-200 flex flex-col overflow-y-auto p-4"
      >
        {/* Desktop collapse button */}
        <div className="hidden md:flex justify-between items-center mb-4">
          <Link to="/" className="font-semibold text-gray-800 hover:text-blue-600">
            AG Examples
          </Link>
          <button
            onClick={() => setOpen((o) => !o)}
            className="text-gray-400 hover:text-gray-600 text-sm"
            aria-label="Collapse sidebar"
          >
            {open ? '◀' : '▶'}
          </button>
        </div>

        {open && (
          <>
            <nav className="mb-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Browse by type
              </p>
              <ul className="space-y-1">
                <li>
                  <Link to={'/examples' as any} className="block text-sm text-gray-700 hover:text-blue-600 py-0.5">
                    Varieties
                  </Link>
                </li>
                <li>
                  <Link to={'/examples' as any} className="block text-sm text-gray-700 hover:text-blue-600 py-0.5">
                    Computations
                  </Link>
                </li>
                <li>
                  <Link to={'/examples' as any} className="block text-sm text-gray-700 hover:text-blue-600 py-0.5">
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
                      to={'/fields/$field' as any}
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
                      to={'/tags/$tag' as any}
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
          </>
        )}
      </aside>
    </>
  )
}
