"use client";

import { motion, useMotionValue, useSpring, useTransform, useScroll } from "framer-motion";
import React, { useRef, useEffect, useState } from "react";
import { AccordionButton } from "@/src/components/ui/public/AccordionButton";
import { useTranslations } from "next-intl";

export const SolutionSection = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const t = useTranslations("SolutionSection");

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 1024);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const mouseXSpring = useSpring(mouseX, { stiffness: 150, damping: 20 });
    const mouseYSpring = useSpring(mouseY, { stiffness: 150, damping: 20 });

    const hoverRotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
    const hoverRotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

    const handleMove = (clientX: number, clientY: number) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        mouseX.set(x / rect.width - 0.5);
        mouseY.set(y / rect.height - 0.5);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        handleMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"],
    });

    const scrollRotateXRaw = useTransform(scrollYProgress, [0, 0.5, 1], ["30deg", "0deg", "-30deg"]);
    const scrollRotateX = useSpring(scrollRotateXRaw, { stiffness: 100, damping: 30 });

    return (
        <section
            ref={sectionRef}
            className="relative min-h-screen flex flex-col justify-center py-24 bg-background overflow-hidden"
            id="about-mango"
        >
            <div className="container relative z-10 mx-auto px-6 lg:px-12 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 xl:gap-32 items-center">

                    <div className="lg:col-span-6 w-full flex justify-center items-center relative perspective-[3000px] order-2 lg:order-1">
                        <motion.div
                            className="w-full max-w-2xl relative transform-gpu"
                            style={{
                                rotateX: scrollRotateX,
                                transformStyle: "preserve-3d",
                            }}
                        >
                            <div
                                ref={cardRef}
                                onMouseMove={handleMouseMove}
                                onMouseLeave={handleMouseLeave}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleMouseLeave}
                                className="absolute inset-0 z-50 cursor-pointer"
                            />

                            <motion.div
                                style={{
                                    rotateX: isMobile ? 0 : hoverRotateX,
                                    rotateY: isMobile ? 0 : hoverRotateY,
                                    transformStyle: "preserve-3d",
                                }}
                                className="relative w-full rounded-3xl group select-none"
                            >
                                <div
                                    className="relative w-full rounded-3xl shadow-2xl shadow-slate-900/15 dark:shadow-none overflow-hidden border border-border bg-card pointer-events-none"
                                    style={{ transform: "translateZ(40px)" }}
                                >
                                    <img
                                        src="/images/dashboard.png"
                                        alt="MANGO Dashboard Interface"
                                        className="block w-full h-auto object-cover opacity-95 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                                        draggable={false}
                                    />
                                </div>

                                <div
                                    className="absolute inset-x-8 -bottom-12 top-12 bg-primary/15 blur-[80px] rounded-[4rem] -z-10 transition-opacity duration-500 group-hover:opacity-75 opacity-50"
                                    style={{ transform: "translateZ(-30px)" }}
                                />
                            </motion.div>
                        </motion.div>
                    </div>

                    <div className="lg:col-span-6 flex flex-col justify-center items-center lg:items-start text-center lg:text-left order-1 lg:order-2">
                        <motion.div
                            initial={{ opacity: 0, x: 40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: false, margin: "-50px" }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="w-full space-y-6 mb-10"
                        >
                            <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold font-heading text-foreground leading-tight uppercase tracking-tight">
                                {t("title_part1")} <br className="hidden lg:block" />
                                <span className="text-accent">{t("title_part2")}</span>
                            </h2>

                            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-sans lg:max-w-xl">
                                {t("description")}
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: false, margin: "-50px" }}
                            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                            className="flex justify-center lg:justify-start w-full"
                        >
                            <a href="#explore-mango">
                                <AccordionButton>
                                    {t("cta_button")}
                                </AccordionButton>
                            </a>
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    );
};