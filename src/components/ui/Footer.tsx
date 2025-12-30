"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useInView, type Variants } from "framer-motion";

/**
 * Footer Component
 * A beautiful, theme-consistent footer with glassmorphism styling,
 * subtle animations, and the Morphys branding.
 */
const Footer = () => {
    const footerRef = useRef<HTMLElement>(null);
    const isInView = useInView(footerRef, { once: true, margin: "-50px" });
    const [theme, setTheme] = useState<"light" | "dark">("dark");

    useEffect(() => {
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
        return () => observer.disconnect();
    }, []);

    const isLight = theme === "light";

    const currentYear = new Date().getFullYear();

    // Animation variants
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
        visible: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: {
                duration: 0.6,
                ease: [0.25, 0.46, 0.45, 0.94],
            },
        },
    };

    const lineVariants: Variants = {
        hidden: { scaleX: 0, opacity: 0 },
        visible: {
            scaleX: 1,
            opacity: 1,
            transition: {
                duration: 0.8,
                ease: [0.25, 0.46, 0.45, 0.94],
            },
        },
    };

    // Social links with hover animations
    const socialLinks = [
        { name: "GitHub", href: "#", icon: "M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" },
        { name: "Twitter", href: "#", icon: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
        { name: "LinkedIn", href: "#", icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
    ];

    return (
        <motion.footer
            ref={footerRef}
            className="relative w-full overflow-hidden"
            style={{
                background: "var(--background)",
            }}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={containerVariants}
        >
            {/* Subtle gradient overlay at the top */}
            <div
                className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
                style={{
                    background: "linear-gradient(to bottom, var(--background) 0%, transparent 100%)",
                }}
            />

            {/* Main footer content */}
            <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 md:py-24">
                {/* Divider line */}
                <motion.div
                    className="h-px mb-12 md:mb-16 origin-left"
                    style={{
                        background: isLight
                            ? "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.15) 20%, rgba(0,0,0,0.15) 80%, transparent 100%)"
                            : "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 20%, rgba(255,255,255,0.1) 80%, transparent 100%)",
                    }}
                    variants={lineVariants}
                />

                {/* Top section - Logo and tagline */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 md:gap-16 mb-12 md:mb-16">
                    {/* Logo and tagline */}
                    <motion.div className="flex flex-col gap-4" variants={itemVariants}>
                        <span
                            className={`font-logo text-4xl md:text-5xl tracking-wide select-none ${isLight ? "text-black" : "text-white"}`}
                        >
                            Morphys
                        </span>
                        <p
                            className="text-base md:text-lg max-w-sm"
                            style={{
                                color: isLight ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.5)",
                                fontFamily: "'Clash Display Variable', sans-serif",
                                fontVariationSettings: "'wght' 400",
                            }}
                        >
                            Exploring the art of modern UI design through curated style inspirations.
                        </p>
                    </motion.div>

                    {/* Quick links */}
                    <motion.div
                        className="flex flex-col gap-4"
                        variants={itemVariants}
                    >
                        <h4
                            className="text-sm uppercase tracking-widest mb-2"
                            style={{
                                color: isLight ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.3)",
                                fontFamily: "'Clash Display Variable', sans-serif",
                                fontVariationSettings: "'wght' 600",
                            }}
                        >
                            Navigation
                        </h4>
                        <nav className="flex flex-col gap-3">
                            {[
                                { name: "Home", target: "top" },
                                { name: "Styles", target: "styles-section" },
                                { name: "About", target: "top" },
                            ].map((link) => (
                                <motion.button
                                    key={link.name}
                                    onClick={() => {
                                        if (link.target === "top") {
                                            window.scrollTo({ top: 0, behavior: "smooth" });
                                        } else {
                                            const element = document.getElementById(link.target);
                                            if (element) {
                                                element.scrollIntoView({ behavior: "smooth", block: "start" });
                                            }
                                        }
                                    }}
                                    className="text-base transition-all duration-300 text-left cursor-pointer"
                                    style={{
                                        color: isLight ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.5)",
                                        fontFamily: "'Clash Display Variable', sans-serif",
                                        fontVariationSettings: "'wght' 450",
                                        background: "none",
                                        border: "none",
                                        padding: 0,
                                    }}
                                    whileHover={{
                                        x: 6,
                                        color: isLight ? "rgba(0,0,0,0.9)" : "rgba(255,255,255,0.9)",
                                    }}
                                >
                                    {link.name}
                                </motion.button>
                            ))}
                        </nav>
                    </motion.div>

                    {/* Social links */}
                    <motion.div
                        className="flex flex-col gap-4"
                        variants={itemVariants}
                    >
                        <h4
                            className="text-sm uppercase tracking-widest mb-2"
                            style={{
                                color: isLight ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.3)",
                                fontFamily: "'Clash Display Variable', sans-serif",
                                fontVariationSettings: "'wght' 600",
                            }}
                        >
                            Connect
                        </h4>
                        <div className="flex gap-4">
                            {socialLinks.map((social) => (
                                <motion.a
                                    key={social.name}
                                    href={social.href}
                                    className="p-3 rounded-xl transition-all duration-300"
                                    style={{
                                        background: isLight
                                            ? "rgba(0,0,0,0.05)"
                                            : "rgba(255,255,255,0.05)",
                                        border: `1px solid ${isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)"}`,
                                    }}
                                    whileHover={{
                                        scale: 1.1,
                                        background: isLight
                                            ? "rgba(0,0,0,0.1)"
                                            : "rgba(255,255,255,0.1)",
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                    aria-label={social.name}
                                >
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        style={{
                                            color: isLight ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.5)",
                                        }}
                                    >
                                        <path d={social.icon} />
                                    </svg>
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Bottom section - Copyright */}
                <motion.div
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-8"
                    style={{
                        borderTop: `1px solid ${isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.06)"}`,
                    }}
                    variants={itemVariants}
                >
                    <p
                        className="text-sm"
                        style={{
                            color: isLight ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.3)",
                            fontFamily: "'Clash Display Variable', sans-serif",
                            fontVariationSettings: "'wght' 400",
                        }}
                    >
                        © {currentYear} Morphys. All rights reserved.
                    </p>
                    <p
                        className="text-sm"
                        style={{
                            color: isLight ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.3)",
                            fontFamily: "'Clash Display Variable', sans-serif",
                            fontVariationSettings: "'wght' 400",
                        }}
                    >
                        Crafted with <span className="text-red-400">♥</span> for design enthusiasts
                    </p>
                </motion.div>
            </div>

            {/* Decorative ambient glow */}
            <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 pointer-events-none opacity-30"
                style={{
                    background: `radial-gradient(ellipse 80% 100% at 50% 100%, ${isLight ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.1)"} 0%, transparent 70%)`,
                }}
            />
        </motion.footer>
    );
};

export { Footer };
