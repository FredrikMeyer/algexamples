import { createRootRoute, Outlet, HeadContent, Scripts } from '@tanstack/react-router'
import { useEffect } from 'react'
import { getAllTags } from '~/lib/content'
import { Sidebar } from '~/components/Sidebar'
import { initCopyCodeButtons } from '~/lib/copy-code'
import '~/styles/global.css'

export const Route = createRootRoute({
  loader: () => ({ allTags: getAllTags() }),
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
  useEffect(() => { initCopyCodeButtons() }, [])

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="bg-gray-50 min-h-screen">
        <div className="flex min-h-screen">
          <Sidebar allTags={allTags} />
          <main className="flex-1 min-w-0 p-6 md:p-8 max-w-4xl">
            <Outlet />
          </main>
        </div>
        <Scripts />
      </body>
    </html>
  )
}
