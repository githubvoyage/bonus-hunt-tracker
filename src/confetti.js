const COLORS = ['#FFC531', '#FF2E88', '#22E4FF', '#A855F7', '#00FFA3', '#FF4365', '#FFE066']

// Konfetti bez żadnych zależności — canvas na pełen ekran, samo się sprząta po animacji.
export function burstConfetti({ duration = 2800, particleCount = 180 } = {}) {
  if (typeof document === 'undefined') return

  const canvas = document.createElement('canvas')
  canvas.style.position = 'fixed'
  canvas.style.inset = '0'
  canvas.style.width = '100vw'
  canvas.style.height = '100vh'
  canvas.style.pointerEvents = 'none'
  canvas.style.zIndex = '9999'
  document.body.appendChild(canvas)

  const ctx = canvas.getContext('2d')
  const dpr = window.devicePixelRatio || 1

  function resize() {
    canvas.width = window.innerWidth * dpr
    canvas.height = window.innerHeight * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  resize()

  const originX = window.innerWidth / 2
  const originY = window.innerHeight * 0.35

  const particles = Array.from({ length: particleCount }, () => ({
    x: originX + (Math.random() - 0.5) * 260,
    y: originY,
    vx: (Math.random() - 0.5) * 16,
    vy: -Math.random() * 15 - 6,
    size: Math.random() * 7 + 4,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rotation: Math.random() * 360,
    spin: (Math.random() - 0.5) * 22,
    shape: Math.random() < 0.5 ? 'rect' : 'circle',
    drag: 0.995,
  }))

  const gravity = 0.32
  const start = performance.now()
  let frameId = null

  function frame(now) {
    const elapsed = now - start
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
    for (const p of particles) {
      p.vy += gravity
      p.vx *= p.drag
      p.x += p.vx
      p.y += p.vy
      p.rotation += p.spin
      const fade = Math.max(0, 1 - elapsed / duration)
      ctx.save()
      ctx.globalAlpha = fade
      ctx.translate(p.x, p.y)
      ctx.rotate((p.rotation * Math.PI) / 180)
      ctx.fillStyle = p.color
      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
      } else {
        ctx.beginPath()
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()
    }
    if (elapsed < duration) {
      frameId = requestAnimationFrame(frame)
    } else {
      cleanup()
    }
  }

  function cleanup() {
    if (frameId) cancelAnimationFrame(frameId)
    window.removeEventListener('resize', resize)
    canvas.remove()
  }

  window.addEventListener('resize', resize)
  frameId = requestAnimationFrame(frame)
}
