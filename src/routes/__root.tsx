import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Nav } from "../components/site/Nav";
import { Footer } from "../components/site/Footer";
import { AuthBootstrap } from "../lib/auth/init";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-teal">404</p>
        <h1 className="mt-3 font-serif text-4xl text-navy">Off the chart</h1>
        <p className="mt-3 text-sm text-navy/60">
          This route isn't in our graph. Head back to a known waypoint.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-sm bg-navy px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-2xl text-navy">This page didn't load</h1>
        <p className="mt-2 text-sm text-navy/60">
          Something went wrong on our end. Try again, or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-sm bg-navy px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal"
          >
            Try again
          </button>
          <a
            href="/"
            className="rounded-sm border border-navy/10 bg-white px-5 py-2.5 text-sm font-medium text-navy transition-colors hover:bg-ghost"
          >
            Home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "TaxSailor — Computational Tax Intelligence for Cross-Border Capital" },
      {
        name: "description",
        content:
          "TaxSailor is the world's first computational tax intelligence platform. 131 jurisdictions, 438 treaty edges, mathematically proven route optimization.",
      },
      { name: "author", content: "TaxSailor" },
      { property: "og:site_name", content: "TaxSailor" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "TaxSailor — Computational Tax Intelligence" },
      {
        property: "og:description",
        content:
          "Navigate borders. Keep more. Prove everything. Log-transformed Dijkstra route optimization across 131 jurisdictions.",
      },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthBootstrap />
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <Nav />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </QueryClientProvider>
  );
}
