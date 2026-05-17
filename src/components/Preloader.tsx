import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const CURTAIN_EASE = [0.76, 0, 0.24, 1] as const

export function Preloader({ onDone }: { onDone: () => void }) {
  // false = blobs visible, true = blobs exiting
  const [exiting, setExiting] = useState(false)
  // controls the outer wrapper fade-out after blobs have left
  const [wrapperVisible, setWrapperVisible] = useState(true)

  useEffect(() => {
    // At t=1.8s: trigger blob curtain exit
    const exitTimer = setTimeout(() => setExiting(true), 1800)

    // At t=2.7s: blobs have finished flying off (~0.7s exit anim)
    //            fade out the wrapper and then call onDone
    const doneTimer = setTimeout(() => {
      setWrapperVisible(false)
    }, 2600)

    return () => {
      clearTimeout(exitTimer)
      clearTimeout(doneTimer)
    }
  }, [])

  return (
    <AnimatePresence onExitComplete={onDone}>
      {wrapperVisible && (
        <motion.div
          key="preloader-wrapper"
          // Wrapper sits over everything
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: '#F7F5F0',
            overflow: 'hidden',
            // pointer events off so the page underneath isn't blocked
            // after blobs exit but wrapper is still fading
            pointerEvents: exiting ? 'none' : 'all',
          }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.25, ease: 'easeOut' } }}
        >
          {/* ── Left blob ──────────────────────────────────────────────────── */}
          <motion.div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '-10vh',
              left: '-10vw',
              width: '70vw',
              height: '80vh',
              background: '#AAFF4D',
              borderRadius: '60% 40% 70% 30% / 50% 60% 40% 50%',
              transformOrigin: 'top left',
            }}
            animate={
              exiting
                ? { x: '-110vw', scale: 0.95 }
                : {
                    borderRadius: [
                      '60% 40% 70% 30% / 50% 60% 40% 50%',
                      '40% 60% 30% 70% / 60% 40% 60% 40%',
                      '55% 45% 60% 40% / 45% 55% 45% 55%',
                      '60% 40% 70% 30% / 50% 60% 40% 50%',
                    ],
                  }
            }
            transition={
              exiting
                ? { duration: 0.7, ease: CURTAIN_EASE }
                : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
            }
          />

          {/* ── Right blob ─────────────────────────────────────────────────── */}
          <motion.div
            aria-hidden="true"
            style={{
              position: 'absolute',
              bottom: '-10vh',
              right: '-10vw',
              width: '70vw',
              height: '80vh',
              background: '#AAFF4D',
              borderRadius: '40% 60% 30% 70% / 60% 40% 60% 40%',
              transformOrigin: 'bottom right',
            }}
            animate={
              exiting
                ? { x: '110vw', scale: 0.95 }
                : {
                    borderRadius: [
                      '40% 60% 30% 70% / 60% 40% 60% 40%',
                      '60% 40% 70% 30% / 40% 60% 40% 60%',
                      '45% 55% 50% 50% / 55% 45% 55% 45%',
                      '40% 60% 30% 70% / 60% 40% 60% 40%',
                    ],
                  }
            }
            transition={
              exiting
                ? { duration: 0.7, ease: CURTAIN_EASE }
                : { duration: 2.0, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }
            }
          />

          {/* ── Wordmark (absolute center) ──────────────────────────────────── */}
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              pointerEvents: 'none',
              zIndex: 1,
            }}
            initial={{ opacity: 0 }}
            animate={exiting ? { opacity: 0 } : { opacity: 1 }}
            transition={
              exiting
                ? { duration: 0.25, ease: 'easeOut' }
                : { duration: 0.5, delay: 0.3, ease: 'easeOut' }
            }
          >
            <p
              style={{
                fontFamily: '"Instrument Serif", Georgia, serif',
                fontStyle: 'italic',
                fontSize: '2rem',
                color: '#1A2412',
                margin: 0,
                lineHeight: 1,
                letterSpacing: '-0.01em',
              }}
            >
              NovaPDF
            </p>
            <p
              style={{
                fontFamily: '"DM Sans", system-ui, sans-serif',
                fontSize: '0.75rem',
                color: '#8FAF7E',
                margin: 0,
                letterSpacing: '0.03em',
              }}
            >
              Loading your tools…
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
