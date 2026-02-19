"use client";

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

    // Preload adjacent images
    useEffect(() => {
        const nextIndex = (currentIndex + 1) % items.length;
        const prevIndex = (currentIndex - 1 + items.length) % items.length;
        const preloadImages = [items[nextIndex].image, items[prevIndex].image];

        preloadImages.forEach((src) => {
            const img = new Image();
            img.src = src;
        });
    }, [currentIndex]);

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
    } as any;

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
                        loading="eager"
                        draggable={false}
                    />
                    {/* Dark overlay for better text visibility if needed, keeps it subtle */}
                    <div className="absolute inset-0 bg-black/10" />
                </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <div
                className="absolute top-8 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center"
            >

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
                        className={`h-1 rounded-full transition-all duration-300 ${index === currentIndex ? "w-8 bg-white" : "w-2 bg-white/40"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}

export default Carousel;
