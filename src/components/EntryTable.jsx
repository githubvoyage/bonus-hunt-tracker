import { useState } from 'react'
import { entryMultiplier, formatMoney, formatMult } from '../calc.js'
import AddEntryForm from './AddEntryForm.jsx'
import EditableValue from './EditableValue.jsx'

function Row({ entry, currency, index, onSetBet, onRecordWin, onDelete, onReopen, guardEdit }) {
  // Edycja wygranej żyje w lokalnym stanie niezależnym od entry.opened — inaczej
  // pole zamieniałoby się w przycisk po pierwszym wpisanym znaku (bo ten od razu
  // zapisuje się wyżej i ustawia opened) i nie dałoby się dokończyć wpisywania.
  const [winInput, setWinInput] = useState(entry.opened ? String(entry.win ?? '') : '')
  const [editingWin, setEditingWin] = useState(!entry.opened)
  const mult = entryMultiplier(entry)
  const mega = mult !== null && mult >= 50
  const banger = mult !== null && mult >= 10 && !mega

  function handleWinChange(e) {
    const v = e.target.value
    setWinInput(v)
    if (v !== '') onRecordWin(entry.id, v)
  }

  function handleReopenClick() {
    guardEdit('poprawić wygraną', () => {
      setWinInput('')
      setEditingWin(true)
      onReopen(entry.id)
    })
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
        <div className="flex items-baseline justify-end gap-1">
          <span className="text-muted">{currency}</span>
          <EditableValue
            value={entry.bet}
            onCommit={(v) => onSetBet(entry.id, v)}
            guard={(onYes, onNo) => guardEdit('zmienić bet', onYes, onNo)}
            inputMode="decimal"
            placeholder="0"
            title="Kliknij i popraw bet"
            className="w-20 text-right font-mono text-cream"
          />
        </div>
      </td>

      <td className="py-3 pr-3 text-right font-mono">
        {editingWin ? (
          <input
            autoFocus
            value={winInput}
            onChange={handleWinChange}
            onBlur={() => setEditingWin(false)}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            inputMode="decimal"
            placeholder="wygrana"
            className="w-24 rounded-lg border border-line bg-bg-deep px-2 py-1.5 text-right font-mono text-cream transition-colors placeholder:text-muted/40 focus:border-win"
          />
        ) : (
          <button
            onClick={handleReopenClick}
            className="font-semibold text-cream underline decoration-dotted underline-offset-4 transition-colors hover:text-gold"
            title="Kliknij, żeby poprawić"
          >
            {formatMoney(entry.win, currency)}
          </button>
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
  onAdd,
  onSetBet,
  onRecordWin,
  onDelete,
  onReopen,
  slotNames,
  guardEdit,
}) {
  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-line/70 bg-bg-deep/40">
      {/* dorzucanie slota siedzi w tym samym kontenerze co lista */}
      <div className="border-b border-line/70 px-4 py-4">
        <AddEntryForm onAdd={onAdd} slotNames={slotNames} />
      </div>

      {entries.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <div className="mb-3 text-4xl">🎲</div>
          <p className="font-display text-sm uppercase tracking-wider text-muted">
            Pusto jak w portfelu
          </p>
          <p className="mt-2 text-sm text-muted/70">Dorzuć pierwszego slota wyżej i jedziemy.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
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
              {entries.map((entry, i) => (
                <Row
                  key={entry.id}
                  entry={entry}
                  currency={currency}
                  index={i}
                  onSetBet={onSetBet}
                  onRecordWin={onRecordWin}
                  onDelete={onDelete}
                  onReopen={onReopen}
                  guardEdit={guardEdit}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
