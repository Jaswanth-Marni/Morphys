"use client";

import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ImpactTextProps {
    className?: string;
    text?: string;
    config?: {
        fontSize?: number;
        color?: string;
        kerning?: number;
    };
}

export function ImpactText({
    className,
    text = "MORPHYS",
    config = {},
}: ImpactTextProps) {
    const letters = text.split("");
    const [hasEntered, setHasEntered] = useState(false);

    const {
        fontSize = 100,
        color = "var(--foreground)",
        kerning = -20
    } = config;

    // Entrance Animation (Impact)
    const containerVariants = {
        hidden: { opacity: 1 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
                delayChildren: 0.2,
            },
        },
    };

    const letterVariants: Variants = {
        hidden: {
            y: "150%",
            scaleY: 1,
            scaleX: 1,
            opacity: 0
        },
        visible: {
            y: "0%",
            opacity: 1,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 200,
                // The "squish" is simulated by the spring overshoot if we mapped scale to velocity,
                // but Framer Motion springs don't auto-squash.
                // We'll use keyframes for a custom squash effect on impact.
            }
        }
    };

    // We can simulate the squash by chaining animations or using a keyframe sequence in the 'animate' prop.
    // However, to keep it clean with stagger, we'll use a custom variant that includes the squash.

    const impactVariants: Variants = {
        hidden: {
            y: "120%",
            scaleY: 2.5, // Stretched while moving up
            scaleX: 0.7,
            opacity: 0,
            filter: "blur(10px)"
        },
        visible: {
            y: "0%",
            scaleY: 1,
            scaleX: 1,
            opacity: 1,
            filter: "blur(0px)",
            transition: {
                // Keyframes for Y: Go up, hit "wall", settle.
                y: {
                    type: "spring",
                    damping: 15,
                    stiffness: 300,
                },
                // Keyframes for Scale: Stretch -> Squash (impact) -> Settle
                scaleY: {
                    duration: 0.6,
                    times: [0, 0.6, 0.8, 1],
                    keyframes: [2.5, 0.5, 1.1, 1] // Start stretched, Squash hard, Bounce, Normal
                },
                scaleX: {
                    duration: 0.6,
                    times: [0, 0.6, 0.8, 1],
                    keyframes: [0.7, 1.5, 0.9, 1] // Start thin, Widen (squash), Bounce, Normal
                },
                filter: { duration: 0.3 }
            }
        }
    };

    // Wave Sequence (Normal -> Italic -> Normal)
    // We'll use a separate state or control for this after entrance.

    return (
        <div
            className={cn(
                "relative flex items-center justify-center w-full h-full overflow-hidden bg-transparent",
                className
            )}
            style={{ perspective: "1000px" }}
        >
            <motion.div
                className="flex"
                style={{ gap: kerning }}
                initial="hidden"
                animate={hasEntered ? "loop" : "visible"}
                variants={containerVariants}
                onAnimationComplete={() => {
                    // Start the loop after entrance
                    // We need a slight delay to ensure all letters settled? 
                    // onAnimationComplete on the container fires when children potentially finish?
                    // Actually, stagger makes container finish 'start' immediately, but we should wait.
                    // Let's use a timeout or just let the sequence loop start.
                    setTimeout(() => setHasEntered(true), 1500);
                }}
            >
                {letters.map((char, index) => (
                    <Letter
                        key={index}
                        char={char}
                        index={index}
                        fontSize={fontSize}
                        color={color}
                        hasEntered={hasEntered}
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
    hasEntered
}: {
    char: string,
    index: number,
    fontSize: number,
    color: string,
    hasEntered: boolean
}) {
    // Entrance: Impact
    const impactParams = {
        y: {
            type: "spring",
            damping: 12,
            stiffness: 200,
        }
    };

    return (
        <motion.span
            className="inline-block relative font-black uppercase tracking-tighter"
            style={{
                fontSize: fontSize,
                color: color,
                transformOrigin: "bottom center", // Squash from bottom
            }}
            variants={{
                hidden: {
                    y: "150%",
                    scaleY: 2,
                    scaleX: 0.8,
                    opacity: 0,
                },
                visible: {
                    y: "0%",
                    scaleY: [2, 0.6, 1.1, 0.95, 1], // Stretch -> Squash -> Bounce -> Settle
                    scaleX: [0.8, 1.4, 0.9, 1.05, 1],
                    opacity: 1,
                    transition: {
                        duration: 0.8,
                        ease: "circOut",
                        times: [0, 0.6, 0.75, 0.9, 1], // Time keyframes
                    }
                },
                loop: {
                    skewX: [0, -20, 0],
                    scaleY: [1, 0.95, 1],
                    x: [0, 2, 0],
                    y: "0%", // Ensure text stays in place
                    opacity: 1, // Ensure text stays visible
                    transition: {
                        duration: 0.8,
                        repeat: Infinity,
                        repeatDelay: 1.5,
                        delay: index * 0.1, // Wave effect
                        ease: "easeInOut"
                    }
                }
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
                fontSize: 32,
                color: "var(--foreground)",
                kerning: -2
            }}
        />
    );
}
