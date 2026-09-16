import { formatMoney, formatMult } from '../calc.js'

function Stat({ label, value, tone, big }) {
  const toneClass =
    tone === 'win'
      ? 'text-win neon-win'
      : tone === 'loss'
      ? 'text-loss neon-loss'
      : tone === 'gold'
      ? 'text-gold neon-gold'
      : 'text-cream'

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted">{label}</span>
      <span className={`font-mono font-bold ${big ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'} ${toneClass}`}>
        {value}
      </span>
    </div>
  )
}

export default function OverallStatsBar({ groups }) {
  if (!groups || groups.length === 0) return null

  return (
    <div className="gradient-frame rounded-2xl px-5 py-5 shadow-panel md:px-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xl">📊</span>
        <h2 className="font-display text-sm uppercase tracking-wider text-cyan">
          Bilans wszystkich huntów
        </h2>
      </div>

      <div className="space-y-5">
        {groups.map((g) => {
          const profitTone = g.profit > 0 ? 'win' : g.profit < 0 ? 'loss' : null
          return (
            <div key={g.currency} className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-5">
              <Stat label="Huntów" value={g.huntCount} />
              <Stat label="Wrzucone łącznie" value={formatMoney(g.startBalance, g.currency)} />
              <Stat label="Wygrane łącznie" value={formatMoney(g.totalWin, g.currency)} tone="gold" />
              <Stat
                label="Bilans"
                value={`${g.profit >= 0 ? '+' : ''}${formatMoney(g.profit, g.currency)}`}
                tone={profitTone}
                big
              />
              <Stat label="Ogólny multi" value={formatMult(g.overallMultiplier)} tone="gold" />
            </div>
          )
        })}
      </div>
    </div>
  )
}
