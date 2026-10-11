import { useEffect, useRef, useState } from 'react'
import { gsap, isFinePointer } from '@/lib/motion'

/**
 * A dot that tracks the pointer tightly and a ring that lags behind it. The
 * ring swells over interactive elements and can carry a short label from a
 * `data-cursor` attribute.
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const [enabled, setEnabled] = useState(false)
  const [label, setLabel] = useState('')

  useEffect(() => {
    if (!isFinePointer()) return
    setEnabled(true)
  }, [])

  useEffect(() => {
    if (!enabled || !dot.current || !ring.current) return
    const dotX = gsap.quickTo(dot.current, 'x', { duration: 0.12, ease: 'power3.out' })
    const dotY = gsap.quickTo(dot.current, 'y', { duration: 0.12, ease: 'power3.out' })
    const ringX = gsap.quickTo(ring.current, 'x', { duration: 0.5, ease: 'power3.out' })
    const ringY = gsap.quickTo(ring.current, 'y', { duration: 0.5, ease: 'power3.out' })

    const move = (e: PointerEvent) => {
      dotX(e.clientX)
      dotY(e.clientY)
      ringX(e.clientX)
      ringY(e.clientY)
    }

    const over = (e: PointerEvent) => {
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>(
        'a, button, [role="button"], [data-cursor], input, textarea',
      )
      if (!target) {
        setLabel('')
        gsap.to(ring.current, { scale: 1, duration: 0.4, ease: 'power3.out' })
        gsap.to(dot.current, { scale: 1, duration: 0.3 })
        return
      }
      const text = target.dataset.cursor ?? ''
      setLabel(text)
      gsap.to(ring.current, { scale: text ? 3.4 : 1.9, duration: 0.5, ease: 'power3.out' })
      gsap.to(dot.current, { scale: text ? 0 : 0.4, duration: 0.3 })
    }

    const hide = () => gsap.to([dot.current, ring.current], { opacity: 0, duration: 0.3 })
    const show = () => gsap.to([dot.current, ring.current], { opacity: 1, duration: 0.3 })

    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerover', over, { passive: true })
    document.documentElement.addEventListener('mouseleave', hide)
    document.documentElement.addEventListener('mouseenter', show)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerover', over)
      document.documentElement.removeEventListener('mouseleave', hide)
      document.documentElement.removeEventListener('mouseenter', show)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <>
      <div
        ref={dot}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[80] h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember"
      />
      <div
        ref={ring}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[80] flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-bone/40 mix-blend-difference"
      >
        <span className="font-mono text-[3px] tracking-widest text-bone uppercase">{label}</span>
      </div>
    </>
  )
}
