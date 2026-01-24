"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback, useMemo } from "react";

// Hook to detect mobile screen size
function useResponsiveSize(baseFontSize: number) {
    const [fontSize, setFontSize] = useState(baseFontSize);

    useEffect(() => {
        const updateSize = () => {
            const width = window.innerWidth;
            if (width < 480) {
                // Mobile small
                setFontSize(Math.min(baseFontSize, Math.max(32, baseFontSize * 0.35)));
            } else if (width < 768) {
                // Mobile
                setFontSize(Math.min(baseFontSize, Math.max(48, baseFontSize * 0.5)));
            } else if (width < 1024) {
                // Tablet
                setFontSize(Math.min(baseFontSize, baseFontSize * 0.75));
            } else {
                // Desktop
                setFontSize(baseFontSize);
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, [baseFontSize]);

    return fontSize;
}

interface ImpactTextProps {
    className?: string;
    text?: string;
    config?: {
        fontSize?: number;
        color?: string;
        kerning?: number;
    };
}

// 0: Initial (All Thin, Normal)
// 1: Sequence 1 (Gradient Thin->Bold, Italic)
// 2: Sequence 2 (Gradient Bold->Thin, Normal)
type LetterState = 0 | 1 | 2;

export function ImpactText({
    className,
    text = "MORPHYS",
    config = {},
}: ImpactTextProps) {
    const letters = text.split("");
    const [phase, setPhase] = useState<"entering" | "wave">("entering");
    const [letterStates, setLetterStates] = useState<LetterState[]>(
        new Array(letters.length).fill(0)
    );
    const [isAnimating, setIsAnimating] = useState(false);

    const baseFontSize = config.fontSize ?? 100;
    const color = config.color ?? "var(--foreground)";
    const baseKerning = config.kerning ?? -20;

    // Use responsive font size
    const responsiveFontSize = useResponsiveSize(baseFontSize);

    // Scale kerning proportionally with font size
    const responsiveKerning = useMemo(() => {
        const scale = responsiveFontSize / baseFontSize;
        return baseKerning * scale;
    }, [responsiveFontSize, baseFontSize, baseKerning]);

    // Blur reveal container animation
    const containerVariants = {
        hidden: { opacity: 1 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.1,
            },
        },
    };

    // Wave animation logic
    const runWaveAnimation = useCallback(async () => {
        if (isAnimating) return;
        setIsAnimating(true);

        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        const stepDelay = 120; // Delay between each letter

        // Initial Start: We are at State 0.
        // We want to enter the loop of 1 -> 2 -> 1 -> 2

        // On first run, we define the "next" state targets
        let nextState: LetterState = 1;

        while (true) {
            if (nextState === 1) {
                // Sequence 1: Forward Wave (0/2 -> 1)
                for (let i = 0; i < letters.length; i++) {
                    setLetterStates(prev => {
                        const newStates = [...prev];
                        newStates[i] = 1;
                        return newStates;
                    });
                    await delay(stepDelay);
                }
                nextState = 2; // Next target is Sequence 2
            } else {
                // Sequence 2: Backward Wave (1 -> 2)
                for (let i = letters.length - 1; i >= 0; i--) {
                    setLetterStates(prev => {
                        const newStates = [...prev];
                        newStates[i] = 2;
                        return newStates;
                    });
                    await delay(stepDelay);
                }
                nextState = 1; // Next target is Sequence 1
            }

            // Pause between sequences
            await delay(2000);
        }
    }, [letters.length, isAnimating]);

    // Start wave animation after entrance
    useEffect(() => {
        if (phase === "wave" && !isAnimating) {
            runWaveAnimation();
        }
    }, [phase, isAnimating, runWaveAnimation]);

    return (
        <div
            className={cn(
                "relative flex items-center justify-center w-full h-full overflow-hidden bg-transparent",
                className
            )}
        >
            <motion.div
                className="flex flex-wrap justify-center"
                style={{ gap: responsiveKerning }}
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                onAnimationComplete={() => {
                    setTimeout(() => setPhase("wave"), 800);
                }}
            >
                {letters.map((char, index) => (
                    <Letter
                        key={index}
                        char={char}
                        index={index}
                        fontSize={responsiveFontSize}
                        color={color}
                        state={letterStates[index]}
                        phase={phase}
                        totalLetters={letters.length}
                    />
                ))}
            </motion.div>
        </div>
    );
}

function Letter({
    char,
    index,
    fontSize,
    color,
    state,
    phase,
    totalLetters
}: {
    char: string,
    index: number,
    fontSize: number,
    color: string,
    state: LetterState,
    phase: "entering" | "wave",
    totalLetters: number
}) {
    // Calculate weights for different states
    const minWeight = 200;
    const maxWeight = 700;

    // Avoid division by zero
    const progress = totalLetters > 1 ? index / (totalLetters - 1) : 1;

    // State 1: Gradient Thin -> Bold (Left to Right)
    // Index 0 = Min, Index N = Max
    const weightSeq1 = minWeight + (progress * (maxWeight - minWeight));

    // State 2: Gradient Bold -> Thin (Left to Right)
    // Index 0 = Max, Index N = Min
    // This is effectively reversing the gradient
    const weightSeq2 = maxWeight - (progress * (maxWeight - minWeight));

    // Determine current target properties based on state
    let currentWeight = minWeight;
    let currentSkew = 0;

    if (phase === "wave") {
        switch (state) {
            case 0: // Initial Flat
                currentWeight = minWeight;
                currentSkew = 0;
                break;
            case 1: // Seq 1 (Italic, Gradient A)
                currentWeight = weightSeq1;
                currentSkew = -12;
                break;
            case 2: // Seq 2 (Normal, Gradient B)
                currentWeight = weightSeq2;
                currentSkew = 0;
                break;
        }
    }

    const animateValue = phase === "wave"
        ? {
            filter: "blur(0px)",
            opacity: 1,
            skewX: currentSkew,
            fontVariationSettings: `'wght' ${currentWeight}`,
        }
        : "visible";

    return (
        <motion.span
            className="inline-block uppercase"
            style={{
                fontSize: fontSize,
                color: color,
                fontFamily: "'Clash Display Variable', sans-serif",
                transformOrigin: "bottom center",
                letterSpacing: 0,
                textDecoration: "none",
                WebkitTextStroke: "0px transparent",
                overflow: "hidden",
                border: "none",
                outline: "none",
                boxShadow: "none",
                textShadow: "none",
                WebkitFontSmoothing: "antialiased",
                MozOsxFontSmoothing: "grayscale",
            }}
            initial="hidden"
            animate={animateValue}
            variants={{
                hidden: {
                    filter: "blur(20px)",
                    opacity: 0,
                    skewX: 0,
                    fontVariationSettings: "'wght' 200",
                },
                visible: {
                    filter: "blur(0px)",
                    opacity: 1,
                    skewX: 0,
                    fontVariationSettings: "'wght' 200",
                    transition: {
                        duration: 0.8,
                        ease: [0.25, 0.1, 0.25, 1],
                    }
                },
            }}
            transition={{
                duration: 0.6,
                ease: "easeInOut",
            }}
        >
            {char === " " ? "\u00A0" : char}
        </motion.span>
    );
}

// Preview component for component listing cards
export function ImpactTextPreview() {
    return (
        <ImpactText
            text="LOADING"
            config={{
                fontSize: 56,
                color: "var(--foreground)",
                kerning: -4
            }}
        />
    );
}
