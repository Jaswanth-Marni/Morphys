"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
    motion,
    useMotionValue,
    useSpring,
    useTransform,
    PanInfo,
    useAnimationFrame,
} from "framer-motion";
import { uiStyles } from "@/data/styles";

interface DiagonalFocusProps {
    className?: string;
}

const cards = uiStyles;
const CARD_COUNT = cards.length;

// Preview Component
export function DiagonalFocusPreview() {
    const angle = 35 * (Math.PI / 180);
    // Scale down constants
    const cardWidth = 50;
    const cardHeight = 70;
    const gap = 10;
    const step = cardWidth + gap;

    return (
        <div className="w-full h-full bg-zinc-950 relative overflow-hidden flex items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center">
                {[-2, -1, 0, 1, 2].map((i) => {
                    const index = i + 3; // Shift to start from a valid index
                    const styleItem = uiStyles[index % uiStyles.length];

                    const grayscale = i === 0 ? "0%" : "100%";
                    const blur = i === 0 ? "0px" : "2px";
                    const scale = i === 0 ? 1.2 : 0.85;
                    const opacity = Math.abs(i) >= 2 ? 0.3 : 1; // Fade clear ends
                    const zIndex = 10 - Math.abs(i);

                    const x = i * step * Math.cos(angle);
                    const y = i * step * Math.sin(angle);

                    return (
                        <div
                            key={i}
                            className="absolute rounded-lg overflow-hidden shadow-xl border border-white/10"
                            style={{
                                width: cardWidth,
                                height: cardHeight,
                                transform: `translate(${x}px, ${y}px) scale(${scale})`,
                                filter: `grayscale(${grayscale}) blur(${blur})`,
                                zIndex,
                                opacity,
                                backgroundColor: styleItem?.accentColor || '#333',
                                backgroundImage: styleItem?.image ? `url(${styleItem.image})` : undefined,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
}

export function DiagonalFocus({ className = "" }: DiagonalFocusProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    const ANGLE = 35;
    const ANGLE_RAD = (ANGLE * Math.PI) / 180;

    // Use a simple linear motion value (no spring for the base to avoid overshoots)
    const scrollX = useMotionValue(0);
    // Apply smoothing only for rendering
    const smoothScrollX = useSpring(scrollX, { stiffness: 200, damping: 40, mass: 0.5 });

    const AUTO_SCROLL_SPEED = 4.0;

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return undefined;

        const resizeObserver = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (entry) {
                setContainerSize({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height
                });
            }
        });
        resizeObserver.observe(container);
        return () => resizeObserver.disconnect();
    }, []);

    const getCardDimensions = () => {
        const minDim = Math.min(containerSize.width || 800, containerSize.height || 600);
        const cardWidth = Math.max(140, Math.min(320, minDim * 0.45));
        const cardHeight = cardWidth * 1.4;
        const gap = 20; // Gap between cards
        const step = cardWidth + gap; // Side by side spacing
        return { cardWidth, cardHeight, step };
    };

    const { cardWidth, cardHeight, step } = getCardDimensions();
    const cycleWidth = CARD_COUNT * step;

    // Render many cycles - enough for "infinite" practical use
    // 50 cycles = 400 cards, would take ~10 minutes of auto-scroll to traverse
    const CYCLES = 50;
    const START_CYCLE = 25; // Start in the middle

    const allCards = useMemo(() => {
        const result = [];
        for (let cycle = 0; cycle < CYCLES; cycle++) {
            for (let i = 0; i < CARD_COUNT; i++) {
                result.push({
                    ...cards[i],
                    instanceId: `${cycle}-${i}`,
                    absoluteIndex: cycle * CARD_COUNT + i,
                });
            }
        }
        return result;
    }, []);

    // Initialize scroll position
    const [initialized, setInitialized] = useState(false);
    useEffect(() => {
        if (step > 0 && !initialized) {
            const initialScroll = START_CYCLE * cycleWidth;
            scrollX.set(initialScroll);
            smoothScrollX.set(initialScroll);
            setInitialized(true);
        }
    }, [step, initialized, cycleWidth, scrollX, smoothScrollX]);

    // Auto scroll - continuously
    useAnimationFrame(() => {
        if (isDragging || isHovering || step === 0 || !initialized) return;
        scrollX.set(scrollX.get() + AUTO_SCROLL_SPEED);
    });

    const handleDragStart = () => setIsDragging(true);

    const handleDragEnd = (_: any, info: PanInfo) => {
        setIsDragging(false);
        // Add momentum
        scrollX.set(scrollX.get() - info.velocity.x * 0.3);
    };

    const handleDrag = (_: any, info: PanInfo) => {
        scrollX.set(scrollX.get() - info.delta.x);
    };

    const handleCardClick = (absoluteIndex: number) => {
        if (isDragging) return;
        const targetScroll = absoluteIndex * step;
        scrollX.set(targetScroll);
    };

    return (
        <div
            ref={containerRef}
            className={`w-full h-full flex items-center justify-center relative overflow-hidden ${className}`}
            style={{ perspective: 1000 }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <motion.div
                className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0}
                onDrag={handleDrag}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                style={{ touchAction: "none" }}
            />

            <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
                {containerSize.width > 0 && initialized && allCards.map((card) => (
                    <Card
                        key={card.instanceId}
                        item={card}
                        absoluteIndex={card.absoluteIndex}
                        smoothScrollX={smoothScrollX}
                        angle={ANGLE_RAD}
                        onSelect={() => handleCardClick(card.absoluteIndex)}
                        cardWidth={cardWidth}
                        cardHeight={cardHeight}
                        step={step}
                    />
                ))}
            </div>
        </div>
    );
}

interface CardProps {
    item: typeof cards[0];
    absoluteIndex: number;
    smoothScrollX: ReturnType<typeof useSpring>;
    angle: number;
    onSelect: () => void;
    cardWidth: number;
    cardHeight: number;
    step: number;
}

const Card = ({
    item,
    absoluteIndex,
    smoothScrollX,
    angle,
    onSelect,
    cardWidth,
    cardHeight,
    step,
}: CardProps) => {
    const basePosition = absoluteIndex * step;
    const position = useTransform(smoothScrollX, (scroll: number) => basePosition - scroll);
    const distanceFromCenter = useTransform(position, (pos: number) => Math.abs(pos));

    // Visual Effects
    const grayscale = useTransform(distanceFromCenter, [0, step * 0.8], ["0%", "100%"]);
    const blur = useTransform(distanceFromCenter, [0, step * 1.5], ["0px", "5px"]);
    const scale = useTransform(distanceFromCenter, [0, step], [1.15, 0.85]);
    // Fade cards that are far away (optimization + nice effect)
    const opacity = useTransform(distanceFromCenter, [step * 5, step * 8], [1, 0]);
    const zIndex = useTransform(distanceFromCenter, (d) => Math.round(1000 - d));

    // Diagonal coordinates
    const xPos = useTransform(position, (pos: number) => pos * Math.cos(angle));
    const yPos = useTransform(position, (pos: number) => pos * Math.sin(angle));

    const filterValue = useTransform(
        [grayscale, blur],
        ([g, b]) => `grayscale(${g}) blur(${b})`
    );

    return (
        <motion.div
            className="absolute rounded-2xl overflow-hidden shadow-2xl cursor-pointer pointer-events-auto bg-black"
            style={{
                width: cardWidth,
                height: cardHeight,
                x: xPos,
                y: yPos,
                scale,
                zIndex,
                opacity,
                filter: filterValue,
                willChange: 'transform, filter, opacity',
            }}
            onClick={onSelect}
            whileHover={{ scale: 1.2, transition: { duration: 0.2 } }}
        >
            <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
                draggable={false}
            />
        </motion.div>
    );
};

export default DiagonalFocus;
