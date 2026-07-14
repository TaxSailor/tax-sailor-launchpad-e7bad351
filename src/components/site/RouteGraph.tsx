// Animated cross-border route graph — nodes light up sequentially.
export function RouteGraph({ className = "" }: { className?: string }) {
  const nodes = [
    { id: "US", x: 90, y: 220, label: "US" },
    { id: "DE", x: 260, y: 110, label: "DE" },
    { id: "CH", x: 380, y: 180, label: "CH" },
    { id: "LU", x: 300, y: 260, label: "LU" },
    { id: "IE", x: 170, y: 340, label: "IE" },
    { id: "SG", x: 520, y: 300, label: "SG" },
    { id: "AE", x: 470, y: 90, label: "AE" },
  ];
  const edges: Array<[string, string]> = [
    ["US", "DE"], ["US", "IE"], ["DE", "CH"], ["DE", "LU"],
    ["CH", "SG"], ["LU", "SG"], ["IE", "LU"], ["AE", "CH"], ["AE", "SG"],
  ];
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <svg viewBox="0 0 600 400" className={className} role="img" aria-label="Cross-border route graph">
      <defs>
        <radialGradient id="rg-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="600" height="400" fill="var(--ghost)" />
      {/* Grid */}
      {Array.from({ length: 12 }).map((_, i) => (
        <line key={`v${i}`} x1={i * 50} y1={0} x2={i * 50} y2={400} stroke="var(--navy)" strokeOpacity="0.04" />
      ))}
      {Array.from({ length: 8 }).map((_, i) => (
        <line key={`h${i}`} x1={0} y1={i * 50} x2={600} y2={i * 50} stroke="var(--navy)" strokeOpacity="0.04" />
      ))}
      {/* Optimal route highlight: US → DE → CH → SG */}
      <g fill="url(#rg-glow)">
        <circle cx="90" cy="220" r="50" />
        <circle cx="380" cy="180" r="50" />
        <circle cx="520" cy="300" r="50" />
      </g>
      {/* Edges */}
      {edges.map(([a, b], i) => {
        const A = byId[a], B = byId[b];
        const optimal = (a === "US" && b === "DE") || (a === "DE" && b === "CH") || (a === "CH" && b === "SG");
        return (
          <line
            key={`e${i}`}
            x1={A.x} y1={A.y} x2={B.x} y2={B.y}
            stroke={optimal ? "var(--teal)" : "var(--navy)"}
            strokeOpacity={optimal ? "0.9" : "0.15"}
            strokeWidth={optimal ? "2" : "1"}
            strokeDasharray={optimal ? "400" : undefined}
            style={optimal ? { animation: `route-draw 2s ${i * 0.3}s ease-out both` } : undefined}
          />
        );
      })}
      {/* Nodes */}
      {nodes.map((n, i) => {
        const isOptimal = ["US", "DE", "CH", "SG"].includes(n.id);
        return (
          <g key={n.id}>
            <circle
              cx={n.x} cy={n.y} r="5"
              fill={isOptimal ? "var(--teal)" : "var(--navy)"}
              opacity={isOptimal ? 1 : 0.5}
              style={isOptimal ? { animation: `node-pulse 2.4s ${i * 0.3}s ease-in-out infinite` } : undefined}
            />
            <text
              x={n.x} y={n.y - 12}
              textAnchor="middle"
              className="font-mono"
              fontSize="10"
              fill="var(--navy)"
              opacity={isOptimal ? 0.9 : 0.5}
            >
              {n.label}
            </text>
          </g>
        );
      })}
      {/* Metadata readout */}
      <g className="font-mono" fontSize="9" fill="var(--navy)" opacity="0.55">
        <text x="20" y="30">ACTIVE_ROUTE · US → DE → CH → SG</text>
        <text x="20" y="380">W = −ln(1 − τ)</text>
        <text x="480" y="380" textAnchor="end">RETAIN 91.4%</text>
      </g>
    </svg>
  );
}
