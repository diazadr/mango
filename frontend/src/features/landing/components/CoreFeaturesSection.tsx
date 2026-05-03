"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Users, BarChart3, Wrench, Cpu } from "lucide-react";

export const CoreFeaturesSection = () => {
    const t = useTranslations("CoreFeaturesSection");
    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const features = [
        {
            id: "advisor",
            Icon: Users,
            video: "/videos/hero-factory.mp4",
            theme: { text: "text-orange-600", bg: "bg-orange-100", border: "border-orange-200", shadow: "shadow-orange-600/20" }
        },
        {
            id: "assessment",
            Icon: BarChart3,
            video: "/videos/hero-factory.mp4",
            theme: { text: "text-emerald-600", bg: "bg-emerald-100", border: "border-emerald-200", shadow: "shadow-emerald-600/20" }
        },
        {
            id: "reservation",
            Icon: Wrench,
            video: "/videos/hero-factory.mp4",
            theme: { text: "text-amber-600", bg: "bg-amber-100", border: "border-amber-200", shadow: "shadow-amber-600/20" }
        },
        {
            id: "smart_mfg",
            Icon: Cpu,
            video: "/videos/hero-factory.mp4",
            theme: { text: "text-green-600", bg: "bg-green-100", border: "border-green-200", shadow: "shadow-green-600/20" }
        }
    ];

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start center", "end center"]
    });

    useEffect(() => {
        const unsubscribe = scrollYProgress.onChange((latest) => {
            const step = 1 / features.length;
            const newIndex = Math.min(
                Math.max(Math.floor(latest / step), 0),
                features.length - 1
            );
            if (newIndex !== activeIndex) {
                setActiveIndex(newIndex);
            }
        });
        return () => unsubscribe();
    }, [scrollYProgress, activeIndex, features.length]);

    const barY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

    const rawTitle = t("title");
    
    // Logika untuk mencari dan mewarnai kata "MANGO" menjadi oranye
    let coloredTitle;
    if (rawTitle.includes("MANGO")) {
        const parts = rawTitle.split("MANGO");
        coloredTitle = (
            <>
                {parts[0]}
                <span className="text-accent">MANGO</span>
                {parts[1]}
            </>
        );
    } else {
        coloredTitle = <>{rawTitle}</>;
    }

    return (
        <section className="bg-background relative h-[300vh]" ref={containerRef}>
            <div className="sticky top-0 w-full h-screen overflow-hidden flex flex-col justify-center">
                <div className="container mx-auto px-6 relative h-full flex flex-col justify-center z-20 pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="w-full lg:w-1/2 pointer-events-auto relative z-30"
                    >
                        <div className="mb-14 max-w-xl">
                            <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground leading-[1.1] tracking-tight">
                                {coloredTitle}
                            </h2>
                        </div>

                        <div className="flex gap-8 relative pr-12 lg:pr-24">
                            <div className="relative w-1.5 bg-muted rounded-full h-[400px] shrink-0">
                                <motion.div
                                    className="absolute top-0 left-[-2px] w-[6px] h-1/4 bg-primary rounded-full shadow-[0_0_12px_rgba(30,71,126,0.4)]"
                                    style={{
                                        y: useTransform(barY, (val) => `calc(${val} * 3)`)
                                    }}
                                />
                            </div>

                            <div className="flex flex-col h-[400px] justify-between py-2 w-full">
                                {features.map((item, index) => {
                                    const isActive = activeIndex === index;
                                    return (
                                        <div
                                            key={item.id}
                                            className={`transition-all duration-700 ease-out flex items-start gap-6
                                                ${isActive ? "opacity-100 translate-x-2" : "opacity-40 translate-x-0"}
                                            `}
                                        >
                                            <div
                                                className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center shrink-0 transition-all duration-500
                                                    ${isActive
                                                        ? `${item.theme.bg} ${item.theme.border} ${item.theme.text} shadow-lg ${item.theme.shadow} scale-110`
                                                        : "bg-transparent border-border text-muted-foreground scale-100"
                                                    }
                                                `}
                                            >
                                                <item.Icon size={24} className={isActive ? "stroke-[2.5px]" : "stroke-2"} />
                                            </div>

                                            <div className="pt-2 flex-1">
                                                <h3
                                                    className={`text-xl lg:text-2xl font-heading font-bold uppercase tracking-tight mb-2 transition-colors duration-500
                                                        ${isActive ? item.theme.text : "text-foreground"}
                                                    `}
                                                >
                                                    {t(`items.${item.id}.title`)}
                                                </h3>

                                                <AnimatePresence initial={false}>
                                                    {isActive && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: "auto" }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            transition={{ duration: 0.5 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <p className="text-base sm:text-lg text-muted-foreground font-sans leading-relaxed pr-2 pt-1 pb-2">
                                                                {t(`items.${item.id}.desc`)}
                                                            </p>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: false, margin: "-100px" }}
                    transition={{ duration: 1 }}
                    className="hidden lg:block absolute top-0 right-0 w-full lg:w-7/12 h-full z-10 pointer-events-none"
                >
                    <div
                        className="w-full h-full relative"
                        style={{
                            WebkitMaskImage:
                                "linear-gradient(to right, transparent 0%, transparent 5%, rgba(0,0,0,0.1) 10%, rgba(0,0,0,0.3) 14%, rgba(0,0,0,0.6) 18%, rgba(0,0,0,0.9) 22%, black 25%, black 100%)",
                            maskImage:
                                "linear-gradient(to right, transparent 0%, transparent 5%, rgba(0,0,0,0.1) 10%, rgba(0,0,0,0.3) 14%, rgba(0,0,0,0.6) 18%, rgba(0,0,0,0.9) 22%, black 25%, black 100%)"
                        }}
                    >
                        {features.map((item, index) => (
                            <div
                                key={item.id}
                                className={`absolute inset-0 transition-opacity duration-1000
                                    ${activeIndex === index ? "opacity-100 z-10" : "opacity-0 z-0"}
                                `}
                            >
                                <video
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover object-left"
                                >
                                    <source src={item.video} type="video/mp4" />
                                </video>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};