import { useEffect, useState } from 'react'

/**
 * Pole, które wygląda jak wyświetlana wartość, dopóki się w nie nie kliknie.
 * Trzyma własny tekst, żeby dało się wpisać „12.” w drodze do „12.50”,
 * i oddaje wartość dopiero przy wyjściu z pola albo Enterze.
 * Przerywana ramka jest sygnałem, że to się klika i zmienia.
 */
export default function EditableValue({ value, onCommit, className, ...rest }) {
  const [draft, setDraft] = useState(String(value ?? ''))

  useEffect(() => {
    setDraft(String(value ?? ''))
  }, [value])

  return (
    <input
      {...rest}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => onCommit(draft)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur()
      }}
      className={`rounded-lg border border-dashed border-line-bright/70 bg-bg-deep/40 px-2 py-0.5 outline-none transition-colors hover:border-gold/70 focus:border-solid focus:border-gold focus:bg-bg-deep ${className}`}
    />
  )
}
