"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/src/i18n/navigation";
import { Globe, Check } from "lucide-react";
import { Button } from "@/src/components/ui/button";

export const LocaleSwitcher = ({ t }: { t: any }) => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale as any });
  };

  const languages = [
    { code: "id", label: t("indonesian") || "Bahasa Indonesia" },
    { code: "en", label: t("english") || "English" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleLocaleChange(lang.code)}
          className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
            locale === lang.code
              ? "bg-primary/5 border-primary text-primary shadow-sm"
              : "bg-white border-border hover:border-primary/30 text-muted-foreground"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${locale === lang.code ? "bg-primary/10" : "bg-muted"}`}>
              <Globe size={16} strokeWidth={1.5} />
            </div>
            <span className="text-sm font-bold">{lang.label}</span>
          </div>
          {locale === lang.code && (
            <div className="bg-primary text-white rounded-full p-0.5">
              <Check size={12} strokeWidth={3} />
            </div>
          )}
        </button>
      ))}
    </div>
  );
};
