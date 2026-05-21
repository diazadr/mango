"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = "Loading...", className }: LoadingStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 gap-3", className)}>
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
    </div>
  );
}

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableSkeleton({ rows = 5, columns = 4, className }: TableSkeletonProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="border-b border-border/50 px-6 py-3 flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-3 bg-muted rounded-md animate-pulse flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="border-b border-border/30 px-6 py-4 flex gap-4">
          {Array.from({ length: columns }).map((_, col) => (
            <div
              key={col}
              className="h-3 bg-muted/60 rounded-md animate-pulse flex-1"
              style={{ animationDelay: `${(row * columns + col) * 50}ms` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

interface CardSkeletonProps {
  count?: number;
  className?: string;
}

export function CardSkeleton({ count = 4, className }: CardSkeletonProps) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-card p-6 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="h-3 w-24 bg-muted rounded-md animate-pulse" />
            <div className="h-8 w-8 bg-muted rounded-lg animate-pulse" />
          </div>
          <div className="h-6 w-16 bg-muted rounded-md animate-pulse" />
          <div className="h-3 w-20 bg-muted/60 rounded-md animate-pulse" />
        </div>
      ))}
    </div>
  );
}
