import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

const LS_KEY = 'novapdf:theme'

function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem(LS_KEY) as Theme | null
    if (stored === 'light' || stored === 'dark') return stored
  } catch {}
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem(LS_KEY, theme) } catch {}
  }, [theme])

  const toggle = () => setTheme(t => (t === 'light' ? 'dark' : 'light'))

  return { theme, toggle, isDark: theme === 'dark' }
}
