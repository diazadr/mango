"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { TrendingUp } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendIcon?: LucideIcon;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  accent?: boolean;
  className?: string;
}

export function MetricCard({
  title,
  value,
  trend,
  trendIcon: TrendIcon = TrendingUp,
  icon: Icon,
  iconColor = "text-primary",
  iconBg = "bg-primary/10",
  accent = false,
  className,
}: MetricCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden transition-all",
        accent && "border-accent/30 bg-accent/[0.03]",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className={cn("p-2 rounded-lg", iconBg)}>
          <Icon className={cn("h-4 w-4", iconColor)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-semibold text-foreground", accent && "text-accent")}>
          {value}
        </div>
        {trend && (
          <p className={cn("text-xs font-medium mt-1 flex items-center gap-1", iconColor)}>
            <TrendIcon className="h-3 w-3" />
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
