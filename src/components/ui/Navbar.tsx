"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from './ThemeToggle';
import { useMenu } from "@/context/MenuContext";

/**
 * Navbar Component
 * Features: Floating pill design, glassmorphism, and custom logo/theme toggle.
 * Hides when menu is open.
 */
const Navbar = () => {
    const { isMenuOpen } = useMenu();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    // Observe theme changes from localStorage or DOM attribute
    const [theme, setTheme] = useState<"light" | "dark">("dark");

    useEffect(() => {
        setMounted(true);
        // Initial theme check
        const currentTheme = document.documentElement.getAttribute("data-theme") as "light" | "dark" || "dark";
        setTheme(currentTheme);

        // Observer for theme attribute changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === "data-theme") {
                    const newTheme = document.documentElement.getAttribute("data-theme") as "light" | "dark" || "dark";
                    setTheme(newTheme);
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);

        // After initial animation, mark it as done
        const timer = setTimeout(() => {
            setIsInitialLoad(false);
        }, 1500);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            observer.disconnect();
            clearTimeout(timer);
        };
    }, []);

    if (!mounted) return null;

    const isLight = theme === "light";

    return (
        <AnimatePresence>
            {!isMenuOpen && (
                <motion.nav
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    transition={{ delay: isInitialLoad ? 0.5 : 0, type: "spring", stiffness: 100, damping: 20 }}
                    className="fixed top-0 left-1/2 -translate-x-1/2 z-[110] w-full max-w-5xl px-4 mt-[14px]"
                >
                    <div
                        className={`flex items-center justify-between h-[61px] px-4 md:px-6 rounded-2xl border transition-all duration-500 ${isScrolled
                            ? isLight
                                ? 'bg-white/10 border-black/10 backdrop-blur-lg shadow-2xl' // Light mode scrolled
                                : 'bg-black/60 border-white/20 backdrop-blur-lg shadow-2xl' // Dark mode scrolled
                            : isLight
                                ? 'bg-white/5 border-black/10 backdrop-blur-sm' // Light mode top
                                : 'bg-[#0A0A0A]/80 border-white/10 backdrop-blur-sm shadow-lg' // Dark mode top
                            }`}
                    >
                        {/* --- LOGO SECTION --- */}
                        <div className="flex items-center cursor-pointer">
                            <span className={`font-logo text-3xl tracking-wide select-none ${isLight ? 'text-black' : 'text-white'}`}>
                                Morphys
                            </span>
                        </div>

                        {/* --- THEME TOGGLE --- */}
                        <div className="flex items-center">
                            <ThemeToggle />
                        </div>
                    </div>
                </motion.nav>
            )}
        </AnimatePresence>
    );
};

export default Navbar;
