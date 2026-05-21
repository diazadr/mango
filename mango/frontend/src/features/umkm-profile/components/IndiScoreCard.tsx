"use client";

import React from "react";
import { Zap, Target, Activity } from "lucide-react";
import { Progress } from "@/src/components/ui/progress";

interface IndiScoreCardProps {
  score: number;
  t: any;
}

export const IndiScoreCard = ({ score, t }: IndiScoreCardProps) => {
  // INDI 4.0 Scale: 0 to 4
  const maxScore = 4;
  const percentage = (score / maxScore) * 100;
  
  // Determine level label
  const getLevelLabel = (s: number) => {
    if (s <= 1) return "Level 1: Initial";
    if (s <= 2) return "Level 2: Managed";
    if (s <= 3) return "Level 3: Defined";
    if (s <= 3.5) return "Level 4: Integrated";
    return "Level 5: Optimized";
  };

  return (
    <div className="bg-[#1e477e] dark:bg-card text-white dark:text-foreground rounded-xl p-6 shadow-sm dark:border dark:border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
            <div className="p-2 bg-white/10 dark:bg-primary/10 rounded-lg">
                <Activity size={16} className="text-blue-200 dark:text-primary" />
            </div>
            <div className="space-y-0.5">
                <h4 className="text-sm font-bold leading-none">{t("indi_maturity_level")}</h4>
                <p className="text-[10px] text-blue-200 dark:text-muted-foreground opacity-80">{t("last_assessment")}</p>
            </div>
        </div>
        <div className="text-right">
            <span className="text-2xl font-black">{score.toFixed(1)}</span>
            <span className="text-xs text-blue-200 dark:text-muted-foreground ml-1">/ 4.0</span>
        </div>
      </div>
      
      <Progress value={percentage} className="h-1.5 rounded-full bg-white/10 dark:bg-primary/10" indicatorClassName="bg-blue-400 dark:bg-primary" />
      
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-blue-100 dark:text-foreground">
            <Target size={14} className="text-blue-300 dark:text-primary" />
            <span>{getLevelLabel(score)}</span>
        </div>
        <Zap size={14} className="text-yellow-400 animate-pulse" />
      </div>
    </div>
  );
};
