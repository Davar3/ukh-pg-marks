"use client";

import * as React from "react";
import { Bookmark, RotateCcw } from "lucide-react";
import { useMarks } from "@/hooks/use-marks";
import { assessTaughtYear, effectiveMark, num, yearModules } from "@/lib/rules";
import { toneClasses } from "@/lib/status";
import type { Tone } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const SHORT: Record<string, string> = {
  pass: "On track",
  "avg-below": "Below 70",
  "module-fail": "Module < 60",
  pending: "Pending",
  empty: "—",
};

interface PlanResult {
  average: number | null;
  tone: Tone;
  short: string;
  k: number;
  cap: number;
  withinCap: boolean;
}

interface SavedPlan extends PlanResult {
  id: string;
  label: string;
}

export function ResitPlanner() {
  const { taughtYear, state } = useMarks();
  const [tries, setTries] = React.useState<Record<string, number | null>>({});
  const [saved, setSaved] = React.useState<SavedPlan[]>([]);
  const seq = React.useRef(0);

  if (!taughtYear) return null;
  const graded = yearModules(taughtYear)
    .filter((m) => effectiveMark(m) !== null)
    .sort((a, b) => (effectiveMark(a) as number) - (effectiveMark(b) as number));
  if (graded.length === 0)
    return <p className="text-sm text-muted-foreground">Enter some marks first to plan re-sits.</p>;

  function evaluate(t: Record<string, number | null>): PlanResult {
    const clone = structuredClone(taughtYear!);
    for (const sem of clone.semesters) {
      for (const m of sem.modules) {
        if (t[m.id] != null) m.resit = t[m.id];
      }
    }
    const a = assessTaughtYear(clone, state.settings);
    const k = Object.values(t).filter((v) => v != null).length;
    return {
      average: a.average,
      tone: a.tone,
      short: SHORT[a.status] ?? "—",
      k,
      cap: a.maxResitForAverage,
      withinCap: k <= a.maxResitForAverage,
    };
  }

  const result = evaluate(tries);
  const c = toneClasses(result.tone);
  const hasTries = result.k > 0;

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Try hypothetical re-sit marks. Re-sits to raise the average are capped at 50% of modules (max{" "}
        {result.cap}). A re-sit mark is final even if lower.
      </p>

      <div className="space-y-2">
        {graded.map((m) => {
          const cur = effectiveMark(m) as number;
          return (
            <div key={m.id} className="flex items-center gap-3">
              <span className="min-w-0 flex-1 truncate text-sm">{m.name?.trim() || "Untitled"}</span>
              <span className="tnum text-sm text-muted-foreground">{cur}</span>
              <span className="text-muted-foreground">→</span>
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                max={100}
                placeholder="try"
                className="tnum h-8 w-20"
                value={tries[m.id] ?? ""}
                onChange={(e) =>
                  setTries((prev) => ({ ...prev, [m.id]: num(e.target.value) }))
                }
              />
            </div>
          );
        })}
      </div>

      {/* live result */}
      <div className={cn("flex items-center justify-between rounded-xl border p-3", c.softBg, c.border)}>
        <div>
          <p className="text-xs text-muted-foreground">Planned average</p>
          <p className={cn("tnum text-2xl font-medium leading-none", c.text)}>
            {result.average !== null ? result.average.toFixed(1) : "—"}
          </p>
        </div>
        <div className="text-right">
          <p className={cn("text-sm font-medium", c.text)}>{result.short}</p>
          {hasTries && (
            <p
              className={cn(
                "text-xs",
                result.withinCap ? "text-muted-foreground" : "text-fail-strong",
              )}
            >
              {result.k} re-sit{result.k > 1 ? "s" : ""} · {result.withinCap ? "within cap" : "over the 50% cap"}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          disabled={!hasTries}
          onClick={() => {
            seq.current += 1;
            setSaved((prev) =>
              [...prev, { ...result, id: `p${seq.current}`, label: `Plan ${String.fromCharCode(64 + seq.current)}` }].slice(-3),
            );
          }}
        >
          <Bookmark className="size-4" /> Save plan
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={!hasTries && saved.length === 0}
          onClick={() => {
            setTries({});
            setSaved([]);
          }}
        >
          <RotateCcw className="size-4" /> Reset
        </Button>
      </div>

      {saved.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {saved.map((p) => {
            const pc = toneClasses(p.tone);
            return (
              <div key={p.id} className="rounded-lg border border-border p-2 text-center">
                <p className="text-[11px] text-muted-foreground">{p.label}</p>
                <p className={cn("tnum text-lg font-medium leading-tight", pc.text)}>
                  {p.average !== null ? p.average.toFixed(1) : "—"}
                </p>
                <p className={cn("text-[10px]", pc.text)}>{p.short}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
