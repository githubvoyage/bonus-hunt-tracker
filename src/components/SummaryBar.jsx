import { formatMoney, formatMult } from '../calc.js'

function Stat({ label, value, tone }) {
  const toneClass =
    tone === 'positive'
      ? 'text-positive'
      : tone === 'danger'
      ? 'text-danger'
      : 'text-cream'
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-muted">{label}</span>
      <span className={`font-mono text-xl md:text-2xl ${toneClass}`}>{value}</span>
    </div>
  )
}

export default function SummaryBar({ hunt, stats }) {
  const profitTone = stats.profit > 0 ? 'positive' : stats.profit < 0 ? 'danger' : null

  return (
    <div className="rounded-sm border border-felt-line bg-felt-light px-5 py-4 md:px-6 md:py-5">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <Stat label="Start balance" value={formatMoney(hunt.startBalance, hunt.currency)} />
        <Stat label="Total cost" value={formatMoney(stats.totalCost, hunt.currency)} />
        <Stat label="Total win" value={formatMoney(stats.totalWin, hunt.currency)} />
        <Stat
          label="Profit / loss"
          value={`${stats.profit >= 0 ? '+' : ''}${formatMoney(stats.profit, hunt.currency)}`}
          tone={profitTone}
        />
        <Stat
          label={stats.unopenedCount > 0 ? 'Break-even needs' : 'Overall multi'}
          value={
            stats.unopenedCount > 0
              ? formatMult(stats.breakEvenMultiplier)
              : formatMult(stats.overallMultiplier)
          }
        />
      </div>
      <div className="mt-3 text-xs text-muted">
        {stats.openedCount} of {stats.count} slots opened
        {stats.unopenedCount > 0 &&
          ` — remaining bets total ${formatMoney(stats.remainingBetSum, hunt.currency)}`}
      </div>
    </div>
  )
}
