"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

interface AccordionButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const AccordionButton = ({
  children,
  onClick,
  className,
}: AccordionButtonProps) => {
  return (
    <Button
      asChild
      variant="default"
      className={cn(
        "h-10 sm:h-11 md:h-12 px-5 sm:px-6 rounded-full w-max border-none",
        "bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm font-semibold tracking-wide",
        "shadow-md hover:shadow-lg transition-shadow duration-300",
        "flex items-center justify-center gap-3 cursor-pointer",
        className
      )}
    >
      <motion.button
        onClick={onClick}
        initial="initial"
        whileHover="hover"
        className="group"
      >
        <span className="relative flex flex-col">
          {children}
          <motion.span
            variants={{
              initial: { width: "0%" },
              hover: { width: "100%" },
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute -bottom-0.5 left-0 h-[2px] rounded-full bg-accent"
          />
        </span>

        <motion.span
          variants={{
            initial: { x: 0 },
            hover: { x: 4 },
          }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="flex items-center justify-center w-6 h-6 rounded-full bg-accent shrink-0"
        >
          <ArrowRight className="w-3.5 h-3.5 text-accent-foreground" />
        </motion.span>
      </motion.button>
    </Button>
  );
};