"use client";

import { motion } from "framer-motion";
import { useEffect, type ElementType } from "react";
import { useAuth } from "@/src/components/providers/AuthProvider";
import { useRouter } from "@/src/i18n/navigation";
import { Loader2 } from "lucide-react";

interface PageShellProps {
  title?: string;
  subtitle?: string;
  icon?: ElementType;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function DashboardPageShell({ title, subtitle, icon: Icon, actions, children }: PageShellProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    document.title = title ? `${title} | MANGO` : "MANGO Dashboard";
  }, [title]);

  // PROTEKSI LAPIS KEDUA: Jika loading selesai dan tidak ada user, tendang ke login
  useEffect(() => {
    if (!isLoading && !user) {
        router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
        <div className="h-[60vh] w-full flex items-center justify-center">
            <Loader2 className="animate-spin text-primary h-8 w-8" />
        </div>
    );
  }

  // Jika tidak ada user, jangan render apa pun (mencegah kedipan konten sebelum redirect)
  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full space-y-6"
    >
      {(title || subtitle || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            {Icon && (
              <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                <Icon className="h-5 w-5" />
              </div>
            )}
            <div className="min-w-0">
              {title && (
                <h1 className="text-xl font-semibold tracking-tight text-foreground leading-none">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {actions && (
            <div className="shrink-0">
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </motion.div>
  );
}
