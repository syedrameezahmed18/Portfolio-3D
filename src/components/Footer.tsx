import { ArrowUp } from 'lucide-react'
import { scrollToId } from '@/lib/smooth-scroll'
import Magnetic from './ui/Magnetic'

export default function Footer() {
  return (
    <footer className="line-top relative z-[1] px-6 py-8 md:px-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <p className="label">© {new Date().getFullYear()} Syed Rameez Ahmed</p>
        <p className="label hidden md:block">Designed &amp; built with React, Three.js and GSAP</p>
        <Magnetic>
          <button
            type="button"
            onClick={() => scrollToId('#top')}
            className="label link-line inline-flex items-center gap-2 text-bone"
          >
            Back to top
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
        </Magnetic>
      </div>
    </footer>
  )
}
