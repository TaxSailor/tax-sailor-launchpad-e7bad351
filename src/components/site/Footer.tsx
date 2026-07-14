import { Link } from "@tanstack/react-router";
import { LogoLockup } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-navy/10 bg-white py-12 px-6">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-[1fr_auto_auto] md:items-center">
        <div className="flex flex-col gap-3">
          <LogoLockup />
          <p className="max-w-xs text-xs text-navy/50">
            Computational tax intelligence for cross-border capital. 131 jurisdictions, 438 treaty edges.
          </p>
        </div>
        <div className="flex flex-wrap gap-6 text-xs font-mono uppercase tracking-widest text-navy/40">
          <Link to="/investors" className="hover:text-teal">Investors</Link>
          <Link to="/pilot" className="hover:text-teal">Pilot</Link>
          <Link to="/about" className="hover:text-teal">About</Link>
          <Link to="/contact" className="hover:text-teal">Contact</Link>
        </div>
        <div className="font-mono text-[10px] tracking-widest text-navy/40 md:text-right">
          © {new Date().getFullYear()} TAXSAILOR · ALL SYSTEMS NOMINAL
        </div>
      </div>
    </footer>
  );
}
