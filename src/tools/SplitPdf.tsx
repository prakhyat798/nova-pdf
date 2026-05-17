import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import { ToolLayout, type ToolState } from '../components/ToolLayout'
import JSZip from 'jszip'

function parseRanges(input: string, max: number): number[][] {
  if (!input.trim()) return Array.from({ length: max }, (_, i) => [i])
  const parts = input.split(',').map(s => s.trim()).filter(Boolean)
  const result: number[][] = []
  for (const part of parts) {
    if (part.includes('-')) {
      const [a, b] = part.split('-').map(n => parseInt(n.trim(), 10) - 1)
      const range: number[] = []
      for (let i = a; i <= Math.min(b, max - 1); i++) range.push(i)
      if (range.length) result.push(range)
    } else {
      const idx = parseInt(part, 10) - 1
      if (idx >= 0 && idx < max) result.push([idx])
    }
  }
  return result
}

export function SplitPdf() {
  const [state, setState] = useState<ToolState>('idle')
  const [error, setError] = useState<string>()
  const [outputUrl, setOutputUrl] = useState<string>()
  const [outputName, setOutputName] = useState<string>()
  const [ranges, setRanges] = useState('')
  const [pageCount, setPageCount] = useState(0)
  const [info, setInfo] = useState<string>()

  const process = async (files: File[]) => {
    try {
      setState('processing')
      const bytes = await files[0].arrayBuffer()
      const srcDoc = await PDFDocument.load(bytes)
      const total = srcDoc.getPageCount()
      setPageCount(total)
      const groups = parseRanges(ranges, total)

      if (groups.length === 0) throw new Error('No valid page ranges found.')

      if (groups.length === 1) {
        // Single range — output one PDF directly
        const out = await PDFDocument.create()
        const copied = await out.copyPages(srcDoc, groups[0])
        copied.forEach(p => out.addPage(p))
        const saved = await out.save()
        const blob = new Blob([saved], { type: 'application/pdf' })
        const name = groups[0].length === 1
          ? `page-${groups[0][0] + 1}.pdf`
          : `pages-${groups[0][0] + 1}-${groups[0][groups[0].length - 1] + 1}.pdf`
        setOutputName(name)
        setOutputUrl(URL.createObjectURL(blob))
        setInfo(`1 PDF — ${groups[0].length} page${groups[0].length !== 1 ? 's' : ''}`)
      } else {
        // Multiple ranges — create a ZIP with separate PDF files
        const zip = new JSZip()
        const baseName = files[0].name.replace(/\.pdf$/i, '')

        for (let gi = 0; gi < groups.length; gi++) {
          const group = groups[gi]
          const out = await PDFDocument.create()
          const copied = await out.copyPages(srcDoc, group)
          copied.forEach(p => out.addPage(p))
          const saved = await out.save()
          const pdfName = group.length === 1
            ? `${baseName}-page-${group[0] + 1}.pdf`
            : `${baseName}-pages-${group[0] + 1}-${group[group.length - 1] + 1}.pdf`
          zip.file(pdfName, saved)
        }

        const zipBuf = await zip.generateAsync({ type: 'arraybuffer', compression: 'DEFLATE' })
        const blob = new Blob([zipBuf], { type: 'application/zip' })
        const zipName = `${files[0].name.replace(/\.pdf$/i, '')}-split.zip`
        setOutputName(zipName)
        setOutputUrl(URL.createObjectURL(blob))
        setInfo(`${groups.length} PDFs packaged in a ZIP`)
      }

      setState('done')
    } catch (e: any) {
      setError(e.message ?? 'Failed to split PDF.')
      setState('error')
    }
  }

  return (
    <ToolLayout
      toolId="split-pdf"
      title="Split PDF"
      description="Divide a PDF into individual pages or custom page ranges — multiple ranges export as a ZIP."
      category="organize"
      accept=".pdf"
      processLabel="Split PDF"
      onProcess={process}
      state={state}
      error={error}
      outputName={outputName}
      outputUrl={outputUrl}
      onReset={() => { setState('idle'); setError(undefined); setOutputUrl(undefined); setRanges(''); setInfo(undefined) }}
    >
      <div className="space-y-2">
        <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide">
          Page ranges{' '}
          <span className="font-normal normal-case text-ink-faint ml-1">
            (e.g. 1-3, 5, 7-9 — leave blank to split every page)
          </span>
        </label>
        <input
          id="split-ranges"
          type="text"
          value={ranges}
          onChange={e => setRanges(e.target.value)}
          placeholder={pageCount ? `1-${pageCount}` : '1-3, 5, 7-9'}
          className="w-full px-4 py-2.5 rounded-xl border border-divider bg-canvas text-ink text-sm outline-none focus:border-sage/60 focus:ring-2 focus:ring-sage/10 transition-all"
        />
        {info && state === 'done' && (
          <p className="text-xs text-forest font-semibold">✦ {info}</p>
        )}
      </div>
    </ToolLayout>
  )
}
