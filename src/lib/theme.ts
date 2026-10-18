import { useSyncExternalStore } from 'react'

export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'portfolio-theme'
const META_COLORS: Record<Theme, string> = { dark: '#0b0a09', light: '#f4efe7' }

const listeners = new Set<() => void>()

const read = (): Theme => {
  if (typeof document === 'undefined') return 'dark'
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

const apply = (theme: Theme) => {
  document.documentElement.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', META_COLORS[theme])
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    /* private mode */
  }
  listeners.forEach((l) => l())
}

export const getTheme = read

export const setTheme = (theme: Theme) => {
  if (theme === read()) return
  apply(theme)
}

/**
 * Flip the theme. With the View Transition API available, the new theme
 * wipes in as a circle from the toggle; elsewhere it switches instantly.
 */
export const toggleTheme = (origin?: { x: number; y: number }) => {
  const next: Theme = read() === 'dark' ? 'light' : 'dark'
  const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } }
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!doc.startViewTransition || reduced || !origin) {
    apply(next)
    return
  }

  const transition = doc.startViewTransition(() => apply(next))
  transition.ready.then(() => {
    const { x, y } = origin
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
      { duration: 700, easing: 'cubic-bezier(0.76, 0, 0.24, 1)', pseudoElement: '::view-transition-new(root)' },
    )
  })
}

const subscribe = (cb: () => void) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export const useTheme = (): Theme => useSyncExternalStore(subscribe, read, () => 'dark')

/** Palette the WebGL scenes need; CSS handles everything else via tokens. */
export const scenePalette = (theme: Theme) =>
  theme === 'light'
    ? { bg: '#f4efe7', ink: '#15120f', ember: '#e8512a', line: '#15120f', dust: '#15120f', shard: '#f7f2ea' }
    : { bg: '#0b0a09', ink: '#ece5d8', ember: '#ff6a3d', line: '#ece5d8', dust: '#ece5d8', shard: '#17140f' }
