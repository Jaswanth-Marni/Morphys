"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useTransform, useSpring, AnimatePresence, useMotionValue } from "framer-motion";
import { ArrowLeft } from "lucide-react";

interface PinnedItem {
    number: string;
    name: string;
    image: string;
    scale?: string;
}

const defaultItems: PinnedItem[] = [
    {
        number: "1",
        name: "CHAINSAW-MAN",
        image: "/24/chainsaw-man-the-5120x2880-23013.jpg",
        scale: "45vw",
    },
    {
        number: "2",
        name: "DEMON-SLAYER",
        image: "/24/demon-slayer-3840x2160-23615.jpg",
        scale: "45vw",
    },
    {
        number: "3",
        name: "JUJUTSU-KAISEN",
        image: "/24/jujutsu kaisen.jpg",
        scale: "45vw",
    },
    {
        number: "4",
        name: "SOLO-LEVELING",
        image: "/24/solo leveling.jpg",
    },
    {
        number: "5",
        name: "DANDADAN",
        image: "/24/dandadan.jpg",
    },
    {
        number: "6",
        name: "ONE-PIECE",
        image: "/24/onepiece.jpg",
    },
    {
        number: "7",
        name: "SPY-X-FAMILY",
        image: "/24/spyxfamily.jpg",
    },
    {
        number: "8",
        name: "KAIJU-NO-8",
        image: "/24/kaiju-no-8-video-1440x2560-20422.jpg",
    },
    {
        number: "9",
        name: "GACHIAKUTA",
        image: "/24/gachiakuta-season-1-1440x2560-23000.jpg",
    },
    {
        number: "10",
        name: "SAKAMOTO-DAYS",
        image: "/24/taro-sakamoto-1440x2560-23904.jpg",
    },
    {
        number: "11",
        name: "TO-BE-HERO-X",
        image: "/24/to-be-hero-x-5k-1440x2560-22857.png",
    },
];

const CarouselItem = ({ item, index, scrollYProgress, total, isLight }: { item: PinnedItem, index: number, scrollYProgress: any, total: number, isLight: boolean }) => {
    const start = index / total;
    const end = (index + 1) / total;

    const itemProgress = useTransform(scrollYProgress, [start, end], [0, 1]);

    const numberX = useTransform(
        itemProgress,
        [0, 0.2, 0.8, 1],
        ["100vw", "4vw", "4vw", "-100vw"]
    );

    const nameX = useTransform(
        itemProgress,
        [0, 0.2, 0.8, 1],
        ["150vw", "28vw", "28vw", "-150vw"]
    );

    const imgX = useTransform(itemProgress, [0.15, 0.85], ["120vw", "-100vw"]);

    const imgY = "23vh";

    return (
        <div className="absolute inset-0 pointer-events-none">
            <motion.div
                style={{ x: nameX }}
                className="absolute bottom-0 left-0 z-10"
            >
                <h3 className={`text-[12vw] font-black tracking-tighter whitespace-nowrap leading-none select-none font-victory ${isLight ? 'text-black/20' : 'text-white/20'}`}>
                    {item.name}
                </h3>
            </motion.div>

            <div className="absolute inset-0 z-20 overflow-hidden">
                <motion.div
                    style={{ x: imgX, y: imgY, width: item.scale || "25vw" }}
                    className={`absolute aspect-auto max-h-[70vh] overflow-hidden shadow-2xl border ${isLight ? 'border-black/10' : 'border-white/10'}`}
                >
                    <img src={item.image} alt="" className="w-full h-full object-cover transition-all duration-500" />
                </motion.div>
            </div>

            <motion.div
                style={{ x: numberX }}
                className="absolute top-0 bottom-0 left-0 flex items-center z-30"
            >
                <h2 className={`text-[70vh] tracking-tighter leading-none select-none font-victory translate-y-[5%] ${isLight ? 'text-black drop-shadow-[0_0_50px_rgba(0,0,0,0.3)]' : 'text-white drop-shadow-[0_0_50px_rgba(0,0,0,0.5)]'}`}>
                    {item.number}
                </h2>
            </motion.div>
        </div>
    );
};

export const PinnedCarousel = ({ config = {} }: { config?: any }) => {
    const items = config.items || defaultItems;
    const containerRef = useRef<HTMLDivElement>(null);

    // Theme state
    const [theme, setTheme] = useState<"light" | "dark">("dark");

    useEffect(() => {
        // Initial theme check
        const currentTheme = document.documentElement.getAttribute("data-theme") as "light" | "dark" || "dark";
        setTheme(currentTheme);

        // Observer for theme attribute changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === "data-theme") {
                    const newTheme = document.documentElement.getAttribute("data-theme") as "light" | "dark" || "dark";
                    setTheme(newTheme);
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });

        return () => {
            observer.disconnect();
        };
    }, []);

    const isLight = theme === "light";

    // Virtual scroll state
    const scrollY = useMotionValue(0);
    const maxScroll = items.length * 2500; // Faster scroll transitions

    const handleWheel = (e: React.WheelEvent) => {
        const newScroll = scrollY.get() + e.deltaY;
        // Clamp between 0 and maxScroll
        const clampedScroll = Math.max(0, Math.min(newScroll, maxScroll));
        scrollY.set(clampedScroll);
    };

    // Convert scroll pixels to 0-1 progress
    const rawProgress = useTransform(scrollY, [0, maxScroll], [0, 1]);

    const smoothProgress = useSpring(rawProgress, {
        stiffness: 30, // Lower stiffness = more "weight" / lag
        damping: 30,   // Higher damping ratio prevents bounce
        mass: 1.2      // More mass = harder to move/stop
    });

    const hintOpacity = useTransform(smoothProgress, [0, 0.05], [1, 0]);
    const hintX = useTransform(smoothProgress, [0, 0.05], [0, -50]);

    return (
        <div
            ref={containerRef}
            className="h-screen w-full relative overflow-hidden"
            onWheel={handleWheel}
        >

            <motion.div
                style={{ opacity: hintOpacity, x: hintX }}
                className={`absolute right-12 bottom-12 z-50 flex items-center gap-4 ${isLight ? 'text-black/50' : 'text-white/50'}`}
            >
                <span className="text-sm font-light tracking-[0.3em] uppercase">Scroll to explore</span>
                <motion.div
                    animate={{ x: [-10, 0, -10] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                    <ArrowLeft size={24} />
                </motion.div>
            </motion.div>

            {items.map((item: PinnedItem, index: number) => (
                <CarouselItem
                    key={index}
                    item={item}
                    index={index}
                    scrollYProgress={smoothProgress}
                    total={items.length}
                    isLight={isLight}
                />
            ))}

            <motion.div
                className={`absolute bottom-0 left-0 h-1 z-50 ${isLight ? 'bg-black' : 'bg-white'}`}
                style={{ width: useTransform(smoothProgress, [0, 1], ["0%", "100%"]) }}
            />
        </div>
    );
};

export default PinnedCarousel;
