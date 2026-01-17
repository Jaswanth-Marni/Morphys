import React, { useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Items with names from NotificationStack component
const items = [
    { name: "QUANTUM", image: "/carousel1.png" },
    { name: "CYBERNETICS", image: "/carousel2.jpg" },
    { name: "NEBULA", image: "/carousel3.jpg" },
    { name: "CHRONOS", image: "/carousel4.jpg" },
    { name: "VELOCITY", image: "/carousel5.jpg" },
    { name: "HORIZON", image: "/carousel6.jpg" },
    { name: "ECLIPSE", image: "/carousel7.jpg" },
    { name: "AURORA", image: "/carousel8.jpg" },
];

export const LayeredImageShowcase = ({ className = "h-screen", config = {} }: { className?: string, config?: any }) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const {
        title = "MORPHYS",
        accentColor = "#FF3333",
        textColor = "#ffffff"
    } = config;

    // Stable callback for clearing hover
    const clearHover = useCallback(() => setHoveredIndex(null), []);

    return (
        <div className={`relative w-full bg-black overflow-hidden font-sans ${className}`}>
            <style jsx global>{`
                @font-face {
                    font-family: 'Overheat';
                    src: url('/overheat-regular.ttf') format('truetype');
                    font-weight: normal;
                    font-style: normal;
                }
            `}</style>
            {/* Background Images */}
            <div className="absolute inset-0 z-0">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 w-full h-full transition-opacity duration-500 ease-linear pointer-events-none ${hoveredIndex === index ? 'opacity-100' : 'opacity-0'}`}
                    >
                        <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover opacity-80"
                        />
                    </div>
                ))}
            </div>

            {/* Content Container */}
            <div className="relative z-10 w-full h-full flex flex-col justify-between p-8 md:p-16">

                {/* Top Right List */}
                <div className="flex flex-col items-end gap-1 mt-10">
                    {items.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ x: 100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{
                                delay: 0.1 + (index * 0.05),
                                type: "spring",
                                stiffness: 70,
                                damping: 10
                            }}
                        >
                            <DirectorLink
                                name={item.name}
                                index={index}
                                isHovered={hoveredIndex === index}
                                isAnyHovered={hoveredIndex !== null}
                                onHover={setHoveredIndex}
                                onLeave={clearHover}
                                accentColor={accentColor}
                                textColor={textColor}
                            />
                        </motion.div>
                    ))}
                </div>

                {/* Bottom Left Title */}
                <div className="mb-0">
                    <motion.h1
                        className="text-[18vw] md:text-[12vw] leading-[0.8] font-[Overheat] tracking-tighter uppercase"
                        style={{ color: accentColor }}
                        initial="hidden"
                        variants={{
                            visible: {
                                x: 0,
                                y: 0,
                                opacity: 1,
                                transition: {
                                    type: "spring",
                                    stiffness: 70,
                                    damping: 10,
                                    delay: 0.5
                                }
                            },
                            hidden: {
                                x: 0,
                                y: "100%",
                                opacity: 0,
                                transition: { duration: 0.6, ease: [0.33, 1, 0.68, 1] }
                            }
                        }}
                        animate={hoveredIndex !== null ? "hidden" : "visible"}
                    >
                        {title}
                    </motion.h1>
                </div>
            </div>
        </div>
    );
};

interface DirectorLinkProps {
    name: string;
    index: number;
    isHovered: boolean;
    isAnyHovered: boolean;
    onHover: (index: number) => void;
    onLeave: () => void;
    accentColor: string;
    textColor: string;
}

const DirectorLink = memo(({ name, index, isHovered, isAnyHovered, onHover, onLeave, accentColor, textColor }: DirectorLinkProps) => {
    // Split name into letters for staggered animation
    const letters = name.split('');

    // Stagger settings
    const staggerDuration = 0.025;
    const transition = { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const };

    return (
        <div
            className="relative cursor-pointer overflow-hidden group py-1"
            onMouseEnter={() => onHover(index)}
            onMouseLeave={onLeave}
        >
            <div className="relative">
                {/* Regular Text (Initial State) */}
                <div
                    className="text-4xl md:text-6xl font-[Overheat] uppercase tracking-tighter flex"
                    style={{ color: textColor }}
                >
                    {letters.map((letter, i) => (
                        <motion.span
                            key={i}
                            className="inline-block whitespace-pre"
                            animate={{
                                y: isHovered ? '100%' : '0%',
                                opacity: isHovered ? 0 : (isAnyHovered ? 0.3 : 1),
                            }}
                            transition={{
                                ...transition,
                                delay: isHovered ? i * staggerDuration : 0
                            }}
                        >
                            {letter}
                        </motion.span>
                    ))}
                </div>

                {/* Red Text (Hover State) */}
                <div
                    className="absolute inset-0 text-4xl md:text-6xl font-[Overheat] uppercase tracking-tighter flex pointer-events-none"
                    style={{ color: accentColor }}
                >
                    {letters.map((letter, i) => (
                        <motion.span
                            key={i}
                            className="inline-block whitespace-pre"
                            initial={{ y: '-100%', opacity: 0 }}
                            animate={{
                                y: isHovered ? '0%' : '-100%',
                                opacity: isHovered ? 1 : 0,
                            }}
                            transition={{
                                ...transition,
                                delay: isHovered ? i * staggerDuration : 0
                            }}
                        >
                            {letter}
                        </motion.span>
                    ))}
                </div>
            </div>
        </div>
    );
});

DirectorLink.displayName = "DirectorLink";
