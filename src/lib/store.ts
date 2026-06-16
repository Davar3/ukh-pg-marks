import type { AppState, Module } from "./types";

export const STORAGE_KEY = "ukh_pg_marks_v1";
const VERSION = 1;

let uidCounter = 0;
export function uid(prefix = "mod"): string {
  uidCounter += 1;
  const t = typeof Date !== "undefined" ? Date.now().toString(36) : "0";
  return `${prefix}_${t}_${uidCounter.toString(36)}`;
}

export function makeModule(name = ""): Module {
  return { id: uid("mod"), name, credits: 1, mark: null, resit: null };
}

// Deterministic ids in the default state so server and client first render agree.
export function defaultState(): AppState {
  const mod = (yi: number, si: number, i: number): Module => ({
    id: `y${yi}s${si}m${i}`,
    name: "",
    credits: 1,
    mark: null,
    resit: null,
  });
  return {
    version: VERSION,
    profile: { student: "", department: "", programme: "MSc / MA" },
    settings: {
      modulePass: 60,
      annualAvg: 70,
      dissertationPass: 70,
      courseworkWeight: 2 / 3,
      dissertationWeight: 1 / 3,
    },
    years: [
      {
        name: "Year 1",
        type: "taught",
        semesters: [
          { name: "Semester 1", modules: [mod(0, 0, 0), mod(0, 0, 1), mod(0, 0, 2), mod(0, 0, 3)] },
          { name: "Semester 2", modules: [mod(0, 1, 0), mod(0, 1, 1), mod(0, 1, 2), mod(0, 1, 3)] },
        ],
      },
      {
        name: "Year 2",
        type: "thesis",
        thesis: {
          components: [
            { name: "Written Test", weight: 30, mark: null },
            { name: "Oral Examination", weight: 20, mark: null },
            { name: "Manuscript", weight: 40, mark: null },
            { name: "Supervisor's Assessment", weight: 10, mark: null },
          ],
        },
      },
    ],
  };
}

export function demoState(): AppState {
  const s = defaultState();
  s.profile = { student: "Sample Student", department: "MSc Data Science", programme: "MSc / MA" };
  const y0 = s.years[0];
  if (y0.type === "taught") {
    const s1 = ["Research Methods", "Statistics", "Programming", "Databases"];
    const s2 = ["Machine Learning", "Big Data", "Visualisation", "Ethics"];
    const m1 = [74, 68, 81, 59];
    const m2 = [72, 70, 77, 65];
    y0.semesters[0].modules.forEach((m, i) => { m.name = s1[i]; m.mark = m1[i]; });
    y0.semesters[1].modules.forEach((m, i) => { m.name = s2[i]; m.mark = m2[i]; });
  }
  return s;
}

// Fill in anything missing so older/partial saves still load cleanly.
export function migrate(state: unknown): AppState {
  if (!state || typeof state !== "object") return defaultState();
  const base = defaultState();
  const s = state as Partial<AppState>;
  const merged: AppState = {
    version: VERSION,
    profile: { ...base.profile, ...(s.profile ?? {}) },
    settings: { ...base.settings, ...(s.settings ?? {}) },
    years: Array.isArray(s.years) && s.years.length > 0 ? (s.years as AppState["years"]) : base.years,
  };
  merged.years.forEach((y) => {
    if (y.type === "taught") {
      y.semesters?.forEach((sem) => {
        sem.modules?.forEach((m) => {
          if (!m.id) m.id = uid("mod");
          if (m.credits == null) m.credits = 1;
        });
      });
    }
  });
  return merged;
}

export function load(): AppState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return migrate(JSON.parse(raw));
  } catch {
    return defaultState();
  }
}

export function save(state: AppState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota / private mode — ignore */
  }
}

export function clear(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function exportJSON(state: AppState): string {
  return JSON.stringify(state, null, 2);
}

export function importJSON(text: string): AppState {
  return migrate(JSON.parse(text));
}

// ---- shareable read-only links (state encoded in the URL, base64url) ----
export function encodeShare(state: AppState): string {
  return btoa(encodeURIComponent(JSON.stringify(state)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function decodeShare(s: string): AppState {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  return migrate(JSON.parse(decodeURIComponent(atob(b64))));
}
