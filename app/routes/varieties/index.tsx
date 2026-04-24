import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { z } from 'zod'
import { getAllExamples } from '~/lib/content'
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
    const all = getAllExamples()
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Varieties</h1>
        <p className="text-gray-600">{countLabel}</p>
      </div>

      {/* Filter controls */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Dimension filter */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="dimension-filter"
              className="text-sm font-medium text-gray-700"
            >
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
                })
              }}
              className="w-24 rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Is rational filter */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="rational-filter"
              className="text-sm font-medium text-gray-700"
            >
              Rational
            </label>
            <select
              id="rational-filter"
              value={
                filters.is_rational === undefined
                  ? ''
                  : filters.is_rational
                    ? 'true'
                    : 'false'
              }
              onChange={(e) => {
                const val = e.target.value
                navigate({
                  search: (prev) => ({
                    ...prev,
                    is_rational:
                      val === ''
                        ? undefined
                        : (val as 'true' | 'false'),
                  }),
                })
              }}
              className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Any</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          {/* Ambient space filter */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="ambient-space-filter"
              className="text-sm font-medium text-gray-700"
            >
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
                })
              }}
              className="w-36 rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Clear filters button */}
          {isFiltered && (
            <Link
              to="/varieties/"
              search={{}}
              className="self-end px-4 py-1.5 rounded bg-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-300 transition-colors"
            >
              Clear filters
            </Link>
          )}
        </div>
      </div>

      {/* Variety list */}
      {varieties.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium mb-1">No varieties match</p>
          <p className="text-sm">
            Try adjusting the filters or{' '}
            <Link
              to="/varieties/"
              search={{}}
              className="text-blue-600 hover:underline"
            >
              clear all filters
            </Link>
            .
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
