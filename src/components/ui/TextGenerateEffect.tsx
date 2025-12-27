"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";

interface TextGenerateEffectProps {
    words: string;
    className?: string;
    delay?: number;
}

const TextGenerateEffect = ({
    words,
    className = "",
    delay = 0,
}: TextGenerateEffectProps) => {
    const wordArray = words.split(" ");

    const containerVariants: Variants = {
        hidden: { opacity: 1 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: delay,
            },
        },
    };

    const wordVariants: Variants = {
        hidden: {
            opacity: 0,
            filter: "blur(10px)",
            y: 10,
        },
        visible: {
            opacity: 1,
            filter: "blur(0px)",
            y: 0,
            transition: {
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94],
            },
        },
    };

    return (
        <motion.p
            className={`font-body text-foreground/70 ${className}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {wordArray.map((word, index) => (
                <motion.span
                    key={index}
                    variants={wordVariants}
                    className="inline-block mr-[0.25em]"
                >
                    {word}
                </motion.span>
            ))}
        </motion.p>
    );
};

export { TextGenerateEffect };
