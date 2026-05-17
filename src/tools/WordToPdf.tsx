import { useState } from 'react'
import mammoth from 'mammoth'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { ToolLayout, type ToolState } from '../components/ToolLayout'

// ── A4 layout constants ────────────────────────────────────────────────────────
const A4_W_MM      = 210
const A4_H_MM      = 297
const MARGIN_MM    = 14               // margin on all sides
const CONTENT_W_MM = A4_W_MM - MARGIN_MM * 2   // 182 mm
const CONTENT_H_MM = A4_H_MM - MARGIN_MM * 2   // 269 mm

// We render the HTML at this pixel width (≈ A4 content column at 96 dpi)
const CONTENT_W_PX  = 688
const RENDER_SCALE  = 2               // 2× for crisp text

// How many canvas-pixels tall is one A4 content area?
// (CONTENT_H_MM / CONTENT_W_MM) * CONTENT_W_PX * RENDER_SCALE
const PX_PER_PAGE = Math.round(
  (CONTENT_H_MM / CONTENT_W_MM) * CONTENT_W_PX * RENDER_SCALE
)

// ── Core renderer ──────────────────────────────────────────────────────────────
async function htmlToPdf(html: string): Promise<Blob> {
  const container = document.createElement('div')
  Object.assign(container.style, {
    position:      'fixed',
    top:           '0',
    left:          '-99999px',
    width:         `${CONTENT_W_PX}px`,
    background:    '#ffffff',
    fontFamily:    'Arial, Helvetica, sans-serif',
    fontSize:      '12px',
    lineHeight:    '1.65',
    color:         '#111111',
    padding:       '0',
    boxSizing:     'border-box',
    wordBreak:     'break-word',
    overflowWrap:  'break-word',
  })

  container.innerHTML = `
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      h1 { font-size: 22px; font-weight: bold; margin-bottom: 14px; margin-top: 4px; }
      h2 { font-size: 18px; font-weight: bold; margin-bottom: 10px; margin-top: 12px; }
      h3 { font-size: 15px; font-weight: bold; margin-bottom: 8px;  margin-top: 10px; }
      h4, h5, h6 { font-size: 13px; font-weight: bold; margin-bottom: 6px; margin-top: 8px; }
      p  { margin-bottom: 9px; }
      ul, ol { margin-bottom: 9px; padding-left: 22px; }
      li { margin-bottom: 3px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 11px; }
      td, th { border: 1px solid #cccccc; padding: 5px 7px; vertical-align: top; }
      th { background: #f0f0f0; font-weight: bold; text-align: left; }
      strong, b { font-weight: bold; }
      em, i     { font-style: italic; }
      blockquote { margin-bottom: 9px; padding-left: 12px; border-left: 3px solid #cccccc; color: #555555; }
      hr { border: none; border-top: 1px solid #dddddd; margin: 12px 0; }
      img { max-width: 100%; height: auto; }
      a { color: #1a5276; text-decoration: underline; }
    </style>
    ${html}
  `

  document.body.appendChild(container)

  try {
    // 1. Render the full content as one tall canvas
    const canvas = await html2canvas(container, {
      scale:       RENDER_SCALE,
      useCORS:     true,
      logging:     false,
      backgroundColor: '#ffffff',
      width:       CONTENT_W_PX,
      height:      container.scrollHeight,
      windowWidth: CONTENT_W_PX,
    })

    document.body.removeChild(container)

    // 2. Slice canvas into A4 pages
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
    const totalPages = Math.max(1, Math.ceil(canvas.height / PX_PER_PAGE))

    for (let i = 0; i < totalPages; i++) {
      if (i > 0) pdf.addPage()

      const srcY = i * PX_PER_PAGE
      const srcH = Math.min(PX_PER_PAGE, canvas.height - srcY)

      // Draw this page's slice onto a clean page-sized canvas
      const pageCanvas = document.createElement('canvas')
      pageCanvas.width  = canvas.width
      pageCanvas.height = PX_PER_PAGE        // always full-page height (white if content ends)

      const ctx = pageCanvas.getContext('2d')!
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
      ctx.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH)

      const imgData = pageCanvas.toDataURL('image/jpeg', 0.93)
      pdf.addImage(imgData, 'JPEG', MARGIN_MM, MARGIN_MM, CONTENT_W_MM, CONTENT_H_MM)
    }

    return new Blob([pdf.output('arraybuffer')], { type: 'application/pdf' })
  } catch (err) {
    if (document.body.contains(container)) document.body.removeChild(container)
    throw err
  }
}

// ── Component ──────────────────────────────────────────────────────────────────
export function WordToPdf() {
  const [state, setState]       = useState<ToolState>('idle')
  const [error, setError]       = useState<string>()
  const [outputUrl, setOutputUrl] = useState<string>()
  const [outputName, setOutputName] = useState<string>()

  const process = async (files: File[]) => {
    try {
      setState('processing')
      const file = files[0]
      const ext  = file.name.split('.').pop()?.toLowerCase()
      const bytes = await file.arrayBuffer()

      let html = ''

      if (ext === 'docx') {
        const result = await mammoth.convertToHtml({ arrayBuffer: bytes })
        html = result.value
        if (result.messages.some(m => m.type === 'error')) {
          console.warn('mammoth issues:', result.messages)
        }
      } else if (ext === 'txt' || ext === 'rtf') {
        const text = new TextDecoder('utf-8').decode(bytes)
        html = text
          .split(/\r?\n/)
          .map(line =>
            line.trim()
              ? `<p>${line.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</p>`
              : '<p style="margin-bottom:4px">&nbsp;</p>'
          )
          .join('')
      } else {
        throw new Error('Unsupported file type. Upload a .docx or .txt file.')
      }

      if (!html.trim()) throw new Error('No content found in the document.')

      const blob = await htmlToPdf(html)
      const baseName = file.name.replace(/\.(docx?|txt|rtf)$/i, '')
      setOutputName(`${baseName}.pdf`)
      setOutputUrl(URL.createObjectURL(blob))
      setState('done')
    } catch (e: any) {
      setError(e.message ?? 'Failed to convert document to PDF.')
      setState('error')
    }
  }

  return (
    <ToolLayout
      toolId="word-to-pdf"
      title="Word to PDF"
      description="Transform Word documents into PDFs, preserving headings, lists, tables, and formatting."
      category="convert"
      accept=".docx,.txt,.rtf"
      processLabel="Convert to PDF"
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
