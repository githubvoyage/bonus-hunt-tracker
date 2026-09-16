import { useEffect, useRef, useState } from 'react'

/**
 * Przycisk „nowy hunt” z dymkiem na nazwę, doczepionym do samego przycisku.
 * Nie przesuwa strony, nie udaje panelu — pytamy o nazwę i jedziemy.
 */
export default function NewHuntButton({ onCreate, variant = 'header' }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const boxRef = useRef(null)

  useEffect(() => {
    if (!open) return

    function handleOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false)
    }
    function handleEsc(e) {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [open])

  function handleSubmit(e) {
    e.preventDefault()
    onCreate(name)
    setName('')
    setOpen(false)
  }

  const big = variant === 'big'

  return (
    <div ref={boxRef} className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        className={
          big
            ? 'btn-jazda rounded-lg px-6 py-2.5 font-display text-sm uppercase tracking-wider text-bg shadow-neon-pink transition-transform hover:scale-105'
            : 'rounded-lg bg-gold px-4 py-2 font-display text-xs uppercase tracking-wider text-bg shadow-neon-gold transition-transform hover:scale-105 hover:bg-gold-bright'
        }
      >
        {big ? '🚀 Napierdalamy' : '+ Nowy hunt'}
      </button>

      {open && (
        <form
          onSubmit={handleSubmit}
          className={`absolute top-full z-30 mt-2 w-[17rem] max-w-[80vw] rounded-xl border border-gold/50 bg-bg-panel p-3 text-left shadow-neon-gold ${
            big ? 'left-1/2 -translate-x-1/2' : 'right-0'
          }`}
        >
          {/* dzióbek dymka */}
          <span
            className={`absolute -top-1.5 h-3 w-3 rotate-45 border-l border-t border-gold/50 bg-bg-panel ${
              big ? 'left-1/2 -ml-1.5' : 'right-6'
            }`}
          />

          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted">
            Jak nazywamy jazdę?
          </label>
          <div className="flex gap-2">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jebanka po wypłacie"
              className="min-w-0 flex-1 rounded-lg border border-line bg-bg-deep px-2.5 py-2 text-sm text-cream transition-colors placeholder:text-muted/50 focus:border-gold"
            />
            <button
              type="submit"
              className="rounded-lg bg-gold px-3 py-2 font-display text-xs uppercase tracking-wider text-bg transition-transform hover:scale-105 hover:bg-gold-bright"
            >
              Jazda
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
