"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface NavbarButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "white" | "orange";
}

export const NavbarButton = ({
  children,
  onClick,
  variant = "white",
}: NavbarButtonProps) => {
  const baseClasses =
    "relative group h-10 sm:h-11 px-5 sm:px-6 rounded-full text-xs sm:text-sm font-semibold tracking-wide flex items-center justify-center gap-3 cursor-pointer shadow-md transition-all duration-300 w-max overflow-hidden";

  const variantClasses = {
    white:
      "bg-background text-foreground border border-border hover:bg-muted hover:text-primary",
    orange:
      "bg-primary text-primary-foreground hover:bg-primary/90",
  };

  const iconWrapperClasses = {
    white: "bg-primary text-primary-foreground",
    orange: "bg-background text-foreground",
  };

  const underlineColor = {
    white: "bg-primary",
    orange: "bg-background",
  };

  return (
    <motion.button
      onClick={onClick}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      <span className="relative z-10 flex flex-col">
        {children}
        <motion.span
          variants={{
            initial: { width: "0%" },
            hover: { width: "100%" },
            tap: { width: "100%" },
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`absolute -bottom-0.5 left-0 h-[2px] rounded-full ${underlineColor[variant]}`}
        />
      </span>

      <motion.span
        variants={{
          initial: { x: 0 },
          hover: { x: 4 },
          tap: { x: 2 },
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-full shrink-0 ${iconWrapperClasses[variant]}`}
      >
        <ArrowRight className="w-3.5 h-3.5 text-current" />
      </motion.span>

      <div className="absolute inset-0 bg-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-full" />
    </motion.button>
  );
};