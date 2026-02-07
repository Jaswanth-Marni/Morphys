"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RunningOutlineConfig {
    words?: Item[];
    color?: string;
    gap?: number;
}

interface Item {
    text: string;
    font: string;
}

interface RunningOutlineProps {
    config?: RunningOutlineConfig;
    containerClassName?: string;
}

const defaultWords: Item[] = [
    { text: "OUTLINE", font: "font-thunder" }
];

export function RunningOutline({ config = {}, containerClassName = "" }: RunningOutlineProps) {
    const items = config.words || defaultWords;
    const customColor = config.color; // Allow overriding the color via config
    const gap = config.gap || 20;

    return (
        <div
            className={`w-full h-full flex flex-col items-center justify-center bg-transparent text-foreground ${containerClassName}`}
            style={{
                gap,
                color: customColor // This sets 'currentColor' for children
            }}
        >
            {items.map((item, i) => (
                <OutlineItem key={i} text={item.text} font={item.font} />
            ))}
        </div>
    );
}

function OutlineItem({ text, font }: { text: string; font: string }) {
    // Split text into array of characters, preserving spaces
    const chars = Array.from(text);
    const [isHovered, setIsHovered] = useState(false);

    // Determine font size based on font family
    // Kugile stays smaller, others get much bigger
    const isKugile = font.includes('kugile');
    const textSizeClass = isKugile
        ? "text-9xl md:text-[10rem]"
        : "text-[10rem] md:text-[15rem] leading-[0.8]";

    return (
        <div
            className="flex flex-wrap justify-center items-center select-none cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {chars.map((char, i) => (
                <LetterItem
                    key={i}
                    char={char}
                    font={font}
                    textSizeClass={textSizeClass}
                    isHovered={isHovered}
                />
            ))}
        </div>
    );
}

function LetterItem({ char, font, textSizeClass, isHovered }: { char: string; font: string; textSizeClass: string; isHovered: boolean }) {
    const id = React.useId();
    const maskId = `mask-${id.replace(/:/g, "")}`;

    // Randomize animation params per letter
    const animationParams = React.useMemo(() => {
        const direction = Math.random() > 0.5 ? 1 : -1;
        // Fixed duration for synchronized movement
        const duration = 10;

        // Longer lines (60px), not thicker
        const dashArray = "60 20";

        // Distance covers the bigger size
        const distance = 250 * direction;

        return { duration, dashArray, distance };
    }, []);

    // Handle space character
    if (char === " ") {
        return <span className={`${textSizeClass} opacity-0`}>&nbsp;</span>;
    }

    return (
        <div className="relative flex items-center justify-center py-10">
            {/* Invisible text for layout */}
            <span className={`${font} ${textSizeClass} opacity-0 pointer-events-none`}>
                {char}
            </span>

            {/* Absolute SVG for effect */}
            <svg
                className="absolute inset-0 w-full h-full overflow-visible"
            >
                <defs>
                    <mask id={maskId}>
                        <motion.text
                            x="50%"
                            y="50%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            // Use same font classes to match layout
                            className={`${font} ${textSizeClass} uppercase`}
                            initial={{
                                strokeDasharray: "0 0",
                                strokeWidth: 0,
                                fill: "white"
                            }}
                            animate={{
                                strokeWidth: isHovered ? 4 : 0, // Medium thickness lines
                                strokeDasharray: isHovered ? animationParams.dashArray : "0 0",
                                fontStyle: isHovered ? "italic" : "normal",
                                strokeDashoffset: isHovered ? [0, animationParams.distance, 0] : 0,
                                fill: isHovered ? "black" : "white"
                            }}
                            transition={{
                                strokeDashoffset: {
                                    repeat: Infinity,
                                    // Use the cubic bezier for the dramatic slow-down effect
                                    ease: [
                                        [0.215, 0.61, 0.355, 1],
                                        [0.215, 0.61, 0.355, 1]
                                    ],
                                    duration: animationParams.duration,
                                    times: [0, 0.5, 1]
                                },
                                // Instant transitions for state changes
                                fill: { duration: 0 },
                                strokeWidth: { duration: 0 },
                                strokeDasharray: { duration: 0 },
                                fontStyle: { duration: 0 }
                            }}
                            style={{
                                stroke: "white",
                                paintOrder: "stroke fill"
                            }}
                        >
                            {char}
                        </motion.text>
                    </mask>
                </defs>

                <rect
                    x="-50%"
                    y="-50%"
                    width="200%"
                    height="200%"
                    fill="currentColor"
                    mask={`url(#${maskId})`}
                />
            </svg>
        </div>
    );
}
