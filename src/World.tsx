import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MeshReflectorMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { scrollState } from './scrollState'

const KEYFRAMES = [
  { pos: [0, 3, 12]   as [number,number,number], target: [0, 0, 0]    as [number,number,number], fov: 60 },
  { pos: [8, 6, 8]    as [number,number,number], target: [0, 0, -5]   as [number,number,number], fov: 70 },
  { pos: [0, 2, -8]   as [number,number,number], target: [0, 0, -15]  as [number,number,number], fov: 55 },
  { pos: [-8, 4, -25] as [number,number,number], target: [0, 0, -30]  as [number,number,number], fov: 60 },
  { pos: [3, 1, -38]  as [number,number,number], target: [0, 0, -45]  as [number,number,number], fov: 65 },
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
      <meshStandardMaterial ref={ref} color={color} emissive={color} emissiveIntensity={2} />
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
          <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={1.2} />
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

      <SensorTower position={[0, 0, 0]} />
      <CNCMachine position={[0, 0, -15]} />
      <ConveyorBelt position={[0, -2.8, -30]} />
    </>
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
