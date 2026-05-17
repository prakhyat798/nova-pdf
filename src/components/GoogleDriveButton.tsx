import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CloudUpload, ExternalLink, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

/* ── Types for Google Identity Services ────────────────────────────────────── */
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string
            scope: string
            callback: (response: { access_token?: string; error?: string }) => void
          }) => { requestAccessToken: () => void }
        }
      }
    }
  }
}

interface GoogleDriveButtonProps {
  /** Blob URL of the processed output */
  outputUrl: string
  /** The filename for the uploaded file */
  outputName: string
}

type UploadState = 'idle' | 'auth' | 'uploading' | 'done' | 'error'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file'

async function blobUrlToFile(url: string, name: string): Promise<File> {
  const resp = await fetch(url)
  const blob = await resp.blob()
  return new File([blob], name, { type: blob.type })
}

async function uploadToDrive(
  accessToken: string,
  file: File,
): Promise<{ id: string; webViewLink: string }> {
  const metadata = {
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
  }

  const form = new FormData()
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' }),
  )
  form.append('file', file)

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: form,
    },
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? 'Upload failed')
  }

  return res.json()
}

function loadGsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts) { resolve(); return }
    const existing = document.querySelector('script[src*="accounts.google.com/gsi"]')
    if (existing) {
      existing.addEventListener('load', () => resolve())
      return
    }
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Failed to load Google Sign-In script'))
    document.head.appendChild(s)
  })
}

export function GoogleDriveButton({ outputUrl, outputName }: GoogleDriveButtonProps) {
  const [status, setStatus] = useState<UploadState>('idle')
  const [driveLink, setDriveLink] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [gsiReady, setGsiReady] = useState(false)

  useEffect(() => {
    if (!CLIENT_ID) return
    loadGsiScript()
      .then(() => setGsiReady(true))
      .catch(() => {}) // silently ignore if offline
  }, [])

  const handleUpload = useCallback(async () => {
    if (!CLIENT_ID) {
      setError('Google Client ID not configured. Add VITE_GOOGLE_CLIENT_ID to your .env file.')
      setStatus('error')
      return
    }
    if (!gsiReady || !window.google?.accounts) {
      setError('Google Sign-In failed to load. Check your connection.')
      setStatus('error')
      return
    }

    setStatus('auth')
    setError('')

    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: DRIVE_SCOPE,
      callback: async (response) => {
        if (response.error || !response.access_token) {
          setError('Sign-in was cancelled or failed.')
          setStatus('error')
          return
        }

        try {
          setStatus('uploading')
          const file = await blobUrlToFile(outputUrl, outputName)
          const result = await uploadToDrive(response.access_token, file)
          setDriveLink(result.webViewLink)
          setStatus('done')
        } catch (e: any) {
          setError(e.message ?? 'Upload failed.')
          setStatus('error')
        }
      },
    })

    tokenClient.requestAccessToken()
  }, [gsiReady, outputUrl, outputName])

  // Don't render at all if no client ID is configured
  if (!CLIENT_ID) return null

  return (
    <AnimatePresence mode="wait">
      {status === 'done' ? (
        <motion.a
          key="done"
          href={driveLink}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors"
          style={{
            background: 'var(--color-accent)',
            color: 'var(--color-accent-text)',
          }}
        >
          <CheckCircle2 size={15} strokeWidth={2} />
          View in Drive
          <ExternalLink size={13} strokeWidth={2} />
        </motion.a>
      ) : status === 'error' ? (
        <motion.div
          key="error"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-1.5"
        >
          <button
            onClick={handleUpload}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium transition-colors"
            style={{
              borderColor: '#ef4444',
              color: '#ef4444',
            }}
          >
            <AlertCircle size={15} strokeWidth={1.5} />
            Retry Drive Upload
          </button>
          {error && (
            <p className="text-[11px] text-center max-w-[200px]" style={{ color: 'var(--color-ink-faint)' }}>
              {error}
            </p>
          )}
        </motion.div>
      ) : (
        <motion.button
          key="upload"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          disabled={status === 'auth' || status === 'uploading'}
          onClick={handleUpload}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            borderColor: 'var(--color-divider)',
            color: 'var(--color-ink-muted)',
            background: 'transparent',
          }}
        >
          {status === 'auth' || status === 'uploading' ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              {status === 'auth' ? 'Signing in…' : 'Uploading…'}
            </>
          ) : (
            <>
              <CloudUpload size={15} strokeWidth={1.5} />
              Save to Drive
            </>
          )}
        </motion.button>
      )}
    </AnimatePresence>
  )
}
