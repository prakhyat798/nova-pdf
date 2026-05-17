import { useState } from 'react'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import { ToolLayout, type ToolState } from '../components/ToolLayout'
import JSZip from 'jszip'
import clsx from 'clsx'

// Set the worker source
GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString()

const QUALITIES: { id: string; label: string; scale: number }[] = [
  { id: 'low',    label: 'Low (72 dpi)',    scale: 1   },
  { id: 'medium', label: 'Medium (144 dpi)', scale: 2   },
  { id: 'high',   label: 'High (216 dpi)',   scale: 3   },
]

export function PdfToJpg() {
  const [state, setState] = useState<ToolState>('idle')
  const [error, setError] = useState<string>()
  const [outputUrl, setOutputUrl] = useState<string>()
  const [outputName, setOutputName] = useState<string>()
  const [quality, setQuality] = useState('medium')
  const [previews, setPreviews] = useState<string[]>([])
  const [progress, setProgress] = useState(0)

  const process = async (files: File[]) => {
    try {
      setState('processing')
      setProgress(0)
      const bytes = await files[0].arrayBuffer()
      const scale = QUALITIES.find(q => q.id === quality)?.scale ?? 2

      const pdf = await getDocument({ data: bytes }).promise
      const pageCount = pdf.numPages
      const urls: string[] = []

      for (let i = 1; i <= pageCount; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale })
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        const ctx = canvas.getContext('2d')!
        await page.render({ canvasContext: ctx as any, viewport, canvas } as any).promise
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
        urls.push(dataUrl)
        setProgress(Math.round((i / pageCount) * 100))
      }

      setPreviews(urls)

      if (urls.length === 1) {
        // Single page — direct JPG download
        const res = await fetch(urls[0])
        const blob = await res.blob()
        const name = files[0].name.replace(/\.pdf$/i, '-page-1.jpg')
        setOutputName(name)
        setOutputUrl(URL.createObjectURL(blob))
      } else {
        // Multiple pages — bundle all JPGs into a ZIP
        const zip = new JSZip()
        const baseName = files[0].name.replace(/\.pdf$/i, '')
        for (let i = 0; i < urls.length; i++) {
          const res = await fetch(urls[i])
          const buf = await res.arrayBuffer()
          zip.file(`${baseName}-page-${i + 1}.jpg`, buf)
        }
        const zipBuf = await zip.generateAsync({ type: 'arraybuffer', compression: 'DEFLATE' })
        const blob = new Blob([zipBuf], { type: 'application/zip' })
        const zipName = `${baseName}-images.zip`
        setOutputName(zipName)
        setOutputUrl(URL.createObjectURL(blob))
      }

      setState('done')
    } catch (e: any) {
      setError(e.message ?? 'Failed to convert PDF to images.')
      setState('error')
    }
  }

  return (
    <>
      <ToolLayout
        toolId="pdf-to-jpg"
        title="PDF to JPG"
        description="Export every PDF page as a high-res JPG. Multiple pages are bundled into a ZIP."
        category="convert"
        accept=".pdf"
        processLabel="Convert to JPG"
        onProcess={process}
        state={state}
        error={error}
        outputName={outputName}
        outputUrl={outputUrl}
        onReset={() => { setState('idle'); setError(undefined); setOutputUrl(undefined); setPreviews([]); setProgress(0) }}
      >
        <div className="space-y-2">
          <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide">Quality</label>
          <div className="flex gap-2">
            {QUALITIES.map(q => (
              <button
                key={q.id}
                id={`quality-${q.id}`}
                onClick={() => setQuality(q.id)}
                className={clsx(
                  'flex-1 py-2 rounded-xl text-xs border transition-all',
                  quality === q.id ? 'bg-forest text-lime border-forest' : 'border-divider text-ink-muted hover:border-sage/40',
                )}
              >
                {q.label}
              </button>
            ))}
          </div>
          {state === 'processing' && progress > 0 && (
            <div className="space-y-1">
              <div className="w-full bg-divider rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-forest rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-ink-faint text-center">{progress}% rendered</p>
            </div>
          )}
        </div>
      </ToolLayout>

      {previews.length > 1 && state === 'done' && (
        <div className="max-w-3xl mx-auto px-4 pb-10">
          <p className="text-xs text-ink-muted mb-3 text-center">
            {previews.length} pages — click each to download individually
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {previews.map((url, i) => (
              <a key={i} href={url} download={`page-${i + 1}.jpg`} className="block rounded-xl overflow-hidden border border-divider hover:border-sage/50 transition-colors">
                <img src={url} alt={`Page ${i + 1}`} className="w-full h-auto" />
                <p className="text-xs text-center text-ink-muted py-1.5">Page {i + 1}</p>
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
