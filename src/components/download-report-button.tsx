"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DownloadReportButton({
  className,
  label = "Download PDF report",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <Button
      className={cn("bg-brand text-brand-foreground hover:bg-brand/90", className)}
      onClick={() => window.print()}
    >
      <Download className="size-4" />
      {label}
    </Button>
  );
}
