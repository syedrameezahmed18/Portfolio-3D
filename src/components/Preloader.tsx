import { useEffect, useRef, useState } from 'react'
import { finishIntro, gsap, prefersReducedMotion, useGSAP } from '@/lib/motion'
import { lockScroll } from '@/lib/smooth-scroll'

/**
 * A counter climbs to 100 beside the name, then the curtain lifts and hands
 * off to the hero's own entrance.
 */
export default function Preloader() {
  const root = useRef<HTMLDivElement>(null)
  const counter = useRef<HTMLSpanElement>(null)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    lockScroll(true)
    window.scrollTo(0, 0)
  }, [])

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        lockScroll(false)
        finishIntro()
        setGone(true)
        return
      }
      const value = { n: 0 }
      const tl = gsap.timeline({
        onComplete: () => {
          lockScroll(false)
          finishIntro()
          setGone(true)
        },
      })
      tl.from('.pre-word > span', {
        yPercent: 110,
        duration: 0.9,
        ease: 'expo.out',
        stagger: 0.06,
      })
        .to(
          value,
          {
            n: 100,
            duration: 1.5,
            ease: 'power2.inOut',
            onUpdate: () => {
              if (counter.current) counter.current.textContent = String(Math.round(value.n)).padStart(3, '0')
            },
          },
          '<0.2',
        )
        .to('.pre-word > span, .pre-count', {
          yPercent: -110,
          duration: 0.6,
          ease: 'power3.in',
          stagger: 0.03,
        })
        .to(root.current, {
          yPercent: -100,
          duration: 1,
          ease: 'expo.inOut',
        }, '-=0.2')
    },
    { scope: root },
  )

  if (gone) return null

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[90] flex flex-col justify-between bg-ink px-6 py-6 md:px-10 md:py-8"
      aria-hidden="true"
    >
      <div className="label">Portfolio · 2026</div>
      <div className="flex items-end justify-between">
        <h1 className="text-[clamp(2rem,6vw,5rem)] leading-[0.95] font-medium">
          {['Syed', 'Rameez', 'Ahmed'].map((w) => (
            <span key={w} className="pre-word mask mr-[0.25em]">
              <span>{w}</span>
            </span>
          ))}
        </h1>
        <div className="mask">
          <span ref={counter} className="pre-count font-mono text-[clamp(1.5rem,4vw,3rem)] text-ember tabular-nums">
            000
          </span>
        </div>
      </div>
    </div>
  )
}
