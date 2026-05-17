import { useState } from 'react'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { ToolLayout, type ToolState } from '../components/ToolLayout'
import clsx from 'clsx'

const POSITIONS = [
  { id: 'bottom-center', label: 'Bottom Center' },
  { id: 'bottom-left',   label: 'Bottom Left'   },
  { id: 'bottom-right',  label: 'Bottom Right'  },
  { id: 'top-center',    label: 'Top Center'    },
]

export function AddPageNumbers() {
  const [state, setState] = useState<ToolState>('idle')
  const [error, setError] = useState<string>()
  const [outputUrl, setOutputUrl] = useState<string>()
  const [position, setPosition] = useState('bottom-center')
  const [startFrom, setStartFrom] = useState(1)
  const [prefix, setPrefix] = useState('')

  const process = async (files: File[]) => {
    try {
      setState('processing')
      const bytes = await files[0].arrayBuffer()
      const doc = await PDFDocument.load(bytes)
      const font = await doc.embedFont(StandardFonts.Helvetica)
      const fontSize = 11

      doc.getPages().forEach((page, i) => {
        const { width, height } = page.getSize()
        const text = `${prefix}${i + startFrom}`
        const textWidth = font.widthOfTextAtSize(text, fontSize)
        const margin = 24

        let x: number, y: number
        switch (position) {
          case 'bottom-left':   x = margin; y = margin; break
          case 'bottom-right':  x = width - textWidth - margin; y = margin; break
          case 'top-center':    x = (width - textWidth) / 2; y = height - margin - fontSize; break
          default:              x = (width - textWidth) / 2; y = margin; // bottom-center
        }

        page.drawText(text, { x, y, font, size: fontSize, color: rgb(0.3, 0.3, 0.3) })
      })

      const saved = await doc.save()
      const blob = new Blob([saved], { type: 'application/pdf' })
      setOutputUrl(URL.createObjectURL(blob))
      setState('done')
    } catch (e: any) {
      setError(e.message ?? 'Failed to add page numbers.')
      setState('error')
    }
  }

  return (
    <ToolLayout
      toolId="add-page-numbers"
      title="Add Page Numbers"
      description="Insert page numbers in any position and custom style."
      category="edit"
      accept=".pdf"
      processLabel="Add Page Numbers"
      onProcess={process}
      state={state}
      error={error}
      outputName="numbered.pdf"
      outputUrl={outputUrl}
      onReset={() => { setState('idle'); setError(undefined); setOutputUrl(undefined) }}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide">Position</label>
          <div className="grid grid-cols-2 gap-2">
            {POSITIONS.map(p => (
              <button
                key={p.id}
                id={`pos-${p.id}`}
                onClick={() => setPosition(p.id)}
                className={clsx(
                  'py-2 px-3 rounded-xl text-sm border transition-all',
                  position === p.id ? 'bg-forest text-lime border-forest' : 'border-divider text-ink-muted hover:border-sage/40',
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide">Start from</label>
            <input
              id="page-num-start"
              type="number"
              min={1}
              value={startFrom}
              onChange={e => setStartFrom(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-full px-3 py-2 rounded-xl border border-divider bg-canvas text-ink text-sm outline-none focus:border-sage/60 transition-all"
            />
          </div>
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide">Prefix (optional)</label>
            <input
              id="page-num-prefix"
              type="text"
              value={prefix}
              onChange={e => setPrefix(e.target.value)}
              placeholder="e.g. Page "
              className="w-full px-3 py-2 rounded-xl border border-divider bg-canvas text-ink text-sm outline-none focus:border-sage/60 transition-all"
            />
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
