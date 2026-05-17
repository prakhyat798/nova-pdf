import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Environment } from '@react-three/drei'
import * as THREE from 'three'

/* ── Single clean PDF page ─────────────────────────────────────────────────── */
interface PageProps {
  position: [number, number, number]
  rotation: [number, number, number]
  scale?: number
  color?: string
  floatIntensity?: number
  floatSpeed?: number
  rotationSpeed?: number
}

function PDFPage({
  position,
  rotation,
  scale = 1,
  color = '#FEFCF8',
  floatIntensity = 1,
  floatSpeed = 1,
  rotationSpeed = 0.08,
}: PageProps) {
  // Attach ref to the GROUP so the entire page (body + fold) rotates together
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * rotationSpeed
    }
  })

  return (
    <Float speed={floatSpeed} rotationIntensity={0.25} floatIntensity={floatIntensity}>
      <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
        {/* Page body */}
        <mesh castShadow>
          <boxGeometry args={[1.4, 1.8, 0.02]} />
          <meshStandardMaterial color={color} roughness={0.12} metalness={0.04} />
        </mesh>

        {/* Lime corner fold — top-right */}
        <mesh position={[0.52, 0.76, 0.013]}>
          <boxGeometry args={[0.3, 0.28, 0.005]} />
          <meshStandardMaterial color="#AAFF4D" roughness={0.18} />
        </mesh>

        {/* Thin lime edge accent — left side */}
        <mesh position={[-0.71, 0, 0.01]}>
          <boxGeometry args={[0.02, 1.8, 0.005]} />
          <meshStandardMaterial color="#AAFF4D" roughness={0.3} opacity={0.7} transparent />
        </mesh>
      </group>
    </Float>
  )
}

/* ── Lime particle orbs ────────────────────────────────────────────────────── */
function LimeOrb({ position, speed }: { position: [number, number, number]; speed: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const initY = position[1]
  useFrame(state => {
    if (meshRef.current) {
      meshRef.current.position.y = initY + Math.sin(state.clock.elapsedTime * speed) * 0.28
    }
  })
  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.055, 16, 16]} />
      <meshStandardMaterial
        color="#AAFF4D"
        roughness={0.0}
        metalness={0.6}
        emissive="#AAFF4D"
        emissiveIntensity={0.7}
      />
    </mesh>
  )
}

/* ── Background dot particles ──────────────────────────────────────────────── */
function Particles() {
  const count = 70
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 14
      arr[i * 3 + 1] = (Math.random() - 0.5) * 9
      arr[i * 3 + 2] = (Math.random() - 0.5) * 7
    }
    return arr
  }, [])

  const ref = useRef<THREE.Points>(null)
  useFrame(state => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.018
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color="#AAFF4D" transparent opacity={0.45} sizeAttenuation />
    </points>
  )
}

/* ── Scene ─────────────────────────────────────────────────────────────────── */
function Scene() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 8, 5]} intensity={1.1} castShadow />
      <pointLight position={[-4, 3, 2]} intensity={0.9} color="#AAFF4D" />
      <pointLight position={[4, -3, 2]} intensity={0.45} color="#8FAF7E" />

      {/* Main front page */}
      <PDFPage
        position={[1.1, 0.1, 0]}
        rotation={[0.04, -0.25, 0.04]}
        scale={1.35}
        floatIntensity={0.8}
        floatSpeed={1.2}
        rotationSpeed={0.06}
      />

      {/* Stack behind — slightly offset, slower */}
      <PDFPage
        position={[1.5, -0.3, -0.9]}
        rotation={[0.07, -0.18, 0.1]}
        scale={1.18}
        color="#F0EDE8"
        floatIntensity={0.55}
        floatSpeed={0.85}
        rotationSpeed={0.04}
      />
      <PDFPage
        position={[0.7, 0.35, -1.5]}
        rotation={[0.03, -0.12, -0.07]}
        scale={1.05}
        color="#E8E4DD"
        floatIntensity={0.45}
        floatSpeed={0.7}
        rotationSpeed={0.03}
      />

      {/* Side pages */}
      <PDFPage
        position={[-1.9, 0.7, -0.5]}
        rotation={[0.1, 0.35, -0.12]}
        scale={0.72}
        floatIntensity={1.1}
        floatSpeed={1.4}
        rotationSpeed={0.09}
      />
      <PDFPage
        position={[3.1, -0.9, -0.7]}
        rotation={[-0.04, -0.48, 0.08]}
        scale={0.62}
        color="#F0EDE8"
        floatIntensity={0.95}
        floatSpeed={1.0}
        rotationSpeed={0.07}
      />

      {/* Lime orbs */}
      {([
        { pos: [-2.4, 1.6, 0.6] as [number,number,number], speed: 0.5 },
        { pos: [3.4, 1.3, 0.3] as [number,number,number], speed: 0.7 },
        { pos: [0.3, -1.9, 0.9] as [number,number,number], speed: 0.4 },
        { pos: [2.7, 2.1, -0.4] as [number,number,number], speed: 0.6 },
        { pos: [-1.1, -1.5, 0.5] as [number,number,number], speed: 0.8 },
      ]).map((o, i) => <LimeOrb key={i} position={o.pos} speed={o.speed} />)}

      <Particles />
      <Environment preset="studio" />
    </>
  )
}

/* ── Exported canvas ───────────────────────────────────────────────────────── */
export function HeroCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 44 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
    >
      <Scene />
    </Canvas>
  )
}
