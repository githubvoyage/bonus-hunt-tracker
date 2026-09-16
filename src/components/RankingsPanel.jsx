import { useMemo, useState } from 'react'
import { bestHunts, computeRankings, formatMoney, formatMult } from '../calc.js'

const TABS = [
  { key: 'bestHunts', label: 'Najlepsze hunty', icon: '🏅' },
  { key: 'bestWin', label: 'Największe wygrane', icon: '🏆' },
  { key: 'worstWin', label: 'Najmniejsze wygrane', icon: '💀' },
  { key: 'bestMult', label: 'Największy multi', icon: '🚀' },
  { key: 'worstMult', label: 'Najmniejszy multi', icon: '🧊' },
  { key: 'mostPlayed', label: 'Najczęściej grane', icon: '🎡' },
  { key: 'hotSlots', label: 'Hot sloty', icon: '🔥' },
  { key: 'coldSlots', label: 'Cold sloty', icon: '🥶' },
]

const thCls = 'py-2 pr-3 text-left'
const tdName = 'py-2 pr-3 font-semibold text-cream'
const tdMuted = 'py-2 pr-3 text-xs text-muted'
const tdRight = 'py-2 pr-3 text-right font-mono text-cream'

function multClass(mult) {
  if (mult === null) return 'text-muted'
  if (mult >= 50) return 'text-pink neon-pink'
  if (mult >= 10) return 'text-gold neon-gold'
  return 'text-cream'
}

function Table({ children }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line/70">
      <table className="w-full min-w-[520px] text-sm">{children}</table>
    </div>
  )
}

function Thead({ columns }) {
  return (
    <thead>
      <tr className="border-b border-line bg-bg-deep/60 font-display text-[10px] uppercase tracking-wider text-muted">
        <th className={`${thCls} pl-3`}>#</th>
        {columns.map((c) => (
          <th key={c} className={thCls}>
            {c}
          </th>
        ))}
      </tr>
    </thead>
  )
}

function MoneyTable({ groups }) {
  return (
    <div className="space-y-4">
      {groups.map((g) => (
        <div key={g.currency}>
          {groups.length > 1 && (
            <div className="mb-1.5 text-xs font-bold uppercase tracking-wider text-muted">
              Waluta {g.currency}
            </div>
          )}
          <Table>
            <Thead columns={['Slot', 'Hunt', 'Bet', 'Wygrana', 'Multi']} />
            <tbody>
              {g.rows.map((r, i) => (
                <tr key={i} className="border-b border-line/50">
                  <td className="py-2 pl-3 font-mono text-xs text-muted">{i + 1}</td>
                  <td className={tdName}>{r.name}</td>
                  <td className={tdMuted}>{r.huntName}</td>
                  <td className={tdRight}>{formatMoney(r.bet, g.currency)}</td>
                  <td className={`${tdRight} font-bold text-gold`}>{formatMoney(r.win, g.currency)}</td>
                  <td className={`${tdRight} font-bold ${multClass(r.multiplier)}`}>
                    {formatMult(r.multiplier)}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      ))}
    </div>
  )
}

function MultTable({ rows }) {
  return (
    <Table>
      <Thead columns={['Slot', 'Hunt', 'Bet', 'Wygrana', 'Multi']} />
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b border-line/50">
            <td className="py-2 pl-3 font-mono text-xs text-muted">{i + 1}</td>
            <td className={tdName}>{r.name}</td>
            <td className={tdMuted}>{r.huntName}</td>
            <td className={tdRight}>{formatMoney(r.bet, r.currency)}</td>
            <td className={`${tdRight} font-bold text-gold`}>{formatMoney(r.win, r.currency)}</td>
            <td className={`${tdRight} font-bold ${multClass(r.multiplier)}`}>
              {formatMult(r.multiplier)}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

function MostPlayedTable({ rows }) {
  return (
    <Table>
      <Thead columns={['Slot', 'Ile razy']} />
      <tbody>
        {rows.map((r, i) => (
          <tr key={r.name} className="border-b border-line/50">
            <td className="py-2 pl-3 font-mono text-xs text-muted">{i + 1}</td>
            <td className={tdName}>{r.name}</td>
            <td className={`${tdRight} font-bold text-violet`}>{r.count}×</td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

function HuntRankingTable({ rows }) {
  return (
    <Table>
      <Thead columns={['Hunt', 'Kasa na start', 'Wygrana', 'Zysk / strata', 'Multi']} />
      <tbody>
        {rows.map((r, i) => (
          <tr key={r.id} className="border-b border-line/50">
            <td className="py-2 pl-3 font-mono text-xs text-muted">{i + 1}</td>
            <td className={tdName}>{r.name}</td>
            <td className={tdRight}>{formatMoney(r.startBalance, r.currency)}</td>
            <td className={`${tdRight} font-bold text-gold`}>{formatMoney(r.totalWin, r.currency)}</td>
            <td className={`${tdRight} font-bold ${r.profit >= 0 ? 'text-win' : 'text-loss'}`}>
              {r.profit >= 0 ? '+' : ''}
              {formatMoney(r.profit, r.currency)}
            </td>
            <td className={`${tdRight} font-bold ${multClass(r.overallMultiplier)}`}>
              {formatMult(r.overallMultiplier)}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

function HotColdTable({ rows }) {
  return (
    <Table>
      <Thead columns={['Slot', 'Grane', 'Na plusie', 'Na minusie']} />
      <tbody>
        {rows.map((r, i) => (
          <tr key={r.name} className="border-b border-line/50">
            <td className="py-2 pl-3 font-mono text-xs text-muted">{i + 1}</td>
            <td className={tdName}>{r.name}</td>
            <td className={tdRight}>{r.plays}×</td>
            <td className={`${tdRight} font-bold text-win`}>{r.plus}×</td>
            <td className={`${tdRight} font-bold text-loss`}>{r.minus}×</td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

function NoSlotsNote() {
  return (
    <p className="text-sm text-muted/70">
      Brak otwartych slotów — nie ma jeszcze czego rankingować w tej kategorii.
    </p>
  )
}

export default function RankingsPanel({ hunts }) {
  const data = useMemo(() => computeRankings(hunts, 10), [hunts])
  const huntRanking = useMemo(() => bestHunts(hunts, 10), [hunts])
  const [tab, setTab] = useState('bestHunts')

  if (hunts.length === 0) {
    return (
      <div className="gradient-frame rounded-2xl px-5 py-14 text-center shadow-panel md:px-6">
        <div className="mb-3 text-4xl">🏆</div>
        <p className="font-display text-sm uppercase tracking-wider text-muted">
          Pusto jak w portfelu
        </p>
        <p className="mt-2 text-sm text-muted/70">Odpal hunta, to będzie co rankingować.</p>
      </div>
    )
  }

  return (
    <div className="gradient-frame rounded-2xl px-5 py-5 shadow-panel md:px-6">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <span className="text-xl">🏆</span>
        <h2 className="font-display text-sm uppercase tracking-wider text-gold neon-gold">
          Rankingi
        </h2>
        <span className="text-xs text-muted">ze wszystkich huntów razem</span>
      </div>
      {data && (
        <p className="mb-4 text-xs text-muted">
          Średni multi <span className="font-mono text-cream">{formatMult(data.avgMult)}</span>
          {' · '}
          {data.totalOpened} otwartych slotów w historii
        </p>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-lg border px-3 py-1.5 font-display text-[11px] uppercase tracking-wider transition-all ${
              tab === t.key
                ? 'border-gold text-gold shadow-neon-gold'
                : 'border-line text-muted hover:border-gold hover:text-gold'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'bestHunts' && <HuntRankingTable rows={huntRanking} />}
      {tab === 'bestWin' && (data ? <MoneyTable groups={data.bestWin} /> : <NoSlotsNote />)}
      {tab === 'worstWin' && (data ? <MoneyTable groups={data.worstWin} /> : <NoSlotsNote />)}
      {tab === 'bestMult' && (data ? <MultTable rows={data.bestMult} /> : <NoSlotsNote />)}
      {tab === 'worstMult' && (data ? <MultTable rows={data.worstMult} /> : <NoSlotsNote />)}
      {tab === 'mostPlayed' && (data ? <MostPlayedTable rows={data.mostPlayed} /> : <NoSlotsNote />)}
      {(tab === 'hotSlots' || tab === 'coldSlots') &&
        (data ? (
          <>
            <p className="mb-3 text-xs text-muted/70">
              Na plusie = wygrana większa niż bet. Na minusie = wygrana mniejsza niż bet.
            </p>
            <HotColdTable rows={tab === 'hotSlots' ? data.hotSlots : data.coldSlots} />
          </>
        ) : (
          <NoSlotsNote />
        ))}
    </div>
  )
}
