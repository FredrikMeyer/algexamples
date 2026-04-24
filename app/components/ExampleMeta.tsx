import { Link } from '@tanstack/react-router'
import type { Example, ComputationFrontmatter, CounterexampleFrontmatter } from '~/lib/schema'

const TYPE_COLOURS: Record<Example['type'], string> = {
  variety: 'bg-blue-100 text-blue-700',
  computation: 'bg-green-100 text-green-700',
  counterexample: 'bg-orange-100 text-orange-700',
}

interface ExampleMetaProps {
  example: Example
  backlinks: Example[]
}

export function ExampleMeta({ example, backlinks }: ExampleMetaProps) {
  return (
    <div className="space-y-5">
      {/* Type + field badges */}
      <div className="flex flex-wrap gap-2">
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${TYPE_COLOURS[example.type]}`}>
          {example.type}
        </span>
        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-gray-100 text-gray-600">
          {example.field}
        </span>
      </div>

      {/* Summary */}
      <p className="text-sm text-gray-600 leading-relaxed">{example.summary}</p>

      {/* Computation-specific fields */}
      {example.type === 'computation' && (
        <div className="space-y-3">
          <div>
            <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Computes</dt>
            <dd className="text-sm text-gray-800">{(example as ComputationFrontmatter & { body: string }).computes}</dd>
          </div>
          {(example as ComputationFrontmatter & { body: string }).techniques.length > 0 && (
            <div>
              <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Techniques</dt>
              <dd className="flex flex-wrap gap-1">
                {(example as ComputationFrontmatter & { body: string }).techniques.map((t) => (
                  <span key={t} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">
                    {t}
                  </span>
                ))}
              </dd>
            </div>
          )}
        </div>
      )}

      {/* Counterexample-specific fields */}
      {example.type === 'counterexample' && (
        <div>
          <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Refutes</dt>
          <dd className="text-sm text-gray-800">{(example as CounterexampleFrontmatter & { body: string }).refutes}</dd>
        </div>
      )}

      {/* Tags */}
      {example.tags.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tags</h3>
          <div className="flex flex-wrap gap-1">
            {example.tags.map((tag) => (
              <Link
                key={tag}
                to={'/tags/$tag' as any}
                params={{ tag }}
                className="text-xs bg-gray-100 text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-2 py-0.5 rounded transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Related examples */}
      {example.related.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Related</h3>
          <ul className="space-y-1">
            {example.related.map((slug) => (
              <li key={slug}>
                <Link
                  to="/examples/$slug"
                  params={{ slug }}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {slug}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Backlinks */}
      {backlinks.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Referenced by</h3>
          <ul className="space-y-1">
            {backlinks.map((bl) => (
              <li key={bl.slug}>
                <Link
                  to="/examples/$slug"
                  params={{ slug: bl.slug }}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {bl.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
