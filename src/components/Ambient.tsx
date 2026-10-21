import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/lib/motion'
import { useTheme, type Theme } from '@/lib/theme'

interface Mote {
  x: number
  y: number
  r: number
  speed: number
  sway: number
  phase: number
  alpha: number
  warm: boolean
}

const COLORS: Record<Theme, { a: string; b: string; maxAlpha: number; glow: number }> = {
  // Embers drifting up through the dark.
  dark: { a: '255,106,61', b: '236,229,216', maxAlpha: 0.75, glow: 3.2 },
  // Golden pollen in warm light.
  light: { a: '232,81,42', b: '214,150,70', maxAlpha: 0.4, glow: 2.4 },
}

/**
 * Slow-drifting colour fields behind everything plus a field of rising
 * motes drawn on a 2D canvas, which costs almost nothing next to WebGL.
 */
export default function Ambient() {
  const theme = useTheme()
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const el = canvas.current
    if (!el) return
    const ctx = el.getContext('2d')
    if (!ctx) return

    const reduced = prefersReducedMotion()
    const palette = COLORS[theme]
    let motes: Mote[] = []
    let w = 0
    let h = 0
    let dpr = 1
    let raf = 0
    let last = performance.now()

    const spawn = (fromBottom: boolean): Mote => ({
      x: Math.random() * w,
      y: fromBottom ? h + 10 : Math.random() * h,
      r: 0.8 + Math.random() * 1.6,
      speed: 7 + Math.random() * 16,
      sway: 8 + Math.random() * 24,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.35 + Math.random() * 0.65,
      warm: Math.random() < 0.7,
    })

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      el.width = Math.round(w * dpr)
      el.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.min(110, Math.round((w * h) / 16000))
      motes = Array.from({ length: count }, () => spawn(false))
    }

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      ctx.clearRect(0, 0, w, h)
      const t = now / 1000
      for (const m of motes) {
        if (!reduced) {
          m.y -= m.speed * dt
          if (m.y < -10) Object.assign(m, spawn(true))
        }
        const x = m.x + Math.sin(t * 0.6 + m.phase) * m.sway
        const flicker = 0.75 + 0.25 * Math.sin(t * 2.2 + m.phase * 3)
        const a = m.alpha * flicker * palette.maxAlpha
        const rgb = m.warm ? palette.a : palette.b
        const g = ctx.createRadialGradient(x, m.y, 0, x, m.y, m.r * palette.glow)
        g.addColorStop(0, `rgba(${rgb},${a})`)
        g.addColorStop(0.4, `rgba(${rgb},${a * 0.35})`)
        g.addColorStop(1, `rgba(${rgb},0)`)
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(x, m.y, m.r * palette.glow, 0, Math.PI * 2)
        ctx.fill()
      }
      if (!reduced) raf = requestAnimationFrame(draw)
    }

    const start = () => {
      cancelAnimationFrame(raf)
      last = performance.now()
      raf = requestAnimationFrame(draw)
    }
    const onVisibility = () => (document.hidden ? cancelAnimationFrame(raf) : start())

    resize()
    start()
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [theme])

  return (
    <div aria-hidden="true" className="ambient pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="ambient-blob ambient-a" />
      <div className="ambient-blob ambient-b" />
      <div className="ambient-blob ambient-c" />
      <div className="ambient-sheen" />
      <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
    </div>
  )
}
