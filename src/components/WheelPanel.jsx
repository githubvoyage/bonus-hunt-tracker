import { useEffect, useMemo, useRef, useState } from 'react'
import { formatMoney } from '../calc.js'
import { loadWheelState, saveWheelState, createWheelOption, pickWeightedIndex } from '../wheel.js'
import { burstConfetti } from '../confetti.js'

const PALETTE = ['#FFC531', '#FF2E88', '#22E4FF', '#A855F7', '#00FFA3', '#FF4365', '#FFE066', '#5B33A0']
const SPIN_MS = 5200
const MAX_BG_DIM = 900

const labelCls = 'text-[11px] font-bold uppercase tracking-wider text-muted'
const inputCls =
  'rounded-lg border border-line bg-bg-deep px-3 py-2 text-cream transition-colors placeholder:text-muted/50 focus:border-violet'

function resizeImageFile(file, maxDim = MAX_BG_DIM) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)
    reader.onload = () => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
        const w = Math.round(img.width * scale)
        const h = Math.round(img.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        canvas.getContext('2d').drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}

export default function WheelPanel({ currency = '€' }) {
  const [options, setOptions] = useState([])
  const [background, setBackground] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [amount, setAmount] = useState('')
  const [weight, setWeight] = useState('1')
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [winner, setWinner] = useState(null)
  const spinTimeout = useRef(null)

  useEffect(() => {
    const state = loadWheelState()
    setOptions(state.options)
    setBackground(state.background)
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (loaded) saveWheelState({ options, background })
  }, [options, background, loaded])

  useEffect(() => () => clearTimeout(spinTimeout.current), [])

  const totalWeight = useMemo(
    () => options.reduce((s, o) => s + (Number(o.weight) || 0), 0),
    [options]
  )

  const segments = useMemo(() => {
    let acc = 0
    return options.map((o, i) => {
      const w = Number(o.weight) || 0
      const percent = totalWeight > 0 ? (w / totalWeight) * 100 : 0
      const start = acc
      acc += percent
      return {
        ...o,
        percent,
        start,
        end: acc,
        midDeg: ((start + acc) / 2 / 100) * 360,
        color: PALETTE[i % PALETTE.length],
      }
    })
  }, [options, totalWeight])

  const conicGradient =
    segments.length > 0
      ? `conic-gradient(${segments.map((s) => `${s.color} ${s.start}% ${s.end}%`).join(', ')})`
      : 'conic-gradient(#251545 0%, #1B1035 100%)'

  function handleAdd(e) {
    e.preventDefault()
    if (!amount || Number(amount) <= 0) return
    setOptions((prev) => [...prev, createWheelOption({ amount, weight })])
    setAmount('')
    setWeight('1')
  }

  function handleRemove(id) {
    setOptions((prev) => prev.filter((o) => o.id !== id))
  }

  function handleWeightChange(id, value) {
    setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, weight: value } : o)))
  }

  async function handleBackgroundFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const dataUrl = await resizeImageFile(file)
      setBackground(dataUrl)
    } catch (err) {
      console.error(err)
      alert('Nie udało się wczytać obrazka na tło koła.')
    }
    e.target.value = ''
  }

  function handleSpin() {
    if (spinning || segments.length < 2 || totalWeight <= 0) return
    const index = pickWeightedIndex(segments)
    if (index < 0) return

    const midDeg = segments[index].midDeg
    const spins = 6 + Math.floor(Math.random() * 3)
    const current = ((rotation % 360) + 360) % 360
    const targetWithinTurn = (360 - midDeg) % 360
    const delta = ((targetWithinTurn - current) % 360 + 360) % 360
    const finalRotation = rotation + spins * 360 + delta

    setWinner(null)
    setSpinning(true)
    setRotation(finalRotation)

    clearTimeout(spinTimeout.current)
    spinTimeout.current = setTimeout(() => {
      setSpinning(false)
      setWinner(segments[index])
      burstConfetti()
    }, SPIN_MS)
  }

  return (
    <div className="gradient-frame rounded-2xl px-5 py-5 shadow-panel md:px-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl blink">🎡</span>
          <h2 className="font-display text-sm uppercase tracking-wider text-pink neon-pink">
            Koło zrzutki
          </h2>
        </div>
        <span className="text-xs text-muted">Wpisz kwoty, ustaw szanse i zakręć losem</span>
      </div>

      <div className="flex flex-col items-center gap-5">
        <div className="relative aspect-square w-full max-w-[560px]">
          <div className="absolute left-1/2 -top-4 z-30 -translate-x-1/2">
            <div className="h-0 w-0 border-x-[16px] border-x-transparent border-t-[28px] border-t-gold drop-shadow-[0_0_10px_rgba(255,197,49,.9)]" />
          </div>

          <div
            className="absolute inset-0 rounded-full border-[8px] border-line-bright shadow-neon-pink"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: `transform ${SPIN_MS}ms cubic-bezier(.17,.67,.09,1)`,
              overflow: 'hidden',
              backgroundColor: '#1B1035',
              backgroundImage: background ? `url(${background})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div
              className="absolute inset-0"
              style={{ background: conicGradient, opacity: background ? 0.42 : 1 }}
            />
            {segments.map((s) => {
              const flip = s.midDeg > 90 && s.midDeg < 270
              return (
                <div
                  key={s.id}
                  className="absolute inset-0"
                  style={{ transform: `rotate(${s.midDeg}deg)` }}
                >
                  <div
                    className="absolute left-1/2 top-[9%] -translate-x-1/2 whitespace-nowrap"
                    style={{ transform: flip ? 'rotate(180deg)' : undefined }}
                  >
                    <span className="font-display text-lg text-bg drop-shadow-[0_1px_2px_rgba(255,255,255,.4)] md:text-2xl">
                      {formatMoney(s.amount, currency)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="absolute left-1/2 top-1/2 z-20 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-gold bg-bg-panel text-3xl shadow-neon-gold md:h-24 md:w-24 md:text-4xl">
            🎰
          </div>
        </div>

        <button
          onClick={handleSpin}
          disabled={spinning || segments.length < 2}
          className="btn-jazda w-full max-w-[560px] rounded-xl px-6 py-4 font-display text-lg uppercase tracking-wider text-bg shadow-neon-pink transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:animate-none disabled:opacity-40 disabled:hover:scale-100"
        >
          {spinning ? '🎡 Kręci się...' : '🎯 KRĘĆ!'}
        </button>
        {segments.length < 2 && (
          <p className="text-center text-xs text-muted/70">
            Dorzuć minimum dwie kwoty, żeby było co losować.
          </p>
        )}

        {winner && !spinning && (
          <div className="pulse-glow w-full max-w-[560px] rounded-xl border border-gold bg-gold/10 px-4 py-3 text-center shadow-neon-gold">
            <div className="font-display text-[10px] uppercase tracking-wider text-muted">
              🔥 Wylosowano
            </div>
            <div className="mt-1 font-display text-3xl text-gold neon-gold">
              {formatMoney(winner.amount, currency)}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-line pt-5">
        <div className="flex flex-wrap items-end gap-3">
          <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Kwota</label>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
                placeholder="20.00"
                className={`w-24 font-mono ${inputCls}`}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Waga</label>
              <input
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                inputMode="decimal"
                placeholder="1"
                className={`w-16 font-mono ${inputCls}`}
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-violet px-4 py-2 font-display text-xs uppercase tracking-wider text-cream shadow-neon-pink transition-transform hover:scale-105"
            >
              + Dorzuć
            </button>
          </form>

          <label className="cursor-pointer rounded-lg border border-line px-3 py-2 text-xs font-semibold text-muted transition-all hover:border-violet hover:text-violet">
            🖼️ Tło koła
            <input type="file" accept="image/*" onChange={handleBackgroundFile} className="hidden" />
          </label>
          {background && (
            <button
              onClick={() => setBackground(null)}
              className="rounded-lg border border-transparent px-3 py-2 text-xs font-semibold text-muted transition-all hover:border-loss hover:text-loss"
            >
              Usuń tło
            </button>
          )}
        </div>

        {segments.length === 0 ? (
          <p className="text-sm text-muted/70">
            Pusto jak w portfelu. Dorzuć kwoty, które chcecie wrzucić do losowania.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {segments.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-2 rounded-full border border-line bg-bg-deep/60 py-1 pl-3 pr-2"
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span className="font-mono text-sm text-cream">
                  {formatMoney(s.amount, currency)}
                </span>
                <input
                  value={s.weight}
                  onChange={(e) => handleWeightChange(s.id, e.target.value)}
                  inputMode="decimal"
                  title="Waga"
                  className="w-12 rounded-md border border-line bg-bg-panel px-1.5 py-0.5 text-right font-mono text-xs text-cream focus:border-violet"
                />
                <span className="font-mono text-xs text-muted">{s.percent.toFixed(0)}%</span>
                <button
                  onClick={() => handleRemove(s.id)}
                  className="ml-0.5 text-muted transition-colors hover:text-loss"
                  title="Usuń kwotę"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
