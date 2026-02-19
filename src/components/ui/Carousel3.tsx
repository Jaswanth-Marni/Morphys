"use client";

import React, { useRef, useState, useEffect } from "react";
import {
    motion,
    useMotionValue,
    useTransform,
    MotionValue,
    animate
} from "framer-motion";

// Using the images found in public directory
const CAROUSEL_IMAGES = [
    "/carousel1.png",
    "/carousel2.jpg",
    "/carousel3.jpg",
    "/carousel4.jpg",
    "/carousel5.jpg",
    "/carousel6.jpg",
    "/carousel7.jpg",
    "/carousel8.jpg",
    "/24/chainsaw-man-the-5120x2880-23013.jpg",
    "/harri-p-L8p9qMMiCWs-unsplash.jpg",
    "/carousel1.png",
    "/carousel2.jpg",
    "/carousel3.jpg",
    "/carousel4.jpg",
    "/carousel5.jpg",
];

const ITEM_WIDTH = 150;
const SPACING = 160;

interface Carousel3Props {
    className?: string;
}

export default function Carousel3({ className = "" }: Carousel3Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(1000);

    // The global scroll position
    // We allow 'x' to grow infinitely to support momentum scrolling
    const x = useMotionValue(0);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setContainerWidth(window.innerWidth);
            const handleResize = () => setContainerWidth(window.innerWidth);
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, []);

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-[850px] flex items-center justify-center overflow-hidden ${className}`}
        >
            {/* Background removed as per reference */}

            {/* Draggable Surface - Static hit area with Pan handler */}
            <motion.div
                className="absolute inset-0 z-[60] cursor-grab active:cursor-grabbing touch-none select-none"
                onPanStart={() => {
                    x.stop();
                }}
                onPan={(_, info) => {
                    x.set(x.get() + info.delta.x);
                }}
                onPanEnd={(_, info) => {
                    // Apply momentum/inertia
                    // Using a decay animation to simulate friction
                    // The 'power' and 'timeConstant' allow tuning the feel
                    const velocity = info.velocity.x;
                    // We project a target or just let decay run
                    if (Math.abs(velocity) > 10) {
                        // animate(x, target) with type: "decay" isn't the standard signature for generic animate.
                        // Standard way for motion value inertia is:
                        x.set(x.get()); // ensure clean state
                        // "inertia" type is specific to dragging usually, manual use "decay"
                        animate(x, x.get() + velocity * 0.2, {
                            type: "decay",
                            velocity: velocity,
                            timeConstant: 200,
                            power: 0.8
                        });
                    }
                }}
            >
                {/* Invisible touch surface */}
            </motion.div>

            {/* 
         Curved Carousel Implementation
      */}
            <div className="relative w-full h-full flex items-center justify-center perspective-1000">
                {CAROUSEL_IMAGES.map((src, i) => (
                    <CarouselItem
                        key={i}
                        index={i}
                        x={x}
                        totalItems={CAROUSEL_IMAGES.length}
                        containerWidth={containerWidth}
                        src={src}
                    />
                ))}
            </div>
        </div>
    );
}

function CarouselItem({
    index,
    x,
    totalItems,
    containerWidth,
    src
}: {
    index: number,
    x: MotionValue<number>,
    totalItems: number,
    containerWidth: number,
    src: string
}) {
    const itemTotalWidth = totalItems * SPACING;

    const position = useTransform(x, (currentX) => {
        const rawPos = (index * SPACING) + currentX;
        const wrappedPos = ((rawPos % itemTotalWidth) + itemTotalWidth) % itemTotalWidth;
        // Center the range
        const centeredPos = wrappedPos - itemTotalWidth / 2;
        return centeredPos;
    });

    // Calculate visual properties based on distance from center
    // Only 9 cards visible (approx +/- 400px from center based on 100px spacing)
    // Scale steps: 0->100%, 1->85%, 2->65%, 3->50%, 4->40%
    const scaleInput = [-640, -480, -320, -160, 0, 160, 320, 480, 640];
    const scaleOutput = [0.4, 0.5, 0.65, 0.85, 1, 0.85, 0.65, 0.5, 0.4];

    // Base max size (Center card)
    const MAX_WIDTH = ITEM_WIDTH * 2.3;
    const MAX_HEIGHT = ITEM_WIDTH * 3.2;

    const width = useTransform(position, scaleInput, scaleOutput.map(s => MAX_WIDTH * s));
    const height = useTransform(position, scaleInput, scaleOutput.map(s => MAX_HEIGHT * s));

    // Opacity: Hide items beyond the 9th card (approx 450px)
    const activeRange = SPACING * 4.5;
    const opacity = useTransform(position,
        [-activeRange, -activeRange * 0.75, 0, activeRange * 0.75, activeRange],
        [0, 1, 1, 1, 0]
    );

    const zIndex = useTransform(position, (pos) => {
        return 50 - Math.abs(Math.round(pos / 10));
    });

    // Arch Curve - Precise mapping to match scale steps
    // Previous curve approx values: 0->-10, 1->10, 2->70, 3->170, 4->310
    // Added 10px cumulative drop: 0->-10, 1->20, 2->90, 3->200, 4->350
    // Moved up by 5px: 0->-15, 1->15, 2->85, 3->195, 4->345
    const yOutput = [345, 195, 85, 15, -15, 15, 85, 195, 345];
    const y = useTransform(position, scaleInput, yOutput);

    return (
        <motion.div
            style={{
                x: position,
                y: y,
                zIndex,
                width,
                height,
                opacity,
            }}
            className="absolute overflow-hidden shadow-2xl bg-gray-900"
        >
            <img
                src={src}
                alt="Carousel Item"
                className="w-full h-full object-cover pointer-events-none"
            />
            {/* Glossy Overlay/Reflection */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/50 pointer-events-none" />
        </motion.div>
    );
}
