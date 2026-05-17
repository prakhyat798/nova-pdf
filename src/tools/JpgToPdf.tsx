import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import { ToolLayout, type ToolState } from '../components/ToolLayout'

export function JpgToPdf() {
  const [state, setState] = useState<ToolState>('idle')
  const [error, setError] = useState<string>()
  const [outputUrl, setOutputUrl] = useState<string>()

  const process = async (files: File[]) => {
    try {
      setState('processing')
      const doc = await PDFDocument.create()

      for (const file of files) {
        const bytes = await file.arrayBuffer()
        const isJpeg = file.type === 'image/jpeg' || file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg')
        const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png')

        let img
        if (isJpeg) {
          img = await doc.embedJpg(bytes)
        } else if (isPng) {
          img = await doc.embedPng(bytes)
        } else {
          // Convert to canvas then to JPEG
          const blob = new Blob([bytes], { type: file.type })
          const url = URL.createObjectURL(blob)
          const imgEl = await new Promise<HTMLImageElement>((res, rej) => {
            const el = new Image()
            el.onload = () => res(el)
            el.onerror = rej
            el.src = url
          })
          const canvas = document.createElement('canvas')
          canvas.width = imgEl.naturalWidth
          canvas.height = imgEl.naturalHeight
          canvas.getContext('2d')!.drawImage(imgEl, 0, 0)
          const jpegBytes = await new Promise<ArrayBuffer>((res) => {
            canvas.toBlob(b => b?.arrayBuffer().then(res), 'image/jpeg', 0.92)
          })
          URL.revokeObjectURL(url)
          img = await doc.embedJpg(jpegBytes)
        }

        const page = doc.addPage([img.width, img.height])
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height })
      }

      const saved = await doc.save()
      const blob = new Blob([saved], { type: 'application/pdf' })
      setOutputUrl(URL.createObjectURL(blob))
      setState('done')
    } catch (e: any) {
      setError(e.message ?? 'Failed to convert images to PDF.')
      setState('error')
    }
  }

  return (
    <ToolLayout
      toolId="jpg-to-pdf"
      title="JPG to PDF"
      description="Bundle one or more images into a single polished PDF document."
      category="convert"
      accept=".jpg,.jpeg,.png,.webp,.gif,.bmp"
      multiple
      processLabel="Convert to PDF"
      onProcess={process}
      state={state}
      error={error}
      outputName="images.pdf"
      outputUrl={outputUrl}
      onReset={() => { setState('idle'); setError(undefined); setOutputUrl(undefined) }}
    />
  )
}
