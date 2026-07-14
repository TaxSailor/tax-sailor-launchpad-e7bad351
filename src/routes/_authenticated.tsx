import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getAuthToken } from "@/lib/auth/session";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ location }) => {
    if (typeof window === "undefined") return;
    if (!getAuthToken()) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  component: () => <Outlet />,
});
