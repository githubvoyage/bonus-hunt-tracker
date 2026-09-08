export function huntStats(hunt) {
  const entries = hunt.entries || []
  const totalCost = entries.reduce((s, e) => s + (Number(e.cost) || 0), 0)
  const opened = entries.filter((e) => e.opened)
  const unopened = entries.filter((e) => !e.opened)
  const totalWin = opened.reduce((s, e) => s + (Number(e.win) || 0), 0)
  const profit = totalWin - totalCost
  const overallMultiplier = totalCost > 0 ? totalWin / totalCost : 0

  const remainingBetSum = unopened.reduce((s, e) => s + (Number(e.bet) || 0), 0)
  const remainingToBreakEven = totalCost - totalWin
  const breakEvenMultiplier =
    remainingBetSum > 0 && remainingToBreakEven > 0
      ? remainingToBreakEven / remainingBetSum
      : null

  return {
    count: entries.length,
    openedCount: opened.length,
    unopenedCount: unopened.length,
    totalCost,
    totalWin,
    profit,
    overallMultiplier,
    remainingBetSum,
    breakEvenMultiplier,
  }
}

export function entryMultiplier(entry) {
  if (!entry.opened || !entry.bet) return null
  return (Number(entry.win) || 0) / Number(entry.bet)
}

export function formatMoney(value, currency = '$') {
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
