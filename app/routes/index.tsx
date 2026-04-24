import { createFileRoute, Link } from '@tanstack/react-router'
import { getAllExamplesFn } from '~/lib/server-fns'
import { ExampleCard } from '~/components/ExampleCard'

export const Route = createFileRoute('/')({
  loader: async () => {
    const all = await getAllExamplesFn()
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
      <div className="mb-10">
        <h1
          className="text-4xl font-semibold text-gray-900 mb-3"
          style={{ fontFamily: "'EB Garamond', Georgia, serif", letterSpacing: '-0.01em' }}
        >
          Algebraic Geometry Examples
        </h1>
        <p className="text-gray-500 mb-3">
          A reference database of concrete examples in algebraic geometry and related fields.
        </p>
        {total > 0 && (
          <div className="flex gap-4 text-sm">
            <Link to="/examples/" search={{ type: 'variety' }} className="text-indigo-600 hover:text-indigo-800 hover:underline">
              {counts.variety} {counts.variety === 1 ? 'variety' : 'varieties'}
            </Link>
            <span className="text-gray-300">·</span>
            <Link to="/examples/" search={{ type: 'computation' }} className="text-indigo-600 hover:text-indigo-800 hover:underline">
              {counts.computation} {counts.computation === 1 ? 'computation' : 'computations'}
            </Link>
            <span className="text-gray-300">·</span>
            <Link to="/examples/" search={{ type: 'counterexample' }} className="text-indigo-600 hover:text-indigo-800 hover:underline">
              {counts.counterexample} {counts.counterexample === 1 ? 'counterexample' : 'counterexamples'}
            </Link>
          </div>
        )}
      </div>

      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Recently added</h2>
      <div className="space-y-3">
        {recent.map((e) => (
          <ExampleCard key={e.slug} example={e} />
        ))}
      </div>

      {total === 0 && (
        <p className="text-gray-400 text-sm mt-4">
          No examples yet. Add .md files to <code>content/examples/</code>.
        </p>
      )}
    </div>
  )
}
