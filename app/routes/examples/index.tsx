import { createFileRoute, Link } from '@tanstack/react-router'
import { z } from 'zod'
import { getAllExamples } from '~/lib/content'
import { ExampleCard } from '~/components/ExampleCard'

const SearchSchema = z.object({
  type: z.enum(['variety', 'computation', 'counterexample']).optional(),
})

export const Route = createFileRoute('/examples/')({
  validateSearch: SearchSchema,
  loaderDeps: ({ search }) => ({ type: search.type }),
  loader: async ({ deps: { type } }) => {
    const all = getAllExamples()
    const examples = type ? all.filter((e) => e.type === type) : all
    return { examples, activeType: type }
  },
  component: ExamplesPage,
})

const TYPE_LABELS: Record<'variety' | 'computation' | 'counterexample', string> = {
  variety: 'Varieties',
  computation: 'Computations',
  counterexample: 'Counterexamples',
}

const ACTIVE_TAB_COLOURS: Record<'variety' | 'computation' | 'counterexample', string> = {
  variety: 'bg-blue-600 text-white',
  computation: 'bg-green-600 text-white',
  counterexample: 'bg-orange-600 text-white',
}

function ExamplesPage() {
  const { examples, activeType } = Route.useLoaderData()

  const heading = activeType ? TYPE_LABELS[activeType] : 'Examples'

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{heading}</h1>
        <p className="text-gray-600">
          {examples.length === 0
            ? 'No examples match the current filter.'
            : `${examples.length} example${examples.length === 1 ? '' : 's'}`}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          to="/examples/"
          search={{}}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !activeType
              ? 'bg-gray-800 text-white'
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
            Try selecting a different filter or{' '}
            <Link to="/examples/" search={{}} className="text-blue-600 hover:underline">
              view all examples
            </Link>
            .
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
