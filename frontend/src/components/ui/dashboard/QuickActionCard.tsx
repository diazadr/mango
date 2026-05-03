"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface QuickActionCardProps {
  label: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  onClick?: () => void;
  className?: string;
}

export function QuickActionCard({
  label,
  icon: Icon,
  iconColor = "text-primary",
  iconBg = "bg-primary/10",
  onClick,
  className,
}: QuickActionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between p-3.5 rounded-xl",
        "border border-border bg-background",
        "hover:bg-muted/50 hover:border-primary/20",
        "transition-all group text-sm cursor-pointer",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg transition-colors", iconBg, iconColor)}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="font-medium text-foreground group-hover:text-primary transition-colors">
          {label}
        </span>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
    </button>
  );
}
