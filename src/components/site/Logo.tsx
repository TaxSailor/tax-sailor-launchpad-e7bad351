export function Logo({ className = "size-8", accent = "var(--teal)" }: { className?: string; accent?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="6" fill="var(--navy)" />
      {/* Sail */}
      <path d="M20 8 L20 24 L28 24 Z" fill="#ffffff" />
      <path d="M20 12 L14 24 L20 24 Z" fill="#ffffff" opacity="0.85" />
      {/* Constellation waypoint route */}
      <g stroke={accent} strokeWidth="1.2" fill={accent}>
        <line x1="10" y1="30" x2="18" y2="28" />
        <line x1="18" y1="28" x2="24" y2="30" />
        <line x1="24" y1="30" x2="30" y2="28" />
        <circle cx="10" cy="30" r="1.6" />
        <circle cx="18" cy="28" r="1.6" />
        <circle cx="24" cy="30" r="1.6" />
        <circle cx="30" cy="28" r="1.6" />
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
