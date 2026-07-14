// Animated cross-border route graph — nodes light up sequentially.
// Each node shows the country's flag glyph alongside its ISO code.
export function RouteGraph({ className = "" }: { className?: string }) {
  const nodes = [
    { id: "US", x: 90, y: 220, label: "US", flag: "🇺🇸", name: "United States" },
    { id: "DE", x: 260, y: 110, label: "DE", flag: "🇩🇪", name: "Germany" },
    { id: "CH", x: 380, y: 180, label: "CH", flag: "🇨🇭", name: "Switzerland" },
    { id: "LU", x: 300, y: 260, label: "LU", flag: "🇱🇺", name: "Luxembourg" },
    { id: "IE", x: 170, y: 340, label: "IE", flag: "🇮🇪", name: "Ireland" },
    { id: "SG", x: 520, y: 300, label: "SG", flag: "🇸🇬", name: "Singapore" },
    { id: "AE", x: 470, y: 90, label: "AE", flag: "🇦🇪", name: "UAE" },
  ];
  const edges: Array<[string, string]> = [
    ["US", "DE"], ["US", "IE"], ["DE", "CH"], ["DE", "LU"],
    ["CH", "SG"], ["LU", "SG"], ["IE", "LU"], ["AE", "CH"], ["AE", "SG"],
  ];
  const optimalIds = new Set(["US", "DE", "CH", "SG"]);
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <svg viewBox="0 0 600 420" className={className} role="img" aria-label="Cross-border route graph across 7 jurisdictions">
      <defs>
        <radialGradient id="rg-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="600" height="420" fill="var(--ghost)" />

      {/* Grid */}
      {Array.from({ length: 12 }).map((_, i) => (
        <line key={`v${i}`} x1={i * 50} y1={0} x2={i * 50} y2={420} stroke="var(--navy)" strokeOpacity="0.04" />
      ))}
      {Array.from({ length: 9 }).map((_, i) => (
        <line key={`h${i}`} x1={0} y1={i * 50} x2={600} y2={i * 50} stroke="var(--navy)" strokeOpacity="0.04" />
      ))}

      {/* Optimal route highlight glow */}
      <g fill="url(#rg-glow)">
        <circle cx="90" cy="220" r="55" />
        <circle cx="260" cy="110" r="55" />
        <circle cx="380" cy="180" r="55" />
        <circle cx="520" cy="300" r="55" />
      </g>

      {/* Edges */}
      {edges.map(([a, b], i) => {
        const A = byId[a], B = byId[b];
        const optimal =
          (a === "US" && b === "DE") ||
          (a === "DE" && b === "CH") ||
          (a === "CH" && b === "SG");
        return (
          <line
            key={`e${i}`}
            x1={A.x} y1={A.y} x2={B.x} y2={B.y}
            stroke={optimal ? "var(--teal)" : "var(--navy)"}
            strokeOpacity={optimal ? "0.9" : "0.18"}
            strokeWidth={optimal ? "2.2" : "1"}
            strokeDasharray={optimal ? "400" : undefined}
            style={optimal ? { animation: `route-draw 2s ${i * 0.3}s ease-out both` } : undefined}
          />
        );
      })}

      {/* Nodes: flag chip + ISO label */}
      {nodes.map((n, i) => {
        const isOptimal = optimalIds.has(n.id);
        return (
          <g key={n.id}>
            {/* Flag chip background */}
            <circle
              cx={n.x} cy={n.y} r="18"
              fill="white"
              stroke={isOptimal ? "var(--teal)" : "var(--navy)"}
              strokeOpacity={isOptimal ? 1 : 0.35}
              strokeWidth={isOptimal ? 2 : 1.2}
              style={isOptimal ? { animation: `node-pulse 2.4s ${i * 0.3}s ease-in-out infinite` } : undefined}
            />
            {/* Flag emoji */}
            <text
              x={n.x} y={n.y + 6}
              textAnchor="middle"
              fontSize="20"
              style={{ userSelect: "none" }}
            >
              {n.flag}
            </text>
            {/* ISO code label below */}
            <text
              x={n.x} y={n.y + 34}
              textAnchor="middle"
              className="font-mono"
              fontSize="11"
              fontWeight="600"
              fill="var(--navy)"
              opacity={isOptimal ? 1 : 0.65}
            >
              {n.label}
            </text>
          </g>
        );
      })}

      {/* Metadata readout */}
      <g className="font-mono" fill="var(--navy)">
        <text x="20" y="28" fontSize="11" fontWeight="600" opacity="0.85">
          ACTIVE ROUTE
        </text>
        <text x="20" y="44" fontSize="10" opacity="0.6">
          🇺🇸 US → 🇩🇪 DE → 🇨🇭 CH → 🇸🇬 SG
        </text>

        <text x="580" y="28" fontSize="11" fontWeight="600" textAnchor="end" opacity="0.85">
          RETAIN 91.4%
        </text>
        <text x="580" y="44" fontSize="10" textAnchor="end" opacity="0.6">
          W = −ln(1 − τ)
        </text>
      </g>
    </svg>
  );
}
