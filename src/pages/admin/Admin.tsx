import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button, Spinner } from '@/components/admin/ui'
import ThemeToggle from '@/components/ThemeToggle'
import HeroEditor from '@/components/admin/HeroEditor'
import AboutEditor from '@/components/admin/AboutEditor'
import ContactEditor from '@/components/admin/ContactEditor'
import ProjectsEditor from '@/components/admin/ProjectsEditor'
import SkillsEditor from '@/components/admin/SkillsEditor'
import CvUploader from '@/components/admin/CvUploader'

const TABS = [
  { key: 'hero', label: 'Hero', el: <HeroEditor /> },
  { key: 'about', label: 'About', el: <AboutEditor /> },
  { key: 'contact', label: 'Contact', el: <ContactEditor /> },
  { key: 'projects', label: 'Projects', el: <ProjectsEditor /> },
  { key: 'skills', label: 'Skills', el: <SkillsEditor /> },
  { key: 'cv', label: 'CV', el: <CvUploader /> },
] as const

type TabKey = (typeof TABS)[number]['key']

export default function Admin() {
  const { loading, session, isAdmin, signOut } = useAuth()
  const [tab, setTab] = useState<TabKey>('hero')

  if (loading) {
    return (
      <main className="flex min-h-svh items-center justify-center">
        <Spinner label="Checking session" />
      </main>
    )
  }
  if (!session) return <Navigate to="/admin/login" replace />
  if (!isAdmin) {
    return (
      <main className="flex min-h-svh flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="text-bone-dim">You are signed in, but this account does not have admin access.</p>
        <Button variant="outline" onClick={signOut}>
          Sign out
        </Button>
      </main>
    )
  }

  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-10 border-b border-line bg-ink/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-6">
          <div className="flex min-w-0 items-center gap-4">
            <span className="font-display text-sm font-semibold">
              SRA<span className="text-ember">.</span>
              <span className="ml-3 font-normal text-bone-dim">Admin</span>
            </span>
            <Link to="/" className="label link-line hidden sm:inline">
              View site ↗
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8 md:py-12">
        <nav className="mb-8 flex flex-wrap gap-2" aria-label="Sections">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              aria-current={tab === t.key ? 'page' : undefined}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                tab === t.key ? 'border-ember bg-ember text-ink' : 'border-line hover:border-bone'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
        {TABS.find((t) => t.key === tab)?.el}
      </main>
    </div>
  )
}
