"use client";

import { ArrowRight, Target } from "lucide-react";
import type { Advice } from "@/lib/advice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function WhatToDo({ advice }: { advice: Advice }) {
  if (advice.recs.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">What to do now</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="space-y-2.5">
          {advice.recs.map((r, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm">
              <ArrowRight className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
        {advice.resitHint && (
          <div className="flex items-start gap-2.5 rounded-lg border border-brand/30 bg-brand/10 px-3 py-2.5 text-sm">
            <Target className="mt-0.5 size-4 shrink-0 text-brand" />
            <span>{advice.resitHint}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
