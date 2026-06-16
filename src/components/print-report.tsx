"use client";

import * as React from "react";
import { useMarks } from "@/hooks/use-marks";
import { adviceForTaughtYear } from "@/lib/advice";
import { assessThesis, cumulative, effectiveMark, moduleStatus, semesterAverage } from "@/lib/rules";
import { moduleStatusLabel } from "@/lib/status";

function fmt(n: number | null): string {
  return n === null ? "—" : n.toFixed(2);
}

/**
 * Print-only analysis report. Hidden on screen; revealed by the @media print
 * rules in globals.css when the user hits "Download PDF report" (Save as PDF).
 */
export function PrintReport() {
  const { state, taughtYear, thesisYear } = useMarks();
  const [date, setDate] = React.useState("");
  React.useEffect(() => {
    setDate(
      new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }),
    );
  }, []);

  if (!taughtYear) return null;
  const advice = adviceForTaughtYear(taughtYear, state.settings);
  const a = advice.assessment;
  const passed = Math.max(0, a.graded - a.failedCount);
  const thesis = thesisYear ? assessThesis(thesisYear, state.settings) : null;
  const cum = cumulative(state);
  const showThesis = thesis && thesis.status !== "empty";

  return (
    <div className="print-report hidden bg-white p-8 text-zinc-900">
      <div className="mx-auto max-w-2xl">
        <header className="mb-6 flex items-end justify-between border-b border-zinc-300 pb-3">
          <div>
            <h1 className="text-xl font-bold">UKH PG — Marks Analysis</h1>
            <p className="text-sm text-zinc-600">
              {state.profile.student || "Student"}
              {state.profile.department ? ` · ${state.profile.department}` : ""}
            </p>
          </div>
          <p className="text-sm text-zinc-600">{date}</p>
        </header>

        <section className="mb-5">
          <h2 className="text-base font-semibold">
            {taughtYear.name} — {a.headline}
          </h2>
          <p className="mt-1 text-sm">
            Annual average <b>{fmt(a.average)}</b> / need {a.reqAvg} &nbsp;·&nbsp; Modules passed{" "}
            {passed}/{a.total} &nbsp;·&nbsp; Graded {a.graded}/{a.total}
          </p>
        </section>

        {taughtYear.semesters.map((s, si) => (
          <section key={si} className="mb-4">
            <h3 className="mb-1 text-sm font-semibold">
              {s.name} — avg {fmt(semesterAverage(s).average)}
            </h3>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-300 text-left text-zinc-600">
                  <th className="py-1 font-medium">Module</th>
                  <th className="w-20 py-1 font-medium">Mark</th>
                  <th className="w-28 py-1 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {s.modules.length === 0 && (
                  <tr>
                    <td className="py-1 text-zinc-500" colSpan={3}>
                      No modules.
                    </td>
                  </tr>
                )}
                {s.modules.map((m) => (
                  <tr key={m.id} className="border-b border-zinc-100">
                    <td className="py-1">{m.name?.trim() || "Untitled module"}</td>
                    <td className="py-1">{effectiveMark(m) ?? "—"}</td>
                    <td className="py-1">{moduleStatusLabel[moduleStatus(m, state.settings)]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}

        <section className="mb-5">
          <h3 className="mb-1 text-sm font-semibold">What to do</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {advice.recs.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
            {advice.resitHint && <li className="font-medium">{advice.resitHint}</li>}
          </ul>
        </section>

        {showThesis && thesis && (
          <section className="mb-5">
            <h3 className="mb-1 text-sm font-semibold">{thesisYear!.name} — {thesis.headline}</h3>
            <p className="text-sm">
              Thesis mark <b>{fmt(thesis.mark)}</b> / need {thesis.reqPass}.
              {cum.cumulative !== null && (
                <> &nbsp;·&nbsp; Cumulative degree <b>{fmt(cum.cumulative)}</b> (coursework 66.67% + dissertation 33.33%).</>
              )}
            </p>
          </section>
        )}

        <footer className="mt-6 border-t border-zinc-300 pt-3 text-xs text-zinc-500">
          Pass marks: module {state.settings.modulePass}, annual average {state.settings.annualAvg},
          dissertation {state.settings.dissertationPass} (§5). Generated from the UKH PG Handbook
          2025–2026. A planning aid only — confirm all decisions with your department and the
          Academic Registrar’s Office.
        </footer>
      </div>
    </div>
  );
}
