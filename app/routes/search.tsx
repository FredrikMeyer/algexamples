import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { searchExamplesFn } from '~/lib/server-fns'
import { FieldEnum } from '~/lib/schema'
import { ExampleCard } from '~/components/ExampleCard'

const TYPES = ['variety', 'computation', 'counterexample'] as const
const TYPE_LABELS: Record<(typeof TYPES)[number], string> = {
  variety: 'Varieties',
  computation: 'Computations',
  counterexample: 'Counterexamples',
}
const FIELD_LABELS: Record<string, string> = {
  'algebraic-geometry': 'Algebraic Geometry',
  'commutative-algebra': 'Commutative Algebra',
  'algebraic-topology': 'Algebraic Topology',
  'number-theory': 'Number Theory',
  'complex-geometry': 'Complex Geometry',
}

const SearchSchema = z.object({
  q: z.string().optional(),
  type: z.enum(TYPES).optional(),
  field: FieldEnum.optional(),
  tag: z.string().optional(),
  dim: z.coerce.number().int().nonnegative().optional(),
  rational: z
    .union([z.literal('true'), z.literal('false'), z.literal(true), z.literal(false)])
    .transform((v) => v === 'true' || v === true)
    .optional(),
  smooth: z
    .union([z.literal('true'), z.literal(true), z.literal('false'), z.literal(false)])
    .transform((v) => v === 'true' || v === true)
    .optional(),
})

export const Route = createFileRoute('/search')({
  validateSearch: SearchSchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const results = await searchExamplesFn({
      data: {
        q: deps.q,
        type: deps.type,
        field: deps.field,
        tag: deps.tag,
        dim: deps.dim,
        rational: deps.rational,
        smooth: deps.smooth,
      },
    })
    return { results }
  },
  component: SearchPage,
})

function SearchPage() {
  const { results } = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = useNavigate({ from: '/search' })

  const showVarietyFilters = !search.type || search.type === 'variety'
  const hasFilters =
    search.q ||
    search.type ||
    search.field ||
    search.tag ||
    search.dim !== undefined ||
    search.rational !== undefined ||
    search.smooth

  function set(patch: Partial<typeof search>) {
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true })
  }

  function clear(key: keyof typeof search) {
    navigate({
      search: (prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      },
      replace: true,
    })
  }

  return (
    <div>
      <div className="mb-6">
        <h1
          className="text-4xl font-semibold text-gray-900 mb-1"
          style={{ fontFamily: "'EB Garamond', Georgia, serif", letterSpacing: '-0.01em' }}
        >
          Search
        </h1>
        <p className="text-gray-500 text-sm">
          {results.length} result{results.length === 1 ? '' : 's'}
          {hasFilters ? ' matching current filters' : ''}
        </p>
      </div>

      {/* Filter panel */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6 space-y-5">

        {/* Text search */}
        <div>
          <label className="text-xs font-medium text-gray-400 uppercase tracking-widest block mb-1.5">
            Search text
          </label>
          <input
            type="search"
            value={search.q ?? ''}
            onChange={(e) => {
              const v = e.target.value
              v ? set({ q: v }) : clear('q')
            }}
            placeholder="Search titles, summaries, body text…"
            className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-300"
          />
        </div>

        {/* Type */}
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1.5">Type</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => clear('type')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                !search.type ? 'bg-indigo-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => (search.type === t ? clear('type') : set({ type: t }))}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  search.type === t
                    ? t === 'variety'
                      ? 'bg-teal-700 text-white'
                      : t === 'computation'
                        ? 'bg-emerald-700 text-white'
                        : 'bg-amber-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Field */}
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1.5">Field</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => clear('field')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                !search.field ? 'bg-indigo-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {FieldEnum.options.map((f) => (
              <button
                key={f}
                onClick={() => (search.field === f ? clear('field') : set({ field: f }))}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  search.field === f
                    ? 'bg-indigo-700 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {FIELD_LABELS[f]}
              </button>
            ))}
          </div>
        </div>

        {/* Tag filter */}
        <div>
          <label className="text-xs font-medium text-gray-400 uppercase tracking-widest block mb-1.5">
            Tag
          </label>
          <input
            type="text"
            value={search.tag ?? ''}
            onChange={(e) => {
              const v = e.target.value
              v ? set({ tag: v }) : clear('tag')
            }}
            placeholder="e.g. projective-space"
            className="w-48 rounded border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-900 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-300"
          />
          {search.tag && (
            <Link
              to="/tags/$tag"
              params={{ tag: search.tag }}
              className="ml-2 text-xs text-indigo-600 hover:underline"
            >
              browse #{search.tag}
            </Link>
          )}
        </div>

        {/* Variety-specific properties */}
        {showVarietyFilters && (
          <div className="border-t border-gray-100 pt-4 space-y-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
              Variety properties
            </p>
            <div className="flex flex-wrap gap-5 items-end">

              {/* Dimension */}
              <div>
                <label className="text-xs text-gray-500 block mb-1">Dimension</label>
                <input
                  type="number"
                  min={0}
                  value={search.dim ?? ''}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10)
                    isNaN(v) || e.target.value === '' ? clear('dim') : set({ dim: v })
                  }}
                  placeholder="Any"
                  className="w-20 rounded border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-900 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                />
              </div>

              {/* Rational */}
              <div>
                <p className="text-xs text-gray-500 mb-1">Rational</p>
                <div className="flex rounded border border-gray-200 overflow-hidden text-sm">
                  {(['', 'true', 'false'] as const).map((val) => {
                    const label = val === '' ? 'Any' : val === 'true' ? 'Yes' : 'No'
                    const current =
                      search.rational === undefined ? '' : search.rational ? 'true' : 'false'
                    const active = current === val
                    return (
                      <button
                        key={val}
                        onClick={() =>
                          val === ''
                            ? clear('rational')
                            : set({ rational: val as 'true' | 'false' })
                        }
                        className={`px-3 py-1.5 transition-colors ${
                          active ? 'bg-indigo-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                        style={{ borderRight: val !== 'false' ? '1px solid #e5e7eb' : undefined }}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Smooth */}
              <div>
                <p className="text-xs text-gray-500 mb-1">Singularities</p>
                <button
                  onClick={() => (search.smooth ? clear('smooth') : set({ smooth: 'true' }))}
                  className={`px-3 py-1.5 rounded text-sm font-medium border transition-colors ${
                    search.smooth
                      ? 'bg-indigo-700 text-white border-indigo-700'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  Smooth only
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Clear all */}
        {hasFilters && (
          <div className="border-t border-gray-100 pt-3">
            <Link
              to="/search"
              search={{}}
              className="text-xs text-gray-400 hover:text-gray-700 hover:underline"
            >
              Clear all filters
            </Link>
          </div>
        )}
      </div>

      {/* Results */}
      {results.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-base font-medium mb-1">No examples match</p>
          <p className="text-sm">
            Try adjusting the filters or{' '}
            <Link to="/search" search={{}} className="text-indigo-600 hover:underline">
              start over
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((example) => (
            <ExampleCard key={example.slug} example={example} />
          ))}
        </div>
      )}
    </div>
  )
}
