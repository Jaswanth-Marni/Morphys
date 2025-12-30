"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useMenu } from "@/context/MenuContext";
import Link from 'next/link';

/**
 * Menu Component
 * Full-screen menu that slides down from the top when GlassPill is clicked.
 */
const Menu = () => {
    const { isMenuOpen, closeMenu } = useMenu();
    const [mounted, setMounted] = useState(false);
    const [theme, setTheme] = useState<"light" | "dark">("dark");

    useEffect(() => {
        setMounted(true);
        const currentTheme = document.documentElement.getAttribute("data-theme") as "light" | "dark" || "dark";
        setTheme(currentTheme);

        const themeObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === "data-theme") {
                    const newTheme = document.documentElement.getAttribute("data-theme") as "light" | "dark" || "dark";
                    setTheme(newTheme);
                }
            });
        });
        themeObserver.observe(document.documentElement, { attributes: true });

        return () => {
            themeObserver.disconnect();
        };
    }, []);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMenuOpen]);

    if (!mounted) return null;

    const isLight = theme === "light";

    const handleLinkClick = () => {
        closeMenu();
    };

    return (
        <AnimatePresence>
            {isMenuOpen && (
                <motion.div
                    initial={{ y: "-100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "-100%" }}
                    transition={{
                        type: "spring",
                        stiffness: 100,
                        damping: 20,
                    }}
                    className={`fixed inset-0 z-[60] flex flex-col items-center pt-24
                        ${isLight
                            ? 'bg-[#f5f5f5]'
                            : 'bg-[#080808]'
                        }
                    `}
                >
                    {/* Menu Content */}
                    <nav className="flex flex-col items-center justify-center flex-1 gap-8">
                        <Link href="/" onClick={handleLinkClick}>
                            <motion.span
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className={`font-heading text-5xl md:text-7xl tracking-wide hover:opacity-70 transition-opacity block
                                    ${isLight ? 'text-[#171717]' : 'text-[#ededed]'}
                                `}
                            >
                                Home
                            </motion.span>
                        </Link>
                        <Link href="/components" onClick={handleLinkClick}>
                            <motion.span
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className={`font-heading text-5xl md:text-7xl tracking-wide hover:opacity-70 transition-opacity block
                                    ${isLight ? 'text-[#171717]' : 'text-[#ededed]'}
                                `}
                            >
                                Components
                            </motion.span>
                        </Link>
                        <Link href="#" onClick={handleLinkClick}>
                            <motion.span
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className={`font-heading text-5xl md:text-7xl tracking-wide hover:opacity-70 transition-opacity block
                                    ${isLight ? 'text-[#171717]' : 'text-[#ededed]'}
                                `}
                            >
                                About
                            </motion.span>
                        </Link>
                        <Link href="#" onClick={handleLinkClick}>
                            <motion.span
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className={`font-heading text-5xl md:text-7xl tracking-wide hover:opacity-70 transition-opacity block
                                    ${isLight ? 'text-[#171717]' : 'text-[#ededed]'}
                                `}
                            >
                                Contact
                            </motion.span>
                        </Link>
                    </nav>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export { Menu };
