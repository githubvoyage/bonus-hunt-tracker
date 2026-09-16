export function huntStats(hunt) {
  const entries = hunt.entries || []
  const startBalance = Number(hunt.startBalance) || 0
  const opened = entries.filter((e) => e.opened)
  const unopened = entries.filter((e) => !e.opened)
  const totalWin = opened.reduce((s, e) => s + (Number(e.win) || 0), 0)
  const profit = totalWin - startBalance
  const overallMultiplier = startBalance > 0 ? totalWin / startBalance : 0

  const remainingBetSum = unopened.reduce((s, e) => s + (Number(e.bet) || 0), 0)
  const remainingToBreakEven = startBalance - totalWin
  const breakEvenMultiplier =
    remainingBetSum > 0 && remainingToBreakEven > 0
      ? remainingToBreakEven / remainingBetSum
      : null

  return {
    count: entries.length,
    openedCount: opened.length,
    unopenedCount: unopened.length,
    startBalance,
    totalWin,
    profit,
    overallMultiplier,
    remainingBetSum,
    breakEvenMultiplier,
  }
}

// bilans zbiorczy ze wszystkich huntów, pogrupowany po walucie (żeby nie mieszać € z $)
export function overallStats(hunts = []) {
  const groups = new Map()
  for (const hunt of hunts) {
    const currency = hunt.currency || '€'
    const stats = huntStats(hunt)
    const g = groups.get(currency) || { currency, huntCount: 0, startBalance: 0, totalWin: 0 }
    g.huntCount += 1
    g.startBalance += stats.startBalance
    g.totalWin += stats.totalWin
    groups.set(currency, g)
  }
  return Array.from(groups.values()).map((g) => ({
    ...g,
    profit: g.totalWin - g.startBalance,
    overallMultiplier: g.startBalance > 0 ? g.totalWin / g.startBalance : 0,
  }))
}

// ranking huntów po wyniku. Sortujemy po multi (bezwymiarowe), nie po zysku w
// kasie, bo zysk w € i w $ nie da się uczciwie porównać w jednej tabelce.
export function bestHunts(hunts = [], limit = 10) {
  return hunts
    .map((hunt) => {
      const stats = huntStats(hunt)
      return {
        id: hunt.id,
        name: hunt.name,
        currency: hunt.currency || '€',
        startBalance: stats.startBalance,
        totalWin: stats.totalWin,
        profit: stats.profit,
        overallMultiplier: stats.overallMultiplier,
      }
    })
    .sort((a, b) => b.overallMultiplier - a.overallMultiplier)
    .slice(0, limit)
}

// unikalne nazwy slotów ze wszystkich huntów, najczęściej grane na górze — pod autouzupełnianie
export function knownSlotNames(hunts = []) {
  const counts = new Map()
  for (const hunt of hunts) {
    for (const entry of hunt.entries || []) {
      const name = (entry.name || '').trim()
      if (!name) continue
      counts.set(name, (counts.get(name) || 0) + 1)
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name]) => name)
}

// rankingi top-N ze wszystkich otwartych slotów ze wszystkich huntów. Kwoty
// (wygrane) liczone osobno per waluta, żeby nie mieszać € z $ w jednej tabelce;
// multi jest bezwymiarowe, więc leci jedna wspólna tabelka bez podziału.
export function computeRankings(hunts = [], limit = 10) {
  const opened = []
  for (const hunt of hunts) {
    const currency = hunt.currency || '€'
    for (const entry of hunt.entries || []) {
      if (!entry.opened) continue
      opened.push({
        name: entry.name || 'Slot bez nazwy',
        bet: Number(entry.bet) || 0,
        win: Number(entry.win) || 0,
        multiplier: entryMultiplier(entry),
        huntName: hunt.name,
        currency,
      })
    }
  }

  if (opened.length === 0) return null

  const currencies = Array.from(new Set(opened.map((e) => e.currency)))
  const topByCurrency = (sortFn) =>
    currencies
      .map((currency) => ({
        currency,
        rows: opened
          .filter((e) => e.currency === currency)
          .sort(sortFn)
          .slice(0, limit),
      }))
      .filter((g) => g.rows.length > 0)

  const withMult = opened.filter((e) => e.multiplier !== null)
  const avgMult = withMult.length
    ? withMult.reduce((s, e) => s + e.multiplier, 0) / withMult.length
    : 0

  const nameCounts = new Map()
  for (const e of opened) {
    const g = nameCounts.get(e.name) || { name: e.name, count: 0 }
    g.count += 1
    nameCounts.set(e.name, g)
  }
  const mostPlayed = Array.from(nameCounts.values())
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, limit)

  // hot/cold: ile razy dany slot (po nazwie) wypłacił więcej niż bet, a ile razy mniej —
  // niezależnie od waluty, bo liczymy tylko wynik spinu (plus/minus), nie kwotę
  const slotAgg = new Map()
  for (const e of opened) {
    const g = slotAgg.get(e.name) || { name: e.name, plays: 0, plus: 0, minus: 0 }
    g.plays += 1
    if (e.win > e.bet) g.plus += 1
    else if (e.win < e.bet) g.minus += 1
    slotAgg.set(e.name, g)
  }
  const slotList = Array.from(slotAgg.values()).map((g) => ({ ...g, score: g.plus - g.minus }))
  const byHotCold = (dir) => (a, b) =>
    dir * (b.score - a.score) || b.plays - a.plays || a.name.localeCompare(b.name)
  const hotSlots = [...slotList].sort(byHotCold(1)).slice(0, limit)
  const coldSlots = [...slotList].sort(byHotCold(-1)).slice(0, limit)

  return {
    totalOpened: opened.length,
    avgMult,
    bestWin: topByCurrency((a, b) => b.win - a.win),
    worstWin: topByCurrency((a, b) => a.win - b.win),
    hotSlots,
    coldSlots,
    bestMult: [...withMult].sort((a, b) => b.multiplier - a.multiplier).slice(0, limit),
    worstMult: [...withMult].sort((a, b) => a.multiplier - b.multiplier).slice(0, limit),
    mostPlayed,
  }
}

export function splitPayouts(participants = [], totalWin = 0) {
  const totalIn = participants.reduce((s, p) => s + (Number(p.amount) || 0), 0)
  const rows = participants.map((p) => {
    const amount = Number(p.amount) || 0
    const share = totalIn > 0 ? amount / totalIn : 0
    return { ...p, amount, share, gross: totalWin * share, debts: [], credits: [] }
  })
  const byId = new Map(rows.map((r) => [r.id, r]))

  // ktoś wpłacił wkład za kogoś innego — ten ktoś oddaje mu tę kwotę z wypłaty
  rows.forEach((r) => {
    const payer = r.paidBy && r.paidBy !== r.id ? byId.get(r.paidBy) : null
    if (!payer || r.amount === 0) return
    r.debts.push({ id: payer.id, name: payer.name, amount: r.amount })
    payer.credits.push({ id: r.id, name: r.name, amount: r.amount })
  })

  rows.forEach((r) => {
    const owes = r.debts.reduce((s, d) => s + d.amount, 0)
    const owed = r.credits.reduce((s, c) => s + c.amount, 0)
    r.net = r.gross - owes + owed
  })

  return { totalIn, totalWin, rows }
}

export function entryMultiplier(entry) {
  if (!entry.opened || !entry.bet) return null
  return (Number(entry.win) || 0) / Number(entry.bet)
}

export function formatMoney(value, currency = '€') {
  const n = Number(value) || 0
  return `${currency}${n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatMult(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return `${value.toFixed(2)}x`
}
