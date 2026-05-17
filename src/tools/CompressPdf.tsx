import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import { ToolLayout, type ToolState } from '../components/ToolLayout'

export function CompressPdf() {
  const [state, setState] = useState<ToolState>('idle')
  const [error, setError] = useState<string>()
  const [outputUrl, setOutputUrl] = useState<string>()
  const [outputName, setOutputName] = useState<string>()
  const [info, setInfo] = useState<string>()

  const process = async (files: File[]) => {
    try {
      setState('processing')
      const file = files[0]
      const originalSize = file.size
      const bytes = await file.arrayBuffer()
      const doc = await PDFDocument.load(bytes, { updateMetadata: false })
      const saved = await doc.save({ useObjectStreams: true, addDefaultPage: false })
      const blob = new Blob([saved], { type: 'application/pdf' })

      const pct = ((1 - blob.size / originalSize) * 100).toFixed(1)
      const savedKB = ((originalSize - blob.size) / 1024).toFixed(0)
      setInfo(blob.size < originalSize
        ? `✦ ${pct}% smaller · saved ${savedKB} KB`
        : `File is already well-optimized (${(blob.size / 1024).toFixed(0)} KB)`)

      const name = file.name.replace('.pdf', '-compressed.pdf')
      setOutputName(name)
      setOutputUrl(URL.createObjectURL(blob))
      setState('done')
    } catch (e: any) {
      setError(e.message ?? 'Failed to compress PDF.')
      setState('error')
    }
  }

  return (
    <ToolLayout
      toolId="compress-pdf"
      title="Compress PDF"
      description="Shrink PDF size without visible quality loss for faster sharing."
      category="optimize"
      accept=".pdf"
      processLabel="Compress PDF"
      onProcess={process}
      state={state}
      error={error}
      outputName={outputName}
      outputUrl={outputUrl}
      onReset={() => { setState('idle'); setError(undefined); setOutputUrl(undefined); setInfo(undefined) }}
    >
      {info && (
        <p className="text-center text-sm text-forest font-semibold py-1">{info}</p>
      )}
    </ToolLayout>
  )
}
