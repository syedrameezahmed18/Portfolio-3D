import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Float, Lightformer, MeshTransmissionMaterial } from '@react-three/drei'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import * as THREE from 'three'
import { heroProgress, pointer } from '@/lib/motion'

const EMBER = new THREE.Color('#ff6a3d')

/** A glass shard refracting an ember core, steered by the pointer and scroll. */
function Shard({ simple }: { simple: boolean }) {
  const group = useRef<THREE.Group>(null)
  const core = useRef<THREE.Mesh>(null)
  const target = useMemo(() => new THREE.Vector3(), [])
  // On narrow screens the copy fills the lower half, so the shard sits
  // smaller and higher instead of behind the name.
  const base = simple ? { x: 0.55, y: 0.95, scale: 0.58 } : { x: 0.6, y: 0, scale: 1 }

  useFrame((state, delta) => {
    const g = group.current
    if (!g) return
    const p = heroProgress.value
    const t = state.clock.elapsedTime

    // Pointer parallax eases in; scroll pushes the object back and tilts it.
    const rx = pointer.y * -0.35 + p * 1.2 + t * 0.05
    const ry = pointer.x * 0.5 + p * 1.6 + t * 0.08
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, rx, 3, delta)
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, ry, 3, delta)

    target.set(base.x + pointer.x * 0.25, base.y + pointer.y * 0.15 - p * 1.4, -p * 3.5)
    g.position.lerp(target, 1 - Math.exp(-3 * delta))
    const s = base.scale * (1 - p * 0.35)
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, s, 3, delta))

    if (core.current) {
      core.current.rotation.x = t * 0.4
      core.current.rotation.z = t * 0.25
      const pulse = 1 + Math.sin(t * 1.6) * 0.06
      core.current.scale.setScalar(pulse)
    }
  })

  return (
    <group ref={group} position={[base.x, base.y, 0]} scale={base.scale}>
      <mesh>
        <icosahedronGeometry args={[1.55, 0]} />
        {simple ? (
          // Same glass, cheaper: fewer refraction samples and a smaller buffer.
          <MeshTransmissionMaterial
            samples={2}
            resolution={256}
            thickness={1.2}
            roughness={0.12}
            chromaticAberration={0.05}
            anisotropicBlur={0.1}
            distortion={0.2}
            distortionScale={0.4}
            ior={1.35}
            color="#f3ede2"
            background={new THREE.Color('#0b0a09')}
          />
        ) : (
          <MeshTransmissionMaterial
            samples={4}
            resolution={512}
            thickness={1.4}
            roughness={0.08}
            chromaticAberration={0.08}
            anisotropicBlur={0.2}
            distortion={0.25}
            distortionScale={0.4}
            temporalDistortion={0.1}
            ior={1.35}
            color="#f3ede2"
            background={new THREE.Color('#0b0a09')}
          />
        )}
      </mesh>
      <mesh>
        <icosahedronGeometry args={[1.56, 0]} />
        <meshBasicMaterial color="#ece5d8" wireframe transparent opacity={0.18} />
      </mesh>
      <mesh ref={core}>
        <torusKnotGeometry args={[0.42, 0.14, 160, 24, 2, 3]} />
        <meshStandardMaterial
          color={EMBER}
          emissive={EMBER}
          emissiveIntensity={simple ? 1.2 : 2.4}
          roughness={0.35}
          metalness={0.1}
        />
      </mesh>
    </group>
  )
}

/** Sparse drifting dust so the void has depth. */
function Dust({ count = 260 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 16
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2
    }
    return arr
  }, [count])

  useFrame((state, delta) => {
    if (!ref.current) return
    ref.current.rotation.y += delta * 0.015
    ref.current.position.y = THREE.MathUtils.damp(
      ref.current.position.y,
      -heroProgress.value * 2 + pointer.y * 0.1,
      2,
      delta,
    )
    ref.current.position.x = THREE.MathUtils.damp(ref.current.position.x, pointer.x * 0.15, 2, delta)
    const m = ref.current.material as THREE.PointsMaterial
    m.opacity = 0.55 + Math.sin(state.clock.elapsedTime * 0.8) * 0.1
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#ece5d8" transparent opacity={0.6} sizeAttenuation depthWrite={false} />
    </points>
  )
}

export default function HeroScene({ simple }: { simple: boolean }) {
  return (
    <Canvas
      dpr={simple ? [1, 1.25] : [1, 1.75]}
      camera={{ position: [0, 0, 6.2], fov: 38 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      performance={{ min: 0.5 }}
      style={{ pointerEvents: 'none' }}
    >
      <ambientLight intensity={0.25} />
      <spotLight position={[6, 8, 6]} angle={0.5} penumbra={1} intensity={60} color="#fff4e6" />
      <pointLight position={[-6, -3, 2]} intensity={25} color={EMBER} />
      <Suspense fallback={null}>
        <Environment resolution={128} frames={1}>
          <Lightformer intensity={2} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={[10, 10, 1]} />
          <Lightformer intensity={1.2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={[12, 2, 1]} color="#ffd9c7" />
          <Lightformer intensity={0.8} rotation-y={-Math.PI / 2} position={[8, 1, 0]} scale={[12, 2, 1]} />
        </Environment>
        <Float speed={1.1} rotationIntensity={0.35} floatIntensity={0.7}>
          <Shard simple={simple} />
        </Float>
        <Dust count={simple ? 140 : 260} />
        {!simple && (
          <EffectComposer multisampling={0}>
            <Bloom mipmapBlur luminanceThreshold={0.55} intensity={0.75} radius={0.6} />
          </EffectComposer>
        )}
      </Suspense>
    </Canvas>
  )
}
