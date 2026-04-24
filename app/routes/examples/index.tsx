import { createFileRoute, Link } from '@tanstack/react-router'
import { z } from 'zod'
import { getAllExamplesFn } from '~/lib/server-fns'
import { ExampleCard } from '~/components/ExampleCard'

const SearchSchema = z.object({
  type: z.enum(['variety', 'computation', 'counterexample']).optional(),
  q: z.string().optional(),
})

export const Route = createFileRoute('/examples/')({
  validateSearch: SearchSchema,
  loaderDeps: ({ search }) => ({ type: search.type, q: search.q }),
  loader: async ({ deps: { type, q } }) => {
    let examples = await getAllExamplesFn()
    if (type) examples = examples.filter((e) => e.type === type)
    if (q) {
      const term = q.toLowerCase()
      examples = examples.filter(
        (e) =>
          e.title.toLowerCase().includes(term) ||
          e.summary.toLowerCase().includes(term) ||
          e.tags.some((t) => t.toLowerCase().includes(term))
      )
    }
    return { examples, activeType: type, q: q ?? '' }
  },
  component: ExamplesPage,
})

const TYPE_LABELS: Record<'variety' | 'computation' | 'counterexample', string> = {
  variety: 'Varieties',
  computation: 'Computations',
  counterexample: 'Counterexamples',
}

const ACTIVE_TAB_COLOURS: Record<'variety' | 'computation' | 'counterexample', string> = {
  variety: 'bg-teal-700 text-white',
  computation: 'bg-emerald-700 text-white',
  counterexample: 'bg-amber-600 text-white',
}

function ExamplesPage() {
  const { examples, activeType, q } = Route.useLoaderData()

  const heading = activeType ? TYPE_LABELS[activeType] : 'Examples'

  return (
    <div>
      <div className="mb-6">
        <h1
          className="text-4xl font-semibold text-gray-900 mb-2"
          style={{ fontFamily: "'EB Garamond', Georgia, serif", letterSpacing: '-0.01em' }}
        >
          {heading}
        </h1>
        <p className="text-gray-500">
          {examples.length === 0
            ? q
              ? `No examples match "${q}".`
              : 'No examples match the current filter.'
            : `${examples.length} example${examples.length === 1 ? '' : 's'}${q ? ` matching "${q}"` : ''}`}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          to="/examples/"
          search={{}}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !activeType
              ? 'bg-indigo-700 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </Link>
        {(
          ['variety', 'computation', 'counterexample'] as const
        ).map((type) => (
          <Link
            key={type}
            to="/examples/"
            search={{ type }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeType === type
                ? ACTIVE_TAB_COLOURS[type]
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {TYPE_LABELS[type]}
          </Link>
        ))}
      </div>

      {/* Example list */}
      {examples.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium mb-1">No examples found</p>
          <p className="text-sm">
            <Link to="/examples/" search={{}} className="text-blue-600 hover:underline">
              Clear filters
            </Link>
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {examples.map((example) => (
            <ExampleCard key={example.slug} example={example} />
          ))}
        </div>
      )}
    </div>
  )
}
