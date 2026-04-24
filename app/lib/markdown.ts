import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkMath from 'remark-math'
import remarkRehype from 'remark-rehype'
import rehypeKatex from 'rehype-katex'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'
import { katexMacros } from './katex-macros'
import rehypeCodeBlocks from './rehype-code-blocks'

export async function processMarkdown(content: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeKatex, { macros: katexMacros, throwOnError: false })
    .use(rehypeHighlight, { detect: true })
    .use(rehypeCodeBlocks)
    .use(rehypeStringify)
    .process(content)
  return String(result)
}
