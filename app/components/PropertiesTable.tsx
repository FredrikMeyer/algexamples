import type React from 'react'
import type { VarietyFrontmatter } from '~/lib/schema'
import { MathText } from '~/components/MathText'

type Properties = NonNullable<VarietyFrontmatter['properties']>

interface PropertiesTableProps {
  properties: Properties
}

const PROPERTY_LABELS: { key: keyof Properties; label: string }[] = [
  { key: 'dimension', label: 'Dimension' },
  { key: 'ambient_space', label: 'Ambient space' },
  { key: 'degree', label: 'Degree' },
  { key: 'singularities', label: 'Singularities' },
  { key: 'genus', label: 'Genus' },
  { key: 'is_rational', label: 'Rational' },
  { key: 'kodaira_dimension', label: 'Kodaira dimension' },
  { key: 'picard_group', label: 'Picard group' },
  { key: 'hodge_numbers', label: 'Hodge numbers' },
]

function formatValue(key: keyof Properties, value: NonNullable<Properties[keyof Properties]>): React.ReactNode {
  if (key === 'is_rational') return (value as boolean) ? 'Yes' : 'No'
  if (key === 'kodaira_dimension') {
    const v = value as number | '-inf'
    return v === '-inf' ? '−∞' : String(v)
  }
  if (key === 'hodge_numbers') {
    const hn = value as Record<string, number>
    const tex = Object.entries(hn).map(([pq, n]) => `h^{${pq}} = ${n}`).join(',\\, ')
    return <MathText text={`$${tex}$`} />
  }
  return <MathText text={String(value)} />
}

export function PropertiesTable({ properties }: PropertiesTableProps) {
  const rows = PROPERTY_LABELS.filter(({ key }) => properties[key] !== undefined && properties[key] !== null)
  if (rows.length === 0) return null

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
      <table className="w-full text-sm">
        <tbody>
          {rows.map(({ key, label }, i) => (
            <tr key={key} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
              <td className="px-4 py-2.5 text-gray-400 font-medium w-2/5" style={{ fontSize: '0.8125rem' }}>{label}</td>
              <td className="px-4 py-2.5 text-gray-800">{formatValue(key, properties[key] as NonNullable<Properties[keyof Properties]>)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
