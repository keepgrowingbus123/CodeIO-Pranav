import { useEffect, useRef, useState } from 'react'
import ParticleBackground from './ParticleBackground.jsx'

const API_URL = 'http://localhost:5000'

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [url, setUrl] = useState('')
  const [expiresInHours, setExpiresInHours] = useState('')
  const [links, setLinks] = useState([])
  const [copyToast, setCopyToast] = useState(false)
  const copyToastTimeout = useRef(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode)
  }, [isDarkMode])

  useEffect(() => {
    let isMounted = true

    async function fetchLinks() {
      try {
        const response = await fetch(`${API_URL}/api/links`)
        if (!response.ok) {
          throw new Error('Could not load your links.')
        }

        const existingLinks = await response.json()
        if (isMounted) {
          setLinks(existingLinks)
        }
      } catch (fetchError) {
        console.error('Failed to fetch links:', fetchError)
        if (isMounted) {
          setError('Could not load your links. Please try again later.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchLinks()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => () => window.clearTimeout(copyToastTimeout.current), [])

  async function handleSubmit(event) {
    event.preventDefault()
    if (!url.trim()) return

    setError('')
    setIsSubmitting(true)

    try {
      const response = await fetch(`${API_URL}/shorten`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalUrl: url.trim(),
          ...(expiresInHours ? { expiresInHours: Number(expiresInHours) } : {}),
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Could not shorten this URL.')
      }

      setLinks((currentLinks) => [result, ...currentLinks])
      setUrl('')
      setExpiresInHours('')
    } catch (submitError) {
      console.error('Failed to shorten URL:', submitError)
      setError(submitError.message || 'Could not shorten this URL.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleCopy(value) {
    try {
      await navigator.clipboard.writeText(value)
      setCopyToast(true)
      window.clearTimeout(copyToastTimeout.current)
      copyToastTimeout.current = window.setTimeout(() => setCopyToast(false), 3000)
    } catch (copyError) {
      console.error('Failed to copy short URL:', copyError)
      setError('Could not copy the short URL to your clipboard.')
    }
  }

  return (
    <main className="isolate min-h-screen bg-slate-50/90 text-gray-900 transition-colors dark:bg-slate-950/90 dark:text-white">
      <ParticleBackground isDarkMode={isDarkMode} />
      <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
        <header className="flex items-center justify-between">
          <a href="#top" className="flex items-center gap-3" aria-label="Link Vault home">
            <span className="flex size-9 items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 shadow-[0_6px_20px_rgba(99,102,241,0.12)] dark:border-indigo-300/20 dark:bg-slate-900 dark:text-indigo-300 dark:shadow-[0_6px_20px_rgba(99,102,241,0.16)]" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" className="size-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.5 12a4 4 0 0 1 0-5.66l2-2a4 4 0 0 1 5.66 5.66l-.75.75" />
                <path d="M15.5 12a4 4 0 0 1 0 5.66l-2 2a4 4 0 0 1-5.66-5.66l.75-.75" />
                <path d="m9.5 14.5 5-5" />
              </svg>
            </span>
            <span className="text-[15px] font-bold tracking-[-0.02em] text-gray-900 dark:text-white">Link Vault</span>
          </a>
          <button
            type="button"
            onClick={() => setIsDarkMode((currentMode) => !currentMode)}
            className="flex size-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition-all hover:bg-gray-100 hover:text-gray-900 active:scale-95 dark:border-white/10 dark:bg-slate-900 dark:text-gray-300 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? (
              <svg viewBox="0 0 24 24" fill="none" className="size-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20.5 15.3A8.5 8.5 0 0 1 8.7 3.5 8.5 8.5 0 1 0 20.5 15.3Z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" className="size-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
              </svg>
            )}
          </button>
        </header>

        <section id="top" className="relative mt-14 overflow-hidden rounded-[28px] border border-gray-200 bg-white/70 px-6 py-12 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/55 dark:shadow-[0_18px_48px_rgba(0,0,0,0.32)] sm:px-12 sm:py-14 lg:px-20 lg:py-16">
          <div className="absolute -right-20 -top-28 size-72 rounded-full border-[32px] border-indigo-200/30 dark:border-white/[0.06]" aria-hidden="true" />
          <div className="absolute -bottom-36 -left-20 size-80 rounded-full border-[44px] border-indigo-100/40 dark:border-white/[0.04]" aria-hidden="true" />
          <div className="relative mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-700 dark:border-indigo-300/20 dark:bg-indigo-400/10 dark:text-indigo-200">
              <span aria-hidden="true">✦</span> Your links, simplified
            </div>
            <h1 className="text-4xl font-semibold tracking-[-0.045em] text-gray-900 dark:text-white sm:text-5xl">Make every link count.</h1>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-gray-600 dark:text-gray-300 sm:text-[15px]">Shorten, share, and understand your links with a cleaner way to connect your audience to what matters.</p>
            <form onSubmit={handleSubmit} className="mx-auto mt-9 flex max-w-2xl flex-col gap-2 rounded-2xl border border-gray-200 bg-white/80 p-2 shadow-[0_12px_28px_rgba(15,23,42,0.1)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70 dark:shadow-[0_12px_28px_rgba(0,0,0,0.3)]">
              <div className="flex flex-col gap-2 sm:flex-row">
                <label htmlFor="url" className="sr-only">Paste a long URL</label>
                <input id="url" type="url" value={url} onChange={(event) => { setUrl(event.target.value); setError('') }} placeholder="Paste your long URL here..." required className="h-12 min-w-0 flex-1 rounded-xl border-0 bg-transparent px-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-400/60 dark:text-white dark:placeholder:text-gray-500" />
                <button type="submit" disabled={isSubmitting} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-indigo-100 px-6 text-sm font-bold text-indigo-800 transition-all hover:bg-indigo-200 active:scale-[0.98] active:bg-indigo-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-wait disabled:opacity-60 dark:bg-indigo-400/15 dark:text-indigo-200 dark:hover:bg-indigo-400/25 dark:active:bg-indigo-400/30 dark:focus-visible:ring-offset-slate-950">
                  <span aria-hidden="true">⚡</span> {isSubmitting ? 'Shortening…' : 'Shorten'}
                </button>
              </div>
              {error && <p role="alert" className="px-4 text-left text-xs text-red-600 transition-all duration-300 dark:text-red-300">{error}</p>}
              <div className="flex items-center gap-2 px-4 pb-1">
                <label htmlFor="expiresInHours" className="text-xs font-medium text-gray-500 dark:text-gray-400">Expires</label>
                <select
                  id="expiresInHours"
                  value={expiresInHours}
                  onChange={(event) => setExpiresInHours(event.target.value)}
                  className="rounded-lg border-0 bg-transparent py-1 text-xs font-semibold text-indigo-700 outline-none focus:ring-2 focus:ring-indigo-400/60 dark:text-indigo-300"
                >
                  <option value="" className="bg-white text-gray-900 dark:bg-slate-900 dark:text-gray-200">Never</option>
                  <option value="1" className="bg-white text-gray-900 dark:bg-slate-900 dark:text-gray-200">1 Hour</option>
                  <option value="24" className="bg-white text-gray-900 dark:bg-slate-900 dark:text-gray-200">24 Hours</option>
                </select>
              </div>
            </form>
            <p className="mt-4 text-[11px] text-gray-500 dark:text-gray-500">Free forever · No credit card required · Secure by default</p>
          </div>
        </section>

        <section className="mt-12" aria-labelledby="recent-links-heading">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-500">Your workspace</p>
              <h2 id="recent-links-heading" className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-gray-900 dark:text-white">Recent links</h2>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white/75 shadow-[0_6px_24px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/50 dark:shadow-[0_6px_24px_rgba(0,0,0,0.2)]">
            <div className="hidden grid-cols-[minmax(0,1.7fr)_minmax(150px,0.8fr)_100px_100px] gap-4 border-b border-gray-200 bg-gray-50/80 px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500 dark:border-white/5 dark:bg-slate-950/40 dark:text-gray-500 md:grid">
              <span>Original URL</span><span>Short link</span><span>Clicks</span><span>Created</span>
            </div>
            {isLoading ? (
              <div className="divide-y divide-gray-100 dark:divide-white/5" aria-label="Loading links">
                {[0, 1, 2].map((row) => (
                  <div key={row} className="grid gap-4 px-5 py-5 md:grid-cols-[minmax(0,1.7fr)_minmax(150px,0.8fr)_100px_100px] md:items-center md:px-6">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-slate-700/70" />
                    <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-slate-700/70" />
                    <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200 dark:bg-slate-700/70" />
                    <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-slate-700/70" />
                  </div>
                ))}
              </div>
            ) : links.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                No links shortened yet. Paste a URL above to get started.
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-white/5">
                {links.map((link) => {
                const shortUrl = link.shortUrl || `${API_URL}/${link.shortCode}`

                return (
                  <div key={link.shortCode} className="grid gap-4 px-5 py-5 transition-all hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-white/[0.04] dark:active:bg-white/[0.07] md:grid-cols-[minmax(0,1.7fr)_minmax(150px,0.8fr)_100px_100px] md:items-center md:px-6">
                    <div className="min-w-0"><p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-500 md:hidden">Original URL</p><p className="truncate text-sm font-medium text-gray-700 dark:text-gray-200" title={link.originalUrl}>{link.originalUrl}</p></div>
                    <div className="flex items-center gap-2"><div className="min-w-0"><p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-500 md:hidden">Short link</p><a href={shortUrl} className="truncate text-sm font-semibold text-indigo-700 hover:text-indigo-600 dark:text-indigo-300 dark:hover:text-indigo-200" target="_blank" rel="noreferrer">{shortUrl.replace(/^https?:\/\//, '')}</a></div><button onClick={() => handleCopy(shortUrl)} className="flex size-7 shrink-0 items-center justify-center rounded-md text-gray-500 transition-all hover:bg-indigo-100 hover:text-indigo-700 active:scale-90 active:bg-indigo-200 dark:hover:bg-indigo-400/10 dark:hover:text-indigo-200 dark:active:bg-indigo-400/20" aria-label={`Copy ${shortUrl}`} title="Copy short link">▢</button></div>
                    <div><p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-500 md:hidden">Clicks</p><p className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200"><span className="text-gray-500" aria-hidden="true">▥</span>{link.clicks.toLocaleString()}</p></div>
                    <div><p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-500 md:hidden">Created</p><p className="text-xs text-gray-500 dark:text-gray-400">{link.createdAt ? new Date(link.createdAt).toLocaleDateString() : 'Just now'}</p></div>
                  </div>
                )
                })}
              </div>
            )}
            <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 dark:border-white/5"><p className="text-xs text-gray-500">Showing {links.length} of {links.length} links</p></div>
          </div>
        </section>

        <footer className="mt-16 border-t border-gray-200 py-6 text-center text-xs font-medium tracking-wide text-gray-500 dark:border-white/10 dark:text-gray-500">Built by Pranav</footer>
      </div>
      {copyToast && <div role="status" className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 shadow-lg dark:border-white/10 dark:bg-slate-800 dark:text-white">Link copied!</div>}
    </main>
  )
}
