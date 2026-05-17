import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export function CursorGlow() {
  const mouseX = useMotionValue(-200)
  const mouseY = useMotionValue(-200)

  // Smooth spring follow — outer glow lags more, inner dot snaps fast
  const springConfig = { stiffness: 380, damping: 28, mass: 0.6 }
  const glowConfig  = { stiffness: 140, damping: 22, mass: 0.8 }

  const dotX  = useSpring(mouseX, springConfig)
  const dotY  = useSpring(mouseY, springConfig)
  const glowX = useSpring(mouseX, glowConfig)
  const glowY = useSpring(mouseY, glowConfig)

  // Hide on touch devices
  const isTouchRef = useRef(false)

  useEffect(() => {
    isTouchRef.current = window.matchMedia('(pointer: coarse)').matches
    if (isTouchRef.current) return

    const move = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }

    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [mouseX, mouseY])

  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null
  }

  return (
    <>
      {/* Outer diffuse glow — larger, lags behind */}
      <motion.div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          x: glowX,
          y: glowY,
          translateX: '-50%',
          translateY: '-50%',
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(170,255,77,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 9998,
          mixBlendMode: 'multiply',
        }}
      />

      {/* Inner lime dot — snaps fast */}
      <motion.div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          x: dotX,
          y: dotY,
          translateX: '-50%',
          translateY: '-50%',
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: '#AAFF4D',
          pointerEvents: 'none',
          zIndex: 9999,
          mixBlendMode: 'multiply',
        }}
      />
    </>
  )
}
