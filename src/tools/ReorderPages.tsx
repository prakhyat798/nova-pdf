import { useState, useRef } from 'react'
import { PDFDocument } from 'pdf-lib'
import { ToolLayout, type ToolState } from '../components/ToolLayout'
import { GripVertical, FileText } from 'lucide-react'
import { motion } from 'framer-motion'

interface PageItem { index: number; label: string }

export function ReorderPages() {
  const [state, setState] = useState<ToolState>('idle')
  const [error, setError] = useState<string>()
  const [outputUrl, setOutputUrl] = useState<string>()
  const [pages, setPages] = useState<PageItem[]>([])
  const [srcBytes, setSrcBytes] = useState<ArrayBuffer | null>(null)
  const dragIdx = useRef<number | null>(null)

  const handleFiles = async (files: File[]) => {
    const bytes = await files[0].arrayBuffer()
    const doc = await PDFDocument.load(bytes)
    const count = doc.getPageCount()
    setSrcBytes(bytes)
    setPages(Array.from({ length: count }, (_, i) => ({ index: i, label: `Page ${i + 1}` })))
    return bytes
  }

  const process = async (files: File[]) => {
    try {
      setState('processing')
      let bytes = srcBytes
      if (!bytes) bytes = await files[0].arrayBuffer()
      const src = await PDFDocument.load(bytes)
      const out = await PDFDocument.create()
      const order = pages.length > 0 ? pages.map(p => p.index) : src.getPageIndices()
      const copied = await out.copyPages(src, order)
      copied.forEach(p => out.addPage(p))
      const saved = await out.save()
      const blob = new Blob([saved], { type: 'application/pdf' })
      setOutputUrl(URL.createObjectURL(blob))
      setState('done')
    } catch (e: any) {
      setError(e.message ?? 'Failed to reorder pages.')
      setState('error')
    }
  }


  const onDragStart = (i: number) => { dragIdx.current = i }
  const onDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault()
    if (dragIdx.current === null || dragIdx.current === i) return
    const updated = [...pages]
    const [moved] = updated.splice(dragIdx.current, 1)
    updated.splice(i, 0, moved)
    dragIdx.current = i
    setPages(updated)
  }

  return (
    <ToolLayout
      toolId="reorder-pages"
      title="Reorder Pages"
      description="Drag and drop pages into the perfect order with a visual manager."
      category="organize"
      accept=".pdf"
      processLabel="Save Reordered PDF"
      onProcess={process}
      onFilesSelected={files => { if (files[0]) handleFiles(files) }}
      state={state}
      error={error}
      outputName="reordered.pdf"
      outputUrl={outputUrl}
      onReset={() => { setState('idle'); setError(undefined); setOutputUrl(undefined); setPages([]); setSrcBytes(null) }}
    >
      {pages.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide">Drag to reorder</p>
          <ul className="space-y-1.5 max-h-64 overflow-y-auto">
            {pages.map((p, i) => (
              <motion.li
                key={p.index}
                layout
                draggable
                onDragStart={() => onDragStart(i)}
                onDragOver={e => onDragOver(e, i)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-canvas border border-divider cursor-grab active:cursor-grabbing hover:border-sage/40 transition-colors select-none"
              >
                <GripVertical size={14} strokeWidth={1.5} className="text-ink-faint shrink-0" />
                <FileText size={14} strokeWidth={1.5} className="text-sage shrink-0" />
                <span className="text-sm text-ink flex-1">{p.label}</span>
                <span className="text-xs text-ink-faint">#{i + 1}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </ToolLayout>
  )
}
