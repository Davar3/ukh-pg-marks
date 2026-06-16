"use client";

import { CircleCheck, Clock, RotateCcw, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toneClasses } from "@/lib/status";
import type { TaughtAssessment, Tone } from "@/lib/types";
import { cn } from "@/lib/utils";

const ICONS: Record<Tone, LucideIcon> = {
  pass: CircleCheck,
  fail: RotateCcw,
  warn: TrendingUp,
  pending: Clock,
  neutral: Clock,
};

export function VerdictBanner({ assessment }: { assessment: TaughtAssessment }) {
  const c = toneClasses(assessment.tone);
  const Icon = ICONS[assessment.tone];
  return (
    <div className={cn("flex items-start gap-3 rounded-xl border p-4", c.softBg, c.border)}>
      <Icon className={cn("mt-0.5 size-5 shrink-0", c.text)} />
      <div className="space-y-1">
        <p className={cn("font-medium", c.text)}>{assessment.headline}</p>
        <p className="text-sm text-muted-foreground">{assessment.detail}</p>
      </div>
    </div>
  );
}
