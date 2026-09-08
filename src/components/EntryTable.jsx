import { useState } from 'react'
import { entryMultiplier, formatMoney, formatMult } from '../calc.js'

function Row({ entry, currency, index, onRecordWin, onDelete, onReopen }) {
  const [winInput, setWinInput] = useState('')
  const mult = entryMultiplier(entry)
  const highMult = mult !== null && mult >= 10

  function submitWin(e) {
    e.preventDefault()
    if (winInput === '') return
    onRecordWin(entry.id, winInput)
    setWinInput('')
  }

  return (
    <tr className={`border-b border-felt-line/60 ${entry.opened ? 'row-settle' : ''}`}>
      <td className="py-2 pl-1 text-muted">{index + 1}</td>
      <td className="py-2 pr-3">
        <div className="text-cream">{entry.name}</div>
        {entry.provider && <div className="text-xs text-muted">{entry.provider}</div>}
      </td>
      <td className="py-2 pr-3 text-right font-mono text-cream">
        {formatMoney(entry.bet, currency)}
      </td>
      <td className="py-2 pr-3 text-right font-mono text-cream">
        {formatMoney(entry.cost, currency)}
      </td>
      <td className="py-2 pr-3 text-right font-mono">
        {entry.opened ? (
          <button
            onClick={() => onReopen(entry.id)}
            className="text-cream underline decoration-dotted hover:text-gold"
            title="Click to edit"
          >
            {formatMoney(entry.win, currency)}
          </button>
        ) : (
          <form onSubmit={submitWin} className="flex justify-end gap-1">
            <input
              value={winInput}
              onChange={(e) => setWinInput(e.target.value)}
              inputMode="decimal"
              placeholder="win"
              className="w-20 rounded-sm border border-felt-line bg-felt px-1.5 py-1 text-right font-mono text-cream placeholder:text-muted/50"
            />
          </form>
        )}
      </td>
      <td
        className={`py-2 pr-3 text-right font-mono ${
          highMult ? 'text-gold-bright font-medium' : 'text-cream'
        }`}
      >
        {formatMult(mult)}
      </td>
      <td className="py-2 pl-2 text-right">
        <button
          onClick={() => onDelete(entry.id)}
          className="text-muted hover:text-danger"
          title="Remove slot"
        >
          ✕
        </button>
      </td>
    </tr>
  )
}

export default function EntryTable({ entries, currency, onRecordWin, onDelete, onReopen, sortByMultiplier }) {
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
      <div className="border border-felt-line px-5 py-10 text-center text-muted">
        No slots yet — add the first one above to start the hunt.
      </div>
    )
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs uppercase tracking-wide text-muted">
          <th className="pb-2 pl-1">#</th>
          <th className="pb-2 pr-3">Slot</th>
          <th className="pb-2 pr-3 text-right">Bet</th>
          <th className="pb-2 pr-3 text-right">Cost</th>
          <th className="pb-2 pr-3 text-right">Win</th>
          <th className="pb-2 pr-3 text-right">Multi</th>
          <th className="pb-2"></th>
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
  )
}
