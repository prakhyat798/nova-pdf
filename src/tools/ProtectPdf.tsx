import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import { ToolLayout, type ToolState } from '../components/ToolLayout'

export function ProtectPdf() {
  const [state, setState] = useState<ToolState>('idle')
  const [error, setError] = useState<string>()
  const [outputUrl, setOutputUrl] = useState<string>()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  const process = async (files: File[]) => {
    try {
      setState('processing')
      if (!password) throw new Error('Please enter a password.')
      if (password !== confirm) throw new Error('Passwords do not match.')

      const bytes = await files[0].arrayBuffer()
      const doc = await PDFDocument.load(bytes)
      const saved = await doc.save({
        userPassword: password,
        ownerPassword: password + '_owner',
        permissions: {
          printing: 'lowResolution',
          modifying: false,
          copying: false,
          annotating: false,
          fillingForms: true,
          contentAccessibility: true,
          documentAssembly: false,
        },
      } as any)
      const blob = new Blob([saved], { type: 'application/pdf' })
      setOutputUrl(URL.createObjectURL(blob))
      setState('done')
    } catch (e: any) {
      setError(e.message ?? 'Failed to protect PDF.')
      setState('error')
    }
  }

  return (
    <ToolLayout
      toolId="protect-pdf"
      title="Protect PDF"
      description="Encrypt and password-protect your PDF to keep it secure."
      category="security"
      accept=".pdf"
      processLabel="Encrypt & Protect"
      onProcess={process}
      state={state}
      error={error}
      outputName="protected.pdf"
      outputUrl={outputUrl}
      onReset={() => { setState('idle'); setError(undefined); setOutputUrl(undefined); setPassword(''); setConfirm('') }}
    >
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide">Password</label>
          <input
            id="protect-password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full px-4 py-2.5 rounded-xl border border-divider bg-canvas text-ink text-sm outline-none focus:border-sage/60 focus:ring-2 focus:ring-sage/10 transition-all"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide">Confirm password</label>
          <input
            id="protect-confirm"
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Re-enter password"
            className="w-full px-4 py-2.5 rounded-xl border border-divider bg-canvas text-ink text-sm outline-none focus:border-sage/60 focus:ring-2 focus:ring-sage/10 transition-all"
          />
        </div>
      </div>
    </ToolLayout>
  )
}
