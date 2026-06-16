"use client";

import { toneClasses } from "@/lib/status";
import type { Tone } from "@/lib/types";
import { cn } from "@/lib/utils";

const ITEMS: { tone: Tone; label: string }[] = [
  { tone: "pass", label: "Pass (≥60)" },
  { tone: "warn", label: "Below 70 average" },
  { tone: "fail", label: "Re-sit needed (<60)" },
  { tone: "pending", label: "Pending" },
];

export function StatusLegend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 px-1">
      {ITEMS.map((it) => (
        <span key={it.label} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className={cn("size-2 rounded-full", toneClasses(it.tone).dot)} aria-hidden />
          {it.label}
        </span>
      ))}
    </div>
  );
}
