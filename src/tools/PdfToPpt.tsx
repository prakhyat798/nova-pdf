import { useState } from 'react'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import { ToolLayout, type ToolState } from '../components/ToolLayout'
// @ts-ignore — pptxgenjs ships its own types
import PptxGenJS from 'pptxgenjs'

GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString()

export function PdfToPpt() {
  const [state, setState] = useState<ToolState>('idle')
  const [error, setError] = useState<string>()
  const [outputUrl, setOutputUrl] = useState<string>()
  const [outputName, setOutputName] = useState<string>()
  const [progress, setProgress] = useState(0)

  const process = async (files: File[]) => {
    try {
      setState('processing')
      setProgress(0)
      const bytes = await files[0].arrayBuffer()
      const pdf = await getDocument({ data: bytes }).promise
      const numPages = pdf.numPages

      const pptx = new PptxGenJS()
      pptx.layout = 'LAYOUT_WIDE' // 13.33" × 7.5" widescreen

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i)

        // Render page to canvas at 2× scale for crisp images
        const viewport = page.getViewport({ scale: 2 })
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        const ctx = canvas.getContext('2d')!
        await page.render({ canvasContext: ctx as any, viewport, canvas } as any).promise

        const imgData = canvas.toDataURL('image/jpeg', 0.9)

        const slide = pptx.addSlide()
        slide.addImage({
          data: imgData,
          x: 0, y: 0,
          w: '100%', h: '100%',
        })

        setProgress(Math.round((i / numPages) * 100))
      }

      // Write as PPTX blob
      const pptxBuf = await pptx.write({ outputType: 'arraybuffer' }) as ArrayBuffer
      const blob = new Blob([pptxBuf], {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      })
      const name = files[0].name.replace(/\.pdf$/i, '.pptx')
      setOutputName(name)
      setOutputUrl(URL.createObjectURL(blob))
      setState('done')
    } catch (e: any) {
      setError(e.message ?? 'Failed to convert PDF to PowerPoint.')
      setState('error')
    }
  }

  return (
    <ToolLayout
      toolId="pdf-to-ppt"
      title="PDF to PowerPoint"
      description="Convert each PDF page into a slide in a real .pptx presentation file."
      category="convert"
      accept=".pdf"
      processLabel="Convert to PPTX"
      onProcess={process}
      state={state}
      error={error}
      outputName={outputName}
      outputUrl={outputUrl}
      onReset={() => { setState('idle'); setError(undefined); setOutputUrl(undefined); setProgress(0) }}
    >
      {state === 'processing' && progress > 0 && (
        <div className="space-y-1.5">
          <div className="w-full bg-divider rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-forest rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-ink-faint text-center">{progress}% — rendering slides…</p>
        </div>
      )}
    </ToolLayout>
  )
}
