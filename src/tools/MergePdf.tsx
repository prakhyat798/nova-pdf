import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import { ToolLayout, type ToolState } from '../components/ToolLayout'

export function MergePdf() {
  const [state, setState] = useState<ToolState>('idle')
  const [error, setError] = useState<string>()
  const [outputUrl, setOutputUrl] = useState<string>()

  const process = async (files: File[]) => {
    try {
      setState('processing')
      const merged = await PDFDocument.create()
      for (const file of files) {
        const bytes = await file.arrayBuffer()
        const doc = await PDFDocument.load(bytes)
        const pages = await merged.copyPages(doc, doc.getPageIndices())
        pages.forEach(p => merged.addPage(p))
      }
      const out = await merged.save()
      const blob = new Blob([out], { type: 'application/pdf' })
      setOutputUrl(URL.createObjectURL(blob))
      setState('done')
    } catch (e: any) {
      setError(e.message ?? 'Failed to merge PDFs.')
      setState('error')
    }
  }

  return (
    <ToolLayout
      toolId="merge-pdf"
      title="Merge PDF"
      description="Combine multiple PDFs into one document in any order you choose."
      category="organize"
      accept=".pdf"
      multiple
      processLabel="Merge PDFs"
      onProcess={process}
      state={state}
      error={error}
      outputName="merged.pdf"
      outputUrl={outputUrl}
      onReset={() => { setState('idle'); setError(undefined); setOutputUrl(undefined) }}
    />
  )
}
