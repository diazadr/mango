"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { MessageSquare } from "lucide-react";
import Link from "next/link";

export const CTASection = () => {
  const t = useTranslations("CTASection");

  return (
    <section className="relative overflow-hidden w-full" id="cta">
      <div className="bg-foreground relative w-full">

        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-background/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-2 items-center w-full">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative h-64 sm:h-80 lg:h-full min-h-[300px] lg:min-h-[500px] w-full flex items-center justify-center p-8 lg:p-16 order-2 lg:order-1"
          >
            <img
              src="/images/your-image-here.png"
              alt="Diskusi dan Konsultasi Industri"
              className="w-full h-full object-contain drop-shadow-2xl"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="px-6 py-12 sm:p-12 lg:p-20 xl:p-24 flex flex-col justify-center items-center lg:items-start text-center lg:text-left relative z-10 order-1 lg:order-2"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-heading font-bold text-primary-foreground leading-tight uppercase mb-6">
              {t("title_part1")} <br className="hidden lg:block xl:hidden" />
              <span className="text-accent"> {t("title_highlight")} </span> {t("title_part2")}
            </h2>

            <p className="text-primary-foreground/80 font-sans text-base sm:text-lg lg:text-xl leading-relaxed mb-8 sm:mb-10 max-w-2xl">
              {t("description")}
            </p>

            <div className="w-full sm:w-auto">
              <Link
                href="/consultation"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-accent text-accent-foreground hover:bg-accent/90 font-bold rounded-full transition-all duration-300 uppercase tracking-wide text-sm"
              >
                <MessageSquare size={18} />
                {t("btn_primary")}
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};