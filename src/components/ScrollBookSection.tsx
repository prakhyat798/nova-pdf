/**
 * GlidingPages — Three document cards drift downward as you scroll,
 * each on a different path and speed, banking gently like birds on a thermal.
 * No scroll-jacking. Pure parallax — the page scrolls normally, cards glide.
 */
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

/* ── One document card ──────────────────────────────────────────────────────── */
interface DocProps {
  title: string
  lines: string[]
  bgColor: string
  titleColor: string
  lineColor: string
  accentColor: string
  width: number
  // scroll-linked transforms
  yStart: number
  yEnd: number
  xAmplitude: number    // how far it sways left-right
  xPhase: number        // phase offset so each card sways differently
  rotateAmp: number     // max tilt degrees
  rotatePhase: number
  scaleStart: number
  scaleEnd: number
  left: string          // CSS left positioning
  initialTop: string    // where the card starts in the section
  // scrollYProgress from the parent section
  progress: ReturnType<typeof useScroll>['scrollYProgress']
}

function DocCard({
  title, lines, bgColor, titleColor, lineColor, accentColor, width,
  yStart, yEnd, xAmplitude, xPhase, rotateAmp, rotatePhase,
  scaleStart, scaleEnd, left, initialTop, progress,
}: DocProps) {

  // Descent
  const y        = useTransform(progress, [0, 1], [yStart, yEnd])
  // Sway left-right using multiple keyframes for sinusoidal feel
  const x        = useTransform(progress, [0, 0.25, 0.5, 0.75, 1], [
    0,
    xAmplitude * Math.sin((0.25 + xPhase) * Math.PI * 2),
    xAmplitude * Math.sin((0.5  + xPhase) * Math.PI * 2),
    xAmplitude * Math.sin((0.75 + xPhase) * Math.PI * 2),
    xAmplitude * Math.sin((1.0  + xPhase) * Math.PI * 2),
  ])
  // Banking tilt (follows x direction)
  const rotateZ  = useTransform(progress, [0, 0.25, 0.5, 0.75, 1], [
    0,
    rotateAmp  * Math.sin((0.25 + rotatePhase) * Math.PI * 2),
    rotateAmp  * Math.sin((0.5  + rotatePhase) * Math.PI * 2),
    rotateAmp  * Math.sin((0.75 + rotatePhase) * Math.PI * 2),
    rotateAmp  * Math.sin((1.0  + rotatePhase) * Math.PI * 2),
  ])
  // Slight forward tilt — peaks mid-flight
  const rotateX  = useTransform(progress, [0, 0.5, 1], [2, 8, 2])
  // Scale (recedes slightly)
  const scale    = useTransform(progress, [0, 1], [scaleStart, scaleEnd])
  // Shadow grows as it "lifts" then shrinks as it settles
  const shadowY  = useTransform(progress, [0, 0.4, 1], [8, 28, 12])
  const shadowB  = useTransform(progress, [0, 0.4, 1], [16, 48, 20])
  const shadowO  = useTransform(progress, [0, 0.4, 1], [0.08, 0.18, 0.1])

  return (
    <motion.div
      style={{
        position: 'absolute',
        top: initialTop,
        left,
        width,
        y, x, rotateZ, rotateX, scale,
        transformStyle: 'preserve-3d',
        zIndex: Math.round(scaleStart * 10),
        boxShadow: useTransform(
          [shadowY, shadowB, shadowO] as const,
          ([sy, sb, so]: number[]) =>
            `0 ${sy}px ${sb}px rgba(28,25,23,${so}), 0 2px 6px rgba(28,25,23,0.05)`
        ),
        borderRadius: 24,
        background: bgColor,
        overflow: 'hidden',
      }}
    >
      {/* Lime corner fold */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 52, height: 52,
        background: accentColor,
        borderRadius: '0 24px 0 52px',
      }} />

      <div style={{ padding: '2rem 2rem 2rem 2rem' }}>
        {/* Category title */}
        <p style={{
          fontFamily: '"Instrument Serif", Georgia, serif',
          fontStyle: 'italic',
          fontSize: '2.6rem',
          color: titleColor,
          margin: '0 0 1.5rem',
          lineHeight: 1,
          letterSpacing: '-0.02em',
        }}>
          {title}
        </p>

        {/* Thin divider */}
        <div style={{
          width: 32, height: 2,
          background: accentColor,
          borderRadius: 1,
          marginBottom: '1.25rem',
        }} />

        {/* Tool lines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {lines.map((line, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: 5, height: 5, borderRadius: '50%',
                background: accentColor, flexShrink: 0, opacity: 0.7,
              }} />
              <span style={{
                fontFamily: '"DM Sans", system-ui, sans-serif',
                fontSize: '0.82rem',
                color: lineColor,
                letterSpacing: '0.01em',
              }}>
                {line}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

/* ── Main section ────────────────────────────────────────────────────────────── */
export function ScrollBookSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  return (
    <section
      ref={sectionRef}
      id="gliding-pages"
      className="hidden md:block"
      style={{
        position: 'relative',
        height: '70vh',
        background: 'var(--color-canvas)',
        overflow: 'hidden',
      }}
    >

      {/* ── Front card — Convert, slowest, big, center-right ── */}
      <DocCard
        progress={scrollYProgress}
        title="Convert"
        lines={['PDF to Word', 'PDF to Excel', 'PDF to JPG', 'JPG to PDF', 'Word to PDF']}
        bgColor="#FEFCF8"
        titleColor="#1C1917"
        lineColor="#78716C"
        accentColor="#AAFF4D"
        width={300}
        yStart={-40}   yEnd={340}
        xAmplitude={55} xPhase={0}
        rotateAmp={4.5} rotatePhase={0}
        scaleStart={1}  scaleEnd={0.94}
        left="55%"
        initialTop="6%"
      />

      {/* ── Mid card — Organize, medium speed, left ── */}
      <DocCard
        progress={scrollYProgress}
        title="Organize"
        lines={['Merge PDF', 'Split PDF', 'Rotate Pages', 'Reorder']}
        bgColor="#1A2412"
        titleColor="#AAFF4D"
        lineColor="rgba(196,217,188,0.65)"
        accentColor="#AAFF4D"
        width={268}
        yStart={20}    yEnd={420}
        xAmplitude={70} xPhase={0.18}
        rotateAmp={5.5} rotatePhase={0.18}
        scaleStart={0.88} scaleEnd={0.80}
        left="22%"
        initialTop="8%"
      />

      {/* ── Back card — Optimize, fastest, small, far right ── */}
      <DocCard
        progress={scrollYProgress}
        title="Optimize"
        lines={['Compress PDF', 'Repair PDF']}
        bgColor="#AAFF4D"
        titleColor="#1A2412"
        lineColor="rgba(26,36,18,0.6)"
        accentColor="#1A2412"
        width={230}
        yStart={80}    yEnd={480}
        xAmplitude={45} xPhase={0.35}
        rotateAmp={6.5} rotatePhase={0.35}
        scaleStart={0.75} scaleEnd={0.68}
        left="72%"
        initialTop="10%"
      />

      {/* ── Fourth card — Security, slow, far left ── */}
      <DocCard
        progress={scrollYProgress}
        title="Security"
        lines={['Protect PDF', 'Sign PDF', 'Unlock PDF', 'Redact PDF']}
        bgColor="#FEFCF8"
        titleColor="#1C1917"
        lineColor="#78716C"
        accentColor="#AAFF4D"
        width={252}
        yStart={140}   yEnd={500}
        xAmplitude={60} xPhase={0.5}
        rotateAmp={5}   rotatePhase={0.5}
        scaleStart={0.82} scaleEnd={0.74}
        left="8%"
        initialTop="12%"
      />

      {/* ── Fifth card — Edit, medium, center-left ── */}
      <DocCard
        progress={scrollYProgress}
        title="Edit"
        lines={['Edit PDF', 'Add Watermark', 'Page Numbers']}
        bgColor="#1A2412"
        titleColor="#AAFF4D"
        lineColor="rgba(196,217,188,0.65)"
        accentColor="#AAFF4D"
        width={240}
        yStart={200}   yEnd={560}
        xAmplitude={50} xPhase={0.62}
        rotateAmp={4}   rotatePhase={0.62}
        scaleStart={0.7} scaleEnd={0.63}
        left="38%"
        initialTop="5%"
      />
    </section>
  )
}
