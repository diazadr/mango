"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";

interface TabSwitchProps {
  tabs: { value: string; label: string }[];
  activeTab: string;
  onTabChange: (value: string) => void;
  className?: string;
}

export function TabSwitch({ tabs, activeTab, onTabChange, className }: TabSwitchProps) {
  return (
    <div className={cn("flex bg-muted p-1 rounded-lg", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onTabChange(tab.value)}
          className={cn(
            "px-4 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer",
            activeTab === tab.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
