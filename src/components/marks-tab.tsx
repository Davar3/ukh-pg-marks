"use client";

import * as React from "react";
import { GraduationCap, Plus } from "lucide-react";
import { useMarks } from "@/hooks/use-marks";
import { semesterAverage } from "@/lib/rules";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditMarkSheet } from "./edit-mark-sheet";
import { EmptyState } from "./empty-state";
import { ModuleRow } from "./module-row";

export function MarksTab() {
  const { state, taughtYear, addModule } = useMarks();
  const [editing, setEditing] = React.useState<string | null>(null);
  const [seg, setSeg] = React.useState("0");

  if (!taughtYear) return null;
  const yearIndex = state.years.findIndex((y) => y.type === "taught");

  return (
    <div className="space-y-4">
      <Tabs value={seg} onValueChange={(v) => setSeg(String(v))}>
        <TabsList className="grid w-full grid-cols-2">
          {taughtYear.semesters.map((s, i) => (
            <TabsTrigger key={i} value={String(i)}>
              {s.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {taughtYear.semesters.map((s, i) => {
          const sa = semesterAverage(s);
          return (
            <TabsContent key={i} value={String(i)} className="mt-3 space-y-2">
              <p className="px-1 text-xs text-muted-foreground">
                {s.modules.length
                  ? `${sa.graded}/${sa.total} graded · avg ${sa.average !== null ? sa.average.toFixed(1) : "—"}`
                  : "No modules yet"}
              </p>

              {s.modules.length === 0 ? (
                <EmptyState
                  icon={GraduationCap}
                  title={`Add your ${s.name} classes`}
                  description="Add a module, then enter its mark when you receive it."
                  actionLabel="Add module"
                  onAction={() => addModule(yearIndex, i)}
                />
              ) : (
                <>
                  {s.modules.map((m) => (
                    <ModuleRow key={m.id} module={m} onEdit={setEditing} />
                  ))}
                  <Button
                    variant="outline"
                    className="w-full border-dashed text-muted-foreground"
                    onClick={() => addModule(yearIndex, i)}
                  >
                    <Plus className="size-4" />
                    Add module
                  </Button>
                </>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      <EditMarkSheet
        moduleId={editing}
        open={editing !== null}
        onOpenChange={(o) => {
          if (!o) setEditing(null);
        }}
      />
    </div>
  );
}
