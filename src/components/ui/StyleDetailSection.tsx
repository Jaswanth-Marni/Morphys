"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import type { StyleCard } from "@/data/styles";
import type { CanvasStylePosition } from "@/data/canvasLayout";

type StyleDetailSectionProps = {
    style: StyleCard;
    position: CanvasStylePosition;
    isActive: boolean;
    parallaxOffset: { x: number; y: number };
    isTransitioning?: boolean; // When true, enable layoutId for shared element transition
};

export const StyleDetailSection = ({
    style,
    position,
    isActive,
    parallaxOffset,
    isTransitioning = false,
}: StyleDetailSectionProps) => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(sectionRef, { amount: 0.3 });

    // Reduced parallax - only for content, not image (to prevent lag)
    const contentParallax = {
        x: parallaxOffset.x * 0.3,
        y: parallaxOffset.y * 0.3,
    };

    return (
        <motion.div
            ref={sectionRef}
            className="absolute flex items-center justify-center"
            style={{
                // Position in the canvas coordinate system
                left: `calc(50vw + ${position.x}vw)`,
                top: `calc(50vh + ${position.y}vh)`,
                width: "100vw",
                height: "100vh",
                transform: "translate(-50%, -50%)",
            }}
        >
            {/* Progressive blur vignette - creates island effect around section */}
            {/* Uses var(--background) to match theme. Fades to transparent at edges - no sharp cuts */}
            <div
                className="absolute pointer-events-none"
                style={{
                    // Extend way beyond section bounds
                    left: "-100vw",
                    top: "-100vh",
                    right: "-100vw",
                    bottom: "-100vh",
                    background: `
                        radial-gradient(ellipse 40% 35% at 50% 50%, 
                            var(--background) 0%, 
                            var(--background) 55%,
                            color-mix(in srgb, var(--background) 95%, transparent) 60%,
                            color-mix(in srgb, var(--background) 85%, transparent) 65%,
                            color-mix(in srgb, var(--background) 70%, transparent) 70%,
                            color-mix(in srgb, var(--background) 50%, transparent) 75%,
                            color-mix(in srgb, var(--background) 30%, transparent) 80%,
                            color-mix(in srgb, var(--background) 15%, transparent) 85%,
                            color-mix(in srgb, var(--background) 5%, transparent) 90%,
                            transparent 100%
                        )
                    `,
                }}
            />

            {/* Background glow layer */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: `radial-gradient(ellipse 80% 60% at 50% 50%, ${style.accentColor}12 0%, transparent 50%)`,
                    opacity: isActive ? 0.8 : 0.3,
                    transition: "opacity 0.5s ease",
                }}
            />

            {/* Main content container */}
            <div className="relative w-full max-w-6xl mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center gap-6 lg:gap-12 h-screen lg:h-auto justify-center lg:justify-start pt-20 lg:pt-0">

                {/* Left: Main Image - Banner on mobile, Side image on desktop */}
                <div className="relative w-full h-[35vh] lg:h-auto lg:w-2/5 lg:aspect-[3/4] flex-shrink-0">
                    {/* Image container with glow */}
                    <div className="relative w-full h-full">
                        {/* Glow effect behind image */}
                        <motion.div
                            className="absolute -inset-4 rounded-2xl opacity-50 blur-2xl"
                            style={{
                                background: style.accentColor,
                            }}
                            animate={{
                                opacity: isActive ? [0.3, 0.5, 0.3] : 0.2,
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        />

                        {/* Main image - layoutId for shared element transitions */}
                        {/* Only the ACTIVE style gets layoutId during transitions to prevent all images animating */}
                        <motion.img
                            layoutId={
                                // Only assign layoutId when transitioning AND this is the active style
                                // This ensures only the selected/current style animates, not all of them
                                isTransitioning && isActive
                                    ? `style-image-${style.id}`
                                    : undefined
                            }
                            src={style.image}
                            alt={style.title}
                            className="relative w-full h-full object-cover shadow-2xl"
                            style={{
                                boxShadow: `0 25px 80px -20px ${style.accentColor}40`,
                                borderRadius: "0.5rem",
                                willChange: isTransitioning && isActive ? "transform" : "auto",
                            }}
                            draggable={false}
                            transition={{
                                layout: {
                                    type: "spring",
                                    stiffness: 150,
                                    damping: 25,
                                    mass: 0.8,
                                },
                            }}
                        />
                    </div>
                </div>

                {/* Right: Content with subtle parallax - Wrapper for fixed blur overlays */}
                <motion.div
                    className="relative w-full lg:w-1/2 flex-1 lg:flex-none pointer-events-auto mx-4 lg:mx-0 mb-8 lg:mb-0 rounded-2xl lg:rounded-none overflow-hidden lg:overflow-visible"
                    style={{
                        x: contentParallax.x,
                        y: contentParallax.y,
                    }}
                >
                    {/* Progressive blur overlays - FIXED to container edges, Mobile only */}
                    {/* Top edge blur - pure blur, no tint */}
                    <div
                        className="absolute top-0 left-0 right-0 h-16 pointer-events-none z-20 block lg:hidden"
                        style={{
                            backdropFilter: "blur(3px)",
                            WebkitBackdropFilter: "blur(3px)",
                            maskImage: "linear-gradient(to bottom, black 0%, black 20%, transparent 100%)",
                            WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 20%, transparent 100%)",
                        }}
                    />
                    {/* Bottom edge blur - pure blur, no tint */}
                    <div
                        className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none z-20 block lg:hidden"
                        style={{
                            backdropFilter: "blur(3px)",
                            WebkitBackdropFilter: "blur(3px)",
                            maskImage: "linear-gradient(to top, black 0%, black 20%, transparent 100%)",
                            WebkitMaskImage: "linear-gradient(to top, black 0%, black 20%, transparent 100%)",
                        }}
                    />
                    {/* Left edge blur - pure blur, no tint */}
                    <div
                        className="absolute top-0 bottom-0 left-0 w-8 pointer-events-none z-20 block lg:hidden"
                        style={{
                            backdropFilter: "blur(3px)",
                            WebkitBackdropFilter: "blur(3px)",
                            maskImage: "linear-gradient(to right, black 0%, black 20%, transparent 100%)",
                            WebkitMaskImage: "linear-gradient(to right, black 0%, black 20%, transparent 100%)",
                        }}
                    />
                    {/* Right edge blur - pure blur, no tint */}
                    <div
                        className="absolute top-0 bottom-0 right-0 w-8 pointer-events-none z-20 block lg:hidden"
                        style={{
                            backdropFilter: "blur(3px)",
                            WebkitBackdropFilter: "blur(3px)",
                            maskImage: "linear-gradient(to left, black 0%, black 20%, transparent 100%)",
                            WebkitMaskImage: "linear-gradient(to left, black 0%, black 20%, transparent 100%)",
                        }}
                    />

                    {/* Scrollable content container */}
                    <div
                        className="relative w-full h-full space-y-4 lg:space-y-6 overflow-y-auto lg:overflow-visible pb-12 lg:pb-0 no-scrollbar bg-black/20 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none rounded-2xl lg:rounded-none p-4 lg:p-0 border border-white/10 lg:border-none"
                        style={{
                            overscrollBehavior: "contain",
                            WebkitOverflowScrolling: "touch",
                            touchAction: "pan-y",
                        }}
                        onPointerDown={(e) => e.stopPropagation()} // Allow text selection/scrolling without dragging canvas
                    >
                        {/* Title */}
                        <motion.h1
                            className="text-3xl md:text-5xl lg:text-6xl tracking-tight"
                            style={{
                                fontFamily: "'Clash Display Variable', sans-serif",
                                fontVariationSettings: "'wght' 600",
                                color: "var(--foreground)",
                            }}
                            initial={{ opacity: 0, y: 30 }}
                            animate={isInView || isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            {style.title}
                        </motion.h1>

                        {/* Description */}
                        <motion.p
                            className="text-base md:text-xl text-foreground/70 leading-relaxed max-w-prose"
                            style={{ fontFamily: "'Satoshi', sans-serif" }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView || isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            {style.longDescription}
                        </motion.p>

                        {/* Principles - Horizontal scroll on mobile */}
                        <motion.div
                            className="space-y-2 lg:space-y-3"
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView || isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <h3
                                className="text-xs lg:text-sm uppercase tracking-wider text-foreground/50"
                                style={{ fontFamily: "'Clash Display Variable', sans-serif" }}
                            >
                                Key Principles
                            </h3>
                            <div className="flex flex-nowrap lg:flex-wrap gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 no-scrollbar mask-horizontal-scroll">
                                {style.principles.map((principle, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1.5 rounded-full text-xs lg:text-sm whitespace-nowrap flex-shrink-0"
                                        style={{
                                            background: `${style.accentColor}15`,
                                            border: `1px solid ${style.accentColor}30`,
                                            color: style.accentColor,
                                            fontFamily: "'Satoshi', sans-serif",
                                        }}
                                    >
                                        {principle}
                                    </span>
                                ))}
                            </div>
                        </motion.div>

                        {/* Usage tips */}
                        <motion.div
                            className="space-y-2 lg:space-y-3"
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView || isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            <h3
                                className="text-xs lg:text-sm uppercase tracking-wider text-foreground/50"
                                style={{ fontFamily: "'Clash Display Variable', sans-serif" }}
                            >
                                Best Practices
                            </h3>
                            <ul className="space-y-2">
                                {style.usage.map((tip, index) => (
                                    <li
                                        key={index}
                                        className="flex items-start gap-2 text-foreground/70 text-sm lg:text-base"
                                        style={{ fontFamily: "'Satoshi', sans-serif" }}
                                    >
                                        <span
                                            className="mt-1.5 lg:mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: style.accentColor }}
                                        />
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};
