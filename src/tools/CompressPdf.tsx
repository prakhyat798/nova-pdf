import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import { ToolLayout, type ToolState } from '../components/ToolLayout'

// Point pdfjs at its worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

/* ── Quality presets ─────────────────────────────────────────────────────── */
const PRESETS = [
  { id: 'low',    label: 'Maximum',  desc: 'Smallest file, lower quality', scale: 0.8, quality: 0.45 },
  { id: 'medium', label: 'Balanced', desc: 'Good balance of size and quality', scale: 1.0, quality: 0.65 },
  { id: 'high',   label: 'High',     desc: 'Near-lossless, moderate reduction', scale: 1.2, quality: 0.82 },
] as const

type PresetId = (typeof PRESETS)[number]['id']

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function CompressPdf() {
  const [state, setState] = useState<ToolState>('idle')
  const [error, setError] = useState<string>()
  const [outputUrl, setOutputUrl] = useState<string>()
  const [outputName, setOutputName] = useState<string>()
  const [preset, setPreset] = useState<PresetId>('medium')
  const [progress, setProgress] = useState(0)
  const [resultInfo, setResultInfo] = useState<{ original: number; compressed: number } | null>(null)

  const process = async (files: File[]) => {
    const p = PRESETS.find(x => x.id === preset)!
    try {
      setState('processing')
      setProgress(0)
      setResultInfo(null)
      const file = files[0]
      const originalSize = file.size
      const bytes = await file.arrayBuffer()

      // 1. Load PDF with pdfjs for rendering
      const loadingTask = pdfjsLib.getDocument({ data: bytes.slice(0) })
      const pdfDoc = await loadingTask.promise
      const numPages = pdfDoc.numPages

      // 2. Create a fresh output PDF
      const outDoc = await PDFDocument.create()

      // 3. Render each page to canvas → JPEG → embed into new PDF
      for (let i = 1; i <= numPages; i++) {
        setProgress(Math.round((i / numPages) * 90))
        const page = await pdfDoc.getPage(i)
        const viewport = page.getViewport({ scale: p.scale })

        const canvas = document.createElement('canvas')
        canvas.width = Math.round(viewport.width)
        canvas.height = Math.round(viewport.height)
        const ctx = canvas.getContext('2d')!

        // @ts-ignore – pdfjs RenderParameters mismatch with strict types
        await page.render({ canvasContext: ctx, viewport }).promise

        // Convert page canvas → JPEG blob at target quality
        const jpegDataUrl = canvas.toDataURL('image/jpeg', p.quality)
        const jpegBase64 = jpegDataUrl.replace(/^data:image\/jpeg;base64,/, '')
        const jpegBytes = Uint8Array.from(atob(jpegBase64), c => c.charCodeAt(0))

        const embeddedImg = await outDoc.embedJpg(jpegBytes)
        const outPage = outDoc.addPage([viewport.width, viewport.height])
        outPage.drawImage(embeddedImg, {
          x: 0,
          y: 0,
          width: viewport.width,
          height: viewport.height,
        })
      }

      setProgress(95)
      const saved = await outDoc.save()
      const blob = new Blob([saved], { type: 'application/pdf' })

      setProgress(100)
      setResultInfo({ original: originalSize, compressed: blob.size })

      const name = file.name.replace(/\.pdf$/i, '-compressed.pdf')
      setOutputName(name)
      setOutputUrl(URL.createObjectURL(blob))
      setState('done')
    } catch (e: any) {
      setError(e.message ?? 'Failed to compress PDF.')
      setState('error')
    }
  }

  const reduction = resultInfo
    ? ((1 - resultInfo.compressed / resultInfo.original) * 100).toFixed(1)
    : null

  return (
    <ToolLayout
      toolId="compress-pdf"
      title="Compress PDF"
      description="Reduce PDF file size by re-rendering pages at optimized quality. Choose how aggressively to compress."
      category="optimize"
      accept=".pdf"
      processLabel="Compress PDF"
      onProcess={process}
      state={state}
      error={error}
      outputName={outputName}
      outputUrl={outputUrl}
      onReset={() => {
        setState('idle')
        setError(undefined)
        setOutputUrl(undefined)
        setResultInfo(null)
        setProgress(0)
      }}
    >
      {/* Quality preset selector */}
      {state === 'idle' && (
        <div className="space-y-3">
          <p className="text-xs text-ink-muted font-semibold uppercase tracking-widest">Compression level</p>
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map(p => (
              <button
                key={p.id}
                onClick={() => setPreset(p.id)}
                className="flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all duration-200 text-left"
                style={{
                  borderColor: preset === p.id ? 'var(--color-accent)' : 'var(--color-divider)',
                  background: preset === p.id ? 'var(--color-accent-glow)' : 'transparent',
                }}
              >
                <span className="text-sm font-semibold text-ink w-full">{p.label}</span>
                <span className="text-[11px] text-ink-muted leading-tight">{p.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Progress bar while processing */}
      {state === 'processing' && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-ink-muted">
            <span>Rendering pages…</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-divider)' }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%`, background: 'var(--color-accent)' }}
            />
          </div>
        </div>
      )}

      {/* Result stats */}
      {state === 'done' && resultInfo && (
        <div className="flex items-center justify-center gap-6 py-2">
          <div className="text-center">
            <p className="text-xs text-ink-muted mb-0.5">Original</p>
            <p className="text-sm font-semibold text-ink">{formatSize(resultInfo.original)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-ink-muted mb-0.5">Saved</p>
            <p className="text-lg font-bold" style={{ color: 'var(--color-accent)' }}>
              {reduction && parseFloat(reduction) > 0 ? `−${reduction}%` : 'Optimized'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-ink-muted mb-0.5">Compressed</p>
            <p className="text-sm font-semibold text-ink">{formatSize(resultInfo.compressed)}</p>
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
