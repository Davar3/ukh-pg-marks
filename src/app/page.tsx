"use client";

import * as React from "react";
import { AppHeader } from "@/components/app-header";
import { BottomTabBar, type TabKey } from "@/components/bottom-tab-bar";
import { MarksTab } from "@/components/marks-tab";
import { OverviewTab } from "@/components/overview-tab";
import { ThesisTab } from "@/components/thesis-tab";
import { MarksProvider } from "@/hooks/use-marks";

const TITLES: Record<TabKey, string> = {
  marks: "Year 1 marks",
  overview: "Overview",
  thesis: "Thesis",
};

const TAB_STORAGE_KEY = "ukh_active_tab";

export default function Home() {
  const [tab, setTab] = React.useState<TabKey>("marks");

  React.useEffect(() => {
    const saved = localStorage.getItem(TAB_STORAGE_KEY) as TabKey | null;
    if (saved === "marks" || saved === "overview" || saved === "thesis") setTab(saved);
  }, []);

  React.useEffect(() => {
    localStorage.setItem(TAB_STORAGE_KEY, tab);
  }, [tab]);

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
