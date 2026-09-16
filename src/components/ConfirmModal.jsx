/**
 * Zastępuje window.confirm(). Natywne okienko potrafi się zapętlić przy focusie
 * (przeglądarka oddaje focus z powrotem po zamknięciu dialogu) albo w ogóle nie
 * działać w niektórych przeglądarkach w aplikacjach (Messenger, Instagram itp.)
 * — więc pytamy własnym, zwykłym komponentem, który działa wszędzie tak samo.
 */
export default function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={onCancel}
    >
      <div
        className="gradient-frame w-full max-w-sm rounded-2xl px-5 py-5 shadow-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center gap-2">
          <span className="text-xl">⚠️</span>
          <h2 className="font-display text-sm uppercase tracking-wider text-gold neon-gold">
            Na pewno?
          </h2>
        </div>
        <p className="mb-5 text-sm text-cream">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg border border-transparent px-4 py-2 font-semibold text-muted transition-all hover:border-loss hover:text-loss"
          >
            Anuluj
          </button>
          <button
            autoFocus
            onClick={onConfirm}
            className="rounded-lg bg-gold px-4 py-2 font-display text-xs uppercase tracking-wider text-bg shadow-neon-gold transition-transform hover:scale-105 hover:bg-gold-bright"
          >
            Tak, zmieniam
          </button>
        </div>
      </div>
    </div>
  )
}
