import { newId } from './storage.js'

const WHEEL_STORAGE_KEY = 'bonushunt.wheel.v1'

export function loadWheelState() {
  try {
    const raw = localStorage.getItem(WHEEL_STORAGE_KEY)
    if (!raw) return { options: [], background: null }
    const parsed = JSON.parse(raw)
    return {
      options: Array.isArray(parsed.options) ? parsed.options : [],
      background: parsed.background || null,
    }
  } catch (e) {
    console.error('Nie udało się wczytać koła zrzutki', e)
    return { options: [], background: null }
  }
}

export function saveWheelState(state) {
  try {
    localStorage.setItem(WHEEL_STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.error('Nie udało się zapisać koła zrzutki', e)
  }
}

export function createWheelOption({ amount, weight }) {
  return {
    id: newId(),
    amount: Number(amount) || 0,
    weight: Number(weight) > 0 ? Number(weight) : 1,
  }
}

export function withPercentages(options) {
  const totalWeight = options.reduce((s, o) => s + (Number(o.weight) || 0), 0)
  return options.map((o) => ({
    ...o,
    percent: totalWeight > 0 ? ((Number(o.weight) || 0) / totalWeight) * 100 : 0,
  }))
}

// zwraca indeks wylosowanej opcji, ważony wagami; -1 gdy brak z czego losować
export function pickWeightedIndex(options) {
  const totalWeight = options.reduce((s, o) => s + (Number(o.weight) || 0), 0)
  if (totalWeight <= 0) return -1
  let r = Math.random() * totalWeight
  for (let i = 0; i < options.length; i++) {
    r -= Number(options[i].weight) || 0
    if (r <= 0) return i
  }
  return options.length - 1
}
