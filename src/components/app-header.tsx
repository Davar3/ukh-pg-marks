"use client";

import { Download, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MoreMenu } from "./more-menu";

export function AppHeader({ title }: { title: string }) {
  return (
    <header
      className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto flex h-14 w-full max-w-md items-center gap-3 px-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand text-brand-foreground">
          <GraduationCap className="size-5" />
        </div>
        <h1 className="flex-1 truncate text-base font-medium">{title}</h1>
        <Button
          variant="ghost"
          size="icon"
          className="size-9"
          aria-label="Download PDF report"
          onClick={() => window.print()}
        >
          <Download className="size-5" />
        </Button>
        <MoreMenu />
      </div>
    </header>
  );
}
