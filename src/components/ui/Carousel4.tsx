"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from "framer-motion";

interface CarouselItemData {
    id: number;
    name: string;
    image: string;
}

const items: CarouselItemData[] = [
    {
        id: 1,
        name: "Chainsaw Man",
        image: "/desktop/chainsaw-man-the-5120x2880-23013.jpg"
    },
    {
        id: 2,
        name: "Dandadan",
        image: "/desktop/dandadan-evil-eye-5120x2880-22717.jpg"
    },
    {
        id: 3,
        name: "Demon Slayer",
        image: "/desktop/demon-slayer-3840x2160-23615.jpg"
    },
    {
        id: 4,
        name: "Gachiakuta",
        image: "/desktop/gachiakuta-3840x2160-22842.jpg"
    },
    {
        id: 5,
        name: "Jujutsu Kaisen",
        image: "/desktop/jujutsu-kaisen-3840x2160-19746.jpg"
    },
    {
        id: 6,
        name: "Kaiju No. 8",
        image: "/desktop/kaiju-no-8-mission-7680x4320-21963.jpg"
    },
    {
        id: 7,
        name: "One Piece",
        image: "/desktop/one-piece-season-15-3840x2160-22064.jpg"
    },
    {
        id: 8,
        name: "Sakamoto Days",
        image: "/desktop/sakamoto-days-5120x2880-23913.jpg"
    },
    {
        id: 9,
        name: "Solo Leveling",
        image: "/desktop/solo-leveling-3840x2160-20374.png"
    },
    {
        id: 10,
        name: "Spy x Family",
        image: "/desktop/spy-x-family-season-5120x2880-24443.png"
    },
];

const CARD_WIDTH = 480; // Landscape width
const CARD_HEIGHT = 270; // 16:9 Aspect Ratio
const SPACING = 550; // Increased spacing to prevent overlap (480px width + 70px gap)

export default function Carousel4() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(1200);

    // Global scroll value
    const scrollX = useMotionValue(0);
    const smoothScrollX = useSpring(scrollX, {
        damping: 40,
        stiffness: 200,
        mass: 1
    });

    const [activeIndex, setActiveIndex] = useState(0);

    // Track width
    useEffect(() => {
        if (typeof window === "undefined") return;
        const handleResize = () => {
            if (containerRef.current) {
                setWidth(containerRef.current.clientWidth);
            }
        };
        handleResize(); // Initial
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const dropPoint = width * 0.55; // Moved slightly left to give more fall space

    // Update active index
    useEffect(() => {
        const unsubscribe = smoothScrollX.on("change", (v) => {
            // v relates to offset.
            // Items move left.
            // index closest to dropPoint.
            const index = Math.round(-v / SPACING);
            const wrappedIndex = ((index % items.length) + items.length) % items.length;
            setActiveIndex(wrappedIndex);
        });
        return unsubscribe;
    }, [smoothScrollX, width]);

    const handleDrag = (_: any, info: any) => {
        scrollX.set(scrollX.get() + info.delta.x);
    };

    // Wheel Scroll Support
    const handleWheel = (e: React.WheelEvent) => {
        // Scroll down (positive) -> Move left (negative scrollX interaction)
        // Adjust multiplier for sensitivity
        scrollX.set(scrollX.get() - e.deltaY * 0.8);
    };

    return (
        <div
            ref={containerRef}
            className="w-full h-[850px] relative overflow-hidden flex items-center select-none"
            onWheel={handleWheel} // Attach wheel listener
        >
            {/* Title Display (Left) */}
            <div className="absolute left-0 top-0 w-[50%] h-full z-10 pointer-events-none flex flex-col justify-center pl-20">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                        className="flex flex-col items-start leading-none"
                    >
                        {/* ID Number */}
                        <h1 className="text-[clamp(6.0rem,12cqi,18.0rem)] font-schabo text-foreground tracking-[1px] leading-[0.8] mb-6">
                            {String(items[activeIndex].id).padStart(2, '0')}
                        </h1>

                        {/* Text Container - Name */}
                        <div className="flex flex-wrap w-full gap-x-6 gap-y-6">
                            {items[activeIndex].name.split(" ").map((word, i) => (
                                <h1
                                    key={i}
                                    className="text-[clamp(6.0rem,12cqi,18.0rem)] font-schabo text-foreground tracking-[1px] uppercase leading-[0.75]"
                                >
                                    {word}
                                </h1>
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Carousel Items */}
            {items.map((item, index) => (
                <WaterfallItem
                    key={item.id}
                    index={index}
                    item={item}
                    scrollX={smoothScrollX}
                    dropPoint={dropPoint}
                    totalItems={items.length}
                />
            ))}

            <motion.div
                className="absolute inset-0 z-50 cursor-grab active:cursor-grabbing"
                onPan={handleDrag}
            />
        </div>
    );
}

function WaterfallItem({
    index,
    item,
    scrollX,
    dropPoint,
    totalItems
}: {
    index: number;
    item: CarouselItemData;
    scrollX: any;
    dropPoint: number;
    totalItems: number;
}) {
    // Total width of the loop
    const totalWidth = totalItems * SPACING;

    // Note: older commented-out 'x' and 'y' logic removed for clarity.

    // Derived transform
    const realX = useTransform(scrollX, (value: any) => {
        // Offset by SPACING ensures Item 0 is at dropPoint when value=0
        const base = (index * SPACING) + value + SPACING;
        const modulo = (base % totalWidth + totalWidth) % totalWidth;

        // Subtract SPACING to create the 'falling' zone window
        // Range effectively: [-SPACING, TotalWidth - SPACING]
        return dropPoint + modulo - SPACING;
    });

    const x = useTransform(realX, (val) => val);

    const y = useTransform(realX, (val) => {
        if (val < dropPoint) {
            const dist = dropPoint - val;
            return Math.pow(dist, 1.5) * 0.5;
        }
        return 0;
    });

    const scale = useTransform(realX, (val) => {
        if (val < dropPoint) {
            const dist = dropPoint - val;
            return Math.max(0, 1 - (dist * 0.002));
        }
        return 1;
    });

    const rotateZ = useTransform(realX, (val) => {
        if (val < dropPoint) {
            const dist = dropPoint - val;
            return dist * -0.05; // Reduced rotation speed
        }
        return 0;
    });

    const rotateY = useTransform(realX, (val) => {
        // Twist as it falls - Smooth interpolation
        if (val < dropPoint) {
            const dist = dropPoint - val;
            // Smoothly rotate up to 45 degrees over 300px
            return Math.min(45, dist * 0.15);
        }
        return 0;
    });

    const opacity = useTransform(realX, (val) => {
        if (val < dropPoint) {
            const dist = dropPoint - val;
            return Math.max(0, 1 - (dist * 0.004));
        }
        // Fade in from right
        if (val > dropPoint + 800) {
            return Math.max(0, 1 - (val - (dropPoint + 800)) * 0.005);
        }
        return 1;
    });

    const zIndex = useTransform(realX, (val) => {
        return Math.floor(val);
    });

    return (
        <motion.div
            style={{
                x,
                y,
                scale,
                opacity,
                zIndex,
                rotateZ,
                perspective: 1000,
                originX: 0.5,
                originY: 0.5 // Changed to center for better rotation feel
            }}
            // Centered vertically (-mt-[half height])
            className="absolute top-1/2 left-0 -mt-[135px] w-[480px] h-[270px]"
        >
            <motion.div
                style={{
                    rotateY
                }}
                className="w-full h-full relative overflow-hidden shadow-2xl"
            >
                <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover pointer-events-none select-none"
                    draggable={false}
                />
                {/* Lighting overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-white/10 opacity-60" />
            </motion.div>
        </motion.div>
    );
}
