import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import type { Tool } from '../data/tools'
import { PageStackIllustration } from './PageStackIllustration'
import clsx from 'clsx'

/* ── Category label styles ─────────────────────────────────────────────────── */
const catStyles: Record<string, { text: string; bg: string }> = {
  convert:  { text: 'text-forest',      bg: 'bg-sage/10' },
  organize: { text: 'text-forest',      bg: 'bg-lime/15' },
  edit:     { text: 'text-forest',      bg: 'bg-clay/20' },
  security: { text: 'text-forest',      bg: 'bg-sage/15' },
  optimize: { text: 'text-forest',      bg: 'bg-lime/20' },
}

/* ── Icon resolver ─────────────────────────────────────────────────────────── */
type LucideIcon = React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>

function getIcon(name: string): LucideIcon {
  const pascal = name.split('-').map(s => s[0].toUpperCase() + s.slice(1)).join('')
  return (Icons as unknown as Record<string, LucideIcon>)[pascal] ?? Icons.File
}

/* ── Card variants ─────────────────────────────────────────────────────────── */
const cardVariants = {
  hidden:  { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.42, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as number[] },
  }),
}

/* ── Regular tool card ─────────────────────────────────────────────────────── */
interface ToolCardProps {
  tool: Tool
  index: number
}

export function ToolCard({ tool, index }: ToolCardProps) {
  const Icon = getIcon(tool.icon)
  const cat = catStyles[tool.category]

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="h-full"
    >
      <Link
        to={`/tool/${tool.id}`}
        id={`tool-card-${tool.id}`}
        className="bento-card p-5 flex flex-col gap-4 h-full group block"
        aria-label={`Open ${tool.name}`}
      >
        {/* Top row: category label + hot dot */}
        <div className="flex items-center justify-between">
          <span className={clsx('cat-label px-2 py-0.5 rounded-md', cat.text, cat.bg)}>
            {tool.category}
          </span>
          {tool.hot && (
            <span
              className="w-2 h-2 rounded-full bg-lime shadow-[0_0_6px_rgba(170,255,77,0.8)]"
              title="Popular"
              aria-label="Popular tool"
            />
          )}
        </div>

        {/* Icon */}
        <div className="flex-1 flex items-center justify-center py-2">
          <Icon size={40} strokeWidth={1.5} className="text-sage group-hover:text-forest transition-colors duration-200" />
        </div>

        {/* Name + description */}
        <div>
          <p className="font-semibold text-sm text-ink mb-1 leading-tight">{tool.name}</p>
          <p className="text-xs text-ink-faint leading-relaxed line-clamp-2">{tool.description}</p>
        </div>
      </Link>
    </motion.div>
  )
}

/* ── Featured (wide) card — spans 2 columns ────────────────────────────────── */
export function FeaturedToolCard({ tool, index }: ToolCardProps) {
  const Icon = getIcon(tool.icon)
  const cat = catStyles[tool.category]

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="sm:col-span-2 h-full"
    >
      <Link
        to={`/tool/${tool.id}`}
        id={`tool-card-featured-${tool.id}`}
        className="bento-card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 group block h-full"
        aria-label={`Open ${tool.name}`}
      >
        {/* Left: info */}
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className={clsx('cat-label px-2 py-0.5 rounded-md', cat.text, cat.bg)}>
              {tool.category}
            </span>
            {tool.hot && (
              <span className="w-2 h-2 rounded-full bg-lime shadow-[0_0_6px_rgba(170,255,77,0.8)]" title="Popular" />
            )}
          </div>

          <div className="flex items-center gap-3">
            <Icon size={32} strokeWidth={1.5} className="text-sage shrink-0 group-hover:text-forest transition-colors duration-200" />
            <div>
              <p className="font-semibold text-base text-ink leading-tight">{tool.name}</p>
              <p className="text-sm text-ink-muted mt-0.5 leading-relaxed line-clamp-2">{tool.description}</p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 text-xs text-sage font-medium group-hover:text-forest transition-colors">
            Open tool
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="translate-x-0 group-hover:translate-x-0.5 transition-transform">
              <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>

        {/* Right: illustration */}
        <div className="shrink-0 opacity-60 group-hover:opacity-80 transition-opacity duration-200">
          <PageStackIllustration className="w-16 h-20" />
        </div>
      </Link>
    </motion.div>
  )
}
