import { Link } from '@tanstack/react-router'
import type { Example, ComputationFrontmatter, CounterexampleFrontmatter } from '~/lib/schema'

const TYPE_COLOURS: Record<Example['type'], string> = {
  variety: 'bg-teal-100 text-teal-800',
  computation: 'bg-emerald-100 text-emerald-800',
  counterexample: 'bg-amber-100 text-amber-800',
}

interface ExampleMetaProps {
  example: Example
  backlinks: Example[]
}

function MetaSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1.5">{label}</p>
      {children}
    </div>
  )
}

export function ExampleMeta({ example, backlinks }: ExampleMetaProps) {
  return (
    <div
      className="rounded-lg p-4 space-y-4"
      style={{ background: '#f5f4f1', border: '1px solid #e5e7eb' }}
    >
      {/* Type + field */}
      <div className="flex flex-wrap gap-2">
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${TYPE_COLOURS[example.type]}`}>
          {example.type}
        </span>
        <Link
          to="/fields/$field"
          params={{ field: example.field }}
          className="text-xs px-2.5 py-1 rounded-full font-medium bg-gray-200 text-gray-600 hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
        >
          {example.field}
        </Link>
      </div>

      {/* Summary */}
      <p className="text-sm text-gray-600 leading-relaxed">{example.summary}</p>

      {/* Computation-specific */}
      {example.type === 'computation' && (
        <>
          <MetaSection label="Computes">
            <p className="text-sm text-gray-700">{(example as ComputationFrontmatter & { body: string }).computes}</p>
          </MetaSection>
          {(example as ComputationFrontmatter & { body: string }).techniques.length > 0 && (
            <MetaSection label="Techniques">
              <div className="flex flex-wrap gap-1">
                {(example as ComputationFrontmatter & { body: string }).techniques.map((t) => (
                  <span key={t} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
                    {t}
                  </span>
                ))}
              </div>
            </MetaSection>
          )}
        </>
      )}

      {/* Counterexample-specific */}
      {example.type === 'counterexample' && (
        <MetaSection label="Refutes">
          <p className="text-sm text-gray-700">{(example as CounterexampleFrontmatter & { body: string }).refutes}</p>
        </MetaSection>
      )}

      {/* Tags */}
      {example.tags.length > 0 && (
        <MetaSection label="Tags">
          <div className="flex flex-wrap gap-1">
            {example.tags.map((tag) => (
              <Link
                key={tag}
                to="/tags/$tag"
                params={{ tag }}
                className="text-xs bg-gray-200 text-gray-600 hover:bg-indigo-100 hover:text-indigo-700 px-2 py-0.5 rounded transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </MetaSection>
      )}

      {/* Related */}
      {example.related.length > 0 && (
        <MetaSection label="Related">
          <ul className="space-y-1">
            {example.related.map((slug) => (
              <li key={slug}>
                <Link to="/examples/$slug" params={{ slug }} className="text-sm text-indigo-600 hover:underline">
                  {slug}
                </Link>
              </li>
            ))}
          </ul>
        </MetaSection>
      )}

      {/* Backlinks */}
      {backlinks.length > 0 && (
        <MetaSection label="Referenced by">
          <ul className="space-y-1">
            {backlinks.map((bl) => (
              <li key={bl.slug}>
                <Link to="/examples/$slug" params={{ slug: bl.slug }} className="text-sm text-indigo-600 hover:underline">
                  {bl.title}
                </Link>
              </li>
            ))}
          </ul>
        </MetaSection>
      )}
    </div>
  )
}
