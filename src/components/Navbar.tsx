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
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const params = new URLSearchParams(location.search)
  const activeCat = params.get('cat') ?? 'all'

  return (
    <header
      id="navbar"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        /* Glassmorphism core */
        backdropFilter: 'blur(18px) saturate(1.6)',
        WebkitBackdropFilter: 'blur(18px) saturate(1.6)',
        background: isDark
          ? 'rgba(14, 12, 20, 0.72)'
          : 'rgba(247, 245, 240, 0.72)',
        borderBottom: scrolled
          ? isDark
            ? '1px solid rgba(177,151,252,0.12)'
            : '1px solid rgba(170,255,77,0.18)'
          : '1px solid rgba(128,128,128,0.10)',
        boxShadow: scrolled
          ? isDark
            ? '0 4px 32px rgba(0,0,0,0.45), 0 1px 0 rgba(177,151,252,0.08)'
            : '0 4px 32px rgba(28,25,23,0.10), 0 1px 0 rgba(170,255,77,0.10)'
          : 'none',
        transition: 'background 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[60px] flex items-center gap-8">

        {/* Logo */}
        <Link to="/" id="nav-logo" className="flex items-center gap-2 shrink-0 group">
          <motion.span
            whileHover={{ scale: 1.08, rotate: -4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="w-7 h-7 rounded-[8px] flex items-center justify-center shrink-0"
            style={{
              background: 'var(--color-accent)',
              boxShadow: '0 0 12px var(--color-accent-glow)',
            }}
          >
            <span style={{ color: 'var(--color-accent-text)', fontWeight: 800, fontSize: 11, lineHeight: 1 }}>N</span>
          </motion.span>
          <span className="font-serif-italic text-xl text-ink">Nova</span>
          <span className="font-sans font-bold text-xl text-ink -ml-1">PDF</span>
        </Link>

        {/* Desktop nav links */}
        <nav
          id="nav-links"
          className="hidden lg:flex items-center gap-1 flex-1 justify-center"
          aria-label="Tool categories"
        >
          {categories.filter(c => c.id !== 'all').map((cat) => (
            <Link
              key={cat.id}
              to={`/?cat=${cat.id}`}
              id={`nav-${cat.id}`}
              className={clsx(
                'relative px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
                activeCat === cat.id
                  ? 'text-ink'
                  : 'text-ink-muted hover:text-ink',
              )}
            >
              {/* Active pill background */}
              {activeCat === cat.id && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: isDark
                      ? 'rgba(177,151,252,0.15)'
                      : 'rgba(170,255,77,0.18)',
                    border: isDark
                      ? '1px solid rgba(177,151,252,0.2)'
                      : '1px solid rgba(170,255,77,0.3)',
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">{cat.label}</span>
            </Link>
          ))}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-2 ml-auto shrink-0">

          {/* Search */}
          <button
            id="nav-search"
            aria-label="Search tools"
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
            style={{ color: 'var(--color-ink-muted)' }}
            onMouseEnter={e => {
              const el = e.currentTarget
              el.style.background = isDark ? 'rgba(177,151,252,0.12)' : 'rgba(170,255,77,0.15)'
              el.style.color = 'var(--color-ink)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget
              el.style.background = 'transparent'
              el.style.color = 'var(--color-ink-muted)'
            }}
          >
            <Search size={17} strokeWidth={1.5} />
          </button>

          {/* Theme toggle */}
          <button
            id="nav-theme-toggle"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={toggleTheme}
            className="w-8 h-8 rounded-full flex items-center justify-center relative overflow-hidden transition-all duration-200"
            style={{
              background: isDark ? 'rgba(177,151,252,0.14)' : 'rgba(170,255,77,0.14)',
              border: isDark ? '1px solid rgba(177,151,252,0.25)' : '1px solid rgba(170,255,77,0.3)',
              boxShadow: isDark ? '0 0 12px rgba(177,151,252,0.15)' : '0 0 12px rgba(170,255,77,0.15)',
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isDark ? (
                <motion.span
                  key="sun"
                  initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="absolute"
                >
                  <Sun size={15} strokeWidth={1.8} style={{ color: '#B197FC' }} />
                </motion.span>
              ) : (
                <motion.span
                  key="moon"
                  initial={{ rotate: 90, opacity: 0, scale: 0.6 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: -90, opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="absolute"
                >
                  <Moon size={15} strokeWidth={1.8} style={{ color: '#1A2412' }} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* 20 tools badge */}
          <span
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{
              background: isDark ? 'rgba(177,151,252,0.12)' : 'rgba(170,255,77,0.15)',
              border: isDark ? '1px solid rgba(177,151,252,0.2)' : '1px solid rgba(170,255,77,0.25)',
              color: 'var(--color-ink-muted)',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full inline-block"
              style={{ background: 'var(--color-accent)', boxShadow: '0 0 5px var(--color-accent)' }}
            />
            20 tools
          </span>

          {/* Hamburger */}
          <button
            id="nav-hamburger"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(v => !v)}
            className="lg:hidden w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
            style={{
              color: 'var(--color-ink-muted)',
              background: mobileOpen
                ? isDark ? 'rgba(177,151,252,0.14)' : 'rgba(170,255,77,0.14)'
                : 'transparent',
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen ? (
                <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }} className="absolute">
                  <X size={18} strokeWidth={1.5} />
                </motion.span>
              ) : (
                <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }} className="absolute">
                  <Menu size={18} strokeWidth={1.5} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile drawer — glassmorphic */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            key="mobile-menu"
            initial={{ opacity: 0, y: -12, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -12, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden overflow-hidden"
            style={{
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              background: isDark ? 'rgba(14,12,20,0.85)' : 'rgba(247,245,240,0.88)',
              borderTop: isDark ? '1px solid rgba(177,151,252,0.1)' : '1px solid rgba(170,255,77,0.15)',
            }}
          >
            <nav className="flex flex-col gap-0.5 px-4 py-3">
              <Link
                to="/"
                id="mobile-all-tools"
                className="px-3 py-3.5 rounded-xl text-sm font-medium transition-colors text-ink-muted hover:text-ink"
                style={{ borderBottom: '1px solid rgba(128,128,128,0.1)', marginBottom: 4 }}
              >
                🏠 All tools
              </Link>
              {categories.filter(c => c.id !== 'all').map((cat) => (
                <Link
                  key={cat.id}
                  to={`/?cat=${cat.id}`}
                  id={`mobile-${cat.id}`}
                  className="px-3 py-3.5 rounded-xl text-sm font-medium transition-all duration-200"
                  style={{
                    background: activeCat === cat.id
                      ? isDark ? 'rgba(177,151,252,0.15)' : 'rgba(170,255,77,0.15)'
                      : 'transparent',
                    color: activeCat === cat.id ? 'var(--color-ink)' : 'var(--color-ink-muted)',
                    fontWeight: activeCat === cat.id ? 600 : 400,
                  }}
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
