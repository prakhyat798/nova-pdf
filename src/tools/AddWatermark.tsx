import { useState } from 'react'
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib'
import { ToolLayout, type ToolState } from '../components/ToolLayout'
import clsx from 'clsx'

const POSITIONS = ['center', 'diagonal'] as const
type WmPos = typeof POSITIONS[number]

export function AddWatermark() {
  const [state, setState] = useState<ToolState>('idle')
  const [error, setError] = useState<string>()
  const [outputUrl, setOutputUrl] = useState<string>()
  const [text, setText] = useState('CONFIDENTIAL')
  const [opacity, setOpacity] = useState(0.15)
  const [wmPos, setWmPos] = useState<WmPos>('diagonal')

  const process = async (files: File[]) => {
    try {
      setState('processing')
      if (!text.trim()) throw new Error('Watermark text cannot be empty.')
      const bytes = await files[0].arrayBuffer()
      const doc = await PDFDocument.load(bytes)
      const font = await doc.embedFont(StandardFonts.HelveticaBold)
      const fontSize = 52

      doc.getPages().forEach(page => {
        const { width, height } = page.getSize()
        const textWidth = font.widthOfTextAtSize(text, fontSize)
        page.drawText(text, {
          x: (width - textWidth) / 2,
          y: (height - fontSize) / 2,
          font,
          size: fontSize,
          color: rgb(0.6, 0.6, 0.6),
          opacity,
          rotate: wmPos === 'diagonal' ? degrees(-35) : degrees(0),
        })
      })

      const saved = await doc.save()
      const blob = new Blob([saved], { type: 'application/pdf' })
      setOutputUrl(URL.createObjectURL(blob))
      setState('done')
    } catch (e: any) {
      setError(e.message ?? 'Failed to add watermark.')
      setState('error')
    }
  }

  return (
    <ToolLayout
      toolId="add-watermark"
      title="Add Watermark"
      description="Stamp text watermarks across every page of your PDF."
      category="edit"
      accept=".pdf"
      processLabel="Add Watermark"
      onProcess={process}
      state={state}
      error={error}
      outputName="watermarked.pdf"
      outputUrl={outputUrl}
      onReset={() => { setState('idle'); setError(undefined); setOutputUrl(undefined) }}
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide">Watermark text</label>
          <input
            id="watermark-text"
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="e.g. CONFIDENTIAL"
            className="w-full px-4 py-2.5 rounded-xl border border-divider bg-canvas text-ink text-sm outline-none focus:border-sage/60 focus:ring-2 focus:ring-sage/10 transition-all"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide">Style</label>
            <div className="flex gap-2">
              {POSITIONS.map(p => (
                <button
                  key={p}
                  onClick={() => setWmPos(p)}
                  className={clsx(
                    'flex-1 py-2 rounded-xl text-sm border capitalize transition-all',
                    wmPos === p ? 'bg-forest text-lime border-forest' : 'border-divider text-ink-muted hover:border-sage/40',
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide">
              Opacity: {Math.round(opacity * 100)}%
            </label>
            <input
              id="watermark-opacity"
              type="range"
              min={5} max={60} step={5}
              value={Math.round(opacity * 100)}
              onChange={e => setOpacity(parseInt(e.target.value, 10) / 100)}
              className="w-full accent-forest"
            />
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
