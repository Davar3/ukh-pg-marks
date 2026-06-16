"use client";

import { moduleStatusLabel, moduleTone, toneClasses } from "@/lib/status";
import type { ModuleStatusKey } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StatusPillProps {
  status: ModuleStatusKey;
  mark?: number | null;
  className?: string;
}

/** A small pill: coloured dot + one-word label + optional mark. Colour is never the only signal. */
export function StatusPill({ status, mark, className }: StatusPillProps) {
  const tone = moduleTone(status);
  const c = toneClasses(tone);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        c.softBg,
        c.text,
        className,
      )}
    >
      <span className={cn("size-2 rounded-full", c.dot)} aria-hidden />
      {moduleStatusLabel[status]}
      {mark != null && status !== "pending" ? <span className="tnum">{mark}</span> : null}
    </span>
  );
}

/** Just the coloured dot (for tight rows). */
export function StatusDot({ status, className }: { status: ModuleStatusKey; className?: string }) {
  const c = toneClasses(moduleTone(status));
  return <span className={cn("size-2.5 rounded-full", c.dot, className)} aria-hidden />;
}
