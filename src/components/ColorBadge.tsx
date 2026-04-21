"use client";

interface ColorBadgeProps {
  value: number;
  thresholds: { green: number; yellow: number };
  invert?: boolean;
  suffix?: string;
  formatter?: (value: number) => string;
}

export default function ColorBadge({ value, thresholds, invert = false, suffix = "", formatter }: ColorBadgeProps) {
  let color: string;
  if (invert) {
    color = value >= thresholds.green ? "text-accent-green" : value >= thresholds.yellow ? "text-accent-yellow" : "text-accent-red";
  } else {
    color = value <= thresholds.green ? "text-accent-green" : value <= thresholds.yellow ? "text-accent-yellow" : "text-accent-red";
  }

  return <span className={`font-mono ${color}`}>{formatter ? formatter(value) : `${value}${suffix}`}</span>;
}