"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 gap-3", className)}>
      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-1">
        <Icon className="h-6 w-6 text-muted-foreground/40" />
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && (
        <p className="text-sm text-muted-foreground text-center max-w-sm">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button variant="outline" onClick={onAction} className="mt-3">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
