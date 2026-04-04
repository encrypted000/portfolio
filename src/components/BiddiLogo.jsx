export default function BiddiLogo({ size = 40 }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="bl-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f5b52a" />
          <stop offset="100%" stopColor="#e07a10" />
        </linearGradient>
        <linearGradient id="bl-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1e1810" />
          <stop offset="100%" stopColor="#0d0a06" />
        </linearGradient>
        <radialGradient id="bl-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(245,158,42,0.18)" />
          <stop offset="100%" stopColor="rgba(245,158,42,0)" />
        </radialGradient>
      </defs>

      {/* Glow behind circle */}
      <circle cx="50" cy="50" r="50" fill="url(#bl-glow)" />

      {/* Background disc */}
      <circle cx="50" cy="50" r="46" fill="url(#bl-bg)" />

      {/* Outer ring */}
      <circle cx="50" cy="50" r="44" stroke="url(#bl-fill)" strokeWidth="2.5" />

      {/* Inner ring (decorative) */}
      <circle cx="50" cy="50" r="38" stroke="rgba(245,158,42,0.18)" strokeWidth="1" />

      {/* ── BD Monogram ── */}
      {/* Central shared spine */}
      <line
        x1="50" y1="22" x2="50" y2="78"
        stroke="url(#bl-fill)" strokeWidth="6" strokeLinecap="round"
      />

      {/* D — single arc curving LEFT */}
      <path
        d="M 50 22 C 16 22 16 78 50 78"
        stroke="url(#bl-fill)" strokeWidth="5.5" strokeLinecap="round"
      />

      {/* B — top bump curving RIGHT (smaller) */}
      <path
        d="M 50 22 C 74 22 74 50 50 50"
        stroke="url(#bl-fill)" strokeWidth="5.5" strokeLinecap="round"
      />

      {/* B — bottom bump curving RIGHT (slightly larger) */}
      <path
        d="M 50 50 C 79 50 79 78 50 78"
        stroke="url(#bl-fill)" strokeWidth="5.5" strokeLinecap="round"
      />

      {/* Small accent dots at top and bottom of spine */}
      <circle cx="50" cy="17" r="3.5" fill="url(#bl-fill)" opacity="0.7" />
      <circle cx="50" cy="83" r="3.5" fill="url(#bl-fill)" opacity="0.7" />
    </svg>
  )
}
