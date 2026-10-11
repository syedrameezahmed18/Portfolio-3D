import { useRef, type ReactNode } from 'react'
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/motion'

/**
 * Index label plus a large display heading whose lines slide up out of a
 * mask as the section scrolls into view.
 */
export default function SectionHead({
  index,
  label,
  children,
  className = '',
}: {
  index: string
  label: string
  children: ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const lines = gsap.utils.toArray<HTMLElement>('.mask > span', ref.current)
      gsap.from(lines, {
        yPercent: 110,
        duration: 1.2,
        ease: 'expo.out',
        stagger: 0.08,
        scrollTrigger: { trigger: ref.current, start: 'top 85%', once: true },
      })
      gsap.from('.head-label', {
        opacity: 0,
        x: -12,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 85%', once: true },
      })
    },
    { scope: ref },
  )

  return (
    <div ref={ref} className={className}>
      <div className="head-label label mb-6 flex items-center gap-3">
        <span className="text-ember">({index})</span>
        <span>{label}</span>
      </div>
      <h2 className="text-[clamp(2.6rem,7vw,6.5rem)] leading-[0.95] font-medium">{children}</h2>
    </div>
  )
}

/** Wraps one heading line so SectionHead can animate it. */
export const Line = ({ children }: { children: ReactNode }) => (
  <span className="mask">
    <span>{children}</span>
  </span>
)
