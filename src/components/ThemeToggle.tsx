import { Moon, Sun } from 'lucide-react'
import { toggleTheme, useTheme } from '@/lib/theme'
import Magnetic from './ui/Magnetic'

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const theme = useTheme()
  const next = theme === 'dark' ? 'light' : 'dark'
  return (
    <Magnetic className={className}>
      <button
        type="button"
        onClick={(e) => toggleTheme({ x: e.clientX, y: e.clientY })}
        aria-label={`Switch to ${next} mode`}
        title={`Switch to ${next} mode`}
        data-cursor={next}
        className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-line transition-colors hover:border-ember"
      >
        <Sun className="absolute h-4 w-4 transition-all duration-500 ease-[cubic-bezier(.16,1,.3,1)] [html[data-theme=light]_&]:rotate-90 [html[data-theme=light]_&]:scale-0 [html[data-theme=light]_&]:opacity-0" />
        <Moon className="absolute h-4 w-4 -rotate-90 scale-0 opacity-0 transition-all duration-500 ease-[cubic-bezier(.16,1,.3,1)] [html[data-theme=light]_&]:rotate-0 [html[data-theme=light]_&]:scale-100 [html[data-theme=light]_&]:opacity-100" />
      </button>
    </Magnetic>
  )
}
