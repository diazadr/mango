"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import type { LucideIcon } from "lucide-react";

interface SectionCardProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  badge?: React.ReactNode;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  noPadding?: boolean;
  accent?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function SectionCard({
  title,
  description,
  icon: Icon,
  badge,
  headerAction,
  footer,
  noPadding = false,
  accent = false,
  children,
  className,
}: SectionCardProps) {
  const hasHeader = title || description || badge || headerAction;

  return (
    <Card
      className={cn(
        "overflow-hidden",
        accent && "border-primary/20 bg-primary/[0.02]",
        className
      )}
    >
      {hasHeader && (
        <CardHeader className="border-b border-border/50 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              {title && (
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
                  {Icon && <Icon className="h-4 w-4 text-primary" />}
                  {title}
                </CardTitle>
              )}
              {description && <CardDescription>{description}</CardDescription>}
            </div>
            <div className="flex items-center gap-2">
              {badge}
              {headerAction}
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className={cn(noPadding ? "p-0" : "pt-6")}>
        {children}
      </CardContent>
      {footer && (
        <div className="border-t border-border/50 p-4 bg-muted/20">
          {footer}
        </div>
      )}
    </Card>
  );
}
