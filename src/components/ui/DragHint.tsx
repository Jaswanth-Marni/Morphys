"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";

/**
 * DragHint Component
 * A glassmorphism pill that appears after the arrival sequence and
 * disappears when the user drags any letter from the heading.
 */
const DragHint = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [mounted, setMounted] = useState(false);
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

        // Listen for letter drag event
        const handleLetterDragged = () => {
            setIsVisible(false);
        };
        window.addEventListener('letterDragged', handleLetterDragged);

        return () => {
            themeObserver.disconnect();
            window.removeEventListener('letterDragged', handleLetterDragged);
        };
    }, []);

    if (!mounted) return null;

    const isLight = theme === "light";

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="absolute bottom-full mb-4 left-0 right-0 flex justify-center pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                        transition={{
                            delay: 3.2,
                            duration: 0.5,
                            ease: "easeOut",
                        }}
                        className={`flex items-center justify-center px-4 py-[3px] rounded-full pointer-events-auto
                            ${isLight
                                ? 'bg-[#171717] text-[#ededed]'
                                : 'bg-[#ededed] text-[#171717]'
                            }
                        `}
                    >
                        <span className="font-body text-xs tracking-wide">
                            drag letters
                        </span>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export { DragHint };
