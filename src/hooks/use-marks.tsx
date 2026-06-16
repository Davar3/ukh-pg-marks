"use client";

import * as React from "react";
import type {
  AppState,
  Module,
  Profile,
  Settings,
  TaughtYear,
  ThesisYear,
} from "@/lib/types";
import {
  defaultState,
  demoState,
  exportJSON as exportJSONImpl,
  importJSON as importJSONImpl,
  load,
  makeModule,
  save,
} from "@/lib/store";

interface MarksContextValue {
  state: AppState;
  hydrated: boolean;
  taughtYear: TaughtYear | undefined;
  thesisYear: ThesisYear | undefined;
  setProfile: (patch: Partial<Profile>) => void;
  setSettings: (patch: Partial<Settings>) => void;
  addModule: (yearIndex: number, semIndex: number) => void;
  updateModule: (id: string, patch: Partial<Module>) => void;
  deleteModule: (id: string) => void;
  setSemesterName: (yearIndex: number, semIndex: number, name: string) => void;
  setYearName: (yearIndex: number, name: string) => void;
  setThesisMark: (mark: number | null) => void;
  resetAll: () => void;
  loadDemo: () => void;
  importState: (raw: string) => void;
  exportJSON: () => string;
}

const MarksContext = React.createContext<MarksContextValue | null>(null);

export function MarksProvider({
  children,
  initialState,
}: {
  children: React.ReactNode;
  /** when provided (e.g. a shared snapshot) the provider is read-only: no localStorage load/save */
  initialState?: AppState;
}) {
  const [state, setState] = React.useState<AppState>(() => initialState ?? defaultState());
  const [hydrated, setHydrated] = React.useState(!!initialState);

  // Load real data on the client only (keeps SSR/first render deterministic).
  React.useEffect(() => {
    if (initialState) return; // shared/read-only view — leave the user's own data untouched
    setState(load());
    setHydrated(true);
  }, [initialState]);

  // Autosave once hydrated (never for a shared snapshot).
  React.useEffect(() => {
    if (hydrated && !initialState) save(state);
  }, [state, hydrated, initialState]);

  const mutate = React.useCallback((fn: (draft: AppState) => void) => {
    setState((prev) => {
      const next = structuredClone(prev);
      fn(next);
      return next;
    });
  }, []);

  const value = React.useMemo<MarksContextValue>(() => {
    return {
      state,
      hydrated,
      taughtYear: state.years.find((y): y is TaughtYear => y.type === "taught"),
      thesisYear: state.years.find((y): y is ThesisYear => y.type === "thesis"),
      setProfile: (patch) => mutate((s) => { s.profile = { ...s.profile, ...patch }; }),
      setSettings: (patch) => mutate((s) => { s.settings = { ...s.settings, ...patch }; }),
      addModule: (yi, si) =>
        mutate((s) => {
          const y = s.years[yi];
          if (y.type === "taught") y.semesters[si].modules.push(makeModule());
        }),
      updateModule: (id, patch) =>
        mutate((s) => {
          for (const y of s.years) {
            if (y.type !== "taught") continue;
            for (const sem of y.semesters) {
              const m = sem.modules.find((mm) => mm.id === id);
              if (m) Object.assign(m, patch);
            }
          }
        }),
      deleteModule: (id) =>
        mutate((s) => {
          for (const y of s.years) {
            if (y.type !== "taught") continue;
            for (const sem of y.semesters) {
              sem.modules = sem.modules.filter((mm) => mm.id !== id);
            }
          }
        }),
      setSemesterName: (yi, si, name) =>
        mutate((s) => {
          const y = s.years[yi];
          if (y.type === "taught") y.semesters[si].name = name;
        }),
      setYearName: (yi, name) => mutate((s) => { s.years[yi].name = name; }),
      setThesisMark: (mark) =>
        mutate((s) => {
          const y = s.years.find((yy): yy is ThesisYear => yy.type === "thesis");
          if (y) y.thesis.mark = mark;
        }),
      resetAll: () => setState(defaultState()),
      loadDemo: () => setState(demoState()),
      importState: (raw) => setState(importJSONImpl(raw)),
      exportJSON: () => exportJSONImpl(state),
    };
  }, [state, hydrated, mutate]);

  return <MarksContext.Provider value={value}>{children}</MarksContext.Provider>;
}

export function useMarks(): MarksContextValue {
  const ctx = React.useContext(MarksContext);
  if (!ctx) throw new Error("useMarks must be used within a MarksProvider");
  return ctx;
}
