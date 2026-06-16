import { jsPDF } from "jspdf";
import { adviceForTaughtYear } from "./advice";
import { assessThesis, cumulative, effectiveMark, moduleStatus, semesterAverage } from "./rules";
import { moduleStatusLabel } from "./status";
import type { AppState, TaughtYear, ThesisYear } from "./types";

function fmt(n: number | null): string {
  return n === null ? "—" : n.toFixed(2);
}

const BRAND: [number, number, number] = [21, 99, 158]; // #15639e
const INK: [number, number, number] = [24, 32, 43];
const MUTED: [number, number, number] = [110, 122, 138];
const RULE: [number, number, number] = [216, 222, 230];

/**
 * Builds a one-or-two-page analysis report and triggers a real .pdf download
 * (no browser print dialog). Pure text/vector layout — small and crisp.
 */
export function downloadReport(state: AppState) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentW = pageW - margin * 2;
  let y = margin;

  const ensure = (space: number) => {
    if (y + space > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };
  const text = (
    s: string,
    size: number,
    opts: { bold?: boolean; color?: [number, number, number]; x?: number; align?: "left" | "right" } = {},
  ) => {
    doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...(opts.color ?? INK));
    const lines = doc.splitTextToSize(s, contentW);
    ensure(lines.length * size * 1.35 + 2);
    doc.text(lines, opts.align === "right" ? pageW - margin : (opts.x ?? margin), y, {
      align: opts.align ?? "left",
    });
    y += lines.length * size * 1.35;
  };
  const gap = (h: number) => {
    y += h;
  };
  const divider = () => {
    ensure(10);
    doc.setDrawColor(...RULE);
    doc.setLineWidth(0.8);
    doc.line(margin, y, pageW - margin, y);
    y += 12;
  };

  // ---- header ----
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND);
  doc.text("UNIVERSITY OF KURDISTAN HEWLÊR", margin, y);
  doc.setTextColor(...MUTED);
  doc.setFont("helvetica", "normal");
  doc.text(
    new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }),
    pageW - margin,
    y,
    { align: "right" },
  );
  y += 18;
  text("Postgraduate Marks Analysis", 18, { bold: true });
  const who =
    (state.profile.student || "Student") +
    (state.profile.department ? ` · ${state.profile.department}` : "");
  text(who, 10, { color: MUTED });
  gap(6);
  divider();

  const taught = state.years.find((yy): yy is TaughtYear => yy.type === "taught");
  if (taught) {
    const advice = adviceForTaughtYear(taught, state.settings);
    const a = advice.assessment;
    const passed = Math.max(0, a.graded - a.failedCount);

    text(`${taught.name} — ${a.headline}`, 13, { bold: true });
    text(
      `Annual average ${fmt(a.average)} / need ${a.reqAvg}   ·   Modules passed ${passed}/${a.total}   ·   Graded ${a.graded}/${a.total}`,
      10,
      { color: MUTED },
    );
    gap(8);

    // per-semester tables
    for (const s of taught.semesters) {
      text(`${s.name} — avg ${fmt(semesterAverage(s).average)}`, 11, { bold: true });
      gap(2);
      // table header
      const colMark = pageW - margin - 150;
      const colStatus = pageW - margin - 90;
      ensure(16);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...MUTED);
      doc.text("Module", margin, y);
      doc.text("Mark", colMark, y);
      doc.text("Status", colStatus, y);
      y += 4;
      doc.setDrawColor(...RULE);
      doc.line(margin, y, pageW - margin, y);
      y += 12;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...INK);
      if (s.modules.length === 0) {
        text("No modules.", 10, { color: MUTED });
      }
      for (const m of s.modules) {
        ensure(16);
        const name = m.name?.trim() || "Untitled module";
        doc.setFontSize(10);
        doc.setTextColor(...INK);
        doc.text(doc.splitTextToSize(name, colMark - margin - 8)[0], margin, y);
        const em = effectiveMark(m);
        doc.text(em === null ? "—" : String(em), colMark, y);
        doc.text(moduleStatusLabel[moduleStatus(m, state.settings)], colStatus, y);
        y += 15;
      }
      gap(6);
    }

    // what to do
    text("What to do", 12, { bold: true });
    gap(2);
    for (const r of advice.recs) {
      text(`•  ${r}`, 10);
      gap(2);
    }
    if (advice.resitHint) {
      text(`★  ${advice.resitHint}`, 10, { bold: true, color: BRAND });
    }
    gap(8);
  }

  // thesis (only if assessed)
  const thesisYear = state.years.find((yy): yy is ThesisYear => yy.type === "thesis");
  if (thesisYear) {
    const t = assessThesis(thesisYear, state.settings);
    if (t.status !== "empty") {
      const cum = cumulative(state);
      divider();
      text(`${thesisYear.name} — ${t.headline}`, 13, { bold: true });
      let l = `Thesis mark ${fmt(t.mark)} / need ${t.reqPass}.`;
      if (cum.cumulative !== null)
        l += `   Cumulative degree ${fmt(cum.cumulative)} (coursework 66.67% + dissertation 33.33%).`;
      text(l, 10, { color: MUTED });
      gap(8);
    }
  }

  // footer
  divider();
  text(
    `Pass marks: module ${state.settings.modulePass}, annual average ${state.settings.annualAvg}, dissertation ${state.settings.dissertationPass}. Generated from the UKH PG Handbook 2025–2026. A planning aid only — confirm all decisions with your department and the Academic Registrar's Office.`,
    8,
    { color: MUTED },
  );

  doc.save("ukh-pg-marks-report.pdf");
}
