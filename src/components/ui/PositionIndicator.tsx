"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { uiStyles } from "@/data/styles";

type PositionIndicatorProps = {
    activeStyleId: string;
    className?: string;
};

export const PositionIndicator = ({
    activeStyleId,
    className = ""
}: PositionIndicatorProps) => {
    const activeStyle = uiStyles.find(s => s.id === activeStyleId);

    if (!activeStyle) return null;

    return (
        <motion.div
            className={`fixed top-6 left-6 z-[100] ${className}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
        >
            {/* Glassmorphism container */}
            <div
                className="flex items-center gap-3 px-4 py-2.5 rounded-full"
                style={{
                    background: "rgba(128, 128, 128, 0.1)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    border: "1px solid color-mix(in srgb, var(--foreground) 10%, transparent)",
                    boxShadow: "0 4px 24px rgba(0, 0, 0, 0.1)",
                }}
            >
                {/* Accent dot indicator */}
                <motion.div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                        backgroundColor: activeStyle.accentColor,
                        boxShadow: `0 0 8px ${activeStyle.accentColor}`,
                    }}
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [1, 0.8, 1],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />

                {/* Style name with animation on change */}
                <AnimatePresence mode="wait">
                    <motion.span
                        key={activeStyleId}
                        className="text-sm tracking-wide text-foreground/90"
                        style={{
                            fontFamily: "'Clash Display Variable', sans-serif",
                            fontVariationSettings: "'wght' 500",
                        }}
                        initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                        {activeStyle.title}
                    </motion.span>
                </AnimatePresence>
            </div>
        </motion.div>
    );
};
