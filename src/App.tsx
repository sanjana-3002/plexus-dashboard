import { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { ACESFilmicToneMapping } from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { scrollState } from './scrollState'
import World from './World'
import './index.css'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  useEffect(() => {
    // Smooth scroll via Lenis
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })

    const tickerFn = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tickerFn)
    gsap.ticker.lagSmoothing(0)
    lenis.on('scroll', ScrollTrigger.update)

    // ScrollTrigger reads progress 0→1 as user scrolls through the 600vh container
    const trigger = ScrollTrigger.create({
      trigger: '#scroll-container',
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        scrollState.progress = self.progress
      },
    })

    const refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 300)

    return () => {
      clearTimeout(refreshTimer)
      trigger.kill()
      lenis.destroy()
      gsap.ticker.remove(tickerFn)
    }
  }, [])

  return (
    <>
      {/* ── Fixed Three.js world — never scrolls ── */}
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

      {/* ── Scroll container — 600vh, text overlays float here ── */}
      <div id="scroll-container" style={{ position: 'relative', zIndex: 10, height: '600vh' }}>

        {/* Navbar — always visible */}
        <nav style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          padding: '0 48px', height: '64px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: '18px', fontWeight: 300, color: '#f8fafc', letterSpacing: '0.05em' }}>
            <span style={{ color: '#06b6d4', fontWeight: 700 }}>S</span> Sensoris
          </span>
          <a
            href="mailto:hello@sensoris.ai"
            style={{
              padding: '8px 20px',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '4px',
              color: '#f8fafc',
              fontSize: '13px',
              textDecoration: 'none',
              pointerEvents: 'all',
            }}
          >
            Request Demo
          </a>
        </nav>

        {/* Section 1 — Hero */}
        <div style={{ height: '100vh' }}>
          <div className="overlay center">
            <span className="eyebrow">PHYSICAL AI FOR FACTORIES</span>
            <h1>
              <span className="line white">Your machines</span>
              <span className="line white">are already</span>
              <span className="line cyan">talking.</span>
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '18px', marginTop: '24px', fontWeight: 300 }}>
              You just can't hear them yet.
            </p>
            <span className="cta-hint">Scroll to enter the factory ↓</span>
          </div>
        </div>

        {/* Section 2 — Problem */}
        <div style={{ height: '100vh' }}>
          <div className="overlay left">
            <span className="stat orange">$167B</span>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '8px' }}>
              lost every year to workplace injuries
            </p>
            <span className="stat amber" style={{ marginTop: '40px' }}>82%</span>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '8px' }}>
              of manufacturers face monthly downtime
            </p>
            <span className="quote">
              "The cameras were always there.<br />No one was watching."
            </span>
          </div>
        </div>

        {/* Section 3 — SafetyEye */}
        <div style={{ height: '100vh' }}>
          <div className="overlay right">
            <span className="product-name">SafetyEye</span>
            <p className="tagline">
              The camera is already there.<br />It just wasn't watching.
            </p>
            <ul className="micro">PPE · Restricted zones · Unsafe postures · OSHA reports</ul>
            <span className="fact">Zero new hardware. Live in under an hour.</span>
          </div>
        </div>

        {/* Section 4 — MachineWhisperer */}
        <div style={{ height: '100vh' }}>
          <div className="overlay left">
            <span className="product-name">MachineWhisperer</span>
            <div className="terminal">
              <span className="query">Has this vibration appeared before?</span>
              <span className="response">
                Yes — pre-failure signature from 6 weeks<br />
                before the March 15 bearing failure.
              </span>
              <span className="source">Source: SCADA · cnc_line_3 · Jan–Mar 2024</span>
            </div>
          </div>
        </div>

        {/* Section 5 — Stats */}
        <div style={{ height: '100vh' }}>
          <div className="overlay center">
            <div className="stats-row">
              <div className="stat-block">
                <span className="n cyan">8 hrs</span>
                <p>avg downtime per bearing failure</p>
              </div>
              <div className="stat-block">
                <span className="n orange">$50K</span>
                <p>cost of one unplanned failure</p>
              </div>
              <div className="stat-block">
                <span className="n green">87%</span>
                <p>of failures show warning signs first</p>
              </div>
            </div>
            <span className="punch cyan">We find the 87%. Before the $50K.</span>
          </div>
        </div>

        {/* Section 6 — CTA */}
        <div style={{ height: '100vh' }}>
          <div className="overlay center">
            <h2 style={{
              fontSize: 'clamp(32px, 5vw, 56px)',
              fontWeight: 900,
              color: '#f8fafc',
              lineHeight: 1.1,
            }}>
              Your factory is already talking.
            </h2>
            <h2 style={{
              fontSize: 'clamp(32px, 5vw, 56px)',
              fontWeight: 900,
              color: '#06b6d4',
              lineHeight: 1.1,
              marginTop: '8px',
            }}>
              You just can't hear it yet.
            </h2>
            <a className="cta-btn" href="mailto:hello@sensoris.ai">
              Request early access →
            </a>
            <p className="muted">Starting in Chicago · Expanding to 10 facilities in 2026</p>
          </div>
        </div>

      </div>
    </>
  )
}
