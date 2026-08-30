import { useEffect, useMemo, useRef, useState } from "react";
import {
  flagFor,
  searchJurisdictions,
  type Jurisdiction,
} from "@/lib/workspace/jurisdictions";

/**
 * Searchable jurisdiction picker. Keyboard accessible, 44px touch target,
 * works with the full 125-jurisdiction catalogue.
 */
export function JurisdictionSelect({
  label,
  value,
  onChange,
  options,
  id,
}: {
  label: string;
  value: string;
  onChange: (name: string) => void;
  options: Jurisdiction[];
  id: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => searchJurisdictions(options, query), [options, query]);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function pick(j: Jurisdiction) {
    onChange(j.name);
    setOpen(false);
    setQuery("");
  }

  return (
    <div className="block" ref={wrapRef}>
      <label
        htmlFor={id}
        className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-navy/60"
      >
        {label}
      </label>
      <div className="relative">
        <button
          id={id}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex min-h-11 w-full items-center justify-between gap-2 rounded-sm border border-navy/15 bg-white px-3 py-2.5 text-left text-sm text-navy transition-colors hover:border-navy/30 focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20"
        >
          <span className="flex items-center gap-2 truncate">
            <span aria-hidden="true">{flagFor(value)}</span>
            <span className="truncate">{value || "Select jurisdiction"}</span>
          </span>
          <span aria-hidden="true" className="font-mono text-navy/40">
            {open ? "\u2303" : "\u2304"}
          </span>
        </button>

        {open && (
          <div className="absolute left-0 right-0 z-30 mt-1 overflow-hidden rounded-sm border border-navy/15 bg-white shadow-[0_12px_32px_rgba(5,35,71,0.14)]">
            <div className="border-b border-navy/10 p-2">
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActive((i) => Math.min(i + 1, results.length - 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActive((i) => Math.max(i - 1, 0));
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    const j = results[active];
                    if (j) pick(j);
                  } else if (e.key === "Escape") {
                    setOpen(false);
                  }
                }}
                placeholder="Search 125 jurisdictions"
                className="min-h-11 w-full rounded-sm border border-navy/10 bg-ghost px-3 py-2 text-sm text-navy placeholder:text-navy/40 focus:border-teal focus:outline-none"
              />
            </div>
            <ul role="listbox" className="max-h-64 overflow-y-auto py-1">
              {results.length === 0 && (
                <li className="px-3 py-3 text-sm text-navy/50">No match</li>
              )}
              {results.map((j, i) => (
                <li key={j.code + j.name}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={j.name === value}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => pick(j)}
                    className={`flex min-h-11 w-full items-center gap-2 px-3 py-2 text-left text-sm ${
                      i === active ? "bg-ghost text-navy" : "text-navy/80"
                    } ${j.name === value ? "font-medium text-teal" : ""}`}
                  >
                    <span aria-hidden="true">{flagFor(j.name)}</span>
                    <span className="truncate">{j.name}</span>
                    <span className="ml-auto font-mono text-[10px] text-navy/40">{j.code}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
