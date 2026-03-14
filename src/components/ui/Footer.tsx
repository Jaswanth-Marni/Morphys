"use client";

import React, { useRef, useEffect, useCallback, useMemo } from "react";
import { motion, useInView } from "framer-motion";

// ============================================================
// CSS-ONLY MARQUEE ROW — zero JS animation overhead
// ============================================================
const MarqueeRow = ({
    items,
    duration = 40,
    reverse = false,
}: {
    items: string[];
    duration?: number;
    reverse?: boolean;
}) => {
    // Only duplicate twice (enough for seamless loop)
    const content = useMemo(() => [...items, ...items], [items]);

    return (
        <div
            className="relative overflow-hidden whitespace-nowrap"
            style={{
                maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
                WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            }}
        >
            <div
                className="inline-flex gap-8 md:gap-16 footer-marquee"
                style={{
                    animationDuration: `${duration}s`,
                    animationDirection: reverse ? "reverse" : "normal",
                }}
            >
                {content.map((item, i) => (
                    <span
                        key={i}
                        className="text-sm md:text-base tracking-[0.3em] uppercase font-body text-foreground/25 hover:text-foreground/70 transition-colors duration-300 cursor-default select-none inline-block py-2"
                    >
                        {item}
                    </span>
                ))}
            </div>
        </div>
    );
};

// ============================================================
// CSS-DRIVEN ORBITAL SOCIAL ICON — no rAF, no setState
// Uses CSS animation on a wrapper div for the orbit path,
// and only React for hover state (tooltip).
// ============================================================
const CSSOrbitIcon = ({
    children,
    href,
    label,
    orbitIndex,
    duration,
}: {
    children: React.ReactNode;
    href: string;
    label: string;
    orbitIndex: number;
    duration: number;
}) => {
    return (
        <div
            className="absolute left-1/2 top-1/2 footer-orbit-wrapper"
            style={{
                // Each icon gets its own animation with a phase offset
                animationDuration: `${duration}s`,
                animationDelay: `${-(duration / 4) * orbitIndex}s`,
            }}
        >
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-orbit-icon glass rounded-full flex items-center justify-center overflow-hidden group"
                aria-label={label}
            >
                <div className="relative z-10 text-foreground group-hover:scale-110 transition-transform duration-200">
                    {children}
                </div>
                {/* Hover fill sweep */}
                <div className="absolute inset-0 bg-[color-mix(in_srgb,var(--foreground)_12%,transparent)] translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-full" />
                {/* Tooltip */}
                <span className="footer-orbit-tooltip font-body">
                    {label}
                </span>
            </a>
        </div>
    );
};

// ============================================================
// VARIABLE WEIGHT LETTER — simple hover, entrance via CSS
// ============================================================
const FooterLetter = ({ letter, index }: { letter: string; index: number }) => (
    <span
        className="heading-letter footer-letter"
        style={{ animationDelay: `${0.8 + index * 0.07}s` }}
    >
        {letter}
    </span>
);

// ============================================================
// MAIN FOOTER COMPONENT
// ============================================================
const Footer = () => {
    const containerRef = useRef<HTMLElement>(null);
    const auroraRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(containerRef, { once: true, margin: "-100px" });

    // Mouse tracking via CSS custom properties — ZERO re-renders
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!auroraRef.current || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        auroraRef.current.style.setProperty("--mx", `${x}px`);
        auroraRef.current.style.setProperty("--my", `${y}px`);
    }, []);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        el.addEventListener("mousemove", handleMouseMove, { passive: true });
        return () => el.removeEventListener("mousemove", handleMouseMove);
    }, [handleMouseMove]);

    const socials = useMemo(() => [
        {
            name: "Twitter",
            href: "#",
            duration: 16,
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            ),
        },
        {
            name: "GitHub",
            href: "#",
            duration: 18,
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
            ),
        },
        {
            name: "LinkedIn",
            href: "#",
            duration: 14,
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
            ),
        },
        {
            name: "Dribbble",
            href: "#",
            duration: 20,
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32" />
                </svg>
            ),
        },
    ], []);

    const navLinks = useMemo(() => ["Home", "Styles", "Components", "About", "Contact"], []);
    const navLinks2 = useMemo(() => ["Documentation", "Changelog", "Playground", "Pricing", "Blog"], []);

    return (
        <motion.footer
            ref={containerRef}
            className="relative w-full min-h-screen flex flex-col items-center justify-between overflow-hidden"
            style={{ background: "var(--background)" }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
        >
            {/* ========== TOP GRADIENT MASK ========== */}
            <div
                className="absolute top-0 left-0 right-0 h-48 pointer-events-none z-10"
                style={{
                    background: "var(--background)",
                    maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
                }}
            />

            {/* ========== MAGNETIC CURSOR AURORA — CSS custom props, no re-renders ========== */}
            <div
                ref={auroraRef}
                className="absolute inset-0 pointer-events-none z-[2] footer-aurora"
                style={{ "--mx": "50%", "--my": "50%" } as React.CSSProperties}
            />

            {/* ========== GRID PATTERN ========== */}
            <div
                className="absolute inset-0 pointer-events-none z-[1] opacity-[0.025]"
                style={{
                    backgroundImage: `
                        linear-gradient(color-mix(in srgb, var(--foreground) 30%, transparent) 1px, transparent 1px),
                        linear-gradient(90deg, color-mix(in srgb, var(--foreground) 30%, transparent) 1px, transparent 1px)
                    `,
                    backgroundSize: "80px 80px",
                }}
            />

            {/* ========== MAIN CONTENT AREA ========== */}
            <div className="relative z-20 flex-1 w-full max-w-7xl mx-auto flex flex-col items-center justify-center px-4 md:px-8 pt-32 pb-8">

                {/* ---- ORBIT ZONE — socials orbit via pure CSS ---- */}
                <div className="relative w-full flex items-center justify-center footer-orbit-container">
                    {/* Orbit Path Visualization - subtle dashed ellipse */}
                    <motion.div
                        className="absolute rounded-full pointer-events-none hidden sm:block footer-orbit-path"
                        initial={{ opacity: 0, scale: 0.5 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4, duration: 1 }}
                    />

                    {/* Orbital Social Icons — CSS animated, hidden on small screens */}
                    <div className="hidden sm:block">
                        {socials.map((social, i) => (
                            <CSSOrbitIcon
                                key={social.name}
                                href={social.href}
                                label={social.name}
                                orbitIndex={i}
                                duration={social.duration}
                            >
                                {social.icon}
                            </CSSOrbitIcon>
                        ))}
                    </div>

                    {/* Mobile: Simple row of social icons */}
                    <div className="flex sm:hidden gap-4 absolute -bottom-4">
                        {socials.map((social, i) => (
                            <motion.a
                                key={social.name}
                                href={social.href}
                                className="w-12 h-12 rounded-full glass flex items-center justify-center text-foreground hover:scale-110 active:scale-95 transition-transform"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 + i * 0.1 }}
                                aria-label={social.name}
                            >
                                {social.icon}
                            </motion.a>
                        ))}
                    </div>
                </div>

                {/* ---- MIDDLE INFO BAR ---- */}
                <motion.div
                    className="w-full max-w-4xl mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                >
                    {[
                        { label: "Location", value: "Earth, Milky Way" },
                        { label: "Status", value: "Open Source" },
                        { label: "Built With", value: "React • Motion" },
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                            <span className="text-[10px] tracking-[0.3em] uppercase font-body text-foreground/30">
                                {item.label}
                            </span>
                            <span
                                className="text-sm tracking-wider text-foreground/60"
                                style={{ fontFamily: "'Clash Display Variable', sans-serif", fontVariationSettings: "'wght' 500" }}
                            >
                                {item.value}
                            </span>
                        </div>
                    ))}
                </motion.div>

                {/* ---- MARQUEE NAVIGATION STRIPS — pure CSS animation ---- */}
                <motion.div
                    className="w-full mt-16 space-y-1"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                >
                    <MarqueeRow items={navLinks} duration={35} />
                    <MarqueeRow items={navLinks2} duration={45} reverse />
                    <MarqueeRow items={[...navLinks, ...navLinks2]} duration={30} />
                </motion.div>
            </div>

            {/* ========== BOTTOM SECTION — the massive logo strip ========== */}
            <div className="w-full relative z-20 flex flex-col items-center justify-end pb-4 md:pb-6 overflow-hidden">

                {/* Visual separator — thin line with CSS animation */}
                <motion.div
                    className="w-[92%] h-px mb-8 md:mb-10"
                    style={{ background: "color-mix(in srgb, var(--foreground) 10%, transparent)" }}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6, duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                />

                {/* Copyright row */}
                <div className="flex flex-col sm:flex-row justify-between w-[92%] font-body text-[10px] sm:text-xs tracking-widest text-foreground/30 uppercase mb-4 px-4 gap-2 text-center">
                    <span>© {new Date().getFullYear()} Morphys</span>
                    <span className="hidden sm:inline text-foreground/10">✦</span>
                    <span>All Rights Reserved</span>
                </div>

                {/* MASSIVE VARIABLE WEIGHT LOGO — CSS entrance animation */}
                <div
                    className="w-full text-center flex justify-center leading-[0.75] select-none"
                    style={{
                        fontFamily: "'Clash Display Variable', sans-serif",
                        fontSize: "clamp(3rem, 16vw, 22rem)",
                    }}
                >
                    {"MORPHYS".split("").map((char, index) => (
                        <FooterLetter key={index} letter={char} index={index} />
                    ))}
                </div>
            </div>

            {/* ========== AMBIENT GLOW ========== */}
            <div
                className="absolute inset-0 z-0 pointer-events-none opacity-15"
                style={{
                    background: `
                        radial-gradient(ellipse 60% 40% at 20% 80%, rgba(167,139,250,0.08) 0%, transparent 50%),
                        radial-gradient(ellipse 50% 35% at 80% 20%, rgba(96,165,250,0.06) 0%, transparent 50%),
                        radial-gradient(ellipse 40% 30% at 60% 60%, rgba(251,146,60,0.05) 0%, transparent 50%)
                    `,
                }}
            />
        </motion.footer>
    );
};

export { Footer };
