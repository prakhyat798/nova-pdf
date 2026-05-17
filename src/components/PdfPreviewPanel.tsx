import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, FileText, Loader2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import * as pdfjsLib from 'pdfjs-dist'

// Use the worker bundled with pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url,
).toString()

interface PdfPreviewPanelProps {
  /** The source file or blob URL to preview */
  source: File | string | null
  /** Optional label shown above the panel */
  label?: string
  /** Accent color class for the label badge */
  accent?: 'lime' | 'sage' | 'clay'
}

interface PageInfo {
  pageNum: number
  canvas: HTMLCanvasElement
}

const SCALE_STEPS = [0.6, 0.8, 1.0, 1.25, 1.5, 2.0]
const DEFAULT_SCALE_IDX = 2

export function PdfPreviewPanel({ source, label = 'Preview', accent = 'lime' }: PdfPreviewPanelProps) {
  const [pages, setPages] = useState<PageInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [scaleIdx, setScaleIdx] = useState(DEFAULT_SCALE_IDX)
  const taskRef = useRef<AbortController | null>(null)

  const scale = SCALE_STEPS[scaleIdx]

  const loadPdf = useCallback(async (src: File | string) => {
    // Cancel any in-progress render
    taskRef.current?.abort()
    const ctrl = new AbortController()
    taskRef.current = ctrl

    setLoading(true)
    setError(null)
    setPages([])
    setCurrentPage(0)

    try {
      let data: ArrayBuffer
      if (src instanceof File) {
        data = await src.arrayBuffer()
      } else {
        const resp = await fetch(src, { signal: ctrl.signal })
        data = await resp.arrayBuffer()
      }

      if (ctrl.signal.aborted) return

      const pdf = await pdfjsLib.getDocument({ data }).promise
      setTotalPages(pdf.numPages)

      const rendered: PageInfo[] = []
      for (let i = 1; i <= pdf.numPages; i++) {
        if (ctrl.signal.aborted) return

        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale })

        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        const ctx = canvas.getContext('2d')!

        // @ts-ignore
        await page.render({ canvasContext: ctx, viewport }).promise

        if (ctrl.signal.aborted) return
        rendered.push({ pageNum: i, canvas })
        // Update incrementally so first page appears fast
        setPages([...rendered])
      }

      setLoading(false)
    } catch (e: any) {
      if (e?.name === 'AbortError' || ctrl.signal.aborted) return
      setError('Could not render PDF preview.')
      setLoading(false)
    }
  }, [scale])

  useEffect(() => {
    if (!source) {
      setPages([])
      setTotalPages(0)
      setCurrentPage(0)
      setError(null)
      setLoading(false)
      return
    }
    loadPdf(source)
    return () => { taskRef.current?.abort() }
  }, [source, loadPdf])

  const accentStyles = {
    lime:  { badge: 'bg-lime/20 text-forest',   dot: '#AAFF4D' },
    sage:  { badge: 'bg-sage/20 text-forest',   dot: '#8FAF7E' },
    clay:  { badge: 'bg-clay/20 text-ink-muted', dot: '#D4B896' },
  }[accent]

  if (!source) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      {/* ── Panel header ─────────────────────────────── */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className={`cat-label px-2 py-0.5 rounded-md text-[10px] font-bold tracking-widest uppercase ${accentStyles.badge}`}
          >
            {label}
          </span>
          {totalPages > 0 && (
            <span className="text-xs text-ink-muted">
              {totalPages} page{totalPages > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Zoom controls */}
        {pages.length > 0 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setScaleIdx(i => Math.max(0, i - 1))}
              disabled={scaleIdx === 0}
              title="Zoom out"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-ink-muted hover:text-ink hover:bg-canvas transition-colors disabled:opacity-30"
            >
              <ZoomOut size={14} strokeWidth={1.5} />
            </button>
            <span className="text-xs text-ink-muted w-9 text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScaleIdx(i => Math.min(SCALE_STEPS.length - 1, i + 1))}
              disabled={scaleIdx === SCALE_STEPS.length - 1}
              title="Zoom in"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-ink-muted hover:text-ink hover:bg-canvas transition-colors disabled:opacity-30"
            >
              <ZoomIn size={14} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setScaleIdx(DEFAULT_SCALE_IDX)}
              title="Reset zoom"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-ink-muted hover:text-ink hover:bg-canvas transition-colors"
            >
              <RotateCcw size={12} strokeWidth={1.5} />
            </button>
          </div>
        )}
      </div>

      {/* ── Preview viewport ──────────────────────────── */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: '#F0EDE8',
          border: '1px solid rgba(28,25,23,0.08)',
          minHeight: 220,
        }}
      >
        <AnimatePresence mode="wait">
          {loading && pages.length === 0 ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            >
              <Loader2 size={24} strokeWidth={1.5} className="text-sage animate-spin" />
              <p className="text-xs text-ink-muted">Rendering preview…</p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center"
            >
              <FileText size={28} strokeWidth={1} className="text-clay opacity-50" />
              <p className="text-xs text-ink-muted">{error}</p>
            </motion.div>
          ) : pages.length > 0 ? (
            <motion.div
              key="canvas"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="overflow-auto p-4 flex justify-center"
              style={{ maxHeight: 480 }}
            >
              <canvas
                ref={el => {
                  if (el && pages[currentPage]) {
                    // Copy the off-screen canvas into this element
                    el.width = pages[currentPage].canvas.width
                    el.height = pages[currentPage].canvas.height
                    el.getContext('2d')?.drawImage(pages[currentPage].canvas, 0, 0)
                  }
                }}
                style={{
                  borderRadius: 8,
                  boxShadow: '0 4px 20px rgba(28,25,23,0.14)',
                  maxWidth: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Incremental load badge */}
        {loading && pages.length > 0 && (
          <div
            className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs text-forest"
            style={{ background: 'rgba(170,255,77,0.18)', backdropFilter: 'blur(4px)' }}
          >
            <Loader2 size={11} className="animate-spin" />
            Loading more…
          </div>
        )}
      </div>

      {/* ── Page navigation ───────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-3">
          <button
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="w-8 h-8 rounded-full flex items-center justify-center border border-divider text-ink-muted hover:text-ink hover:border-ink/20 transition-colors disabled:opacity-30"
          >
            <ChevronLeft size={15} strokeWidth={1.5} />
          </button>

          {/* Page pills */}
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
              const pageIdx = totalPages <= 7
                ? i
                : currentPage <= 3
                  ? i
                  : currentPage >= totalPages - 4
                    ? totalPages - 7 + i
                    : currentPage - 3 + i
              const isActive = pageIdx === currentPage
              const isLoaded = !!pages[pageIdx]
              return (
                <button
                  key={pageIdx}
                  onClick={() => setCurrentPage(pageIdx)}
                  title={`Page ${pageIdx + 1}`}
                  style={{
                    width: isActive ? 24 : 8,
                    height: 8,
                    borderRadius: 9999,
                    background: isActive ? accentStyles.dot : isLoaded ? '#C8C4BE' : '#E0DDD8',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    padding: 0,
                  }}
                />
              )
            })}
          </div>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage === totalPages - 1}
            className="w-8 h-8 rounded-full flex items-center justify-center border border-divider text-ink-muted hover:text-ink hover:border-ink/20 transition-colors disabled:opacity-30"
          >
            <ChevronRight size={15} strokeWidth={1.5} />
          </button>

          <span className="text-xs text-ink-muted ml-1">
            {currentPage + 1} / {totalPages}
          </span>
        </div>
      )}
    </motion.div>
  )
}
