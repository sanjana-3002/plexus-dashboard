import { MeshReflectorMaterial } from '@react-three/drei'

export default function World() {
  return (
    <>
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
    </>
  )
}
