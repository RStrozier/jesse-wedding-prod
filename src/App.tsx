import { useState, useEffect, useRef } from 'react'
import './App.css'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Particle {
  x: number
  y: number
  w: number
  h: number
  color: string
  tiltAngle: number
  tiltAngleIncrement: number
  tilt: number
  speed: number
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

// ─── Countdown Hook ───────────────────────────────────────────────────────────

function useCountdown(targetDate: Date): TimeLeft {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const tick = () => {
      const distance = targetDate.getTime() - Date.now()
      if (distance <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [targetDate])

  return timeLeft
}

// ─── Confetti Canvas ──────────────────────────────────────────────────────────

function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const COLORS = [
      '#D4AF37', '#F5E6C8', '#C9A84C', '#FFD700',
      '#E8D5A3', '#FFF8DC', '#DAA520', '#F0E68C',
      '#C8A951', '#FFDEAD',
    ]

    const particles: Particle[] = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < 160; i++) {
      particles.push({
        x: Math.random() * (canvas.width || 800),
        y: Math.random() * (canvas.height || 600) - (canvas.height || 600),
        w: Math.random() * 9 + 4,
        h: Math.random() * 5 + 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        tiltAngle: 0,
        tiltAngleIncrement: Math.random() * 0.07 + 0.04,
        tilt: 0,
        speed: Math.random() * 1.5 + 0.8,
      })
    }

    let animId: number

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const p of particles) {
        // Update
        p.tiltAngle += p.tiltAngleIncrement
        p.y += p.speed + Math.cos(p.tiltAngle) * 0.4
        p.x += Math.sin(p.tiltAngle) * 0.6
        p.tilt = Math.sin(p.tiltAngle) * 14

        if (p.y > canvas.height) {
          p.y = -10
          p.x = Math.random() * canvas.width
        }

        // Draw
        ctx.save()
        ctx.translate(p.x + p.w / 2, p.y + p.h / 2)
        ctx.rotate((p.tilt * Math.PI) / 180)
        ctx.fillStyle = p.color
        ctx.globalAlpha = 0.85
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      }

      animId = requestAnimationFrame(loop)
    }
    loop()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="confetti-canvas" aria-hidden="true" />
}

// ─── Countdown Display ────────────────────────────────────────────────────────

function CountdownCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="countdown-card">
      <span className="countdown-number">{String(value).padStart(2, '0')}</span>
      <span className="countdown-unit">{label}</span>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

const WEDDING_DATE = new Date('2026-04-25T00:00:00')

export default function App() {
  const { days, hours, minutes, seconds } = useCountdown(WEDDING_DATE)
  const [videoPlaying, setVideoPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handlePlay = () => {
    setVideoPlaying(true)
    setTimeout(() => videoRef.current?.play(), 50)
  }

  return (
    <div className="page">
      <Confetti />

      {/* ── Header ──────────────────────────────────────────────────── */}
      <header className="header">
        <div className="header-content">
          <div className="header-ornament" aria-hidden="true">✦ &nbsp; ✦ &nbsp; ✦</div>
          <h1 className="headline">Cheers to the Johnson's!</h1>
          <p className="subtext">
            A heartfelt celebration of success, dedication, and love.
          </p>
          <div className="header-ornament" aria-hidden="true">✦ &nbsp; ✦ &nbsp; ✦</div>
        </div>
      </header>

      {/* ── Main Content ────────────────────────────────────────────── */}
      <main className="main">

        {/* Video Section */}
        <section className="video-section" aria-label="Feature video">
          <div className="section-label">A Message From the Heart of Your Carousel and DC Basement Family</div>

          <div className="video-wrapper">
            {!videoPlaying ? (
              <div
                className="video-placeholder"
                onClick={handlePlay}
                role="button"
                tabIndex={0}
                aria-label="Play congratulations video"
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handlePlay()}
              >
                <div className="video-shimmer" aria-hidden="true" />
                <div className="play-overlay">
                  <div className="play-button" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            ) : (
              <div className="video-active">
                <video
                  ref={videoRef}
                  controls
                  className="video-player"
                >
                  <source src="/Jesse & Emily Prod.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
          </div>

          {!videoPlaying && (
            <button className="watch-btn" onClick={handlePlay}>
              <span className="watch-btn-icon" aria-hidden="true">▶</span>
              Watch Now
            </button>
          )}

          <p className="video-description">
            Join us in celebrating someone who inspires us every day. Watch messages of
            congratulations from Jesse's colleagues and basement friends!
          </p>
        </section>

        {/* Countdown Section */}
        <section className="countdown-section" aria-label="Wedding countdown">
          <div className="countdown-label">Counting down to their big day!</div>
          <div className="countdown-date">April 25, 2026</div>
          <div className="countdown-grid">
            <CountdownCard value={days}    label="Days"    />
            <CountdownCard value={hours}   label="Hours"   />
            <CountdownCard value={minutes} label="Minutes" />
            <CountdownCard value={seconds} label="Seconds" />
          </div>
        </section>

      </main>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="footer">
        <span className="footer-ornament" aria-hidden="true">♥</span>
        <p className="footer-message">With love and appreciation from your team.</p>
        <nav className="footer-links" aria-label="Footer navigation">
        </nav>
        <span className="footer-ornament small" aria-hidden="true">✦ &nbsp; ✦ &nbsp; ✦</span>
      </footer>
    </div>
  )
}
