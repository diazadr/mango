"use client";

import * as React from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableCell,
  TableHead 
} from "@/src/components/ui/table";

type SortDirection = "asc" | "desc" | null;

interface SortableHeaderProps {
  label: string;
  sortKey: string;
  currentSort: string | null;
  direction: SortDirection;
  onSort: (key: string) => void;
  className?: string;
  align?: "left" | "center" | "right";
}

export function SortableHeader({
  label,
  sortKey,
  currentSort,
  direction,
  onSort,
  className,
  align = "left",
}: SortableHeaderProps) {
  const isSorted = currentSort === sortKey;

  return (
    <TableHead 
      className={cn(
        "cursor-pointer hover:bg-muted/30 transition-colors group select-none py-3 border-b border-border/50",
        align === "center" && "text-center",
        align === "right" && "text-right",
        className
      )}
      onClick={() => onSort(sortKey)}
    >
      <div className={cn(
        "flex items-center gap-1.5",
        align === "center" && "justify-center",
        align === "right" && "justify-end",
      )}>
        <span className="font-medium text-xs text-muted-foreground transition-colors whitespace-nowrap">
          {label}
        </span>
        <span className={cn(
          "transition-colors shrink-0",
          isSorted ? "text-primary" : "text-muted-foreground/30 group-hover:text-muted-foreground/60"
        )}>
          {isSorted ? (
            direction === "asc" ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronsUpDown className="h-3.5 w-3.5" />
          )}
        </span>
      </div>
    </TableHead>
  );
}

interface AdminTableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

export function AdminTable({ children, className, ...props }: AdminTableProps) {
  return (
    <Table className={cn("w-full", className)} {...props}>
      {children}
    </Table>
  );
}

export function AdminTableHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <TableHeader className={cn("bg-muted/5", className)}>
      {children}
    </TableHeader>
  );
}

export function AdminTableHeadCell({ 
  children, 
  className,
  align = "left"
}: { 
  children: React.ReactNode; 
  className?: string;
  align?: "left" | "center" | "right";
}) {
  return (
    <TableHead className={cn(
      "whitespace-nowrap font-medium text-xs text-muted-foreground py-3 border-b border-border/50",
      align === "center" && "text-center",
      align === "right" && "text-right",
      className
    )}>
      {children}
    </TableHead>
  );
}

export function AdminTableBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <TableBody className={className}>
      {children}
    </TableBody>
  );
}

export function AdminTableRow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <TableRow className={cn("hover:bg-muted/30 transition-colors border-b border-border/50", className)}>
      {children}
    </TableRow>
  );
}

export function AdminTableCell({ 
  children, 
  className,
  align = "left"
}: { 
  children: React.ReactNode; 
  className?: string;
  align?: "left" | "center" | "right";
}) {
  return (
    <TableCell className={cn(
      "text-sm py-3",
      align === "center" && "text-center",
      align === "right" && "text-right",
      className
    )}>
      {children}
    </TableCell>
  );
}
