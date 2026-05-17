import { useState } from 'react'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import { ToolLayout, type ToolState } from '../components/ToolLayout'
import * as XLSX from 'xlsx'

GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString()

export function PdfToExcel() {
  const [state, setState] = useState<ToolState>('idle')
  const [error, setError] = useState<string>()
  const [outputUrl, setOutputUrl] = useState<string>()
  const [outputName, setOutputName] = useState<string>()
  const [info, setInfo] = useState<string>()

  const process = async (files: File[]) => {
    try {
      setState('processing')
      const bytes = await files[0].arrayBuffer()
      const pdf = await getDocument({ data: bytes }).promise
      const numPages = pdf.numPages

      const workbook = XLSX.utils.book_new()

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()

        // Group items into rows by approximate Y position
        const rowMap: Map<number, { x: number; str: string }[]> = new Map()
        for (const item of content.items as any[]) {
          if (!item.str?.trim()) continue
          const y = Math.round(item.transform[5] / 8) * 8
          const x = item.transform[4]
          const existing = rowMap.get(y) ?? []
          existing.push({ x, str: item.str })
          rowMap.set(y, existing)
        }

        // Sort rows top-to-bottom, cells left-to-right
        const rows: string[][] = Array.from(rowMap.entries())
          .sort(([a], [b]) => b - a)
          .map(([, cells]) =>
            cells
              .sort((a, b) => a.x - b.x)
              .map(c => c.str)
          )

        if (rows.length === 0) continue

        const sheetName = numPages === 1 ? 'Data' : `Page ${i}`
        const ws = XLSX.utils.aoa_to_sheet(rows)

        // Auto-fit column widths
        const colWidths = rows.reduce<number[]>((acc, row) => {
          row.forEach((cell, ci) => {
            acc[ci] = Math.max(acc[ci] ?? 8, cell.length + 2)
          })
          return acc
        }, [])
        ws['!cols'] = colWidths.map(w => ({ wch: Math.min(w, 50) }))

        XLSX.utils.book_append_sheet(workbook, ws, sheetName)
      }

      const xlsxBuf = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([xlsxBuf], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const name = files[0].name.replace(/\.pdf$/i, '.xlsx')
      setOutputName(name)
      setOutputUrl(URL.createObjectURL(blob))
      setInfo(`${numPages} page${numPages !== 1 ? 's' : ''} → ${numPages === 1 ? '1 sheet' : `${numPages} sheets`}`)
      setState('done')
    } catch (e: any) {
      setError(e.message ?? 'Failed to extract data from PDF.')
      setState('error')
    }
  }

  return (
    <ToolLayout
      toolId="pdf-to-excel"
      title="PDF to Excel"
      description="Extract text and tables from PDFs into a real .xlsx spreadsheet file."
      category="convert"
      accept=".pdf"
      processLabel="Extract to Excel"
      onProcess={process}
      state={state}
      error={error}
      outputName={outputName}
      outputUrl={outputUrl}
      onReset={() => { setState('idle'); setError(undefined); setOutputUrl(undefined); setInfo(undefined) }}
    >
      {info && (
        <p className="text-xs text-forest font-semibold text-center">{info}</p>
      )}
    </ToolLayout>
  )
}
