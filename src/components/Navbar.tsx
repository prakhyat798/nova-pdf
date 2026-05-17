import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, Menu, X, Moon, Sun } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { categories } from '../data/tools'
import { useTheme } from '../hooks/useTheme'
import clsx from 'clsx'

export function Navbar() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { isDark, toggle: toggleTheme } = useTheme()

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

        {/* Right: search + theme toggle + badge + hamburger */}
        <div className="flex items-center gap-2 ml-auto shrink-0">
          <button
            id="nav-search"
            aria-label="Search tools"
            className="w-8 h-8 rounded-full flex items-center justify-center text-ink-muted hover:text-ink hover:bg-clay-light/40 transition-colors"
          >
            <Search size={17} strokeWidth={1.5} />
          </button>

          {/* Theme toggle */}
          <button
            id="nav-theme-toggle"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={toggleTheme}
            className="w-8 h-8 rounded-full flex items-center justify-center text-ink-muted hover:text-ink transition-colors relative overflow-hidden"
            style={{ background: isDark ? 'rgba(177,151,252,0.1)' : 'rgba(170,255,77,0.1)' }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isDark ? (
                <motion.span
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute"
                >
                  <Sun size={16} strokeWidth={1.5} style={{ color: '#B197FC' }} />
                </motion.span>
              ) : (
                <motion.span
                  key="moon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute"
                >
                  <Moon size={16} strokeWidth={1.5} style={{ color: '#1A2412' }} />
                </motion.span>
              )}
            </AnimatePresence>
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

      {/* Mobile drawer — animated */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            key="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="lg:hidden border-t border-divider bg-canvas px-4 py-3"
          >
            <nav className="flex flex-col gap-0.5">
              {/* Home — all tools */}
              <Link
                to="/"
                id="mobile-all-tools"
                className="px-3 py-3.5 rounded-xl text-sm font-medium transition-colors text-ink-muted hover:text-ink hover:bg-canvas/80 border-b border-divider mb-1"
              >
                🏠 All tools
              </Link>
              {categories.filter(c => c.id !== 'all').map((cat) => (
                <Link
                  key={cat.id}
                  to={`/?cat=${cat.id}`}
                  id={`mobile-${cat.id}`}
                  className={clsx(
                    'px-3 py-3.5 rounded-xl text-sm font-medium transition-colors',
                    activeCat === cat.id
                      ? 'bg-lime/15 text-forest font-semibold'
                      : 'text-ink-muted hover:text-ink hover:bg-canvas/80',
                  )}
                >
                  {cat.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
