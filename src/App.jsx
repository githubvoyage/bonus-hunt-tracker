import { useEffect, useMemo, useState } from 'react'
import { loadHunts, saveHunts, createHunt, createEntry } from './storage.js'
import { huntStats } from './calc.js'
import HuntHeader from './components/HuntHeader.jsx'
import NewHuntForm from './components/NewHuntForm.jsx'
import SummaryBar from './components/SummaryBar.jsx'
import AddEntryForm from './components/AddEntryForm.jsx'
import EntryTable from './components/EntryTable.jsx'

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

  function updateActiveHunt(mutate) {
    setHunts((prev) =>
      prev.map((h) => (h.id === activeId ? mutate(h) : h))
    )
  }

  function handleCreateHunt({ name, currency, startBalance }) {
    const hunt = createHunt({ name, currency, startBalance })
    setHunts((prev) => [hunt, ...prev])
    setActiveId(hunt.id)
    setShowNewForm(false)
  }

  function handleDeleteHunt(id) {
    if (!confirm('Delete this hunt? This cannot be undone.')) return
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

  function handleAddEntry({ name, provider, bet, cost }) {
    const entry = createEntry({ name, provider, bet, cost })
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

  function handleExport() {
    if (!activeHunt) return
    const rows = [['#', 'Slot', 'Provider', 'Bet', 'Cost', 'Win', 'Multiplier']]
    activeHunt.entries.forEach((e, i) => {
      const mult = e.opened && e.bet ? (e.win / e.bet).toFixed(2) : ''
      rows.push([i + 1, e.name, e.provider, e.bet, e.cost, e.opened ? e.win : '', mult])
    })
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeHunt.name.replace(/\s+/g, '_')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!loaded) return null

  return (
    <div className="min-h-screen bg-felt px-4 py-6 md:px-10 md:py-8">
      <div className="mx-auto max-w-4xl space-y-5">
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
          <NewHuntForm
            onCreate={handleCreateHunt}
            onCancel={() => setShowNewForm(false)}
          />
        )}

        {activeHunt && stats && (
          <>
            <SummaryBar hunt={activeHunt} stats={stats} />
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
          <div className="border border-felt-line px-5 py-10 text-center text-muted">
            No hunt selected. Start a new one to begin tracking.
          </div>
        )}
      </div>
    </div>
  )
}
