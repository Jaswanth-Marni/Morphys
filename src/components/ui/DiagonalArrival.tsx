"use client";

import React, { useRef, useEffect } from "react";
import {
    motion,
    useSpring,
    useTransform,
    useMotionValue,
    MotionValue,
} from "framer-motion";

interface CardProps {
    id: number;
    image: string;
}

const cards: CardProps[] = [
    { id: 1, image: "/24/chainsaw-man-the-5120x2880-23013.jpg" },
    { id: 2, image: "/24/dandadan.jpg" },
    { id: 3, image: "/24/demon-slayer-3840x2160-23615.jpg" },
    { id: 4, image: "/24/gachiakuta-season-1-1440x2560-23000.jpg" },
    { id: 5, image: "/24/jujutsu kaisen.jpg" },
    { id: 6, image: "/24/kaiju-no-8-video-1440x2560-20422.jpg" },
    { id: 7, image: "/24/onepiece.jpg" },
    { id: 8, image: "/24/solo leveling.jpg" },
    { id: 9, image: "/24/spyxfamily.jpg" },
    { id: 10, image: "/24/taro-sakamoto-1440x2560-23904.jpg" },
    { id: 11, image: "/24/to-be-hero-x-5k-1440x2560-22857.png" },
];

const CARD_WIDTH = 260;
const CARD_HEIGHT = 364;
const GAP = 20;
const ANGLE_DEG = 15; // Moderate diagonal angle

const DiagonalArrival = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollY = useMotionValue(0);
    // Smooth spring for the scrolling action
    const smoothY = useSpring(scrollY, {
        damping: 40,
        stiffness: 200,
        mass: 1,
    });

    // Handle wheel event
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            // Scroll direction: scrolling down (positive delta) moves content up (negative Y)
            // We subtract deltaY to simulate natural scroll
            scrollY.set(scrollY.get() - e.deltaY);
        };

        container.addEventListener("wheel", handleWheel, { passive: false });
        // Clean up
        return () => container.removeEventListener("wheel", handleWheel);
    }, [scrollY]);

    // Total height of the loop
    const totalHeight = cards.length * (CARD_HEIGHT + GAP);

    // Calculate columns with random directions
    const COLUMN_GAP = 20;
    const colWidth = CARD_WIDTH + COLUMN_GAP;

    // Define specific directions: Odd and even columns move in opposite directions
    // Index -3 (0): Down (1), Index -2 (1): Up (-1), ...
    const columns = [
        { xOffset: -3 * colWidth, direction: 1, yOffset: 120 },
        { xOffset: -2 * colWidth, direction: -1, yOffset: -50 },
        { xOffset: -1 * colWidth, direction: 1, yOffset: 200 },
        { xOffset: 0, direction: -1, yOffset: 0 },
        { xOffset: 1 * colWidth, direction: 1, yOffset: 150 },
        { xOffset: 2 * colWidth, direction: -1, yOffset: -100 },
        { xOffset: 3 * colWidth, direction: 1, yOffset: 80 },
    ];

    return (
        <motion.div
            ref={containerRef}
            className="relative w-full h-full overflow-hidden bg-black flex items-center justify-center cursor-grab active:cursor-grabbing"
            onPan={(e, info) => {
                scrollY.set(scrollY.get() + info.delta.y);
            }}
        >
            <div className="absolute inset-0 bg-neutral-950" />

            {/* 3D perspective container */}
            <div
                className="relative w-full h-full flex items-center justify-center preserve-3d"
                style={{ transform: `rotate(-${ANGLE_DEG}deg)` }}
            >
                {/* Render multiple columns with entrance animation */}
                {columns.map((col, colIndex) => {
                    // Shift cards for each column to avoid matching images
                    // Deterministic shift based on column index (2 steps per column)
                    const shift = (colIndex * 2) % cards.length;
                    const columnCards = [...cards.slice(shift), ...cards.slice(0, shift)];

                    // Entrance animation:
                    // If direction is 1 (moves down), arrival should be from top (-Y).
                    // If direction is -1 (moves up), arrival should be from bottom (+Y).
                    // We'll use a large offset for the entrance.
                    const initialY = col.direction === 1 ? -800 : 800;

                    return (
                        <motion.div
                            key={colIndex}
                            initial={{ y: initialY, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{
                                duration: 1.5,
                                ease: [0.16, 1, 0.3, 1], // Smooth easeOutExpo-ish curve
                                delay: colIndex * 0.1, // Stagger effect
                            }}
                            className="absolute inset-0 pointer-events-none" // Ensure wrapper doesn't capture clicks, pass through to cards if needed, though cards are absolute too.
                        >
                            {columnCards.map((card, index) => (
                                <Card
                                    key={`${colIndex}-${card.id}`}
                                    card={card}
                                    index={index}
                                    scrollY={smoothY}
                                    totalHeight={totalHeight}
                                    xOffset={col.xOffset}
                                    direction={col.direction}
                                    yOffset={col.yOffset}
                                />
                            ))}
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
};

const Card = ({
    card,
    index,
    scrollY,
    totalHeight,
    xOffset,
    direction = 1,
    yOffset = 0,
}: {
    card: CardProps;
    index: number;
    scrollY: MotionValue<number>;
    totalHeight: number;
    xOffset: number;
    direction?: number;
    yOffset?: number;
}) => {
    const y = useTransform(scrollY, (latest) => {
        // Initial position based on index, centered
        const itemPos = index * (CARD_HEIGHT + GAP);

        // Adjust by scroll with direction multiplier + random Y offset
        const offset = (latest * direction) + itemPos + yOffset;

        // Wrap logic:
        // We want the result to be in [-Total/2, Total/2] range roughly
        // Or just [0, Total] and then center it.

        // Standard modulo for infinite positive/negative
        const wrapped = ((offset % totalHeight) + totalHeight) % totalHeight;

        // Center it: [0, totalHeight] -> [-totalHeight/2, totalHeight/2]
        // This makes the transition happen when the item is totalHeight/2 away from center.
        // If totalHeight/2 is larger than screen half-height, the jump is invisible.
        return wrapped - totalHeight / 2;
    });

    return (
        <motion.div
            style={{
                y,
                x: xOffset,
                // Since the parent container is rotated, just moving Y moves it diagonally in screen space.
                // But we want the card to be upright.
                // So we rotate the card back by ANGLE_DEG.
                rotate: ANGLE_DEG,
            }}
            className="absolute left-1/2 top-1/2 -ml-[130px] -mt-[182px] w-[260px] h-[364px] overflow-hidden shadow-2xl border border-white/10 bg-neutral-900"
        >
            <img
                src={card.image}
                alt=""
                className="w-full h-full object-cover pointer-events-none select-none"
                loading="eager"
            />
        </motion.div>
    );
};

export default DiagonalArrival;
