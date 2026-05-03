"use client";

import React from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Progress } from "@/src/components/ui/progress";

interface ProfileCompletenessProps {
  umkm: any;
  t: any;
}

export const ProfileCompleteness = ({ umkm, t }: ProfileCompletenessProps) => {
  const fields = [
    { key: "logo_url", weight: 20 },
    { key: "name", weight: 5 },
    { key: "sector", weight: 5 },
    { key: "phone", weight: 5 },
    { key: "address", weight: 5 },
    { key: "nib", weight: 10 },
    { key: "legal_entity_type", isProfile: false, weight: 5 },
    { key: "established_year", isProfile: false, weight: 5 },
  ];

  let completedWeight = 0;
  fields.forEach(field => {
    let value = field.isProfile ? umkm.profile?.[field.key] : umkm[field.key];
    
    // Check for logo placeholder
    if (field.key === "logo_url" && value?.includes('placeholders')) {
        value = null;
    }

    if (value && value !== "" && value !== 0) {
      completedWeight += field.weight;
    }
  });

  const percentage = Math.min(completedWeight, 100);

  return (
    <div className="bg-white border border-border/50 rounded-xl p-6 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-foreground leading-none">{t("profile_completeness")}</h4>
          <p className="text-xs text-muted-foreground leading-snug">{t("profile_completeness_desc")}</p>
        </div>
        <span className="text-2xl font-black text-primary ml-4">{percentage}%</span>
      </div>
      
      <Progress value={percentage} className="h-1.5 rounded-full bg-primary/10" />
      
      <div className="mt-4 flex items-center gap-2">
        {percentage < 100 ? (
          <div className="flex items-center gap-1.5 text-xs text-warning font-bold">
            <AlertCircle size={14} strokeWidth={2.5} />
            <span>{t("profile_incomplete")}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-success font-bold">
            <CheckCircle2 size={14} strokeWidth={2.5} />
            <span>{t("profile_complete")}</span>
          </div>
        )}
      </div>
    </div>
  );
};
