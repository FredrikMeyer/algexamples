import katex from 'katex'
import { katexMacros } from '~/lib/katex-macros'

function renderMath(tex: string): string {
  return katex.renderToString(tex, { macros: katexMacros, throwOnError: false })
}

// Splits a string on $...$ inline math delimiters and renders each math segment.
export function MathText({ text }: { text: string }) {
  const parts = text.split(/\$([^$]+)\$/)
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} dangerouslySetInnerHTML={{ __html: renderMath(part) }} />
        ) : (
          part
        )
      )}
    </>
  )
}
