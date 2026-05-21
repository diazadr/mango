"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { useEffect, useState } from "react";

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const themes = [
    { code: "light", label: "Mode Terang", icon: Sun },
    { code: "dark", label: "Mode Gelap", icon: Moon },
    { code: "system", label: "Otomatis (Sistem)", icon: Monitor },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {themes.map((t) => (
        <button
          key={t.code}
          onClick={() => setTheme(t.code)}
          className={`flex flex-col items-start gap-3 p-4 rounded-2xl border transition-all ${
            theme === t.code
              ? "bg-primary/5 border-primary text-primary shadow-sm"
              : "bg-card border-border hover:border-primary/30 text-muted-foreground"
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <div className={`p-2 rounded-lg ${theme === t.code ? "bg-primary/10" : "bg-muted"}`}>
              <t.icon size={16} strokeWidth={1.5} />
            </div>
            {theme === t.code && (
              <div className="bg-primary text-white rounded-full p-0.5">
                <Check size={12} strokeWidth={3} />
              </div>
            )}
          </div>
          <span className="text-sm font-bold mt-1 text-foreground">{t.label}</span>
        </button>
      ))}
    </div>
  );
};
