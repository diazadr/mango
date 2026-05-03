"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import { Badge } from "@/src/components/ui/badge";

const roleMap: Record<string, { variant: "info" | "accent" | "success" | "destructive"; label: string }> = {
  super_admin: { variant: "destructive", label: "super admin" },
  admin: { variant: "accent", label: "admin" },
  advisor: { variant: "info", label: "advisor" },
  umkm: { variant: "success", label: "umkm" },
  upt: { variant: "info", label: "upt" },
};

const statusMap: Record<string, { variant: "success" | "warning" | "destructive" | "secondary"; label: string }> = {
  active: { variant: "success", label: "active" },
  inactive: { variant: "secondary", label: "inactive" },
  pending: { variant: "warning", label: "pending" },
  approved: { variant: "success", label: "approved" },
  rejected: { variant: "destructive", label: "rejected" },
  draft: { variant: "secondary", label: "draft" },
  published: { variant: "success", label: "published" },
  completed: { variant: "success", label: "completed" },
  cancelled: { variant: "destructive", label: "cancelled" },
  running: { variant: "success", label: "running" },
  idle: { variant: "warning", label: "idle" },
  down: { variant: "destructive", label: "down" },
};

interface StatusBadgeProps {
  type: "role" | "status" | "custom";
  value: string;
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "accent" | "info";
  className?: string;
}

export function StatusBadge({ type, value, variant, className }: StatusBadgeProps) {
  let resolvedVariant = variant || "secondary";
  let label = value;

  if (type === "role") {
    const mapped = roleMap[value];
    if (mapped) {
      resolvedVariant = variant || mapped.variant;
      label = mapped.label;
    } else {
      label = value.replace(/_/g, " ");
    }
  } else if (type === "status") {
    const mapped = statusMap[value];
    if (mapped) {
      resolvedVariant = variant || mapped.variant;
      label = mapped.label;
    } else {
      label = value.replace(/_/g, " ");
    }
  }

  return (
    <Badge
      variant={resolvedVariant as any}
      className={cn("capitalize", className)}
    >
      {label}
    </Badge>
  );
}
