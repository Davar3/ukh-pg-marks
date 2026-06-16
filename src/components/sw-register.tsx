"use client";

import * as React from "react";

const bp = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** Registers the offline service worker in production only (skips dev to avoid stale caches). */
export function SwRegister() {
  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register(`${bp}/sw.js`, { scope: `${bp}/` }).catch(() => {
      /* offline support is best-effort */
    });
  }, []);
  return null;
}
