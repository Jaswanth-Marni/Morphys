"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";

/**
 * ScrollIndicator Component
 * A vertical line that "draws" itself downward, indicating scroll direction.
 * Fades out when user starts scrolling.
 */
const ScrollIndicator = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [hasAnimatedOnce, setHasAnimatedOnce] = useState(false);
    const [theme, setTheme] = useState<"light" | "dark">("dark");

    useEffect(() => {
        setMounted(true);
        const currentTheme = document.documentElement.getAttribute("data-theme") as "light" | "dark" || "dark";
        setTheme(currentTheme);

        // Observer for theme changes
        const themeObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === "data-theme") {
                    const newTheme = document.documentElement.getAttribute("data-theme") as "light" | "dark" || "dark";
                    setTheme(newTheme);
                }
            });
        });
        themeObserver.observe(document.documentElement, { attributes: true });

        // Hide on scroll, show when back at top
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsVisible(false);
                setHasAnimatedOnce(true); // Mark that we've shown it once
            } else {
                setIsVisible(true);
            }
        };
        window.addEventListener('scroll', handleScroll);

        return () => {
            themeObserver.disconnect();
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    if (!mounted) return null;

    const isLight = theme === "light";
    const lineColor = isLight ? "#171717" : "#ededed";

    // Only use delays on first appearance
    const opacityDelay = hasAnimatedOnce ? 0 : 3.5;
    const lineDelay = hasAnimatedOnce ? 0 : 3.8;
    const dotDelay = hasAnimatedOnce ? 0.3 : 5.0;

    return (
        // Fixed height container to prevent layout shift
        <div className="mt-12 h-[80px] flex flex-col items-center">
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{
                            delay: opacityDelay,
                            duration: 0.5,
                            ease: "easeOut",
                        }}
                        className="flex flex-col items-center"
                    >
                        {/* The drawing line */}
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 60 }}
                            transition={{
                                delay: lineDelay,
                                duration: hasAnimatedOnce ? 0.4 : 1.2,
                                ease: [0.25, 0.46, 0.45, 0.94],
                            }}
                            className="w-[1px] overflow-hidden"
                            style={{ backgroundColor: lineColor }}
                        />

                        {/* Glowing tip/dot at the end */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{
                                opacity: 1,
                                scale: [0.6, 1.2, 0.6],
                            }}
                            transition={{
                                delay: dotDelay,
                                duration: 2,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                            className="w-1.5 h-1.5 rounded-full mt-1"
                            style={{
                                backgroundColor: lineColor,
                                boxShadow: `0 0 8px ${lineColor}40`,
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export { ScrollIndicator };
