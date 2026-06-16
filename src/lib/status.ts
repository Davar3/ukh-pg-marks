import type { ModuleStatusKey, Tone } from "./types";

export const moduleStatusLabel: Record<ModuleStatusKey, string> = {
  pass: "Pass",
  fail: "Fail",
  "resit-pass": "Re-sit ✓",
  "resit-fail": "Re-sit ✗",
  pending: "Pending",
};

export function moduleTone(s: ModuleStatusKey): Tone {
  switch (s) {
    case "pass":
    case "resit-pass":
      return "pass";
    case "fail":
    case "resit-fail":
      return "fail";
    default:
      return "pending";
  }
}

/** Literal CSS colour for inline styles / recharts fills. */
export const toneColorVar: Record<Tone, string> = {
  pass: "var(--color-pass)",
  warn: "var(--color-warn)",
  fail: "var(--color-fail)",
  pending: "var(--color-pending)",
  neutral: "var(--color-pending)",
};

interface ToneClasses {
  text: string;
  dot: string;
  softBg: string;
  border: string;
}

const TONE_CLASSES: Record<Tone, ToneClasses> = {
  pass: { text: "text-pass", dot: "bg-pass", softBg: "bg-pass/10", border: "border-pass/30" },
  warn: { text: "text-warn", dot: "bg-warn", softBg: "bg-warn/10", border: "border-warn/30" },
  fail: { text: "text-fail", dot: "bg-fail", softBg: "bg-fail/10", border: "border-fail/30" },
  pending: {
    text: "text-muted-foreground",
    dot: "bg-pending",
    softBg: "bg-muted",
    border: "border-border",
  },
  neutral: {
    text: "text-muted-foreground",
    dot: "bg-muted-foreground/40",
    softBg: "bg-muted",
    border: "border-border",
  },
};

export function toneClasses(tone: Tone): ToneClasses {
  return TONE_CLASSES[tone];
}
