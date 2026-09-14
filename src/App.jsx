import { useEffect, useMemo, useState } from 'react'
import { loadHunts, saveHunts, createHunt, createEntry, createParticipant } from './storage.js'
import { huntStats, splitPayouts } from './calc.js'
import HuntHeader from './components/HuntHeader.jsx'
import NewHuntForm from './components/NewHuntForm.jsx'
import SummaryBar from './components/SummaryBar.jsx'
import AddEntryForm from './components/AddEntryForm.jsx'
import EntryTable from './components/EntryTable.jsx'
import ParticipantsPanel from './components/ParticipantsPanel.jsx'

export default function App() {
  const [hunts, setHunts] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [sortByMultiplier, setSortByMultiplier] = useState(false)
  const [loaded, setLoaded] = useState(false)

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

  function handleExport() {
    if (!activeHunt) return
    const rows = [['#', 'Slot', 'Bet', 'Wygrana', 'Multi']]
    activeHunt.entries.forEach((e, i) => {
      const mult = e.opened && e.bet ? (e.win / e.bet).toFixed(2) : ''
      rows.push([i + 1, e.name, e.bet, e.opened ? e.win : '', mult])
    })
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeHunt.name.replace(/\s+/g, '_')}.csv`
    a.click()
    URL.revokeObjectURL(url)
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
          sortByMultiplier={sortByMultiplier}
          onToggleSort={() => setSortByMultiplier((s) => !s)}
          onExport={handleExport}
        />

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
              sortByMultiplier={sortByMultiplier}
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
      </div>
    </div>
  )
}
