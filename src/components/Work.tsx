import { useRef } from 'react'
import { ArrowUpRight, Code } from 'lucide-react'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion'
import { useProjects } from '@/hooks/useContent'
import type { Project } from '@/data/fallback'

function Card({ project, index }: { project: Project; index: number }) {
  return (
    <article className="work-card group flex w-[86vw] shrink-0 flex-col md:w-[44vw] lg:w-[36vw]">
      <div className="frame aspect-[4/3]">
        {project.image ? (
          <img
            src={project.image}
            alt={project.title}
            loading="lazy"
            className="h-full w-full object-contain p-10 transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04] md:p-14"
          />
        ) : (
          <div className="label flex h-full items-center justify-center">No image</div>
        )}
        <span className="label absolute top-4 left-4">{String(index + 1).padStart(2, '0')}</span>
        {project.isContribution && (
          <span className="label absolute top-4 right-4 rounded-full border border-ember/50 px-2 py-1 text-ember">
            Contribution
          </span>
        )}
      </div>

      <div className="line-top mt-6 pt-5">
        <div className="flex items-start justify-between gap-6">
          <h3 className="text-2xl leading-tight font-medium tracking-tight md:text-3xl">{project.title}</h3>
          <div className="flex shrink-0 items-center gap-3 pt-1">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.title} on GitHub`}
                data-cursor="code"
                className="rounded-full border border-line p-2 transition-colors hover:border-bone"
              >
                <Code className="h-4 w-4" />
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${project.title}`}
                data-cursor="visit"
                className="rounded-full bg-bone p-2 text-ink transition-colors hover:bg-ember"
              >
                <ArrowUpRight className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-bone-dim md:text-base" title={project.description}>
          {project.description}
        </p>
        <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1">
          {project.tags.map((t) => (
            <li key={t} className="label text-bone-mute">
              {t}
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}

/**
 * The track scrolls sideways while the section is pinned on wide screens, and
 * falls back to a plain vertical stack on small ones and for reduced motion.
 */
export default function Work() {
  const root = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const projects = useProjects()

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        const el = track.current
        if (!el) return
        const distance = () => el.scrollWidth - window.innerWidth
        gsap.to(el, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        })
        gsap.fromTo(
          '.work-card',
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            stagger: 0.1,
            scrollTrigger: { trigger: root.current, start: 'top 70%', once: true },
          },
        )
      })
      mm.add('(max-width: 1023px)', () => {
        gsap.fromTo(
          '.work-card',
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            stagger: 0.12,
            scrollTrigger: { trigger: track.current, start: 'top 80%', once: true },
          },
        )
      })
      ScrollTrigger.refresh()
      return () => mm.revert()
    },
    // Revert on update so the fallback render's tweens and triggers are torn
    // down when the database rows arrive, instead of piling up.
    { scope: root, dependencies: [projects], revertOnUpdate: true },
  )

  return (
    <section id="work" ref={root} className="relative overflow-hidden py-24 lg:h-svh lg:py-0">
      <div
        ref={track}
        className="flex flex-col gap-16 px-6 md:px-10 lg:h-full lg:flex-row lg:items-start lg:gap-[6vw] lg:pt-[16vh] lg:pr-[10vw]"
      >
        <header className="shrink-0 lg:w-[34vw] lg:pt-[6vh]">
          <div className="label mb-6 flex items-center gap-3">
            <span className="text-ember">(02)</span>
            <span>Selected work</span>
          </div>
          <h2 className="text-[clamp(2.6rem,6.5vw,6rem)] leading-[0.95] font-medium">
            Things I’ve <span className="font-serif-italic font-normal text-ember">shipped</span>
          </h2>
          <p className="mt-6 max-w-sm text-bone-dim">
            Products I helped design, build and run. Each one taught me something that the next one got for free.
          </p>
          <p className="label mt-10 hidden items-center gap-3 lg:flex">
            <span className="block h-px w-10 bg-ember" />
            Scroll to explore
          </p>
        </header>

        {projects.map((p, i) => (
          <Card key={p.id} project={p} index={i} />
        ))}
      </div>
    </section>
  )
}
