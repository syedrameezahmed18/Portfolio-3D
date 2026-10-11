import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/motion'

/** One-pixel ember line across the top that fills as the page is read. */
export default function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.to(ref.current, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
    })
  })

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[70] h-px w-full origin-left scale-x-0 bg-ember"
    />
  )
}
