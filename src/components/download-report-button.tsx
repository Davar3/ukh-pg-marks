"use client";

import { Download } from "lucide-react";
import { toast } from "sonner";
import { useMarks } from "@/hooks/use-marks";
import { downloadReport } from "@/lib/pdf";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DownloadReportButton({
  className,
  label = "Download PDF report",
}: {
  className?: string;
  label?: string;
}) {
  const { state } = useMarks();
  return (
    <Button
      className={cn("bg-brand text-brand-foreground hover:bg-brand/90", className)}
      onClick={() => {
        downloadReport(state);
        toast.success("PDF report downloaded");
      }}
    >
      <Download className="size-4" />
      {label}
    </Button>
  );
}
