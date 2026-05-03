"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { AnimatePresence, motion } from "framer-motion";

interface StatusAlertProps {
  status: { type: "success" | "destructive"; message: string } | null;
  onDismiss: () => void;
  autoDismissMs?: number;
}

export function StatusAlert({ status, onDismiss, autoDismissMs = 5000 }: StatusAlertProps) {
  React.useEffect(() => {
    if (status && autoDismissMs > 0) {
      const timer = setTimeout(onDismiss, autoDismissMs);
      return () => clearTimeout(timer);
    }
  }, [status, autoDismissMs, onDismiss]);

  return (
    <AnimatePresence>
      {status && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
        >
          <Alert variant={status.type}>
            {status.type === "success" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription className="flex items-center justify-between">
              <span>{status.message}</span>
              <button
                onClick={onDismiss}
                className="ml-4 p-0.5 rounded hover:bg-foreground/10 transition-colors shrink-0"
                aria-label="Dismiss"
              >
                <X className="h-3.5 w-3.5 opacity-50 hover:opacity-100 transition-opacity" />
              </button>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
