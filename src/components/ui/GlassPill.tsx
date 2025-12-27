"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useMenu } from "@/context/MenuContext";

const GlassPill = () => {
    const { isMenuOpen, showGlassPill, toggleMenu } = useMenu();
    const [theme, setTheme] = useState<"light" | "dark">("dark");
    const [mounted, setMounted] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        setMounted(true);
        const currentTheme = document.documentElement.getAttribute("data-theme") as "light" | "dark" || "dark";
        setTheme(currentTheme);

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === "data-theme") {
                    const newTheme = document.documentElement.getAttribute("data-theme") as "light" | "dark" || "dark";
                    setTheme(newTheme);
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });

        // After initial load animation, mark it as done
        const timer = setTimeout(() => {
            setIsInitialLoad(false);
        }, 3500); // After arrival sequence

        return () => {
            observer.disconnect();
            clearTimeout(timer);
        };
    }, []);

    if (!mounted) return null;

    const isLight = theme === "light";

    // Determine if we should show (either menu is open OR showGlassPill is true)
    const shouldShow = isMenuOpen || showGlassPill;

    return (
        <AnimatePresence>
            {shouldShow && (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                        scale: 1,
                        opacity: 1,
                        top: isMenuOpen ? 14 : 79, // Animate position instead of using class
                    }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{
                        delay: isInitialLoad ? 2.8 : 0,
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                        top: {
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                        }
                    }}
                    onClick={toggleMenu}
                    className={`fixed left-1/2 -translate-x-1/2
                        ${isMenuOpen ? 'z-[70]' : 'z-[55]'}
                    `}
                    style={{
                        willChange: "transform, top",
                    }}
                >
                    <div
                        className={`rounded-full border transition-all duration-300 w-[110px] md:w-[140px] h-[6px] hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl cursor-pointer
                            ${isLight
                                ? 'bg-[#0A0A0A]/60 border-white/20 backdrop-blur-sm shadow-lg'
                                : 'bg-white/10 border-black/20 backdrop-blur-sm'
                            }
                        `}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export { GlassPill };
