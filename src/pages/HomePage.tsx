import { useState, useEffect, useRef, type ComponentType } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Clock, X } from 'lucide-react'
import { tools, categories, type Tool, type CategoryId } from '../data/tools'
import { ToolCard, FeaturedToolCard } from '../components/ToolCard'
import { ScrollBookSection } from '../components/ScrollBookSection'
import clsx from 'clsx'

/* ── localStorage ──────────────────────────────────────────────────────────── */
const LS_KEY = 'novapdf:recent'
function getRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]') as string[] }
  catch { return [] }
}

/* ── Word-by-word text reveal ──────────────────────────────────────────────── */
function AnimatedWords({
  text,
  color,
  delay = 0,
}: {
  text: string
  color: string
  delay?: number
}) {
  return (
    <span aria-label={text} style={{ display: 'block' }}>
      {text.split(' ').map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.52,
            delay: delay + i * 0.09,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ color, display: 'inline-block', marginRight: '0.26em' }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  )
}

/* ── Hero Section ──────────────────────────────────────────────────────────── */
function HeroSection({
  query,
  onQuery,
}: {
  query: string
  onQuery: (q: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const [HeroCanvas, setHeroCanvas] = useState<ComponentType | null>(null)
  useEffect(() => {
    const timer = setTimeout(() => {
      import('../components/HeroCanvas').then(m => {
        setHeroCanvas(() => m.HeroCanvas)
      })
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section
      id="hero"
      style={{ background: '#1A2412', position: 'relative', overflow: 'hidden' }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 2rem',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          minHeight: 580,
          alignItems: 'center',
        }}
      >
        {/* ── LEFT: text ────────────────────────────────────────────────── */}
        <div style={{ position: 'relative', zIndex: 10, padding: '5rem 3rem 5rem 0' }}>

          {/* Heading — one block, no duplicate */}
          <h1
            className="font-serif-italic"
            style={{
              fontSize: 'clamp(3rem, 4.5vw, 5.4rem)',
              lineHeight: 1.04,
              letterSpacing: '-0.01em',
              margin: '0 0 2.5rem',
            }}
          >
            <AnimatedWords text="Every PDF tool" color="#ffffff" delay={0.15} />
            <AnimatedWords text="you'll ever need." color="#AAFF4D" delay={0.48} />
          </h1>

          {/* Search bar — only persistent UI element */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.9 }}
            style={{ position: 'relative', maxWidth: 440 }}
          >
            <Search
              size={17}
              strokeWidth={1.5}
              style={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#8FAF7E',
                pointerEvents: 'none',
              }}
            />
            <input
              ref={inputRef}
              id="hero-search"
              type="search"
              value={query}
              onChange={e => onQuery(e.target.value)}
              placeholder="Search tools…"
              className="search-bar"
              style={{ width: '100%' }}
              aria-label="Search PDF tools"
            />
            {query && (
              <button
                id="hero-search-clear"
                onClick={() => { onQuery(''); inputRef.current?.focus() }}
                style={{
                  position: 'absolute',
                  right: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#8FAF7E',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
                aria-label="Clear search"
              >
                <X size={15} strokeWidth={1.5} />
              </button>
            )}
          </motion.div>
        </div>

        {/* ── RIGHT: 3D canvas ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: HeroCanvas ? 1 : 0 }}
          transition={{ duration: 1.4, delay: 0.2 }}
          style={{ height: 580, position: 'relative' }}
          aria-hidden="true"
          className="hidden lg:block"
        >
          {HeroCanvas && <HeroCanvas />}
        </motion.div>
      </div>

      {/* Bottom fade into warm page */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 60,
          background: 'linear-gradient(to bottom, transparent, #F7F5F0)',
          pointerEvents: 'none',
        }}
      />
    </section>
  )
}

/* ── Category filter tabs ──────────────────────────────────────────────────── */
function CategoryTabs({
  active,
  onChange,
}: {
  active: string
  onChange: (id: string) => void
}) {
  const tabsRef = useRef<HTMLDivElement>(null)
  const [underline, setUnderline] = useState({ left: 0, width: 0 })

  useEffect(() => {
    const container = tabsRef.current
    if (!container) return
    const activeBtn = container.querySelector<HTMLButtonElement>(`[data-cat="${active}"]`)
    if (!activeBtn) return
    const rect = activeBtn.getBoundingClientRect()
    const cRect = container.getBoundingClientRect()
    setUnderline({ left: rect.left - cRect.left, width: rect.width })
  }, [active])

  return (
    <div
      ref={tabsRef}
      id="category-tabs"
      className="relative flex gap-1 overflow-x-auto pb-px scrollbar-none"
      role="tablist"
    >
      {/* Sliding lime underline */}
      <motion.span
        className="absolute bottom-0 h-0.5 rounded-full pointer-events-none"
        style={{ background: '#AAFF4D' }}
        animate={{ left: underline.left, width: underline.width }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      />

      {categories.map(cat => (
        <button
          key={cat.id}
          role="tab"
          data-cat={cat.id}
          id={`tab-${cat.id}`}
          aria-selected={active === cat.id}
          onClick={() => onChange(cat.id)}
          className={clsx(
            'shrink-0 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap',
            active === cat.id
              ? 'text-ink'
              : 'text-ink-muted hover:text-ink hover:bg-canvas',
          )}
          style={active === cat.id ? { background: 'rgba(170,255,77,0.10)' } : {}}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}

/* ── Recently used strip — hidden when empty ───────────────────────────────── */
function RecentStrip({ ids }: { ids: string[] }) {
  const recent = ids
    .map(id => tools.find(t => t.id === id))
    .filter(Boolean) as Tool[]

  // Don't render anything until the user has visited at least one tool
  if (recent.length === 0) return null

  return (
    <section id="recently-used" className="mb-10">
      <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-widest mb-3 flex items-center gap-2">
        <Clock size={12} strokeWidth={1.5} className="text-clay" />
        Recently Used
      </h2>
      <div className="scroll-strip">
        {recent.slice(0, 8).map(tool => (
          <Link
            key={tool.id}
            to={`/tool/${tool.id}`}
            id={`recent-${tool.id}`}
            className="bento-card shrink-0 w-36 p-4 flex flex-col items-center gap-2 text-center block"
          >
            <span className="text-xs cat-label text-ink-faint">{tool.category}</span>
            <p className="text-xs font-semibold text-ink leading-tight">{tool.name}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}

/* ── Bento grid ────────────────────────────────────────────────────────────── */
function BentoGrid({ toolList }: { toolList: Tool[] }) {
  if (toolList.length === 0) {
    return (
      <div className="col-span-4 border border-dashed border-clay-light rounded-2xl py-20 text-center">
        <Search size={32} strokeWidth={1.5} className="mx-auto mb-4 text-clay opacity-40" />
        <p className="text-ink-muted text-sm">No tools match your search.</p>
      </div>
    )
  }

  return (
    <div
      id="tool-grid"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[minmax(180px,auto)]"
    >
      <AnimatePresence mode="wait">
        {toolList.map((tool, i) =>
          tool.featured ? (
            <FeaturedToolCard key={tool.id} tool={tool} index={i} />
          ) : (
            <ToolCard key={tool.id} tool={tool} index={i} />
          ),
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Page ──────────────────────────────────────────────────────────────────── */
export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const catParam = (searchParams.get('cat') ?? 'all') as CategoryId | 'all'

  const [query, setQuery] = useState('')
  const [activeCat, setActiveCat] = useState<string>(catParam)
  const [recentIds] = useState(getRecent)

  useEffect(() => {
    setActiveCat(searchParams.get('cat') ?? 'all')
  }, [searchParams])

  const handleCatChange = (id: string) => {
    setActiveCat(id)
    setQuery('')
    if (id === 'all') setSearchParams({})
    else setSearchParams({ cat: id })
  }

  const filtered = tools.filter(t => {
    const matchCat = activeCat === 'all' || t.category === activeCat
    const q = query.trim().toLowerCase()
    const matchQ =
      q === '' ||
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q)
    return matchCat && matchQ
  })

  return (
    <>
      <HeroSection query={query} onQuery={setQuery} />
      <ScrollBookSection />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <RecentStrip ids={recentIds} />

        {/* Section heading */}
        <div className="flex items-center gap-3 mb-5">
          <h2 className="font-serif text-2xl text-ink">
            {activeCat === 'all'
              ? 'All Tools'
              : categories.find(c => c.id === activeCat)?.label}
          </h2>
          <span className="w-1.5 h-1.5 rounded-full bg-clay opacity-60 shrink-0" />
          <span className="text-sm text-ink-faint">{filtered.length} tools</span>
          <div className="flex-1 h-px bg-divider ml-2" />
        </div>

        {/* Category tabs */}
        <div className="mb-7">
          <CategoryTabs active={activeCat} onChange={handleCatChange} />
        </div>

        {/* Bento grid */}
        <BentoGrid toolList={filtered} />
      </div>
    </>
  )
}
