"use client";

import { motion, useMotionValue, useMotionTemplate } from "framer-motion";
import React, { useRef, createContext, useContext, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

// Context to pass the scroll container ref and scroll trigger
interface ScrollContextValue {
    containerRef: React.RefObject<HTMLDivElement | null>;
    registerWord: (element: HTMLSpanElement, update: (opacity: number, blur: number, scale: number) => void) => () => void;
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
    const blur = useMotionValue(5);
    const scale = useMotionValue(0.95);

    // Dynamic filter using template literal
    const filter = useMotionTemplate`blur(${blur}px)`;

    useEffect(() => {
        if (!ref.current || !context) return;

        const updateValues = (o: number, b: number, s: number) => {
            opacity.set(o);
            blur.set(b);
            scale.set(s);
        };

        const unregister = context.registerWord(ref.current, updateValues);
        return unregister;
    }, [context, opacity, blur, scale]);

    return (
        <motion.span
            ref={ref}
            style={{
                opacity,
                filter,
                scale
            }}
            className="mr-1.5 md:mr-2 inline-block will-change-transform transform-gpu"
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
    // ... Simplified version for component preview if needed, or just redirect
    return (
        <div className={cn("flex flex-wrap leading-[1.5]", className)}>
            {words.map((word, i) => (
                <span key={i} className="mr-3 md:mr-4 inline-block opacity-20">
                    {word}
                </span>
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
    const wordRefs = useRef<Map<HTMLSpanElement, (o: number, b: number, s: number) => void>>(new Map());

    // Calculate variations based on element position within container
    const updateOpacities = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        const containerRect = container.getBoundingClientRect();
        const containerCenter = containerRect.height / 2;

        wordRefs.current.forEach((update, element) => {
            const elementRect = element.getBoundingClientRect();
            // Get element center relative to container top
            const elementCenterY = elementRect.top - containerRect.top + elementRect.height / 2;

            // Calculate distance from container center (0 = at center, 1 = at edge)
            const distanceFromCenter = Math.abs(elementCenterY - containerCenter) / containerCenter;

            // Clamp distance
            const normalizedDistance = Math.min(1, Math.max(0, distanceFromCenter));

            // Apply power curve for sharper falloff - higher power = more focused highlight
            const sharpness = 4;
            const focusedFalloff = Math.pow(1 - normalizedDistance, sharpness); // 1.0 at center, 0.0 at edges

            // Calculate Opacity
            const calculatedOpacity = minOpacity + focusedFalloff * (1 - minOpacity);

            // Calculate Blur (0px at center, 4px at edges)
            const maxBlur = 4;
            const calculatedBlur = (1 - focusedFalloff) * maxBlur;

            // Calculate Scale (1.0 at center, 0.92 at edges)
            const minScale = 0.92;
            const calculatedScale = minScale + focusedFalloff * (1 - minScale);

            update(calculatedOpacity, calculatedBlur, calculatedScale);
        });
    }, [minOpacity]);

    // Register word elements
    const registerWord = useCallback((element: HTMLSpanElement, update: (o: number, b: number, s: number) => void) => {
        wordRefs.current.set(element, update);
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
        handleScroll();

        return () => {
            container.removeEventListener('scroll', handleScroll);
        };
    }, [updateOpacities]);

    // Use native event listener to prevent Lenis from intercepting scroll
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            const { scrollTop, scrollHeight, clientHeight } = container;
            const isAtTop = scrollTop <= 0;
            const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

            const scrollingDown = e.deltaY > 0;
            const scrollingUp = e.deltaY < 0;

            if ((scrollingDown && !isAtBottom) || (scrollingUp && !isAtTop)) {
                e.preventDefault();
                e.stopPropagation();
                container.scrollTop += e.deltaY;
            }
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, []);

    const contextValue: ScrollContextValue = {
        containerRef,
        registerWord,
    };

    return (
        <ScrollContainerContext.Provider value={contextValue}>
            {/* Dark background wrapper with noise texture */}
            <div className="w-full h-full bg-[#050505] relative overflow-hidden">
                {/* Noise texture overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }} />

                {/* Subtle spotlight gradient at the top */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[30%] bg-gradient-to-b from-white/5 to-transparent pointer-events-none blur-3xl" />

                <div
                    ref={containerRef}
                    className="w-full h-full overflow-y-auto relative z-10"
                    style={{
                        overscrollBehavior: 'contain',
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    {/* Top spacer */}
                    <div className="h-[50%]" />

                    {/* Main text content */}
                    <div className={cn(
                        "px-6 md:px-20 lg:px-32 flex flex-wrap leading-[1.2] justify-start",
                        className
                    )}>
                        {words.map((word, i) => (
                            <Word key={i} minOpacity={minOpacity}>
                                {word}
                            </Word>
                        ))}
                    </div>

                    {/* Bottom spacer */}
                    <div className="h-[50%]" />
                </div>
            </div>
        </ScrollContainerContext.Provider>
    );
};

// Preview component for the card (static, no scroll needed)
export function ScrollToRevealPreview() {
    return (
        <div className="w-full h-full p-6 flex flex-col items-center justify-center bg-[#050505] overflow-hidden relative">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
            }} />
            <p className="text-xl md:text-2xl font-serif text-center font-medium leading-relaxed uppercase relative z-10">
                <span className="text-[#e8e4dc]/20 blur-[1px]">Premium </span>
                <span className="text-[#e8e4dc]">Scroll</span>
                <span className="text-[#e8e4dc]/20 blur-[1px]"> reveal </span>
            </p>
        </div>
    );
}

export default ScrollToReveal;
