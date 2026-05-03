"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Plus, Minus } from "lucide-react";

const faqItems = [
  { id: "what_is_mango" },
  { id: "who_can_join" },
  { id: "is_it_free" },
  { id: "how_to_reserve" },
  { id: "mentoring_support" },
];

export const FAQSection = () => {
  const t = useTranslations("FAQSection");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-background relative overflow-hidden" id="faq">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute -top-64 -right-64 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl opacity-50 pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

          <div className="lg:w-1/3 flex flex-col shrink-0">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="sticky top-24"
            >
              <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground leading-tight mb-6 uppercase">
                {t("title_part1")} <br className="hidden lg:block" />
                <span className="text-accent">{t("title_part2")}</span>
              </h2>

              <p className="text-base sm:text-lg text-muted-foreground font-sans leading-relaxed">
                {t("description")}
              </p>
            </motion.div>
          </div>

          <div className="lg:w-2/3 flex flex-col w-full">
            <div className="border-t border-border">
              {faqItems.map((item, index) => {
                const isOpen = openIndex === index;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div
                      onClick={() => toggleFAQ(index)}
                      className="border-b border-border transition-all duration-300 cursor-pointer group"
                    >
                      <button
                        className="w-full flex items-start lg:items-center justify-between py-6 text-left pointer-events-none"
                        aria-expanded={isOpen}
                      >
                        <span
                          className={`font-bold text-lg lg:text-xl font-heading transition-colors duration-300 pr-8 uppercase ${
                            isOpen
                              ? "text-primary"
                              : "text-foreground group-hover:text-primary"
                          }`}
                        >
                          {t(`items.${item.id}.question`)}
                        </span>

                        <div
                          className={`shrink-0 mt-1 lg:mt-0 transition-colors duration-300 ${
                            isOpen
                              ? "text-accent"
                              : "text-muted-foreground group-hover:text-primary"
                          }`}
                        >
                          {isOpen ? <Minus size={24} /> : <Plus size={24} />}
                        </div>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="pb-8 pt-2 pr-8 text-muted-foreground font-sans text-base sm:text-lg leading-relaxed">
                              {t(`items.${item.id}.answer`)}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};