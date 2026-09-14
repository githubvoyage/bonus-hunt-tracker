import { useState } from 'react'

export default function NewHuntForm({ onCreate, onCancel }) {
  const [name, setName] = useState('Jebanka po wypłacie')
  const [currency, setCurrency] = useState('€')
  const [startBalance, setStartBalance] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    onCreate({ name, currency, startBalance })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="gradient-frame rounded-2xl px-5 py-5 shadow-panel md:px-6"
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xl">🍀</span>
        <h2 className="font-display text-sm uppercase tracking-wider text-gold neon-gold">
          Nowy hunt
        </h2>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted">
            Nazwa hunta
          </label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jebanka po wypłacie"
            className="w-56 rounded-lg border border-line bg-bg-deep px-3 py-2 text-cream transition-colors placeholder:text-muted/50 focus:border-gold"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted">
            Waluta
          </label>
          <input
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-16 rounded-lg border border-line bg-bg-deep px-3 py-2 text-center font-mono text-cream transition-colors focus:border-gold"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted">
            Kasa na start
          </label>
          <input
            value={startBalance}
            onChange={(e) => setStartBalance(e.target.value)}
            inputMode="decimal"
            placeholder="500.00"
            className="w-36 rounded-lg border border-line bg-bg-deep px-3 py-2 font-mono text-cream transition-colors placeholder:text-muted/50 focus:border-gold"
          />
        </div>

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
