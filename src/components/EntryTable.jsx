import { useState } from 'react'
import { entryMultiplier, formatMoney, formatMult } from '../calc.js'

function Row({ entry, currency, index, onRecordWin, onDelete, onReopen }) {
  const [winInput, setWinInput] = useState('')
  const mult = entryMultiplier(entry)
  const mega = mult !== null && mult >= 50
  const banger = mult !== null && mult >= 10 && !mega

  function submitWin(e) {
    e.preventDefault()
    if (winInput === '') return
    onRecordWin(entry.id, winInput)
    setWinInput('')
  }

  return (
    <tr
      className={`border-b border-line/50 transition-colors hover:bg-bg-raised/50 ${
        entry.opened ? 'row-settle' : ''
      } ${mega ? 'bg-pink/10' : banger ? 'bg-gold/5' : ''}`}
    >
      <td className="py-3 pl-3 font-mono text-xs text-muted">
        {String(index + 1).padStart(2, '0')}
      </td>

      <td className="py-3 pr-3">
        <div className="font-semibold text-cream">{entry.name}</div>
        {mega && (
          <div className="font-display text-[10px] uppercase tracking-wider text-pink neon-pink">
            🔥 Mega banger
          </div>
        )}
      </td>

      <td className="py-3 pr-3 text-right font-mono text-cream">
        {formatMoney(entry.bet, currency)}
      </td>

      <td className="py-3 pr-3 text-right font-mono">
        {entry.opened ? (
          <button
            onClick={() => onReopen(entry.id)}
            className="font-semibold text-cream underline decoration-dotted underline-offset-4 transition-colors hover:text-gold"
            title="Kliknij, żeby poprawić"
          >
            {formatMoney(entry.win, currency)}
          </button>
        ) : (
          <form onSubmit={submitWin} className="flex justify-end">
            <input
              value={winInput}
              onChange={(e) => setWinInput(e.target.value)}
              inputMode="decimal"
              placeholder="wygrana"
              className="w-24 rounded-lg border border-line bg-bg-deep px-2 py-1.5 text-right font-mono text-cream transition-colors placeholder:text-muted/40 focus:border-win"
            />
          </form>
        )}
      </td>

      <td
        className={`py-3 pr-3 text-right font-mono font-bold ${
          mega
            ? 'text-pink neon-pink'
            : banger
            ? 'text-gold neon-gold'
            : mult !== null
            ? 'text-cream'
            : 'text-muted'
        }`}
      >
        {formatMult(mult)}
      </td>

      <td className="py-3 pl-2 pr-3 text-right">
        <button
          onClick={() => onDelete(entry.id)}
          className="text-muted transition-colors hover:text-loss"
          title="Usuń slota"
        >
          ✕
        </button>
      </td>
    </tr>
  )
}

export default function EntryTable({
  entries,
  currency,
  onRecordWin,
  onDelete,
  onReopen,
  sortByMultiplier,
}) {
  const sorted = sortByMultiplier
    ? [...entries].sort((a, b) => {
        const ma = entryMultiplier(a)
        const mb = entryMultiplier(b)
        if (ma === null && mb === null) return 0
        if (ma === null) return 1
        if (mb === null) return -1
        return mb - ma
      })
    : entries

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-bg-panel/40 px-5 py-14 text-center">
        <div className="mb-3 text-4xl">🎲</div>
        <p className="font-display text-sm uppercase tracking-wider text-muted">
          Pusto jak w portfelu
        </p>
        <p className="mt-2 text-sm text-muted/70">Dorzuć pierwszego slota wyżej i jedziemy.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-bg-panel/60 shadow-panel">
      <table className="w-full min-w-[520px] text-sm">
        <thead>
          <tr className="border-b border-line bg-bg-deep/60 text-left font-display text-[10px] uppercase tracking-wider text-muted">
            <th className="py-3 pl-3">#</th>
            <th className="py-3 pr-3">Slot</th>
            <th className="py-3 pr-3 text-right">Bet</th>
            <th className="py-3 pr-3 text-right">Wygrana</th>
            <th className="py-3 pr-3 text-right">Multi</th>
            <th className="py-3 pr-3"></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((entry, i) => (
            <Row
              key={entry.id}
              entry={entry}
              currency={currency}
              index={i}
              onRecordWin={onRecordWin}
              onDelete={onDelete}
              onReopen={onReopen}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
