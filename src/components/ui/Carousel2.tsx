"use client";

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
        if (!containerRef.current) return;
        const { clientX, clientY } = e;
        const { left, top, width } = containerRef.current.getBoundingClientRect();
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
    } as any;

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
                key={`card-${currentIndex}`}
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
                    key={`year-${currentIndex}`}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-[#00f0ff] font-bold tracking-widest mb-2"
                >
                    {currentItem.year || "2025"}
                </motion.div>

                <div className="overflow-hidden">
                    <motion.h1
                        key={`title-${currentIndex}`}
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
                        className="fixed top-0 left-0 z-[9999] pointer-events-none text-[#00f0ff] drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]"
                        animate={{
                            x: mousePos.x - 72,
                            y: mousePos.y - 72,
                            rotate: cursorSide === 'left' ? 180 : 0
                        }}
                        transition={{
                            x: { duration: 0, ease: "linear" },
                            y: { duration: 0, ease: "linear" },
                            rotate: { duration: 0.5, ease: "backOut" } // Smooth rotation with a little overshoot
                        }}
                    >
                        <ArrowRight className="w-36 h-36 stroke-[1]" />
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
                            className={`w-2 h-2 rounded-full border transition-all duration-300 ${idx === currentIndex
                                ? "bg-[#00f0ff] border-[#00f0ff] w-8"
                                : "bg-transparent border-[#00f0ff]/50 hover:border-[#00f0ff]"
                                }`}
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

export default Carousel2;
