import { useParams } from 'react-router-dom'
import { tools } from '../data/tools'

// Lazy load all tool components
import { MergePdf }       from '../tools/MergePdf'
import { SplitPdf }       from '../tools/SplitPdf'
import { RotatePdf }      from '../tools/RotatePdf'
import { DeletePages }    from '../tools/DeletePages'
import { ReorderPages }   from '../tools/ReorderPages'
import { AddPageNumbers } from '../tools/AddPageNumbers'
import { AddWatermark }   from '../tools/AddWatermark'
import { ProtectPdf }     from '../tools/ProtectPdf'
import { UnlockPdf }      from '../tools/UnlockPdf'
import { SignPdf }        from '../tools/SignPdf'
import { RedactPdf }      from '../tools/RedactPdf'
import { CompressPdf }    from '../tools/CompressPdf'
import { RepairPdf }      from '../tools/RepairPdf'
import { JpgToPdf }       from '../tools/JpgToPdf'
import { PdfToJpg }       from '../tools/PdfToJpg'
import { PdfToWord }      from '../tools/PdfToWord'
import { WordToPdf }      from '../tools/WordToPdf'
import { PdfToExcel }     from '../tools/PdfToExcel'
import { PdfToPpt }       from '../tools/PdfToPpt'
import { EditPdf }        from '../tools/EditPdf'

// Fallback for unimplemented tools
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, Clock } from 'lucide-react'

const TOOL_MAP: Record<string, React.ComponentType> = {
  'merge-pdf':        MergePdf,
  'split-pdf':        SplitPdf,
  'rotate-pdf':       RotatePdf,
  'delete-pages':     DeletePages,
  'reorder-pages':    ReorderPages,
  'add-page-numbers': AddPageNumbers,
  'add-watermark':    AddWatermark,
  'protect-pdf':      ProtectPdf,
  'unlock-pdf':       UnlockPdf,
  'sign-pdf':         SignPdf,
  'redact-pdf':       RedactPdf,
  'compress-pdf':     CompressPdf,
  'repair-pdf':       RepairPdf,
  'jpg-to-pdf':       JpgToPdf,
  'pdf-to-jpg':       PdfToJpg,
  'pdf-to-word':      PdfToWord,
  'word-to-pdf':      WordToPdf,
  'pdf-to-excel':     PdfToExcel,
  'pdf-to-ppt':       PdfToPpt,
  'edit-pdf':         EditPdf,
}

function ComingSoon({ toolId }: { toolId: string }) {
  const tool = tools.find(t => t.id === toolId)
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg text-center"
      >
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors mb-10 group">
          <ArrowLeft size={15} strokeWidth={1.5} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to all tools
        </Link>
        <div className="bento-card p-10 text-center">
          <h1 className="font-serif-italic text-4xl text-ink mb-3">{tool?.name ?? 'Tool not found'}</h1>
          {tool && <p className="text-sm text-ink-muted mb-8">{tool.description}</p>}
          <div className="w-12 h-px bg-divider mx-auto mb-8" />
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-canvas flex items-center justify-center">
              <Clock size={22} strokeWidth={1.5} className="text-clay" />
            </div>
            <p className="font-serif-italic text-xl text-ink-muted">Coming soon</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export function ToolPage() {
  const { toolId } = useParams<{ toolId: string }>()
  const Component = toolId ? TOOL_MAP[toolId] : null
  if (!Component) return <ComingSoon toolId={toolId ?? ''} />
  return <Component />
}
