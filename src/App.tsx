import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { Preloader } from './components/Preloader'
import { HomePage } from './pages/HomePage'
import { ToolPage } from './pages/ToolPage'

const SESSION_KEY = 'nova_intro_shown'

function hasSeenIntro(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === 'true'
  } catch {
    return false
  }
}

function markIntroSeen(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, 'true')
  } catch {
    // ignore
  }
}

export default function App() {
  // Show preloader only once per browser session
  const [showPreloader, setShowPreloader] = useState(() => !hasSeenIntro())

  function handlePreloaderDone() {
    markIntroSeen()
    setShowPreloader(false)
  }

  return (
    <BrowserRouter>
      {/* Preloader — rendered outside the page tree so it sits above everything */}
      <AnimatePresence>
        {showPreloader && (
          <Preloader key="preloader" onDone={handlePreloaderDone} />
        )}
      </AnimatePresence>

      <div className="flex flex-col min-h-screen bg-canvas font-sans">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tool/:toolId" element={<ToolPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
