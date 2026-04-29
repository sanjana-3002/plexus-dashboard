import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MeshReflectorMaterial, Line } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration, Vignette, Noise } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import { scrollState } from './scrollState'

const KEYFRAMES = [
  { pos: [0, 2, 16]   as [number,number,number], target: [3, 0, 0]    as [number,number,number], fov: 55 },
  { pos: [5, 4, 4]    as [number,number,number], target: [0, 0, -8]   as [number,number,number], fov: 70 },
  { pos: [0, 2, -8]   as [number,number,number], target: [0, 0, -15]  as [number,number,number], fov: 55 },
  { pos: [-8, 4, -25] as [number,number,number], target: [0, 0, -30]  as [number,number,number], fov: 60 },
  { pos: [0, 3, -35]  as [number,number,number], target: [0, -1, -45] as [number,number,number], fov: 65 },
  { pos: [0, 12, -20] as [number,number,number], target: [0, -3, -30] as [number,number,number], fov: 75 },
]

function CameraController() {
  const { camera } = useThree()
  const lookTarget = useRef(new THREE.Vector3())

  useFrame(() => {
    const progress = scrollState.progress
    const total = KEYFRAMES.length - 1
    const sp = Math.min(progress * total, total - 0.0001)
    const idx = Math.floor(sp)
    const t = sp - idx
    const from = KEYFRAMES[idx]
    const to = KEYFRAMES[Math.min(idx + 1, total)]

    camera.position.set(
      THREE.MathUtils.lerp(from.pos[0], to.pos[0], t),
      THREE.MathUtils.lerp(from.pos[1], to.pos[1], t),
      THREE.MathUtils.lerp(from.pos[2], to.pos[2], t),
    )
    lookTarget.current.set(
      THREE.MathUtils.lerp(from.target[0], to.target[0], t),
      THREE.MathUtils.lerp(from.target[1], to.target[1], t),
      THREE.MathUtils.lerp(from.target[2], to.target[2], t),
    )
    camera.lookAt(lookTarget.current)
    ;(camera as THREE.PerspectiveCamera).fov = THREE.MathUtils.lerp(from.fov, to.fov, t)
    ;(camera as THREE.PerspectiveCamera).updateProjectionMatrix()
  })

  return null
}

function BlinkingLight({ position, color }: { position: [number,number,number], color: string }) {
  const ref = useRef<THREE.MeshStandardMaterial>(null)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.emissiveIntensity = 1.5 + Math.sin(clock.elapsedTime * 4) * 1.5
  })
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.08, 8, 8]} />
      <meshStandardMaterial ref={ref} color={color} emissive={color} emissiveIntensity={4} />
    </mesh>
  )
}

function SensorTower({ position }: { position: [number,number,number] }) {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.1
  })
  return (
    <group ref={ref} position={position}>
      <mesh>
        <cylinderGeometry args={[0.3, 0.5, 6, 16]} />
        <meshStandardMaterial color="#1e293b" metalness={0.95} roughness={0.1} />
      </mesh>
      {([-1, 0, 1, 2] as number[]).map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <torusGeometry args={[0.6, 0.05, 8, 32]} />
          <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={2.5} />
        </mesh>
      ))}
      <mesh position={[0, 3.2, 0]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#0f172a" metalness={1} roughness={0.05} />
      </mesh>
      <BlinkingLight position={[0, 3.7, 0]} color="#22c55e" />
      <pointLight color="#06b6d4" intensity={1.5} distance={8} />
    </group>
  )
}

export default function World() {
  return (
    <>
      <CameraController />
      <fog attach="fog" args={['#020912', 18, 120]} />

      <ambientLight intensity={0.1} />
      <directionalLight position={[10, 20, 10]} intensity={0.8} color="#e0f2fe" />
      <pointLight position={[0, -2, -20]}  color="#f59e0b" intensity={0.3} distance={40} />
      <pointLight position={[-20, 5, -25]} color="#d946ef" intensity={0.5} distance={30} />
      <pointLight position={[20, 5, -25]}  color="#06b6d4" intensity={0.5} distance={30} />

      <gridHelper args={[200, 200, '#0d2a4a', '#071624']} position={[0, -3, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.05, 0]}>
        <planeGeometry args={[200, 200]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={0.8}
          mixStrength={40}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#050d1a"
          metalness={0.8}
        />
      </mesh>

      <group position={[5, 0, -3]} scale={1.8}><SensorTower position={[0, 0, 0]} /></group>
      <pointLight position={[5, 2, -3]} color="#06b6d4" intensity={3} distance={12} />
      <CNCMachine position={[0, 0, -15]} />
      <ConveyorBelt position={[0, -2.8, -30]} />
      <DataPipeline position={[0, 0, -45]} />
      <ParticleField />

      <DataStream from={[2, 0, 0]}    to={[2, 0, -15]}   color="#06b6d4" />
      <DataStream from={[-2, 0, -15]} to={[-2, 0, -30]}  color="#f59e0b" />
      <DataStream from={[0, 2, -30]}  to={[0, 2, -45]}   color="#d946ef" />

      <EffectComposer>
        <Bloom intensity={1.2} luminanceThreshold={0.3} luminanceSmoothing={0.9} mipmapBlur />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new THREE.Vector2(0.0005, 0.0005) as any}
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
        <Noise opacity={0.03} />
      </EffectComposer>
    </>
  )
}

function DataStream({ from, to, color }: {
  from: [number,number,number]
  to: [number,number,number]
  color: string
}) {
  const lineRef = useRef<any>(null)
  useFrame(() => {
    if (lineRef.current?.material) {
      (lineRef.current.material as any).dashOffset -= 0.005
    }
  })
  return (
    <Line
      ref={lineRef}
      points={[from, to]}
      color={color}
      lineWidth={1}
      dashed
      dashScale={2}
      dashSize={0.5}
      gapSize={0.3}
    />
  )
}

function DataPipeline({ position }: { position: [number,number,number] }) {
  const count = 120
  const { particleGeo, posAttr } = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 0.3
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.3
      pos[i * 3 + 2] = (i / count) * 10 - 5
    }
    const attr = new THREE.BufferAttribute(pos, 3)
    g.setAttribute('position', attr)
    return { particleGeo: g, posAttr: attr }
  }, [])

  useFrame(({ clock }) => {
    const arr = posAttr.array as Float32Array
    for (let i = 0; i < count; i++) {
      const baseZ = (i / count) * 10 - 5
      arr[i * 3 + 2] = ((baseZ + 5 + clock.elapsedTime * 2) % 10) - 5
    }
    posAttr.needsUpdate = true
  })

  return (
    <group position={position}>
      {([[- 1, 0], [0, 0.5], [1, 0]] as [number,number][]).map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 10, 8, 1, true]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1}
            transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <points geometry={particleGeo}>
        <pointsMaterial color="#06b6d4" size={0.07} transparent opacity={0.9} sizeAttenuation />
      </points>
      <pointLight color="#06b6d4" intensity={1} distance={8} />
    </group>
  )
}

function ParticleField() {
  const count = 2000
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 80
      pos[i * 3 + 1] = Math.random() * 20 - 5
      pos[i * 3 + 2] = (Math.random() - 0.5) * 120
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [])

  const ref = useRef<THREE.Points>(null)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.005
  })

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color="#1d4ed8" size={0.06} transparent opacity={0.4} sizeAttenuation />
    </points>
  )
}

function ConveyorBelt({ position }: { position: [number,number,number] }) {
  const productRef = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (productRef.current) {
      productRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh
        mesh.position.x = ((((i - 1) * 2) + clock.elapsedTime * 0.5) % 6) - 3
      })
    }
  })
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[8, 0.2, 1.5]} />
        <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.4} />
      </mesh>
      {([-3, 0, 3] as number[]).map((x, i) => (
        <mesh key={i} position={[x, -1, 0]}>
          <boxGeometry args={[0.2, 2, 0.2]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
      <group ref={productRef}>
        {([0, 1, 2] as number[]).map((i) => (
          <mesh key={i} position={[(i - 1) * 2, 0.3, 0]}>
            <boxGeometry args={[0.6, 0.4, 0.6]} />
            <meshStandardMaterial
              color={i === 1 ? '#f97316' : '#475569'}
              metalness={0.3}
              roughness={0.6}
            />
          </mesh>
        ))}
      </group>
      <BlinkingLight position={[0, 0.9, 0]} color="#ef4444" />
      <pointLight position={[0, 1, 0]} color="#ef4444" intensity={0.5} distance={4} />
    </group>
  )
}

function CNCMachine({ position }: { position: [number,number,number] }) {
  const armRef = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (armRef.current) armRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.5) * 0.3
  })
  return (
    <group position={position}>
      <mesh position={[0, -1, 0]}>
        <boxGeometry args={[4, 2, 3]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[3, 2, 2.5]} />
        <meshStandardMaterial color="#0f172a" metalness={0.95} roughness={0.1} />
      </mesh>
      <mesh ref={armRef} position={[0, 2.5, 0]}>
        <boxGeometry args={[0.3, 1.5, 0.3]} />
        <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
      </mesh>
      {([-1.5, 1.5] as number[]).map((x, i) => (
        <mesh key={i} position={[x, 1, 1.3]}>
          <boxGeometry args={[0.05, 1.5, 0.05]} />
          <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={1} />
        </mesh>
      ))}
      <mesh position={[0, 0, 1.51]}>
        <boxGeometry args={[4, 0.15, 0.02]} />
        <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.8} />
      </mesh>
      <pointLight position={[0, 2, 0]} color="#06b6d4" intensity={1} distance={6} />
    </group>
  )
}
