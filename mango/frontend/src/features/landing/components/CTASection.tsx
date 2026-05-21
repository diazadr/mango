"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Building2,
  Factory,
  GraduationCap,
  MessageSquare,
  Network,
} from "lucide-react";
import Link from "next/link";

export const CTASection = () => {
  const t = useTranslations("CTASection");
  const entityCards = [
    {
      title: "UMKM / IKM",
      description: "Produksi, stok, order, dan kualitas dalam satu alur kerja.",
      Icon: Factory,
    },
    {
      title: "Kampus",
      description: "Lab, aset, dan program industri yang tetap terhubung.",
      Icon: GraduationCap,
    },
    {
      title: "Organisasi",
      description: "Pembinaan, layanan anggota, dan fasilitas bersama yang rapi.",
      Icon: Building2,
    },
  ];

  return (
    <section className="relative overflow-hidden w-full" id="cta">
      <div className="bg-slate-950 relative w-full">

        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-background/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-2 items-center w-full">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative h-64 sm:h-80 lg:h-full min-h-[300px] lg:min-h-[500px] w-full flex items-center justify-center p-8 lg:p-16 order-2 lg:order-1"
          >
            <div className="relative w-full max-w-xl">
              <div className="absolute -top-8 right-4 h-24 w-24 rounded-full bg-accent/20 blur-3xl" />
              <div className="absolute -bottom-10 left-0 h-28 w-28 rounded-full bg-background/10 blur-3xl" />

              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-sm">
                <div className="mb-5 flex items-center justify-between rounded-2xl border border-white/10 bg-black/10 px-4 py-3">
                  <div>
                    <p className="text-[11px] font-black tracking-[0.28em] text-primary-foreground/55">
                      Mango Ecosystem
                    </p>
                    <p className="mt-1 text-lg font-heading font-bold text-primary-foreground">
                      ERP + MES Multi-Entitas
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                    <Network size={22} />
                  </div>
                </div>

                <div className="space-y-3">
                  {entityCards.map(({ title, description, Icon }, index) => (
                    <motion.div
                      key={title}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.45, delay: 0.1 + index * 0.08 }}
                      viewport={{ once: true }}
                      className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                    >
                      <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-accent">
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black tracking-wider text-primary-foreground">
                          {title}
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-primary-foreground/72">
                          {description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="px-6 py-12 sm:p-12 lg:p-20 xl:p-24 flex flex-col justify-center items-center lg:items-start text-center lg:text-left relative z-10 order-1 lg:order-2"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-heading font-bold text-primary-foreground leading-tight mb-6">
              {t("title_part1")} <br className="hidden lg:block xl:hidden" />
              <span className="text-accent"> {t("title_highlight")} </span> {t("title_part2")}
            </h2>

            <p className="text-primary-foreground/80 font-sans text-base sm:text-lg lg:text-xl leading-relaxed mb-8 sm:mb-10 max-w-2xl">
              {t("description")}
            </p>

            <div className="w-full sm:w-auto">
              <Link
                href="/consultation"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-accent text-accent-foreground hover:bg-accent/90 font-bold rounded-full transition-all duration-300 tracking-wide text-sm"
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
