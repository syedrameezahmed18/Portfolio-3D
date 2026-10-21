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

interface Star {
  x: number
  y: number
  vx: number
  vy: number
  len: number
  life: number
  age: number
  width: number
  rgb: string
}

const COLORS: Record<Theme, { a: string; b: string; maxAlpha: number; glow: number; star: string[]; starAlpha: number }> = {
  // Embers drifting up through the dark; stars are bone with an ember tint.
  dark: { a: '255,106,61', b: '236,229,216', maxAlpha: 0.75, glow: 3.2, star: ['236,229,216', '255,170,130'], starAlpha: 0.9 },
  // Golden pollen in warm light; stars are ember and gold.
  light: { a: '232,81,42', b: '214,150,70', maxAlpha: 0.4, glow: 2.4, star: ['232,81,42', '214,150,70'], starAlpha: 0.55 },
}

/** Seconds until the next shooting star: frequent, with some variance. */
const nextStarDelay = () => 0.7 + Math.random() * 1.8

/** How many stars to launch together: usually one, sometimes a small burst. */
const burstSize = () => {
  const r = Math.random()
  return r < 0.55 ? 1 : r < 0.85 ? 2 : 3
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
    let stars: Star[] = []
    let nextStar = 0.8 + Math.random() * 1.2
    let w = 0
    let h = 0
    let dpr = 1
    let raf = 0
    let last = performance.now()

    // A streak from the upper area, heading down-right or down-left at a
    // shallow angle, fast enough to read as a meteor rather than a comet.
    const spawnStar = (): Star => {
      const dir = Math.random() < 0.6 ? 1 : -1
      const angle = (18 + Math.random() * 14) * (Math.PI / 180)
      const speed = 700 + Math.random() * 500
      return {
        x: dir === 1 ? Math.random() * w * 0.6 : w * 0.4 + Math.random() * w * 0.6,
        y: Math.random() * h * 0.45,
        vx: Math.cos(angle) * speed * dir,
        vy: Math.sin(angle) * speed,
        len: 180 + Math.random() * 180,
        life: 0.6 + Math.random() * 0.5,
        age: 0,
        width: 1.4 + Math.random() * 1.1,
        rgb: palette.star[Math.random() < 0.7 ? 0 : 1],
      }
    }

    const drawStar = (s: Star) => {
      // Bright for most of its life, then a quick fade.
      const k = Math.max(0, s.age) / s.life
      const a = palette.starAlpha * (k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3)
      const mag = Math.hypot(s.vx, s.vy)
      const tx = s.x - (s.vx / mag) * s.len
      const ty = s.y - (s.vy / mag) * s.len
      const g = ctx.createLinearGradient(s.x, s.y, tx, ty)
      g.addColorStop(0, `rgba(${s.rgb},${a})`)
      g.addColorStop(0.25, `rgba(${s.rgb},${a * 0.45})`)
      g.addColorStop(1, `rgba(${s.rgb},0)`)
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(s.x, s.y)
      ctx.lineTo(tx, ty)
      // Soft wide under-glow, then the crisp core.
      ctx.globalAlpha = 0.3
      ctx.strokeStyle = g
      ctx.lineWidth = s.width * 3.5
      ctx.stroke()
      ctx.globalAlpha = 1
      ctx.lineWidth = s.width
      ctx.stroke()
      // Head glow
      const hg = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.width * 4)
      hg.addColorStop(0, `rgba(${s.rgb},${a})`)
      hg.addColorStop(1, `rgba(${s.rgb},0)`)
      ctx.fillStyle = hg
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.width * 4, 0, Math.PI * 2)
      ctx.fill()
    }

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

      if (!reduced) {
        nextStar -= dt
        if (nextStar <= 0) {
          // Members of a burst are offset slightly so they do not overlap.
          const n = burstSize()
          for (let i = 0; i < n; i++) {
            const s = spawnStar()
            s.age = -i * 0.12
            stars.push(s)
          }
          nextStar = nextStarDelay()
        }
        for (const s of stars) {
          s.age += dt
          if (s.age < 0) continue // still waiting its turn in a burst
          s.x += s.vx * dt
          s.y += s.vy * dt
          drawStar(s)
        }
        stars = stars.filter((s) => s.age < s.life && s.y < h + s.len && s.x > -s.len && s.x < w + s.len)
        raf = requestAnimationFrame(draw)
      }
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
