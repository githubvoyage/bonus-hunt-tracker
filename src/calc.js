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
