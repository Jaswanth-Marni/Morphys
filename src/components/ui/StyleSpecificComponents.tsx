"use client";

import { motion, AnimatePresence } from "framer-motion";
import { uiStyles } from "@/data/styles";
import Image from "next/image";
import { useState, useRef } from "react";

export function StyleSpecificComponents() {
    const [hoveredStyle, setHoveredStyle] = useState<string | null>(null);
    const [isRapid, setIsRapid] = useState(false);
    const lastHoverTime = useRef<number>(0);

    const handleHover = (styleId: string | null) => {
        const now = Date.now();
        const timeSinceLast = now - lastHoverTime.current;
        lastHoverTime.current = now;

        // Rapid mode only activates if we are switching FROM a style TO another style quickly.
        // If we are coming from "null" (outside) or going to "null" (outside), we keep it smooth.
        const isSwitching = styleId !== null && hoveredStyle !== null;

        if (isSwitching && timeSinceLast < 300) {
            setIsRapid(true);
        } else {
            setIsRapid(false);
        }

        setHoveredStyle(styleId);
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center md:justify-start px-2 pb-0 md:pb-12 mt-0 md:mt-8">
            <div className="grid grid-cols-4 lg:grid-cols-8 gap-2 w-fit">
                {uiStyles.map((style, index) => (
                    <motion.div
                        key={style.id}
                        initial={{ x: "50vw", opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 120,
                            damping: 15,
                            mass: 1,
                            delay: index * 0.05,
                        }}
                        onMouseEnter={() => handleHover(style.title)}
                        onMouseLeave={() => handleHover(null)}
                        className="group relative aspect-[3/5] w-14 xs:w-16 sm:w-20 md:w-28 overflow-hidden rounded-xl border border-white/10 bg-white/5 cursor-pointer"
                    >
                        {/* Image Background */}
                        <div className="absolute inset-0">
                            <Image
                                src={style.image}
                                alt={style.title}
                                fill
                                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                sizes="(max-width: 768px) 33vw, (max-width: 1200px) 20vw, 10vw"
                            />
                        </div>

                        {/* Hover visual cue */}
                        <div className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-white/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </motion.div>
                ))}
            </div>

            <AnimatedTitle
                text={hoveredStyle ? hoveredStyle.toUpperCase() : "SPECIFIC"}
                isRapid={isRapid}
            />
        </div>
    );
}

function AnimatedTitle({ text, isRapid }: { text: string; isRapid: boolean }) {
    const letters = text.split("");
    const centerIndex = (letters.length - 1) / 2;
    const isSpecific = text === "SPECIFIC";

    const duration = isRapid ? 0.25 : 0.5;
    const stagger = isRapid ? 0.025 : 0.05;
    // Using a custom cubic bezier for rapid that is fast but smooth (no hard snap)
    // Type assertion to ensure it's treated as a Tuple [n, n, n, n] for Framer Motion
    const ease = (isRapid ? [0.25, 1, 0.5, 1] : [0.33, 1, 0.68, 1]) as [number, number, number, number];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative h-[80px] xs:h-[90px] md:h-[320px] w-full flex items-center justify-center mt-4 md:mt-10 overflow-hidden"
        >
            {/* Top Progressive Blur */}
            <div
                className="absolute top-0 left-0 right-0 h-2 md:h-8 z-20 pointer-events-none"
                style={{
                    backdropFilter: "blur(2px)",
                    WebkitBackdropFilter: "blur(2px)",
                    maskImage: "linear-gradient(to bottom, black, transparent)",
                    WebkitMaskImage: "linear-gradient(to bottom, black, transparent)"
                }}
            />

            {/* Bottom Progressive Blur */}
            <div
                className="absolute bottom-0 left-0 right-0 h-4 md:h-12 z-20 pointer-events-none"
                style={{
                    backdropFilter: "blur(2px)",
                    WebkitBackdropFilter: "blur(2px)",
                    maskImage: "linear-gradient(to top, black, transparent)",
                    WebkitMaskImage: "linear-gradient(to top, black, transparent)"
                }}
            />

            <AnimatePresence mode="popLayout" initial={true}>
                <motion.div
                    key={text}
                    className="absolute inset-0 flex items-center justify-center"
                    initial="initial"
                    animate="animate"
                    exit="exit"
                >
                    {letters.map((char, index) => {
                        const dist = Math.abs(index - centerIndex);
                        const delay = dist * stagger;

                        return (
                            <motion.span
                                key={`${text}-${index}`}
                                className="font-thunder text-[70px] md:text-[300px] leading-none text-[var(--foreground)] text-center tracking-[0.005em] inline-block"
                                variants={{
                                    initial: {
                                        y: isSpecific ? "-105%" : "105%",
                                    },
                                    animate: {
                                        y: 0,
                                    },
                                    exit: {
                                        y: isSpecific ? "-105%" : "105%",
                                    },
                                }}
                                transition={{
                                    duration: duration,
                                    delay: delay,
                                    ease: ease,
                                }}
                            >
                                {char === " " ? "\u00A0" : char}
                            </motion.span>
                        );
                    })}
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
}
