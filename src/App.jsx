import { useEffect, useMemo, useRef, useState } from 'react'
import { loadHunts, saveHunts, createHunt, createEntry, createParticipant } from './storage.js'
import {
  cloudEnabled,
  pullHunts,
  pushHunt,
  pushDelete,
  pendingPush,
  subscribeToHunts,
} from './cloud.js'
import { huntStats, splitPayouts, overallStats } from './calc.js'
import { sendHuntSummary } from './discord.js'
import HuntHeader from './components/HuntHeader.jsx'
import NewHuntButton from './components/NewHuntButton.jsx'
import SummaryBar from './components/SummaryBar.jsx'
import AddEntryForm from './components/AddEntryForm.jsx'
import EntryTable from './components/EntryTable.jsx'
import ParticipantsPanel from './components/ParticipantsPanel.jsx'
import WheelPanel from './components/WheelPanel.jsx'

export default function App() {
  const [hunts, setHunts] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [sendingSummary, setSendingSummary] = useState(false)
  const [view, setView] = useState('hunt')
  const [cloudReady, setCloudReady] = useState(false)
  const [syncState, setSyncState] = useState('idle')

  // Efekty synchronizacji czytają stan przez ref, żeby nie restartować się
  // przy każdej zmianie huntów.
  const huntsRef = useRef(hunts)
  huntsRef.current = hunts

  useEffect(() => {
    const stored = loadHunts()
    setHunts(stored)
    if (stored.length > 0) setActiveId(stored[0].id)
    setLoaded(true)

    if (!cloudEnabled) return
    let alive = true
    setSyncState('syncing')
    pullHunts(stored)
      .then((merged) => {
        if (!alive) return
        setHunts(merged)
        if (merged.length > 0) {
          setActiveId((cur) => (cur && merged.some((h) => h.id === cur) ? cur : merged[0].id))
        }
        setCloudReady(true)
        setSyncState('idle')
      })
      .catch((e) => {
        console.error('Nie udało się pobrać huntów z chmury', e)
        if (alive) setSyncState('error')
      })

    const unsubscribe = subscribeToHunts(
      () => huntsRef.current,
      (merged) => setHunts(merged)
    )
    return () => {
      alive = false
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (loaded) saveHunts(hunts)
  }, [hunts, loaded])

  // Wypychanie zmian do chmury. Zwykły ticker, a nie debounce na zmianie stanu:
  // eventy z realtime przeplatają się z lokalnymi zmianami i potrafiły ubić
  // zaplanowany timer, przez co zmiana zostawała w przeglądarce. Przy okazji
  // nieudany push sam się ponawia przy następnym tyknięciu.
  useEffect(() => {
    if (!cloudReady) return
    let stopped = false
    let busy = false

    async function tick() {
      if (busy || stopped) return
      const dirty = pendingPush(huntsRef.current)
      if (dirty.length === 0) return
      busy = true
      setSyncState('syncing')
      try {
        for (const hunt of dirty) await pushHunt(hunt)
        if (!stopped) setSyncState('idle')
      } catch (e) {
        console.error('Nie udało się zapisać hunta w chmurze', e)
        if (!stopped) setSyncState('error')
      } finally {
        busy = false
      }
    }

    const timer = setInterval(tick, 1200)
    return () => {
      stopped = true
      clearInterval(timer)
    }
  }, [cloudReady])

  // Hunt mógł zniknąć przez kasowanie na innym urządzeniu.
  useEffect(() => {
    if (!loaded || !activeId) return
    if (!hunts.some((h) => h.id === activeId)) setActiveId(hunts.length > 0 ? hunts[0].id : null)
  }, [hunts, activeId, loaded])

  const overall = useMemo(() => overallStats(hunts), [hunts])
  const activeHunt = useMemo(() => hunts.find((h) => h.id === activeId) || null, [hunts, activeId])
  const stats = useMemo(() => (activeHunt ? huntStats(activeHunt) : null), [activeHunt])
  const split = useMemo(
    () => (activeHunt && stats ? splitPayouts(activeHunt.participants, stats.totalWin) : null),
    [activeHunt, stats]
  )

  function updateActiveHunt(mutate) {
    setHunts((prev) => prev.map((h) => (h.id === activeId ? mutate(h) : h)))
  }

  // Pytamy tylko o nazwę. Waluta i kasa na start są edytowalne w panelu hunta.
  function handleCreateHunt(name) {
    const hunt = createHunt({ name: name.trim() })
    setHunts((prev) => [hunt, ...prev])
    setActiveId(hunt.id)
    setView('hunt')
  }

  function handleDeleteHunt(id) {
    if (!confirm('Usunąć tego hunta? Zniknie całej ekipie.')) return
    const doomed = hunts.find((h) => h.id === id) || { id }
    setHunts((prev) => {
      const next = prev.filter((h) => h.id !== id)
      setActiveId(next.length > 0 ? next[0].id : null)
      return next
    })
    if (cloudReady) {
      pushDelete(doomed).catch((e) => {
        console.error('Nie udało się skasować hunta w chmurze', e)
        setSyncState('error')
      })
    }
  }

  function handleAddEntry({ name, bet }) {
    const entry = createEntry({ name, bet })
    updateActiveHunt((h) => ({ ...h, entries: [...h.entries, entry] }))
  }

  function handleDeleteEntry(id) {
    updateActiveHunt((h) => ({ ...h, entries: h.entries.filter((e) => e.id !== id) }))
  }

  function handleRecordWin(id, winValue) {
    updateActiveHunt((h) => ({
      ...h,
      entries: h.entries.map((e) =>
        e.id === id ? { ...e, win: Number(winValue) || 0, opened: true } : e
      ),
    }))
  }

  function handleReopen(id) {
    updateActiveHunt((h) => ({
      ...h,
      entries: h.entries.map((e) => (e.id === id ? { ...e, opened: false, win: null } : e)),
    }))
  }

  function handleAddParticipant({ name, amount, paidBy }) {
    const participant = createParticipant({ name, amount, paidBy })
    updateActiveHunt((h) => ({ ...h, participants: [...(h.participants || []), participant] }))
  }

  function handleUpdateParticipant(id, patch) {
    updateActiveHunt((h) => ({
      ...h,
      participants: (h.participants || []).map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }))
  }

  function handleRemoveParticipant(id) {
    updateActiveHunt((h) => ({
      ...h,
      participants: (h.participants || [])
        .filter((p) => p.id !== id)
        .map((p) => (p.paidBy === id ? { ...p, paidBy: null } : p)),
    }))
  }

  function handleSetName(value) {
    updateActiveHunt((h) => ({ ...h, name: value.trim() || 'Hunt bez nazwy' }))
  }

  function handleSetCurrency(value) {
    updateActiveHunt((h) => ({ ...h, currency: value.trim() || '€' }))
  }

  function handleSetStartBalance(value) {
    updateActiveHunt((h) => ({ ...h, startBalance: Number(value) || 0 }))
  }

  async function handleFinishHunt() {
    if (!activeHunt || !stats) return
    const already = Boolean(activeHunt.finished)
    if (
      !confirm(
        already
          ? 'Wysłać podsumowanie tego hunta na Discorda jeszcze raz?'
          : 'Zakończyć hunta i wysłać podsumowanie na Discorda?'
      )
    )
      return

    const huntId = activeHunt.id
    setSendingSummary(true)
    try {
      await sendHuntSummary(activeHunt, stats)
      setHunts((prev) =>
        prev.map((h) => (h.id === huntId ? { ...h, finished: true, finishedAt: Date.now() } : h))
      )
    } catch (e) {
      console.error(e)
      alert('Nie udało się wysłać podsumowania na Discorda. Sprawdź połączenie i spróbuj ponownie.')
    } finally {
      setSendingSummary(false)
    }
  }

  if (!loaded) return null

  return (
    <div className="min-h-screen px-4 py-6 md:px-10 md:py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <HuntHeader
          hunts={hunts}
          activeId={activeId}
          onSelect={setActiveId}
          onNew={handleCreateHunt}
          onDelete={handleDeleteHunt}
          onFinish={handleFinishHunt}
          sendingSummary={sendingSummary}
          view={view}
          onChangeView={setView}
          overall={overall}
        />

        {view === 'wheel' && <WheelPanel currency={activeHunt?.currency || '€'} />}

        {view === 'hunt' && (
          <>
            {activeHunt && stats && (
              <>
                <SummaryBar
                  hunt={activeHunt}
                  stats={stats}
                  onSetName={handleSetName}
                  onSetCurrency={handleSetCurrency}
                  onSetStartBalance={handleSetStartBalance}
                >
                  <ParticipantsPanel
                    hunt={activeHunt}
                    split={split}
                    onAdd={handleAddParticipant}
                    onUpdate={handleUpdateParticipant}
                    onRemove={handleRemoveParticipant}
                    onSetStartBalance={handleSetStartBalance}
                  />
                </SummaryBar>
                <AddEntryForm onAdd={handleAddEntry} />
                <EntryTable
                  entries={activeHunt.entries}
                  currency={activeHunt.currency}
                  onRecordWin={handleRecordWin}
                  onDelete={handleDeleteEntry}
                  onReopen={handleReopen}
                />
              </>
            )}

            {!activeHunt && (
              <div className="rounded-2xl border border-dashed border-line bg-bg-panel/40 px-5 py-14 text-center">
                <div className="mb-3 text-4xl">🎰</div>
                <p className="font-display text-sm uppercase tracking-wider text-muted">
                  Nie ma żadnego hunta
                </p>
                <p className="mt-2 text-sm text-muted/70">Klikaj i lecimy.</p>
                <div className="mt-5">
                  <NewHuntButton onCreate={handleCreateHunt} variant="big" />
                </div>
              </div>
            )}
          </>
        )}

        <footer className="border-t border-line/60 pt-4 text-center font-mono text-[11px] leading-relaxed text-muted/60">
          {!cloudEnabled && 'Chmura wyłączona — hunty siedzą tylko w tej przeglądarce.'}
          {cloudEnabled && syncState === 'syncing' && 'Zgrywam z ekipą…'}
          {cloudEnabled &&
            syncState === 'idle' &&
            'Zgrane z ekipą — każdy na tym samym adresie widzi te same hunty.'}
          {cloudEnabled && syncState === 'error' && (
            <span className="text-loss/80">
              Chmura nie odpowiada. Wpisuj dalej, wszystko siedzi w tej przeglądarce i dopchnie się
              samo, jak połączenie wróci.
            </span>
          )}
        </footer>
      </div>
    </div>
  )
}
