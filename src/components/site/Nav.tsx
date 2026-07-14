import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { LogoLockup } from "./Logo";
import { LeadDialog } from "./LeadForm";

const links = [
  { to: "/investors", label: "Investors" },
  { to: "/pilot", label: "Pilot" },
  { to: "/corporations", label: "Corporations" },
  { to: "/individuals", label: "Individuals" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 w-full border-b transition-colors ${
        scrolled ? "border-navy/10 bg-white/90 backdrop-blur-md" : "border-transparent bg-white"
      }`}
    >
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-6">
        <Link to="/" className="min-w-0 shrink-0">
          <LogoLockup />
        </Link>
        <div className="hidden min-w-0 items-center justify-center gap-7 text-sm font-medium text-navy/70 lg:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="transition-colors hover:text-teal"
              activeProps={{ className: "text-navy" }}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2 justify-self-end">
          <LeadDialog audience="general" trigger={
            <button className="hidden rounded-sm bg-navy px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-teal md:inline-flex">
              Access Platform
            </button>
          } />
          <button
            className="inline-flex size-10 items-center justify-center rounded-sm border border-navy/10 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-navy/10 bg-white lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-4">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-sm px-3 py-3 text-sm font-medium text-navy/80 hover:bg-ghost"
                activeProps={{ className: "text-navy bg-ghost" }}
              >
                {l.label}
              </Link>
            ))}
            <LeadDialog
              audience="general"
              trigger={
                <button className="mt-2 rounded-sm bg-navy px-5 py-3 text-sm font-medium text-white">
                  Access Platform
                </button>
              }
            />
          </div>
        </div>
      )}
    </nav>
  );
}
