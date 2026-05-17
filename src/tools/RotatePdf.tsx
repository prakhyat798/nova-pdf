import { useState } from 'react'
import { PDFDocument, degrees } from 'pdf-lib'
import { ToolLayout, type ToolState } from '../components/ToolLayout'
import clsx from 'clsx'

const ANGLES = [90, 180, 270]

export function RotatePdf() {
  const [state, setState] = useState<ToolState>('idle')
  const [error, setError] = useState<string>()
  const [outputUrl, setOutputUrl] = useState<string>()
  const [angle, setAngle] = useState(90)

  const process = async (files: File[]) => {
    try {
      setState('processing')
      const bytes = await files[0].arrayBuffer()
      const doc = await PDFDocument.load(bytes)
      doc.getPages().forEach(page => {
        const current = page.getRotation().angle
        page.setRotation(degrees((current + angle) % 360))
      })
      const saved = await doc.save()
      const blob = new Blob([saved], { type: 'application/pdf' })
      setOutputUrl(URL.createObjectURL(blob))
      setState('done')
    } catch (e: any) {
      setError(e.message ?? 'Failed to rotate PDF.')
      setState('error')
    }
  }

  return (
    <ToolLayout
      toolId="rotate-pdf"
      title="Rotate PDF"
      description="Rotate one or all pages to the correct orientation effortlessly."
      category="organize"
      accept=".pdf"
      processLabel="Rotate PDF"
      onProcess={process}
      state={state}
      error={error}
      outputName="rotated.pdf"
      outputUrl={outputUrl}
      onReset={() => { setState('idle'); setError(undefined); setOutputUrl(undefined) }}
    >
      <div className="space-y-2">
        <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide">Rotation angle</label>
        <div className="flex gap-2">
          {ANGLES.map(a => (
            <button
              key={a}
              id={`rotate-${a}`}
              onClick={() => setAngle(a)}
              className={clsx(
                'flex-1 py-2 rounded-xl text-sm font-semibold border transition-all',
                angle === a
                  ? 'bg-forest text-lime border-forest'
                  : 'border-divider text-ink-muted hover:border-sage/40 hover:text-ink',
              )}
            >
              {a}°
            </button>
          ))}
        </div>
      </div>
    </ToolLayout>
  )
}
