export const componentsData = [
    {
        id: "elastic-scroll",
        name: "Elastic Scroll",
        description: "A scrollable list with elastic physics effects.",
        fullCode: `"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useVelocity,
  useAnimationFrame,
} from "framer-motion";

const items = [
  { id: 1, text: "Ethereal" },
  { id: 2, text: "Luminous" },
  { id: 3, text: "Nebula" },
  { id: 4, text: "Astral" },
  { id: 5, text: "Zenith" },
  { id: 6, text: "Eclipse" },
  { id: 7, text: "Horizon" },
  { id: 8, text: "Mirage" },
  { id: 9, text: "Orbit" },
  { id: 10, text: "Velvet" },
];

const ElasticScroll = () => {
    return (
        <div className="h-full w-full bg-neutral-900 overflow-hidden relative flex flex-col">
            <div className="flex-1 overflow-y-scroll overflow-x-hidden relative perspective-1000">
                <div className="min-h-[150vh] flex flex-col items-center justify-center gap-12 py-20">
                     {items.map((item) => (
                        <div key={item.id} className="text-6xl font-bold text-white/20 hover:text-white transition-colors duration-300 cursor-pointer">
                            {item.text}
                        </div>
                     ))}
                </div>
            </div>
        </div>
    )
}

export default ElasticScroll;`,
    },
    {
        id: "diagonal-arrival",
        name: "Diagonal Arrival",
        description: "A draggable, multi-column diagonal carousel with infinite scrolling and smooth entrance animations. Features randomized scroll directions and staggered layouts for a dynamic visual effect.",
        fullCode: `"use client";

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
                style={{ transform: \`rotate(-\${ANGLE_DEG}deg)\` }}
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
                                    key={\`\${colIndex}-\${card.id}\`}
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

export default DiagonalArrival;`,
    },
    {
        id: "carousel",
        name: "Carousel",
        description: "A full-screen carousel with smooth transitions and centered controls.",
        fullCode: `"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import gsap from "gsap";

interface CarouselItem {
    id: number;
    name: string;
    image: string;
}

const items: CarouselItem[] = [
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
    {
        id: 11,
        name: "To Be Hero X",
        image: "/desktop/to-be-hero-x-anime-3840x2160-22645.jpg"
    }
];

export function Carousel() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const prevBtnRef = React.useRef<HTMLButtonElement>(null);
    const nextBtnRef = React.useRef<HTMLButtonElement>(null);

    const handleNext = useCallback(() => {
        if (nextBtnRef.current) {
            gsap.fromTo(nextBtnRef.current,
                { scale: 0.9 },
                { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.3)" }
            );
        }
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % items.length);
    }, []);

    const handlePrev = useCallback(() => {
        if (prevBtnRef.current) {
            gsap.fromTo(prevBtnRef.current,
                { scale: 0.9 },
                { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.3)" }
            );
        }
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") handleNext();
            if (e.key === "ArrowLeft") handlePrev();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleNext, handlePrev]);

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? "100%" : "-100%", // Start completely off-screen
            zIndex: 1, // Always on top
        }),
        center: {
            x: 0,
            zIndex: 1,
            transition: {
                x: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }, // Smooth elegant ease
            }
        },
        exit: (direction: number) => ({
            x: direction < 0 ? "40%" : "-40%", // More noticeable parallax
            zIndex: 0, // Drop behind
            transition: {
                x: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
            }
        })
    };
    return (
        <div className="relative w-full h-full overflow-hidden bg-black">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                    key={currentIndex}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0 w-full h-full"
                >
                    <img
                        src={items[currentIndex].image}
                        alt={items[currentIndex].name}
                        className="w-full h-full object-cover"
                    />
                    {/* Dark overlay for better text visibility if needed, keeps it subtle */}
                    <div className="absolute inset-0 bg-black/10" />
                </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center">
                
                {/* Prev Button */}
                <motion.button
                    ref={prevBtnRef}
                    onClick={handlePrev}
                    initial={{ width: 0, opacity: 0, scale: 0.5 }}
                    animate={{ width: 56, opacity: 1, scale: 1 }}
                    transition={{ delay: 2.0, duration: 0.5, type: "spring", bounce: 0.4 }}
                    className="h-14 rounded-[10px] bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:scale-105 flex items-center justify-center group overflow-hidden"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 2.3, duration: 0.3 }}
                    >
                        <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
                    </motion.div>
                </motion.button>

                {/* Name Container */}
                <motion.div 
                    className="h-14 rounded-[10px] bg-white/10 backdrop-blur-md border border-white/20 text-white flex flex-col items-center justify-center overflow-hidden whitespace-nowrap"
                    initial={{ width: 56, paddingLeft: 0, paddingRight: 0, marginLeft: 0, marginRight: 0 }} // Starts as square
                    animate={{ 
                        width: [56, 344, 200], // Keyframes: Square -> Expanded -> Final Width
                        paddingLeft: [0, 0, 32], // Add padding at the end
                        paddingRight: [0, 0, 32],
                        marginLeft: 4,
                        marginRight: 4
                    }} 
                    transition={{
                        width: {
                            times: [0, 0.6, 1], // 0-0.6: Expand, 0.6-1: Shrink/Divide
                            duration: 2.0, // Total duration for container morph
                            ease: [0.16, 1, 0.3, 1],
                            delay: 0.5 // Initial delay before starting
                        },
                        paddingLeft: { delay: 2.0, duration: 0 },
                        paddingRight: { delay: 2.0, duration: 0 },
                        marginLeft: { delay: 2.0, duration: 0.5, ease: "backOut" },
                        marginRight: { delay: 2.0, duration: 0.5, ease: "backOut" }
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2.4, duration: 0.4 }} // Text appears last
                        className="flex flex-col items-center"
                    >
                        <span className="text-sm font-medium uppercase tracking-widest text-white/60 block text-[10px] mb-0.5">
                            FEATURED
                        </span>
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={items[currentIndex].name}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -20, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="block font-bold text-lg leading-none text-center"
                            >
                                {items[currentIndex].name}
                            </motion.span>
                        </AnimatePresence>
                    </motion.div>
                </motion.div>

                {/* Next Button */}
                <motion.button
                    ref={nextBtnRef}
                    onClick={handleNext}
                    initial={{ width: 0, opacity: 0, scale: 0.5 }}
                    animate={{ width: 56, opacity: 1, scale: 1 }}
                    transition={{ delay: 2.0, duration: 0.5, type: "spring", bounce: 0.4 }}
                    className="h-14 rounded-[10px] bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:scale-105 flex items-center justify-center group overflow-hidden"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 2.3, duration: 0.3 }}
                    >
                        <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
                    </motion.div>
                </motion.button>

            </div>

            {/* Pagination / Progress (Optional but nice) */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-50">
                {items.map((_, index) => (
                    <div
                        key={index}
                        className={\`h-1 rounded-full transition-all duration-300 \${
                            index === currentIndex ? "w-8 bg-white" : "w-2 bg-white/40"
                        }\`}
                    />
                ))}
            </div>
        </div>
    );
}

export default Carousel;`,
    },
    {
        id: "carousel-2",
        name: "Carousel 2",
        description: "A neon cyberpunk-style carousel with massive typography and distributed UI layout.",
        fullCode: `"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Menu,
    Search,
    Heart,
    User,
    ShoppingBag,
    Play,
    ArrowRight,
    Palette
} from "lucide-react";

interface CarouselItem {
    id: number;
    name: string;
    image: string;
    year?: string;
}

const items: CarouselItem[] = [
    {
        id: 1,
        name: "KEEPER",
        year: "2025",
        image: "/desktop/chainsaw-man-the-5120x2880-23013.jpg"
    },
    {
        id: 2,
        name: "DANDADAN",
        year: "2024",
        image: "/desktop/dandadan-evil-eye-5120x2880-22717.jpg"
    },
    {
        id: 3,
        name: "SLAYER",
        year: "2023",
        image: "/desktop/demon-slayer-3840x2160-23615.jpg"
    },
    {
        id: 4,
        name: "GACHIAKUTA",
        year: "2025",
        image: "/desktop/gachiakuta-3840x2160-22842.jpg"
    },
    {
        id: 5,
        name: "JUJUTSU",
        year: "2023",
        image: "/desktop/jujutsu-kaisen-3840x2160-19746.jpg"
    },
    {
        id: 6,
        name: "KAIJU",
        year: "2024",
        image: "/desktop/kaiju-no-8-mission-7680x4320-21963.jpg"
    },
];

export function Carousel2() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [cursorSide, setCursorSide] = useState<'left' | 'right'>('right');
    const [isHovering, setIsHovering] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleNext = useCallback(() => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % items.length);
    }, []);

    const handlePrev = useCallback(() => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") handleNext();
            if (e.key === "ArrowLeft") handlePrev();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleNext, handlePrev]);

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY, currentTarget } = e;
        const { left, top, width } = currentTarget.getBoundingClientRect();
        const x = clientX - left;
        const y = clientY - top;
        
        setMousePos({ x, y });
        setCursorSide(x < width / 2 ? 'left' : 'right');
    };

    const handleClick = () => {
        if (cursorSide === 'left') {
            handlePrev();
        } else {
            handleNext();
        }
    };

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? "100%" : "-100%",
            opacity: 1 // Keep full opacity for slider feel
        }),
        center: {
            x: 0,
            opacity: 1,
            transition: {
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1] // Smooth easeOutExpo-ish curve, no bounce
            }
        },
        exit: (direction: number) => ({
            x: direction < 0 ? "100%" : "-100%",
            opacity: 1,
            transition: {
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1]
            }
        })
    };

    const currentItem = items[currentIndex];

    return (
        <div 
            ref={containerRef}
            className="relative w-full h-screen overflow-hidden bg-black text-white font-sans selection:bg-[#00f0ff] selection:text-black cursor-none"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={handleClick}
        >
            
            {/* Background Image Layer */}
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                    key={currentIndex}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0 w-full h-full"
                >
                    <img
                        src={currentItem.image}
                        alt={currentItem.name}
                        className="w-full h-full object-cover opacity-60"
                        draggable={false}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/40" />
                </motion.div>
            </AnimatePresence>



            {/* --- FLOATING WATCH CARD --- */}
            <motion.div 
                key={\`card-\${currentIndex}\`}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute top-32 left-1/2 -translate-x-1/2 z-40 bg-black flex items-center pr-4 gap-4 border-l-4 border-[#00f0ff] pointer-events-auto cursor-default"
                onClick={(e) => e.stopPropagation()} // Prevent nav click
            >
                <div className="w-16 h-12 bg-gray-800 relative overflow-hidden">
                    <img 
                        src={currentItem.image} 
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-bold tracking-wider">NEW PREMIERE</span>
                    <div className="flex items-center gap-2">
                        <span className="text-[#00f0ff] font-bold text-xs tracking-wide">WATCH NOW</span>
                        <Play className="w-3 h-3 fill-[#00f0ff] text-[#00f0ff]" />
                    </div>
                </div>
            </motion.div>

            {/* --- BIG TITLE --- */}
            <div className="absolute top-1/2 left-8 md:left-16 -translate-y-1/2 z-40 pointer-events-none">
                <motion.div
                    key={\`year-\${currentIndex}\`}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-[#00f0ff] font-bold tracking-widest mb-2"
                >
                    {currentItem.year || "2025"}
                </motion.div>
                
                <div className="overflow-hidden">
                    <motion.h1
                        key={\`title-\${currentIndex}\`}
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
                        className="text-[15vh] leading-[0.8] font-black uppercase text-[#00f0ff] tracking-tighter"
                        style={{ textShadow: "0 0 40px rgba(0, 240, 255, 0.3)" }}
                    >
                        {currentItem.name}
                    </motion.h1>
                </div>
            </div>

            {/* --- CUSTOM CURSOR ARROW --- */}
            <AnimatePresence>
                {isHovering && (
                    <motion.div
                        className="fixed z-50 pointer-events-none text-[#00f0ff] drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]"
                        animate={{
                            x: mousePos.x - 24, // Center the arrow horizontally (48px width / 2)
                            y: mousePos.y - 24,
                            rotate: cursorSide === 'left' ? 180 : 0
                        }}
                        transition={{
                            type: "tween",
                            ease: "linear",
                            duration: 0.1
                        }}
                    >
                        <ArrowRight className="w-12 h-12 stroke-[1.5]" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- BOTTOM CONTROLS --- */}
            <div className="absolute bottom-12 left-0 w-full px-8 md:px-16 flex justify-between items-end z-40 pointer-events-none">
                {/* Left Action Buttons */}
                <div className="flex gap-8 pointer-events-auto">
                    <button className="group" onClick={(e) => e.stopPropagation()}>
                        <Play className="w-12 h-12 md:w-16 md:h-16 text-[#00f0ff] stroke-[1] fill-transparent group-hover:fill-[#00f0ff]/20 transition-all" />
                    </button>
                    <button className="group" onClick={(e) => e.stopPropagation()}>
                        <Heart className="w-12 h-12 md:w-16 md:h-16 text-[#00f0ff] stroke-[1] group-hover:scale-110 transition-transform" />
                    </button>
                </div>

                {/* Center Pagination */}
                <div className="flex gap-3 mb-4 pointer-events-auto">
                    {items.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={(e) => {
                                e.stopPropagation();
                                setCurrentIndex(idx);
                            }}
                            className={\`w-2 h-2 rounded-full border transition-all duration-300 \${
                                idx === currentIndex 
                                    ? "bg-[#00f0ff] border-[#00f0ff] w-8" 
                                    : "bg-transparent border-[#00f0ff]/50 hover:border-[#00f0ff]"
                            }\`}
                        />
                    ))}
                </div>

                {/* Right Theme Toggle */}
                <button 
                    className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center backdrop-blur-md hover:bg-white/10 transition-colors pointer-events-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Palette className="w-5 h-5 text-gray-300" />
                </button>
            </div>
        </div>
    );
}

export default Carousel2;`,
    },
    {
        id: "carousel-3",
        name: "Carousel 3",
        description: "A curved carousel where the center item is larger, featuring smooth scrolling and looping.",
        fullCode: `"use client";

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
      className={"relative w-full h-[850px] flex items-center justify-center overflow-hidden " + className}
    >
      {/* Background removed as per reference */}
      
      {/* Draggable Surface - Using direct x mapping for inertia */}
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
          const velocity = info.velocity.x;
          if (Math.abs(velocity) > 10) {
            // Apply momentum
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
  // Only 9 cards visible (approx +/- 640px from center based on 160px spacing)
  // Scale steps: 0->100%, 1->85%, 2->65%, 3->50%, 4->40%
  const scaleInput = [-640, -480, -320, -160, 0, 160, 320, 480, 640];
  const scaleOutput = [0.4, 0.5, 0.65, 0.85, 1, 0.85, 0.65, 0.5, 0.4];
  
  // Base max size (Center card)
  const MAX_WIDTH = ITEM_WIDTH * 2.3;
  const MAX_HEIGHT = ITEM_WIDTH * 3.2;

  const width = useTransform(position, scaleInput, scaleOutput.map(s => MAX_WIDTH * s));
  const height = useTransform(position, scaleInput, scaleOutput.map(s => MAX_HEIGHT * s));
  
  const activeRange = SPACING * 4.5;
  const opacity = useTransform(position, 
    [-activeRange, -activeRange * 0.75, 0, activeRange * 0.75, activeRange], 
    [0, 1, 1, 1, 0]
  );

  const zIndex = useTransform(position, (pos) => {
    return 50 - Math.abs(Math.round(pos / 10)); // Reduced base z-index
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
}`,
    },
    {
        id: "carousel-4",
        name: "Carousel 4",
        description: "A waterfall carousel where items flow from the right edge and drop down into depth.",
        fullCode: `"use client";

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
                        <h1 className="text-[12vw] font-schabo text-foreground tracking-[1px] leading-[0.8] mb-6">
                             {String(items[activeIndex].id).padStart(2, '0')}
                        </h1>

                        {/* Text Container - Name */}
                        <div className="flex flex-wrap w-full gap-x-6 gap-y-6">
                            {items[activeIndex].name.split(" ").map((word, i) => (
                                <h1 
                                    key={i} 
                                    className="text-[12vw] font-schabo text-foreground tracking-[1px] uppercase leading-[0.75]"
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

    // Derived transform
    // Note: older commented-out 'x' and 'y' logic removed for clarity.
    
    // RE-CALCULATE X properly
    const realX = useTransform(scrollX, (value: any) => {
        // Offset by SPACING ensures Item 0 is at dropPoint when value=0
        const base = (index * SPACING) + value + SPACING; 
        const modulo = (base % totalWidth + totalWidth) % totalWidth;
        
        // Subtract SPACING to create the 'falling' zone window
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
                originY: 0.5
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
}`,
    },
];

export function getComponentById(id: string) {
    return componentsData.find((c) => c.id === id);
}
