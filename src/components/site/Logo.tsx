export function Logo({
  className = "size-8",
  accent = "var(--teal)",
  tile = true,
}: {
  className?: string;
  accent?: string;
  tile?: boolean;
}) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      {tile && <rect width="40" height="40" rx="8" fill="var(--navy)" />}
      {/* Mast with masthead */}
      <line
        x1="20"
        y1="8"
        x2="20"
        y2="24"
        stroke="#ffffff"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="20" cy="8" r="0.9" fill="#ffffff" />
      {/* Triangular main sail (right of mast) */}
      <path
        d="M20.6 9 C 27 15, 28 20, 27.4 23.6 L 20.6 23.6 Z"
        fill="#ffffff"
      />
      {/* Hull */}
      <path
        d="M11 24 L 29 24 Q 27 28.8, 20 28.8 Q 13 28.8, 11 24 Z"
        fill="#ffffff"
      />
      {/* Waypoint constellation below hull */}
      <polyline
        points="9,32 14,30.5 20,32 26,30.5 31,32"
        fill="none"
        stroke={accent}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g fill={accent}>
        <circle cx="9" cy="32" r="1.2" />
        <circle cx="14" cy="30.5" r="1.2" />
        <circle cx="20" cy="32" r="1.2" />
        <circle cx="26" cy="30.5" r="1.2" />
        <circle cx="31" cy="32" r="1.2" />
      </g>
    </svg>
  );
}

export function LogoLockup({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <Logo className="size-9 shrink-0" />
      <span className="font-serif text-lg font-bold tracking-tight text-navy">
        Tax<span className="text-teal">Sailor</span>
      </span>
    </div>
  );
}
