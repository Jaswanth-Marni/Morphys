"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useInView, useSpring, animate, useTransform } from "framer-motion";
import type { StyleCard } from "@/data/styles";
import type { CanvasStylePosition } from "@/data/canvasLayout";
import type { ArrivalPhase } from "@/context/ShowcaseContext";
import { useShowcase } from "@/context/ShowcaseContext";

type StyleDetailSectionProps = {
    style: StyleCard;
    position: CanvasStylePosition;
    isActive: boolean;
    parallaxOffset: { x: number; y: number };
    isTransitioning?: boolean;
    arrivalPhase?: ArrivalPhase;
    isMobile?: boolean;
};

export const StyleDetailSection = ({
    style,
    position,
    isActive,
    parallaxOffset,
    isTransitioning = false,
    arrivalPhase = "complete",
    isMobile = false,
}: StyleDetailSectionProps) => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(sectionRef, { amount: 0.3 });
    const { setArrivalPhase, closeCanvas } = useShowcase();

    // Reduced parallax - only for content, not image (to prevent lag)
    const contentParallax = {
        x: parallaxOffset.x * 0.3,
        y: parallaxOffset.y * 0.3,
    };

    // Mobile arrival animation springs - slower and smoother
    const imageScale = useSpring(1, { stiffness: 120, damping: 20, mass: 0.8 });
    const imageY = useSpring(0, { stiffness: 100, damping: 22, mass: 0.8 });
    const infoY = useSpring(0, { stiffness: 150, damping: 20, mass: 0.8 });
    const infoOpacity = useSpring(1, { stiffness: 120, damping: 22, mass: 0.8 });
    // Used to push picture up when info container arrives (impact effect)
    const imagePush = useSpring(0, { stiffness: 180, damping: 16, mass: 0.6 });
    // Offset for centering during hero phase (positive moves down to center)
    const centerOffset = useSpring(0, { stiffness: 50, damping: 18, mass: 1.2 });
    // Image height for smooth hero->normal transition (in vh units * window height for px)
    const imageHeightPercent = useSpring(35, { stiffness: 50, damping: 18, mass: 1.2 });
    // Container opacity for smooth fade-out during departing phase (mobile only)
    const containerOpacity = useSpring(1, { stiffness: 80, damping: 20, mass: 0.8 });
    // Combined Y position for image (imageY + imagePush + centerOffset)
    const combinedImageY = useTransform(
        [imageY, imagePush, centerOffset],
        ([y, push, offset]) => (y as number) + (push as number) + (offset as number)
    );
    // Convert height percent to vh string for CSS
    const imageHeightStyle = useTransform(imageHeightPercent, (v) => `${v}vh`);

    // Track if info should be visible during animation
    const [showInfoDuringAnimation, setShowInfoDuringAnimation] = useState(true);

    // Determine if this section should animate (only active section on mobile)
    const shouldAnimate = isMobile && isActive && arrivalPhase !== "complete" && arrivalPhase !== "idle";

    // Mobile arrival animation orchestration
    useEffect(() => {
        if (!isMobile || !isActive) return;

        // Phase timing constants
        const HERO_DISPLAY_TIME = 700;
        const SETTLE_DURATION = 500;
        const SETTLE_TO_REVEAL_GAP = 150;

        if (arrivalPhase === "hero") {
            // Hide info, image is at hero position
            // Center offset pushes the image down to visually center it during hero phase
            // Calculate offset: from 80px padding position to visual center
            setShowInfoDuringAnimation(false);
            infoOpacity.set(0);
            infoY.set(100);
            // Set the center offset to push image to center (approx 18vh down from top)
            centerOffset.set(window.innerHeight * 0.18);
            // Set larger height for hero phase
            imageHeightPercent.set(65);

            // Wait then transition to settling
            const timer = setTimeout(() => {
                setArrivalPhase("settling");
            }, HERO_DISPLAY_TIME);
            return () => clearTimeout(timer);
        }

        if (arrivalPhase === "settling") {
            // Animate center offset back to 0 (image moves from center to top)
            animate(centerOffset, 0, {
                type: "spring",
                stiffness: 50,
                damping: 18,
                mass: 1.2,
            });

            // Animate height from 65vh to 35vh smoothly
            animate(imageHeightPercent, 35, {
                type: "spring",
                stiffness: 50,
                damping: 18,
                mass: 1.2,
            });

            // Animate image settling with impact - smoother and slower
            // The position change is handled by CSS, we just add impact effect
            animate(imageScale, 0.95, {
                type: "spring",
                stiffness: 100,
                damping: 16,
                mass: 0.8,
                onComplete: () => {
                    // Subtle impact overshoot effect
                    imageScale.set(0.93);
                    setTimeout(() => {
                        animate(imageScale, 1, {
                            type: "spring",
                            stiffness: 150,
                            damping: 18,
                            mass: 0.8,
                        });
                    }, 80);
                }
            });

            // Impact bounce on Y - smoother
            animate(imageY, -10, {
                type: "spring",
                stiffness: 100,
                damping: 20,
                mass: 0.8,
                onComplete: () => {
                    imageY.set(-12);
                    setTimeout(() => {
                        animate(imageY, 0, {
                            type: "spring",
                            stiffness: 150,
                            damping: 18,
                            mass: 0.8,
                        });
                    }, 80);
                }
            });

            // After settling, reveal info
            const timer = setTimeout(() => {
                setArrivalPhase("revealing");
            }, SETTLE_DURATION + SETTLE_TO_REVEAL_GAP);
            return () => clearTimeout(timer);
        }

        if (arrivalPhase === "revealing") {
            setShowInfoDuringAnimation(true);

            // Animate info container sliding up with impact - smoother
            animate(infoOpacity, 1, { duration: 0.4 });
            animate(infoY, 0, {
                type: "spring",
                stiffness: 150,
                damping: 18,
                mass: 0.8,
                onComplete: () => {
                    // Impact overshoot - info bounces up slightly
                    infoY.set(-6);

                    // Push the image container up when info impacts
                    imagePush.set(-20);
                    setTimeout(() => {
                        animate(imagePush, 0, {
                            type: "spring",
                            stiffness: 200,
                            damping: 14,
                            mass: 0.6,
                        });
                    }, 60);

                    setTimeout(() => {
                        animate(infoY, 0, {
                            type: "spring",
                            stiffness: 200,
                            damping: 16,
                            mass: 0.8,
                        });
                    }, 80);

                    // Mark complete
                    setTimeout(() => {
                        setArrivalPhase("complete");
                    }, 300);
                }
            });
        }

        if (arrivalPhase === "complete") {
            // Reset all values to normal
            setShowInfoDuringAnimation(true);
            imageScale.set(1);
            imageY.set(0);
            imagePush.set(0);
            centerOffset.set(0);
            imageHeightPercent.set(35);
            infoY.set(0);
            infoOpacity.set(1);
            containerOpacity.set(1);
        }

        // DEPARTING PHASE - Reverse animation when closing on mobile
        if (arrivalPhase === "departing") {
            const DEPART_INFO_DURATION = 250;
            const DEPART_IMAGE_DURATION = 350;
            const DEPART_FADE_DURATION = 300; // Smooth fade before closing

            // Ensure container is visible at start
            containerOpacity.set(1);

            // Step 1: Slide info container down and fade out
            animate(infoY, 100, {
                type: "spring",
                stiffness: 100,
                damping: 18,
                mass: 0.8,
            });
            animate(infoOpacity, 0, { duration: 0.3 });

            // Step 2: After info slides down, expand image and move to center
            const imageTimer = setTimeout(() => {
                setShowInfoDuringAnimation(false);

                // Animate height from 35vh to 65vh
                animate(imageHeightPercent, 65, {
                    type: "spring",
                    stiffness: 50,
                    damping: 18,
                    mass: 1.2,
                });

                // Animate center offset to push image to center
                animate(centerOffset, window.innerHeight * 0.18, {
                    type: "spring",
                    stiffness: 50,
                    damping: 18,
                    mass: 1.2,
                });

                // Step 3: After image reaches center, fade out smoothly then close
                const fadeTimer = setTimeout(() => {
                    // Smooth fade out before closing
                    animate(containerOpacity, 0, {
                        duration: DEPART_FADE_DURATION / 1000,
                        ease: "easeOut",
                        onComplete: () => {
                            closeCanvas();
                        }
                    });
                }, DEPART_IMAGE_DURATION);

                return () => clearTimeout(fadeTimer);
            }, DEPART_INFO_DURATION);

            return () => clearTimeout(imageTimer);
        }
    }, [arrivalPhase, isMobile, isActive, setArrivalPhase, closeCanvas, imageScale, imageY, imagePush, centerOffset, imageHeightPercent, infoY, infoOpacity, containerOpacity]);

    // Calculate if we're in hero phase (image centered) - also true during late departing stage
    const isHeroPhase = isMobile && isActive && (arrivalPhase === "hero");
    const isDeparting = isMobile && isActive && arrivalPhase === "departing";
    const isAnimating = shouldAnimate; // shouldAnimate already excludes complete and idle

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
                // Apply container opacity for smooth fade-out on mobile departing
                opacity: isDeparting ? containerOpacity : 1,
            }}
        >
            {/* Progressive blur vignette - creates island effect around section */}
            <div
                className="absolute pointer-events-none"
                style={{
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
                exit={{ opacity: 0, transition: { duration: 0.3 } }}
            />

            {/* Main content container - Fixed layout, position animated via springs */}
            <motion.div
                className="relative w-full max-w-6xl mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center gap-6 lg:gap-12 h-screen lg:h-auto"
                style={{
                    paddingTop: isMobile ? "80px" : "0px",
                    justifyContent: "flex-start",
                }}
            >
                {/* Left: Main Image - Animates between hero (centered/large) and normal (top/small) */}
                <motion.div
                    className="relative flex-shrink-0 w-full lg:w-2/5"
                    style={{
                        height: isMobile ? imageHeightStyle : "auto",
                        scale: isAnimating ? imageScale : 1,
                        y: isMobile ? combinedImageY : 0,
                        aspectRatio: !isMobile ? "3/4" : undefined,
                    }}
                    exit={(!isActive || !isMobile) ? { opacity: 0, transition: { duration: 0.3 } } : undefined}
                >
                    {/* Image container with glow */}
                    <div className="relative w-full h-full">
                        {/* Glow effect behind image */}
                        <motion.div
                            className="absolute -inset-4 rounded-2xl opacity-50 blur-2xl"
                            style={{
                                background: style.accentColor,
                            }}
                            animate={{
                                opacity: isActive ? (isHeroPhase ? [0.4, 0.6, 0.4] : [0.3, 0.5, 0.3]) : 0.2,
                            }}
                            transition={{
                                duration: isHeroPhase ? 1.5 : 3,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        />

                        {/* Main image */}
                        <motion.img
                            layoutId={
                                // Only use shared element on desktop
                                // On mobile, we use manual spring animations (hero phase) which conflict with layoutId
                                isTransitioning && isActive && !isMobile
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
                </motion.div>

                {/* Right: Content - Hidden during hero, slides up during reveal */}
                <motion.div
                    className={`relative w-full lg:w-1/2 flex-1 lg:flex-none pointer-events-auto mx-4 lg:mx-0 mb-8 lg:mb-0 rounded-2xl lg:rounded-none overflow-hidden lg:overflow-visible ${isHeroPhase ? "hidden" : "block"
                        }`}
                    style={{
                        x: contentParallax.x,
                        y: isAnimating ? infoY : contentParallax.y,
                        opacity: isAnimating ? infoOpacity : 1,
                    }}
                    exit={{ opacity: 0, transition: { duration: 0.3 } }}
                >
                    {/* Progressive blur overlays - Mobile only */}
                    <div
                        className="absolute top-0 left-0 right-0 h-16 pointer-events-none z-20 block lg:hidden"
                        style={{
                            backdropFilter: "blur(3px)",
                            WebkitBackdropFilter: "blur(3px)",
                            maskImage: "linear-gradient(to bottom, black 0%, black 20%, transparent 100%)",
                            WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 20%, transparent 100%)",
                        }}
                    />
                    <div
                        className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none z-20 block lg:hidden"
                        style={{
                            backdropFilter: "blur(3px)",
                            WebkitBackdropFilter: "blur(3px)",
                            maskImage: "linear-gradient(to top, black 0%, black 20%, transparent 100%)",
                            WebkitMaskImage: "linear-gradient(to top, black 0%, black 20%, transparent 100%)",
                        }}
                    />
                    <div
                        className="absolute top-0 bottom-0 left-0 w-8 pointer-events-none z-20 block lg:hidden"
                        style={{
                            backdropFilter: "blur(3px)",
                            WebkitBackdropFilter: "blur(3px)",
                            maskImage: "linear-gradient(to right, black 0%, black 20%, transparent 100%)",
                            WebkitMaskImage: "linear-gradient(to right, black 0%, black 20%, transparent 100%)",
                        }}
                    />
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
                        className="relative w-full h-full space-y-4 lg:space-y-6 overflow-y-auto lg:overflow-visible pb-12 lg:pb-0 no-scrollbar bg-transparent lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none rounded-2xl lg:rounded-none p-4 lg:p-0 border border-white/10 lg:border-none"
                        style={{
                            overscrollBehavior: "contain",
                            WebkitOverflowScrolling: "touch",
                            touchAction: "pan-y",
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
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

                        {/* Principles */}
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
            </motion.div>
        </motion.div>
    );
};
