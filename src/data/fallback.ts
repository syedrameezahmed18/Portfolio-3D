import autilentImg from '@/assets/autilent.png'
import nxtstimImg from '@/assets/nxtstim.png'
import keyluxeImg from '@/assets/keyluxe.png'

export interface HeroContent {
  greeting: string
  name: string
  title: string
  description: string
}

export interface AboutContent {
  paragraph1: string
  paragraph2: string
  highlights: string[]
  hire_url: string
  cv_url: string
}

export interface ContactContent {
  intro: string
  email: string
  phone: string
  location: string
  github: string
  linkedin: string
}

export interface Project {
  id: string
  title: string
  description: string
  image: string | null
  tags: string[]
  liveUrl: string | null
  githubUrl: string | null
  isContribution: boolean
}

export interface Skill {
  name: string
  percentage: number
  category: 'frontend' | 'backend' | 'other' | string
}

export const heroFallback: HeroContent = {
  greeting: 'Hi there, I’m',
  name: 'Syed Rameez Ahmed',
  title: 'Full-stack Developer',
  description:
    'I build accessible, user-friendly websites and applications with modern technologies that solve real-world problems and provide seamless user experiences.',
}

export const aboutFallback: AboutContent = {
  paragraph1:
    'I’m a passionate full stack developer with 4+ years of experience building modern web and mobile applications from front to back. My journey in development started during college, and ever since, I’ve been driven by a love for creating intuitive user interfaces and building robust, scalable backend systems.',
  paragraph2:
    'My expertise lies in the React and Next ecosystem on the frontend, but I’m always exploring new technologies to stay at the cutting edge of web development.',
  highlights: ['React & Next.js', 'TypeScript', 'Tailwind CSS', 'UI/UX Design'],
  hire_url: 'https://www.linkedin.com/in/syed-rameez-ahmed-6b5984199/',
  cv_url: '/Syed_Rameez_Ahmed_CV_2025.pdf',
}

export const contactFallback: ContactContent = {
  intro:
    'Got a project in mind or want to collaborate? I’m always open to discussing new projects, creative ideas or opportunities.',
  email: 'noir.ramsam@gmail.com',
  phone: '+49 176 67826120',
  location: 'Leipzig, Germany',
  github: 'https://github.com/syedrameezahmed18',
  linkedin: 'https://www.linkedin.com/in/syedrameezahmed18/',
}

/** Local artwork for projects the database knows but has no image for. */
export const localImageFor = (title: string): string | null => {
  if (title === 'Autilent') return autilentImg
  if (title.startsWith('NXTSTIM')) return nxtstimImg
  if (title.startsWith('Keyluxe')) return keyluxeImg
  return null
}

export const projectsFallback: Project[] = [
  {
    id: 'fallback-autilent',
    title: 'Autilent',
    description:
      'An AI-powered speech analytics platform for contact centers, delivering real-time insights from customer calls using ML and NLP. It automates quality management, improves agent performance and ensures compliance.',
    image: autilentImg,
    tags: ['React', 'PrimeUI', 'FastAPI', 'Postgres', 'Redis'],
    liveUrl: 'https://autilent.com/',
    githubUrl: null,
    isContribution: true,
  },
  {
    id: 'fallback-nxtstim',
    title: 'NXTSTIM EcoAI Digital Care Ecosystem',
    description:
      'A HealthTech ecosystem for pain management that pairs wearable neuromodulation devices with AI-powered remote patient monitoring to deliver personalised, data-driven therapy.',
    image: nxtstimImg,
    tags: ['Nest.js', 'React', 'Zustand', 'Azure'],
    liveUrl: 'https://nxtstim.com/',
    githubUrl: null,
    isContribution: true,
  },
  {
    id: 'fallback-keyluxe',
    title: 'Keyluxe Suites',
    description:
      'A temporary-housing platform with a nationwide network of properties, from apartments to single-family homes, built for a smooth booking journey and a comfortable stay.',
    image: keyluxeImg,
    tags: ['.NET Core', 'Blazor', 'Postgres'],
    liveUrl: 'https://keyluxesuites.com/',
    githubUrl: null,
    isContribution: true,
  },
]

export const skillsFallback: Skill[] = [
  { name: 'React', percentage: 95, category: 'frontend' },
  { name: 'Next.js', percentage: 90, category: 'frontend' },
  { name: 'TypeScript', percentage: 90, category: 'frontend' },
  { name: 'Tailwind CSS', percentage: 92, category: 'frontend' },
  { name: 'Three.js', percentage: 70, category: 'frontend' },
  { name: 'Node.js', percentage: 88, category: 'backend' },
  { name: 'NestJS', percentage: 85, category: 'backend' },
  { name: 'FastAPI', percentage: 80, category: 'backend' },
  { name: 'PostgreSQL', percentage: 85, category: 'backend' },
  { name: 'Redis', percentage: 78, category: 'backend' },
  { name: 'Docker', percentage: 80, category: 'other' },
  { name: 'AWS / Azure', percentage: 75, category: 'other' },
  { name: 'CI/CD', percentage: 80, category: 'other' },
  { name: 'Git', percentage: 92, category: 'other' },
]

export interface Capability {
  name: string
  description: string
  technologies: string[]
}

export const frontendCapabilities: Capability[] = [
  {
    name: 'Modern JavaScript frameworks',
    description: 'Dynamic, responsive applications built on React, Next.js and friends.',
    technologies: ['React', 'Next.js', 'Vue', 'Angular'],
  },
  {
    name: 'UI engineering',
    description: 'Design systems translated into precise, accessible components.',
    technologies: ['Tailwind', 'Radix', 'Figma', 'Storybook'],
  },
  {
    name: 'Motion & 3D',
    description: 'Scroll choreography and WebGL scenes that stay at 60fps.',
    technologies: ['GSAP', 'Three.js', 'R3F', 'Motion'],
  },
  {
    name: 'State & data',
    description: 'Predictable client state and resilient data fetching.',
    technologies: ['Zustand', 'TanStack Query', 'Redux', 'Context'],
  },
  {
    name: 'Performance',
    description: 'Code splitting, lazy loading and Lighthouse-driven tuning.',
    technologies: ['Vite', 'Web Vitals', 'Lighthouse', 'PWA'],
  },
]

export const backendCapabilities: Capability[] = [
  {
    name: 'APIs & microservices',
    description: 'Scalable services with clean contracts and clear ownership.',
    technologies: ['NestJS', 'FastAPI', '.NET', 'API Gateway'],
  },
  {
    name: 'Databases',
    description: 'Schema design, indexing and tuning across SQL and NoSQL.',
    technologies: ['PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch'],
  },
  {
    name: 'Cloud & DevOps',
    description: 'Automated pipelines and infrastructure as code.',
    technologies: ['AWS', 'Azure', 'Docker', 'GitHub Actions'],
  },
  {
    name: 'Caching & scale',
    description: 'Caching layers and load strategies that cut response times.',
    technologies: ['Redis', 'CDN', 'Load balancing', 'Queues'],
  },
  {
    name: 'Security & observability',
    description: 'Auth done right, with monitoring that catches issues first.',
    technologies: ['OAuth', 'JWT', 'Prometheus', 'Grafana'],
  },
]

export interface Stat {
  value: number
  suffix: string
  label: string
}

export const stats: Stat[] = [
  { value: 4, suffix: '+', label: 'years shipping products' },
  { value: 50, suffix: 'K+', label: 'monthly active users served' },
  { value: 70, suffix: '%', label: 'faster page loads delivered' },
  { value: 99.9, suffix: '%', label: 'uptime on monitored systems' },
]
