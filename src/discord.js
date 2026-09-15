import { entryMultiplier, formatMoney, formatMult } from './calc.js'

const WEBHOOK_URL =
  'https://discord.com/api/webhooks/1549488925905657966/s-_FpjUt5z9hYA_ktJfyQ5QD9TsDdQDzLo_u7t4-9suMgC7k_-wtlhSvfsqriLhBageL'

function bestEntry(hunt) {
  const opened = (hunt.entries || []).filter((e) => e.opened)
  if (opened.length === 0) return null
  return opened.reduce((best, e) => {
    const m = entryMultiplier(e) ?? -Infinity
    const bm = best ? entryMultiplier(best) ?? -Infinity : -Infinity
    return m > bm ? e : best
  }, null)
}

function buildSummaryEmbed(hunt, stats) {
  const currency = hunt.currency || '€'
  const profitPositive = stats.profit >= 0
  const best = bestEntry(hunt)

  const fields = [
    { name: 'Kasa na start', value: formatMoney(stats.startBalance, currency), inline: true },
    { name: 'Wygrana', value: formatMoney(stats.totalWin, currency), inline: true },
    {
      name: 'Zysk / strata',
      value: `${profitPositive ? '+' : ''}${formatMoney(stats.profit, currency)}`,
      inline: true,
    },
    { name: 'Ogólny multi', value: formatMult(stats.overallMultiplier), inline: true },
    { name: 'Sloty', value: `${stats.openedCount} / ${stats.count} otwartych`, inline: true },
  ]

  if (best) {
    fields.push({
      name: 'Najlepszy slot',
      value: `${best.name} — ${formatMult(entryMultiplier(best))} (${formatMoney(best.win, currency)})`,
      inline: true,
    })
  }

  return {
    title: `🎰 ${hunt.name} — hunt zakończony!`,
    color: profitPositive ? 0xd4af37 : 0xff4d6d,
    fields,
    footer: { text: 'Bonus Hunt Tracker' },
    timestamp: new Date().toISOString(),
  }
}

export async function sendHuntSummary(hunt, stats) {
  const res = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ embeds: [buildSummaryEmbed(hunt, stats)] }),
  })
  if (!res.ok) {
    throw new Error(`Discord webhook zwrócił błąd: ${res.status}`)
  }
}
