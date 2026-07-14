import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { LogoLockup } from "@/components/site/Logo";
import { IS_MOCK_API } from "@/lib/api";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-ghost">
      <div className="mx-auto grid max-w-md gap-8 px-6 py-16">
        <Link to="/" className="justify-self-center">
          <LogoLockup />
        </Link>
        {IS_MOCK_API && (
          <div className="rounded-sm border border-teal/30 bg-teal/5 px-3 py-2 text-center text-[11px] font-mono uppercase tracking-widest text-teal">
            Preview · mock auth · any credentials accepted
          </div>
        )}
        <div className="grid gap-2 text-center">
          <h1 className="font-serif text-3xl text-navy">{title}</h1>
          {subtitle && <p className="text-sm text-navy/60">{subtitle}</p>}
        </div>
        <div className="rounded-sm border border-navy/10 bg-white p-6 shadow-[0_1px_2px_rgba(5,35,71,0.04)]">
          {children}
        </div>
        {footer && <div className="text-center text-sm text-navy/60">{footer}</div>}
      </div>
    </div>
  );
}

export function OAuthButtons({ onClick }: { onClick: (p: "google" | "facebook") => void }) {
  return (
    <div className="grid gap-2">
      <button
        type="button"
        onClick={() => onClick("google")}
        className="inline-flex items-center justify-center gap-2 rounded-sm border border-navy/15 bg-white px-4 py-2.5 text-sm font-medium text-navy transition-colors hover:bg-ghost"
      >
        <GoogleG /> Continue with Google
      </button>
      <button
        type="button"
        onClick={() => onClick("facebook")}
        className="inline-flex items-center justify-center gap-2 rounded-sm border border-navy/15 bg-white px-4 py-2.5 text-sm font-medium text-navy transition-colors hover:bg-ghost"
      >
        <FacebookF /> Continue with Facebook
      </button>
    </div>
  );
}

function GoogleG() {
  return (
    <svg viewBox="0 0 48 48" className="size-4" aria-hidden>
      <path
        fill="#EA4335"
        d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.4 13.5 17.7 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.5 24.5c0-1.6-.2-3.2-.5-4.7H24v9.4h12.7c-.6 3-2.3 5.6-4.9 7.3l7.6 5.9c4.5-4.1 7.1-10.2 7.1-17.9z"
      />
      <path
        fill="#FBBC05"
        d="M10.4 28.7a14.5 14.5 0 010-9.4l-7.8-6.1a24 24 0 000 21.6l7.8-6.1z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.2 0 11.4-2 15.2-5.6l-7.6-5.9c-2.1 1.4-4.8 2.2-7.6 2.2-6.3 0-11.6-4-13.6-9.8l-7.8 6.1C6.5 42.6 14.6 48 24 48z"
      />
    </svg>
  );
}

function FacebookF() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden fill="#1877F2">
      <path d="M22 12a10 10 0 10-11.6 9.9v-7H8v-3h2.4V9.4c0-2.4 1.4-3.7 3.6-3.7 1 0 2.1.2 2.1.2v2.3H15c-1.2 0-1.6.7-1.6 1.5V12H16l-.4 3h-2.2v7A10 10 0 0022 12z" />
    </svg>
  );
}

export function AuthDivider() {
  return (
    <div className="my-4 flex items-center gap-3">
      <div className="h-px flex-1 bg-navy/10" />
      <span className="text-[10px] font-mono uppercase tracking-widest text-navy/50">or</span>
      <div className="h-px flex-1 bg-navy/10" />
    </div>
  );
}
