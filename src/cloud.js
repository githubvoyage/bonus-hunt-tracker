import { createClient } from '@supabase/supabase-js'

// Warstwa synchronizacji z Supabase. Bez skonfigurowanych zmiennych środowiskowych
// wszystko poniżej jest no-opem, a apka działa jak wcześniej: sam localStorage.
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const cloudEnabled = Boolean(url && anonKey)

const supabase = cloudEnabled
  ? createClient(url, anonKey, { auth: { persistSession: false } })
  : null

// Mapa id hunta → updated_at z chmury (ms). Trzymana osobno, żeby nie zmieniać
// kształtu samego hunta, bo starsze zapisy w przeglądarkach ekipy go nie mają.
const SYNC_KEY = 'bonushunt.sync.v1'

function loadStamps() {
  try {
    const raw = localStorage.getItem(SYNC_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch (e) {
    return {}
  }
}

function saveStamps(stamps) {
  try {
    localStorage.setItem(SYNC_KEY, JSON.stringify(stamps))
  } catch (e) {
    console.error('Nie udało się zapisać znaczników synchronizacji', e)
  }
}

let stamps = loadStamps()

function stampOf(id) {
  return Number(stamps[id]) || 0
}

function setStamp(id, value) {
  stamps = { ...stamps, [id]: value }
  saveStamps(stamps)
}

function rowTime(row) {
  const t = Date.parse(row.updated_at)
  return Number.isNaN(t) ? 0 : t
}

// Ostatnia wersja hunta, o której wiemy, że jest identyczna z tą na serwerze.
// Trzyma nas przed odbijaniem w kółko danych, które dopiero co przyszły z chmury.
const synced = new Map()

function isDirty(hunt) {
  return synced.get(hunt.id) !== JSON.stringify(hunt)
}

/** Hunty, które zmieniły się od ostatniej udanej synchronizacji. */
export function pendingPush(hunts) {
  return hunts.filter(isDirty)
}

/**
 * Łączy hunty lokalne z tymi z chmury. Konflikt rozstrzyga nowszy updated_at:
 * lokalny hunt liczy się jako nowszy tylko wtedy, gdy zmienił się po ostatnim
 * pushu, czyli gdy jego JSON różni się od tego, co poszło na serwer.
 */
function mergeHunts(local, rows) {
  const byId = new Map(local.map((h) => [h.id, h]))
  const order = local.map((h) => h.id)

  for (const row of rows) {
    const remoteTime = rowTime(row)
    const mine = byId.get(row.id)

    if (row.deleted) {
      // Tombstone wygrywa, chyba że lokalnie hunt zmienił się po skasowaniu.
      if (mine && remoteTime >= stampOf(row.id)) {
        byId.delete(row.id)
        setStamp(row.id, remoteTime)
      }
      continue
    }

    if (!mine) {
      byId.set(row.id, row.data)
      order.push(row.id)
      setStamp(row.id, remoteTime)
      synced.set(row.id, JSON.stringify(row.data))
      continue
    }

    // Lokalna wersja broni się tylko wtedy, gdy ktoś ją tu zmienił po ostatnim syncu.
    if (remoteTime > stampOf(row.id) || !isDirty(mine)) {
      byId.set(row.id, row.data)
      setStamp(row.id, remoteTime)
      synced.set(row.id, JSON.stringify(row.data))
    }
  }

  return order.filter((id, i) => order.indexOf(id) === i && byId.has(id)).map((id) => byId.get(id))
}

/** Pobiera wszystkie hunty z chmury i scala je z lokalnymi. */
export async function pullHunts(local) {
  if (!supabase) return local
  const { data, error } = await supabase.from('hunts').select('id, data, deleted, updated_at')
  if (error) throw error
  return mergeHunts(local, data || [])
}

/** Wypycha jednego hunta. Zwraca czas zapisu z serwera. */
export async function pushHunt(hunt) {
  if (!supabase) return
  const { data, error } = await supabase
    .from('hunts')
    .upsert({ id: hunt.id, data: hunt, deleted: false })
    .select('updated_at')
    .single()
  if (error) throw error
  setStamp(hunt.id, rowTime(data))
  synced.set(hunt.id, JSON.stringify(hunt))
}

/**
 * Kasowanie to tombstone, żeby inne urządzenia też usunęły hunta u siebie.
 * Zawartość zostaje w wierszu: kasowanie leci od razu na całą ekipę, więc po
 * przypadkowym kliknięciu da się hunta wygrzebać z bazy.
 */
export async function pushDelete(hunt) {
  const id = hunt.id
  if (!supabase) return
  const { data, error } = await supabase
    .from('hunts')
    .upsert({ id, data: hunt, deleted: true })
    .select('updated_at')
    .single()
  if (error) throw error
  setStamp(id, rowTime(data))
  synced.delete(id)
}

/**
 * Nasłuch zmian z innych urządzeń.
 *
 * `getLocal` zwraca aktualny stan, `onMerged` dostaje gotowy wynik scalania.
 * Scalanie musi się dziać tutaj, a nie w funkcji aktualizującej stan Reacta:
 * ma skutki uboczne (znaczniki czasu), a React w StrictMode woła updater dwa
 * razy i drugie przejście cofało właśnie przyjętą zmianę.
 */
export function subscribeToHunts(getLocal, onMerged) {
  if (!supabase) return () => {}
  // Nazwa kanału musi być unikalna. Przy stałej nazwie drugie wejście w efekt
  // (React StrictMode montuje go dwa razy) tworzy kanał o tym samym temacie,
  // który ginie razem z pierwszym, i nasłuch po cichu przestaje działać.
  const channel = supabase
    .channel(`hunts-sync-${Math.random().toString(36).slice(2)}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'hunts' }, (payload) => {
      const row = payload.new
      if (!row || !row.id) return
      const local = getLocal()
      const merged = mergeHunts(local, [row])
      if (JSON.stringify(merged) !== JSON.stringify(local)) onMerged(merged)
    })
    .subscribe((status, err) => {
      if (err) console.error('Kanał realtime padł', status, err)
    })

  return () => {
    supabase.removeChannel(channel)
  }
}
