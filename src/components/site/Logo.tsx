export function Logo({ className = "size-8", accent = "var(--teal)" }: { className?: string; accent?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      {/* Rounded navy tile */}
      <rect width="40" height="40" rx="8" fill="var(--navy)" />
      {/* Mast */}
      <line x1="20" y1="7" x2="20" y2="29" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
      {/* Main sail — curved leech for wind */}
      <path
        d="M20.8 8 C 27 14, 28.5 20, 27.8 24.4 L 20.8 24.4 Z"
        fill="#ffffff"
      />
      {/* Fore sail (jib) */}
      <path
        d="M19.2 11 C 15 16, 13.8 20.5, 14 24.4 L 19.2 24.4 Z"
        fill="#ffffff"
        opacity="0.72"
      />
      {/* Hull — thin arc */}
      <path
        d="M9 27.5 Q 20 33, 31 27.5"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {/* Waypoint star at masthead */}
      <circle cx="20" cy="7" r="1.6" fill={accent} />
      {/* Waterline waypoints */}
      <g fill={accent}>
        <circle cx="12" cy="30.2" r="1.1" />
        <circle cx="28" cy="30.2" r="1.1" />
      </g>
    </svg>
  );
}

export function LogoLockup({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <Logo className="size-8 shrink-0" />
      <span className="font-serif text-lg font-bold tracking-tight text-navy">
        Tax<span className="text-teal">Sailor</span>
      </span>
    </div>
  );
}
