const STORAGE_KEY = 'bonushunt.hunts.v1'

export function loadHunts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    console.error('Failed to load hunts', e)
    return []
  }
}

export function saveHunts(hunts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(hunts))
  } catch (e) {
    console.error('Failed to save hunts', e)
  }
}

export function newId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

export function createHunt({ name, currency, startBalance }) {
  return {
    id: newId(),
    name: name || 'Untitled hunt',
    currency: currency || '$',
    startBalance: Number(startBalance) || 0,
    createdAt: Date.now(),
    entries: [],
  }
}

export function createEntry({ name, provider, bet, cost }) {
  return {
    id: newId(),
    name: name || 'Unnamed slot',
    provider: provider || '',
    bet: Number(bet) || 0,
    cost: Number(cost) || 0,
    win: null,
    opened: false,
  }
}
