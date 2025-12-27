"use client";

import { motion, useSpring, useTransform, MotionValue } from "framer-motion";
import { useEffect, useState, useRef } from "react";

type TextFlowProps = {
    text: string;
    className?: string;
};

// The character set to scroll through
// Grouped to minimize scroll distance for common transitions if we wanted smart logic,
// but for simple flow, linear A-Z is best.
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789- ";

const AnimatedCharacter = ({ char }: { char: string }) => {
    // Determine target index
    const index = CHARS.indexOf(char);
    const isKnown = index !== -1;

    // Spring for vertical scroll - Tuned for impact/swing effect
    const ySpring = useSpring(isKnown ? index : 0, {
        stiffness: 150,
        damping: 12,
        mass: 1.2,
    });

    useEffect(() => {
        if (isKnown) ySpring.set(index);
    }, [index, isKnown, ySpring]);

    const y = useTransform(ySpring, (val) => `-${val * 2}em`);

    // We can't easily animate width perfectly for every character without measuring.
    // However, if we put the strip inside a container that just displays the current char visually hidden
    // but taking up space, the layout will flow naturally.

    return (
        // Increased height to 2em (huge buffer) to prevent clipping
        <span
            className="inline-flex relative overflow-hidden h-[2em] mx-[0.02em]"
            style={{
                maskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)"
            }}
        >
            {/* Layout spacer */}
            <span className="opacity-0 select-none leading-none">
                {char === " " ? "\u00A0" : char}
            </span>

            {/* The scrolling strip */}
            {isKnown && (
                <motion.span
                    className="absolute left-0 top-0 flex flex-col items-center w-full"
                    style={{ y }}
                >
                    {CHARS.split("").map((c, i) => (
                        <span key={i} className="h-[2em] flex items-center justify-center leading-none">
                            {c === " " ? "\u00A0" : c}
                        </span>
                    ))}
                </motion.span>
            )}

            {!isKnown && (
                <span className="absolute left-0 top-0 h-[2em] w-full flex items-center justify-center leading-none">
                    {char}
                </span>
            )}
        </span>
    );
};


const TextFlow = ({ text, className = "" }: TextFlowProps) => {
    // Split text into characters
    const characters = text.split("");

    return (
        <div className={`flex items-center justify-center ${className}`}>
            {/* Use layout animation for entered/exiting characters if the length changes */}
            {/* But simple mapping is usually enough if length doesn't drastically jump around */}
            {/* To properly handle length changes smoothly, we should use AnimatePresence or simpler keying */}

            {characters.map((char, i) => (
                <AnimatedCharacter
                    key={i} // Using index because we want the "slot" at position i to scroll to the new letter
                    char={char}
                />
            ))}
        </div>
    );
};

export { TextFlow };
