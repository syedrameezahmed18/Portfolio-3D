import { lazy, Suspense, useRef } from 'react'
import { ArrowDownRight } from 'lucide-react'
import { gsap, heroProgress, onIntroDone, prefersReducedMotion, useGSAP } from '@/lib/motion'
import { scrollToId } from '@/lib/smooth-scroll'
import { useSiteContent } from '@/hooks/useContent'
import { heroFallback, type HeroContent } from '@/data/fallback'
import Magnetic from './ui/Magnetic'

const HeroScene = lazy(() => import('./HeroScene'))

export default function Hero({ compact }: { compact: boolean }) {
  const root = useRef<HTMLElement>(null)
  const content = useSiteContent<HeroContent>('hero', heroFallback)
  const words = content.name.split(' ')

  useGSAP(
    (_, contextSafe) => {
      // Scroll choreography: text drifts up and fades, scene reads progress.
      gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6,
          onUpdate: (self) => {
            heroProgress.value = self.progress
          },
        },
      })
        .to('.hero-copy', { yPercent: -18, opacity: 0, ease: 'none' }, 0)
        .to('.hero-meta', { opacity: 0, ease: 'none' }, 0)
        // Explicit from/to: a plain `to` would initialise lazily, after the
        // entrance below has set opacity 0, and record that as the top value.
        .fromTo('.hero-canvas', { opacity: 1 }, { opacity: 0.2, ease: 'none', immediateRender: false }, 0)

      if (prefersReducedMotion()) return

      // Entrance waits for the preloader so both never compete. It animates
      // the inner wrapper so it never shares a property with the scrub above.
      gsap.set('.hero-char', { yPercent: 110 })
      gsap.set('.hero-fade', { opacity: 0, y: 24 })
      gsap.set('.hero-canvas-inner', { opacity: 0, scale: 0.9 })

      // The callback fires from inside the preloader's timeline, so it must be
      // re-entered through this component's own context or GSAP would resolve
      // the selectors against the preloader's scope.
      const play = contextSafe!(() => {
        gsap
          .timeline({ defaults: { ease: 'expo.out' } })
          .to('.hero-canvas-inner', { opacity: 1, scale: 1, duration: 1.8 }, 0)
          .to('.hero-char', { yPercent: 0, duration: 1.3, stagger: 0.025 }, 0.1)
          .to('.hero-fade', { opacity: 1, y: 0, duration: 1.1, stagger: 0.1 }, 0.7)
      })
      return onIntroDone(play)
    },
    { scope: root, dependencies: [content.name], revertOnUpdate: true },
  )

  return (
    <section
      id="top"
      ref={root}
      className="relative flex min-h-svh flex-col justify-end overflow-hidden px-6 pt-28 pb-10 md:px-10 md:pb-12"
    >
      <div className="hero-canvas absolute inset-0 -z-0">
        <div className="hero-canvas-inner absolute inset-0">
          <Suspense fallback={null}>
            <HeroScene simple={compact} />
          </Suspense>
        </div>
        {/* Scrim so the copy reads over the scene: heavy on phones, light on desktop. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[72%] bg-gradient-to-t from-ink via-ink/90 to-transparent md:hidden" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-1/3 bg-gradient-to-t from-ink to-transparent md:block" />
      </div>

      <div className="hero-meta label relative z-10 mb-auto flex items-center justify-end pb-12">
        <span className="hidden sm:inline">Germany</span>
      </div>

      <div className="hero-copy relative z-10 grid gap-10 md:grid-cols-12 md:items-end">
        <div className="md:col-span-8">
          <p className="hero-fade label mb-6 text-ember">{content.greeting}</p>
          <h1
            className="text-[clamp(3.4rem,11.5vw,11rem)] leading-[0.88] font-semibold tracking-[-0.045em]"
            aria-label={content.name}
          >
            {words.map((word, wi) => (
              <span key={`${word}-${wi}`} className="mask mr-[0.22em] last:mr-0" aria-hidden="true">
                <span className="whitespace-nowrap">
                  {Array.from(word).map((ch, ci) => (
                    <span key={ci} className="hero-char inline-block">
                      {ch}
                    </span>
                  ))}
                </span>
              </span>
            ))}
          </h1>
          <p className="hero-fade font-serif-italic mt-5 text-[clamp(1.6rem,3.6vw,3rem)] leading-none text-bone-dim">
            {content.title.toLowerCase()}
          </p>
        </div>

        <div className="hero-fade md:col-span-4 md:pb-3">
          <p className="max-w-sm text-base leading-relaxed text-bone-dim md:text-lg">{content.description}</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Magnetic>
              <button
                type="button"
                onClick={() => scrollToId('#work')}
                data-cursor="view"
                className="group inline-flex items-center gap-2 rounded-full bg-ember px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-bone"
              >
                View work
                <ArrowDownRight className="h-4 w-4 transition-transform duration-500 ease-out group-hover:rotate-45" />
              </button>
            </Magnetic>
            <Magnetic>
              <button
                type="button"
                onClick={() => scrollToId('#contact')}
                className="label link-line py-3 text-bone"
              >
                Contact me
              </button>
            </Magnetic>
          </div>
        </div>
      </div>

      <div className="hero-fade label absolute bottom-10 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex">
        <span>Scroll</span>
        <span className="block h-10 w-px overflow-hidden bg-line">
          <span className="scroll-hint block h-full w-full bg-ember" />
        </span>
      </div>
    </section>
  )
}
