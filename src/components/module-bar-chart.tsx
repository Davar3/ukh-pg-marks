"use client";

import { useMarks } from "@/hooks/use-marks";
import { effectiveMark, moduleStatus, semesterAverage } from "@/lib/rules";
import { moduleTone, toneClasses } from "@/lib/status";
import type { TaughtYear } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ModuleBarChart({ year }: { year: TaughtYear }) {
  const { state } = useMarks();
  return (
    <div className="space-y-4">
      {year.semesters.map((s, si) => {
        const avg = semesterAverage(s).average;
        return (
          <div key={si} className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium">{s.name}</span>
              <span className="tnum">avg {avg !== null ? avg.toFixed(1) : "—"}</span>
            </div>
            {s.modules.length === 0 && <p className="text-xs text-muted-foreground">No modules.</p>}
            {s.modules.map((m) => {
              const em = effectiveMark(m);
              const c = toneClasses(moduleTone(moduleStatus(m, state.settings)));
              const label = m.name?.trim() || "Untitled module";
              return (
                <div
                  key={m.id}
                  className="space-y-1"
                  aria-label={`${label}: ${em ?? "not graded"}${em !== null ? " out of 100" : ""}`}
                >
                  <div className="flex justify-between text-xs">
                    <span className="truncate">{label}</span>
                    <span className="tnum font-medium">{em ?? "—"}</span>
                  </div>
                  <div className="relative h-2 rounded-full bg-muted">
                    {em !== null && (
                      <div
                        className={cn("h-full rounded-full transition-all", c.dot)}
                        style={{ width: `${em}%` }}
                      />
                    )}
                    <span className="absolute -top-0.5 h-3 w-px bg-foreground/25" style={{ left: "60%" }} />
                    <span className="absolute -top-0.5 h-3 w-px bg-foreground/45" style={{ left: "70%" }} />
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
      <p className="text-[11px] text-muted-foreground">Ticks mark the pass line (60) and the target (70).</p>
    </div>
  );
}
