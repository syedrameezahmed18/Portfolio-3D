import { useEffect, useState } from 'react'

/** True on narrow screens and touch devices, where the 3D work is lightened. */
export const useIsCompact = () => {
  const [compact, setCompact] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px), (pointer: coarse)')
    const update = () => setCompact(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return compact
}
