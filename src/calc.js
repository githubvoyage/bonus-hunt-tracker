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

// rankingi ze wszystkich otwartych slotów ze wszystkich huntów; kwoty liczone
// osobno per waluta, multi jest bezwymiarowe więc liczone wspólnie
export function computeRankings(hunts = []) {
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

  const byCurrency = new Map()
  for (const e of opened) {
    const g = byCurrency.get(e.currency) || { currency: e.currency, entries: [] }
    g.entries.push(e)
    byCurrency.set(e.currency, g)
  }
  const moneyRankings = Array.from(byCurrency.values()).map((g) => {
    const sorted = [...g.entries].sort((a, b) => b.win - a.win)
    return {
      currency: g.currency,
      best: sorted[0],
      worst: sorted[sorted.length - 1],
      totalWin: g.entries.reduce((s, e) => s + e.win, 0),
      count: g.entries.length,
    }
  })

  const withMult = opened.filter((e) => e.multiplier !== null)
  const bestMult = withMult.length
    ? withMult.reduce((a, b) => (b.multiplier > a.multiplier ? b : a))
    : null
  const worstMult = withMult.length
    ? withMult.reduce((a, b) => (b.multiplier < a.multiplier ? b : a))
    : null
  const avgMult = withMult.length
    ? withMult.reduce((s, e) => s + e.multiplier, 0) / withMult.length
    : 0

  const nameCounts = new Map()
  for (const e of opened) nameCounts.set(e.name, (nameCounts.get(e.name) || 0) + 1)
  const [mostPlayedName, mostPlayedCount] =
    Array.from(nameCounts.entries()).sort((a, b) => b[1] - a[1])[0] || []

  return {
    totalOpened: opened.length,
    moneyRankings,
    bestMult,
    worstMult,
    avgMult,
    mostPlayed: mostPlayedName ? { name: mostPlayedName, count: mostPlayedCount } : null,
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
