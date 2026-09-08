import { useState } from 'react'

const empty = { name: '', provider: '', bet: '', cost: '' }

export default function AddEntryForm({ onAdd }) {
  const [form, setForm] = useState(empty)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    onAdd({
      name: form.name.trim(),
      provider: form.provider.trim(),
      bet: form.bet,
      cost: form.cost,
    })
    setForm(empty)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-3 border border-dashed border-felt-line bg-felt-light/40 px-5 py-4"
    >
      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-wide text-muted">Slot name</label>
        <input
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="Sweet Bonanza"
          className="w-40 rounded-sm border border-felt-line bg-felt px-2 py-1.5 text-cream placeholder:text-muted/60"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-wide text-muted">Provider</label>
        <input
          value={form.provider}
          onChange={(e) => update('provider', e.target.value)}
          placeholder="Pragmatic Play"
          className="w-36 rounded-sm border border-felt-line bg-felt px-2 py-1.5 text-cream placeholder:text-muted/60"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-wide text-muted">Bet size</label>
        <input
          value={form.bet}
          onChange={(e) => update('bet', e.target.value)}
          inputMode="decimal"
          placeholder="2.00"
          className="w-24 rounded-sm border border-felt-line bg-felt px-2 py-1.5 font-mono text-cream placeholder:text-muted/60"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-wide text-muted">Cost</label>
        <input
          value={form.cost}
          onChange={(e) => update('cost', e.target.value)}
          inputMode="decimal"
          placeholder="40.00"
          className="w-24 rounded-sm border border-felt-line bg-felt px-2 py-1.5 font-mono text-cream placeholder:text-muted/60"
        />
      </div>
      <button
        type="submit"
        className="rounded-sm bg-gold px-4 py-1.5 font-medium text-felt hover:bg-gold-bright transition-colors"
      >
        Add slot
      </button>
    </form>
  )
}
