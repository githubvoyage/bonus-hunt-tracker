import { useState } from 'react'
import { formatMoney } from '../calc.js'

const labelCls = 'text-[11px] font-bold uppercase tracking-wider text-muted'
const inputCls =
  'rounded-lg border border-line bg-bg-deep px-3 py-2 text-cream transition-colors placeholder:text-muted/50 focus:border-cyan'

export default function ParticipantsPanel({ hunt, split, onAdd, onUpdate, onRemove, onSetStartBalance }) {
  // Domyślnie widać sam wynik podziału. Dodawanie ekipy i grzebanie w składzie
  // siedzi pod przyciskiem, żeby w trakcie hunta nie kradło uwagi.
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState('')

  const currency = hunt.currency
  const { totalIn, totalWin, rows } = split
  const startBalance = Number(hunt.startBalance) || 0
  const mismatch = rows.length > 0 && Math.abs(totalIn - startBalance) >= 0.005

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    onAdd({ name: name.trim(), amount, paidBy: paidBy || null })
    setName('')
    setAmount('')
    setPaidBy('')
  }

  return (
    <div className="mt-5 rounded-xl border border-line/70 bg-bg-deep/40 px-4 py-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">💸</span>
          <h2 className="font-display text-sm uppercase tracking-wider text-cyan">Podział szmalu</h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {rows.length > 0 && (
            <span className="text-xs text-muted">
              Wkłady razem{' '}
              <span className="font-mono text-cream">{formatMoney(totalIn, currency)}</span>
              {' · '}do podziału{' '}
              <span className="font-mono text-gold">{formatMoney(totalWin, currency)}</span>
            </span>
          )}
          <button
            onClick={() => setEditing((v) => !v)}
            className={`rounded-lg border px-3 py-1.5 font-display text-[10px] uppercase tracking-wider transition-all ${
              editing
                ? 'border-cyan text-cyan shadow-neon-cyan'
                : 'border-line text-muted hover:border-cyan hover:text-cyan'
            }`}
          >
            {editing ? '✓ Gotowe' : rows.length > 0 ? '✏️ Zmień ekipę' : '+ Zbierz ekipę'}
          </button>
        </div>
      </div>

      {editing && (
        <form onSubmit={handleSubmit} className="mb-4 flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Imię</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Michał"
              className={`w-40 ${inputCls}`}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Wkład</label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              placeholder="20.00"
              className={`w-28 font-mono ${inputCls}`}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Kto wpłacił na kasynko</label>
            <select value={paidBy} onChange={(e) => setPaidBy(e.target.value)} className={`w-44 ${inputCls}`}>
              <option value="">Sam za siebie</option>
              {rows.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="rounded-lg bg-cyan px-5 py-2.5 font-display text-xs uppercase tracking-wider text-bg shadow-neon-cyan transition-transform hover:scale-105"
          >
            + Dorzuć do ekipy
          </button>
        </form>
      )}

      {editing && mismatch && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-gold/40 bg-gold/5 px-3 py-2 text-xs text-gold">
          <span>
            ⚠ Suma wkładów {formatMoney(totalIn, currency)} ≠ kasa na start{' '}
            {formatMoney(startBalance, currency)}
          </span>
          <button
            onClick={() => onSetStartBalance(totalIn)}
            className="rounded-md border border-gold px-2 py-1 font-semibold transition-colors hover:bg-gold hover:text-bg"
          >
            Ustaw kasę na {formatMoney(totalIn, currency)}
          </button>
        </div>
      )}

      {rows.length === 0 ? (
        <p className="text-sm text-muted/70">
          Nikt się jeszcze nie zrzucił. Zbierz ekipę, a policzę kto ile dostaje.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className={`w-full text-sm ${editing ? 'min-w-[620px]' : 'min-w-[420px]'}`}>
            <thead>
              <tr className="border-b border-line text-left font-display text-[10px] uppercase tracking-wider text-muted">
                <th className="py-2 pr-3">Kto</th>
                <th className="py-2 pr-3 text-right">Wkład</th>
                <th className="py-2 pr-3 text-right">Udział</th>
                <th className="py-2 pr-3">Kto wpłacił</th>
                <th className="py-2 pr-3 text-right">Do wypłaty</th>
                {editing && <th className="py-2"></th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-line/50 align-top">
                  <td className="py-3 pr-3 font-semibold text-cream">{r.name}</td>
                  <td className="py-3 pr-3 text-right font-mono text-cream">
                    {formatMoney(r.amount, currency)}
                  </td>
                  <td className="py-3 pr-3 text-right font-mono text-muted">
                    {(r.share * 100).toFixed(1)}%
                  </td>
                  <td className="py-2 pr-3">
                    {editing ? (
                      <select
                        value={r.paidBy || r.id}
                        onChange={(e) =>
                          onUpdate(r.id, { paidBy: e.target.value === r.id ? null : e.target.value })
                        }
                        className="rounded-md border border-line bg-bg-deep px-2 py-1 text-xs text-cream focus:border-cyan"
                      >
                        {rows.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.id === r.id ? 'Sam za siebie' : o.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs text-muted">
                        {r.paidBy ? rows.find((o) => o.id === r.paidBy)?.name : 'sam za siebie'}
                      </span>
                    )}
                  </td>
                  <td className="py-3 pr-3 text-right">
                    <div
                      className={`font-mono text-base font-bold ${
                        r.net < 0 ? 'text-loss neon-loss' : r.net > 0 ? 'text-win neon-win' : 'text-cream'
                      }`}
                    >
                      {formatMoney(r.net, currency)}
                    </div>
                    {(r.debts.length > 0 || r.credits.length > 0) && (
                      <div className="mt-1 space-y-0.5 font-mono text-[11px] text-muted">
                        <div>udział {formatMoney(r.gross, currency)}</div>
                        {r.debts.map((d) => (
                          <div key={d.id} className="text-loss/80">
                            −{formatMoney(d.amount, currency)} → {d.name}
                          </div>
                        ))}
                        {r.credits.map((c) => (
                          <div key={c.id} className="text-win/80">
                            +{formatMoney(c.amount, currency)} ← {c.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  {editing && (
                    <td className="py-3 text-right">
                      <button
                        onClick={() => onRemove(r.id)}
                        className="text-muted transition-colors hover:text-loss"
                        title="Usuń z ekipy"
                      >
                        ✕
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
