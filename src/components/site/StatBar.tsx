import { useEffect, useRef, useState } from "react";

const stats = [
  { value: 131, suffix: "", label: "Jurisdictions Covered" },
  { value: 438, suffix: "", label: "Active Treaty Edges" },
  { value: 3000, suffix: "+", label: "Verified Documents" },
  { value: 50, suffix: "+", label: "Pathing Variables" },
];

function useCountUp(target: number, start: boolean, duration = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf = 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, start, duration]);
  return value;
}

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setInView(true),
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const n = useCountUp(value, inView);
  return (
    <span ref={ref} className="font-mono text-3xl text-teal md:text-4xl">
      {value >= 1000 ? n.toLocaleString() : n}
      {suffix}
    </span>
  );
}

export function StatBar() {
  return (
    <section className="bg-navy px-6 py-14 text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="space-y-1">
            <Counter value={s.value} suffix={s.suffix} />
            <p className="text-[11px] font-medium uppercase tracking-widest text-white/50">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
