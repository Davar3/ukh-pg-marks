"use client";

import * as React from "react";
import {
  BookOpen,
  Download,
  EllipsisVertical,
  FileText,
  FolderInput,
  type LucideIcon,
  Moon,
  RotateCcw,
  Share2,
  Sparkles,
  Sun,
  SunMoon,
  Upload,
  User,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useMarks } from "@/hooks/use-marks";
import { downloadReport } from "@/lib/pdf";
import { encodeShare } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";
const HANDBOOK_URL =
  "https://www.ukh.edu.krd/wp-content/uploads/2025/12/Student-Handbook-2025-2026-PG.pdf";

const RULES: string[] = [
  "Module pass = 60. Below 60 → automatic re-sit, no limit.",
  "Annual average must be ≥ 70 to progress, and every module must be passed.",
  "Passed all modules but average < 70 → you may re-sit up to 50% of modules to raise it (not automatic; submit the PG Re-sit form to ARO). Still < 70 → the year is failed.",
  "Failing a year = termination. There is no retake in PG.",
  "A re-sit mark is final, even if lower, and is not capped at 60.",
  "Dissertation pass = 70; thesis = Written 30 + Oral 20 + Manuscript 40 + Supervisor 10.",
  "Module marks round at .5; averages are shown unrounded.",
  "Cumulative = coursework 66.67% + dissertation 33.33%.",
];

function MenuRow({
  icon: Icon,
  children,
  onClick,
  destructive,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        destructive && "text-fail-strong hover:bg-fail/10",
      )}
    >
      <Icon className="size-4 shrink-0" />
      {children}
    </button>
  );
}

export function MoreMenu() {
  const { theme, setTheme } = useTheme();
  const { state, setProfile, setSettings, exportJSON, importState, loadDemo, resetAll } = useMarks();
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [rulesOpen, setRulesOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);

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

  const themeOptions: { key: string; label: string; icon: LucideIcon }[] = [
    { key: "light", label: "Light", icon: Sun },
    { key: "dark", label: "Dark", icon: Moon },
    { key: "system", label: "System", icon: SunMoon },
  ];

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="size-9"
        aria-label="Menu"
        onClick={() => setOpen(true)}
      >
        <EllipsisVertical className="size-5" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="mx-auto max-h-[88vh] max-w-md overflow-y-auto rounded-t-[18px]">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
            <SheetDescription className="sr-only">Settings, data and tools</SheetDescription>
          </SheetHeader>

          <div className="space-y-1 px-4 pb-6">
            <p className="mb-1.5 px-1 text-xs font-medium text-muted-foreground">Theme</p>
            <div className="mb-2 grid grid-cols-3 gap-2">
              {themeOptions.map((o) => {
                const Icon = o.icon;
                const active = theme === o.key;
                return (
                  <button
                    key={o.key}
                    type="button"
                    onClick={() => setTheme(o.key)}
                    aria-pressed={active}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-lg border py-2.5 text-xs font-medium transition-colors",
                      active
                        ? "border-brand bg-brand/10 text-brand"
                        : "border-border text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <Icon className="size-4" />
                    {o.label}
                  </button>
                );
              })}
            </div>

            <Separator className="my-2" />

            <MenuRow icon={User} onClick={() => { setOpen(false); setProfileOpen(true); }}>
              Your details
            </MenuRow>
            <MenuRow
              icon={Download}
              onClick={() => {
                downloadReport(state);
                toast.success("PDF report downloaded");
                setOpen(false);
              }}
            >
              Download PDF report
            </MenuRow>
            <MenuRow
              icon={Share2}
              onClick={async () => {
                const url = `${window.location.origin}${BP}/?s=${encodeShare(state)}`;
                try {
                  await navigator.clipboard.writeText(url);
                  toast.success("Share link copied to clipboard");
                } catch {
                  toast.error("Couldn't copy — try again");
                }
              }}
            >
              Share my results (link)
            </MenuRow>
            <MenuRow icon={Upload} onClick={doExport}>
              Export backup (JSON)
            </MenuRow>
            <MenuRow icon={FolderInput} onClick={() => fileRef.current?.click()}>
              Import backup
            </MenuRow>
            <MenuRow
              icon={Sparkles}
              onClick={() => {
                loadDemo();
                toast.success("Demo data loaded");
                setOpen(false);
              }}
            >
              Load demo data
            </MenuRow>

            <Separator className="my-2" />

            <MenuRow
              icon={FileText}
              onClick={() => window.open(HANDBOOK_URL, "_blank", "noopener,noreferrer")}
            >
              Read the handbook (PDF)
            </MenuRow>
            <MenuRow icon={BookOpen} onClick={() => { setOpen(false); setRulesOpen(true); }}>
              Rules &amp; settings
            </MenuRow>
            <MenuRow
              icon={RotateCcw}
              destructive
              onClick={() => {
                if (confirm("Erase all data on this device and start over?")) {
                  resetAll();
                  toast.success("Data cleared");
                  setOpen(false);
                }
              }}
            >
              Reset all data
            </MenuRow>
          </div>
        </SheetContent>
      </Sheet>

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

          <a
            href={HANDBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand underline underline-offset-4"
          >
            <FileText className="size-4" /> Read the full handbook (PDF)
          </a>

          <div className="mt-2 grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="t-mod" className="text-xs">Module pass</Label>
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
              <Label htmlFor="t-avg" className="text-xs">Annual avg</Label>
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
              <Label htmlFor="t-dis" className="text-xs">Thesis pass</Label>
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

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your details</DialogTitle>
            <DialogDescription>
              Shown on your downloaded PDF report. Stored only on this device.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="p-name">Name</Label>
              <Input
                id="p-name"
                value={state.profile.student}
                placeholder="Your name"
                onChange={(e) => setProfile({ student: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-dep">Department / programme</Label>
              <Input
                id="p-dep"
                value={state.profile.department}
                placeholder="e.g. MSc Computer Science"
                onChange={(e) => setProfile({ department: e.target.value })}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
