"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform, useSpring, MotionValue } from "framer-motion";

// Types
interface NotificationCard {
    id: number;
    title: string;
    description: string;
    image: string;
    color: string;
}

// Sample Data
const defaultCards: NotificationCard[] = [
    {
        id: 1,
        title: "Quantum",
        description: "Atmospheric data visualization",
        image: "/carousel1.png",
        color: "#8b5cf6"
    },
    {
        id: 2,
        title: "Cybernetics",
        description: "Modular sound synthesis",
        image: "/carousel2.jpg",
        color: "#10b981"
    },
    {
        id: 3,
        title: "Nebula",
        description: "Connected node systems",
        image: "/carousel3.jpg",
        color: "#3b82f6"
    },
    {
        id: 4,
        title: "Chronos",
        description: "Empty space rendering",
        image: "/carousel4.jpg",
        color: "#f59e0b"
    },
    {
        id: 5,
        title: "Velocity",
        description: "Rhythmic signal processing",
        image: "/carousel5.jpg",
        color: "#ef4444"
    },
    {
        id: 6,
        title: "Horizon",
        description: "Peak performance metrics",
        image: "/carousel6.jpg",
        color: "#ec4899"
    },
];

// Hook to detect theme (returns true if site is in light mode)
function useTheme() {
    const [isLightMode, setIsLightMode] = useState(false);

    useEffect(() => {
        // Check initial theme
        const checkTheme = () => {
            const theme = document.documentElement.getAttribute("data-theme");
            setIsLightMode(theme === "light");
        };

        checkTheme();

        // Watch for theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === "data-theme") {
                    checkTheme();
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });
        return () => observer.disconnect();
    }, []);

    return isLightMode;
}

export function NotificationStackPreview() {
    const isLightMode = useTheme();
    // Invert: light mode site = dark carousel, dark mode site = light carousel
    const isDarkCarousel = isLightMode;

    return (
        <div className={`w-full h-full flex items-center justify-center overflow-hidden relative ${isDarkCarousel ? 'bg-neutral-950' : 'bg-neutral-100'
            }`}>
            {/* Background ambiance */}
            <div className={`absolute inset-0 ${isDarkCarousel
                ? 'bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]'
                : 'bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.15),rgba(0,0,0,0))]'
                }`} />
            <NotificationStack />
        </div>
    );
}

// Custom Scrollbar Component
function FloatingScrollbar({
    dragY,
    totalCards,
    onScrollChange,
    isDarkCarousel,
    gap,
}: {
    dragY: MotionValue<number>;
    totalCards: number;
    onScrollChange: (newY: number) => void;
    isDarkCarousel: boolean;
    gap: number;
}) {
    const scrollTrackRef = useRef<HTMLDivElement>(null);
    const THUMB_HEIGHT = 40;
    const TRACK_HEIGHT = 200;

    // Calculate scroll range
    const MIN_DRAG_Y = 300 - (totalCards - 1) * gap;
    const MAX_DRAG_Y = 300;
    const DRAG_RANGE = MAX_DRAG_Y - MIN_DRAG_Y;

    // Transform dragY to thumb position
    const thumbY = useTransform(dragY, (val: number) => {
        const clampedVal = Math.min(MAX_DRAG_Y, Math.max(MIN_DRAG_Y, val));
        const progress = (MAX_DRAG_Y - clampedVal) / (DRAG_RANGE || 1);
        return progress * (TRACK_HEIGHT - THUMB_HEIGHT);
    });

    const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!scrollTrackRef.current) return;
        const rect = scrollTrackRef.current.getBoundingClientRect();
        const clickY = e.clientY - rect.top;
        const progress = clickY / TRACK_HEIGHT;
        const newDragY = MAX_DRAG_Y - (progress * (DRAG_RANGE || 1));
        onScrollChange(newDragY);
    };

    return (
        <div
            ref={scrollTrackRef}
            className={`absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-2 rounded-full backdrop-blur-sm cursor-pointer overflow-hidden ${isDarkCarousel ? 'bg-white/10' : 'bg-black/10'
                }`}
            style={{ height: TRACK_HEIGHT, zIndex: 100000 }}
            onClick={handleTrackClick}
        >
            {/* Scroll Thumb with Glow */}
            <motion.div
                className={`absolute left-0 right-0 w-2 rounded-full transition-colors cursor-grab active:cursor-grabbing ${isDarkCarousel
                    ? 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                    : 'bg-black shadow-[0_0_15px_rgba(0,0,0,0.3)]'
                    }`}
                style={{
                    y: thumbY,
                    height: THUMB_HEIGHT,
                }}
                drag="y"
                dragConstraints={{ top: 0, bottom: TRACK_HEIGHT - THUMB_HEIGHT }}
                dragElastic={0}
                dragMomentum={false}
                onDrag={(_, info) => {
                    const currentThumbY = thumbY.get();
                    const newThumbY = Math.min(Math.max(0, currentThumbY + info.delta.y), TRACK_HEIGHT - THUMB_HEIGHT);
                    const progress = newThumbY / (TRACK_HEIGHT - THUMB_HEIGHT);
                    const newDragY = MAX_DRAG_Y - (progress * DRAG_RANGE);
                    onScrollChange(newDragY);
                }}
                whileHover={{ scaleX: 1.5 }}
                whileTap={{ scaleX: 1.5 }}
                onPointerDown={(e) => {
                    e.stopPropagation();
                }}
            />
        </div>
    );
}

export function NotificationStack({ className = "" }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [cards] = useState<NotificationCard[]>(defaultCards);
    const isLightMode = useTheme();
    const [impactDirection, setImpactDirection] = useState<'top' | 'bottom' | null>(null);

    // Responsive State stored in ref to avoid re-creating transforms
    const [isMobile, setIsMobile] = useState(false);
    const configRef = useRef({ gap: 280, center: 300 });

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 640;
            setIsMobile(mobile);
            configRef.current = {
                gap: mobile ? 180 : 280,
                center: mobile ? 220 : 300,
            };
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Invert: light mode site = dark carousel, dark mode site = light carousel
    const isDarkCarousel = isLightMode;

    // Scroll boundaries (Responsive)
    const GAP = isMobile ? 180 : 280;
    const CENTER = isMobile ? 220 : 300;
    const MIN_DRAG_Y = CENTER - (cards.length - 1) * GAP;
    const MAX_DRAG_Y = CENTER;

    // Vertical drag/scroll value - use spring directly for smooth dragging
    const dragY = useMotionValue(MAX_DRAG_Y);
    // Smoother spring physics with higher damping for less oscillation
    const y = useSpring(dragY, { stiffness: 300, damping: 35, mass: 0.8 });

    // Boundary Clamp on Resize
    useEffect(() => {
        const current = dragY.get();
        const clamped = Math.min(MAX_DRAG_Y, Math.max(MIN_DRAG_Y, current));
        if (current !== clamped) {
            dragY.set(clamped);
        }
    }, [isMobile]);

    const handleScrollChange = (newY: number) => {
        const clampedY = Math.min(MAX_DRAG_Y, Math.max(MIN_DRAG_Y, newY));
        dragY.set(clampedY);
    };

    const handleDrag = (_: any, info: { delta: { y: number } }) => {
        const currentY = dragY.get();
        let newY = currentY + info.delta.y;

        // Check if hitting boundaries
        if (newY > MAX_DRAG_Y) {
            // Hitting top boundary (first card)
            const overscroll = newY - MAX_DRAG_Y;
            newY = MAX_DRAG_Y + (overscroll * 0.15); // Rubber band effect
            if (!impactDirection) {
                setImpactDirection('top');
                setTimeout(() => setImpactDirection(null), 300);
            }
        } else if (newY < MIN_DRAG_Y) {
            // Hitting bottom boundary (last card)
            const overscroll = MIN_DRAG_Y - newY;
            newY = MIN_DRAG_Y - (overscroll * 0.15); // Rubber band effect
            if (!impactDirection) {
                setImpactDirection('bottom');
                setTimeout(() => setImpactDirection(null), 300);
            }
        }

        dragY.set(newY);
    };

    const handleDragEnd = () => {
        // Snap back to boundaries if overscrolled
        const currentY = dragY.get();
        if (currentY > MAX_DRAG_Y) {
            dragY.set(MAX_DRAG_Y);
        } else if (currentY < MIN_DRAG_Y) {
            dragY.set(MIN_DRAG_Y);
        }
    };

    return (
        <div
            ref={containerRef}
            className={`w-full h-full flex items-center justify-center relative overflow-hidden ${className} ${isDarkCarousel ? 'bg-neutral-950' : 'bg-neutral-100'
                }`}
            style={{
                perspective: 1000,
                isolation: "isolate",
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
        >
            {/* Background ambiance */}
            <div className={`absolute inset-0 ${isDarkCarousel
                ? 'bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]'
                : 'bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.15),rgba(0,0,0,0))]'
                }`} />

            {/* Impact Effect - Top */}
            <motion.div
                className={`absolute top-0 left-0 right-0 h-32 pointer-events-none ${isDarkCarousel
                    ? 'bg-gradient-to-b from-white/20 to-transparent'
                    : 'bg-gradient-to-b from-black/10 to-transparent'
                    }`}
                style={{ zIndex: 100001 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: impactDirection === 'top' ? 1 : 0 }}
                transition={{ duration: 0.15 }}
            />

            {/* Impact Effect - Bottom */}
            <motion.div
                className={`absolute bottom-0 left-0 right-0 h-32 pointer-events-none ${isDarkCarousel
                    ? 'bg-gradient-to-t from-white/20 to-transparent'
                    : 'bg-gradient-to-t from-black/10 to-transparent'
                    }`}
                style={{ zIndex: 100001 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: impactDirection === 'bottom' ? 1 : 0 }}
                transition={{ duration: 0.15 }}
            />

            {/* Scroll/Drag Surface - uses framer-motion drag for reliable capture */}
            <motion.div
                className="absolute inset-0 cursor-grab active:cursor-grabbing"
                style={{
                    touchAction: "none",
                    zIndex: 99999,
                }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0}
                dragMomentum={false}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                onDragStart={(e) => {
                    e.stopPropagation();
                }}
                onPointerDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                }}
            />

            {/* Cards Container */}
            <div className="relative w-full h-full flex items-center justify-center pointer-events-none" style={{ zIndex: 1 }}>
                {cards.map((card, index) => (
                    <StackCard
                        key={card.id}
                        card={card}
                        index={index}
                        y={y}
                        isDarkCarousel={isDarkCarousel}
                        gap={GAP}
                        center={CENTER}
                    />
                ))}
            </div>

            {/* Floating Scrollbar */}
            <FloatingScrollbar
                dragY={dragY}
                totalCards={cards.length}
                onScrollChange={handleScrollChange}
                isDarkCarousel={isDarkCarousel}
                gap={GAP}
            />
        </div>
    );
}

function StackCard({ card, index, y, isDarkCarousel, gap, center }: {
    card: NotificationCard;
    index: number;
    y: any;
    isDarkCarousel: boolean;
    gap: number;
    center: number;
}) {
    // Use refs for stable transform calculations
    const configRef = useRef({ gap, center, index });
    configRef.current = { gap, center, index };

    const baseOffset = index * gap;

    // Single transform for raw position
    const rawPos = useTransform(y, (currentY: number) => {
        const { gap: g, index: i } = configRef.current;
        return (i * g) + currentY;
    });

    // Responsive thresholds
    const BUFFER = 200;
    const BOTTOM_CURVE_START = center - BUFFER;
    const TOP_CURVE_START = center + BUFFER;

    // Position with symmetric compression at both ends
    const posTransform = useTransform(rawPos, (val: number) => {
        const { center: c } = configRef.current;
        const bottom = c - 200;
        const top = c + 200;
        if (val < bottom) {
            const diff = bottom - val;
            return bottom - (diff * 0.12);
        } else if (val > top) {
            const diff = val - top;
            return top + (diff * 0.12);
        }
        return val;
    });

    // Scale - symmetric at both ends
    const scale = useTransform(rawPos, (val: number) => {
        const { center: c, gap: g } = configRef.current;
        const distFromCenter = Math.abs(val - c);
        const threshold = g * 0.6;
        if (distFromCenter < threshold) return 1;
        return Math.max(0.65, 1 - ((distFromCenter - threshold) * 0.002));
    });

    // RotateX - symmetric curve effect (wheel-like)
    const rotateX = useTransform(rawPos, (val: number) => {
        const { center: c } = configRef.current;
        const bottom = c - 200;
        const top = c + 200;
        if (val < bottom) {
            const depth = bottom - val;
            return Math.min(60, depth * 0.25);
        } else if (val > top) {
            const depth = val - top;
            return Math.max(-60, -depth * 0.25);
        }
        return 0;
    });

    // Opacity - fade at edges symmetrically
    const opacity = useTransform(rawPos, (val: number) => {
        if (val < -50) return Math.max(0.3, 1 + (val + 50) * 0.01);
        if (val > 650) return Math.max(0.3, 1 - (val - 650) * 0.01);
        return 1;
    });

    // Z-index - items closest to center are on top
    const zIndex = useTransform(rawPos, (val: number) => {
        const { center: c } = configRef.current;
        const distFromCenter = Math.abs(val - c);
        return Math.max(1, 1000 - Math.round(distFromCenter));
    });

    // Translate Y for vertical positioning
    const translateY = useTransform(posTransform, (val: number) => {
        const { center: c } = configRef.current;
        return c - val;
    });

    return (
        <motion.div
            style={{
                y: translateY,
                scale,
                opacity,
                zIndex,
                rotateX,
                transformPerspective: 1200,
                transformOrigin: "center center",
                position: "absolute",
                willChange: "transform, opacity",
            }}
            className="w-full flex justify-center pointer-events-none"
        >
            <div className={`
                w-[90vw] md:w-[98vw] max-w-[1000px] 
                h-[280px] md:h-[480px] 
                rounded-[20px] md:rounded-[30px] 
                overflow-hidden shadow-2xl
                relative group
                pointer-events-auto
                ${isDarkCarousel ? '' : 'ring-1 ring-black/10'}
            `}>
                {/* Image Background */}
                <div className={`absolute inset-0 ${isDarkCarousel ? 'bg-neutral-900' : 'bg-neutral-200'}`}>
                    <img
                        src={card.image}
                        alt={card.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        draggable={false}
                    />
                    <div className={`absolute inset-0 ${isDarkCarousel
                        ? 'bg-gradient-to-b from-transparent via-transparent to-black/80'
                        : 'bg-gradient-to-b from-transparent via-transparent to-white/90'
                        }`} />
                </div>

                {/* Content */}
                <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                    <div className="transform transition-transform duration-500 group-hover:translate-y-[-10px]">
                        <div className="flex items-center gap-4 mb-2 md:mb-4">
                            <div className={`h-[1px] w-8 md:w-12 ${isDarkCarousel ? 'bg-white/50' : 'bg-black/50'}`} />
                            <span className={`text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase ${isDarkCarousel ? 'text-white/70' : 'text-black/70'
                                }`}>
                                Collection 0{card.id}
                            </span>
                        </div>

                        <h3 className={`text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter mb-2 ${isDarkCarousel ? 'text-white' : 'text-black'
                            }`} style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                            {card.title}
                        </h3>

                        <div className={`overflow-hidden transition-all duration-500 max-h-0 opacity-0 group-hover:max-h-20 group-hover:opacity-100`}>
                            <p className={`text-lg font-light ${isDarkCarousel ? 'text-white/80' : 'text-black/80'
                                }`}>{card.description}</p>
                        </div>
                    </div>
                </div>

                {/* Shine effect - Subtle scanline */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 pointer-events-none"
                    style={{ background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 1px, black 1px, black 2px)' }}
                />
            </div>
        </motion.div>
    );
}

export default NotificationStack;
