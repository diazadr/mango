"use client";

import { useRef } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { AnimatedButton } from "@/src/components/ui/public/AnimatedButton";

export const HeroSection = () => {
  const t = useTranslations("HeroSection");
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["end end", "end start"],
  });

  const videoOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0]);

  const logos = [
    "/images/logos/logo-polmanbandung.png",
    "/images/logos/logo-polmanbandung.png",
    "/images/logos/logo-polmanbandung.png",
    "/images/logos/logo-polmanbandung.png",
  ];

  const duplicatedLogos = [...logos, ...logos, ...logos, ...logos];

  const handleExploreClick = () => {
    if (containerRef.current && containerRef.current.nextElementSibling) {
      containerRef.current.nextElementSibling.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else {
      window.scrollTo({
        top: window.innerHeight,
        behavior: "smooth",
      });
    }
  };

  return (
    <section
      className="relative h-screen w-full flex flex-col justify-center overflow-hidden bg-background"
      ref={containerRef}
    >
      <div className="absolute top-0 left-0 w-full h-full bg-black pointer-events-none z-0" />

<motion.div
  className="absolute inset-0 z-10 overflow-hidden"
  style={{ opacity: videoOpacity }}
>
  <div className="absolute inset-0 w-full h-full">
    <iframe
      src="https://www.youtube.com/embed/QOLYV7l_bCc?autoplay=1&mute=1&loop=1&playlist=QOLYV7l_bCc&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1"
      allow="autoplay; encrypted-media"
      allowFullScreen
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{
        width: "calc(100% + 200px)",
        height: "calc(100% + 200px)",
        minWidth: "177.78vh",
        minHeight: "56.25vw",
        border: "none",
        pointerEvents: "none",
      }}
    />
  </div>
  <div className="absolute inset-0 bg-black/40" />
  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
</motion.div>

      <div className="relative z-20 w-full h-full flex items-center">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-2xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-7xl font-heading font-bold tracking-tight mb-6 leading-[1.1] text-primary-foreground"
            >
              {t("title_1").split(" ")[0]}{" "}
              <span className="text-accent">
                {t("title_1").split(" ").slice(1).join(" ")}
              </span>
              <br />
              {t("title_2")}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-base sm:text-lg text-primary-foreground/80 mb-8 sm:mb-10 max-w-xl leading-relaxed font-sans"
            >
              {t("description")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <AnimatedButton onClick={handleExploreClick}>
                {t("explore")}
              </AnimatedButton>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full z-10">
        <div className="container mx-auto px-6 lg:px-12 flex flex-col md:flex-row md:items-center gap-4 md:gap-8 lg:gap-12 pb-6 sm:pb-8">
          <span className="text-xs sm:text-sm lg:text-base font-black tracking-wide text-primary-foreground font-sans shrink-0">
            {t("trusted")}
          </span>

          <div
            className="w-full overflow-hidden relative flex items-center"
            style={{
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
              maskImage:
                "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
            }}
          >
            <motion.div
              animate={{ x: ["0%", "-50%"] }}
              transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
              className="flex w-max gap-12 sm:gap-16 pr-12 sm:pr-16 items-center"
            >
              {duplicatedLogos.map((logo, index) => (
                <img
                  key={index}
                  src={logo}
                  alt={t("alt_client_logo")}
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                  className="h-6 sm:h-8 lg:h-10 w-auto object-contain opacity-90 brightness-0 invert select-none pointer-events-none shrink-0"
                />
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
