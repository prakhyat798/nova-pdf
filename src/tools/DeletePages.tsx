import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import { ToolLayout, type ToolState } from '../components/ToolLayout'

export function DeletePages() {
  const [state, setState] = useState<ToolState>('idle')
  const [error, setError] = useState<string>()
  const [outputUrl, setOutputUrl] = useState<string>()
  const [pagesToDelete, setPagesToDelete] = useState('')
  const [pageCount, setPageCount] = useState(0)

  const process = async (files: File[]) => {
    try {
      setState('processing')
      const bytes = await files[0].arrayBuffer()
      const doc = await PDFDocument.load(bytes)
      const total = doc.getPageCount()
      setPageCount(total)

      const toDelete = new Set<number>()
      pagesToDelete.split(',').forEach(part => {
        part = part.trim()
        if (part.includes('-')) {
          const [a, b] = part.split('-').map(n => parseInt(n.trim(), 10) - 1)
          for (let i = a; i <= b; i++) if (i >= 0 && i < total) toDelete.add(i)
        } else {
          const idx = parseInt(part, 10) - 1
          if (idx >= 0 && idx < total) toDelete.add(idx)
        }
      })

      if (toDelete.size === 0) throw new Error('No valid page numbers to delete.')
      if (toDelete.size >= total) throw new Error('Cannot delete all pages.')

      // Remove in reverse to preserve indices
      const sorted = Array.from(toDelete).sort((a, b) => b - a)
      sorted.forEach(i => doc.removePage(i))

      const saved = await doc.save()
      const blob = new Blob([saved], { type: 'application/pdf' })
      setOutputUrl(URL.createObjectURL(blob))
      setState('done')
    } catch (e: any) {
      setError(e.message ?? 'Failed to delete pages.')
      setState('error')
    }
  }

  return (
    <ToolLayout
      toolId="delete-pages"
      title="Delete Pages"
      description="Remove any unwanted pages from a PDF without rebuilding the file."
      category="organize"
      accept=".pdf"
      processLabel="Delete Pages"
      onProcess={process}
      state={state}
      error={error}
      outputName="trimmed.pdf"
      outputUrl={outputUrl}
      onReset={() => { setState('idle'); setError(undefined); setOutputUrl(undefined); setPagesToDelete('') }}
    >
      <div className="space-y-2">
        <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide">
          Pages to delete <span className="font-normal normal-case text-ink-faint ml-1">(e.g. 2, 4-6)</span>
        </label>
        <input
          id="delete-pages-input"
          type="text"
          value={pagesToDelete}
          onChange={e => setPagesToDelete(e.target.value)}
          placeholder={pageCount ? `1-${pageCount}` : '2, 4-6'}
          className="w-full px-4 py-2.5 rounded-xl border border-divider bg-canvas text-ink text-sm outline-none focus:border-sage/60 focus:ring-2 focus:ring-sage/10 transition-all"
        />
      </div>
    </ToolLayout>
  )
}
