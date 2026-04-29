import { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { ACESFilmicToneMapping } from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scrollState } from './scrollState'
import World from './World'
import './index.css'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: '#scroll-container',
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        scrollState.progress = self.progress
      },
    })
    setTimeout(() => ScrollTrigger.refresh(), 300)
    return () => trigger.kill()
  }, [])

  return (
    <>
      {/* Fixed Three.js world — never scrolls */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <Canvas
          style={{ pointerEvents: 'none' }}
          camera={{ position: [0, 3, 12], fov: 60, near: 0.1, far: 200 }}
          gl={{ antialias: true, toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1 }}
          shadows={false}
        >
          <World />
        </Canvas>
      </div>

      {/* Scroll container — 600vh gives 6 sections of travel */}
      <div id="scroll-container" style={{ position: 'relative', zIndex: 10, height: '600vh' }} />
    </>
  )
}
