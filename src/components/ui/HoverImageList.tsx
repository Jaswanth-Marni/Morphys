"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useSpring, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

interface HoverImageListItem {
    id: number;
    text: string;
    subtext: string;
    image: string;
}

interface HoverImageListProps {
    items?: HoverImageListItem[];
    className?: string;
}

const defaultItems: HoverImageListItem[] = [
    {
        id: 1,
        text: "DAN DA DAN",
        subtext: "01",
        image: "/24/dandadan.jpg",
    },
    {
        id: 2,
        text: "JUJUTSU KAISEN",
        subtext: "02",
        image: "/24/jujutsu kaisen.jpg",
    },
    {
        id: 3,
        text: "CHAINSAW MAN",
        subtext: "03",
        image: "/24/chainsaw-man-the-5120x2880-23013.jpg",
    },
    {
        id: 4,
        text: "DEMON SLAYER",
        subtext: "04",
        image: "/24/demon-slayer-3840x2160-23615.jpg",
    },
    {
        id: 5,
        text: "SOLO LEVELING",
        subtext: "05",
        image: "/24/solo leveling.jpg",
    },
];

const HoverHeading = ({ text }: { text: string }) => {
    return (
        <h2 className="relative z-30 mix-blend-difference overflow-hidden text-4xl md:text-6xl font-kugile tracking-tighter text-zinc-100 transition-colors group-hover:text-zinc-400 leading-tight">
            <span className="relative block pt-3 pb-1">
                {text.split("").map((char, i) => (
                    <motion.span
                        key={i}
                        className="inline-block relative"
                        initial={{ y: 0, skewY: 0 }}
                        variants={{
                            hover: {
                                y: "200%",
                                skewY: 12,
                                transition: {
                                    duration: 1.0,
                                    // Left-to-right stagger
                                    delay: i * 0.03,
                                    ease: [0.19, 1, 0.22, 1], // expoOut
                                }
                            }
                        }}
                    >
                        {char === " " ? "\u00A0" : char}
                    </motion.span>
                ))}
            </span>
            <span className="absolute top-0 left-0 block w-full pt-3 pb-1">
                {text.split("").map((char, i) => (
                    <motion.span
                        key={i}
                        className="inline-block relative"
                        initial={{ y: "-200%", skewY: 12 }}
                        variants={{
                            hover: {
                                y: 0,
                                skewY: 0,
                                transition: {
                                    duration: 1.0,
                                    delay: i * 0.03,
                                    ease: [0.19, 1, 0.22, 1], // expoOut
                                }
                            }
                        }}
                    >
                        {char === " " ? "\u00A0" : char}
                    </motion.span>
                ))}
            </span>
        </h2>
    );
};

export function HoverImageList({
    items = defaultItems,
    className,
}: HoverImageListProps) {
    const [activeImage, setActiveImage] = useState<string | null>(null);
    const [activeId, setActiveId] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Mouse position
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth springs for the image movement
    const springConfig = { damping: 20, stiffness: 200, mass: 0.5 };
    const x = useSpring(mouseX, springConfig);
    const y = useSpring(mouseY, springConfig);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        // We want the image centered on the cursor, or slightly offset
        // Calculating relative to the container isn't strictly necessary if using fixed/absolute with e.clientX/Y
        // creating a parallax effect or just direct follow.

        // Using simple client coordinates for a "fixed" feel or relative to container
        // Let's go relative to the container to keep it contained? 
        // Actually, "fixed" behavior usually looks better for this heavy overlay style

        // For this implementation, let's track relative to the container center or top-left
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();

        // Offset relative to the container
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        mouseX.set(offsetX);
        mouseY.set(offsetY);
    };

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative w-full max-w-5xl mx-auto py-8 px-4",
                className
            )}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => {
                setActiveImage(null);
                setActiveId(null);
            }}
        >
            {/* List Items */}
            <div className="flex flex-col">
                {items.map((item) => (
                    <motion.div
                        key={item.id}
                        className="flex justify-between items-center py-9 border-b border-zinc-700/50 last:border-none cursor-pointer group transition-all duration-300"
                        onMouseEnter={() => {
                            setActiveImage(item.image);
                            setActiveId(item.id);
                        }}
                        initial="initial"
                        whileHover="hover"
                    >
                        <HoverHeading text={item.text} />
                        <span className="text-sm md:text-lg font-light text-zinc-400 group-hover:text-zinc-600 transition-colors relative z-30 mix-blend-difference">
                            {item.subtext}
                        </span>
                    </motion.div>
                ))}
            </div>

            {/* Hover Image - Preloaded and accessible for smooth transitions */}
            <motion.div
                className="absolute top-0 left-0 z-20 pointer-events-none mix-blend-normal"
                style={{ x, y }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                    opacity: activeImage ? 1 : 0,
                    scale: activeImage ? 1 : 0.8,
                }}
                transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            >
                <div className="relative -translate-x-1/2 -translate-y-1/2">
                    {items.map((item) => (
                        <img
                            key={item.id}
                            src={item.image}
                            alt="Preview"
                            className={cn(
                                "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-auto h-auto max-w-[450px] max-h-[450px] object-contain shadow-2xl transition-all duration-300",
                                activeId === item.id
                                    ? "opacity-100 scale-100 blur-0"
                                    : "opacity-0 scale-95 blur-sm"
                            )}
                        />
                    ))}
                </div>
            </motion.div>

            {/* Background/Context helper - removing if standalone component
          but useful for visibility if parent is light/dark.
          The prompt image shows light theme, but codebase seems robust.
          I'm using mix-blend-difference for text to ensure visibility against the image.
      */}
        </div>
    );
}
