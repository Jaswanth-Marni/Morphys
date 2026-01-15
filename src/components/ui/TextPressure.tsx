"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface TextPressureProps {
    text?: string;
    fontFamily?: string;
    className?: string;
    textColor?: string;
    strokeColor?: string;
    strokeWidth?: boolean;
    minFontSize?: number;
    weight?: boolean;
    alpha?: boolean;
    config?: {
        text?: string;
        textColor?: string;
        minFontSize?: number;
    };
}

export function TextPressure({
    text = "MORPHYS",
    fontFamily = "Big Shoulders Display", // Default to the variable font (no quotes)
    className = "",
    textColor = "var(--foreground)",
    strokeColor = "#FF0000",
    strokeWidth = false,
    minFontSize = 36,
    weight = true,
    alpha = false,
    config,
}: TextPressureProps) {
    // Use config props if provided
    const displayText = config?.text || text;
    const displayColor = config?.textColor || textColor;
    const displayMinFontSize = config?.minFontSize || minFontSize;

    const containerRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const spansRef = useRef<(HTMLSpanElement | null)[]>([]);

    const mouseRef = useRef({ x: 0, y: 0 });
    const cursorRef = useRef({ x: 0, y: 0 });

    const [fontSize, setFontSize] = useState(displayMinFontSize);
    const [lineHeight, setLineHeight] = useState(1);

    const chars = displayText.split("");

    const dist = useCallback((a: { x: number; y: number }, b: { x: number; y: number }) => {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        return Math.sqrt(dx * dx + dy * dy);
    }, []);

    // Mouse/touch tracking
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            cursorRef.current = { x: e.clientX, y: e.clientY };
        };
        const handleTouchMove = (e: TouchEvent) => {
            const touch = e.touches[0];
            cursorRef.current = { x: touch.clientX, y: touch.clientY };
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("touchmove", handleTouchMove, { passive: true });

        // Initialize cursor position to center of container
        if (containerRef.current) {
            const { left, top, width, height } = containerRef.current.getBoundingClientRect();
            mouseRef.current = { x: left + width / 2, y: top + height / 2 };
            cursorRef.current = { x: left + width / 2, y: top + height / 2 };
        }

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("touchmove", handleTouchMove);
        };
    }, []);

    // Responsive font sizing
    const setSize = useCallback(() => {
        if (!containerRef.current || !titleRef.current) return;

        const { width: containerW, height: containerH } = containerRef.current.getBoundingClientRect();

        // "Big Shoulders Display" is very condensed, aspect ratio ~0.4 -> 0.5
        // We want the text to fill roughly 80% of width
        const charWidth = 0.5; // Approximation for condensed font
        let newFontSize = (containerW * 0.8) / (chars.length * charWidth);

        // Clamp between min and reasonable max (e.g., 300px or container height)
        newFontSize = Math.min(Math.max(newFontSize, displayMinFontSize), 800, containerH);

        setFontSize(newFontSize);
        setLineHeight(1);
    }, [chars.length, displayMinFontSize]);

    useEffect(() => {
        setSize();
        window.addEventListener("resize", setSize);
        return () => window.removeEventListener("resize", setSize);
    }, [setSize, displayText]);

    // Animation loop - updates font weight based on cursor proximity
    useEffect(() => {
        let rafId: number;

        const animate = () => {
            // Smooth cursor interpolation
            mouseRef.current.x += (cursorRef.current.x - mouseRef.current.x) * 0.15;
            mouseRef.current.y += (cursorRef.current.y - mouseRef.current.y) * 0.15;

            if (titleRef.current) {
                const titleRect = titleRef.current.getBoundingClientRect();
                const maxDist = titleRect.width * 0.5; // Influence radius

                spansRef.current.forEach((span) => {
                    if (!span) return;

                    const rect = span.getBoundingClientRect();
                    const charCenter = {
                        x: rect.left + rect.width / 2,
                        y: rect.top + rect.height / 2,
                    };

                    const d = dist(mouseRef.current, charCenter);

                    // Calculate weight: closer = heavier (up to 900), farther = lighter (down to 100)
                    const getWeight = (distance: number) => {
                        if (distance >= maxDist) return 100;
                        const ratio = 1 - (distance / maxDist);
                        return Math.floor(100 + ratio * 800); // 100 to 900
                    };

                    // Calculate alpha if enabled
                    const getAlpha = (distance: number) => {
                        if (distance >= maxDist) return 1;
                        const ratio = 1 - (distance / maxDist); // 1 at center, 0 at edge
                        return 0.5 + ratio * 0.5; // 0.5 to 1
                    };

                    const wght = weight ? getWeight(d) : 400;
                    const alph = alpha ? getAlpha(d) : 1;

                    span.style.opacity = alph.toString();
                    span.style.fontVariationSettings = `'wght' ${wght}`;
                });
            }

            rafId = requestAnimationFrame(animate);
        };

        animate();
        return () => cancelAnimationFrame(rafId);
    }, [weight, alpha, dist]);

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-full flex items-center justify-center overflow-hidden ${className}`}
            style={{ background: "transparent" }}
        >
            <h1
                ref={titleRef}
                className="text-center flex justify-center items-center select-none"
                style={{
                    fontFamily: `${fontFamily}, sans-serif`,
                    fontSize: fontSize,
                    lineHeight: 1,
                    color: displayColor,
                    WebkitTextStroke: strokeWidth ? `1px ${strokeColor}` : "none",
                    whiteSpace: "nowrap",
                    transformOrigin: "center center",
                    fontVariationSettings: "'wght' 100", // Initial light weight
                    textTransform: "uppercase",
                    letterSpacing: "0.02em",
                }}
            >
                {chars.map((char, i) => (
                    <span
                        key={i}
                        ref={(el) => { spansRef.current[i] = el; }}
                        style={{
                            display: "inline-block",
                            transition: "font-variation-settings 0.1s ease-out",
                        }}
                    >
                        {char === " " ? "\u00A0" : char}
                    </span>
                ))}
            </h1>
        </div>
    );
}

export default TextPressure;
