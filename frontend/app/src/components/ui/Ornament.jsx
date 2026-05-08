/* Royal ornament — twin gold hairlines with a fleuron in the middle.
   Use as section dividers or under page eyebrows. */

export default function Ornament({ tone = 'gold', size = 'md', className = '' }) {
  const ruleColor = tone === 'gold'
    ? 'rgba(184, 137, 58, 0.55)'
    : tone === 'cream'
      ? 'rgba(250, 246, 238, 0.4)'
      : 'rgba(31, 79, 63, 0.3)';

  const glyphColor = tone === 'gold'
    ? 'var(--color-gold)'
    : tone === 'cream'
      ? 'var(--color-cream)'
      : 'var(--color-primary)';

  const widths = {
    sm: 'w-[120px]',
    md: 'w-[180px] sm:w-[220px]',
    lg: 'w-[260px] sm:w-[320px]',
  };

  return (
    <div
      role="presentation"
      className={`flex items-center justify-center gap-3 ${widths[size]} mx-auto ${className}`}
    >
      <span
        aria-hidden="true"
        className="flex-1 h-px"
        style={{ background: `linear-gradient(to right, transparent, ${ruleColor})` }}
      />
      <Fleuron color={glyphColor} />
      <span
        aria-hidden="true"
        className="flex-1 h-px"
        style={{ background: `linear-gradient(to left, transparent, ${ruleColor})` }}
      />
    </div>
  );
}

function Fleuron({ color }) {
  return (
    <svg
      className="shrink-0"
      width="22"
      height="14"
      viewBox="0 0 44 28"
      aria-hidden="true"
    >
      <g fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        {/* Center diamond */}
        <path d="M22 5 L26 14 L22 23 L18 14 Z" />
        {/* Left curl */}
        <path d="M18 14 C 13 14, 9 12, 7 14 C 9 16, 13 14, 18 14" />
        {/* Right curl */}
        <path d="M26 14 C 31 14, 35 12, 37 14 C 35 16, 31 14, 26 14" />
        {/* Center dot */}
        <circle cx="22" cy="14" r="1.2" fill={color} stroke="none" />
      </g>
    </svg>
  );
}

/* ─── Crest — small medallion with paired laurels around a glyph ────── */

export function Crest({ size = 56, className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 64 64" width={size} height={size} fill="none">
        <defs>
          <linearGradient id="crestRing" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e8c574" />
            <stop offset="100%" stopColor="#8a652b" />
          </linearGradient>
        </defs>
        {/* Outer gold ring */}
        <circle cx="32" cy="32" r="28" stroke="url(#crestRing)" strokeWidth="1.2" />
        {/* Inner ring (subtle) */}
        <circle cx="32" cy="32" r="24" stroke="rgba(184,137,58,0.4)" strokeWidth="0.6" />
        {/* Laurels */}
        <g stroke="url(#crestRing)" strokeWidth="1" strokeLinecap="round" fill="none">
          {/* Left laurel */}
          <path d="M14 32 C 14 26, 17 22, 22 22" />
          <path d="M16 28 C 18 28, 19 27, 19 25" />
          <path d="M14.5 31 C 16.5 31, 17.5 30, 17.5 28" />
          <path d="M14 34 C 16 34, 17 33, 17 31" />
          {/* Right laurel */}
          <path d="M50 32 C 50 26, 47 22, 42 22" />
          <path d="M48 28 C 46 28, 45 27, 45 25" />
          <path d="M49.5 31 C 47.5 31, 46.5 30, 46.5 28" />
          <path d="M50 34 C 48 34, 47 33, 47 31" />
        </g>
        {/* Center monogram — a stylised fruit drop */}
        <g fill="url(#crestRing)">
          <path d="M32 22 C 27 28, 25 31, 25 34 a7 7 0 0 0 14 0 C 39 31, 37 28, 32 22 Z" />
        </g>
        {/* Small leaf on top */}
        <path d="M32 22 C 30 19, 30 17, 32 16 C 34 17, 34 19, 32 22" fill="rgba(31,79,63,0.6)" />
      </svg>
    </span>
  );
}
