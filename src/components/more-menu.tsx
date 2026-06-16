"use client";

import * as React from "react";
import {
  BookOpen,
  Download,
  EllipsisVertical,
  FolderInput,
  Moon,
  RotateCcw,
  Sparkles,
  Sun,
  SunMoon,
  Upload,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useMarks } from "@/hooks/use-marks";
import { buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const RULES: string[] = [
  "Module pass = 60. Below 60 → automatic re-sit, no limit (§5.i).",
  "Annual average must be ≥ 70 to progress, and every module must be passed (§5).",
  "Passed all modules but average < 70 → you may re-sit up to 50% of modules to raise it (not automatic; PG Re-sit form to ARO). Still < 70 → year failed (§5.ii).",
  "Failing a year = termination. There is no retake in PG (§5.iii).",
  "A re-sit mark is final, even if lower, and is not capped at 60 (§5.v).",
  "Dissertation pass = 70; thesis = Written 30 + Oral 20 + Manuscript 40 + Supervisor 10 (§6).",
  "Module marks round at .5; averages are shown unrounded (§4.2).",
  "Cumulative = coursework 66.67% + dissertation 33.33% (§4.2).",
];

export function MoreMenu() {
  const { theme, setTheme } = useTheme();
  const { state, setSettings, exportJSON, importState, loadDemo, resetAll } = useMarks();
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [rulesOpen, setRulesOpen] = React.useState(false);

  function doExport() {
    const blob = new Blob([exportJSON()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ukh-pg-marks.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Backup exported");
  }

  function doImport(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importState(String(reader.result));
        toast.success("Backup imported");
      } catch {
        toast.error("Import failed — invalid file");
      }
    };
    reader.readAsText(file);
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="More options"
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "size-9")}
        >
          <EllipsisVertical className="size-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuLabel>Theme</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
            <DropdownMenuRadioItem value="light">
              <Sun className="size-4" /> Light
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark">
              <Moon className="size-4" /> Dark
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="system">
              <SunMoon className="size-4" /> System
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => window.print()}>
            <Download className="size-4" /> Download PDF report
          </DropdownMenuItem>
          <DropdownMenuItem onClick={doExport}>
            <Upload className="size-4" /> Export backup (JSON)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => fileRef.current?.click()}>
            <FolderInput className="size-4" /> Import backup
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              loadDemo();
              toast.success("Demo data loaded");
            }}
          >
            <Sparkles className="size-4" /> Load demo data
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setRulesOpen(true)}>
            <BookOpen className="size-4" /> Rules &amp; settings
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              if (confirm("Erase all data on this device and start over?")) {
                resetAll();
                toast.success("Data cleared");
              }
            }}
          >
            <RotateCcw className="size-4" /> Reset all data
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) doImport(f);
          e.target.value = "";
        }}
      />

      <Dialog open={rulesOpen} onOpenChange={setRulesOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rules &amp; settings</DialogTitle>
            <DialogDescription>
              From the UKH PG Student Handbook 2025–2026. Thresholds are editable for departments
              that differ.
            </DialogDescription>
          </DialogHeader>

          <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
            {RULES.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>

          <div className="mt-2 grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="t-mod" className="text-xs">
                Module pass
              </Label>
              <Input
                id="t-mod"
                type="number"
                min={0}
                max={100}
                className="tnum"
                value={state.settings.modulePass}
                onChange={(e) =>
                  setSettings({ modulePass: Math.max(0, Math.min(100, Number(e.target.value) || 60)) })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-avg" className="text-xs">
                Annual avg
              </Label>
              <Input
                id="t-avg"
                type="number"
                min={0}
                max={100}
                className="tnum"
                value={state.settings.annualAvg}
                onChange={(e) =>
                  setSettings({ annualAvg: Math.max(0, Math.min(100, Number(e.target.value) || 70)) })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-dis" className="text-xs">
                Thesis pass
              </Label>
              <Input
                id="t-dis"
                type="number"
                min={0}
                max={100}
                className="tnum"
                value={state.settings.dissertationPass}
                onChange={(e) =>
                  setSettings({
                    dissertationPass: Math.max(0, Math.min(100, Number(e.target.value) || 70)),
                  })
                }
              />
            </div>
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            A planning aid only — confirm decisions with your department and the Academic Registrar’s
            Office. Your data stays in this browser.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
