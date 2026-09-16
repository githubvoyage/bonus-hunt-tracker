import { useMemo } from 'react'
import { computeRankings, formatMoney, formatMult } from '../calc.js'

const TONE_CLASS = {
  gold: 'text-gold neon-gold',
  pink: 'text-pink neon-pink',
  cyan: 'text-cyan',
  violet: 'text-violet',
  win: 'text-win neon-win',
  loss: 'text-loss neon-loss',
}

function RankCard({ icon, label, value, detail, tone }) {
  return (
    <div className="rounded-xl border border-line bg-bg-deep/60 px-4 py-3">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted">
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <div
        className={`mt-1.5 truncate font-mono text-xl font-bold ${TONE_CLASS[tone] || 'text-cream'}`}
        title={value}
      >
        {value}
      </div>
      {detail && (
        <div className="mt-1 truncate text-xs text-muted/80" title={detail}>
          {detail}
        </div>
      )}
    </div>
  )
}

export default function RankingsPanel({ hunts }) {
  const data = useMemo(() => computeRankings(hunts), [hunts])

  if (!data) {
    return (
      <div className="gradient-frame rounded-2xl px-5 py-14 text-center shadow-panel md:px-6">
        <div className="mb-3 text-4xl">🏆</div>
        <p className="font-display text-sm uppercase tracking-wider text-muted">
          Pusto jak w portfelu
        </p>
        <p className="mt-2 text-sm text-muted/70">Otwórz parę slotów, to będzie co rankingować.</p>
      </div>
    )
  }

  return (
    <div className="gradient-frame rounded-2xl px-5 py-5 shadow-panel md:px-6">
      <div className="mb-5 flex items-center gap-2">
        <span className="text-xl">🏆</span>
        <h2 className="font-display text-sm uppercase tracking-wider text-gold neon-gold">
          Rankingi
        </h2>
        <span className="text-xs text-muted">ze wszystkich huntów razem</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.bestMult && (
          <RankCard
            icon="🚀"
            label="Największy multi"
            tone="pink"
            value={formatMult(data.bestMult.multiplier)}
            detail={`${data.bestMult.name} · ${data.bestMult.huntName}`}
          />
        )}
        {data.worstMult && (
          <RankCard
            icon="🧊"
            label="Najmniejszy multi"
            tone="loss"
            value={formatMult(data.worstMult.multiplier)}
            detail={`${data.worstMult.name} · ${data.worstMult.huntName}`}
          />
        )}
        <RankCard
          icon="📊"
          label="Średni multi"
          tone="cyan"
          value={formatMult(data.avgMult)}
          detail={`z ${data.totalOpened} otwartych slotów`}
        />
        {data.mostPlayed && (
          <RankCard
            icon="🎡"
            label="Najczęściej grany"
            tone="violet"
            value={data.mostPlayed.name}
            detail={`${data.mostPlayed.count}× w historii`}
          />
        )}
      </div>

      <div className="mt-4 space-y-4">
        {data.moneyRankings.map((g) => (
          <div key={g.currency} className="grid gap-4 sm:grid-cols-3">
            <RankCard
              icon="🏆"
              label={`Najlepsza wygrana (${g.currency})`}
              tone="win"
              value={formatMoney(g.best.win, g.currency)}
              detail={`${g.best.name} · ${g.best.huntName}`}
            />
            <RankCard
              icon="💀"
              label={`Najgorsza wygrana (${g.currency})`}
              tone="loss"
              value={formatMoney(g.worst.win, g.currency)}
              detail={`${g.worst.name} · ${g.worst.huntName}`}
            />
            <RankCard
              icon="💰"
              label={`Suma wygranych (${g.currency})`}
              tone="gold"
              value={formatMoney(g.totalWin, g.currency)}
              detail={`${g.count} otwartych slotów`}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
