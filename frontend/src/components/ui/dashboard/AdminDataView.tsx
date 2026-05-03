"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";

import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";

/* ─── Data Card Container ─── */

export function AdminDataCard({
  children,
  toolbar,
  description,
  className,
}: {
  children: React.ReactNode;
  toolbar?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("bg-card border border-border rounded-xl shadow-sm overflow-hidden", className)}>
      {(toolbar || description) && (
        <div className="p-4 border-b border-border bg-muted/5">
          {toolbar && <div className="mb-3">{toolbar}</div>}
          {description && <div className="text-xs text-muted-foreground">{description}</div>}
        </div>
      )}
      <div className="relative">{children}</div>
    </div>
  );
}

/* ─── Toolbar ─── */

export function AdminToolbar({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex flex-wrap items-center gap-3", className)}>{children}</div>;
}

/* ─── Search Field ─── */

export function AdminSearchField({
  placeholder,
  value,
  onChange,
  className,
  containerClassName,
}: {
  placeholder?: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  containerClassName?: string;
}) {
  return (
    <div className={cn("relative w-full max-w-sm", containerClassName)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
      <input
        type="text"
        placeholder={placeholder || "Search..."}
        value={value}
        onChange={onChange}
        className={cn(
          "h-10 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm transition-all placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 outline-none",
          className
        )}
      />
    </div>
  );
}

/* ─── Search Options ─── */

export type AdminSearchOption = {
  label: string;
  value: string;
};

type AdminSearchFilterProps = {
  options?: AdminSearchOption[];
  selectedOption?: string;
  onOptionChange?: (value: string) => void;
  selectLabel?: string;
  placeholder?: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  containerClassName?: string;
};

export function AdminSearchFilter({
  options,
  selectedOption,
  onOptionChange,
  selectLabel = "Search by",
  className,
  containerClassName,
  ...props
}: AdminSearchFilterProps) {
  const hasOptions = options && options.length > 0 && onOptionChange;

  return (
    <div className={cn("flex w-full max-w-xl items-center gap-2", containerClassName)}>
      {hasOptions && (
        <>
          <label className="sr-only">{selectLabel}</label>
          <select
            value={selectedOption}
            onChange={(event) => onOptionChange(event.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 min-w-[130px] cursor-pointer"
            aria-label={selectLabel}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </>
      )}
      <AdminSearchField className={className} containerClassName="flex-1 max-w-none" {...props} />
    </div>
  );
}

/* ─── Select Filter ─── */

type AdminSelectFilterProps = {
  label: string;
  value: string;
  options: AdminSearchOption[];
  onChange: (value: string) => void;
  className?: string;
};

export function AdminSelectFilter({ label, value, options, onChange, className }: AdminSelectFilterProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 cursor-pointer"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="font-sans">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ─── Empty / Loading States ─── */

type AdminStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  loading?: boolean;
};

export function AdminState({ icon: Icon, title, description, loading }: AdminStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      {loading ? (
        <Icon className="h-6 w-6 text-primary animate-spin" />
      ) : (
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
          <Icon className="h-6 w-6 text-muted-foreground/40" />
        </div>
      )}
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && <p className="text-sm text-muted-foreground text-center max-w-sm">{description}</p>}
    </div>
  );
}

/* ─── Pagination ─── */

type AdminPaginationProps = {
  currentPage: number;
  totalPages: number;
  pageNumbers: number[];
  onPageChange: (page: number) => void;
};

export function AdminPagination({ currentPage, totalPages, pageNumbers, onPageChange }: AdminPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/5">
      <p className="text-xs font-medium text-muted-foreground">
        Halaman {currentPage} dari {totalPages}
      </p>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pageNumbers.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              "inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-medium transition-all cursor-pointer",
              page === currentPage
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ─── Icon Button ─── */

type AdminIconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "default" | "primary" | "destructive";
};

export function AdminIconButton({ className, tone = "default", ...props }: AdminIconButtonProps) {
  return (
    <button
      className={cn(
        "p-2 rounded-lg border border-transparent text-muted-foreground transition-all cursor-pointer",
        tone === "default" && "hover:bg-muted hover:text-foreground",
        tone === "primary" && "hover:text-primary hover:bg-primary/10 hover:border-primary/20",
        tone === "destructive" && "hover:text-destructive hover:bg-destructive/10 hover:border-destructive/20",
        className
      )}
      {...props}
    />
  );
}

/* ─── Dialog ─── */

type AdminDialogProps = {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md";
};

export function AdminDialog({ children, className, size = "md" }: AdminDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div
        className={cn(
          "bg-card border border-border w-full rounded-xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200",
          size === "sm" ? "max-w-sm" : "max-w-md",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

/* ─── Confirm Dialog ─── */

type ConfirmDialogProps = {
  icon?: LucideIcon;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  icon: Icon,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  loading,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <AdminDialog size="sm" className="p-6">
      <div className="flex items-center gap-3 mb-4">
        {Icon && (
          <div className={cn("p-2.5 rounded-xl border", destructive ? "bg-destructive/10 border-destructive/20" : "bg-primary/10 border-primary/20")}>
            <Icon className={cn("h-5 w-5", destructive ? "text-destructive" : "text-primary")} />
          </div>
        )}
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
        </div>
      </div>
      <p className="text-sm text-foreground/80 mb-6">{description}</p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          {cancelLabel}
        </Button>
        <Button
          variant={destructive ? "destructive" : "default"}
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 gap-2"
        >
          {confirmLabel}
        </Button>
      </div>
    </AdminDialog>
  );
}

/* ─── Utilities ─── */

export function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function InitialsAvatar({ name, className }: { name: string; className?: string }) {
  return (
    <div className={cn("w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0", className)}>
      {getInitials(name)}
    </div>
  );
}
