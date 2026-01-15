"use client";

import React, { useState, useEffect } from 'react';
import { motion, useSpring } from 'framer-motion';

// Static preview for component cards
export function FluidHeightPreview() {
    return (
        <div className="w-full h-full flex items-center justify-center overflow-hidden">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700&display=swap');
                .fluid-preview-font {
                    font-family: 'Big Shoulders Display', sans-serif;
                    font-weight: 700;
                }
            `}</style>
            <div className="flex">
                {"MORPHYS".split('').map((char, index) => (
                    <span
                        key={index}
                        className="fluid-preview-font text-[2.5rem] md:text-[3rem] leading-[0.8] text-foreground"
                        style={{
                            transform: 'scaleY(2)',
                            transformOrigin: '50% 0%',
                            display: 'inline-block',
                            marginLeft: index === 0 ? 0 : '-0.02em',
                        }}
                    >
                        {char}
                    </span>
                ))}
            </div>
        </div>
    );
}


interface FluidHeightProps {
    className?: string; // For text styling
    containerClassName?: string; // For container alignment/styling
    showHint?: boolean;
}

const FluidHeight: React.FC<FluidHeightProps> = ({ className = "", containerClassName = "", showHint = true }) => {
    const [hasGrown, setHasGrown] = useState(false);
    const [impactTrigger, setImpactTrigger] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    // Configuration
    const text = "MORPHYS";
    const minScale = 1;
    const maxScale = 2.2;
    const duration = 0.8;
    const delay = 0.5;
    const neighborRange = 2; // How many neighbors are affected

    useEffect(() => {
        const sequence = async () => {
            // 1. Wait for blur to clear
            await new Promise(r => setTimeout(r, delay * 1000 + 500));

            // 2. Trigger Growth Phase
            setHasGrown(true);

            // 3. Wait for growth to finish
            await new Promise(r => setTimeout(r, duration * 1000));

            // 4. Trigger Impact
            setImpactTrigger(true);
            setTimeout(() => setImpactTrigger(false), 300);
        };

        sequence();
    }, []);

    return (
        <div className={`relative w-full h-full flex flex-col items-center justify-center overflow-hidden font-sans ${containerClassName}`}>
            {/* Import Big Shoulders Display */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700&display=swap');
                
                .fluid-font {
                    font-family: 'Big Shoulders Display', sans-serif;
                    font-weight: 700;
                }
            `}</style>

            {/* Main Container */}
            <motion.div
                animate={impactTrigger ? { y: [0, 20, -10, 5, 0] } : { y: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="relative z-10 flex"
            >
                {text.split('').map((char, index) => (
                    <Letter
                        key={index}
                        char={char}
                        hasGrown={hasGrown}
                        minScale={minScale}
                        maxScale={maxScale}
                        duration={duration}
                        index={index}
                        hoveredIndex={hoveredIndex}
                        setHoveredIndex={setHoveredIndex}
                        neighborRange={neighborRange}
                        className={className}
                    />
                ))}
            </motion.div>

            {showHint && (
                <div className="absolute bottom-8 left-0 right-0 text-center text-foreground/40 text-xs tracking-[0.2em] font-light uppercase">
                    Hover to retract
                </div>
            )}
        </div>
    );
};

interface LetterProps {
    char: string;
    hasGrown: boolean;
    minScale: number;
    maxScale: number;
    duration: number;
    index: number;
    hoveredIndex: number | null;
    setHoveredIndex: (index: number | null) => void;
    neighborRange: number;
    className?: string; // Add className here
}

const Letter: React.FC<LetterProps> = ({
    char,
    hasGrown,
    minScale,
    maxScale,
    duration,
    index,
    hoveredIndex,
    setHoveredIndex,
    neighborRange,
    className
}) => {

    // Calculate scale based on distance from hovered index
    let targetScale = maxScale;

    if (!hasGrown) {
        targetScale = minScale;
    } else if (hoveredIndex !== null) {
        const distance = Math.abs(hoveredIndex - index);

        if (distance === 0) {
            targetScale = minScale;
        } else if (distance <= neighborRange) {
            // Smooth falloff for neighbors
            const progress = distance / (neighborRange + 1);
            targetScale = minScale + (maxScale - minScale) * progress;
        } else {
            targetScale = maxScale;
        }
    }

    // Use spring for smooth fluidity
    // Initial growth uses a different spring config than the hover effect
    const springConfig = !hasGrown
        ? { stiffness: 40, damping: 20, mass: 2 }  // Slow, heavy growth
        : { stiffness: 200, damping: 25, mass: 0.5 }; // Snappy, fluid hover

    const scaleY = useSpring(minScale, springConfig);

    useEffect(() => {
        scaleY.set(targetScale);
    }, [targetScale, scaleY]);

    return (
        <motion.div
            initial={{
                opacity: 0,
                filter: "blur(20px)",
            }}
            animate={{
                opacity: 1,
                filter: "blur(0px)",
            }}
            transition={{
                duration: 0.8,
                ease: "easeOut",
                delay: index * 0.05
            }}
            className="relative cursor-pointer select-none mx-[-0.02em]"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
        >
            <motion.span
                className={`fluid-font leading-[0.8] block text-foreground ${className || 'text-[5rem] md:text-[8rem] lg:text-[11rem]'}`}
                style={{
                    scaleY: scaleY,
                    transformOrigin: "50% 0%", // Top center
                    willChange: "transform",
                    display: "block"
                }}
            >
                {char}
            </motion.span>
        </motion.div>
    );
};

export default FluidHeight;
