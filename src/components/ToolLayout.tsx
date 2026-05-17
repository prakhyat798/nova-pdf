import { useRef, useState, useCallback, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Upload, FileText, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import clsx from 'clsx'

export type FileEntry = { file: File; name: string; size: number }

export type ToolState = 'idle' | 'processing' | 'done' | 'error'

interface ToolLayoutProps {
  toolId: string
  title: string
  description: string
  category: string
  accept: string
  multiple?: boolean
  processLabel?: string
  children?: ReactNode
  onProcess: (files: File[]) => Promise<void>
  onFilesSelected?: (files: File[]) => void
  state: ToolState
  error?: string
  outputName?: string
  outputUrl?: string
  onReset: () => void
}

const catColors: Record<string, string> = {
  convert:  'bg-sage/10 text-forest',
  organize: 'bg-lime/15 text-forest',
  edit:     'bg-clay/20 text-forest',
  security: 'bg-sage/15 text-forest',
  optimize: 'bg-lime/20 text-forest',
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function ToolLayout({
  toolId, title, description, category, accept, multiple = false,
  processLabel = 'Process File', children, onProcess, onFilesSelected, state, error,
  outputName, outputUrl, onReset,
}: ToolLayoutProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<FileEntry[]>([])
  const [dragging, setDragging] = useState(false)

  const addFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return
    const entries: FileEntry[] = Array.from(incoming).map(f => ({
      file: f, name: f.name, size: f.size,
    }))
    setFiles(prev => multiple ? [...prev, ...entries] : entries)
    if (onFilesSelected) onFilesSelected(Array.from(incoming))
  }, [multiple, onFilesSelected])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }, [addFiles])

  const removeFile = (i: number) => setFiles(prev => prev.filter((_, idx) => idx !== i))

  const handleProcess = () => {
    if (files.length === 0) return
    onProcess(files.map(f => f.file))
  }

  const handleReset = () => {
    setFiles([])
    onReset()
  }

  return (
    <div className="min-h-[80vh] px-4 py-12 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Back */}
        <Link
          to="/"
          id={`${toolId}-back`}
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors mb-10 group"
        >
          <ArrowLeft size={15} strokeWidth={1.5} className="group-hover:-translate-x-0.5 transition-transform" />
          All tools
        </Link>

        {/* Header */}
        <div className="mb-8">
          <span className={clsx('cat-label px-2.5 py-1 rounded-md inline-block mb-3', catColors[category] ?? 'bg-sage/10 text-forest')}>
            {category}
          </span>
          <h1 className="font-serif-italic text-4xl sm:text-5xl text-ink mb-2">{title}</h1>
          <p className="text-sm text-ink-muted leading-relaxed max-w-lg">{description}</p>
        </div>

        {/* Main card */}
        <div className="bento-card p-6 sm:p-8 space-y-6">
          <AnimatePresence mode="wait">
            {state === 'done' && outputUrl ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-5 py-8"
              >
                <div className="w-16 h-16 rounded-2xl bg-lime/20 flex items-center justify-center">
                  <CheckCircle2 size={32} strokeWidth={1.5} className="text-forest" />
                </div>
                <div className="text-center">
                  <p className="font-serif-italic text-2xl text-ink mb-1">All done!</p>
                  <p className="text-xs text-ink-muted">{outputName}</p>
                </div>
                <div className="flex gap-3 flex-wrap justify-center">
                  <a
                    id={`${toolId}-download`}
                    href={outputUrl}
                    download={outputName}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-forest text-lime text-sm font-semibold hover:bg-forest/90 transition-colors"
                  >
                    Download
                  </a>
                  <button
                    onClick={handleReset}
                    className="px-5 py-2.5 rounded-full border border-divider text-ink-muted text-sm hover:text-ink hover:border-ink/20 transition-colors"
                  >
                    Process another
                  </button>
                </div>
              </motion.div>
            ) : state === 'error' ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4 py-8"
              >
                <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
                  <AlertCircle size={28} strokeWidth={1.5} className="text-red-400" />
                </div>
                <div className="text-center">
                  <p className="font-serif-italic text-xl text-ink mb-1">Something went wrong</p>
                  <p className="text-xs text-ink-muted max-w-xs">{error ?? 'An unexpected error occurred.'}</p>
                </div>
                <button
                  onClick={handleReset}
                  className="px-5 py-2.5 rounded-full border border-divider text-ink-muted text-sm hover:text-ink transition-colors"
                >
                  Try again
                </button>
              </motion.div>
            ) : (
              <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                {/* Drop zone */}
                <div
                  id={`${toolId}-dropzone`}
                  onDragOver={e => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  onClick={() => inputRef.current?.click()}
                  className={clsx(
                    'border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-3 cursor-pointer transition-all duration-200',
                    dragging
                      ? 'border-lime bg-lime/5 scale-[1.01]'
                      : 'border-divider hover:border-sage/50 hover:bg-sage/5',
                  )}
                >
                  <div className={clsx(
                    'w-14 h-14 rounded-2xl flex items-center justify-center transition-colors',
                    dragging ? 'bg-lime/20' : 'bg-canvas',
                  )}>
                    <Upload size={24} strokeWidth={1.5} className={dragging ? 'text-forest' : 'text-clay'} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-ink">
                      Drop your file{multiple ? 's' : ''} here
                    </p>
                    <p className="text-xs text-ink-muted mt-0.5">
                      or <span className="text-forest underline underline-offset-2">browse</span> · {accept.replace(/\./g, '').toUpperCase()}
                    </p>
                  </div>
                  <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    className="hidden"
                    onChange={e => addFiles(e.target.files)}
                  />
                </div>

                {/* File list */}
                {files.length > 0 && (
                  <ul className="space-y-2">
                    {files.map((f, i) => (
                      <motion.li
                        key={`${f.name}-${i}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-canvas"
                      >
                        <FileText size={16} strokeWidth={1.5} className="text-sage shrink-0" />
                        <span className="text-sm text-ink truncate flex-1">{f.name}</span>
                        <span className="text-xs text-ink-faint shrink-0">{formatSize(f.size)}</span>
                        <button
                          onClick={() => removeFile(i)}
                          className="text-ink-faint hover:text-ink transition-colors shrink-0"
                          aria-label="Remove file"
                        >
                          <X size={14} strokeWidth={1.5} />
                        </button>
                      </motion.li>
                    ))}
                  </ul>
                )}

                {/* Extra controls slot */}
                {children && files.length > 0 && (
                  <div className="pt-1">{children}</div>
                )}

                {/* Process button */}
                {files.length > 0 && (
                  <motion.button
                    id={`${toolId}-process-btn`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    disabled={state === 'processing'}
                    onClick={handleProcess}
                    className={clsx(
                      'w-full py-3.5 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2',
                      state === 'processing'
                        ? 'bg-forest/60 text-lime cursor-not-allowed'
                        : 'bg-forest text-lime hover:bg-forest/90 active:scale-[0.99]',
                    )}
                  >
                    {state === 'processing' ? (
                      <><Loader2 size={16} className="animate-spin" /> Processing…</>
                    ) : processLabel}
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Privacy note */}
        <p className="text-center text-xs text-ink-faint mt-5">
          🔒 All processing happens in your browser · Files never leave your device
        </p>
      </motion.div>
    </div>
  )
}
