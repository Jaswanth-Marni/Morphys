"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";

interface TextMirrorProps {
    text?: string;
    className?: string;
    hasTrigger?: boolean;
    config?: {
        idleTimeout?: number;
        spread?: number;
        color?: string;
        fontSize?: number;
    };
}

const TextMirror: React.FC<TextMirrorProps> = ({
    text = "MORPHYS",
    className = "",
    hasTrigger = true,
    config = {},
}) => {
    const {
        idleTimeout = 5000,
        spread = 30,
        color: configColor,
        fontSize = 120,
    } = config;

    // Theme detection
    const [isLightMode, setIsLightMode] = useState(false);
    useEffect(() => {
        const checkTheme = () => {
            const theme = document.documentElement.getAttribute("data-theme");
            // Check if theme is explicitly "light", otherwise default to dark mode
            const isLight = theme === "light";
            setIsLightMode(isLight);
        };
        // Initial check
        checkTheme();

        // Observer for theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === "data-theme") {
                    checkTheme();
                }
            });
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["data-theme"]
        });
        return () => observer.disconnect();
    }, []);

    // Use config color if provided, otherwise use theme-aware default
    const color = configColor || (isLightMode ? "#000000" : "#ffffff");

    const [isIdle, setIsIdle] = useState(true);
    const idleTimer = useRef<NodeJS.Timeout | null>(null);

    // Velocity tracking for direction
    const velocityX = useMotionValue(0);
    const velocityY = useMotionValue(0);

    // Previous position to calculate delta
    const prevX = useRef(0);
    const prevY = useRef(0);

    const containerRef = useRef<HTMLDivElement>(null);

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Responsive font size
    const responsiveFontSize = isMobile ? Math.min(fontSize, 48) : fontSize;

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (idleTimer.current) {
                clearTimeout(idleTimer.current);
            }

            const dx = e.clientX - prevX.current;
            const dy = e.clientY - prevY.current;

            velocityX.set(dx);
            velocityY.set(dy);

            prevX.current = e.clientX;
            prevY.current = e.clientY;

            setIsIdle(false);

            idleTimer.current = setTimeout(() => {
                setIsIdle(true);
                velocityX.set(0);
                velocityY.set(0);
            }, idleTimeout);
        };

        const handleMouseLeave = () => {
            setIsIdle(true);
            velocityX.set(0);
            velocityY.set(0);
            if (idleTimer.current) clearTimeout(idleTimer.current);
        };

        const handleMouseEnter = (e: MouseEvent) => {
            prevX.current = e.clientX;
            prevY.current = e.clientY;
            setIsIdle(false);
        };

        container.addEventListener("mousemove", handleMouseMove);
        container.addEventListener("mouseleave", handleMouseLeave);
        container.addEventListener("mouseenter", handleMouseEnter);

        return () => {
            container.removeEventListener("mousemove", handleMouseMove);
            container.removeEventListener("mouseleave", handleMouseLeave);
            container.removeEventListener("mouseenter", handleMouseEnter);
            if (idleTimer.current) clearTimeout(idleTimer.current);
        };
    }, [idleTimeout, velocityX, velocityY]);

    // Generate clones
    const cloneCount = 6;
    const clones = Array.from({ length: cloneCount });

    return (
        <div
            ref={containerRef}
            className={`relative flex items-center justify-center w-full h-full overflow-hidden ${className}`}
        >
            <div className="relative" style={{ perspective: "1000px" }}>
                {clones.map((_, i) => {
                    // Use transforms based on velocity
                    // We limit the offset so it doesn't fly off screen
                    // Use spread to control sensitivity
                    const spreadFactor = spread / 50; // Normalize

                    const x = useTransform(velocityX, (v) => {
                        if (isIdle) return 0;
                        const val = v * (i + 1) * spreadFactor;
                        return Math.max(Math.min(val, 300), -300);
                    });

                    const y = useTransform(velocityY, (v) => {
                        if (isIdle) return 0;
                        const val = v * (i + 1) * spreadFactor;
                        return Math.max(Math.min(val, 300), -300);
                    });

                    // Spring the values for smoothness
                    const springX = useSpring(x, { stiffness: 150, damping: 15 });
                    const springY = useSpring(y, { stiffness: 150, damping: 15 });

                    // Opacity fades for further clones
                    const opacity = 1 - (i / cloneCount) * 0.8;

                    // Z-index: main text on top (handled after loop), clones behind? 
                    // Or clones in front with mix-blend-mode.
                    // The images show "outline" style clones.

                    return (
                        <motion.div
                            key={i}
                            className="absolute top-0 left-0 flex items-center justify-center w-full h-full pointer-events-none"
                            style={{
                                x: springX,
                                y: springY,
                                zIndex: 10 - i, // Closest to main text is higher
                                opacity: isIdle ? 0 : opacity, // Fade out when idle
                            }}
                            animate={{
                                opacity: isIdle ? 0 : opacity,
                                scale: isIdle ? 0.95 : 1, // Slight shrink on idle
                            }}
                            transition={{ duration: 0.5 }}
                        >
                            <span
                                style={{
                                    fontSize: `${responsiveFontSize}px`,
                                    fontWeight: 900,
                                    color: "transparent",
                                    WebkitTextStroke: `1px ${color}`,
                                    fontFamily: "Inter, sans-serif",
                                    textTransform: "uppercase",
                                    whiteSpace: "nowrap"
                                }}
                            >
                                {text}
                            </span>
                        </motion.div>
                    );
                })}

                {/* Main Text */}
                <motion.div
                    className="relative z-20"
                    style={{
                        // The main text stays relatively still or just slight parallax
                        x: useSpring(useTransform(velocityX, v => v * 0.1), { stiffness: 200, damping: 20 }),
                        y: useSpring(useTransform(velocityY, v => v * 0.1), { stiffness: 200, damping: 20 }),
                    }}
                >
                    <span
                        style={{
                            fontSize: `${responsiveFontSize}px`,
                            fontWeight: 900,
                            color: color,
                            fontFamily: "Inter, sans-serif",
                            textTransform: "uppercase",
                            whiteSpace: "nowrap"
                        }}
                    >
                        {text}
                    </span>
                </motion.div>
            </div>

            {/* Instructions/Subtitle */}
            {hasTrigger && (
                <div className="absolute bottom-10 text-foreground/50 text-sm font-light tracking-widest pointer-events-none">
                    MOVE CURSOR To ACTIVATE
                </div>
            )}
        </div>
    );
};

export default TextMirror;
