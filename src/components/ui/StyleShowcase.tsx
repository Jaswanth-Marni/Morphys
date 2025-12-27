"use client";

import React, { useRef, useState, useCallback } from "react";
import { motion, useInView, useSpring, type Variants } from "framer-motion";
import { DiagonalCarousel, uiStyles, type CarouselHandle } from "./DiagonalCarousel";
import { TextFlow } from "./TextFlow";

type StyleShowcaseProps = {
    className?: string;
};

const StyleShowcase = ({ className = "" }: StyleShowcaseProps) => {
    const sectionRef = useRef<HTMLElement>(null);
    const carouselRef = useRef<CarouselHandle>(null);
    const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
    const [currentStyle, setCurrentStyle] = useState(uiStyles[0]);

    // Arrow button impact springs - loose, bouncy swing
    const leftArrowX = useSpring(0, { stiffness: 200, damping: 8, mass: 0.8 });
    const rightArrowX = useSpring(0, { stiffness: 200, damping: 8, mass: 0.8 });

    // Impact handler for arrow buttons - creates outward swing then bounce back
    const handleImpact = useCallback(() => {
        // Push arrows outward with more force
        leftArrowX.set(-35);
        rightArrowX.set(35);

        // After a brief moment, let springs pull them back (creates the swing)
        setTimeout(() => {
            leftArrowX.set(0);
            rightArrowX.set(0);
        }, 80);
    }, [leftArrowX, rightArrowX]);

    // ========== ORCHESTRATED ANIMATION TIMING ==========
    // Heading: 0ms → Blurs: 200ms → Carousel: 800ms (after heading) → Controls: 2800ms (after spin)
    const TIMING = {
        heading: 0,
        blurs: 0.2,
        carousel: 0.8, // After heading animation (0.6s) completes
        controls: 2.4, // After carousel spin completes
    };

    // Heading container - stagger children for letter-by-letter animation
    const headingContainerVariants: Variants = {
        hidden: { opacity: 1 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.06,
                delayChildren: TIMING.heading,
            },
        },
    };

    // Individual letter animation - same as TextGenerateEffect
    const letterVariants: Variants = {
        hidden: {
            opacity: 0,
            filter: "blur(10px)",
            y: 15,
        },
        visible: {
            opacity: 1,
            filter: "blur(0px)",
            y: 0,
            transition: {
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94],
            },
        },
    };

    // Progressive blur fade-in variants
    const blurVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.8,
                ease: "easeOut",
                delay: TIMING.blurs,
            },
        },
    };

    // Controls blur reveal animation
    const controlsVariants: Variants = {
        hidden: {
            opacity: 0,
            filter: "blur(12px)",
            y: 20,
        },
        visible: {
            opacity: 1,
            filter: "blur(0px)",
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.34, 1.56, 0.64, 1], // Spring-like ease
                delay: TIMING.controls,
            },
        },
    };

    return (
        <motion.section
            ref={sectionRef}
            className={`relative min-h-screen w-full overflow-hidden ${className}`}
            style={{
                background: "var(--background)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: isInView ? 1 : 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            {/* DotPattern is rendered globally from page.tsx, visible through this section */}

            {/* ========== STYLES HEADING - TOP CENTER ========== */}
            <motion.div
                className="absolute top-[120px] left-1/2 -translate-x-1/2 z-40 pointer-events-none"
                variants={headingContainerVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
            >
                <h2
                    className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-wider text-foreground leading-[0.85] text-center flex"
                    style={{
                        fontFamily: "'Clash Display Variable', sans-serif",
                        fontVariationSettings: "'wght' 700",
                    }}
                >
                    {"STYLES".split("").map((letter, index) => (
                        <motion.span
                            key={index}
                            variants={letterVariants}
                            className="inline-block"
                        >
                            {letter}
                        </motion.span>
                    ))}
                </h2>
            </motion.div>

            {/* ========== PROGRESSIVE BLUR OVERLAYS ========== */}

            {/* Progressive Blur - Top Edge (Extended) */}
            <motion.div
                className="absolute top-0 left-0 right-0 z-20 pointer-events-none"
                style={{
                    height: "35%",
                    background: "linear-gradient(to bottom, var(--background) 0%, var(--background) 20%, transparent 100%)",
                    maskImage: "linear-gradient(to bottom, black 0%, black 40%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 40%, transparent 100%)",
                }}
                variants={blurVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
            />

            {/* Progressive Blur with backdrop blur - Top */}
            <motion.div
                className="absolute top-0 left-0 right-0 z-21 pointer-events-none"
                style={{
                    height: "30%",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
                }}
                variants={blurVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
            />

            {/* Progressive Blur - Bottom Edge (Extended) */}
            <motion.div
                className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none"
                style={{
                    height: "35%",
                    background: "linear-gradient(to top, var(--background) 0%, var(--background) 20%, transparent 100%)",
                    maskImage: "linear-gradient(to top, black 0%, black 40%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to top, black 0%, black 40%, transparent 100%)",
                }}
                variants={blurVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
            />

            {/* Progressive Blur with backdrop blur - Bottom */}
            <motion.div
                className="absolute bottom-0 left-0 right-0 z-21 pointer-events-none"
                style={{
                    height: "30%",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    maskImage: "linear-gradient(to top, black 0%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 100%)",
                }}
                variants={blurVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
            />

            {/* Progressive Blur - Left Edge (Extended for diagonal) */}
            <motion.div
                className="absolute top-0 bottom-0 left-0 z-20 pointer-events-none"
                style={{
                    width: "30%",
                    background: "linear-gradient(to right, var(--background) 0%, var(--background) 15%, transparent 100%)",
                    maskImage: "linear-gradient(to right, black 0%, black 30%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to right, black 0%, black 30%, transparent 100%)",
                }}
                variants={blurVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
            />

            {/* Progressive Blur with backdrop blur - Left */}
            <motion.div
                className="absolute top-0 bottom-0 left-0 z-21 pointer-events-none"
                style={{
                    width: "25%",
                    backdropFilter: "blur(6px)",
                    WebkitBackdropFilter: "blur(6px)",
                    maskImage: "linear-gradient(to right, black 0%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to right, black 0%, transparent 100%)",
                }}
                variants={blurVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
            />

            {/* Progressive Blur - Right Edge (Extended for diagonal) */}
            <motion.div
                className="absolute top-0 bottom-0 right-0 z-20 pointer-events-none"
                style={{
                    width: "30%",
                    background: "linear-gradient(to left, var(--background) 0%, var(--background) 15%, transparent 100%)",
                    maskImage: "linear-gradient(to left, black 0%, black 30%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to left, black 0%, black 30%, transparent 100%)",
                }}
                variants={blurVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
            />

            {/* Progressive Blur with backdrop blur - Right */}
            <motion.div
                className="absolute top-0 bottom-0 right-0 z-21 pointer-events-none"
                style={{
                    width: "25%",
                    backdropFilter: "blur(6px)",
                    WebkitBackdropFilter: "blur(6px)",
                    maskImage: "linear-gradient(to left, black 0%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to left, black 0%, transparent 100%)",
                }}
                variants={blurVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
            />

            {/* Diagonal Corner Blurs - Top Left (where cards exit) */}
            <motion.div
                className="absolute top-0 left-0 z-30 pointer-events-none"
                style={{
                    width: "50%",
                    height: "50%",
                    background: "radial-gradient(ellipse at top left, var(--background) 0%, var(--background) 20%, transparent 70%)",
                }}
                variants={blurVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
            />

            {/* Diagonal Corner Blur with backdrop - Top Left */}
            <motion.div
                className="absolute top-0 left-0 z-31 pointer-events-none"
                style={{
                    width: "40%",
                    height: "40%",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    maskImage: "radial-gradient(ellipse at top left, black 0%, transparent 60%)",
                    WebkitMaskImage: "radial-gradient(ellipse at top left, black 0%, transparent 60%)",
                }}
                variants={blurVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
            />

            {/* Diagonal Corner Blurs - Bottom Right (where cards enter) */}
            <motion.div
                className="absolute bottom-0 right-0 z-30 pointer-events-none"
                style={{
                    width: "50%",
                    height: "50%",
                    background: "radial-gradient(ellipse at bottom right, var(--background) 0%, var(--background) 20%, transparent 70%)",
                }}
                variants={blurVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
            />

            {/* Diagonal Corner Blur with backdrop - Bottom Right */}
            <motion.div
                className="absolute bottom-0 right-0 z-31 pointer-events-none"
                style={{
                    width: "40%",
                    height: "40%",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    maskImage: "radial-gradient(ellipse at bottom right, black 0%, transparent 60%)",
                    WebkitMaskImage: "radial-gradient(ellipse at bottom right, black 0%, transparent 60%)",
                }}
                variants={blurVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
            />

            {/* ========== CAROUSEL CONTAINER ========== */}
            <div className="relative h-screen w-full pt-20 -translate-y-[30px] md:translate-y-0">
                <DiagonalCarousel
                    ref={carouselRef}
                    autoPlayInterval={3000}
                    onUiStyleChange={setCurrentStyle}
                    onImpact={handleImpact}
                    isInView={isInView}
                    entranceDelay={TIMING.carousel}
                />
            </div>

            {/* ========== BOTTOM NAVIGATION BAR ========== */}
            <motion.div
                className="absolute bottom-10 left-0 right-0 z-50"
                variants={controlsVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
            >
                {/* Left Arrow - Fixed position on left with impact animation */}
                <motion.button
                    onClick={() => carouselRef.current?.prev()}
                    className="absolute left-8 md:left-16 top-1/2 -translate-y-1/2 pointer-events-auto px-5 py-3 rounded-full bg-foreground text-background border border-border hover:opacity-80 transition-all"
                    aria-label="Previous style"
                    style={{ x: leftArrowX }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </motion.button>

                {/* Style Name - TextFlow (Centered) */}
                <div
                    className="flex justify-center pointer-events-none -translate-y-[70px] md:translate-y-0"
                    style={{ fontFamily: "'Clash Display Variable', sans-serif", fontVariationSettings: "'wght' 600" }}
                >
                    <TextFlow
                        text={currentStyle.title}
                        className="text-3xl md:text-5xl tracking-tight text-foreground"
                    />
                </div>

                {/* Right Arrow - Fixed position on right with impact animation */}
                <motion.button
                    onClick={() => carouselRef.current?.next()}
                    className="absolute right-8 md:right-16 top-1/2 -translate-y-1/2 pointer-events-auto px-5 py-3 rounded-full bg-foreground text-background border border-border hover:opacity-80 transition-all"
                    aria-label="Next style"
                    style={{ x: rightArrowX }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                </motion.button>
            </motion.div>

            {/* Ambient Background Glow */}
            <div
                className="absolute inset-0 z-0 pointer-events-none opacity-20"
                style={{
                    background: `
                        radial-gradient(ellipse 80% 50% at 50% 50%, rgba(96,165,250,0.08) 0%, transparent 50%),
                        radial-gradient(ellipse 60% 40% at 30% 70%, rgba(167,139,250,0.06) 0%, transparent 50%),
                        radial-gradient(ellipse 50% 30% at 70% 30%, rgba(251,146,60,0.05) 0%, transparent 50%)
                    `,
                }}
            />
        </motion.section>
    );
};

export { StyleShowcase };
