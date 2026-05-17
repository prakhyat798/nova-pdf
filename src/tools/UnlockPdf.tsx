import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import { ToolLayout, type ToolState } from '../components/ToolLayout'

export function UnlockPdf() {
  const [state, setState] = useState<ToolState>('idle')
  const [error, setError] = useState<string>()
  const [outputUrl, setOutputUrl] = useState<string>()
  const [password, setPassword] = useState('')

  const process = async (files: File[]) => {
    try {
      setState('processing')
      const bytes = await files[0].arrayBuffer()

      let doc: PDFDocument

      // Attempt 1: load with user-supplied password (or no password)
      try {
        const opts: Record<string, unknown> = { ignoreEncryption: false }
        if (password) opts['password'] = password
        doc = await PDFDocument.load(bytes, opts as any)
      } catch (e1: any) {
        // Attempt 2: if no password given, try forcing ignoreEncryption
        if (!password) {
          try {
            doc = await PDFDocument.load(bytes, { ignoreEncryption: true })
          } catch {
            throw new Error('This PDF is password-protected. Please enter the password to unlock it.')
          }
        } else {
          const msg = (e1.message ?? '').toLowerCase()
          if (msg.includes('password') || msg.includes('encrypt') || msg.includes('decrypt')) {
            throw new Error('Incorrect password. Please check and try again.')
          }
          throw e1
        }
      }

      // Re-save without encryption (pdf-lib omits encryption by default on save)
      const saved = await doc.save()
      const blob = new Blob([saved], { type: 'application/pdf' })
      setOutputUrl(URL.createObjectURL(blob))
      setState('done')
    } catch (e: any) {
      setError(e.message ?? 'Failed to unlock PDF.')
      setState('error')
    }
  }

  return (
    <ToolLayout
      toolId="unlock-pdf"
      title="Unlock PDF"
      description="Remove password protection from a PDF you have the right to access."
      category="security"
      accept=".pdf"
      processLabel="Remove Password"
      onProcess={process}
      state={state}
      error={error}
      outputName="unlocked.pdf"
      outputUrl={outputUrl}
      onReset={() => { setState('idle'); setError(undefined); setOutputUrl(undefined); setPassword('') }}
    >
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide">PDF Password</label>
        <input
          id="unlock-password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Enter current password (leave blank if none)"
          className="w-full px-4 py-2.5 rounded-xl border border-divider bg-canvas text-ink text-sm outline-none focus:border-sage/60 focus:ring-2 focus:ring-sage/10 transition-all"
        />
        <p className="text-xs text-ink-faint">
          The unlocked PDF will have no password restrictions.
        </p>
      </div>
    </ToolLayout>
  )
}
