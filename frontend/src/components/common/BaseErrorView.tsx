"use client";

import { motion } from "framer-motion";
import { Home, ArrowLeft, ShieldAlert, ServerCrash, FileQuestion } from "lucide-react";

export interface BaseErrorViewProps {
  statusCode: 403 | 404 | 500 | number;
  title: string;
  description: string;
  goBackText: string;
  goHomeText: string;
  tryAgainText?: string;
  reset?: () => void;
  // Optional flag to use native <a> tag if outside next-intl context
  useNativeLink?: boolean;
}

export const BaseErrorView = ({ 
  statusCode = 404, 
  title, 
  description, 
  goBackText, 
  goHomeText, 
  tryAgainText, 
  reset,
  useNativeLink = false
}: BaseErrorViewProps) => {
  const getErrorConfig = (code: number) => {
    switch (code) {
      case 403:
        return { icon: ShieldAlert };
      case 500:
        return { icon: ServerCrash };
      case 404:
      default:
        return { icon: FileQuestion };
    }
  };

  const { icon: Icon } = getErrorConfig(statusCode);

  const HomeLink = ({ className, children }: { className: string, children: React.ReactNode }) => {
    if (useNativeLink) {
      return <a href="/dashboard" className={className}>{children}</a>;
    }
    // We import Link inside the component to avoid next-intl crashes outside the context
    const { Link } = require("@/src/i18n/navigation");
    return <Link href="/dashboard" className={className}>{children}</Link>;
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-6 font-sans">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative mb-10 mt-8"
        >
          <div className="text-[120px] sm:text-[180px] font-heading font-black leading-none text-muted select-none">
            {statusCode}
          </div>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-32 sm:h-32 bg-background border border-border rounded-full flex items-center justify-center shadow-lg"
          >
            <Icon className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4 uppercase tracking-tight">
            {title}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground font-sans leading-relaxed mb-10 max-w-md mx-auto">
            {description}
          </p>

          <div className="flex w-full sm:w-auto flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                if (reset) {
                  reset();
                } else {
                  window.history.back();
                }
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 h-12 rounded-full border border-border bg-background text-foreground hover:bg-muted font-semibold transition-colors focus:outline-none tracking-wide text-sm cursor-pointer"
            >
              <ArrowLeft size={18} />
              {reset && tryAgainText ? tryAgainText : goBackText}
            </button>
            
            <HomeLink className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full font-semibold transition-all shadow-md focus:outline-none tracking-wide text-sm cursor-pointer">
              <Home size={18} />
              {goHomeText}
            </HomeLink>
          </div>
        </motion.div>
      </div>
    </main>
  );
};
