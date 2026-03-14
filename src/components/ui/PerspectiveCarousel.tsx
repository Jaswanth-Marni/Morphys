import React, { useRef, useCallback, useEffect, memo } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

interface PerspectiveCarouselConfig {
    xSpacing?: number;
    ySpacing?: number;
    zDepth?: number;
    rotateY?: number;
    rotateX?: number;
    scale?: number;
    perspective?: number;
    carouselRotation?: number;
}

interface PerspectiveCarouselProps {
    config?: PerspectiveCarouselConfig;
    interactive?: boolean;
}
const CARDS = [
    { id: 1, title: 'CAROUSEL 1', category: 'CONCEPT', img: '/carousel1.png' },
    { id: 2, title: 'CAROUSEL 2', category: 'LIFESTYLE', img: '/carousel2.jpg' },
    { id: 3, title: 'CAROUSEL 3', category: 'DESIGN', img: '/carousel3.jpg' },
    { id: 4, title: 'CAROUSEL 4', category: 'PHOTOGRAPHY', img: '/carousel4.jpg' },
    { id: 5, title: 'CAROUSEL 5', category: 'ARCHIVE', img: '/carousel5.jpg' },
    { id: 6, title: 'CAROUSEL 6', category: 'STUDIO', img: '/carousel6.jpg' },
    { id: 7, title: 'CAROUSEL 7', category: 'FASHION', img: '/carousel7.jpg' },
    { id: 8, title: 'CAROUSEL 8', category: 'EDITORIAL', img: '/carousel8.jpg' },
];

const TOTAL_CARDS = CARDS.length;

// Reduced from 23 to 11 visible slots — only cards that can actually be seen
const VISIBLE_SLOTS = 11;
const HALF_SLOTS = Math.floor(VISIBLE_SLOTS / 2);

// Individual card rendered via rAF-driven style updates (bypasses React rendering entirely)
const CarouselCard = memo(({ slot, smoothScrollPos, xSpacing, ySpacing, zDepth, cfgRotateY, cfgRotateX, cfgScale }: {
    slot: number;
    smoothScrollPos: any;
    xSpacing: number;
    ySpacing: number;
    zDepth: number;
    cfgRotateY: number;
    cfgRotateX: number;
    cfgScale: number;
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const categoryRef = useRef<HTMLSpanElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const lastCardIndexRef = useRef(-1);

    // Shared function to apply transform + update card content for a given scroll position
    const applyTransform = useCallback((latestScroll: number) => {
        const el = cardRef.current;
        if (!el) return;

        const centerIndex = Math.round(latestScroll);
        const fractional = latestScroll - centerIndex;
        const offset = slot - fractional;
        const absOffset = Math.abs(offset);

        // Transform
        const translateX = offset * xSpacing;
        const translateY = offset * ySpacing;
        const translateZ = offset * zDepth;
        const rotateX = absOffset * (cfgRotateX / 10);
        const scale = cfgScale / 100;

        el.style.transform = `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateY(${cfgRotateY}deg) rotateX(${rotateX}deg) scale(${scale})`;
        el.style.zIndex = String(20 - Math.round(absOffset));

        // Update card content only when the card index actually changes
        const newIndex = ((centerIndex + slot) % TOTAL_CARDS + TOTAL_CARDS) % TOTAL_CARDS;
        if (newIndex !== lastCardIndexRef.current) {
            lastCardIndexRef.current = newIndex;
            const card = CARDS[newIndex];
            if (card && imgRef.current) {
                imgRef.current.src = card.img;
                imgRef.current.alt = card.title;
            }
            if (card && categoryRef.current) {
                categoryRef.current.textContent = card.category;
            }
            if (card && titleRef.current) {
                titleRef.current.textContent = card.title;
            }
        }
    }, [slot, xSpacing, ySpacing, zDepth, cfgRotateY, cfgRotateX, cfgScale]);

    // Apply initial transform on mount so cards are positioned before any scroll
    useEffect(() => {
        applyTransform(smoothScrollPos.get());
    }, [applyTransform, smoothScrollPos]);

    // Drive ongoing updates from motion value subscription — zero React re-renders
    useEffect(() => {
        const unsubscribe = smoothScrollPos.on("change", applyTransform);
        return () => unsubscribe();
    }, [smoothScrollPos, applyTransform]);

    // Compute initial card index
    const initialIndex = ((slot) % TOTAL_CARDS + TOTAL_CARDS) % TOTAL_CARDS;
    const initialCard = CARDS[initialIndex] || CARDS[0];

    return (
        <div
            ref={cardRef}
            className="absolute w-[360px] h-[500px] bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.2)] group overflow-hidden pointer-events-auto border border-black/5"
            style={{
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'visible',
                willChange: 'transform',
                contain: 'layout style paint',
            }}
        >
            <div className="relative w-full h-full bg-gray-200">
                <img
                    ref={imgRef}
                    src={initialCard.img}
                    alt={initialCard.title}
                    className="w-full h-full object-cover"
                    style={{ opacity: 0.96 }}
                    loading="lazy"
                    decoding="async"
                />

                {/* Branding Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-10 text-white">
                    <span ref={categoryRef} className="text-[9px] tracking-[0.5em] uppercase mb-2 font-semibold text-white/80">{initialCard.category}</span>
                    <h2 ref={titleRef} className="text-2xl font-light tracking-tighter leading-none">{initialCard.title}</h2>
                    <div className="mt-6 w-0 h-[1px] bg-white/30 group-hover:w-full transition-all duration-1000 ease-in-out"></div>
                </div>
            </div>
        </div>
    );
});
CarouselCard.displayName = 'CarouselCard';

const PerspectiveCarousel = ({ config = {}, interactive = true }: PerspectiveCarouselProps) => {
    const xSpacing = config.xSpacing ?? 100;
    const ySpacing = config.ySpacing ?? 2;
    const zDepth = config.zDepth ?? -25;
    const cfgRotateY = config.rotateY ?? 130;
    const cfgRotateX = config.rotateX ?? 0;
    const cfgScale = config.scale ?? 75;
    const cfgPerspective = config.perspective ?? 4000;
    const carouselRotation = config.carouselRotation ?? 0;

    const containerRef = useRef<HTMLDivElement>(null);

    // High-performance motion values
    const scrollPos = useMotionValue(0);
    const smoothScrollPos = useSpring(scrollPos, { damping: 30, stiffness: 200, mass: 1 });

    // Scoped wheel handler — only active when carousel is in view
    useEffect(() => {
        if (!interactive) return;

        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            // Prevent the page from scrolling when interacting with the carousel
            e.preventDefault();
            e.stopPropagation();

            const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
            scrollPos.set(scrollPos.get() + delta * 0.005);
        };

        // Use non-passive to allow preventDefault
        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, [scrollPos, interactive]);

    const handleDrag = useCallback((e: any, info: any) => {
        if (!interactive) return;
        scrollPos.set(scrollPos.get() - info.delta.x * 0.015);
    }, [scrollPos, interactive]);

    // Fixed viewing angle
    const containerTransform = `rotateX(-28deg) rotateY(-144.8deg) rotateZ(${carouselRotation}deg)`;

    // Pre-compute slot array once
    const slots = React.useMemo(() =>
        Array.from({ length: VISIBLE_SLOTS }, (_, i) => i - HALF_SLOTS),
    []);

    return (
        <motion.div
            ref={containerRef}
            className={`relative w-full h-full min-h-[600px] bg-transparent text-gray-900 font-sans overflow-hidden select-none flex flex-col ${interactive ? 'cursor-grab active:cursor-grabbing' : ''}`}
            style={{ clipPath: 'inset(0)', contain: 'layout style paint' }}
            drag={interactive ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDrag={handleDrag}
            whileDrag={interactive ? { cursor: 'grabbing' } : undefined}
        >
            {/* --- CAROUSEL --- */}
            <main className="flex-1 relative flex items-center justify-center overflow-hidden" style={{ perspective: `${cfgPerspective}px` }}>
                <div
                    className="relative w-full h-full flex items-center justify-center pointer-events-none"
                    style={{
                        transformStyle: 'preserve-3d',
                        transform: containerTransform,
                    }}
                >
                    {slots.map((slot) => (
                        <CarouselCard
                            key={`slot-${slot}`}
                            slot={slot}
                            smoothScrollPos={smoothScrollPos}
                            xSpacing={xSpacing}
                            ySpacing={ySpacing}
                            zDepth={zDepth}
                            cfgRotateY={cfgRotateY}
                            cfgRotateX={cfgRotateX}
                            cfgScale={cfgScale}
                        />
                    ))}
                </div>
            </main>

        </motion.div>
    );
};

export default PerspectiveCarousel;
