import { useRef } from 'react'
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/motion'
import { useSkills } from '@/hooks/useContent'
import type { Skill } from '@/data/fallback'

function Marquee({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  // The list is doubled so the loop point is invisible.
  const row = [...items, ...items]
  return (
    <div className="overflow-hidden py-3" aria-hidden="true">
      <div
        className="marquee-track flex w-max items-center gap-10 whitespace-nowrap"
        data-reverse={reverse}
        style={{ '--marquee-duration': `${Math.max(30, items.length * 4)}s` } as React.CSSProperties}
      >
        {row.map((name, i) => (
          <span key={`${name}-${i}`} className="flex items-center gap-10">
            <span className="text-[clamp(2rem,5vw,4.5rem)] leading-none font-medium tracking-tight text-bone/90">
              {name}
            </span>
            <span className="h-2 w-2 rounded-full bg-ember" />
          </span>
        ))}
      </div>
    </div>
  )
}

function Meter({ skill }: { skill: Skill }) {
  return (
    <li className="meter line-top py-4">
      <div className="flex items-baseline justify-between">
        <span className="text-base md:text-lg">{skill.name}</span>
        <span className="font-mono text-xs text-bone-dim tabular-nums">{skill.percentage}%</span>
      </div>
      <div className="mt-3 h-px w-full bg-line">
        <div
          className="meter-fill h-full origin-left bg-ember"
          style={{ width: `${Math.min(100, Math.max(0, skill.percentage))}%` }}
        />
      </div>
    </li>
  )
}

const groups: { key: string; title: string }[] = [
  { key: 'frontend', title: 'Frontend' },
  { key: 'backend', title: 'Backend' },
  { key: 'other', title: 'Tooling & cloud' },
]

export default function Stack() {
  const root = useRef<HTMLElement>(null)
  const skills = useSkills()
  const names = skills.map((s) => s.name)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from('.meter-fill', {
        scaleX: 0,
        duration: 1.4,
        ease: 'expo.out',
        stagger: 0.05,
        scrollTrigger: { trigger: '.meters', start: 'top 80%', once: true },
      })
      gsap.from('.meter', {
        opacity: 0,
        y: 16,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.04,
        scrollTrigger: { trigger: '.meters', start: 'top 80%', once: true },
      })
    },
    { scope: root, dependencies: [skills] },
  )

  return (
    <section id="stack" ref={root} className="relative py-28 md:py-40">
      <div className="label mb-10 flex items-center gap-3 px-6 md:px-10">
        <span className="text-ember">(04)</span>
        <span>Stack</span>
      </div>

      <div className="line-top border-b border-line">
        <Marquee items={names.slice(0, Math.ceil(names.length / 2))} />
        <Marquee items={names.slice(Math.ceil(names.length / 2))} reverse />
      </div>

      <div className="meters mt-20 grid gap-12 px-6 md:px-10 lg:grid-cols-3 lg:gap-10">
        {groups.map((g) => {
          const list = skills.filter((s) => s.category === g.key)
          if (list.length === 0) return null
          return (
            <div key={g.key}>
              <h3 className="label mb-2">{g.title}</h3>
              <ul>
                {list.map((s) => (
                  <Meter key={`${g.key}-${s.name}`} skill={s} />
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </section>
  )
}
