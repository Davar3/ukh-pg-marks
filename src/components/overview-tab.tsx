"use client";

import { useMarks } from "@/hooks/use-marks";
import { adviceForTaughtYear } from "@/lib/advice";
import { assessTaughtYear } from "@/lib/rules";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DownloadReportButton } from "./download-report-button";
import { MetricTiles } from "./metric-tiles";
import { ModuleBarChart } from "./module-bar-chart";
import { StatusLegend } from "./status-legend";
import { StatusRing } from "./status-ring";
import { TargetCalculator } from "./target-calculator";
import { VerdictBanner } from "./verdict-banner";
import { WhatToDo } from "./what-to-do";

export function OverviewTab() {
  const { taughtYear, state } = useMarks();
  if (!taughtYear) return null;

  const a = assessTaughtYear(taughtYear, state.settings);
  const advice = adviceForTaughtYear(taughtYear, state.settings);
  const pending = a.status === "pending" || a.status === "empty";
  const showOverride = a.status === "module-fail" && a.average !== null && a.average >= a.reqAvg;

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-5">
        <StatusRing
          value={a.average}
          tone={a.tone}
          threshold={a.reqAvg}
          sub={`avg / need ${a.reqAvg}`}
          pending={pending}
        />
        {a.pending > 0 && a.graded > 0 && (
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
            provisional · {a.graded} of {a.total} graded
          </span>
        )}
        {showOverride && (
          <p className="text-center text-xs text-fail-strong">
            Average looks fine, but a module is below {a.pass} — that still triggers a re-sit.
          </p>
        )}
      </div>

      <VerdictBanner assessment={a} />
      <MetricTiles assessment={a} />
      <WhatToDo advice={advice} />
      <TargetCalculator />
      <StatusLegend />

      <Accordion>
        <AccordionItem value="chart">
          <AccordionTrigger>Module breakdown</AccordionTrigger>
          <AccordionContent>
            <ModuleBarChart year={taughtYear} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="why">
          <AccordionTrigger>Why this verdict?</AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-muted-foreground">{a.detail}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Module pass 60 · annual average {a.reqAvg} · re-sit to raise the average is capped at
              50% of modules (§5).
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <DownloadReportButton className="w-full" />
    </div>
  );
}
