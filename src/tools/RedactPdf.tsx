import { useState } from 'react'
import { PDFDocument, rgb } from 'pdf-lib'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import { ToolLayout, type ToolState } from '../components/ToolLayout'

GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString()

export function RedactPdf() {
  const [state, setState] = useState<ToolState>('idle')
  const [error, setError] = useState<string>()
  const [outputUrl, setOutputUrl] = useState<string>()
  const [searchText, setSearchText] = useState('')
  const [matchCount, setMatchCount] = useState(0)

  const process = async (files: File[]) => {
    try {
      setState('processing')
      if (!searchText.trim()) throw new Error('Please enter text to redact.')

      const bytes = await files[0].arrayBuffer()

      // Use pdfjs to find text positions
      const loadingTask = getDocument({ data: bytes.slice(0) })
      const pdfJs = await loadingTask.promise
      const numPages = pdfJs.numPages

      // Build redaction rects per page (in PDF coordinates)
      const pageRects: Map<number, { x: number; y: number; w: number; h: number }[]> = new Map()
      const terms = searchText.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
      let total = 0

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdfJs.getPage(pageNum)
        const viewport = page.getViewport({ scale: 1 })
        const content = await page.getTextContent()
        const rects: { x: number; y: number; w: number; h: number }[] = []

        for (const item of content.items as any[]) {
          if (!item.str) continue
          const itemText = item.str.toLowerCase()
          for (const term of terms) {
            if (itemText.includes(term)) {
              // item.transform = [sx, shy, shx, sy, tx, ty]
              const [, , , sy, tx, ty] = item.transform
              const w = item.width ?? Math.abs(sy) * item.str.length * 0.55
              const h = Math.abs(sy) + 4
              // pdfjs gives coordinates in CSS space; convert to PDF space
              const pdfY = viewport.height - ty - h + 2
              rects.push({ x: tx - 2, y: pdfY - 2, w: w + 4, h: h + 4 })
              total++
            }
          }
        }
        if (rects.length) pageRects.set(pageNum, rects)
      }

      setMatchCount(total)
      if (total === 0) throw new Error(`No occurrences of "${searchText}" found in this PDF.`)

      // Apply redaction rectangles with pdf-lib
      const doc = await PDFDocument.load(bytes)
      const pages = doc.getPages()

      for (const [pageNum, rects] of pageRects.entries()) {
        const page = pages[pageNum - 1]
        const { height } = page.getSize()
        for (const rect of rects) {
          page.drawRectangle({
            x: rect.x,
            y: height - rect.y - rect.h,
            width: rect.w,
            height: rect.h,
            color: rgb(0, 0, 0),
            opacity: 1,
          })
        }
      }

      const saved = await doc.save()
      const blob = new Blob([saved], { type: 'application/pdf' })
      setOutputUrl(URL.createObjectURL(blob))
      setState('done')
    } catch (e: any) {
      setError(e.message ?? 'Failed to redact PDF.')
      setState('error')
    }
  }

  return (
    <ToolLayout
      toolId="redact-pdf"
      title="Redact PDF"
      description="Permanently black out sensitive text from your PDF — fully client-side."
      category="security"
      accept=".pdf"
      processLabel="Apply Redaction"
      onProcess={process}
      state={state}
      error={error}
      outputName="redacted.pdf"
      outputUrl={outputUrl}
      onReset={() => { setState('idle'); setError(undefined); setOutputUrl(undefined); setSearchText(''); setMatchCount(0) }}
    >
      <div className="space-y-2">
        <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide">
          Text to redact{' '}
          <span className="font-normal normal-case text-ink-faint">
            (separate multiple terms with commas)
          </span>
        </label>
        <input
          id="redact-text"
          type="text"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          placeholder="e.g. John Smith, SSN, Account Number"
          className="w-full px-4 py-2.5 rounded-xl border border-divider bg-canvas text-ink text-sm outline-none focus:border-sage/60 focus:ring-2 focus:ring-sage/10 transition-all"
        />
        {matchCount > 0 && state === 'done' && (
          <p className="text-xs text-forest font-semibold">✦ {matchCount} text occurrence{matchCount !== 1 ? 's' : ''} redacted</p>
        )}
      </div>
    </ToolLayout>
  )
}
