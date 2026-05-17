import { useState, useRef, useEffect } from 'react'
import { PDFDocument } from 'pdf-lib'
import { ToolLayout, type ToolState } from '../components/ToolLayout'
import clsx from 'clsx'

type SignMode = 'draw' | 'type' | 'upload'

export function SignPdf() {
  const [state, setState] = useState<ToolState>('idle')
  const [error, setError] = useState<string>()
  const [outputUrl, setOutputUrl] = useState<string>()
  const [mode, setMode] = useState<SignMode>('draw')
  const [typedSig, setTypedSig] = useState('')
  const [uploadedSig, setUploadedSig] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#FEFCF8'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#1C1917'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [mode])

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect()
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!
    drawing.current = true
    lastPos.current = getPos(e, canvas)
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current) return
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const pos = getPos(e, canvas)
    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    lastPos.current = pos
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#FEFCF8'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const getSigDataUrl = (): string | null => {
    if (mode === 'draw') return canvasRef.current?.toDataURL('image/png') ?? null
    if (mode === 'type') {
      const canvas = document.createElement('canvas')
      canvas.width = 400; canvas.height = 100
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = '#FEFCF8'
      ctx.fillRect(0, 0, 400, 100)
      ctx.font = 'italic 44px "Instrument Serif", Georgia, serif'
      ctx.fillStyle = '#1C1917'
      ctx.fillText(typedSig, 16, 68)
      return canvas.toDataURL('image/png')
    }
    if (mode === 'upload') return uploadedSig
    return null
  }

  const process = async (files: File[]) => {
    try {
      setState('processing')
      const sigUrl = getSigDataUrl()
      if (!sigUrl) throw new Error('Please create a signature first.')
      if (mode === 'type' && !typedSig.trim()) throw new Error('Please type your signature.')

      const bytes = await files[0].arrayBuffer()
      const doc = await PDFDocument.load(bytes)

      const res = await fetch(sigUrl)
      const imgBytes = await res.arrayBuffer()
      const sigImg = await doc.embedPng(new Uint8Array(imgBytes))

      const pages = doc.getPages()
      const lastPage = pages[pages.length - 1]
      const { width } = lastPage.getSize()

      const sigW = 160
      const sigH = (sigImg.height / sigImg.width) * sigW

      lastPage.drawImage(sigImg, {
        x: width - sigW - 36,
        y: 36,
        width: sigW,
        height: sigH,
      })

      const saved = await doc.save()
      const blob = new Blob([saved], { type: 'application/pdf' })
      setOutputUrl(URL.createObjectURL(blob))
      setState('done')
    } catch (e: any) {
      setError(e.message ?? 'Failed to sign PDF.')
      setState('error')
    }
  }

  return (
    <ToolLayout
      toolId="sign-pdf"
      title="Sign PDF"
      description="Draw, type, or upload a signature and apply it to any document."
      category="security"
      accept=".pdf"
      processLabel="Apply Signature"
      onProcess={process}
      state={state}
      error={error}
      outputName="signed.pdf"
      outputUrl={outputUrl}
      onReset={() => { setState('idle'); setError(undefined); setOutputUrl(undefined); setTypedSig(''); setUploadedSig(null) }}
    >
      <div className="space-y-4">
        {/* Mode tabs */}
        <div className="flex gap-1 p-1 bg-canvas rounded-xl">
          {(['draw', 'type', 'upload'] as SignMode[]).map(m => (
            <button
              key={m}
              id={`sign-mode-${m}`}
              onClick={() => setMode(m)}
              className={clsx(
                'flex-1 py-1.5 rounded-lg text-sm font-medium capitalize transition-all',
                mode === m ? 'bg-white shadow-sm text-ink' : 'text-ink-muted hover:text-ink',
              )}
            >
              {m}
            </button>
          ))}
        </div>

        {mode === 'draw' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-xs text-ink-muted">Draw your signature below</p>
              <button onClick={clearCanvas} className="text-xs text-sage hover:text-forest transition-colors">Clear</button>
            </div>
            <canvas
              ref={canvasRef}
              width={560} height={140}
              className="w-full rounded-xl border border-divider cursor-crosshair bg-paper"
              style={{ touchAction: 'none' }}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={() => { drawing.current = false }}
              onMouseLeave={() => { drawing.current = false }}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={() => { drawing.current = false }}
            />
          </div>
        )}

        {mode === 'type' && (
          <div className="space-y-1.5">
            <p className="text-xs text-ink-muted">Type your signature</p>
            <input
              id="sig-typed"
              type="text"
              value={typedSig}
              onChange={e => setTypedSig(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-3 rounded-xl border border-divider bg-canvas font-serif-italic text-2xl text-ink outline-none focus:border-sage/60 transition-all"
            />
          </div>
        )}

        {mode === 'upload' && (
          <div>
            <label
              htmlFor="sig-upload"
              className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-divider rounded-xl cursor-pointer hover:border-sage/50 transition-colors"
            >
              <p className="text-sm text-ink-muted">Upload signature image (PNG with transparent bg)</p>
              {uploadedSig && <img src={uploadedSig} className="max-h-20 object-contain" alt="Signature preview" />}
            </label>
            <input
              id="sig-upload"
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0]
                if (!f) return
                const reader = new FileReader()
                reader.onload = ev => setUploadedSig(ev.target?.result as string)
                reader.readAsDataURL(f)
              }}
            />
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
