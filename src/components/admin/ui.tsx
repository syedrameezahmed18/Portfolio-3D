import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react'

/* ------------------------------------------------------------------ */
/* Small admin primitives in the site's own language. No component lib. */
/* ------------------------------------------------------------------ */

type Variant = 'primary' | 'outline' | 'ghost' | 'danger'

const variants: Record<Variant, string> = {
  primary: 'bg-ember text-ink hover:bg-bone',
  outline: 'border border-line hover:border-ember',
  ghost: 'hover:bg-ink-2',
  danger: 'border border-line text-ember hover:border-ember',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'sm' | 'md' | 'icon' }) {
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-5 py-2.5 text-sm', icon: 'h-9 w-9 justify-center' }
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-2 rounded-full font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    />
  )
}

export const Label = ({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) => (
  <label htmlFor={htmlFor} className="label mb-1.5 block">
    {children}
  </label>
)

export const Input = ({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) => (
  <input className={`field py-2.5 text-base ${className}`} {...rest} />
)

export const Textarea = ({ className = '', ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea className={`field resize-y py-2.5 text-base leading-relaxed ${className}`} {...rest} />
)

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
      {hint && <p className="mt-1.5 font-mono text-[11px] text-bone-mute">{hint}</p>}
    </div>
  )
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <span
        role="switch"
        aria-checked={checked}
        tabIndex={0}
        onClick={() => onChange(!checked)}
        onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${checked ? 'bg-ember' : 'bg-ink-3'}`}
      >
        <span className={`absolute top-1 h-4 w-4 rounded-full bg-bone transition-transform ${checked ? 'left-1 translate-x-5' : 'left-1'}`} />
      </span>
      <span className="text-sm">{label}</span>
    </label>
  )
}

export function Card({ title, children, actions }: { title?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-ink-2/60 p-5 md:p-7">
      {(title || actions) && (
        <header className="mb-6 flex items-center justify-between gap-4">
          {title && <h2 className="text-xl font-medium tracking-tight">{title}</h2>}
          {actions}
        </header>
      )}
      <div className="space-y-5">{children}</div>
    </section>
  )
}

export const Spinner = ({ label = 'Loading' }: { label?: string }) => (
  <p className="label flex items-center gap-3 py-10">
    <span className="h-3 w-3 animate-spin rounded-full border border-line border-t-ember" />
    {label}
  </p>
)

/* ------------------------------------------------------------------ */
/* Toasts                                                               */
/* ------------------------------------------------------------------ */

interface Toast {
  id: number
  title: string
  description?: string
  tone: 'ok' | 'error'
}

const ToastContext = createContext<(t: Omit<Toast, 'id'>) => void>(() => {})

export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Date.now() + Math.random()
    setToasts((list) => [...list, { ...t, id }])
    window.setTimeout(() => setToasts((list) => list.filter((x) => x.id !== id)), 4200)
  }, [])
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed right-4 bottom-4 z-[100] flex w-[min(92vw,22rem)] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto rounded-xl border bg-ink-2 p-4 shadow-lg ${t.tone === 'error' ? 'border-ember' : 'border-line'}`}
          >
            <p className="text-sm font-medium">{t.title}</p>
            {t.description && <p className="mt-1 text-xs text-bone-dim">{t.description}</p>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
