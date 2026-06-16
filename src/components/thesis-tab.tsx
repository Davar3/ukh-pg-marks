"use client";

import { useMarks } from "@/hooks/use-marks";
import { assessTaughtYear, assessThesis, cumulative, num } from "@/lib/rules";
import { toneClasses } from "@/lib/status";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusRing } from "./status-ring";
import { cn } from "@/lib/utils";

export function ThesisTab() {
  const { state, taughtYear, thesisYear, setThesisMark } = useMarks();
  if (!thesisYear) return null;

  const t = assessThesis(thesisYear, state.settings);
  const cum = cumulative(state);
  const req = state.settings.annualAvg;

  const year1 = taughtYear ? assessTaughtYear(taughtYear, state.settings) : null;
  const courseworkComplete = !!year1 && year1.total > 0 && year1.pending === 0;
  const hasThesis = t.mark !== null;
  const showFinal = courseworkComplete && hasThesis && cum.cumulative !== null;
  const finalTone = cum.cumulative !== null && cum.cumulative >= req ? "pass" : "warn";
  const tc = toneClasses(t.tone);

  return (
    <div className="space-y-4">
      {/* Thesis mark */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Year 2 — Thesis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Input
              id="thesis-mark"
              type="number"
              inputMode="numeric"
              min={0}
              max={100}
              step={0.1}
              value={thesisYear.thesis.mark ?? ""}
              placeholder="—"
              className="tnum h-14 text-center text-2xl font-medium"
              onChange={(e) => setThesisMark(num(e.target.value))}
              aria-label="Thesis mark"
            />
            <span className="text-lg text-muted-foreground">/ 100</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Your overall dissertation mark.</p>
            {hasThesis && (
              <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", tc.softBg, tc.text)}>
                {t.status === "pass" ? `Passed (≥${t.reqPass})` : `Below ${t.reqPass}`}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Final degree average */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Final degree average</CardTitle>
        </CardHeader>
        <CardContent>
          {showFinal ? (
            <div className="flex flex-col items-center gap-3">
              <StatusRing
                value={cum.cumulative}
                tone={finalTone}
                threshold={req}
                sub={`final / need ${req}`}
                size={172}
              />
              <div className="w-full rounded-lg bg-muted/50 p-3 text-center text-sm">
                Coursework <b className="tnum">{cum.coursework!.toFixed(1)}</b> × 66.67% &nbsp;+&nbsp;
                Thesis <b className="tnum">{cum.dissertation}</b> × 33.33%
              </div>
              <p
                className={cn(
                  "text-center text-sm font-medium",
                  finalTone === "pass" ? "text-pass-strong" : "text-warn-strong",
                )}
              >
                {cum.cumulative! >= req
                  ? `Your final degree average is ${cum.cumulative!.toFixed(1)} — at or above ${req}.`
                  : `Your final degree average is ${cum.cumulative!.toFixed(1)} — below ${req}.`}
              </p>
            </div>
          ) : (
            <div className="space-y-3 rounded-xl border border-dashed border-border bg-muted/30 p-5 text-center text-sm text-muted-foreground">
              <p>Your full degree average appears here once both halves are in.</p>
              <div className="flex justify-center gap-5 text-xs">
                <span className={courseworkComplete ? "text-pass-strong" : ""}>
                  {courseworkComplete ? "✓" : "•"} Year 1 marks complete
                </span>
                <span className={hasThesis ? "text-pass-strong" : ""}>
                  {hasThesis ? "✓" : "•"} Thesis mark entered
                </span>
              </div>
            </div>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            Final = coursework 66.67% + thesis 33.33%. To graduate you also need to pass Year 1 and a
            thesis of at least {t.reqPass}.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
