"use client";

import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useTranslations } from "next-intl";
import { Cpu, Link2Off, FlaskConical, Factory, AlertTriangle, Database, ZapOff, ChevronDown } from "lucide-react";

export const ProblemSection = () => {
    const t = useTranslations("ProblemSection");
    
    const [activeProblem, setActiveProblem] = useState<string>("tech_gap");

    const problems = [
        { id: "tech_gap", Icon: Cpu, index: "01" },
        { id: "isolated", Icon: Link2Off, index: "02" },
        { id: "no_lab", Icon: FlaskConical, index: "03" },
        { id: "inefficiency", Icon: Factory, index: "04" }
    ];

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    const rawTitle = t("title");
    const titleWords = rawTitle.split(" ");

    let coloredTitle;
    if (titleWords.length > 2) {
        coloredTitle = (
            <>
                <span className="text-accent">{titleWords[0]} {titleWords[1]}</span>{" "}
                {titleWords.slice(2).join(" ")}
            </>
        );
    } else if (titleWords.length === 2) {
        coloredTitle = <span className="text-accent">{rawTitle}</span>;
    } else {
        coloredTitle = <span className="text-accent">{rawTitle}</span>;
    }

    const renderVisualizer = () => {
        const cardClasses = "absolute inset-0 flex flex-col items-center justify-center w-full h-full gap-4 sm:gap-6 bg-muted shadow-lg shadow-primary/5 dark:shadow-none p-6 sm:p-8 border border-border overflow-hidden";

        const visualizerVariants: Variants = {
            initial: { opacity: 0, scale: 0.95 },
            animate: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
            exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2, ease: "easeIn" } }
        };

        switch (activeProblem) {
            case "tech_gap":
                return (
                    <motion.div
                        key="tech_gap"
                        variants={visualizerVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className={cardClasses}
                    >
                        <div className="relative z-10">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: false, margin: "-50px" }}
                                transition={{ duration: 0.5 }}
                            >
                                <Cpu className="w-16 h-16 sm:w-20 sm:h-20 text-accent animate-pulse" />
                                <ZapOff className="w-6 h-6 sm:w-8 sm:h-8 text-background absolute -bottom-2 -right-2 fill-accent" />
                            </motion.div>
                        </div>
                        <motion.span 
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: false, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-orange-600 font-mono font-bold tracking-widest uppercase text-xs sm:text-sm text-center drop-shadow-[0_0_8px_rgba(249,115,22,0.3)] z-10"
                        >
                            Legacy Hardware Detected
                        </motion.span>
                        <div className="flex gap-1.5 sm:gap-2 z-10">
                            {[1, 2, 3].map((i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, height: 0 }}
                                    whileInView={{ opacity: 1, height: [10, 30, 10] }}
                                    viewport={{ once: false, margin: "-50px" }}
                                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                    className="w-1.5 sm:w-2 bg-accent/40 rounded-full"
                                />
                            ))}
                        </div>
                    </motion.div>
                );
            case "isolated":
                return (
                    <motion.div
                        key="isolated"
                        variants={visualizerVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className={cardClasses}
                    >
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: false, margin: "-50px" }}
                            transition={{ duration: 0.5 }}
                            className="absolute top-1/4 left-[15%] sm:left-1/4 flex flex-col items-center gap-2 z-10"
                        >
                            <div className="p-3 sm:p-4 rounded-full border border-orange-200 bg-orange-50"><Factory className="w-5 h-5 sm:w-6 sm:h-6 text-accent" /></div>
                            <span className="text-[8px] sm:text-[10px] text-orange-600 font-mono">NODE_A</span>
                        </motion.div>
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: false, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="absolute bottom-1/4 right-[15%] sm:right-1/4 flex flex-col items-center gap-2 z-10"
                        >
                            <div className="p-3 sm:p-4 rounded-full border border-orange-200 bg-orange-50"><Database className="w-5 h-5 sm:w-6 sm:h-6 text-accent" /></div>
                            <span className="text-[8px] sm:text-[10px] text-orange-600 font-mono">NODE_B</span>
                        </motion.div>
                        <motion.div 
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            viewport={{ once: false, margin: "-50px" }}
                            transition={{ duration: 0.5 }}
                            className="absolute w-24 sm:w-32 h-[2px] bg-accent rotate-45 z-0"
                        >
                            <motion.div 
                                animate={{ opacity: [1, 0, 1] }} 
                                transition={{ duration: 0.5, repeat: Infinity }}
                                className="w-full h-full bg-accent"
                            />
                        </motion.div>
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: false, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="bg-background px-2 sm:px-3 py-1 sm:py-1.5 border border-border rounded-lg z-20 flex items-center gap-2 shadow-sm"
                        >
                            <Link2Off className="w-4 h-4 sm:w-4 sm:h-4 text-accent" />
                            <span className="text-[10px] sm:text-xs font-mono font-bold text-orange-600">SYNC_FAILED</span>
                        </motion.div>
                    </motion.div>
                );
            case "no_lab":
                return (
                    <motion.div
                        key="no_lab"
                        variants={visualizerVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className={cardClasses}
                    >
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.5 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: false, margin: "-50px" }}
                            transition={{ duration: 0.5 }}
                            className="z-10"
                        >
                            <motion.div
                                animate={{ x: [-5, 5, -5] }} 
                                transition={{ duration: 0.1, repeat: Infinity }}
                            >
                                <FlaskConical className="w-16 h-16 sm:w-20 sm:h-20 text-accent drop-shadow-[0_0_15px_rgba(249,115,22,0.4)]" />
                            </motion.div>
                        </motion.div>
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: false, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="bg-accent text-accent-foreground px-3 sm:px-4 py-1.5 sm:py-2 font-bold tracking-widest text-[10px] sm:text-xs uppercase flex items-center gap-2 rounded-full shadow-lg shadow-accent/20 z-10 whitespace-nowrap"
                        >
                            <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" /> Live Production Risk
                        </motion.div>
                        <motion.span 
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: false, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="text-[8px] sm:text-[10px] text-orange-600 font-mono font-medium z-10"
                        >
                            Testing phase compromised
                        </motion.span>
                    </motion.div>
                );
            case "inefficiency":
                return (
                    <motion.div
                        key="inefficiency"
                        variants={visualizerVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className={cardClasses}
                    >
                        <motion.span 
                            initial={{ opacity: 0, y: -10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: false, margin: "-50px" }}
                            transition={{ duration: 0.5 }}
                            className="text-orange-600 font-mono font-bold tracking-widest uppercase text-xs sm:text-sm z-10"
                        >
                            Resource Drain
                        </motion.span>
                        <motion.div 
                            initial={{ opacity: 0, scaleX: 0 }}
                            whileInView={{ opacity: 1, scaleX: 1 }}
                            viewport={{ once: false, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="w-full bg-muted h-6 sm:h-8 rounded-full overflow-hidden relative border border-border z-10 origin-left"
                        >
                            <motion.div 
                                animate={{ width: ["100%", "15%"] }}
                                transition={{ duration: 2, ease: "circOut", repeat: Infinity, repeatDelay: 1 }}
                                className="h-full bg-accent rounded-full"
                            />
                        </motion.div>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: false, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="flex justify-between w-full text-[8px] sm:text-[10px] font-mono text-muted-foreground z-10"
                        >
                            <span>OPT_LEVEL</span>
                            <span className="text-orange-600 font-black animate-pulse">CRITICAL</span>
                        </motion.div>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    return (
        <section className="min-h-screen flex flex-col justify-center py-16 md:py-24 bg-background relative overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-12 relative z-10 flex-1 flex flex-col justify-center">
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, margin: "-50px" }} 
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center max-w-4xl mx-auto mb-12 md:mb-20"
                >
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4 sm:mb-6 leading-tight uppercase tracking-tight">
                        {coloredTitle}
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg text-muted-foreground font-sans leading-relaxed px-2">
                        {t("description")}
                    </p>
                </motion.div>

                <div className="flex flex-col-reverse lg:flex-row gap-10 lg:gap-16 xl:gap-24 items-start max-w-6xl mx-auto w-full">
                    <div className="w-full lg:w-5/12 space-y-2">
                        <motion.div 
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: false, margin: "-50px" }} 
                            className="flex flex-col"
                        >
                            {problems.map(({ id, index }) => (
                                <motion.div 
                                    key={id} 
                                    variants={itemVariants}
                                    className="border-b border-border last:border-0"
                                >
                                    <button 
                                        onClick={() => {
                                            if (activeProblem !== id) {
                                                setActiveProblem(id);
                                            }
                                        }}
                                        className="w-full py-4 sm:py-6 flex items-center justify-between group text-left cursor-pointer focus:outline-none"
                                    >
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            <span className={`text-lg sm:text-xl font-bold font-mono transition-colors duration-300 ${activeProblem === id ? 'text-primary' : 'text-muted-foreground group-hover:text-primary/70'}`}>
                                                {index}
                                            </span>
                                            <h3 className={`text-lg sm:text-xl lg:text-2xl font-heading font-bold transition-colors duration-300 uppercase ${activeProblem === id ? 'text-primary' : 'text-foreground/80 group-hover:text-foreground'}`}>
                                                {t(`items.${id}.title`)}
                                            </h3>
                                        </div>
                                        <div className="ml-2 sm:ml-4 shrink-0">
                                            <motion.div
                                                animate={{ rotate: activeProblem === id ? 180 : 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <ChevronDown className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${activeProblem === id ? 'text-primary' : 'text-muted-foreground group-hover:text-primary/70'}`} />
                                            </motion.div>
                                        </div>
                                    </button>

                                    <AnimatePresence initial={false}>
                                        {activeProblem === id && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                className="overflow-hidden"
                                            >
                                                <p className="pb-4 sm:pb-6 text-sm sm:text-base text-muted-foreground font-sans leading-relaxed pl-8 sm:pl-12 pr-2 sm:pr-4">
                                                    {t(`items.${id}.desc`)}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>

                    <div className="w-full lg:w-7/12 flex flex-col items-center justify-center lg:sticky lg:top-32">
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: false, margin: "-50px" }} 
                            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                            className="w-full max-w-lg h-64 sm:h-80 md:h-96 lg:h-auto lg:aspect-[4/3] relative overflow-hidden rounded-3xl"
                        >
                            <AnimatePresence mode="wait">
                                {activeProblem && renderVisualizer()}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};
