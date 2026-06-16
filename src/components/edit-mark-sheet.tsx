"use client";

import { RotateCcw, Trash2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { useMarks } from "@/hooks/use-marks";
import { num } from "@/lib/rules";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface EditMarkSheetProps {
  moduleId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditMarkSheet({ moduleId, open, onOpenChange }: EditMarkSheetProps) {
  const { state, updateModule, deleteModule } = useMarks();

  const mod =
    moduleId == null
      ? undefined
      : state.years
          .flatMap((y) => (y.type === "taught" ? y.semesters.flatMap((s) => s.modules) : []))
          .find((m) => m.id === moduleId);

  const pass = state.settings.modulePass;
  const markVal = mod ? num(mod.mark) : null;
  const resitVal = mod ? num(mod.resit) : null;

  const belowPass = markVal !== null && markVal < pass && resitVal === null;
  const hasResit = resitVal !== null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="mx-auto max-w-md rounded-t-[18px]">
        <SheetHeader>
          <SheetTitle>Edit module</SheetTitle>
          <SheetDescription>Leave a mark blank if it hasn’t been released yet.</SheetDescription>
        </SheetHeader>

        {mod && (
          <div className="flex flex-col gap-4 px-4">
            <div className="space-y-1.5">
              <Label htmlFor="m-name">Class / module name</Label>
              <Input
                id="m-name"
                value={mod.name}
                placeholder="e.g. Research Methods"
                onChange={(e) => updateModule(mod.id, { name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="m-mark">Mark</Label>
                <Input
                  id="m-mark"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={100}
                  step={0.1}
                  value={mod.mark ?? ""}
                  placeholder="—"
                  className="tnum"
                  onChange={(e) =>
                    updateModule(mod.id, {
                      mark: e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-resit" className="text-muted-foreground">
                  Re-sit <span className="font-normal">(optional)</span>
                </Label>
                <Input
                  id="m-resit"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={100}
                  step={0.1}
                  value={mod.resit ?? ""}
                  placeholder="—"
                  className="tnum border-dashed"
                  onChange={(e) =>
                    updateModule(mod.id, {
                      resit: e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            {belowPass && (
              <div className="flex items-start gap-2 rounded-lg border border-fail/30 bg-fail/10 px-3 py-2 text-sm text-fail">
                <RotateCcw className="mt-0.5 size-4 shrink-0" />
                <span>Below {pass} → this module is re-sat automatically (no limit, §5.i).</span>
              </div>
            )}
            {hasResit && (
              <div className="flex items-start gap-2 rounded-lg border border-warn/30 bg-warn/10 px-3 py-2 text-sm text-warn">
                <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                <span>A re-sit mark is final — it replaces the original even if it is lower (§5.v).</span>
              </div>
            )}

            <Button
              variant="ghost"
              className="justify-start text-fail hover:bg-fail/10 hover:text-fail"
              onClick={() => {
                deleteModule(mod.id);
                toast.success("Module removed");
                onOpenChange(false);
              }}
            >
              <Trash2 className="size-4" />
              Remove module
            </Button>
          </div>
        )}

        <SheetFooter>
          <Button
            className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
            onClick={() => onOpenChange(false)}
          >
            Done
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
