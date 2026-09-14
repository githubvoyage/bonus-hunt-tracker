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
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl blink">🎰</span>
          <h1 className="font-display text-xl leading-none text-gold neon-gold md:text-3xl">
            BONUS HUNT
            <span className="ml-2 text-pink neon-pink">TRACKER</span>
          </h1>
        </div>

        {hunts.length > 0 && (
          <select
            value={activeId || ''}
            onChange={(e) => onSelect(e.target.value)}
            className="rounded-lg border border-line bg-bg-panel px-3 py-2 text-sm font-medium text-cream shadow-panel transition-colors hover:border-gold focus:border-gold"
          >
            {hunts.map((h) => (
              <option key={h.id} value={h.id} className="bg-bg-panel">
                {h.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <button
          onClick={onToggleSort}
          className={`rounded-lg border px-3 py-2 font-semibold transition-all ${
            sortByMultiplier
              ? 'border-cyan text-cyan shadow-neon-cyan'
              : 'border-line text-muted hover:border-cyan hover:text-cyan'
          }`}
        >
          {sortByMultiplier ? '🔥 Najlepszy multi' : '↕ Kolejność dodania'}
        </button>

        <button
          onClick={onExport}
          className="rounded-lg border border-line px-3 py-2 font-semibold text-muted transition-all hover:border-violet hover:text-violet"
        >
          ⬇ Export CSV
        </button>

        <button
          onClick={onNew}
          className="rounded-lg bg-gold px-4 py-2 font-display text-xs uppercase tracking-wider text-bg shadow-neon-gold transition-transform hover:scale-105 hover:bg-gold-bright"
        >
          + Nowy hunt
        </button>

        {activeId && (
          <button
            onClick={() => onDelete(activeId)}
            className="rounded-lg border border-transparent px-3 py-2 font-semibold text-muted transition-all hover:border-loss hover:text-loss"
          >
            🗑 Usuń hunta
          </button>
        )}
      </div>
    </div>
  )
}
