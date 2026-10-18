import { lazy, Suspense } from 'react'
import { SmoothScroll } from '@/lib/smooth-scroll'
import { useIsCompact } from '@/hooks/useIsCompact'
import Preloader from '@/components/Preloader'
import Cursor from '@/components/Cursor'
import Grain from '@/components/Grain'
import Ambient from '@/components/Ambient'
import ScrollProgress from '@/components/ScrollProgress'
import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Work from '@/components/Work'
import Capabilities from '@/components/Capabilities'
import Stack from '@/components/Stack'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'

const ScrollScene = lazy(() => import('@/components/ScrollScene'))

export default function App() {
  const compact = useIsCompact()
  return (
    <SmoothScroll>
      <Preloader />
      <Cursor />
      <Grain />
      <ScrollProgress />
      <Nav />
      <Ambient />
      <Suspense fallback={null}>
        <ScrollScene simple={compact} />
      </Suspense>
      <main className="relative z-[1]">
        <Hero compact={compact} />
        <About />
        <Work />
        <Capabilities />
        <Stack />
        <Contact />
      </main>
      <Footer />
    </SmoothScroll>
  )
}
