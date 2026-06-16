"use client";

import type { TaughtAssessment } from "@/lib/types";

function Tile({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-card px-4 py-3">
      <span className="tnum text-2xl font-medium leading-none">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

export function MetricTiles({ assessment }: { assessment: TaughtAssessment }) {
  const passed = Math.max(0, assessment.graded - assessment.failedCount);
  const pending = assessment.total - assessment.graded;
  return (
    <div className="grid grid-cols-2 gap-3">
      <Tile value={`${passed}/${assessment.total}`} label="modules passed" />
      <Tile value={`${pending}`} label={pending === 1 ? "module pending" : "modules pending"} />
    </div>
  );
}
