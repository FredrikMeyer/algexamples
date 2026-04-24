import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import tailwindcss from '@tailwindcss/vite'
import viteReact from '@vitejs/plugin-react'
import { resolve } from 'path'
import { getAllExamples, getAllTags, getAllFields } from './app/lib/content'

const base = process.env.VITE_BASE_PATH ?? '/'

export default defineConfig({
  base,
  resolve: {
    alias: { '~': resolve(__dirname, 'app') },
  },
  plugins: [
    tanstackStart({
      srcDirectory: 'app',
      prerender: {
        enabled: true,
        crawlLinks: true,
        filter: (page) => !page.path.includes('?'),
        routes: () => {
          try {
            const examples = getAllExamples()
            const tags = getAllTags()
            const fields = getAllFields()
            return [
              '/',
              '/examples/',
              '/varieties/',
              '/search',
              ...examples.map((e) => `/examples/${e.slug}`),
              ...fields.map((f) => `/fields/${f}`),
              ...tags.map((t) => `/tags/${t}`),
            ]
          } catch {
            return ['/', '/examples/', '/varieties/']
          }
        },
      },
    }),
    viteReact(),
    tailwindcss(),
  ],
})
