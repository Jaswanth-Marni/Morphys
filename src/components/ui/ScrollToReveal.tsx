"use client";

import { motion, useMotionValue } from "framer-motion";
import React, { useRef, createContext, useContext, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

// Context to pass the scroll container ref and scroll trigger
interface ScrollContextValue {
    containerRef: React.RefObject<HTMLDivElement | null>;
    registerWord: (element: HTMLSpanElement, setOpacity: (val: number) => void) => () => void;
}

const ScrollContainerContext = createContext<ScrollContextValue | null>(null);

interface ScrollToRevealProps {
    text: string;
    className?: string;
    minOpacity?: number;
}

const Word = ({
    children,
    minOpacity = 0.15
}: {
    children: string;
    minOpacity?: number;
}) => {
    const ref = useRef<HTMLSpanElement>(null);
    const context = useContext(ScrollContainerContext);
    const opacity = useMotionValue(minOpacity);

    useEffect(() => {
        if (!ref.current || !context) return;

        const setOpacityValue = (val: number) => {
            opacity.set(val);
        };

        const unregister = context.registerWord(ref.current, setOpacityValue);
        return unregister;
    }, [context, opacity]);

    return (
        <motion.span
            ref={ref}
            style={{ opacity }}
            className="mr-3 md:mr-4 inline-block"
        >
            {children}
        </motion.span>
    );
};

export const ScrollToReveal: React.FC<ScrollToRevealProps> = ({
    text,
    className,
    minOpacity = 0.15,
}) => {
    const words = text.split(" ");

    return (
        <div className={cn("flex flex-wrap leading-[1.5] font-kugile", className)}>
            {words.map((word, i) => (
                <Word key={i} minOpacity={minOpacity}>
                    {word}
                </Word>
            ))}
        </div>
    );
};

// Self-contained sandbox component with its own scroll container
interface ScrollToRevealSandboxProps {
    text: string;
    className?: string;
    minOpacity?: number;
}

export const ScrollToRevealSandbox: React.FC<ScrollToRevealSandboxProps> = ({
    text,
    className,
    minOpacity = 0.15,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const words = text.split(" ");
    const wordRefs = useRef<Map<HTMLSpanElement, (val: number) => void>>(new Map());

    // Calculate opacity based on element position within container
    const updateOpacities = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        const containerRect = container.getBoundingClientRect();
        const containerCenter = containerRect.height / 2;

        wordRefs.current.forEach((setOpacity, element) => {
            const elementRect = element.getBoundingClientRect();
            // Get element center relative to container top
            const elementCenterY = elementRect.top - containerRect.top + elementRect.height / 2;

            // Calculate distance from container center (0 = at center, 1 = at edge)
            const distanceFromCenter = Math.abs(elementCenterY - containerCenter) / containerCenter;

            // Clamp distance
            const normalizedDistance = Math.min(1, Math.max(0, distanceFromCenter));

            // Apply power curve for sharper falloff - higher power = more focused highlight
            // This makes only ~2-3 lines bright at a time
            const sharpness = 4;
            const focusedFalloff = Math.pow(1 - normalizedDistance, sharpness);
            const calculatedOpacity = minOpacity + focusedFalloff * (1 - minOpacity);

            setOpacity(calculatedOpacity);
        });
    }, [minOpacity]);

    // Register word elements
    const registerWord = useCallback((element: HTMLSpanElement, setOpacity: (val: number) => void) => {
        wordRefs.current.set(element, setOpacity);
        // Initial update
        requestAnimationFrame(updateOpacities);
        return () => {
            wordRefs.current.delete(element);
        };
    }, [updateOpacities]);

    // Handle scroll events
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            requestAnimationFrame(updateOpacities);
        };

        container.addEventListener('scroll', handleScroll, { passive: true });
        // Initial calculation
        handleScroll();

        return () => {
            container.removeEventListener('scroll', handleScroll);
        };
    }, [updateOpacities]);

    // Smooth scroll state
    const targetScrollRef = useRef(0);
    const currentScrollRef = useRef(0);
    const isAnimatingRef = useRef(false);

    // Use native event listener to prevent Lenis from intercepting scroll
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Initialize scroll positions
        targetScrollRef.current = container.scrollTop;
        currentScrollRef.current = container.scrollTop;

        const smoothScroll = () => {
            if (!container) return;

            // Lerp towards target
            const ease = 0.12; // Lower = smoother, higher = snappier
            currentScrollRef.current += (targetScrollRef.current - currentScrollRef.current) * ease;

            // Apply scroll
            container.scrollTop = currentScrollRef.current;

            // Continue animation if not close enough
            if (Math.abs(targetScrollRef.current - currentScrollRef.current) > 0.5) {
                requestAnimationFrame(smoothScroll);
            } else {
                isAnimatingRef.current = false;
                currentScrollRef.current = targetScrollRef.current;
                container.scrollTop = targetScrollRef.current;
            }
        };

        const handleWheel = (e: WheelEvent) => {
            const { scrollHeight, clientHeight } = container;
            const maxScroll = scrollHeight - clientHeight;

            // Calculate new target
            const scrollAmount = e.deltaY * 0.8; // Reduce scroll speed slightly
            let newTarget = targetScrollRef.current + scrollAmount;

            // Clamp target
            newTarget = Math.max(0, Math.min(maxScroll, newTarget));

            const isAtTop = newTarget <= 0 && e.deltaY < 0;
            const isAtBottom = newTarget >= maxScroll && e.deltaY > 0;

            // If we can scroll in the direction of the wheel, capture the event
            if (!isAtTop && !isAtBottom) {
                e.preventDefault();
                e.stopPropagation();

                targetScrollRef.current = newTarget;

                // Start animation if not already running
                if (!isAnimatingRef.current) {
                    isAnimatingRef.current = true;
                    requestAnimationFrame(smoothScroll);
                }
            }
        };

        // Use passive: false to allow preventDefault
        container.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            container.removeEventListener('wheel', handleWheel);
        };
    }, []);

    const contextValue: ScrollContextValue = {
        containerRef,
        registerWord,
    };

    return (
        <ScrollContainerContext.Provider value={contextValue}>
            {/* Dark background wrapper */}
            <div className="w-full h-full bg-[#0a0a0a]">
                <div
                    ref={containerRef}
                    className="w-full h-full overflow-y-auto"
                    style={{
                        overscrollBehavior: 'contain',
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    {/* Top spacer for scroll room - allows first words to reach center */}
                    <div className="h-[50%]" />

                    {/* Main text content */}
                    <div className={cn(
                        "px-6 md:px-20 lg:px-32 flex flex-wrap leading-[1.15] justify-start font-kugile",
                        className
                    )}>
                        {words.map((word, i) => (
                            <Word key={i} minOpacity={minOpacity}>
                                {word}
                            </Word>
                        ))}
                    </div>

                    {/* Bottom spacer for scroll room - allows last words to reach center */}
                    <div className="h-[50%]" />
                </div>
            </div>
        </ScrollContainerContext.Provider>
    );
};

// Preview component for the card (static, no scroll needed)
export function ScrollToRevealPreview() {
    // Sample words with opacity values simulating the center-focused highlight effect
    const previewWords = [
        { text: "Morphys", opacity: 0.15 },
        { text: "is", opacity: 0.15 },
        { text: "a", opacity: 0.25 },
        { text: "curated", opacity: 0.4 },
        { text: "collection", opacity: 0.7 },
        { text: "of", opacity: 0.9 },
        { text: "high", opacity: 1 },
        { text: "performance", opacity: 1 },
        { text: "UI", opacity: 0.9 },
        { text: "components", opacity: 0.7 },
        { text: "designed", opacity: 0.4 },
        { text: "to", opacity: 0.25 },
        { text: "elevate", opacity: 0.15 },
        { text: "your", opacity: 0.15 },
    ];

    return (
        <div className="w-full h-full bg-[#0a0a0a] overflow-hidden">
            {/* Content wrapper with same padding as original */}
            <div className="w-full h-full flex items-center">
                <div className="px-4 md:px-6 flex flex-wrap leading-[1.15] justify-start font-kugile text-xl md:text-2xl lg:text-3xl">
                    {previewWords.map((word, i) => (
                        <span
                            key={i}
                            className="mr-2 md:mr-3 inline-block"
                            style={{
                                opacity: word.opacity,
                                color: '#e8e4dc'
                            }}
                        >
                            {word.text}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ScrollToReveal;
