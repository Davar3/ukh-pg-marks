/*
 * rules.ts — UKH Postgraduate progression rules engine (pure, no React/DOM).
 *
 * Grounded in the official "Student Handbook 2025-2026 — Postgraduate Programmes":
 *   §4.2 rounding + cumulative weights (Coursework 66.67%, Dissertation 33.33%)
 *   §5   module pass 60, dissertation pass 70, annual average 70, re-sit rules
 *   §6   thesis components (Written 30 / Oral 20 / Manuscript 40 / Supervisor 10)
 *   §7   re-sit covers exam areas; coursework not altered
 *
 * This logic was verified against worked examples before porting from JS.
 */
import type {
  AppState,
  CumulativeResult,
  Module,
  ModuleStatusKey,
  Semester,
  Settings,
  TaughtAssessment,
  TaughtYear,
  ThesisAssessment,
  ThesisYear,
  Year,
} from "./types";

export const DEFAULT_SETTINGS: Settings = {
  modulePass: 60,
  annualAvg: 70,
  dissertationPass: 70,
  courseworkWeight: 2 / 3,
  dissertationWeight: 1 / 3,
};

export function num(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

/** §4.2: module marks round to nearest whole number, x.5 rounds up. */
export function roundMark(v: unknown): number | null {
  const n = num(v);
  if (n === null) return null;
  return Math.round(clamp(n, 0, 100));
}

/** §5.v: a re-sit mark is the FINAL mark (higher or lower) so it always wins. */
export function effectiveMark(m: Module): number | null {
  const resit = num(m.resit);
  const base = resit !== null ? resit : num(m.mark);
  return base === null ? null : roundMark(base);
}

function moduleCredits(m: Module): number {
  const c = num(m.credits);
  return c && c > 0 ? c : 1;
}

export interface AverageResult {
  average: number | null;
  graded: number;
  pending: number;
  total: number;
}

/** Credit-weighted average (== simple mean when credits are equal). Pending skipped. Not rounded. */
export function average(modules: Module[]): AverageResult {
  let weightSum = 0;
  let weightedMarkSum = 0;
  let graded = 0;
  let pending = 0;
  for (const m of modules ?? []) {
    const em = effectiveMark(m);
    if (em === null) {
      pending++;
      continue;
    }
    const c = moduleCredits(m);
    weightSum += c;
    weightedMarkSum += em * c;
    graded++;
  }
  return {
    average: weightSum > 0 ? weightedMarkSum / weightSum : null,
    graded,
    pending,
    total: (modules ?? []).length,
  };
}

export function yearModules(year: Year | undefined): Module[] {
  if (!year || year.type !== "taught") return [];
  return year.semesters.reduce<Module[]>((acc, s) => acc.concat(s.modules ?? []), []);
}

export function moduleStatus(m: Module, settings: Settings = DEFAULT_SETTINGS): ModuleStatusKey {
  const pass = settings.modulePass ?? DEFAULT_SETTINGS.modulePass;
  const em = effectiveMark(m);
  if (em === null) return "pending";
  const hasResit = num(m.resit) !== null;
  if (em >= pass) return hasResit ? "resit-pass" : "pass";
  return hasResit ? "resit-fail" : "fail";
}

export function semesterAverage(semester: Semester | undefined): AverageResult {
  return average(semester ? semester.modules : []);
}

/** §5 taught-year progression assessment. */
export function assessTaughtYear(
  year: TaughtYear,
  settings: Settings = DEFAULT_SETTINGS,
): TaughtAssessment {
  const pass = settings.modulePass ?? DEFAULT_SETTINGS.modulePass;
  const reqAvg = settings.annualAvg ?? DEFAULT_SETTINGS.annualAvg;

  const mods = yearModules(year);
  const avg = average(mods);
  const failed = mods.filter((m) => {
    const em = effectiveMark(m);
    return em !== null && em < pass;
  });

  // §5.ii: re-sit to raise the average is capped at 50% of modules.
  const maxResitForAverage = Math.floor(mods.length / 2);

  let status: TaughtAssessment["status"];
  let tone: TaughtAssessment["tone"];
  let headline: string;
  let detail: string;

  if (mods.length === 0) {
    status = "empty";
    tone = "neutral";
    headline = "No modules added yet";
    detail = "Add your Semester 1 and Semester 2 classes to get started.";
  } else if (avg.pending > 0) {
    status = "pending";
    tone = "pending";
    headline = `${avg.pending} module${avg.pending > 1 ? "s" : ""} not graded yet`;
    detail = `Showing a provisional average from the ${avg.graded} graded module${avg.graded === 1 ? "" : "s"}. The verdict updates once all marks are in.`;
  } else if (failed.length > 0) {
    status = "module-fail";
    tone = "fail";
    headline = "Automatic re-sit required";
    detail = `${failed.length} module${failed.length > 1 ? "s are" : " is"} below ${pass}. Failed modules are re-sat automatically (no limit, §5.i). A failed academic year means termination — there is no retake in PG (§5.iii).`;
  } else if (avg.average !== null && avg.average < reqAvg) {
    status = "avg-below";
    tone = "warn";
    headline = `All modules passed, but average is below ${reqAvg}`;
    detail = `You may request a re-sit on up to ${maxResitForAverage} module${maxResitForAverage === 1 ? "" : "s"} (max 50% of modules) to raise the average (§5.ii). This is NOT automatic — submit the PG Re-sit Request form to ARO. If the average is still below ${reqAvg} afterwards, the year is failed. A re-sit mark is final even if it is lower (§5.v).`;
  } else {
    status = "pass";
    tone = "pass";
    headline = "On track — eligible to progress";
    detail = `All modules are passed and the annual average is at or above ${reqAvg} (§5).`;
  }

  return {
    status,
    tone,
    headline,
    detail,
    average: avg.average,
    graded: avg.graded,
    pending: avg.pending,
    total: mods.length,
    failedCount: failed.length,
    maxResitForAverage,
    pass,
    reqAvg,
  };
}

/** §6 thesis assessment. */
export function assessThesis(
  year: ThesisYear,
  settings: Settings = DEFAULT_SETTINGS,
): ThesisAssessment {
  const reqPass = settings.dissertationPass ?? DEFAULT_SETTINGS.dissertationPass;
  const comps = year?.thesis?.components ?? [];

  let weightSum = 0;
  let weightedSum = 0;
  let anyMark = false;
  let allMarked = comps.length > 0;

  for (const c of comps) {
    const w = num(c.weight) ?? 0;
    weightSum += w;
    const mk = num(c.mark);
    if (mk === null) {
      allMarked = false;
      continue;
    }
    anyMark = true;
    weightedSum += mk * w;
  }

  const mark = allMarked && weightSum > 0 ? weightedSum / weightSum : null;

  let status: ThesisAssessment["status"];
  let tone: ThesisAssessment["tone"];
  let headline: string;

  if (!anyMark && !allMarked) {
    status = "empty";
    tone = "neutral";
    headline = "Thesis not assessed yet";
  } else if (!allMarked) {
    status = "pending";
    tone = "pending";
    headline = "Thesis partially assessed";
  } else if (mark !== null && mark >= reqPass) {
    status = "pass";
    tone = "pass";
    headline = "Thesis passed";
  } else {
    status = "fail";
    tone = "fail";
    headline = `Thesis below the ${reqPass} pass mark`;
  }

  return { status, tone, headline, mark, reqPass, allMarked, weightSum };
}

/** §4.2 cumulative degree average: coursework 66.67% + dissertation 33.33%. */
export function cumulative(state: AppState): CumulativeResult {
  const settings = state.settings ?? DEFAULT_SETTINGS;
  const cwWeight = settings.courseworkWeight ?? DEFAULT_SETTINGS.courseworkWeight;
  const disWeight = settings.dissertationWeight ?? DEFAULT_SETTINGS.dissertationWeight;

  const taught = (state.years ?? []).filter(
    (y): y is TaughtYear => y.type === "taught",
  );
  const allTaught = taught.reduce<Module[]>((acc, y) => acc.concat(yearModules(y)), []);
  const coursework = average(allTaught).average;

  const thesisYear = (state.years ?? []).find(
    (y): y is ThesisYear => y.type === "thesis",
  );
  const dissertation = thesisYear ? assessThesis(thesisYear, settings).mark : null;

  let cum: number | null = null;
  if (coursework !== null && dissertation !== null) {
    cum = coursework * cwWeight + dissertation * disWeight;
  }

  return {
    cumulative: cum,
    coursework,
    dissertation,
    courseworkWeight: cwWeight,
    dissertationWeight: disWeight,
  };
}
