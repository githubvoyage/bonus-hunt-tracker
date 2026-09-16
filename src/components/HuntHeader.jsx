import { useEffect, useState } from 'react'
import { formatMoney } from '../calc.js'
import NewHuntButton from './NewHuntButton.jsx'

export default function HuntHeader({
  hunts,
  activeId,
  onSelect,
  onNew,
  view,
  onChangeView,
  overall,
}) {
  // Na telefonie cały nagłówek zabierałby po zjechaniu prawie pół ekranu,
  // więc logo i bilans chowają się, a zostaje sam pasek do klikania.
  const [compact, setCompact] = useState(false)

  useEffect(() => {
    function onScroll() {
      setCompact(window.scrollY > 40)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    // przykleja się do góry przy scrollu, żeby przełączanie huntów i bilans
    // były pod ręką także w połowie długiej listy slotów
    <div
      className={`header-glow sticky top-0 z-20 -mx-4 space-y-4 border-b border-line px-4 shadow-lg shadow-bg/80 md:-mx-10 md:px-10 md:py-4 ${
        compact ? 'py-2' : 'py-4'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className={`flex-wrap items-center gap-3 ${compact ? 'hidden md:flex' : 'flex'}`}>
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
          <button
            onClick={() => onChangeView('rankings')}
            className={`rounded-lg border px-4 py-2 font-display text-xs uppercase tracking-wider transition-all ${
              view === 'rankings'
                ? 'border-win text-win shadow-neon-win'
                : 'border-line text-muted hover:border-win hover:text-win'
            }`}
          >
            🏆 Rankingi
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

          <NewHuntButton onCreate={onNew} />
        </div>
      )}
    </div>
  )
}
