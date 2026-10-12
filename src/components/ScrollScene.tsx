import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'
import { pointer, scroll, ScrollTrigger } from '@/lib/motion'

const EMBER = '#ff6a3d'
const BONE = '#ece5d8'

/**
 * Page-space layout shared by every object: where each section sits in
 * pixels, plus the pixel-to-world ratio for the camera at z = 0.
 */
interface Layout {
  pxPerUnit: number
  widthUnits: number
  heightUnits: number
  docHeight: number
  sections: Record<string, { top: number; height: number }>
}

const SECTION_IDS = ['about', 'work', 'capabilities', 'stack', 'contact']

/** A section pinned by ScrollTrigger lives inside a spacer; measure that. */
const measureSection = (id: string) => {
  const el = document.getElementById(id)
  if (!el) return null
  const box = el.parentElement?.classList.contains('pin-spacer') ? el.parentElement : el
  const r = box.getBoundingClientRect()
  return { top: r.top + window.scrollY, height: r.height }
}

/** World position for a point given as a section id plus fractions of it. */
const place = (l: Layout, id: string, fx: number, fy: number, z = 0): [number, number, number] => {
  const s = l.sections[id] ?? { top: 0, height: window.innerHeight }
  const pageY = s.top + s.height * fy
  return [(fx - 0.5) * l.widthUnits, -pageY / l.pxPerUnit, z]
}

const useLayout = (): Layout | null => {
  const { size, viewport } = useThree()
  const [layout, setLayout] = useState<Layout | null>(null)

  useEffect(() => {
    const measure = () => {
      const pxPerUnit = size.height / viewport.height
      const sections: Layout['sections'] = {}
      for (const id of SECTION_IDS) {
        const m = measureSection(id)
        if (m) sections[id] = m
      }
      setLayout({
        pxPerUnit,
        widthUnits: size.width / pxPerUnit,
        heightUnits: viewport.height,
        docHeight: document.documentElement.scrollHeight,
        sections,
      })
    }
    measure()
    // Pins and late data change the page height; ScrollTrigger refreshes on both.
    ScrollTrigger.addEventListener('refresh', measure)
    window.addEventListener('load', measure)
    return () => {
      ScrollTrigger.removeEventListener('refresh', measure)
      window.removeEventListener('load', measure)
    }
  }, [size.height, size.width, viewport.height])

  return layout
}

/** The camera tracks the page so world y maps onto document y. */
function Rig({ layout }: { layout: Layout }) {
  const { camera } = useThree()
  useFrame((_, delta) => {
    camera.position.y = -(scroll.y + window.innerHeight / 2) / layout.pxPerUnit
    camera.position.x = THREE.MathUtils.damp(camera.position.x, pointer.x * 0.25, 2.5, delta)
    camera.rotation.y = THREE.MathUtils.damp(camera.rotation.y, -pointer.x * 0.02, 2.5, delta)
  })
  return null
}

/** Soft radial glow sprite used behind the ember orb. */
const useGlowTexture = () =>
  useMemo(() => {
    const size = 256
    const c = document.createElement('canvas')
    c.width = c.height = size
    const ctx = c.getContext('2d')!
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    g.addColorStop(0, 'rgba(255,106,61,0.9)')
    g.addColorStop(0.35, 'rgba(255,106,61,0.35)')
    g.addColorStop(1, 'rgba(255,106,61,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])

/** Shorter viewport side in world units; keeps objects proportionate on phones. */
const minSide = (l: Layout) => Math.min(l.heightUnits, l.widthUnits)

/** About: two thin rings, one ember, one bone, tilted and slowly turning. */
function Halo({ layout, simple }: { layout: Layout; simple: boolean }) {
  const group = useRef<THREE.Group>(null)
  const r = minSide(layout) * (simple ? 0.4 : 0.42)
  // On phones the paragraph spans the full width, so the halo hangs off the
  // top-right edge instead of sitting beside the text.
  const pos = simple ? place(layout, 'about', 1.0, 0.0, -1) : place(layout, 'about', 0.82, 0.3, -1)
  useFrame((state, delta) => {
    if (!group.current) return
    group.current.rotation.z += delta * 0.08 + scroll.velocity * 0.00015
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, 1.1 + pointer.y * 0.15, 2, delta)
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.2
  })
  return (
    <group ref={group} position={pos}>
      <mesh>
        <torusGeometry args={[r, 0.012, 8, 160]} />
        <meshBasicMaterial color={EMBER} transparent opacity={0.9} />
      </mesh>
      <mesh rotation={[0.4, 0.2, 0]}>
        <torusGeometry args={[r * 1.18, 0.006, 8, 160]} />
        <meshBasicMaterial color={BONE} transparent opacity={0.16} />
      </mesh>
      <mesh rotation={[-0.3, 0.5, 0]}>
        <torusGeometry args={[r * 0.7, 0.004, 8, 120]} />
        <meshBasicMaterial color={BONE} transparent opacity={0.1} />
      </mesh>
    </group>
  )
}

/** Capabilities: a loose cluster of dark glassy shards with an ember rim. */
function Shards({ layout, count, simple }: { layout: Layout; count: number; simple: boolean }) {
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        pos: [(Math.random() - 0.5) * 3.2, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 2 - 0.5] as [number, number, number],
        scale: 0.18 + Math.random() * 0.45,
        speed: 0.6 + Math.random() * 0.8,
        seed: i * 1.7,
      })),
    [count],
  )
  const group = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (!group.current) return
    group.current.rotation.y += delta * 0.05 + scroll.velocity * 0.0001
  })
  return (
    <group
      ref={group}
      position={simple ? place(layout, 'capabilities', 0.95, 0.02, -1.5) : place(layout, 'capabilities', 0.8, 0.13, -1.5)}
      scale={simple ? 0.55 : 1}
    >
      <pointLight position={[1.5, 1, 2]} intensity={14} color={EMBER} distance={8} />
      {items.map((it, i) => (
        <Float key={i} speed={it.speed} rotationIntensity={1.2} floatIntensity={1.4}>
          <mesh position={it.pos} scale={it.scale}>
            <icosahedronGeometry args={[1, 0]} />
            <meshPhysicalMaterial color="#17140f" roughness={0.18} metalness={0.3} clearcoat={1} clearcoatRoughness={0.15} />
          </mesh>
          <mesh position={it.pos} scale={it.scale * 1.01}>
            <icosahedronGeometry args={[1, 0]} />
            <meshBasicMaterial color={BONE} wireframe transparent opacity={0.14} />
          </mesh>
        </Float>
      ))}
    </group>
  )
}

/** Stack: a large wireframe knot drifting behind the marquee. */
function Knot({ layout, simple }: { layout: Layout; simple: boolean }) {
  const mesh = useRef<THREE.Mesh>(null)
  useFrame((_, delta) => {
    if (!mesh.current) return
    mesh.current.rotation.x += delta * 0.06
    mesh.current.rotation.y += delta * 0.09 + scroll.velocity * 0.00012
  })
  return (
    <mesh
      ref={mesh}
      position={simple ? place(layout, 'stack', 0.92, -0.02, -2.5) : place(layout, 'stack', 0.8, 0.1, -2.5)}
      scale={minSide(layout) * (simple ? 0.19 : 0.22)}
    >
      <torusKnotGeometry args={[1, 0.3, 180, 20, 2, 5]} />
      <meshBasicMaterial color={BONE} wireframe transparent opacity={0.09} />
    </mesh>
  )
}

/** Contact: an ember sun sitting low behind the headline. */
function Orb({ layout, simple }: { layout: Layout; simple: boolean }) {
  const glow = useGlowTexture()
  const group = useRef<THREE.Group>(null)
  const r = minSide(layout) * (simple ? 0.24 : 0.24)
  useFrame((state, delta) => {
    if (!group.current) return
    const t = state.clock.elapsedTime
    group.current.position.x = THREE.MathUtils.damp(group.current.position.x, group.current.userData.x + pointer.x * 0.4, 2, delta)
    group.current.scale.setScalar(1 + Math.sin(t * 0.8) * 0.015)
  })
  // Low in the bottom-right corner, under the submit row, so the headline
  // and the form fields stay on dark ground.
  const [x, y, z] = simple ? place(layout, 'contact', 1.02, 1.02, -2) : place(layout, 'contact', 0.93, 1.04, -2)
  return (
    <group ref={group} position={[x, y, z]} userData={{ x }}>
      <sprite scale={[r * 7, r * 7, 1]}>
        <spriteMaterial map={glow} blending={THREE.AdditiveBlending} transparent opacity={0.4} depthWrite={false} />
      </sprite>
      <mesh>
        <sphereGeometry args={[r, 64, 64]} />
        <meshStandardMaterial color="#2a1309" emissive={EMBER} emissiveIntensity={1.1} roughness={0.9} />
      </mesh>
      <mesh rotation={[1.2, 0, 0]}>
        <torusGeometry args={[r * 1.35, 0.006, 8, 160]} />
        <meshBasicMaterial color={BONE} transparent opacity={0.18} />
      </mesh>
      <pointLight intensity={30} color={EMBER} distance={14} decay={2} />
    </group>
  )
}

/** Dust spread over the whole document so the void never reads as flat. */
function Dust({ layout, count }: { layout: Layout; count: number }) {
  const ref = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    const h = layout.docHeight / layout.pxPerUnit
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * layout.widthUnits * 1.6
      arr[i * 3 + 1] = -Math.random() * h
      arr[i * 3 + 2] = -Math.random() * 6 - 1
    }
    return arr
  }, [count, layout.docHeight, layout.pxPerUnit, layout.widthUnits])
  useFrame((_, delta) => {
    if (!ref.current) return
    ref.current.position.x = THREE.MathUtils.damp(ref.current.position.x, pointer.x * 0.2, 2, delta)
  })
  return (
    <points ref={ref} key={count + ':' + layout.docHeight}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.022} color={BONE} transparent opacity={0.5} sizeAttenuation depthWrite={false} />
    </points>
  )
}

function Scene({ simple: lightweight }: { simple: boolean }) {
  const layout = useLayout()
  if (!layout) return null
  // Any portrait viewport gets the compact placement, not only touch devices,
  // so browser device emulation with a mouse still sizes objects for a phone.
  const simple = lightweight || layout.widthUnits < layout.heightUnits
  return (
    <>
      <Rig layout={layout} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 5]} intensity={1.6} color="#fff1e4" />
      <Halo layout={layout} simple={simple} />
      <Shards layout={layout} count={simple ? 5 : 8} simple={simple} />
      <Knot layout={layout} simple={simple} />
      <Orb layout={layout} simple={simple} />
      <Dust layout={layout} count={simple ? 220 : 420} />
    </>
  )
}

/**
 * One fixed canvas behind the page. The camera scrolls with the document,
 * so each object is anchored to the section it belongs to.
 */
export default function ScrollScene({ simple }: { simple: boolean }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        dpr={simple ? [1, 1.25] : [1, 1.5]}
        camera={{ position: [0, 0, 8], fov: 40, near: 0.1, far: 60 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        performance={{ min: 0.5 }}
      >
        <Scene simple={simple} />
      </Canvas>
    </div>
  )
}
