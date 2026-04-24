import { createRootRoute, Outlet, HeadContent, Scripts } from '@tanstack/react-router'
import { useEffect } from 'react'
import { getAllTagsFn } from '~/lib/server-fns'
import { Sidebar } from '~/components/Sidebar'
import { initCopyCodeButtons } from '~/lib/copy-code'
import '~/styles/global.css'

export const Route = createRootRoute({
  loader: () => getAllTagsFn().then((allTags) => ({ allTags })),
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Algebraic Geometry Examples' },
    ],
  }),
  component: RootLayout,
})

function RootLayout() {
  const { allTags } = Route.useLoaderData()
  useEffect(() => initCopyCodeButtons(), [])

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen" style={{ background: '#faf9f6', fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div className="flex min-h-screen">
          <Sidebar allTags={allTags} />
          <main className="flex-1 min-w-0 p-6 md:p-10">
            <Outlet />
          </main>
        </div>
        <Scripts />
      </body>
    </html>
  )
}
