"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";

interface ProgressBarProps {
  label?: string;
  value: number;
  color?: "primary" | "accent" | "success" | "warning";
  showPercent?: boolean;
  className?: string;
}

const colorMap = {
  primary: "bg-primary",
  accent: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
};

export function ProgressBar({
  label,
  value,
  color = "primary",
  showPercent = true,
  className,
}: ProgressBarProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between text-xs font-medium">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showPercent && <span className="text-foreground">{value}%</span>}
        </div>
      )}
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-border/50">
        <div
          className={cn("h-full rounded-full transition-all duration-500", colorMap[color])}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}
