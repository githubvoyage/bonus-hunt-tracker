import { useState } from 'react'

/** Jedno pole: jak nazywamy jazdę. Reszta ustawień jest edytowalna w panelu hunta. */
export default function NewHuntPrompt({ onCreate, onCancel }) {
  const [name, setName] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    onCreate(name)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="gradient-frame rounded-2xl px-5 py-5 shadow-panel md:px-6"
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xl">🍀</span>
        <h2 className="font-display text-sm uppercase tracking-wider text-gold neon-gold">
          Jak nazywamy jazdę?
        </h2>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jebanka po wypłacie"
          className="min-w-0 flex-1 rounded-lg border border-line bg-bg-deep px-3 py-2.5 text-cream transition-colors placeholder:text-muted/50 focus:border-gold"
        />

        <button
          type="submit"
          className="btn-jazda rounded-lg px-6 py-2.5 font-display text-sm uppercase tracking-wider text-bg shadow-neon-pink transition-transform hover:scale-105"
        >
          🚀 Napierdalamy
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2 text-sm font-semibold text-muted transition-colors hover:text-loss"
        >
          Spadaj
        </button>
      </div>
    </form>
  )
}
