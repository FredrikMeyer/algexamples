import { visit } from 'unist-util-visit'
import type { Root, Element } from 'hast'
import type { Plugin } from 'unified'

const CAS_LABELS: Record<string, string> = {
  macaulay2: 'Macaulay2',
  sage: 'Sage',
}

const rehypeCodeBlocks: Plugin<[], Root> = () => (tree) => {
  visit(tree, 'element', (node: Element, index, parent) => {
    if (node.tagName !== 'pre') return
    const code = node.children.find(
      (c): c is Element => c.type === 'element' && (c as Element).tagName === 'code'
    )
    if (!code) return

    const langClass = (code.properties?.className as string[] | undefined)?.find(
      (c) => c.startsWith('language-')
    )
    const lang = langClass?.replace('language-', '')
    const label = lang ? CAS_LABELS[lang] : undefined

    // Extract text content for copy
    const codeText = extractText(code)

    const wrapper: Element = {
      type: 'element',
      tagName: 'div',
      properties: { className: ['code-block-wrapper'] },
      children: [
        {
          type: 'element',
          tagName: 'div',
          properties: { className: ['code-block-header'] },
          children: [
            label
              ? { type: 'element', tagName: 'span', properties: { className: ['code-lang-label'] }, children: [{ type: 'text', value: label }] }
              : { type: 'element', tagName: 'span', properties: {}, children: [] },
            {
              type: 'element',
              tagName: 'button',
              properties: {
                className: ['copy-code-btn'],
                'data-copy-code': codeText,
                type: 'button',
              },
              children: [{ type: 'text', value: 'Copy' }],
            },
          ],
        },
        node, // original <pre>
      ],
    }

    if (parent && index !== undefined) {
      parent.children[index] = wrapper
    }
  })
}

function extractText(node: Element): string {
  let text = ''
  for (const child of node.children) {
    if (child.type === 'text') text += child.value
    else if (child.type === 'element') text += extractText(child as Element)
  }
  return text
}

export default rehypeCodeBlocks
