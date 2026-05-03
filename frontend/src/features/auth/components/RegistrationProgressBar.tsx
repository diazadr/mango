"use client";

import React from "react";
import { Check } from "lucide-react";

interface Step {
  id: number;
  name: string;
}

interface RegistrationProgressBarProps {
  currentStep: number;
}

const steps: Step[] = [
  { id: 1, name: "Data Diri & Akun" },
  { id: 2, name: "Verifikasi" },
  { id: 3, name: "Data Bisnis" },
];

export const RegistrationProgressBar = ({ currentStep }: RegistrationProgressBarProps) => {
  return (
    <div className="w-full max-w-md mx-auto mb-12">
      <div className="flex items-center justify-between relative">
        {/* Background Line */}
        <div className="absolute top-5 left-0 w-full h-[2px] bg-muted -z-0" />
        
        {/* Active Line */}
        <div 
          className="absolute top-5 left-0 h-[2px] bg-primary transition-all duration-500 -z-0" 
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((s) => (
          <div key={s.id} className="flex flex-col items-center relative z-10 bg-background px-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${currentStep >= s.id ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20' : 'border-muted bg-muted/50 text-muted-foreground'}`}>
              {currentStep > s.id ? (
                <Check size={18} strokeWidth={3} />
              ) : (
                <span className="text-sm font-bold">{s.id}</span>
              )}
            </div>
            <span className={`text-[10px] font-bold mt-2 uppercase tracking-widest ${currentStep >= s.id ? 'text-primary' : 'text-muted-foreground'}`}>
              {s.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
