"use client";

import { Download } from "lucide-react";
import { toast } from "sonner";
import { useMarks } from "@/hooks/use-marks";
import { downloadReport } from "@/lib/pdf";
import { Button } from "@/components/ui/button";
import { MoreMenu } from "./more-menu";

// NEXT_PUBLIC_* is inlined at build, so the logo resolves under a Pages sub-path too.
const bp = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function AppHeader({ title }: { title: string }) {
  const { state } = useMarks();
  return (
    <header
      className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto flex h-14 w-full max-w-md items-center gap-3 px-4">
        {/* UKH logo on a white backing so the navy wordmark reads in both themes */}
        <a
          href="https://www.ukh.edu.krd"
          target="_blank"
          rel="noopener noreferrer"
          className="flex shrink-0 items-center rounded-md bg-white px-1.5 py-1 ring-1 ring-black/10"
          aria-label="University of Kurdistan Hewlêr"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${bp}/ukh-logo.png`} alt="UKH" className="h-5 w-auto" />
        </a>
        <h1 className="flex-1 truncate text-base font-medium">{title}</h1>
        <Button
          variant="ghost"
          size="icon"
          className="size-9"
          aria-label="Download PDF report"
          onClick={() => {
            downloadReport(state);
            toast.success("PDF report downloaded");
          }}
        >
          <Download className="size-5" />
        </Button>
        <MoreMenu />
      </div>
    </header>
  );
}
