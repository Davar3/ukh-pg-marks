import { assessTaughtYear, effectiveMark, num, yearModules } from "./rules";
import type { Settings, TaughtAssessment, TaughtYear } from "./types";

export interface Advice {
  assessment: TaughtAssessment;
  recs: string[];
  /** the re-sit simulator hint, if applicable */
  resitHint: string | null;
}

function fmt(n: number | null): string {
  return n === null ? "—" : n.toFixed(2);
}

/**
 * Turns a taught year into concrete, plain-language next steps + a re-sit
 * simulator hint. Shared by the on-screen "What to do" panel and the PDF report.
 */
export function adviceForTaughtYear(year: TaughtYear, settings: Settings): Advice {
  const a = assessTaughtYear(year, settings);
  const pass = settings.modulePass;
  const req = settings.annualAvg;
  const mods = yearModules(year);
  const graded = mods.filter((m) => effectiveMark(m) !== null);
  const recs: string[] = [];
  let resitHint: string | null = null;

  if (a.status === "empty") {
    recs.push("Add your Semester 1 and Semester 2 classes and enter marks as you receive them.");
    return { assessment: a, recs, resitHint };
  }

  if (a.status === "pending") {
    recs.push(
      `${a.pending} module${a.pending > 1 ? "s are" : " is"} not graded yet — this verdict is provisional (average so far: ${fmt(a.average)}).`,
    );
  }

  const failed = graded
    .filter((m) => (effectiveMark(m) as number) < pass)
    .sort((x, y) => (effectiveMark(x) as number) - (effectiveMark(y) as number));

  if (failed.length) {
    recs.push(
      `Automatic re-sit (no limit, §5.i) for: ${failed
        .map((m) => `${m.name || "Untitled module"} (${effectiveMark(m)})`)
        .join(", ")}. Re-sits cover the exam areas; coursework marks stay (§7), and a re-sit mark is final even if it is lower (§5.v).`,
    );
    recs.push(
      "A failed academic year leads to termination — there is no retake in PG (§5.iii) — so prioritise these re-sits.",
    );
  }

  if (!failed.length && a.average !== null && a.average < req && a.pending === 0) {
    const n = graded.length;
    const deficit = (req - a.average) * n;
    const lowest = graded
      .slice()
      .sort((x, y) => (effectiveMark(x) as number) - (effectiveMark(y) as number))
      .slice(0, a.maxResitForAverage);

    recs.push(
      `You passed every module, but your annual average (${fmt(a.average)}) is below ${req}. You may request a re-sit on up to ${a.maxResitForAverage} module${a.maxResitForAverage === 1 ? "" : "s"} (max 50% of modules) to raise it — not automatic; submit the PG Re-sit Request form to ARO (§5.ii).`,
    );
    const used = graded.filter((m) => num(m.resit) !== null).length;
    const remaining = Math.max(0, a.maxResitForAverage - used);
    recs.push(
      `Re-sit allowance: ${used} entered of ${a.maxResitForAverage} allowed — ${remaining} remaining${remaining === 0 ? " (you've reached the 50% cap)" : ""}.`,
    );
    recs.push(
      `You need about ${Math.ceil(deficit)} more total mark-points across the year. Best candidates (your lowest passed modules): ${lowest
        .map((m) => `${m.name || "Untitled module"} (${effectiveMark(m)})`)
        .join(", ")}.`,
    );
    recs.push(
      "Caution: a re-sit mark replaces the original even if it is lower (§5.v) — only re-sit where you are confident of improving.",
    );

    if (lowest.length) {
      const low = lowest[0];
      const sum = graded.reduce((s, m) => s + (effectiveMark(m) as number), 0);
      const needed = req * n - sum + (effectiveMark(low) as number);
      resitHint =
        needed <= 100
          ? `Re-sitting just ${low.name || "your lowest module"} to ≥ ${Math.ceil(needed)} would lift your average to ${req}.`
          : `One re-sit alone can't reach ${req} — you'd need to improve at least two modules.`;
    }
  }

  if (a.status === "pass") {
    recs.push(
      `On track: every module is passed and your average (${fmt(a.average)}) is at or above ${req}. You're eligible to progress to Year 2 (thesis).`,
    );
  }

  return { assessment: a, recs, resitHint };
}
