"use client";

import * as React from "react";
import { Target } from "lucide-react";
import { useMarks } from "@/hooks/use-marks";
import { effectiveMark, yearModules } from "@/lib/rules";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** "What mark do I need in my remaining modules to hit an average of X?" */
export function TargetCalculator() {
  const { taughtYear, state } = useMarks();
  const [target, setTarget] = React.useState<number>(state.settings.annualAvg || 70);

  if (!taughtYear) return null;
  const mods = yearModules(taughtYear);
  const total = mods.length;
  if (total === 0) return null;

  const graded = mods.filter((m) => effectiveMark(m) !== null);
  const gradedSum = graded.reduce((s, m) => s + (effectiveMark(m) as number), 0);
  const pending = total - graded.length;
  const currentAvg = graded.length ? gradedSum / graded.length : null;

  let message: React.ReactNode;
  let tone: "pass" | "warn" | "fail" | "muted" = "muted";

  if (pending === 0) {
    if (currentAvg !== null && currentAvg >= target) {
      message = `Your average (${currentAvg.toFixed(1)}) is already at or above ${target}. ✓`;
      tone = "pass";
    } else {
      message = `All modules are graded, so the average can only change through a re-sit — you'd need to re-sit a module to reach ${target}.`;
      tone = "warn";
    }
  } else {
    const perPending = (target * total - gradedSum) / pending;
    if (perPending <= 0) {
      message = `You're already on track for ${target} — even blank remaining modules keep you there.`;
      tone = "pass";
    } else if (perPending > 100) {
      message = `Even 100 in all ${pending} remaining module${pending > 1 ? "s" : ""} wouldn't reach ${target} — you'd also need to re-sit a graded module.`;
      tone = "fail";
    } else {
      message = (
        <>
          You need about <b className="tnum">{Math.ceil(perPending)}</b> in each of your{" "}
          <b>{pending}</b> remaining module{pending > 1 ? "s" : ""} to reach an average of{" "}
          <b>{target}</b>.
        </>
      );
      tone = perPending >= 80 ? "warn" : "pass";
    }
  }

  const presets = [70, 75, 80];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="size-4 text-brand" /> What do I need?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2" role="group" aria-label="Target average">
          {presets.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTarget(t)}
              aria-pressed={target === t}
              className={cn(
                "tnum flex-1 rounded-lg border py-2 text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                target === t
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border text-muted-foreground hover:bg-muted",
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <p
          className={cn(
            "text-sm",
            tone === "pass" && "text-pass-strong",
            tone === "warn" && "text-warn-strong",
            tone === "fail" && "text-fail-strong",
          )}
        >
          {message}
        </p>
      </CardContent>
    </Card>
  );
}
