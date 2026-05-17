import { useState } from 'react'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import { Document, Packer, Paragraph, ImageRun, SectionType, AlignmentType } from 'docx'
import { ToolLayout, type ToolState } from '../components/ToolLayout'

GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString()

// Render scale — 2× gives crisp 144dpi images
const RENDER_SCALE = 2

// 1 PDF point = 12700 EMU (English Metric Units, used by docx)
const PT_TO_EMU = 12700

// 1 PDF point at 96dpi screen = 96/72 px
const PT_TO_PX = 96 / 72

async function renderPageToBuffer(
  pdf: Awaited<ReturnType<typeof getDocument>['promise']>,
  pageNum: number
): Promise<{ buffer: Uint8Array; widthPt: number; heightPt: number }> {
  const page = await pdf.getPage(pageNum)
  const vp1 = page.getViewport({ scale: 1 })
  const vp   = page.getViewport({ scale: RENDER_SCALE })

  const canvas = document.createElement('canvas')
  canvas.width  = vp.width
  canvas.height = vp.height

  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  await page.render({ canvasContext: ctx, viewport: vp }).promise

  // Convert canvas → PNG Uint8Array
  const dataUrl = canvas.toDataURL('image/png')
  const base64  = dataUrl.split(',')[1]
  const buffer  = Uint8Array.from(atob(base64), c => c.charCodeAt(0))

  return { buffer, widthPt: vp1.width, heightPt: vp1.height }
}

async function pdfToDocx(bytes: ArrayBuffer): Promise<Blob> {
  const pdf      = await getDocument({ data: bytes }).promise
  const numPages = pdf.numPages

  const sections: ConstructorParameters<typeof Document>[0]['sections'] = []

  for (let i = 1; i <= numPages; i++) {
    const { buffer, widthPt, heightPt } = await renderPageToBuffer(pdf, i)

    // docx page size unit = DXA = 1/20th of a point
    const widthDXA  = Math.round(widthPt  * 20)
    const heightDXA = Math.round(heightPt * 20)

    // Image display size in pixels (at 96 dpi, matching the PDF point dimensions)
    const imgW = Math.round(widthPt  * PT_TO_PX)
    const imgH = Math.round(heightPt * PT_TO_PX)

    sections.push({
      properties: {
        type: i === 1 ? SectionType.CONTINUOUS : SectionType.NEXT_PAGE,
        page: {
          size:   { width: widthDXA, height: heightDXA },
          margin: { top: 0, right: 0, bottom: 0, left: 0 },
        },
      },
      children: [
        new Paragraph({
          spacing: { before: 0, after: 0, line: 240 },
          children: [
            new ImageRun({
              data: buffer,
              transformation: { width: imgW, height: imgH },
              type: 'png',
            }),
          ],
        }),
      ],
    })
  }

  const doc  = new Document({ sections })
  // Packer.toBlob() is the browser-safe alternative to toBuffer()
  return await Packer.toBlob(doc)
}

export function PdfToWord() {
  const [state, setState]           = useState<ToolState>('idle')
  const [error, setError]           = useState<string>()
  const [outputUrl, setOutputUrl]   = useState<string>()
  const [outputName, setOutputName] = useState<string>()

  const process = async (files: File[]) => {
    try {
      setState('processing')
      const file  = files[0]
      const bytes = await file.arrayBuffer()

      const blob = await pdfToDocx(bytes)
      const name = file.name.replace(/\.pdf$/i, '.docx')

      setOutputName(name)
      setOutputUrl(URL.createObjectURL(blob))
      setState('done')
    } catch (e: any) {
      setError(e.message ?? 'Failed to convert PDF to Word.')
      setState('error')
    }
  }

  return (
    <ToolLayout
      toolId="pdf-to-word"
      title="PDF to Word"
      description="Convert each PDF page into a Word document that looks exactly like the original."
      category="convert"
      accept=".pdf"
      processLabel="Convert to Word"
      onProcess={process}
      state={state}
      error={error}
      outputName={outputName}
      outputUrl={outputUrl}
      onReset={() => {
        setState('idle')
        setError(undefined)
        setOutputUrl(undefined)
        setOutputName(undefined)
      }}
    />
  )
}
