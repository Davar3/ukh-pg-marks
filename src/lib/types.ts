// Shared data model for the UKH PG marks app.

export type ModuleStatusKey =
  | "pass"
  | "fail"
  | "resit-pass"
  | "resit-fail"
  | "pending";

// Verdict tone used across rings, banners, dots, charts.
export type Tone = "pass" | "warn" | "fail" | "pending" | "neutral";

// Year-level progression status (from the handbook rules engine).
export type YearStatus =
  | "empty"
  | "pending"
  | "module-fail"
  | "avg-below"
  | "pass";

export interface Module {
  id: string;
  name: string;
  /** kept in the model for compatibility; never surfaced (all Master's modules are equal weight) */
  credits: number;
  mark: number | null;
  resit: number | null;
}

export interface Semester {
  name: string;
  modules: Module[];
}

export interface ThesisComponent {
  name: string;
  weight: number;
  mark: number | null;
}

export interface TaughtYear {
  name: string;
  type: "taught";
  semesters: Semester[];
}

export interface ThesisYear {
  name: string;
  type: "thesis";
  thesis: { components: ThesisComponent[] };
}

export type Year = TaughtYear | ThesisYear;

export interface Settings {
  modulePass: number;
  annualAvg: number;
  dissertationPass: number;
  courseworkWeight: number;
  dissertationWeight: number;
}

export interface Profile {
  student: string;
  department: string;
  programme: string;
}

export interface AppState {
  version: number;
  profile: Profile;
  settings: Settings;
  years: Year[];
}

export interface TaughtAssessment {
  status: YearStatus;
  tone: Tone;
  headline: string;
  detail: string;
  average: number | null;
  graded: number;
  pending: number;
  total: number;
  failedCount: number;
  maxResitForAverage: number;
  pass: number;
  reqAvg: number;
}

export interface ThesisAssessment {
  status: "empty" | "pending" | "pass" | "fail";
  tone: Tone;
  headline: string;
  mark: number | null;
  reqPass: number;
  allMarked: boolean;
  weightSum: number;
}

export interface CumulativeResult {
  cumulative: number | null;
  coursework: number | null;
  dissertation: number | null;
  courseworkWeight: number;
  dissertationWeight: number;
}
