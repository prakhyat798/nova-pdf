import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, Menu, X } from 'lucide-react'
import { categories } from '../data/tools'
import clsx from 'clsx'

export function Navbar() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  // Determine active category from URL search param
  const params = new URLSearchParams(location.search)
  const activeCat = params.get('cat') ?? 'all'

  return (
    <header
      id="navbar"
      className={clsx(
        'sticky top-0 z-50 bg-canvas transition-shadow duration-200',
        scrolled ? 'shadow-[0_1px_0_0_#E8E4DD]' : 'border-b border-divider',
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[60px] flex items-center gap-8">

        {/* Logo */}
        <Link to="/" id="nav-logo" className="flex items-center gap-2 shrink-0">
          {/* Lime square icon */}
          <span className="w-6 h-6 rounded-[6px] bg-lime flex items-center justify-center shrink-0">
            <span className="text-forest font-bold text-[10px] leading-none">N</span>
          </span>
          <span className="font-serif-italic text-xl text-ink">Nova</span>
          <span className="font-sans font-bold text-xl text-ink -ml-1">PDF</span>
        </Link>

        {/* Desktop nav links */}
        <nav
          id="nav-links"
          className="hidden lg:flex items-center gap-6 flex-1 justify-center"
          aria-label="Tool categories"
        >
          {categories.filter(c => c.id !== 'all').map((cat) => (
            <Link
              key={cat.id}
              to={`/?cat=${cat.id}`}
              id={`nav-${cat.id}`}
              className={clsx('nav-link', activeCat === cat.id && 'active')}
            >
              {cat.label}
            </Link>
          ))}
        </nav>

        {/* Right: search + badge */}
        <div className="flex items-center gap-3 ml-auto shrink-0">
          <button
            id="nav-search"
            aria-label="Search tools"
            className="w-8 h-8 rounded-full flex items-center justify-center text-ink-muted hover:text-ink hover:bg-clay-light/40 transition-colors"
          >
            <Search size={17} strokeWidth={1.5} />
          </button>

          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill bg-sage-light text-forest text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-sage inline-block" />
            20 tools
          </span>

          {/* Hamburger */}
          <button
            id="nav-hamburger"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(v => !v)}
            className="lg:hidden w-8 h-8 rounded-full flex items-center justify-center text-ink-muted hover:text-ink hover:bg-clay-light/40 transition-colors"
          >
            {mobileOpen ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          className="lg:hidden border-t border-divider bg-card px-4 py-4"
        >
          <nav className="flex flex-col gap-1">
            {categories.filter(c => c.id !== 'all').map((cat) => (
              <Link
                key={cat.id}
                to={`/?cat=${cat.id}`}
                id={`mobile-${cat.id}`}
                className={clsx(
                  'px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  activeCat === cat.id
                    ? 'bg-lime/20 text-forest font-semibold'
                    : 'text-ink-muted hover:text-ink hover:bg-canvas',
                )}
              >
                {cat.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
