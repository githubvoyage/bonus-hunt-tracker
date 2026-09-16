import { formatMoney, formatMult } from '../calc.js'
import EditableValue from './EditableValue.jsx'

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

export default function SummaryBar({
  hunt,
  stats,
  onSetName,
  onSetCurrency,
  onSetStartBalance,
  children,
}) {
  const profitTone = stats.profit > 0 ? 'win' : stats.profit < 0 ? 'loss' : null
  const allOpened = stats.unopenedCount === 0 && stats.count > 0
  const progress = stats.count > 0 ? (stats.openedCount / stats.count) * 100 : 0

  return (
    <div
      className={`gradient-frame rounded-2xl px-5 py-5 shadow-panel md:px-6 ${
        stats.profit > 0 && allOpened ? 'pulse-glow' : ''
      }`}
    >
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="text-sm text-muted/70" title="Pola z przerywaną ramką można klikać i zmieniać">
            ✏️
          </span>
          <EditableValue
            value={hunt.name}
            onCommit={(v) => onSetName(v)}
            placeholder="Jebanka po wypłacie"
            title="Kliknij i zmień nazwę hunta"
            className="min-w-0 flex-1 font-display text-base uppercase tracking-wider text-gold neon-gold placeholder:text-muted/50 md:text-lg"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Waluta</span>
          <EditableValue
            value={hunt.currency}
            onCommit={(v) => onSetCurrency(v)}
            title="Kliknij i zmień walutę"
            className="w-14 text-center font-mono text-cream"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
            Kasa na start
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-xl font-bold text-muted md:text-2xl">
              {hunt.currency}
            </span>
            <EditableValue
              value={hunt.startBalance}
              onCommit={(v) => onSetStartBalance(v)}
              inputMode="decimal"
              placeholder="0"
              title="Kliknij i wpisz, ile poszło na start"
              className="w-full min-w-0 font-mono text-xl font-bold text-cream md:text-2xl"
            />
          </div>
        </div>
        <Stat label="Wygrana" value={formatMoney(stats.totalWin, hunt.currency)} tone="gold" />
        <Stat
          label="Zysk / strata"
          value={`${stats.profit >= 0 ? '+' : ''}${formatMoney(stats.profit, hunt.currency)}`}
          tone={profitTone}
          big
        />
        <Stat
          label={stats.unopenedCount > 0 ? 'Do zera trzeba' : 'Ogólny multi'}
          value={
            stats.unopenedCount > 0
              ? formatMult(stats.breakEvenMultiplier)
              : formatMult(stats.overallMultiplier)
          }
          tone="gold"
        />
      </div>

      {/* pasek postępu otwierania */}
      <div className="mt-5">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-deep">
          <div
            className="h-full rounded-full bg-gradient-to-r from-pink via-gold to-cyan transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
          <span className="font-semibold text-cream">
            {stats.openedCount} / {stats.count}
          </span>
          <span>slotów otwartych</span>
          {stats.unopenedCount > 0 && (
            <span>
              — pozostałe bety razem{' '}
              <span className="font-mono text-cream">
                {formatMoney(stats.remainingBetSum, hunt.currency)}
              </span>
            </span>
          )}
          {allOpened && (
            <span className={`font-display uppercase tracking-wider ${stats.profit >= 0 ? 'text-win' : 'text-loss'}`}>
              {stats.profit >= 0 ? '🤑 Na plusie!' : '💀 Przerąbane'}
            </span>
          )}
        </div>
      </div>

      {/* podokno w tej samej tęczowej ramce: podział szmalu */}
      {children}
    </div>
  )
}
