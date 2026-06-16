"use client";

import { ChevronRight } from "lucide-react";
import { useMarks } from "@/hooks/use-marks";
import { effectiveMark, moduleStatus } from "@/lib/rules";
import { moduleStatusLabel, moduleTone, toneClasses } from "@/lib/status";
import type { Module } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ModuleRow({ module, onEdit }: { module: Module; onEdit: (id: string) => void }) {
  const { state } = useMarks();
  const status = moduleStatus(module, state.settings);
  const em = effectiveMark(module);
  const c = toneClasses(moduleTone(status));
  const name = module.name?.trim() || "Untitled module";

  return (
    <button
      type="button"
      onClick={() => onEdit(module.id)}
      className="group flex min-h-16 w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <span className={cn("size-2.5 shrink-0 rounded-full", c.dot)} aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{name}</span>
        <span className={cn("text-xs", c.text)}>{moduleStatusLabel[status]}</span>
      </span>
      <span className="tnum text-lg font-medium">{em ?? "—"}</span>
      <ChevronRight className="size-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}
