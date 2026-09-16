import { useEffect, useState } from 'react'

/**
 * Pole, które wygląda jak wyświetlana wartość, dopóki się w nie nie kliknie.
 * Trzyma własny tekst, żeby dało się wpisać „12.” w drodze do „12.50”,
 * i oddaje wartość dopiero przy wyjściu z pola albo Enterze.
 * Przerywana ramka jest sygnałem, że to się klika i zmienia.
 *
 * `guard`, jeśli podany, to `(onYes, onNo) => void` — wywoływany na blur, tylko
 * gdy wartość faktycznie się zmieniła. Dostaje dwa callbacki zamiast zwracać
 * bool, bo potwierdzenie leci przez własny modal (a nie window.confirm(),
 * które potrafi się zapętlić na focusie i nie działa we wszystkich
 * przeglądarkach w aplikacjach) — modal odpowiada asynchronicznie.
 */
export default function EditableValue({ value, onCommit, guard, className, ...rest }) {
  const [draft, setDraft] = useState(String(value ?? ''))

  useEffect(() => {
    setDraft(String(value ?? ''))
  }, [value])

  function handleBlur() {
    const original = String(value ?? '')
    if (draft === original) return // nic się nie zmieniło, nie ma o co pytać

    if (guard) {
      guard(
        () => onCommit(draft),
        () => setDraft(original) // cofnij wpisaną zmianę
      )
      return
    }
    onCommit(draft)
  }

  return (
    <input
      {...rest}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur()
      }}
      className={`rounded-lg border border-dashed border-line-bright/70 bg-bg-deep/40 px-2 py-0.5 outline-none transition-colors hover:border-gold/70 focus:border-solid focus:border-gold focus:bg-bg-deep ${className}`}
    />
  )
}
