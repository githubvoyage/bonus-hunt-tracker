import { entryMultiplier, formatMoney, formatMult, splitPayouts } from './calc.js'

const WEBHOOK_URL =
  'https://discord.com/api/webhooks/1549488925905657966/s-_FpjUt5z9hYA_ktJfyQ5QD9TsDdQDzLo_u7t4-9suMgC7k_-wtlhSvfsqriLhBageL'

const COLOR_MEGA = 0xff2d78
const COLOR_WIN = 0xd4af37
const COLOR_LOSS = 0xff4d6d

function padName(name, width = 18) {
  const safe = String(name || 'Slot bez nazwy')
  const trimmed = safe.length > width ? `${safe.slice(0, width - 1)}…` : safe
  return trimmed.padEnd(width)
}

function tierEmoji(entry) {
  const m = entryMultiplier(entry)
  if (m === null) return '⏳'
  if (m >= 50) return '🔥'
  if (m >= 10) return '⭐'
  if (m === 0) return '💀'
  return '▫️'
}

function slotLine(entry, currency, badge) {
  const bet = formatMoney(entry.bet, currency).padStart(9)
  const win = entry.opened ? formatMoney(entry.win, currency).padStart(9) : '   czeka'.padStart(9)
  const mult = entry.opened ? formatMult(entryMultiplier(entry)).padStart(7) : '—'.padStart(7)
  return `${padName(entry.name)} ${bet} → ${win} ${mult} ${badge || tierEmoji(entry)}`
}

function chunkLines(lines, maxLen = 950) {
  const chunks = []
  let current = ''
  for (const line of lines) {
    const candidate = current ? `${current}\n${line}` : line
    if (candidate.length > maxLen && current) {
      chunks.push(current)
      current = line
    } else {
      current = candidate
    }
  }
  if (current) chunks.push(current)
  return chunks.length ? chunks : ['(pusto)']
}

function extremeEntries(hunt) {
  const opened = (hunt.entries || []).filter((e) => e.opened)
  if (opened.length === 0) return { best: null, worst: null }
  let best = opened[0]
  let worst = opened[0]
  for (const e of opened) {
    if ((entryMultiplier(e) ?? -Infinity) > (entryMultiplier(best) ?? -Infinity)) best = e
    if ((entryMultiplier(e) ?? Infinity) < (entryMultiplier(worst) ?? Infinity)) worst = e
  }
  return { best, worst: best === worst ? null : worst }
}

function tagline(stats) {
  if (stats.overallMultiplier >= 3) return '🚀🚀🚀 KOSMICZNA JAZDA! Kasyno się trzęsie, ekipa liczy hajs!'
  if (stats.profit > 0) return '🤑 NA PLUSIE! Szampan już się chłodzi.'
  if (stats.profit === 0) return '😅 Zero na zero — bez sensu, ale przeżyliśmy.'
  if (stats.overallMultiplier >= 0.5) return '😬 Lekko do tyłu, bywało gorzej.'
  return '💀 Kasyno zjadło wszystko. RIP kasa, odbijemy w następnym huncie.'
}

function formatFinishedDate(date) {
  const dateStr = date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })
  const timeStr = date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
  return `${dateStr}, ${timeStr}`
}

function buildSummaryEmbed(hunt, stats) {
  const currency = hunt.currency || '€'
  const profitPositive = stats.profit >= 0
  const finishedAt = new Date()
  const { best, worst } = extremeEntries(hunt)

  const color =
    stats.overallMultiplier >= 3 ? COLOR_MEGA : profitPositive ? COLOR_WIN : COLOR_LOSS

  const fields = [
    { name: '💰 Kasa na start', value: formatMoney(stats.startBalance, currency), inline: true },
    { name: '🏆 Wygrana', value: formatMoney(stats.totalWin, currency), inline: true },
    {
      name: profitPositive ? '📈 Zysk' : '📉 Strata',
      value: `${profitPositive ? '+' : ''}${formatMoney(stats.profit, currency)}`,
      inline: true,
    },
    { name: '✖️ Ogólny multi', value: formatMult(stats.overallMultiplier), inline: true },
    { name: '🎲 Sloty', value: `${stats.openedCount} / ${stats.count} otwartych`, inline: true },
    { name: '🗓️ Zakończono', value: formatFinishedDate(finishedAt), inline: true },
  ]

  if (best) {
    fields.push({
      name: '🔥 Najlepszy slot',
      value: `**${best.name}**\n${formatMoney(best.bet, currency)} → ${formatMoney(best.win, currency)} (${formatMult(entryMultiplier(best))})`,
      inline: true,
    })
  }
  if (worst) {
    fields.push({
      name: '💀 Najgorszy slot',
      value: `**${worst.name}**\n${formatMoney(worst.bet, currency)} → ${formatMoney(worst.win, currency)} (${formatMult(entryMultiplier(worst))})`,
      inline: true,
    })
  }

  const entries = hunt.entries || []
  if (entries.length > 0) {
    const lines = entries.map((e) =>
      slotLine(e, currency, e === best ? '🔥' : e === worst ? '💀' : undefined)
    )
    const chunks = chunkLines(lines)
    chunks.forEach((chunk, i) => {
      fields.push({
        name: chunks.length > 1 ? `🎰 Wszystkie sloty (${i + 1}/${chunks.length})` : '🎰 Wszystkie sloty',
        value: '```\n' + chunk + '\n```',
        inline: false,
      })
    })
  }

  const participants = hunt.participants || []
  if (participants.length > 0) {
    const split = splitPayouts(participants, stats.totalWin)
    const sorted = [...split.rows].sort((a, b) => b.net - a.net)
    const lines = sorted.map(
      (r) => `${padName(r.name)} ${formatMoney(r.net, currency).padStart(10)} ${r.net >= 0 ? '🤑' : '😭'}`
    )
    const chunks = chunkLines(lines)
    chunks.forEach((chunk, i) => {
      fields.push({
        name: chunks.length > 1 ? `👥 Podział dla ekipy (${i + 1}/${chunks.length})` : '👥 Podział dla ekipy',
        value: '```\n' + chunk + '\n```',
        inline: false,
      })
    })
  }

  return {
    title: `🎰 ${hunt.name} — HUNT ZAKOŃCZONY! 🏁`,
    description: tagline(stats),
    color,
    fields,
    footer: { text: 'Bonus Hunt Tracker 🎰' },
    timestamp: finishedAt.toISOString(),
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
