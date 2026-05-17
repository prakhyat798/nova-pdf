import { useState, useRef, useCallback } from 'react'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import { ToolLayout, type ToolState } from '../components/ToolLayout'

GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString()

interface Annotation { x: number; y: number; text: string }

export function EditPdf() {
  const [state, setState] = useState<ToolState>('idle')
  const [error, setError] = useState<string>()
  const [outputUrl, setOutputUrl] = useState<string>()
  const [outputName, setOutputName] = useState<string>()
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [pagePreview, setPagePreview] = useState<string | null>(null)
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null)
  const [fileName, setFileName] = useState('')
  const [pendingText, setPendingText] = useState('')
  const [clickPos, setClickPos] = useState<{ x: number; y: number } | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const previewFile = useCallback(async (file: File) => {
    const bytes = await file.arrayBuffer()
    setPdfBytes(bytes)
    setFileName(file.name)
    setAnnotations([])
    setPagePreview(null)
    const pdf = await getDocument({ data: bytes.slice(0) }).promise
    const page = await pdf.getPage(1)
    const viewport = page.getViewport({ scale: 1.4 })
    const canvas = canvasRef.current!
    canvas.width = viewport.width
    canvas.height = viewport.height
    await page.render({ canvasContext: canvas.getContext('2d') as any, viewport, canvas } as any).promise
    setPagePreview(canvas.toDataURL())
  }, [])

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setClickPos({ x, y })
  }

  const addAnnotation = () => {
    if (!clickPos || !pendingText.trim()) return
    setAnnotations(prev => [...prev, { ...clickPos, text: pendingText }])
    setPendingText('')
    setClickPos(null)
  }

  const process = async (files: File[]) => {
    try {
      setState('processing')
      const bytes = pdfBytes ?? await files[0].arrayBuffer()
      const doc = await PDFDocument.load(bytes)
      const font = await doc.embedFont(StandardFonts.Helvetica)
      const firstPage = doc.getPages()[0]
      const { width, height } = firstPage.getSize()

      annotations.forEach(ann => {
        firstPage.drawText(ann.text, {
          x: (ann.x / 100) * width,
          y: height - (ann.y / 100) * height,
          font, size: 12,
          color: rgb(0.1, 0.1, 0.7),
        })
      })

      const saved = await doc.save()
      const blob = new Blob([saved], { type: 'application/pdf' })
      const name = (fileName || files[0].name).replace('.pdf', '-edited.pdf')
      setOutputName(name)
      setOutputUrl(URL.createObjectURL(blob))
      setState('done')
    } catch (e: any) {
      setError(e.message ?? 'Failed to edit PDF.')
      setState('error')
    }
  }

  return (
    <ToolLayout
      toolId="edit-pdf"
      title="Edit PDF"
      description="Add text annotations directly on your PDF pages."
      category="edit"
      accept=".pdf"
      processLabel="Save Edited PDF"
      onProcess={process}
      onFilesSelected={files => { if (files[0]) previewFile(files[0]) }}
      state={state}
      error={error}
      outputName={outputName}
      outputUrl={outputUrl}
      onReset={() => {
        setState('idle'); setError(undefined); setOutputUrl(undefined)
        setAnnotations([]); setPagePreview(null); setPdfBytes(null); setFileName('')
      }}
    >
      <canvas ref={canvasRef} className="hidden" />
      {!pagePreview && pdfBytes === null && (
        <p className="text-xs text-ink-faint text-center">Upload a PDF above — a preview will appear here for annotation</p>
      )}
      {pagePreview && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide">
            ✏️ Click anywhere on the page to add text
          </p>
          <div
            className="relative cursor-crosshair rounded-xl overflow-hidden border border-divider"
            onClick={handleCanvasClick}
          >
            <img src={pagePreview} alt="PDF page 1 preview" className="w-full pointer-events-none" />
            {annotations.map((ann, i) => (
              <span
                key={i}
                className="absolute text-xs text-blue-700 font-medium pointer-events-none whitespace-nowrap bg-white/80 px-1 rounded"
                style={{ left: `${ann.x}%`, top: `${ann.y}%`, transform: 'translate(-50%,-50%)' }}
              >
                {ann.text}
              </span>
            ))}
            {clickPos && (
              <div
                className="absolute z-10"
                style={{ left: `${clickPos.x}%`, top: `${clickPos.y}%`, transform: 'translate(-50%,-50%)' }}
                onClick={e => e.stopPropagation()}
              >
                <div className="flex gap-1 items-center bg-white shadow-lg rounded-xl px-2 py-1.5 border border-divider">
                  <input
                    autoFocus
                    value={pendingText}
                    onChange={e => setPendingText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') addAnnotation(); if (e.key === 'Escape') setClickPos(null) }}
                    placeholder="Type text…"
                    className="text-xs outline-none w-32 text-ink"
                  />
                  <button onClick={addAnnotation} className="text-xs text-forest font-bold">✓</button>
                  <button onClick={() => setClickPos(null)} className="text-xs text-ink-faint">✕</button>
                </div>
              </div>
            )}
          </div>
          <p className="text-xs text-ink-faint text-center">
            {annotations.length} annotation{annotations.length !== 1 ? 's' : ''} added
            {annotations.length > 0 && (
              <button
                onClick={() => setAnnotations([])}
                className="ml-2 text-sage hover:text-forest underline"
              >
                Clear all
              </button>
            )}
          </p>
        </div>
      )}
    </ToolLayout>
  )
}
