"use client";

import React, { useRef, useState, useEffect } from 'react';
import {
    motion,
    useScroll,
    useTransform,
    useSpring,
    useMotionValue,
    useVelocity,
    useAnimationFrame,
    AnimatePresence,
} from 'framer-motion';

// Hook to get responsive config values
function useResponsiveConfig(baseConfig: ClothTickerConfig) {
    // Serialize baseConfig for stable comparison
    const baseConfigString = JSON.stringify(baseConfig);

    const [config, setConfig] = useState(() => {
        // SSR-safe initial state
        if (typeof window === 'undefined') return baseConfig;

        const width = window.innerWidth;
        if (width < 480) {
            return {
                ...baseConfig,
                fontSize: '2rem',
                imageSize: { width: 150, height: 200 },
                gap: 15,
                parallaxStrength: 10,
            };
        } else if (width < 768) {
            return {
                ...baseConfig,
                fontSize: '3rem',
                imageSize: { width: 200, height: 260 },
                gap: 20,
                parallaxStrength: 15,
            };
        } else if (width < 1024) {
            return {
                ...baseConfig,
                fontSize: '6rem',
                imageSize: { width: 250, height: 180 }, // Adjusted for tablet
                gap: 35,
                parallaxStrength: 20,
            };
        }
        return baseConfig;
    });

    useEffect(() => {
        const parsedBaseConfig = JSON.parse(baseConfigString) as ClothTickerConfig;

        const updateConfig = () => {
            const width = window.innerWidth;

            if (width < 480) {
                // Mobile small
                setConfig({
                    ...parsedBaseConfig,
                    fontSize: '2rem',
                    imageSize: { width: 150, height: 200 },
                    gap: 15,
                    parallaxStrength: 10,
                });
            } else if (width < 768) {
                // Mobile
                setConfig({
                    ...parsedBaseConfig,
                    fontSize: '3rem',
                    imageSize: { width: 200, height: 260 },
                    gap: 20,
                    parallaxStrength: 15,
                });
            } else if (width < 1024) {
                // Tablet
                setConfig({
                    ...parsedBaseConfig,
                    fontSize: '6rem',
                    imageSize: { width: 250, height: 180 }, // Adjusted for tablet
                    gap: 35,
                    parallaxStrength: 20,
                });
            } else {
                // Desktop - use full config
                setConfig(parsedBaseConfig);
            }
        };

        updateConfig();
        window.addEventListener('resize', updateConfig);
        return () => window.removeEventListener('resize', updateConfig);
    }, [baseConfigString]);

    return config;
}

// ============================================
// TYPES & INTERFACES
// ============================================

export interface ClothTickerConfig {
    speed: number;
    imageSize: { width: number; height: number };
    fontSize: string;
    textColor: string;
    gap: number;
    parallaxStrength: number;
    hoverSlowdownFactor: number;
    rotationStrength: number;
}

export interface ClothTickerProps {
    words?: string[];
    images?: string[];
    config?: Partial<ClothTickerConfig>;
    className?: string;
}

// ============================================
// DEFAULT CONFIG
// ============================================

const defaultConfig: ClothTickerConfig = {
    speed: 0.08, // Faster scrolling
    imageSize: { width: 400, height: 266 }, // Reduced scale, landscape orientation
    fontSize: '14rem',
    textColor: 'var(--foreground)',
    gap: 60,
    parallaxStrength: 30, // How much the image moves with mouse
    hoverSlowdownFactor: 0.1, // Slow down to 10% speed on hover
    rotationStrength: 15, // Max rotation in degrees based on velocity
};

// Same names as LayeredImageShowcase
const defaultWords = [
    "QUANTUM", "CYBERNETICS", "NEBULA", "CHRONOS",
    "VELOCITY", "HORIZON", "ECLIPSE", "AURORA"
];

// Same images as LayeredImageShowcase
const defaultImages = [
    "/carousel1.png",
    "/carousel2.jpg",
    "/carousel3.jpg",
    "/carousel4.jpg",
    "/carousel5.jpg",
    "/carousel6.jpg",
    "/carousel7.jpg",
    "/carousel8.jpg",
];

// ============================================
// COMPONENT
// ============================================

export function ClothTicker({
    words = defaultWords,
    images = defaultImages,
    config: userConfig,
    className = "",
}: ClothTickerProps) {
    const mergedConfig = { ...defaultConfig, ...userConfig };

    // Use responsive config that adjusts based on screen size
    const config = useResponsiveConfig(mergedConfig);

    // Looping logic: duplicate words to ensure seamless scroll
    const displayWords = [...words, ...words, ...words, ...words];

    // Ticker State - hovering on any word
    const [isHoveringWord, setIsHoveringWord] = useState(false);
    const baseX = useMotionValue(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Track global mouse position for edge control
    const globalMouseX = useRef(0.5); // 0 = left edge, 1 = right edge

    const { scrollY } = useScroll();
    const scrollVelocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(scrollVelocity, {
        damping: 50,
        stiffness: 400
    });

    const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
        clamp: false
    });

    // Handle Infinite Loop
    const x = useTransform(baseX, (v) => `${v}%`);
    const directionFactor = useRef<number>(-1); // -1 for Right to Left

    // Track mouse position globally
    const handleContainerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        // Normalized 0 to 1 across container width
        globalMouseX.current = (e.clientX - rect.left) / rect.width;
    };

    useAnimationFrame((t, delta) => {
        // Slow down only if hovering on a word center
        let currentSpeed = isHoveringWord
            ? config.speed * config.hoverSlowdownFactor
            : config.speed;

        // Edge-based speed control
        // Right edge (> 0.8): speed up leftward movement (multiply by up to 2x)
        // Left edge (< 0.2): reverse direction to move right
        const edgeThreshold = 0.2;
        const mousePos = globalMouseX.current;

        let edgeMultiplier = 1;
        let direction = -1; // Default: move left

        if (mousePos > (1 - edgeThreshold)) {
            // Near right edge - speed up leftward
            const edgeFactor = (mousePos - (1 - edgeThreshold)) / edgeThreshold; // 0 to 1
            edgeMultiplier = 1 + edgeFactor * 2.5; // Up to 3.5x speed
            direction = -1;
        } else if (mousePos < edgeThreshold) {
            // Near left edge - move rightward
            const edgeFactor = (edgeThreshold - mousePos) / edgeThreshold; // 0 to 1
            edgeMultiplier = 1 + edgeFactor * 2.5; // Up to 3.5x speed
            direction = 1; // Reverse direction
        }

        // Movement is percentage-based
        let moveBy = direction * currentSpeed * edgeMultiplier * delta * 0.001;

        // Add scroll velocity influence
        if (velocityFactor.get() !== 0) {
            moveBy += velocityFactor.get() * moveBy;
        }

        baseX.set(baseX.get() + moveBy);

        // Reset loop - handles both directions
        if (baseX.get() <= -33.33) {
            baseX.set(0);
        } else if (baseX.get() >= 0) {
            baseX.set(-33.33 + 0.01);
        }
    });

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-full overflow-hidden flex items-center justify-center bg-transparent ${className}`}
            style={{
                perspective: '1000px',
            }}
            onMouseMove={handleContainerMouseMove}
        >
            {/* Big Shoulders Display is loaded via Google Fonts in the project */}

            {/* Custom Cursor Hint (Optional) */}
            {/* <div className="pointer-events-none fixed z-50 mix-blend-difference text-white text-xs uppercase tracking-widest" style={{ left: mouseX, top: mouseY }}>View</div> */}

            <motion.div
                className="flex whitespace-nowrap"
                style={{ x }}
            >
                {displayWords.map((word, i) => (
                    <TickerItem
                        key={i}
                        word={word}
                        image={images[i % images.length]}
                        config={config}
                        onHoverChange={setIsHoveringWord}
                    />
                ))}
            </motion.div>
        </div>
    );
}

// Valid CSS position types
type PositionType = 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';

function TickerItem({ word, image, config, onHoverChange }: {
    word: string;
    image: string;
    config: ClothTickerConfig;
    onHoverChange?: (hovering: boolean) => void;
}) {
    const [isItemHovering, setIsItemHovering] = useState(false);

    // Mouse tracking for parallax
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth mouse falloff for the parallax
    const springConfig = { damping: 20, stiffness: 200 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    // Calculate parallax translation (move image with cursor)
    const rawParallaxX = useTransform(springX, [-0.5, 0.5], [-config.parallaxStrength, config.parallaxStrength]);
    const rawParallaxY = useTransform(springY, [-0.5, 0.5], [-config.parallaxStrength, config.parallaxStrength]);

    // Combined transform for centering + parallax
    const x = useTransform(rawParallaxX, (v) => `calc(-50% + ${v}px)`);
    const y = useTransform(rawParallaxY, (v) => `calc(-50% + ${v}px)`);

    // Calculate 3D rotation for depth effect
    const rotateX = useTransform(springY, [-0.5, 0.5], [config.rotationStrength, -config.rotationStrength]);
    const rotateY = useTransform(springX, [-0.5, 0.5], [-config.rotationStrength, config.rotationStrength]);

    // Velocity-based tilt (Mouse velocity)
    const mouseVelocityX = useVelocity(springX);
    const tilt = useTransform(mouseVelocityX, [-2, 2], [-5, 5]);

    function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        const rect = e.currentTarget.getBoundingClientRect();
        // Normalized coordinates -0.5 to 0.5 relative to the word center
        const xPct = (e.clientX - rect.left) / rect.width - 0.5;
        const yPct = (e.clientY - rect.top) / rect.height - 0.5;

        mouseX.set(xPct);
        mouseY.set(yPct);

        // Only trigger hover when cursor is in center zone (within 25% from center)
        const distanceFromCenter = Math.sqrt(xPct * xPct + yPct * yPct);
        const centerThreshold = 0.25; // 25% from center

        if (distanceFromCenter <= centerThreshold) {
            if (!isItemHovering) {
                setIsItemHovering(true);
                onHoverChange?.(true);
            }
        } else {
            if (isItemHovering) {
                setIsItemHovering(false);
                onHoverChange?.(false);
            }
        }
    }

    function handleMouseLeave() {
        setIsItemHovering(false);
        onHoverChange?.(false);
        mouseX.set(0);
        mouseY.set(0);
    }

    return (
        <motion.div
            className="relative flex items-center justify-center cursor-pointer"
            style={{
                marginRight: `${config.gap}px`,
                padding: '5px',
            }}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
        >
            {/* The Text - wrapped in stable container */}
            <div style={{ display: 'inline-block' }}>
                <h2
                    className="transition-all duration-300 pointer-events-none select-none whitespace-nowrap"
                    style={{
                        fontFamily: 'Big Shoulders Display, sans-serif',
                        fontSize: config.fontSize,
                        fontVariationSettings: isItemHovering ? "'wght' 100" : "'wght' 900",
                        letterSpacing: '0.00em',
                        color: isItemHovering ? 'transparent' : config.textColor,
                        WebkitTextStrokeWidth: isItemHovering ? '2px' : '0px',
                        WebkitTextStrokeColor: config.textColor,
                    }}
                >
                    {word}
                </h2>
            </div>

            {/* The Cloth Reveal Image - with direct parallax */}
            <AnimatePresence>
                {isItemHovering && (
                    <motion.div
                        className="absolute z-20 pointer-events-none"
                        style={{
                            width: config.imageSize.width, // Fixed width from config
                            height: 'auto', // Auto height based on aspect ratio
                            position: 'absolute' as PositionType,
                            left: '50%',
                            top: '50%',
                            // Direct parallax translation with centering
                            x,
                            y,
                            // 3D transforms
                            rotateX,
                            rotateY,
                            rotateZ: tilt,
                            transformStyle: 'preserve-3d',
                        }}
                        initial={{
                            opacity: 0,
                            scale: 0,
                            clipPath: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)', // Start as a dot
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', // Unfold to full rect
                            transition: {
                                type: 'spring',
                                mass: 0.5,
                                stiffness: 100,
                                damping: 15
                            }
                        }}
                        exit={{
                            opacity: 0,
                            scale: 0.5,
                            clipPath: 'polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%)', // Close like a book or curtain
                            transition: { duration: 0.2 }
                        }}
                    >
                        <img
                            src={image}
                            alt={word}
                            className="w-full h-auto block"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// Preview component for the components list page
export function ClothTickerPreview() {
    return (
        <div className="w-full h-full flex items-center justify-center overflow-hidden relative">
            <ClothTicker
                words={["QUANTUM", "NEBULA", "VELOCITY"]}
                config={{
                    speed: 0.04,
                    fontSize: '2.5rem',
                    gap: 5,
                    imageSize: { width: 60, height: 80 },
                    parallaxStrength: 10,
                    hoverSlowdownFactor: 0.3,
                }}
            />
        </div>
    );
}
