import { useEffect, useRef } from 'react'

export function SearchWidget() {
  const containerRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current || !containerRef.current) return
    initializedRef.current = true

    const script = document.createElement('script')
    script.src = '/pagefind/pagefind-ui.js'
    script.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (containerRef.current && (window as any).PagefindUI) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        new (window as any).PagefindUI({
          element: containerRef.current,
          showImages: false,
          resetStyles: false,
        })
      }
    }
    document.head.appendChild(script)

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = '/pagefind/pagefind-ui.css'
    document.head.appendChild(link)
  }, [])

  return <div ref={containerRef} className="pagefind-search mb-4" />
}
