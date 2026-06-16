"use client";

import { toneColorVar } from "@/lib/status";
import type { Tone } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StatusRingProps {
  value: number | null;
  tone: Tone;
  /** threshold tick position (e.g. 70) */
  threshold?: number;
  /** big centre label; defaults to the value to 1dp */
  centerLabel?: string;
  sub?: string;
  size?: number;
  stroke?: number;
  className?: string;
  /** dashed track for provisional/pending */
  pending?: boolean;
}

export function StatusRing({
  value,
  tone,
  threshold,
  centerLabel,
  sub,
  size = 168,
  stroke = 14,
  className,
  pending,
}: StatusRingProps) {
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const has = value !== null && Number.isFinite(value);
  const v = has ? Math.max(0, Math.min(100, value as number)) : 0;
  const dash = circ * (v / 100);
  const color = toneColorVar[tone];

  let tick = null;
  if (threshold != null) {
    const ang = (threshold / 100) * 2 * Math.PI - Math.PI / 2;
    const inner = r - stroke / 2 - 2;
    const outer = r + stroke / 2 + 2;
    tick = (
      <line
        x1={cx + inner * Math.cos(ang)}
        y1={cy + inner * Math.sin(ang)}
        x2={cx + outer * Math.cos(ang)}
        y2={cy + outer * Math.sin(ang)}
        className="stroke-foreground/55"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    );
  }

  const big = centerLabel ?? (has ? (value as number).toFixed(1) : "—");

  return (
    <svg
      className={cn("shrink-0", className)}
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      role="img"
      aria-label={`${sub ?? "value"} ${big}`}
    >
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        strokeWidth={stroke}
        className="stroke-muted"
        strokeDasharray={pending ? "2 7" : undefined}
        strokeLinecap="round"
      />
      {has && (
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          strokeWidth={stroke}
          stroke={color}
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: "stroke-dasharray .4s ease" }}
        />
      )}
      {tick}
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-foreground tnum"
        style={{ fontSize: size * 0.2, fontWeight: 600, letterSpacing: "-0.02em" }}
      >
        {big}
      </text>
      {sub && (
        <text
          x={cx}
          y={cy + size * 0.13}
          textAnchor="middle"
          className="fill-muted-foreground"
          style={{ fontSize: size * 0.072 }}
        >
          {sub}
        </text>
      )}
    </svg>
  );
}
