import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export { gsap, ScrollTrigger, useGSAP }

export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const isFinePointer = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches

/**
 * Normalised pointer position in [-1, 1], shared between the DOM and the
 * WebGL scene. The canvas ignores pointer events so DOM links stay clickable,
 * which means the scene cannot read R3F's own pointer state.
 */
export const pointer = { x: 0, y: 0 }

if (typeof window !== 'undefined') {
  window.addEventListener(
    'pointermove',
    (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1)
    },
    { passive: true },
  )
}

/** 0 at the top of the page, 1 once the hero has fully scrolled away. */
export const heroProgress = { value: 0 }

/** Current scroll offset and velocity in pixels, fed by Lenis every frame. */
export const scroll = { y: 0, velocity: 0 }

/** Flipped to true when the preloader finishes; hero intros key off it. */
export const intro = { done: false, listeners: new Set<() => void>() }
export const onIntroDone = (cb: () => void) => {
  if (intro.done) cb()
  else intro.listeners.add(cb)
  return () => intro.listeners.delete(cb)
}
export const finishIntro = () => {
  intro.done = true
  intro.listeners.forEach((cb) => cb())
  intro.listeners.clear()
}
