import { useEffect, useMemo, useState } from 'react'
import { loadHunts, saveHunts, createHunt, createEntry, createParticipant } from './storage.js'
import { huntStats, splitPayouts, overallStats } from './calc.js'
import { sendHuntSummary } from './discord.js'
import HuntHeader from './components/HuntHeader.jsx'
import NewHuntForm from './components/NewHuntForm.jsx'
import OverallStatsBar from './components/OverallStatsBar.jsx'
import SummaryBar from './components/SummaryBar.jsx'
import AddEntryForm from './components/AddEntryForm.jsx'
import EntryTable from './components/EntryTable.jsx'
import ParticipantsPanel from './components/ParticipantsPanel.jsx'
import WheelPanel from './components/WheelPanel.jsx'

export default function App() {
  const [hunts, setHunts] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [sendingSummary, setSendingSummary] = useState(false)
  const [view, setView] = useState('hunt')

  useEffect(() => {
    const stored = loadHunts()
    setHunts(stored)
    if (stored.length > 0) setActiveId(stored[0].id)
    else setShowNewForm(true)
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (loaded) saveHunts(hunts)
  }, [hunts, loaded])

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

  function handleCreateHunt({ name, currency, startBalance }) {
    const hunt = createHunt({ name, currency, startBalance })
    setHunts((prev) => [hunt, ...prev])
    setActiveId(hunt.id)
    setShowNewForm(false)
  }

  function handleDeleteHunt(id) {
    if (!confirm('Usunąć tego hunta? Nie ma odwrotu.')) return
    setHunts((prev) => {
      const next = prev.filter((h) => h.id !== id)
      if (next.length > 0) setActiveId(next[0].id)
      else {
        setActiveId(null)
        setShowNewForm(true)
      }
      return next
    })
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
          onNew={() => setShowNewForm(true)}
          onDelete={handleDeleteHunt}
          onFinish={handleFinishHunt}
          sendingSummary={sendingSummary}
          view={view}
          onChangeView={setView}
        />

        {view === 'wheel' && <WheelPanel currency={activeHunt?.currency || '€'} />}

        {view === 'hunt' && (
          <>
            <OverallStatsBar groups={overall} />

            {showNewForm && (
              <NewHuntForm onCreate={handleCreateHunt} onCancel={() => setShowNewForm(false)} />
            )}

            {activeHunt && stats && (
              <>
                <SummaryBar hunt={activeHunt} stats={stats} />
                <ParticipantsPanel
                  hunt={activeHunt}
                  split={split}
                  onAdd={handleAddParticipant}
                  onUpdate={handleUpdateParticipant}
                  onRemove={handleRemoveParticipant}
                  onSetStartBalance={handleSetStartBalance}
                />
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

            {!activeHunt && !showNewForm && (
              <div className="rounded-2xl border border-dashed border-line bg-bg-panel/40 px-5 py-14 text-center">
                <div className="mb-3 text-4xl">🎰</div>
                <p className="font-display text-sm uppercase tracking-wider text-muted">
                  Nie ma żadnego hunta
                </p>
                <p className="mt-2 text-sm text-muted/70">Odpal nowy i lecimy.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
