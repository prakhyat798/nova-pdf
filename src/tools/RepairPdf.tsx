import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import { ToolLayout, type ToolState } from '../components/ToolLayout'

export function RepairPdf() {
  const [state, setState] = useState<ToolState>('idle')
  const [error, setError] = useState<string>()
  const [outputUrl, setOutputUrl] = useState<string>()

  const process = async (files: File[]) => {
    try {
      setState('processing')
      const bytes = await files[0].arrayBuffer()
      // Load with error recovery options
      const doc = await PDFDocument.load(bytes, {
        ignoreEncryption: true,
        throwOnInvalidObject: false,
        updateMetadata: false,
      })
      const saved = await doc.save()
      const blob = new Blob([saved], { type: 'application/pdf' })
      setOutputUrl(URL.createObjectURL(blob))
      setState('done')
    } catch (e: any) {
      setError('Could not repair this PDF. The file may be too severely corrupted.')
      setState('error')
    }
  }

  return (
    <ToolLayout
      toolId="repair-pdf"
      title="Repair PDF"
      description="Fix corrupted or damaged PDFs and recover content automatically."
      category="optimize"
      accept=".pdf"
      processLabel="Repair PDF"
      onProcess={process}
      state={state}
      error={error}
      outputName="repaired.pdf"
      outputUrl={outputUrl}
      onReset={() => { setState('idle'); setError(undefined); setOutputUrl(undefined) }}
    />
  )
}
