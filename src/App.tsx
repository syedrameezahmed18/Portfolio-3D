import { SmoothScroll } from '@/lib/smooth-scroll'
import Preloader from '@/components/Preloader'
import Cursor from '@/components/Cursor'
import Grain from '@/components/Grain'
import ScrollProgress from '@/components/ScrollProgress'
import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Work from '@/components/Work'
import Capabilities from '@/components/Capabilities'
import Stack from '@/components/Stack'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'

export default function App() {
  return (
    <SmoothScroll>
      <Preloader />
      <Cursor />
      <Grain />
      <ScrollProgress />
      <Nav />
      <main>
        <Hero />
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
