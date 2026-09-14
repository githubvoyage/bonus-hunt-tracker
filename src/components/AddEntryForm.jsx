import { useState } from 'react'

const empty = { name: '', bet: '' }

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
      bet: form.bet,
    })
    setForm(empty)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-3 rounded-2xl border border-dashed border-line bg-bg-panel/60 px-5 py-4 shadow-panel"
    >
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-muted">
          Nazwa slota
        </label>
        <input
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="Sweet Bonanza"
          className="w-52 rounded-lg border border-line bg-bg-deep px-3 py-2 text-cream transition-colors placeholder:text-muted/50 focus:border-pink"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-muted">Bet</label>
        <input
          value={form.bet}
          onChange={(e) => update('bet', e.target.value)}
          inputMode="decimal"
          placeholder="2.00"
          className="w-28 rounded-lg border border-line bg-bg-deep px-3 py-2 font-mono text-cream transition-colors placeholder:text-muted/50 focus:border-pink"
        />
      </div>

      <button
        type="submit"
        className="rounded-lg bg-pink px-5 py-2.5 font-display text-xs uppercase tracking-wider text-cream shadow-neon-pink transition-transform hover:scale-105"
      >
        + Dorzuć slota
      </button>
    </form>
  )
}
