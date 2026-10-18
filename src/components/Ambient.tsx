/**
 * Slow-drifting colour fields behind everything. In light mode they are the
 * main atmosphere: warm apricot, ember and a cool slate wash moving across
 * paper. In dark mode they are a faint ember glow so the void breathes.
 */
export default function Ambient() {
  return (
    <div aria-hidden="true" className="ambient pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="ambient-blob ambient-a" />
      <div className="ambient-blob ambient-b" />
      <div className="ambient-blob ambient-c" />
      <div className="ambient-sheen" />
    </div>
  )
}
