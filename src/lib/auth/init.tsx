import { useEffect } from "react";
import { initSession } from "./session";

export function AuthBootstrap() {
  useEffect(() => {
    initSession();
  }, []);
  return null;
}
