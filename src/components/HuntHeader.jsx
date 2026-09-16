import { formatMoney } from '../calc.js'
import NewHuntButton from './NewHuntButton.jsx'

export default function HuntHeader({
  hunts,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onFinish,
  sendingSummary,
  view,
  onChangeView,
  overall,
}) {
  const activeHunt = hunts.find((h) => h.id === activeId) || null

  return (
    <div className="space-y-4 border-b border-line pb-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-3xl blink">🎰</span>
          <h1 className="font-display text-xl leading-none text-gold neon-gold md:text-3xl">
            BONUS HUNT
            <span className="ml-2 text-pink neon-pink">TRACKER</span>
          </h1>

          {overall && overall.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {overall.map((g) => (
                <span
                  key={g.currency}
                  title="Bilans ze wszystkich huntów"
                  className={`rounded-lg border px-3 py-1.5 font-mono text-sm font-bold ${
                    g.profit > 0
                      ? 'border-win/40 text-win neon-win'
                      : g.profit < 0
                      ? 'border-loss/40 text-loss neon-loss'
                      : 'border-line text-cream'
                  }`}
                >
                  💰 {g.profit >= 0 ? '+' : ''}
                  {formatMoney(g.profit, g.currency)}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 text-sm">
          <button
            onClick={() => onChangeView('hunt')}
            className={`rounded-lg border px-4 py-2 font-display text-xs uppercase tracking-wider transition-all ${
              view === 'hunt'
                ? 'border-gold text-gold shadow-neon-gold'
                : 'border-line text-muted hover:border-gold hover:text-gold'
            }`}
          >
            🎰 Hunt
          </button>
          <button
            onClick={() => onChangeView('wheel')}
            className={`rounded-lg border px-4 py-2 font-display text-xs uppercase tracking-wider transition-all ${
              view === 'wheel'
                ? 'border-pink text-pink shadow-neon-pink'
                : 'border-line text-muted hover:border-pink hover:text-pink'
            }`}
          >
            🎡 Koło zrzutki
          </button>
        </div>
      </div>

      {view === 'hunt' && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          {hunts.length > 0 && (
            <select
              value={activeId || ''}
              onChange={(e) => onSelect(e.target.value)}
              className="rounded-lg border border-line bg-bg-panel px-3 py-2 text-sm font-medium text-cream shadow-panel transition-colors hover:border-gold focus:border-gold"
            >
              {hunts.map((h) => (
                <option key={h.id} value={h.id} className="bg-bg-panel">
                  {h.name}
                </option>
              ))}
            </select>
          )}

          <div className="flex flex-wrap items-center gap-2 text-sm">
            {activeId && (
              <button
                onClick={onFinish}
                disabled={sendingSummary}
                className={`rounded-lg border px-3 py-2 font-semibold transition-all disabled:cursor-wait disabled:opacity-60 ${
                  activeHunt?.finished
                    ? 'border-win/50 text-win hover:border-win hover:shadow-neon-win'
                    : 'border-line text-muted hover:border-win hover:text-win'
                }`}
              >
                {sendingSummary
                  ? '⏳ Wysyłanie...'
                  : activeHunt?.finished
                  ? '✅ Zakończony — wyślij ponownie'
                  : '🏁 Zakończ hunta'}
              </button>
            )}

            <NewHuntButton onCreate={onNew} />

            {activeId && (
              <button
                onClick={() => onDelete(activeId)}
                className="rounded-lg border border-transparent px-3 py-2 font-semibold text-muted transition-all hover:border-loss hover:text-loss"
              >
                🗑 Usuń hunta
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
