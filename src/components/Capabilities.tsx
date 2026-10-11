import { useRef } from 'react'
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/motion'
import {
  backendCapabilities,
  frontendCapabilities,
  stats,
  type Capability,
  type Stat,
} from '@/data/fallback'
import SectionHead, { Line } from './ui/SectionHead'

function StatTile({ stat }: { stat: Stat }) {
  const num = useRef<HTMLSpanElement>(null)

  useGSAP(() => {
    const el = num.current
    if (!el) return
    const decimals = Number.isInteger(stat.value) ? 0 : 1
    if (prefersReducedMotion()) {
      el.textContent = stat.value.toFixed(decimals)
      return
    }
    const v = { n: 0 }
    gsap.to(v, {
      n: stat.value,
      duration: 1.8,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      onUpdate: () => {
        el.textContent = v.n.toFixed(decimals)
      },
    })
  })

  return (
    <div className="stat line-top py-8">
      <div className="flex items-baseline text-[clamp(2.8rem,6vw,5.5rem)] leading-none font-medium tracking-tight tabular-nums">
        <span ref={num}>0</span>
        <span className="text-ember">{stat.suffix}</span>
      </div>
      <p className="label mt-3">{stat.label}</p>
    </div>
  )
}

function Column({ title, items, offset }: { title: string; items: Capability[]; offset: number }) {
  return (
    <div>
      <h3 className="label mb-2">{title}</h3>
      <ul>
        {items.map((cap, i) => (
          <li key={cap.name} className="cap-row line-top group py-6 md:py-7">
            <div className="grid gap-3 md:grid-cols-12 md:gap-6">
              <span className="font-mono text-xs text-bone-mute transition-colors group-hover:text-ember md:col-span-1">
                {String(offset + i + 1).padStart(2, '0')}
              </span>
              <div className="md:col-span-6">
                <p className="text-xl leading-tight font-medium tracking-tight md:text-2xl">{cap.name}</p>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-bone-dim">{cap.description}</p>
              </div>
              <ul className="flex flex-wrap gap-x-4 gap-y-1 md:col-span-5 md:justify-end md:text-right">
                {cap.technologies.map((t) => (
                  <li key={t} className="label text-bone-mute transition-colors group-hover:text-bone-dim">
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Capabilities() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from('.stat', {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: { trigger: '.stats', start: 'top 80%', once: true },
      })
      gsap.utils.toArray<HTMLElement>('.cap-row').forEach((row) => {
        gsap.from(row, {
          y: 24,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: row, start: 'top 90%', once: true },
        })
      })
    },
    { scope: root },
  )

  return (
    <section id="capabilities" ref={root} className="relative px-6 py-28 md:px-10 md:py-40">
      <SectionHead index="03" label="Capabilities">
        <Line>From pixel</Line>
        <br />
        <Line>
          to <span className="font-serif-italic font-normal text-ember">production</span>
        </Line>
      </SectionHead>

      <div className="stats mt-16 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatTile key={s.label} stat={s} />
        ))}
      </div>

      <div className="mt-24 grid gap-16 lg:grid-cols-2 lg:gap-12">
        <Column title="Frontend" items={frontendCapabilities} offset={0} />
        <Column title="Backend" items={backendCapabilities} offset={frontendCapabilities.length} />
      </div>
    </section>
  )
}
