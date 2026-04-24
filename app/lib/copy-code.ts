export function initCopyCodeButtons() {
  document.addEventListener('click', (e) => {
    const btn = (e.target as Element).closest('[data-copy-code]') as HTMLElement | null
    if (!btn) return
    const code = btn.getAttribute('data-copy-code') ?? ''
    navigator.clipboard.writeText(code).then(() => {
      const original = btn.textContent
      btn.textContent = 'Copied!'
      setTimeout(() => { btn.textContent = original }, 1500)
    })
  })
}
