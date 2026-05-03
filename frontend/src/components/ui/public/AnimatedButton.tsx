"use client";

import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "white" | "orange";
};

export const AnimatedButton = ({
  children,
  onClick,
  variant = "white",
}: Props) => {
  const baseClasses =
    "relative group h-10 sm:h-11 md:h-12 px-4 sm:px-5 md:px-6 rounded-full text-xs sm:text-sm font-semibold tracking-wide flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden";

  const variantClasses = {
    white: "bg-background text-foreground",
    orange: "bg-accent text-accent-foreground",
  };

  const iconClasses = {
    white: "bg-accent text-accent-foreground",
    orange: "bg-background text-foreground",
  };

  const underlineClasses = {
    white: "bg-accent",
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
          className={`absolute -bottom-0.5 left-0 h-[2px] rounded-full ${underlineClasses[variant]}`}
        />
      </span>

      <motion.span
        variants={{
          initial: { y: 0 },
          hover: {
            y: [0, 4, 0],
            transition: {
              duration: 0.35,
              repeat: Infinity,
              repeatDelay: 0.8,
              ease: "easeOut",
            },
          },
          tap: {
            y: 2,
            transition: { duration: 0.1 },
          },
        }}
        className={`relative z-10 flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full ${iconClasses[variant]}`}
      >
        <ArrowDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-current" />
      </motion.span>

      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-full" />
    </motion.button>
  );
};