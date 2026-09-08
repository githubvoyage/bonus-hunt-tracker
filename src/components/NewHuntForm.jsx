import { useState } from 'react'

export default function NewHuntForm({ onCreate, onCancel }) {
  const [name, setName] = useState('')
  const [currency, setCurrency] = useState('$')
  const [startBalance, setStartBalance] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    onCreate({ name, currency, startBalance })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-3 border border-gold/40 bg-felt-light px-5 py-4"
    >
      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-wide text-muted">Hunt name</label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Friday night hunt"
          className="w-48 rounded-sm border border-felt-line bg-felt px-2 py-1.5 text-cream placeholder:text-muted/60"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-wide text-muted">Currency</label>
        <input
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="w-16 rounded-sm border border-felt-line bg-felt px-2 py-1.5 text-cream"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-wide text-muted">Start balance</label>
        <input
          value={startBalance}
          onChange={(e) => setStartBalance(e.target.value)}
          inputMode="decimal"
          placeholder="500.00"
          className="w-32 rounded-sm border border-felt-line bg-felt px-2 py-1.5 font-mono text-cream placeholder:text-muted/60"
        />
      </div>
      <button
        type="submit"
        className="rounded-sm bg-gold px-4 py-1.5 font-medium text-felt hover:bg-gold-bright"
      >
        Start hunt
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="px-3 py-1.5 text-sm text-muted hover:text-cream"
      >
        Cancel
      </button>
    </form>
  )
}
