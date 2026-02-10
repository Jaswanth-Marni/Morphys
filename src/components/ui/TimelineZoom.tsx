"use client";

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { motion, useSpring, useTransform, useMotionValue, useVelocity, useAnimationFrame } from 'framer-motion';
import { ProgressiveBlur } from './ProgressiveBlur';

// ============================================
// TYPES
// ============================================

interface TimelineItem {
    id: string;
    label: string;
    subLabel?: string;
    image: string; // URL to the background image
    logo?: string; // URL to the logo image
    offset: number; // Position on the timeline (0-100 or pixel based)
}

interface TimelineZoomProps {
    items?: TimelineItem[];
    className?: string;
    defaultImage?: string;
}

// ============================================
// DEFAULT DATA
// ============================================

const DEFAULT_ITEMS: TimelineItem[] = [
    {
        id: '1',
        label: 'ONE PIECE',
        subLabel: '1999',
        image: '/desktop/one-piece-season-15-3840x2160-22064.jpg',
        logo: '/anime logo/one-piece - logo.png',
        offset: 5
    },
    {
        id: '2',
        label: 'DEMON SLAYER',
        subLabel: '2019',
        image: '/desktop/demon-slayer-3840x2160-23615.jpg',
        logo: '/anime logo/demon-slayer-logo.png',
        offset: 15
    },
    {
        id: '3',
        label: 'JUJUTSU KAISEN',
        subLabel: '2020',
        image: '/desktop/jujutsu-kaisen-3840x2160-19746.jpg',
        logo: '/anime logo/Jujutsu_Kaisen_logo.png',
        offset: 25
    },
    {
        id: '4',
        label: 'CHAINSAW MAN',
        subLabel: '2022',
        image: '/desktop/chainsaw-man-the-5120x2880-23013.jpg',
        logo: '/anime logo/Chainsaw_Man_logo.png',
        offset: 35
    },
    {
        id: '5',
        label: 'SPY X FAMILY',
        subLabel: '2022',
        image: '/desktop/spy-x-family-season-5120x2880-24443.png',
        logo: '/anime logo/Spy_×_Family_logo.png',
        offset: 45
    },
    {
        id: '6',
        label: 'SOLO LEVELING',
        subLabel: '2024',
        image: '/desktop/solo-leveling-3840x2160-20374.png',
        logo: '/anime logo/Solo_Leveling_English_logo.png',
        offset: 55
    },
    {
        id: '7',
        label: 'KAIJU NO. 8',
        subLabel: '2024',
        image: '/desktop/kaiju-no-8-mission-7680x4320-21963.jpg',
        logo: '/anime logo/怪獣8号_logo.png',
        offset: 65
    },
    {
        id: '8',
        label: 'DANDADAN',
        subLabel: '2024',
        image: '/desktop/dandadan-evil-eye-5120x2880-22717.jpg',
        logo: '/anime logo/dandandan-logo.png',
        offset: 75
    },
    {
        id: '9',
        label: 'SAKAMOTO DAYS',
        subLabel: '2025',
        image: '/desktop/sakamoto-days-5120x2880-23913.jpg',
        logo: '/anime logo/sakamoto days - logo.png',
        offset: 85
    },
    {
        id: '10',
        label: 'GACHIAKUTA',
        subLabel: '2025',
        image: '/desktop/gachiakuta-3840x2160-22842.jpg',
        logo: '/anime logo/gachiakuta logo.png',
        offset: 95
    }
];

// ============================================
// TICK COMPONENT
// ============================================

interface TickProps {
    index: number;
    totalTicks: number;
    x: number; // normalized position 0-1
    activeItem: TimelineItem | null;
    mouseX: any; // MotionValue
    isMajor: boolean;
    label?: string;
    subLabel?: string;
    logo?: string;
    containerWidth: number;
    onClick?: () => void;
}

const Tick = ({ index, x, mouseX, isMajor, label, subLabel, logo, containerWidth, onClick }: TickProps) => {
    const tickRef = useRef<HTMLDivElement>(null);
    const [elementX, setElementX] = useState(0);

    // Calculate distance from mouse to this tick
    // We use a spring to smooth out the height changes
    const heightSpring = useSpring(isMajor ? 32 : 18, { stiffness: 300, damping: 20 });
    const errorFix = 0; // variable unused

    // Wave physics parameters
    const MAX_DIST = 150; // Influence radius of the cursor
    const MAX_HEIGHT = isMajor ? 80 : 50; // Max height when hovered
    const BASE_HEIGHT = isMajor ? 32 : 18; // Resting height
    const [isHovered, setIsHovered] = useState(false);

    useAnimationFrame(() => {
        if (!tickRef.current) return;

        // precise X position of this tick on screen
        const rect = tickRef.current.getBoundingClientRect();
        const currentX = rect.left + rect.width / 2;
        setElementX(currentX); // Store for click handling if needed

        const mouseXValue = mouseX.get();
        const mouseVel = mouseX.getVelocity();

        const dist = currentX - mouseXValue; // Signed distance

        // Add velocity skew
        const skew = mouseVel * 0.05;

        // Effective distance calculation with skew
        const effectiveDist = Math.abs(dist - skew);

        if (effectiveDist < MAX_DIST) {
            // Gaussian-ish curve for smooth wave
            const power = 1 - (effectiveDist / MAX_DIST);

            // Add some "pressure" effect
            const velocityFactor = Math.min(Math.abs(mouseVel) / 1000, 0.5);

            const targetHeight = BASE_HEIGHT + (MAX_HEIGHT - BASE_HEIGHT) * Math.pow(power, 2) * (1 + velocityFactor);
            heightSpring.set(targetHeight);

            // We removed opacity modulation for minor ticks to ensure uniformity

            // Show logo if we are close enough (threshold)
            const shouldHover = power > 0.4;
            if (shouldHover !== isHovered) {
                setIsHovered(shouldHover);
            }

        } else {
            heightSpring.set(BASE_HEIGHT);
            if (isHovered) setIsHovered(false);
        }
    });

    return (
        <div
            ref={tickRef}
            className={`absolute bottom-0 flex flex-col items-center justify-end cursor-pointer group`}
            style={{
                left: `${x * 100}%`,
                width: isMajor ? '2px' : '1px',
                transform: 'translateX(-50%)',
                zIndex: isMajor ? 10 : 1
            }}
            onClick={onClick}
        >
            {isMajor && (
                <motion.div
                    className="mb-4 flex flex-col items-center justify-center select-none"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{
                        opacity: isHovered ? 1 : 0,
                        y: isHovered ? 0 : 10,
                        scale: isHovered ? 1 : 0.8
                    }}
                    transition={{ duration: 0.2 }}
                >
                    {logo ? (
                        <div className="relative w-32 h-16 flex items-end justify-center pb-2">
                            <img
                                src={logo}
                                alt={label || 'logo'}
                                className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] brightness-125"
                            />
                        </div>
                    ) : (
                        label && (
                            <div className="bg-black/80 backdrop-blur-md text-white/90 px-4 py-2 rounded-full text-sm font-bold border border-white/10 shadow-lg flex items-center gap-2 font-thunder tracking-wide">
                                <span className="uppercase">{label}</span>
                                {subLabel && <span className="text-white/50 border-l border-white/20 pl-2 font-normal">{subLabel}</span>}
                            </div>
                        )
                    )}
                </motion.div>
            )}

            <motion.div
                className={`w-full bg-white ${isMajor ? 'rounded-t-full shadow-[0_0_10px_rgba(255,255,255,0.3)]' : ''}`}
                style={{
                    height: heightSpring,
                    opacity: isMajor ? 1 : 0.75,
                }}
            />
        </div>
    );
};

// ============================================
// COMPONENT
// ============================================

export function TimelineZoom({
    items = DEFAULT_ITEMS,
    className = "",
    defaultImage
}: TimelineZoomProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(-1000); // Initialize off-screen
    const [containerWidth, setContainerWidth] = useState(1000);
    const [activeItem, setActiveItem] = useState<TimelineItem>(items[0]);
    const [scrollProgress, setScrollProgress] = useState(0);

    // Initial background
    const [currentImage, setCurrentImage] = useState(items[0].image);

    // Handle resize
    useEffect(() => {
        if (containerRef.current) {
            setContainerWidth(containerRef.current.getBoundingClientRect().width);
        }

        const handleResize = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.getBoundingClientRect().width);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Generate ticks
    // We want a tick every X pixels approximately
    const TICK_DENSITY = 12; // increased density slightly
    const TOTAL_TICKS = Math.max(2, Math.floor(containerWidth / TICK_DENSITY)); // ensure at least 2 ticks

    // Map items to closest tick indices
    const majorTickIndices = useMemo(() => {
        const indices = new Map<number, TimelineItem>();
        items.forEach(item => {
            // calculated index 0 to TOTAL_TICKS-1
            // item.offset is 0-100
            // index = (offset / 100) * (TOTAL_TICKS - 1)
            const index = Math.round((item.offset / 100) * (TOTAL_TICKS - 1));
            indices.set(index, item);
        });
        return indices;
    }, [TOTAL_TICKS, items]);

    // Create tick data
    const ticks = useMemo(() => {
        return Array.from({ length: TOTAL_TICKS }).map((_, i) => {
            const majorItem = majorTickIndices.get(i);

            return {
                id: i,
                x: i / (TOTAL_TICKS - 1),
                isMajor: !!majorItem,
                item: majorItem
            };
        });
    }, [TOTAL_TICKS, majorTickIndices]);

    // Handle mouse movement
    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
            mouseX.set(e.clientX);

            // Calculate hover percent to potentially seek/preview (optional)
            // const x = e.clientX - rect.left;
            // const percent = x / rect.width;
        }
    };

    const handleMouseLeave = () => {
        mouseX.set(-1000);
    };

    // Click to jump to section
    const handleTickClick = (item: TimelineItem) => {
        setActiveItem(item);
        setCurrentImage(item.image);
    };

    // Find closest item to cursor for "settling" logic ideally
    // For now, we'll simple detect hover near major points or just let click interaction work
    // The prompt implies "scrolling" reveals. 
    // Let's implement a scroll container logic if requested, but horizontally.
    // However, the "pressure wave" implies mouse interaction as primary for the wave.

    // Update active item based on hover-scrubbing could be cool:
    // If the user hovers over a major point, maybe we "peek" that image?
    // "when the user settles at that point by scrolling then the picture is revealed"

    // Let's implement actual horizontal scrolling
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useTransform(mouseX, [0, 1], [0, 1]) as any; // placeholder

    const onScroll = () => {
        if (!scrollContainerRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        const progress = (scrollLeft / (scrollWidth - clientWidth)) * 100;
        setScrollProgress(progress);

        // Find closest item
        let closest = items[0];
        let minDiff = Infinity;

        items.forEach(item => {
            const diff = Math.abs(item.offset - progress);
            if (diff < minDiff) {
                minDiff = diff;
                closest = item;
            }
        });

        // If we are "close enough" and "settled" (velocity low), we switch
        // For simplicity, let's switch active item when within range
        if (closest.id !== activeItem.id && minDiff < 10) {
            setActiveItem(closest);
            setCurrentImage(closest.image); // Instant switch or transition?
        }
    };

    // Smooth transition of background
    // We can layer the images and fade opacity

    return (
        <div
            className={`relative w-full h-full min-h-[600px] bg-black overflow-hidden font-sans select-none ${className}`}
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* Background Images Layer */}
            <div className="absolute inset-0 z-0">
                {items.map((item) => (
                    <motion.div
                        key={item.id}
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${item.image})` }}
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: activeItem.id === item.id ? 1 : 0,
                            scale: activeItem.id === item.id ? 1.05 : 1
                        }}
                        transition={{ duration: 1, ease: 'easeInOut' }}
                    />
                ))}
                {/* Overlay Vignette removed */}
            </div>

            {/* Content Container */}
            <div className="relative z-10 w-full h-full flex flex-col justify-end pb-0">

                {/* Unified Text Layer (SVG for perfect alignment) */}
                <div className="absolute inset-0 z-20 pointer-events-none mix-blend-normal">
                    <motion.div
                        key={activeItem.id + "-text-layer"}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full h-full"
                    >
                        <svg width="100%" height="100%">
                            <defs>
                                <mask id={`title-mask-${activeItem.id}`}>
                                    <rect width="100%" height="100%" fill="black" />
                                    <text
                                        x="48"
                                        y="70"
                                        fill="white"
                                        fontSize="9rem"
                                        fontFamily="'Thunder', sans-serif"
                                        fontWeight="bold"
                                        letterSpacing="1px"
                                        className="uppercase font-thunder tracking-[1px] leading-[0.8]"
                                        dominantBaseline="hanging"
                                    >
                                        {activeItem.label}
                                    </text>
                                </mask>
                            </defs>

                            {/* 1. Top Label: CURRENT SERIES */}
                            <text
                                x="48"
                                y="40"
                                fill="white"
                                fillOpacity="0.6"
                                fontSize="1.25rem"
                                fontFamily="'Thunder', sans-serif"
                                fontWeight="bold"
                                letterSpacing="0.2em"
                                className="uppercase font-thunder"
                                dominantBaseline="auto"
                            >
                                CURRENT SERIES
                            </text>

                            {/* 2. Frosted Title Layer */}
                            <foreignObject width="100%" height="100%" mask={`url(#title-mask-${activeItem.id})`}>
                                <div className="w-full h-full relative overflow-hidden">
                                    {/* Blurred Background Layer */}
                                    <div className="absolute inset-0">
                                        {items.map((item) => (
                                            <div
                                                key={item.id}
                                                className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
                                                style={{
                                                    backgroundImage: `url(${item.image})`,
                                                    opacity: activeItem.id === item.id ? 1 : 0,
                                                }}
                                            >
                                                <div className="absolute inset-0 backdrop-blur-[20px] backdrop-saturate-150 backdrop-brightness-125" />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="absolute inset-0 bg-white/10" />
                                </div>
                            </foreignObject>

                            {/* 3. Bottom Label: YEAR */}
                            <text
                                x="48"
                                y="175"
                                fill="white"
                                fillOpacity="0.8"
                                fontSize="2rem"
                                fontFamily="'Thunder', sans-serif"
                                fontWeight="bold"
                                letterSpacing="0.1em"
                                className="uppercase font-thunder"
                                dominantBaseline="hanging"
                            >
                                {activeItem.subLabel}
                            </text>
                        </svg>
                    </motion.div>
                </div>

                {/* Progressive Blur at Bottom Edge - moved behind timeline */}
                <ProgressiveBlur
                    position="bottom"
                    height="150px"
                    blurLevels={[0.5, 1, 2, 3, 4, 5, 6, 8]}
                    className="z-0 pointer-events-none"
                />

                {/* Main Timeline Interactive Area */}
                {/* We use a scrollable container to allow "scrolling" behavior if desired, 
                    OR we can map mouse position to scroll. 
                    Given "scrolling" description, let's assume actual scroll interaction or drag.
                */}

                <div className="w-full px-0 relative z-20">

                    {/* The Ruler */}
                    <div className="relative h-32 w-full flex items-end">
                        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                        {/* Render Ticks */}
                        {ticks.map((tick, i) => (
                            <Tick
                                key={tick.id}
                                index={i}
                                totalTicks={TOTAL_TICKS}
                                x={tick.x} // Position 0-1
                                activeItem={activeItem}
                                mouseX={mouseX}
                                isMajor={tick.isMajor}
                                label={tick.item?.label}
                                subLabel={tick.item?.subLabel}
                                logo={tick.item?.logo}
                                containerWidth={containerWidth}
                                onClick={() => tick.item && handleTickClick(tick.item)}
                            />
                        ))}
                    </div>

                    {/* Indicator "Now" or "Cursor" text following mouse? */}
                    <motion.div
                        className="absolute bottom-40 pointer-events-none"
                        style={{ x: mouseX, xOffset: '-50%' }}
                    >
                        {/* <div className="px-3 py-1 rounded bg-white/10 backdrop-blur text-xs text-white border border-white/20">
                            SCANNING
                        </div> */}
                    </motion.div>
                </div>


            </div>

            {/* Draggable/Scrollable hint overlay if needed */}
        </div>
    );
}
