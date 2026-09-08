export default function HuntHeader({
  hunts,
  activeId,
  onSelect,
  onNew,
  onDelete,
  sortByMultiplier,
  onToggleSort,
  onExport,
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-felt-line pb-4">
      <div className="flex items-center gap-3">
        <h1 className="font-display text-2xl text-gold-bright">Bonus Hunt Tracker</h1>
        {hunts.length > 0 && (
          <select
            value={activeId || ''}
            onChange={(e) => onSelect(e.target.value)}
            className="rounded-sm border border-felt-line bg-felt-light px-2 py-1 text-sm text-cream"
          >
            {hunts.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="flex items-center gap-2 text-sm">
        <button
          onClick={onToggleSort}
          className="rounded-sm border border-felt-line px-3 py-1.5 text-cream hover:border-gold"
        >
          {sortByMultiplier ? 'Sorted: best multi' : 'Sort: entry order'}
        </button>
        <button
          onClick={onExport}
          className="rounded-sm border border-felt-line px-3 py-1.5 text-cream hover:border-gold"
        >
          Export CSV
        </button>
        <button
          onClick={onNew}
          className="rounded-sm bg-gold px-3 py-1.5 font-medium text-felt hover:bg-gold-bright"
        >
          New hunt
        </button>
        {activeId && (
          <button
            onClick={() => onDelete(activeId)}
            className="rounded-sm px-3 py-1.5 text-muted hover:text-danger"
          >
            Delete hunt
          </button>
        )}
      </div>
    </div>
  )
}
