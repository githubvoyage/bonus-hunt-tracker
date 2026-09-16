import { useEffect, useState } from 'react'

/**
 * Pole, które wygląda jak wyświetlana wartość, dopóki się w nie nie kliknie.
 * Trzyma własny tekst, żeby dało się wpisać „12.” w drodze do „12.50”,
 * i oddaje wartość dopiero przy wyjściu z pola albo Enterze.
 * Przerywana ramka jest sygnałem, że to się klika i zmienia.
 */
export default function EditableValue({ value, onCommit, guard, className, ...rest }) {
  const [draft, setDraft] = useState(String(value ?? ''))

  useEffect(() => {
    setDraft(String(value ?? ''))
  }, [value])

  function handleBlur() {
    const original = String(value ?? '')
    if (draft === original) return // nic się nie zmieniło, nie ma o co pytać

    // guard() pyta „na pewno?", gdy edycja wymaga potwierdzenia (np. hunt już
    // zakończony). Robimy to na blur, a nie na focus — confirm() na focusie
    // wywołuje w przeglądarkach pętlę: dialog zabiera focus, po zamknięciu
    // przeglądarka oddaje focus z powrotem na to samo pole, co odpala focus
    // (i confirm()) jeszcze raz w nieskończoność.
    if (guard && !guard()) {
      setDraft(original) // cofnij wpisaną zmianę
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
