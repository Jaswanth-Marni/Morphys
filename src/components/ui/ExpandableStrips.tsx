"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useMotionValue, animate } from "framer-motion";
import { Bangers, Zen_Kaku_Gothic_New } from 'next/font/google';

const bangers = Bangers({
    weight: '400',
    subsets: ['latin'],
    display: 'swap',
});

const zenKaku = Zen_Kaku_Gothic_New({
    weight: '400',
    subsets: ['latin'],
    display: 'swap',
});

// Types for our data
interface StripItem {
    id: number;
    image: string;
    title: string; // e.g. "Hercules"
    titleJapanese: string; // Japanese name
    category: string; // e.g. "Explore Song & Extra Material"
}

// Vertical offsets for staggered layout (in pixels) - three levels: top (-40), middle (0), bottom (+40)
const verticalOffsets = [-40, 0, 40, -40, 0, 40, -40, 0, 40, -40, 0];

// Default data using images from /24 folder
const defaultItems: StripItem[] = [
    { id: 1, image: "/24/chainsaw-man-the-5120x2880-23013.jpg", title: "Chainsaw Man", titleJapanese: "チェンソーマン", category: "Explore Song & Extra Material" },
    { id: 2, image: "/24/dandadan.jpg", title: "Dandadan", titleJapanese: "ダンダダン", category: "Explore Song & Extra Material" },
    { id: 3, image: "/24/demon-slayer-3840x2160-23615.jpg", title: "Demon Slayer", titleJapanese: "鬼滅の刃", category: "Explore Song & Extra Material" },
    { id: 4, image: "/24/gachiakuta-season-1-1440x2560-23000.jpg", title: "Gachiakuta", titleJapanese: "ガチアクタ", category: "Explore Song & Extra Material" },
    { id: 5, image: "/24/jujutsu kaisen.jpg", title: "Jujutsu Kaisen", titleJapanese: "呪術廻戦", category: "Explore Song & Extra Material" },
    { id: 6, image: "/24/kaiju-no-8-video-1440x2560-20422.jpg", title: "Kaiju No. 8", titleJapanese: "怪獣８号", category: "Explore Song & Extra Material" },
    { id: 7, image: "/24/onepiece.jpg", title: "One Piece", titleJapanese: "ワンピース", category: "Explore Song & Extra Material" },
    { id: 8, image: "/24/solo leveling.jpg", title: "Solo Leveling", titleJapanese: "俺だけレベルアップな件", category: "Explore Song & Extra Material" },
    { id: 9, image: "/24/spyxfamily.jpg", title: "Spy x Family", titleJapanese: "スパイファミリー", category: "Explore Song & Extra Material" },
    { id: 10, image: "/24/taro-sakamoto-1440x2560-23904.jpg", title: "Sakamoto Days", titleJapanese: "サカモトデイズ", category: "Explore Song & Extra Material" },
    { id: 11, image: "/24/to-be-hero-x-5k-1440x2560-22857.png", title: "To Be Hero X", titleJapanese: "トゥ・ビー・ヒーロー", category: "Explore Song & Extra Material" },
];

export function ExpandableStrips({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
    const [activeId, setActiveId] = useState<number | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [isInteracting, setIsInteracting] = useState(false);
    const x = useMotionValue(0);

    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    const stripDelays = React.useMemo(() => {
        return defaultItems.map(() => Math.random() * 1.0);
    }, []);

    const containerRef = React.useRef<HTMLDivElement>(null);
    const parentRef = React.useRef<HTMLDivElement>(null);

    const checkCenter = () => {
        const container = containerRef.current;
        if (!container) return;

        const containerRect = container.getBoundingClientRect();
        // For mobile (drag), we compare against the screen/parent center
        // For desktop (scroll), we compare against the scroll container center (which is roughly screen center usually)
        const parentCenter = window.innerWidth / 2;

        let closestId: number | null = null;
        let minDiff = Infinity;

        Array.from(container.children).forEach((child) => {
            if (child instanceof HTMLElement) {
                const rect = child.getBoundingClientRect();
                const childCenter = rect.left + rect.width / 2;
                const diff = Math.abs(childCenter - parentCenter);

                if (diff < minDiff) {
                    minDiff = diff;
                    closestId = Number(child.getAttribute('data-id'));
                }
            }
        });

        if (closestId !== null) {
            setActiveId((prev) => (prev !== closestId ? closestId : prev));
        }
    };

    React.useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Initial check
        checkCenter();

        const handleScroll = () => {
            if (!isMobile) checkCenter();
        };

        container.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', checkCenter);

        return () => {
            container.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', checkCenter);
        };
    }, [isMobile]);

    return (
        <div
            ref={parentRef}
            className={`w-full h-screen min-h-[800px] flex flex-col items-center justify-center bg-[#f2f1ef] overflow-hidden py-10 ${className}`}
            style={style}
        >

            {/* Strips Container */}
            <motion.div
                ref={containerRef}
                style={{ x }}
                drag={isMobile ? "x" : false}
                dragConstraints={parentRef}
                dragElastic={0.05}
                onDragStart={() => setIsInteracting(true)}
                onDragEnd={() => {
                    setIsInteracting(false);
                    if (isMobile && activeId !== null) {
                        const index = defaultItems.findIndex(i => i.id === activeId);
                        if (index !== -1) {
                            // Calculate target x offset to center the expanded item
                            // Formula: -90 (offset for expansion centering) - index * 116 (offset for previous items)
                            const targetX = -90 - index * 116;
                            animate(x, targetX, {
                                type: "spring",
                                stiffness: 300,
                                damping: 30
                            });
                        }
                    }
                }}
                onUpdate={() => {
                    if (isMobile) checkCenter();
                }}
                className={`flex ${isMobile ? 'w-fit self-start' : 'w-full'} md:max-w-6xl h-[500px] px-[calc(50vw_-_50px)] md:px-4 gap-4 items-center ${isMobile ? 'overflow-visible cursor-grab active:cursor-grabbing' : 'overflow-x-auto'} md:overflow-visible pb-8 md:pb-0 scrollbar-hide`}
            >
                {defaultItems.map((item, index) => (
                    <Strip
                        key={item.id}
                        item={item}
                        isActive={activeId === item.id}
                        onHover={() => {
                            if (window.innerWidth >= 768) setActiveId(item.id);
                        }}
                        onLeave={() => {
                            if (window.innerWidth >= 768) setActiveId(null);
                        }}
                        anyActive={activeId !== null}
                        verticalOffset={verticalOffsets[index % verticalOffsets.length]}
                        delay={stripDelays[index]}
                        isMobile={isMobile}
                        isInteracting={isInteracting}
                    />
                ))}
            </motion.div>

            {/* Dynamic Bottom Text */}
            <div className="h-32 mt-12 w-full flex items-center justify-center text-center px-4">
                <AnimatePresence mode="wait">
                    {activeId ? (
                        <AnimatedTitle
                            key={`title-${activeId}`}
                            title={defaultItems.find((i) => i.id === activeId)?.title || ""}
                            titleJapanese={defaultItems.find((i) => i.id === activeId)?.titleJapanese || ""}
                            className={bangers.className}
                            japaneseClassName={zenKaku.className}
                        />
                    ) : (
                        <AnimatedTitle
                            key="hover-prompt"
                            title="Hover to Explore"
                            titleJapanese=""
                            className={`${bangers.className} text-[#1a1a1a]/40`}
                            japaneseClassName={zenKaku.className}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div >
    );
}

// Animated Title Component with random letter reveal
function AnimatedTitle({ title, titleJapanese, className, japaneseClassName }: {
    title: string;
    titleJapanese: string;
    className: string;
    japaneseClassName: string;
}) {
    // Split title into individual letters
    const letters = title.split('');

    // Generate random delays for each letter
    const randomDelays = React.useMemo(() => {
        return letters.map(() => Math.random() * 0.5);
    }, [title]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center gap-2"
        >
            <h2 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#1a1a1a] tracking-wider ${className} flex flex-wrap justify-center`}>
                {letters.map((letter, index) => (
                    <motion.span
                        key={`${title}-${index}`}
                        initial={{
                            opacity: 0,
                            scale: 0,
                            z: -100,
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            z: 0,
                        }}
                        transition={{
                            delay: randomDelays[index],
                            type: "spring",
                            stiffness: 300,
                            damping: 15,
                            mass: 0.8,
                        }}
                        className="inline-block"
                        style={{
                            transformOrigin: "center",
                            perspective: 1000,
                        }}
                    >
                        {letter === ' ' ? '\u00A0' : letter}
                    </motion.span>
                ))}
            </h2>
            {/* Japanese subtitle */}
            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl text-[#1a1a1a]/20 tracking-wide ${japaneseClassName}`}
            >
                {titleJapanese}
            </motion.p>
        </motion.div>
    );
}

// Individual Strip Component
function Strip({
    item,
    isActive,
    anyActive,
    onHover,
    onLeave,
    verticalOffset = 0,
    delay = 0,
    isMobile = false,
    isInteracting = false,
}: {
    item: StripItem;
    isActive: boolean;
    anyActive: boolean;
    onHover: () => void;
    onLeave: () => void;
    verticalOffset?: number;
    delay?: number;
    isMobile?: boolean;
    isInteracting?: boolean;
}) {
    const [hasLoaded, setHasLoaded] = useState(false);
    const shouldExpand = isActive && (!isMobile || !isInteracting);

    React.useEffect(() => {
        setHasLoaded(true);
    }, []);

    return (
        <motion.div
            layout
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
            data-id={item.id}
            className={`relative h-[85%] overflow-hidden cursor-pointer ${shouldExpand ? "z-10 shadow-2xl" : "z-0"} md:min-w-0 ${isMobile ? 'flex-shrink-0' : ''}`}
            initial={{
                flexGrow: 0,
                flexBasis: "auto",
                width: isMobile ? 100 : "auto",
                opacity: 0,
                scale: 0
            }}
            animate={{
                flexGrow: isMobile ? 0 : (shouldExpand ? 3.5 : 1),
                flexBasis: isMobile ? "auto" : "0%",
                width: isMobile ? (shouldExpand ? 280 : 100) : "auto",
                y: verticalOffset,
                opacity: 1,
                scale: 1,
            }}
            style={{
                minWidth: isMobile ? undefined : 0, // On desktop allow flex compression
            }}
            transition={{
                flexGrow: { duration: 0.6, ease: [0.32, 0.72, 0, 1] },
                width: { duration: 0.6, ease: [0.32, 0.72, 0, 1] },
                layout: { duration: 0.6, ease: [0.32, 0.72, 0, 1] },
                y: { duration: 0.5, ease: [0.32, 0.72, 0, 1] },
                opacity: { delay: hasLoaded ? 0 : delay, duration: 0.6 },
                scale: {
                    delay: hasLoaded ? 0 : delay,
                    type: "spring",
                    stiffness: 200,
                    damping: 12,
                    mass: 1.2
                }
            }}
        >
            {/* Image Layer */}
            <div className="absolute inset-0 w-full h-full">
                <motion.img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover object-center"
                    animate={{
                        filter: isActive ? "grayscale(0%)" : "grayscale(100%)",
                    }}
                    transition={{ duration: 0.4 }}
                    style={{
                        // Keep image centered even when container shrinks
                        minWidth: "100%",
                    }}
                />
            </div>

            {/* White wash overlay for the "faded" look when inactive */}
            <motion.div
                className="absolute inset-0 bg-white"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: isActive ? 0 : 0.65 }}
                transition={{ duration: 0.4 }}
            />
        </motion.div>
    );
}
