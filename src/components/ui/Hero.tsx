"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, useSpring, type Variants } from "framer-motion";
import { TextGenerateEffect } from "./TextGenerateEffect";
import { DragHint } from "./DragHint";
import { ScrollIndicator } from "./ScrollIndicator";

// Global registry to track all letters for impact propagation
const letterRegistry = new Map<string, {
    triggerImpact: (intensity: number, direction: { x: number; y: number }) => void;
    getPosition: () => { x: number; y: number; width: number; height: number } | null;
    wordIndex: number;
    letterIndex: number;
}>();

// Generate unique key for letter
const getLetterKey = (wordIndex: number, letterIndex: number) => `${wordIndex}-${letterIndex}`;

// Emit global event when a letter is dragged
const emitLetterDragged = () => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('letterDragged'));
    }
};

// Component for each animated letter with drag capability
const DraggableLetter = ({
    letter,
    delay,
    letterIndex,
    wordIndex,
    totalLettersInPreviousWords,
}: {
    letter: string;
    delay: number;
    letterIndex: number;
    wordIndex: number;
    totalLettersInPreviousWords: number;
}) => {
    const letterRef = useRef<HTMLSpanElement>(null);
    const [baseWeight, setBaseWeight] = useState(200);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [waveWeight, setWaveWeight] = useState(200);
    const [isWaveActive, setIsWaveActive] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Track drag position manually for impact calculation
    const dragPosition = useRef({ x: 0, y: 0 });

    // Smooth but satisfying snap-back spring
    const springX = useSpring(0, { stiffness: 400, damping: 20, mass: 0.8 });
    const springY = useSpring(0, { stiffness: 400, damping: 20, mass: 0.8 });



    // Impact springs that read from state
    const impactX = useSpring(0, { stiffness: 300, damping: 8, mass: 0.5 });
    const impactY = useSpring(0, { stiffness: 300, damping: 8, mass: 0.5 });
    const impactScale = useSpring(1, { stiffness: 400, damping: 10, mass: 0.4 });
    const impactRotate = useSpring(0, { stiffness: 250, damping: 8, mass: 0.5 });

    // Wave animation timing
    const WAVE_EXPAND_DURATION = 250;
    const WAVE_HOLD_DURATION = 0;
    const WAVE_CONTRACT_DURATION = 250;
    const WAVE_LETTER_DELAY = 60;

    // Ref to hold the latest trigger function
    const triggerImpactRef = useRef<((intensity: number, direction: { x: number; y: number }) => void) | undefined>(undefined);

    // Update trigger function ref
    useEffect(() => {
        triggerImpactRef.current = (intensity: number, direction: { x: number; y: number }) => {
            // Ensure minimum visible effect
            const effectiveIntensity = Math.max(intensity, 0.4);

            // Elastic, bouncy impact effect
            const maxDisplacement = 35 * effectiveIntensity;
            const maxRotation = 20 * effectiveIntensity;
            const scaleAmount = 1 + (0.3 * effectiveIntensity);

            // Push in the direction of impact
            impactX.set(direction.x * maxDisplacement);
            impactY.set(direction.y * maxDisplacement);
            impactScale.set(scaleAmount);
            impactRotate.set((Math.random() > 0.5 ? 1 : -1) * maxRotation);

            // Let springs naturally bounce back
            setTimeout(() => {
                impactX.set(0);
                impactY.set(0);
                impactScale.set(1);
                impactRotate.set(0);
            }, 150);
        };
    }, [impactX, impactY, impactScale, impactRotate]);

    // Register this letter in the global registry
    useEffect(() => {
        const key = getLetterKey(wordIndex, letterIndex);

        const triggerImpact = (intensity: number, direction: { x: number; y: number }) => {
            // Call the ref function which always has latest springs
            if (triggerImpactRef.current) {
                triggerImpactRef.current(intensity, direction);
            }
        };

        const getPosition = () => {
            if (!letterRef.current) return null;
            const rect = letterRef.current.getBoundingClientRect();
            return {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
                width: rect.width,
                height: rect.height,
            };
        };

        letterRegistry.set(key, { triggerImpact, getPosition, wordIndex, letterIndex });

        return () => {
            letterRegistry.delete(key);
        };
    }, [wordIndex, letterIndex]);

    // Wave animation effect
    useEffect(() => {
        const globalLetterIndex = totalLettersInPreviousWords + letterIndex;
        const waveStartTime = delay + 200 + (globalLetterIndex * WAVE_LETTER_DELAY);

        const waveStartTimeout = setTimeout(() => {
            setIsWaveActive(true);
            setWaveWeight(700);

            setTimeout(() => {
                setWaveWeight(200);

                setTimeout(() => {
                    setIsWaveActive(false);
                }, WAVE_CONTRACT_DURATION);
            }, WAVE_EXPAND_DURATION + WAVE_HOLD_DURATION);
        }, waveStartTime);

        const totalLetters = 12;
        const totalWaveDuration = delay + 200 + (totalLetters * WAVE_LETTER_DELAY) +
            WAVE_EXPAND_DURATION + WAVE_HOLD_DURATION + WAVE_CONTRACT_DURATION + 500;

        const randomStartDelay = setTimeout(() => {
            setIsAnimating(true);
        }, totalWaveDuration);

        return () => {
            clearTimeout(waveStartTimeout);
            clearTimeout(randomStartDelay);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [delay, letterIndex, totalLettersInPreviousWords]);

    // Random weight animation
    useEffect(() => {
        if (!isAnimating) return;

        const animateLetter = () => {
            setIsExpanded(prev => {
                const nextState = !prev;
                setBaseWeight(nextState ? 700 : 200);
                return nextState;
            });

            const nextInterval = Math.floor(Math.random() * 2500) + 1500;
            timeoutRef.current = setTimeout(animateLetter, nextInterval);
        };

        const initialDelay = Math.floor(Math.random() * 1500) + 500;
        timeoutRef.current = setTimeout(animateLetter, initialDelay);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [isAnimating]);

    // Propagate impact to neighbor letters
    const propagateImpact = useCallback(() => {
        const currentPos = letterRef.current?.getBoundingClientRect();
        if (!currentPos) return;

        const currentCenterX = currentPos.left + currentPos.width / 2;
        const currentCenterY = currentPos.top + currentPos.height / 2;

        // Calculate intensity based on drag distance - lower threshold
        const dragDist = Math.sqrt(dragPosition.current.x ** 2 + dragPosition.current.y ** 2);
        const maxDragDistance = 100;
        const baseIntensity = Math.min(dragDist / maxDragDistance, 1);

        // Lower threshold - trigger impact even with small drags
        if (dragDist < 5) return; // Only skip if barely moved at all

        // Impact neighbor letters
        letterRegistry.forEach((letterData, key) => {
            const currentKey = getLetterKey(wordIndex, letterIndex);
            if (key === currentKey) return; // Skip self

            const neighborPos = letterData.getPosition();
            if (!neighborPos) return;

            // Calculate distance between letter centers
            const dx = neighborPos.x - currentCenterX;
            const dy = neighborPos.y - currentCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Calculate horizontal and vertical distances
            const horizontalDistance = Math.abs(dx);

            // Same word neighbors: check by letter index (within 2 letters)
            const isSameWord = letterData.wordIndex === wordIndex;
            const letterDiff = Math.abs(letterData.letterIndex - letterIndex);
            const isSameWordNeighbor = isSameWord && letterDiff <= 2;

            // Cross-word neighbors: different word AND horizontally aligned
            const isCrossWordNeighbor = letterData.wordIndex !== wordIndex && horizontalDistance < currentPos.width * 2.5;

            const isNeighbor = isSameWordNeighbor || isCrossWordNeighbor;

            if (isNeighbor && distance > 0) {
                // Intensity based on distance - ensure minimum effect
                const maxNeighborDistance = currentPos.width * 3;
                const distanceFactor = Math.max(0.3, 1 - (distance / maxNeighborDistance));

                // Boost for cross-word
                const crossWordBoost = letterData.wordIndex !== wordIndex ? 1.2 : 1;
                const intensity = Math.max(0.5, baseIntensity * distanceFactor * crossWordBoost);

                // Direction of impact
                const dirX = dx / distance;
                const dirY = dy / distance;

                // Small stagger for wave effect
                const staggerDelay = Math.min(distance * 0.15, 50);

                setTimeout(() => {
                    letterData.triggerImpact(Math.min(intensity, 1), { x: dirX, y: dirY });
                }, staggerDelay);
            }
        });
    }, [wordIndex, letterIndex]);

    // Handle drag
    const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number; y: number } }) => {
        dragPosition.current = { x: info.offset.x, y: info.offset.y };
        springX.set(info.offset.x);
        springY.set(info.offset.y);
    };

    // Handle drag end
    const handleDragEnd = () => {
        // Trigger impact BEFORE snapping back
        propagateImpact();

        // Snap back to origin
        springX.set(0);
        springY.set(0);

        // Self bounce effect
        impactScale.set(1.2);
        setTimeout(() => {
            impactScale.set(1);
        }, 80);

        setIsDragging(false);
        dragPosition.current = { x: 0, y: 0 };
    };

    // Priority order: hover > dragging > wave animation > random animation
    let displayWeight = baseWeight;
    if (isWaveActive) {
        displayWeight = waveWeight;
    }
    if (isDragging) {
        displayWeight = 700;
    }
    if (isHovered && !isDragging) {
        displayWeight = 700;
    }

    return (
        <motion.span
            ref={letterRef}
            className="heading-letter"
            style={{
                fontVariationSettings: `'wght' ${displayWeight}`,
                x: springX,
                y: springY,
                scale: impactScale,
                rotate: impactRotate,
                translateX: impactX,
                translateY: impactY,
                cursor: 'grab',
                display: 'inline-block',
                touchAction: 'none',
                userSelect: 'none',
                position: 'relative',
                zIndex: isDragging ? 50 : 1,
                transition: isWaveActive
                    ? `font-variation-settings ${WAVE_EXPAND_DURATION}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`
                    : 'font-variation-settings 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                willChange: 'transform, font-variation-settings',
            }}
            drag
            dragMomentum={false}
            dragElastic={0}
            onDrag={handleDrag}
            onDragStart={() => { setIsDragging(true); emitLetterDragged(); }}
            onDragEnd={handleDragEnd}
            onMouseEnter={() => !isDragging && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileDrag={{ cursor: 'grabbing', scale: 1.1 }}
        >
            {letter}
        </motion.span>
    );
};

const Hero = () => {
    const words = ["CURATED", "CHAOS"];

    const containerVariants: Variants = {
        hidden: { opacity: 1 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.4,
                delayChildren: 0.8,
            },
        },
    };

    const wordVariants: Variants = {
        hidden: {
            opacity: 0,
            filter: "blur(20px)",
            y: 20,
        },
        visible: {
            opacity: 1,
            filter: "blur(0px)",
            y: 0,
            transition: {
                duration: 0.8,
                ease: [0.25, 0.46, 0.45, 0.94],
            },
        },
    };

    const getLetterDelay = (wordIndex: number) => {
        return 200 + (wordIndex * 400) + 800;
    };

    const getTotalLettersInPreviousWords = (wordIndex: number) => {
        let total = 0;
        for (let i = 0; i < wordIndex; i++) {
            total += words[i].length;
        }
        return total;
    };

    return (
        <section className="relative flex flex-col items-center justify-center min-h-screen px-4 pt-16">
            {/* Progressive Side Blurs */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5, delay: 0.5 }}
                className="absolute top-0 bottom-0 left-0 w-[12%] z-20 pointer-events-none"
                style={{
                    background: "var(--background)",
                    maskImage: "linear-gradient(to right, black, transparent)",
                    WebkitMaskImage: "linear-gradient(to right, black, transparent)",
                    backdropFilter: "blur(5px)",
                    WebkitBackdropFilter: "blur(5px)",
                }}
            />
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5, delay: 0.5 }}
                className="absolute top-0 bottom-0 right-0 w-[12%] z-20 pointer-events-none"
                style={{
                    background: "var(--background)",
                    maskImage: "linear-gradient(to left, black, transparent)",
                    WebkitMaskImage: "linear-gradient(to left, black, transparent)",
                    backdropFilter: "blur(5px)",
                    WebkitBackdropFilter: "blur(5px)",
                }}
            />

            {/* Heading Container with relative positioning for DragHint */}
            <div className="relative">
                {/* Drag Hint Pill - positioned absolutely above heading */}
                <DragHint />

                {/* Main Heading */}
                <motion.h1
                    className="flex flex-col items-center justify-center text-center"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {words.map((word, wordIndex) => (
                        <motion.span
                            key={wordIndex}
                            variants={wordVariants}
                            className="flex text-6xl sm:text-8xl md:text-9xl lg:text-[12rem] xl:text-[14rem] tracking-wider text-foreground leading-[0.85]"
                        >
                            {word.split("").map((letter, letterIndex) => (
                                <DraggableLetter
                                    key={letterIndex}
                                    letter={letter}
                                    delay={getLetterDelay(wordIndex)}
                                    letterIndex={letterIndex}
                                    wordIndex={wordIndex}
                                    totalLettersInPreviousWords={getTotalLettersInPreviousWords(wordIndex)}
                                />
                            ))}
                        </motion.span>
                    ))}
                </motion.h1>
            </div>

            {/* Description */}
            <TextGenerateEffect
                words="The art of organized chaos in UI."
                className="text-lg md:text-xl mt-6 max-w-md text-center"
                delay={2.0}
            />

            {/* Scroll Indicator */}
            <ScrollIndicator />
        </section>
    );
};

export { Hero };
