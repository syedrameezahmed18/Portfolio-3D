import { useEffect, type ReactNode } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './motion'

let lenis: Lenis | null = null
// Children mount before the provider, so a lock requested during the
// preloader is remembered and applied once Lenis exists.
let pendingLock = false

export const getLenis = () => lenis

export const scrollToId = (id: string) => {
  const target = document.getElementById(id.replace(/^#/, ''))
  if (!target) return
  if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.4 })
  else target.scrollIntoView({ behavior: 'smooth' })
}

export const lockScroll = (locked: boolean) => {
  pendingLock = locked
  if (!lenis) return
  if (locked) lenis.stop()
  else lenis.start()
}

/** Lenis smooth scroll wired into GSAP's ticker so ScrollTrigger stays in sync. */
export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const instance = new Lenis({
      lerp: 0.09,
      wheelMultiplier: 0.95,
      anchors: false,
    })
    lenis = instance
    if (pendingLock) instance.stop()
    instance.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => instance.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      instance.destroy()
      lenis = null
    }
  }, [])

  return children
}
