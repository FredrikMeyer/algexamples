import { createFileRoute, Link } from '@tanstack/react-router'
import { getAllExamples } from '~/lib/content'
import { ExampleCard } from '~/components/ExampleCard'

export const Route = createFileRoute('/')({
  loader: () => {
    const all = getAllExamples()
    const counts = {
      variety: all.filter((e) => e.type === 'variety').length,
      computation: all.filter((e) => e.type === 'computation').length,
      counterexample: all.filter((e) => e.type === 'counterexample').length,
    }
    const recent = all.slice(-5).reverse()
    return { counts, recent, total: all.length }
  },
  component: HomePage,
})

function HomePage() {
  const { counts, recent, total } = Route.useLoaderData()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Algebraic Geometry Examples
        </h1>
        <p className="text-gray-600">
          A reference database of concrete examples in algebraic geometry and related fields.
          {total > 0 && ` ${total} entries.`}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        {(
          [
            { type: 'variety', label: 'Varieties', count: counts.variety },
            { type: 'computation', label: 'Computations', count: counts.computation },
            { type: 'counterexample', label: 'Counterexamples', count: counts.counterexample },
          ] as const
        ).map(({ type, label, count }) => (
          <Link
            key={type}
            to="/examples/"
            search={{ type }}
            className="border border-gray-200 rounded-lg p-4 bg-white text-center hover:border-blue-300 transition-colors block"
          >
            <div className="text-2xl font-bold text-blue-600">{count}</div>
            <div className="text-sm text-gray-600">{label}</div>
          </Link>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-gray-800 mb-3">Recently added</h2>
      <div className="space-y-3">
        {recent.map((e) => (
          <ExampleCard key={e.slug} example={e} />
        ))}
      </div>

      {total === 0 && (
        <p className="text-gray-500 text-sm mt-4">
          No examples yet. Add .md files to <code>content/examples/</code>.
        </p>
      )}
    </div>
  )
}
