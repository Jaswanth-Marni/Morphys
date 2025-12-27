"use client";

import React, { useEffect, useState } from "react";
import { motion, type Transition, type Variants } from "framer-motion";

const ThemeToggle = () => {
    const [theme, setTheme] = useState<"light" | "dark">("dark");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const savedTheme = (localStorage.getItem("theme") as "light" | "dark") || "dark";
        setTheme(savedTheme);
        document.documentElement.setAttribute("data-theme", savedTheme);
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
    };

    if (!mounted) return null;

    const isLight = theme === "light";

    // Transition settings
    const transition: Transition = { duration: 0.5, ease: "easeInOut" };

    // Filament animation - draws from bottom up
    const filamentVariants: Variants = {
        hidden: { pathLength: 0, opacity: 0, transition: { duration: 0.3 } },
        visible: { pathLength: 1, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
    };

    // Rays animation - reveal from bottom of bulb head (center outwards)
    const raysContainerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.2 } }
    };

    const rayVariants: Variants = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: { pathLength: 1, opacity: 1, transition: { duration: 0.4 } }
    };

    return (
        <div
            onClick={toggleTheme}
            className="relative flex items-center justify-center w-8 h-8 cursor-pointer"
            role="button"
            aria-label="Toggle theme"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && toggleTheme()}
        >
            {/* SVG Container */}
            <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="w-full h-full text-foreground"
                initial={false}
                animate={isLight ? "light" : "dark"}
            >
                <g transform="translate(3,3) scale(0.75)">
                    {/* Bulb Body - always visible but can animate fill/stroke if needed */}
                    <motion.path
                        d="M9 18h6v-1a.5.5 0 0 1 .5-.5h-7a.5.5 0 0 1 .5.5v1zm0 2h6v-1a.5.5 0 0 1 .5-.5h-7a.5.5 0 0 1 .5.5v1z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-foreground"
                    />
                    <motion.path
                        d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={false}
                        animate={{
                            stroke: isLight ? "currentColor" : "currentColor",
                            fill: isLight ? "transparent" : "transparent"
                        }}
                        transition={transition}
                    />

                    {/* Filaments - Two lines from bottom curving into full circles and meeting at center, made taller */}
                    {/* Left Filament */}
                    <motion.path
                        d="M 10 15 C 10 14 10 9 10 9 C 10 7 7 7 7 9 C 7 11 10 11 12 9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        variants={filamentVariants}
                        initial="hidden"
                        animate={isLight ? "visible" : "hidden"}
                        className="text-foreground"
                    />
                    {/* Right Filament */}
                    <motion.path
                        d="M 14 15 C 14 14 14 9 14 9 C 14 7 17 7 17 9 C 17 11 14 11 12 9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        variants={filamentVariants}
                        initial="hidden"
                        animate={isLight ? "visible" : "hidden"}
                        className="text-foreground"
                    />

                    {/* Light Rays - Ordered Left to Right for staggering animation */}
                    <motion.g
                        variants={raysContainerVariants}
                        initial="hidden"
                        animate={isLight ? "visible" : "hidden"}
                        className="text-foreground"
                    >
                        {/* 1. Left */}
                        <motion.line x1="3" y1="9" x2="0" y2="9" strokeLinecap="round" variants={rayVariants} />

                        {/* 2. Top Left */}
                        <motion.line x1="5.5" y1="2.5" x2="3.5" y2="0.5" strokeLinecap="round" variants={rayVariants} />

                        {/* 3. Bottom Left */}
                        <motion.line x1="5.5" y1="15.5" x2="3.5" y2="17.5" strokeLinecap="round" variants={rayVariants} />

                        {/* 4. Top */}
                        <motion.line x1="12" y1="0" x2="12" y2="-3" strokeLinecap="round" variants={rayVariants} />

                        {/* 5. Top Right */}
                        <motion.line x1="18.5" y1="2.5" x2="20.5" y2="0.5" strokeLinecap="round" variants={rayVariants} />

                        {/* 6. Bottom Right */}
                        <motion.line x1="18.5" y1="15.5" x2="20.5" y2="17.5" strokeLinecap="round" variants={rayVariants} />

                        {/* 7. Right */}
                        <motion.line x1="21" y1="9" x2="24" y2="9" strokeLinecap="round" variants={rayVariants} />
                    </motion.g>
                </g>
            </motion.svg>
        </div>
    );
};

export { ThemeToggle };
