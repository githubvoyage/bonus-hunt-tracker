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
