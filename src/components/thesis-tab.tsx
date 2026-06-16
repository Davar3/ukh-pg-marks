"use client";

import { Award, Lock } from "lucide-react";
import { useMarks } from "@/hooks/use-marks";
import { assessThesis, cumulative } from "@/lib/rules";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusRing } from "./status-ring";

export function ThesisTab() {
  const { state, thesisYear, updateThesisComponent } = useMarks();
  if (!thesisYear) return null;

  const t = assessThesis(thesisYear, state.settings);
  const cum = cumulative(state);

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        <Lock className="mt-0.5 size-4 shrink-0" />
        <p>
          Year 2 is the thesis year. You’re in Year 1 right now — this is here for later. Fill it in
          when you reach your dissertation.
        </p>
      </div>

      <Accordion>
        <AccordionItem value="thesis">
          <AccordionTrigger>Year 2 · Thesis</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4">
              <StatusRing
                value={t.mark}
                tone={t.tone}
                threshold={t.reqPass}
                sub={`thesis / need ${t.reqPass}`}
                pending={t.status === "pending" || t.status === "empty"}
                size={140}
              />
              <p className="text-center text-xs text-muted-foreground">
                Weighted: Written 30 · Oral 20 · Manuscript 40 · Supervisor 10 (§6).
              </p>
            </div>

            {thesisYear.thesis.components.map((c, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <Label className="text-sm">
                  {c.name} <span className="text-muted-foreground">· {c.weight}%</span>
                </Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={100}
                  step={0.1}
                  value={c.mark ?? ""}
                  placeholder="—"
                  className="tnum w-24"
                  onChange={(e) =>
                    updateThesisComponent(i, {
                      mark: e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                />
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="cumulative">
          <AccordionTrigger>Cumulative degree</AccordionTrigger>
          <AccordionContent>
            <Card className="flex-row items-center gap-4 p-4">
              <Award className="size-8 shrink-0 text-brand" />
              <div>
                <p className="tnum text-2xl font-medium leading-none">
                  {cum.cumulative !== null ? cum.cumulative.toFixed(1) : "—"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  coursework 66.67% + dissertation 33.33% (§4.2). Fills in once both halves exist.
                </p>
              </div>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
