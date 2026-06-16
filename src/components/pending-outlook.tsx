"use client";

import { Telescope } from "lucide-react";
import { useMarks } from "@/hooks/use-marks";
import { assessTaughtYear, effectiveMark, yearModules } from "@/lib/rules";
import { toneClasses } from "@/lib/status";
import type { Tone } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Best & worst case for the year while modules are still ungraded.
 * Fills the pending modules with the pass mark (floor) and 100 (ceiling),
 * using only marks the student already entered — answers "can I still fail / am I safe?".
 */
export function PendingOutlook() {
  const { taughtYear, state } = useMarks();
  if (!taughtYear) return null;

  const mods = yearModules(taughtYear);
  const graded = mods.filter((m) => effectiveMark(m) !== null);
  const pending = mods.length - graded.length;
  if (pending === 0 || graded.length === 0) return null;

  const req = state.settings.annualAvg;
  const pass = state.settings.modulePass;

  function fillAvg(fillMark: number): number | null {
    const clone = structuredClone(taughtYear!);
    for (const sem of clone.semesters) {
      for (const m of sem.modules) {
        if (effectiveMark(m) === null) m.mark = fillMark;
      }
    }
    return assessTaughtYear(clone, state.settings).average;
  }

  const worst = fillAvg(pass);
  const best = fillAvg(100);
  if (worst === null || best === null) return null;

  const failedGraded = graded.filter((m) => (effectiveMark(m) as number) < pass).length;
  const caveat = failedGraded > 0 ? " (you'd still re-sit the module below " + pass + ")" : "";

  let tone: Tone;
  let headline: string;
  if (worst >= req) {
    tone = "pass";
    headline = `Already safe on the average — even if every remaining module just passes (${pass}), your year average clears ${req}${caveat}.`;
  } else if (best < req) {
    tone = "fail";
    headline = `Even top marks on your remaining modules keep the average below ${req} — re-sits will be needed.`;
  } else {
    tone = "warn";
    headline = `Still in your hands — your average will land between ${worst.toFixed(1)} and ${best.toFixed(1)} depending on your remaining marks (you need ${req}).`;
  }
  const c = toneClasses(tone);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Telescope className="size-4 text-brand" /> Best &amp; worst case
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          With your {graded.length} mark{graded.length > 1 ? "s" : ""} in and {pending} still to come:
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border p-3">
            <p className="text-xs text-muted-foreground">If the rest just pass ({pass})</p>
            <p className="tnum text-2xl font-medium leading-none">{worst.toFixed(1)}</p>
          </div>
          <div className="rounded-xl border border-border p-3">
            <p className="text-xs text-muted-foreground">If the rest are perfect (100)</p>
            <p className="tnum text-2xl font-medium leading-none">{best.toFixed(1)}</p>
          </div>
        </div>
        <div className={cn("rounded-lg border p-3 text-sm font-medium", c.softBg, c.border, c.text)}>
          {headline}
        </div>
      </CardContent>
    </Card>
  );
}
