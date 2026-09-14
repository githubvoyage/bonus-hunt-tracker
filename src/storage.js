const STORAGE_KEY = 'bonushunt.hunts.v1'

export function loadHunts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    console.error('Nie udało się wczytać huntów', e)
    return []
  }
}

export function saveHunts(hunts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(hunts))
  } catch (e) {
    console.error('Nie udało się zapisać huntów', e)
  }
}

export function newId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

export function createHunt({ name, currency, startBalance }) {
  return {
    id: newId(),
    name: name || 'Jebanka po wypłacie',
    currency: currency || '€',
    startBalance: Number(startBalance) || 0,
    createdAt: Date.now(),
    entries: [],
    participants: [],
  }
}

export function createParticipant({ name, amount, paidBy }) {
  return {
    id: newId(),
    name: name || 'Ktoś',
    amount: Number(amount) || 0,
    paidBy: paidBy || null,
  }
}

export function createEntry({ name, bet }) {
  return {
    id: newId(),
    name: name || 'Slot bez nazwy',
    bet: Number(bet) || 0,
    win: null,
    opened: false,
  }
}
