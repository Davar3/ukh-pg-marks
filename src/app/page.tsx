"use client";

import * as React from "react";
import { AppHeader } from "@/components/app-header";
import { BottomTabBar, type TabKey } from "@/components/bottom-tab-bar";
import { MarksTab } from "@/components/marks-tab";
import { OverviewTab } from "@/components/overview-tab";
import { ThesisTab } from "@/components/thesis-tab";
import { MarksProvider } from "@/hooks/use-marks";
import { decodeShare } from "@/lib/store";
import type { AppState } from "@/lib/types";

const TITLES: Record<TabKey, string> = {
  marks: "Year 1 marks",
  overview: "Overview",
  thesis: "Thesis",
};

const TAB_STORAGE_KEY = "ukh_active_tab";
const bp = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function Home() {
  const [tab, setTab] = React.useState<TabKey>("marks");
  const [shared, setShared] = React.useState<AppState | null>(null);

  // Detect a shared snapshot link (?s=...) on the client.
  React.useEffect(() => {
    try {
      const s = new URLSearchParams(window.location.search).get("s");
      if (s) setShared(decodeShare(s));
    } catch {
      /* malformed link — fall through to the normal app */
    }
  }, []);

  React.useEffect(() => {
    if (shared) return;
    const saved = localStorage.getItem(TAB_STORAGE_KEY) as TabKey | null;
    if (saved === "marks" || saved === "overview" || saved === "thesis") setTab(saved);
  }, [shared]);

  React.useEffect(() => {
    if (!shared) localStorage.setItem(TAB_STORAGE_KEY, tab);
  }, [tab, shared]);

  // Read-only shared view.
  if (shared) {
    return (
      <MarksProvider initialState={shared}>
        <div className="app-shell flex min-h-dvh flex-col">
          <header
            className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur"
            style={{ paddingTop: "env(safe-area-inset-top)" }}
          >
            <div className="mx-auto flex h-14 w-full max-w-md items-center gap-3 px-4">
              <a
                href="https://www.ukh.edu.krd"
                target="_blank"
                rel="noopener noreferrer"
                className="flex shrink-0 items-center rounded-md bg-white px-1.5 py-1 ring-1 ring-black/10"
                aria-label="University of Kurdistan Hewlêr"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${bp}/ukh-logo.png`} alt="UKH" className="h-5 w-auto" />
              </a>
              <span className="flex-1 truncate text-sm text-muted-foreground">Shared snapshot</span>
              <a
                href={`${bp}/`}
                className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-brand-foreground"
              >
                Open my tracker
              </a>
            </div>
          </header>
          <main className="mx-auto w-full max-w-md flex-1 space-y-4 px-4 pb-12 pt-4">
            <OverviewTab />
          </main>
        </div>
      </MarksProvider>
    );
  }

  return (
    <MarksProvider>
      <div className="app-shell flex min-h-dvh flex-col">
        <AppHeader title={TITLES[tab]} />
        <main className="mx-auto w-full max-w-md flex-1 px-4 pb-28 pt-4">
          {tab === "marks" && <MarksTab />}
          {tab === "overview" && <OverviewTab />}
          {tab === "thesis" && <ThesisTab />}
        </main>
        <BottomTabBar active={tab} onChange={setTab} />
      </div>
    </MarksProvider>
  );
}
