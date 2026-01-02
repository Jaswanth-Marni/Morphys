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
                    <nav className="flex flex-col items-center justify-center flex-1 gap-4 md:gap-8">
                        <Link href="/" onClick={handleLinkClick} className="group overflow-hidden">
                            <AnimatedLink text="Home" isLight={isLight} delayBase={0.2} />
                        </Link>
                        <Link href="/components" onClick={handleLinkClick} className="group overflow-hidden">
                            <AnimatedLink text="Components" isLight={isLight} delayBase={0.3} />
                        </Link>
                        <Link href="#" onClick={handleLinkClick} className="group overflow-hidden">
                            <AnimatedLink text="About" isLight={isLight} delayBase={0.4} />
                        </Link>
                        <Link href="#" onClick={handleLinkClick} className="group overflow-hidden">
                            <AnimatedLink text="Contact" isLight={isLight} delayBase={0.5} />
                        </Link>
                    </nav>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

interface AnimatedLinkProps {
    text: string;
    isLight: boolean;
    delayBase: number;
}

const AnimatedLink = ({ text, isLight, delayBase }: AnimatedLinkProps) => {
    const letters = text.split("");
    const centerIndex = (letters.length - 1) / 2;

    return (
        <span className="relative block overflow-hidden">
            <span className="block">
                {letters.map((char, index) => {
                    const dist = Math.abs(index - centerIndex);
                    // Standard step animation: stagger from center
                    const delay = delayBase + (dist * 0.05);

                    return (
                        <motion.span
                            key={index}
                            initial={{ y: "150%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "150%" }}
                            transition={{
                                duration: 0.5,
                                delay: delay,
                                ease: [0.33, 1, 0.68, 1],
                            }}
                            style={{ fontVariationSettings: "'wght' 700" }}
                            className={`
                                inline-block font-heading font-black uppercase text-[43px] md:text-8xl tracking-tighter group-hover:opacity-70 transition-opacity
                                ${isLight ? 'text-[#171717]' : 'text-[#ededed]'}
                            `}
                        >
                            {char === " " ? "\u00A0" : char}
                        </motion.span>
                    );
                })}
            </span>
        </span>
    );
};

export { Menu };
