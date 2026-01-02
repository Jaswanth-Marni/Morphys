"use client";

import { motion, useAnimation, Variants } from "framer-motion";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";

// ============================================
// TYPES & INTERFACES
// ============================================

export type GridPattern =
    | 'wave'
    | 'cascade'
    | 'random'
    | 'spiral'
    | 'checkerboard'
    | 'horizontal'
    | 'vertical'
    | 'explode'
    | 'implode';

export type EasingType =
    | 'smooth'
    | 'spring'
    | 'bounce'
    | 'elastic';

export type SpeedType = 'slow' | 'normal' | 'fast' | 'instant';

export interface FlipGridConfig {
    cols: number;
    rows: number;
    pattern: GridPattern;
    easing: EasingType;
    speed: SpeedType;
    colorFront: string;
    colorBack: string;
    interactive: boolean;
    gap: number;
    borderRadius: number;
}

export interface FlipGridProps {
    config?: Partial<FlipGridConfig>;
    className?: string;
    onFlipComplete?: () => void;
    imageData?: boolean[][]; // For image-to-grid conversion
    autoPlay?: boolean;
    autoPlayInterval?: number;
}

// ============================================
// DEFAULT CONFIG
// ============================================

const defaultConfig: FlipGridConfig = {
    cols: 10,
    rows: 8,
    pattern: 'wave',
    easing: 'spring',
    speed: 'normal',
    colorFront: 'var(--foreground)',
    colorBack: 'var(--background)',
    interactive: true,
    gap: 2,
    borderRadius: 2,
};

// ============================================
// SPEED MAPPINGS
// ============================================

const speedMap: Record<SpeedType, { duration: number; stagger: number }> = {
    slow: { duration: 0.8, stagger: 0.08 },
    normal: { duration: 0.5, stagger: 0.04 },
    fast: { duration: 0.3, stagger: 0.02 },
    instant: { duration: 0.15, stagger: 0.005 },
};

// ============================================
// EASING MAPPINGS
// ============================================

const easingMap: Record<EasingType, Variants['flip']> = {
    smooth: {
        rotateY: [0, 180],
        transition: { ease: [0.25, 0.46, 0.45, 0.94] }
    },
    spring: {
        rotateY: [0, 180],
        transition: { type: "spring", stiffness: 300, damping: 20 }
    },
    bounce: {
        rotateY: [0, 180],
        transition: { type: "spring", stiffness: 500, damping: 15 }
    },
    elastic: {
        rotateY: [0, 180],
        transition: { type: "spring", stiffness: 200, damping: 10 }
    },
};

// ============================================
// PATTERN DELAY CALCULATORS
// ============================================

function getPatternDelay(
    index: number,
    row: number,
    col: number,
    totalRows: number,
    totalCols: number,
    pattern: GridPattern,
    stagger: number
): number {
    const total = totalRows * totalCols;
    const centerRow = totalRows / 2;
    const centerCol = totalCols / 2;

    switch (pattern) {
        case 'wave':
            return (row + col) * stagger;

        case 'cascade':
            return index * stagger;

        case 'random':
            return Math.random() * stagger * total * 0.3;

        case 'spiral': {
            const distFromCenter = Math.sqrt(
                Math.pow(row - centerRow, 2) + Math.pow(col - centerCol, 2)
            );
            return distFromCenter * stagger * 2;
        }

        case 'checkerboard':
            return ((row + col) % 2) * stagger * 5;

        case 'horizontal':
            return col * stagger;

        case 'vertical':
            return row * stagger;

        case 'explode': {
            const distFromCenterExplode = Math.sqrt(
                Math.pow(row - centerRow, 2) + Math.pow(col - centerCol, 2)
            );
            return distFromCenterExplode * stagger * 1.5;
        }

        case 'implode': {
            const maxDist = Math.sqrt(
                Math.pow(totalRows / 2, 2) + Math.pow(totalCols / 2, 2)
            );
            const distFromCenterImplode = Math.sqrt(
                Math.pow(row - centerRow, 2) + Math.pow(col - centerCol, 2)
            );
            return (maxDist - distFromCenterImplode) * stagger * 1.5;
        }

        default:
            return index * stagger;
    }
}

// ============================================
// SINGLE CARD COMPONENT
// ============================================

interface FlipCardProps {
    isFlipped: boolean;
    delay: number;
    config: FlipGridConfig;
    onClick?: () => void;
    index: number;
}

function FlipCard({ isFlipped, delay, config, onClick, index }: FlipCardProps) {
    const controls = useAnimation();

    useEffect(() => {
        controls.start({
            rotateY: isFlipped ? 180 : 0,
            transition: {
                delay,
                duration: speedMap[config.speed].duration,
                ...(config.easing === 'spring' || config.easing === 'bounce' || config.easing === 'elastic'
                    ? { type: "spring", stiffness: config.easing === 'bounce' ? 500 : 300, damping: config.easing === 'elastic' ? 10 : 20 }
                    : { ease: [0.25, 0.46, 0.45, 0.94] }
                ),
            },
        });
    }, [isFlipped, delay, config.speed, config.easing, controls]);

    return (
        <motion.div
            className="relative w-full h-full cursor-pointer"
            style={{
                perspective: '400px',
                transformStyle: 'preserve-3d',
            }}
            onClick={config.interactive ? onClick : undefined}
            whileHover={config.interactive ? { scale: 1.1, zIndex: 10 } : undefined}
        >
            <motion.div
                animate={controls}
                initial={{ rotateY: 0 }}
                style={{
                    width: '100%',
                    height: '100%',
                    transformStyle: 'preserve-3d',
                    position: 'relative',
                }}
            >
                {/* Front Face */}
                <div
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backfaceVisibility: 'hidden',
                        backgroundColor: config.colorFront,
                        borderRadius: config.borderRadius,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.5rem',
                        color: config.colorBack,
                        fontWeight: 'bold',
                    }}
                >
                    {/* Optional: Show 0 or index */}
                </div>

                {/* Back Face */}
                <div
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backfaceVisibility: 'hidden',
                        backgroundColor: config.colorBack,
                        borderRadius: config.borderRadius,
                        transform: 'rotateY(180deg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.5rem',
                        color: config.colorFront,
                        fontWeight: 'bold',
                        border: `1px solid ${config.colorFront}20`,
                    }}
                >
                    {/* Optional: Show 1 or different content */}
                </div>
            </motion.div>
        </motion.div>
    );
}

// ============================================
// MAIN FLIP GRID COMPONENT
// ============================================

export function FlipGrid({
    config: userConfig,
    className = '',
    onFlipComplete,
    imageData,
    autoPlay = true,
    autoPlayInterval = 3000,
}: FlipGridProps) {
    const config = useMemo(() => ({ ...defaultConfig, ...userConfig }), [userConfig]);
    const totalCards = config.cols * config.rows;

    // Unique key for this grid configuration
    const gridKey = `${config.cols}-${config.rows}`;

    // Simple toggle state - all cards flip together
    const [isFlipped, setIsFlipped] = useState(false);

    // Track if component is mounted
    const isMounted = useRef(true);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Reset when grid size changes
    useEffect(() => {
        setIsFlipped(false);
    }, [config.cols, config.rows]);

    // Calculate adaptive stagger based on grid size
    // For larger grids, we need smaller stagger to fit animation in reasonable time
    const adaptiveStagger = useMemo(() => {
        const baseStagger = speedMap[config.speed].stagger;
        // Scale stagger so total animation time is roughly constant regardless of grid size
        // Target: animation should complete in ~2-3 seconds max
        const targetTotalTime = 2.5; // seconds
        const maxDelay = totalCards * baseStagger;

        if (maxDelay > targetTotalTime) {
            return targetTotalTime / totalCards;
        }
        return baseStagger;
    }, [config.speed, totalCards]);

    // Calculate delays for all cards based on current pattern
    const delays = useMemo(() => {
        return Array.from({ length: totalCards }, (_, i) => {
            const row = Math.floor(i / config.cols);
            const col = i % config.cols;
            return getPatternDelay(i, row, col, config.rows, config.cols, config.pattern, adaptiveStagger);
        });
    }, [config.cols, config.rows, config.pattern, adaptiveStagger, totalCards]);

    // Calculate max delay for proper interval timing
    const maxDelay = useMemo(() => Math.max(...delays, 0), [delays]);
    const animationDuration = speedMap[config.speed].duration;

    // Apply image data if provided (creates per-card state)
    const [imageStates, setImageStates] = useState<boolean[] | null>(null);

    useEffect(() => {
        if (imageData) {
            const states = new Array(totalCards).fill(false);
            for (let row = 0; row < Math.min(imageData.length, config.rows); row++) {
                for (let col = 0; col < Math.min(imageData[row]?.length || 0, config.cols); col++) {
                    states[row * config.cols + col] = imageData[row][col];
                }
            }
            setImageStates(states);
        } else {
            setImageStates(null);
        }
    }, [imageData, totalCards, config.rows, config.cols]);

    // Auto-play animation - waits for animation to complete before toggling
    useEffect(() => {
        if (!autoPlay || imageData) return;

        // Clear any existing interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        // Time needed for full animation to complete (in ms)
        const fullAnimationTime = (maxDelay + animationDuration) * 1000 + 300;

        // Use the longer of autoPlayInterval or animation completion time
        const effectiveInterval = Math.max(autoPlayInterval, fullAnimationTime);

        // Start new interval
        intervalRef.current = setInterval(() => {
            if (isMounted.current) {
                setIsFlipped(prev => !prev);
            }
        }, effectiveInterval);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [autoPlay, autoPlayInterval, imageData, config.cols, config.rows, maxDelay, animationDuration]);

    // Cleanup on unmount
    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    // Per-card interactive state
    const [clickedCards, setClickedCards] = useState<Set<number>>(new Set());

    // Reset clicked cards when grid changes
    useEffect(() => {
        setClickedCards(new Set());
    }, [config.cols, config.rows]);

    // Handle individual card click (toggles that specific card)
    const handleCardClick = useCallback((index: number) => {
        if (!config.interactive) return;

        setClickedCards(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    }, [config.interactive]);

    // Determine if a card should be flipped
    const getCardFlipped = useCallback((index: number): boolean => {
        // If using image data, use those states
        if (imageStates) {
            return imageStates[index] ?? false;
        }
        // If card was clicked, XOR with base state
        const wasClicked = clickedCards.has(index);
        return wasClicked ? !isFlipped : isFlipped;
    }, [imageStates, clickedCards, isFlipped]);

    return (
        <div
            key={gridKey}
            className={`w-full h-full ${className}`}
            style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${config.cols}, 1fr)`,
                gridTemplateRows: `repeat(${config.rows}, 1fr)`,
                gap: config.gap,
                padding: config.gap,
            }}
        >
            {Array.from({ length: totalCards }, (_, i) => (
                <FlipCard
                    key={`${gridKey}-${i}`}
                    index={i}
                    isFlipped={getCardFlipped(i)}
                    delay={delays[i] ?? 0}
                    config={config}
                    onClick={() => handleCardClick(i)}
                />
            ))}
        </div>
    );
}

// ============================================
// PREVIEW COMPONENT (For Component Card)
// ============================================

export function FlipGridPreview() {
    return (
        <FlipGrid
            config={{
                cols: 8,
                rows: 6,
                pattern: 'wave',
                easing: 'spring',
                speed: 'normal',
                interactive: false,
                gap: 2,
                borderRadius: 2,
            }}
            autoPlay={true}
            autoPlayInterval={2500}
        />
    );
}

export default FlipGrid;
