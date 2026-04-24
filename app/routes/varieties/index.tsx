import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { z } from 'zod'
import { getAllExamplesFn } from '~/lib/server-fns'
import { ExampleCard } from '~/components/ExampleCard'
import type { VarietyExample } from '~/lib/schema'

const SearchSchema = z.object({
  dimension: z.coerce.number().int().nonnegative().optional(),
  is_rational: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  ambient_space: z.string().optional(),
})

export const Route = createFileRoute('/varieties/')({
  validateSearch: SearchSchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const all = await getAllExamplesFn()
    let varieties = all.filter((e) => e.type === 'variety') as VarietyExample[]

    if (deps.dimension !== undefined) {
      varieties = varieties.filter(
        (v) => v.properties?.dimension === deps.dimension,
      )
    }
    if (deps.is_rational !== undefined) {
      varieties = varieties.filter(
        (v) => v.properties?.is_rational === deps.is_rational,
      )
    }
    if (deps.ambient_space !== undefined && deps.ambient_space !== '') {
      const query = deps.ambient_space.toLowerCase()
      varieties = varieties.filter((v) =>
        v.properties?.ambient_space?.toLowerCase().includes(query),
      )
    }

    const totalVarieties = all.filter((e) => e.type === 'variety').length

    return {
      varieties,
      totalVarieties,
      filters: {
        dimension: deps.dimension,
        is_rational: deps.is_rational,
        ambient_space: deps.ambient_space,
      },
    }
  },
  component: VarietiesPage,
})

function VarietiesPage() {
  const { varieties, totalVarieties, filters } = Route.useLoaderData()
  const navigate = useNavigate({ from: '/varieties/' })

  const isFiltered =
    filters.dimension !== undefined ||
    filters.is_rational !== undefined ||
    (filters.ambient_space !== undefined && filters.ambient_space !== '')

  const countLabel = isFiltered
    ? `${varieties.length} of ${totalVarieties} varieties`
    : `${totalVarieties} ${totalVarieties === 1 ? 'variety' : 'varieties'}`

  return (
    <div>
      <div className="mb-6">
        <h1
          className="text-4xl font-semibold text-gray-900 mb-2"
          style={{ fontFamily: "'EB Garamond', Georgia, serif", letterSpacing: '-0.01em' }}
        >
          Varieties
        </h1>
        <p className="text-gray-500">{countLabel}</p>
      </div>

      {/* Filter controls */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 flex flex-wrap gap-5 items-end">
        {/* Dimension */}
        <div className="flex flex-col gap-1">
          <label htmlFor="dimension-filter" className="text-xs font-medium text-gray-400 uppercase tracking-widest">
            Dimension
          </label>
          <input
            id="dimension-filter"
            type="number"
            min={0}
            placeholder="Any"
            value={filters.dimension ?? ''}
            onChange={(e) => {
              const raw = e.target.value
              const parsed = parseInt(raw, 10)
              navigate({
                search: (prev) => ({
                  ...prev,
                  dimension: raw === '' || isNaN(parsed) ? undefined : parsed,
                }),
                replace: true,
              })
            }}
            className="w-24 rounded border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-900 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-300"
          />
        </div>

        {/* Rational — segmented control */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">Rational</span>
          <div className="flex rounded border border-gray-200 overflow-hidden text-sm">
            {(['', 'true', 'false'] as const).map((val) => {
              const label = val === '' ? 'Any' : val === 'true' ? 'Yes' : 'No'
              const current = filters.is_rational === undefined ? '' : filters.is_rational ? 'true' : 'false'
              const active = current === val
              return (
                <button
                  key={val}
                  onClick={() =>
                    navigate({
                      search: (prev) => ({
                        ...prev,
                        is_rational: val === '' ? undefined : (val as 'true' | 'false'),
                      }),
                      replace: true,
                    })
                  }
                  className={`px-3 py-1.5 transition-colors ${
                    active
                      ? 'bg-indigo-700 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                  style={{ borderRight: val !== 'false' ? '1px solid #e5e7eb' : undefined }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Ambient space */}
        <div className="flex flex-col gap-1">
          <label htmlFor="ambient-space-filter" className="text-xs font-medium text-gray-400 uppercase tracking-widest">
            Ambient Space
          </label>
          <input
            id="ambient-space-filter"
            type="text"
            placeholder="e.g. P^3"
            value={filters.ambient_space ?? ''}
            onChange={(e) => {
              const val = e.target.value
              navigate({
                search: (prev) => ({
                  ...prev,
                  ambient_space: val === '' ? undefined : val,
                }),
                replace: true,
              })
            }}
            className="w-36 rounded border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-900 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-300"
          />
        </div>

        {isFiltered && (
          <Link
            to="/varieties/"
            search={{}}
            className="self-end px-3 py-1.5 rounded text-sm font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
          >
            Clear
          </Link>
        )}
      </div>

      {varieties.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-base font-medium mb-1">No varieties match</p>
          <p className="text-sm">
            <Link to="/varieties/" search={{}} className="text-indigo-600 hover:underline">
              Clear filters
            </Link>
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {varieties.map((variety) => (
            <ExampleCard key={variety.slug} example={variety} />
          ))}
        </div>
      )}
    </div>
  )
}
