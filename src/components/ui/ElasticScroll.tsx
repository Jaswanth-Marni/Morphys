"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useVelocity, useTransform, useSpring, useMotionValue, useMotionTemplate, AnimatePresence } from 'framer-motion';

// ============================================
// CONFIGURATION
// ============================================

interface ElasticScrollConfig {
    items: {
        name: string;
        id: string;
        image?: string;
    }[];
    sensitivity: number;
    damping: number;
    stiffness: number;
}

const defaultItems = [
    { name: "CHAINSAW MAN", id: "01", image: "/desktop/chainsaw-man-the-5120x2880-23013.jpg" },
    { name: "DANDADAN", id: "02", image: "/desktop/dandadan-evil-eye-5120x2880-22717.jpg" },
    { name: "DEMON SLAYER", id: "03", image: "/desktop/demon-slayer-3840x2160-23615.jpg" },
    { name: "JUJUTSU KAISEN", id: "04", image: "/desktop/jujutsu-kaisen-3840x2160-19746.jpg" },
    { name: "KAIJU NO. 8", id: "05", image: "/desktop/kaiju-no-8-mission-7680x4320-21963.jpg" },
    { name: "ONE PIECE", id: "06", image: "/desktop/one-piece-season-15-3840x2160-22064.jpg" },
    { name: "SOLO LEVELING", id: "07", image: "/desktop/solo-leveling-3840x2160-20374.png" },
    { name: "SAKAMOTO DAYS", id: "08", image: "/desktop/sakamoto-days-5120x2880-23913.jpg" },
    { name: "GACHIAKUTA", id: "09", image: "/desktop/gachiakuta-3840x2160-22842.jpg" },
    { name: "SPY X FAMILY", id: "10", image: "/desktop/spy-x-family-season-5120x2880-24443.png" },
    { name: "TO BE HERO X", id: "11", image: "/desktop/solo-leveling-3840x2160-20374.png" }, // Reusing solo leveling as placeholder if HERO X is missing
];

const defaultConfig: ElasticScrollConfig = {
    items: defaultItems,
    sensitivity: 0.15,
    damping: 15,
    stiffness: 150,
};

// ============================================
// ELASTIC ITEM COMPONENT
// ============================================

const ElasticItem = ({
    item,
    velocity,
    index,
    totalItems
}: {
    item: { name: string; id: string; image?: string };
    velocity: any;
    index: number;
    totalItems: number;
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const textRef = useRef<HTMLSpanElement>(null);
    const [formattedName, setFormattedName] = useState(item.name);

    // Physics for Scroll
    const rawWeight = useTransform(velocity, (v: number) => {
        const absV = Math.abs(v);
        return Math.max(100, 900 - (absV * 0.4));
    });

    const weight = useSpring(rawWeight, { stiffness: 400, damping: 30 });

    const rawScaleY = useTransform(velocity, (v: number) => {
        const absV = Math.abs(v);
        return 1 + (absV * 0.0002);
    });
    const scaleY = useSpring(rawScaleY, { stiffness: 200, damping: 20 });

    const rawSkewX = useTransform(velocity, [-3000, 3000], [15, -15]);
    const skewX = useSpring(rawSkewX, { stiffness: 100, damping: 20 });

    const fontSettings = useMotionTemplate`'wdth' 100, 'wght' ${weight}, 'opsz' 72`;

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
    };

    // calculateWrap: Enforce wrapping from full-weight state
    useEffect(() => {
        const checkWrapping = () => {
            if (!textRef.current) return;

            // Normalize to single line for testing
            const originalText = item.name.replace(/\n/g, ' ');
            const words = originalText.split(' ');
            if (words.length <= 1) {
                setFormattedName(originalText);
                return;
            }

            const parentWidth = textRef.current.clientWidth;
            const computedStyle = window.getComputedStyle(textRef.current);
            const fontSize = computedStyle.fontSize;
            const fontFamily = computedStyle.fontFamily;
            const letterSpacing = computedStyle.letterSpacing;

            // Create a temporary element to measure
            const testEl = document.createElement('div');
            testEl.style.width = `${parentWidth}px`;
            testEl.style.fontSize = fontSize;
            testEl.style.fontFamily = fontFamily;
            testEl.style.letterSpacing = letterSpacing;
            testEl.style.fontVariationSettings = "'wdth' 100, 'wght' 900, 'opsz' 72"; // Force full weight
            testEl.style.whiteSpace = 'pre-wrap';
            testEl.style.position = 'absolute';
            testEl.style.visibility = 'hidden';
            testEl.style.lineHeight = '0.8';
            testEl.style.top = '-9999px';
            testEl.style.left = '-9999px';

            document.body.appendChild(testEl);

            // Measure single line height
            testEl.textContent = "A";
            const singleLineHeight = testEl.clientHeight;

            let lines: string[] = [];
            let currentLine = words[0];

            for (let i = 1; i < words.length; i++) {
                const word = words[i];
                const testString = currentLine + " " + word;
                testEl.textContent = testString;

                // If height exceeds single line significantly, it wrapped
                if (testEl.clientHeight > singleLineHeight * 1.5) {
                    lines.push(currentLine);
                    currentLine = word;
                } else {
                    currentLine = testString;
                }
            }
            lines.push(currentLine);

            setFormattedName(lines.join('\n'));
            document.body.removeChild(testEl);
        };

        // Run initially and on resize
        checkWrapping();
        window.addEventListener('resize', checkWrapping);
        return () => window.removeEventListener('resize', checkWrapping);
    }, [item.name]);

    return (
        <motion.div
            className="relative w-full border-b border-foreground/10 py-16 cursor-pointer overflow-visible group"
            style={{ zIndex: totalItems - index, isolation: 'isolate' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseMove={handleMouseMove}
        >
            {/* Floating Image Reveal */}
            <AnimatePresence>
                {isHovered && item.image && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.8, rotate: 5 }}
                        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                        className="absolute pointer-events-none z-20 w-[400px] h-[250px] overflow-hidden"
                        style={{
                            x: mouseX,
                            y: mouseY,
                            translateX: '-50%',
                            translateY: '-50%',
                        }}
                    >
                        <div className="w-full h-full relative">
                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover shadow-2xl"
                            />
                            {/* Simple dark overlay without blur */}
                            <div className="absolute inset-0 bg-black/5" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Text Layer */}
            <div className="relative z-10 w-full flex items-center justify-center pointer-events-none px-8">
                <motion.span
                    ref={textRef}
                    style={{
                        scaleY,
                        skewX,
                        fontVariationSettings: fontSettings,
                    }}
                    className="text-[10vw] leading-[0.8] text-foreground font-whyte select-none text-center origin-center block will-change-transform whitespace-pre-line"
                >
                    {formattedName}
                </motion.span>
            </div>

            {/* ID Number */}
            <div className="absolute left-8 top-1/2 -translate-y-1/2 text-sm font-mono opacity-30 mix-blend-difference pointer-events-none z-30 transition-colors duration-300">
                {item.id}
            </div>
        </motion.div>
    );
};

// ============================================
// MAIN COMPONENT
// ============================================

export function ElasticScroll({
    config: userConfig,
    className = ""
}: {
    config?: Partial<ElasticScrollConfig>,
    className?: string
}) {
    const config = { ...defaultConfig, ...userConfig };
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // Scroll position motion value — drives the translateY of the content
    const scrollY = useMotionValue(0);

    // Velocity derived from scrollY — drives the elastic text effects
    const velocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(velocity, { damping: 50, stiffness: 400 });

    // Track content height for scroll bounds
    const [maxScroll, setMaxScroll] = useState(0);

    useEffect(() => {
        const updateBounds = () => {
            if (contentRef.current && containerRef.current) {
                const contentH = contentRef.current.scrollHeight;
                const containerH = containerRef.current.clientHeight;
                setMaxScroll(Math.max(0, contentH - containerH));
            }
        };
        // Small delay to let items fully render/measure
        const timer = setTimeout(updateBounds, 100);
        window.addEventListener('resize', updateBounds);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateBounds);
        };
    }, [config.items]);

    const handleWheel = useCallback((e: React.WheelEvent) => {
        const current = scrollY.get();
        // Clamp the scroll within bounds
        const next = Math.min(Math.max(current + e.deltaY, 0), maxScroll);
        scrollY.set(next);
    }, [scrollY, maxScroll]);

    // Negate scroll for translateY directly (no spring = no overshoot at bounds)
    const translateY = useTransform(scrollY, (v) => -v);

    return (
        <div
            ref={containerRef}
            onWheel={handleWheel}
            className={`w-full h-full bg-transparent cursor-ns-resize overflow-hidden relative ${className}`}
        >
            {/* Inject Font Face */}
            <style jsx global>{`
                @font-face {
                    font-family: 'ABC Whyte Inktrap';
                    src: url('/ABCWhyteInktrapVariable-Trial.ttf') format('truetype');
                    font-weight: 100 900;
                    font-style: normal;
                    font-display: swap;
                }
                .font-whyte {
                    font-family: 'ABC Whyte Inktrap', sans-serif;
                }
            `}</style>

            <motion.div
                ref={contentRef}
                style={{ y: translateY }}
                className="w-full max-w-7xl mx-auto px-4 pb-32 will-change-transform"
            >
                {config.items.map((item, i) => (
                    <ElasticItem
                        key={item.id}
                        item={item}
                        index={i}
                        totalItems={config.items.length}
                        velocity={smoothVelocity}
                    />
                ))}
            </motion.div>

            <div className="fixed bottom-8 left-8 text-xs font-mono opacity-40 pointer-events-none mix-blend-difference text-white z-50">
                SCROLL VELOCITY DRIVEN TYPOGRAPHY
            </div>
        </div>
    );
}

// ============================================
// PREVIEW COMPONENT
// ============================================

export function ElasticScrollPreview() {
    return (
        <div className="w-full h-full bg-background flex flex-col overflow-hidden relative">
            <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,_rgba(0,0,0,0.2),transparent_70%)]" />

            <div className="flex flex-col w-full h-full overflow-hidden">
                {defaultItems.slice(0, 5).map((item, i) => (
                    <div key={i} className="flex-1 w-full border-b border-foreground/10 flex items-center justify-center relative min-h-[60px]">
                        <div className="text-3xl md:text-4xl text-foreground font-whyte font-bold tracking-tighter text-center whitespace-nowrap px-4" style={{ fontVariationSettings: "'wght' 600, 'wdth' 100" }}>
                            {item.name}
                        </div>
                        <div className="absolute left-4 text-[10px] font-mono opacity-30">
                            {item.id}
                        </div>
                    </div>
                ))}
            </div>

            <style jsx global>{`
                @font-face {
                    font-family: 'ABC Whyte Inktrap';
                    src: url('/ABCWhyteInktrapVariable-Trial.ttf') format('truetype');
                    font-weight: 100 900;
                    font-style: normal;
                    font-display: swap;
                }
                .font-whyte {
                    font-family: 'ABC Whyte Inktrap', sans-serif;
                }
            `}</style>
        </div>
    );
}

export default ElasticScroll;
