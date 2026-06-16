"use client";

import { LayoutDashboard, ScrollText, SquarePen } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type TabKey = "marks" | "overview" | "thesis";

const TABS: { key: TabKey; label: string; icon: LucideIcon }[] = [
  { key: "marks", label: "Marks", icon: SquarePen },
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "thesis", label: "Thesis", icon: ScrollText },
];

export function BottomTabBar({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (t: TabKey) => void;
}) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/90 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Sections"
    >
      <div className="mx-auto flex w-full max-w-md">
        {TABS.map((t) => {
          const Icon = t.icon;
          const on = active === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => onChange(t.key)}
              aria-current={on ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                on ? "text-brand" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-6" />
              {t.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
