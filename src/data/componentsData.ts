// Lightweight component data - NO fullCode included
// This file is ~7KB vs ~148KB for the full componentsData.ts
// fullCode is lazy-loaded separately when needed

export interface ComponentDataLite {
    id: string;
    name: string;
    index: number;
    description: string;
    tags: string[];
    category: 'animation' | 'interaction' | 'layout' | 'effect';
    previewConfig?: Record<string, unknown>;
    usage: string;
    dependencies: string[];
    props: {
        name: string;
        type: string;
        default: string;
        description: string;
    }[];
    fullCode?: string;
}

export const componentsData: any[] = [
    {
        id: 'flip-grid',
        name: 'Flip Grid',
        index: 1,
        description: 'A grid of flipping cards that create pixel-art style animations. Perfect for image reveals, text displays, and dynamic backgrounds.',
        tags: ['animation', 'grid', 'pixel', 'flip', 'retro', '8-bit'],
        category: 'animation',
        previewConfig: {
            gridSize: { cols: 8, rows: 6 },
            pattern: 'wave',
            speed: 'normal'
        },
        dependencies: ['framer-motion', 'react'],
        usage: `import { FlipGrid } from '@/components/ui';

// Basic usage
<FlipGrid />

// With custom configuration
<FlipGrid
    config={{
        cols: 12,
        rows: 8,
        pattern: 'wave',
        easing: 'spring',
        speed: 'normal',
        colorFront: '#ffffff',
        colorBack: '#000000',
        interactive: true,
    }}
    autoPlay={true}
    autoPlayInterval={3000}
/>`,
        props: [
            { name: 'config', type: 'Partial<FlipGridConfig>', default: '{}', description: 'Configuration object for grid appearance and behavior' },
            { name: 'autoPlay', type: 'boolean', default: 'true', description: 'Enable automatic pattern cycling' },
            { name: 'autoPlayInterval', type: 'number', default: '3000', description: 'Interval between pattern changes (ms)' },
            { name: 'imageData', type: 'boolean[][]', default: 'undefined', description: '2D array for custom flip patterns' },
            { name: 'onFlipComplete', type: '() => void', default: 'undefined', description: 'Callback when flip animation completes' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes for the grid container' },
        ],
        fullCode: `
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
                        border: \`1px solid \${config.colorFront}20\`,
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

    // Responsive grid logic
    const [effectiveCols, setEffectiveCols] = useState(config.cols);

    useEffect(() => {
        const handleResize = () => {
            // On mobile, limit columns to ensure decent card size
            if (window.innerWidth < 640) {
                setEffectiveCols(Math.min(config.cols, 4));
            } else if (window.innerWidth < 1024) {
                setEffectiveCols(Math.min(config.cols, 8));
            } else {
                setEffectiveCols(config.cols);
            }
        };

        handleResize(); // Initial check
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [config.cols]);

    const totalCards = effectiveCols * config.rows;

    // Unique key for this grid configuration
    const gridKey = \`\${effectiveCols}-\${config.rows}\`;

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
            const row = Math.floor(i / effectiveCols);
            const col = i % effectiveCols;
            return getPatternDelay(i, row, col, config.rows, effectiveCols, config.pattern, adaptiveStagger);
        });
    }, [effectiveCols, config.rows, config.pattern, adaptiveStagger, totalCards]);

    // Calculate max delay for proper interval timing
    const maxDelay = useMemo(() => Math.max(...delays, 0), [delays]);
    const animationDuration = speedMap[config.speed].duration;

    // Apply image data if provided (creates per-card state)
    const [imageStates, setImageStates] = useState<boolean[] | null>(null);

    useEffect(() => {
        if (imageData) {
            const states = new Array(totalCards).fill(false);
            for (let row = 0; row < Math.min(imageData.length, config.rows); row++) {
                for (let col = 0; col < Math.min(imageData[row]?.length || 0, effectiveCols); col++) {
                    states[row * effectiveCols + col] = imageData[row][col];
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
    }, [autoPlay, autoPlayInterval, imageData, effectiveCols, config.rows, maxDelay, animationDuration]);

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
            className={\`w-full h-full \${className}\`}
            style={{
                display: 'grid',
                gridTemplateColumns: \`repeat(\${effectiveCols}, 1fr)\`,
                gridTemplateRows: \`repeat(\${config.rows}, 1fr)\`,
                gap: config.gap,
                padding: config.gap,
            }}
        >
            {Array.from({ length: totalCards }, (_, i) => (
                <FlipCard
                    key={\`\${gridKey}-\${i}\`}
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
    // Static preview - no animations to prevent lag when switching pages
    const rows = 6;
    const cols = 8;
    const gap = 2;
    const borderRadius = 2;

    return (
        <div className="w-full h-full flex items-center justify-center p-4">
            <div
                className="grid w-full h-full"
                style={{
                    gridTemplateColumns: \`repeat(\${cols}, 1fr)\`,
                    gridTemplateRows: \`repeat(\${rows}, 1fr)\`,
                    gap: \`\${gap}px\`,
                }}
            >
                {Array.from({ length: rows * cols }).map((_, i) => {
                    // Create a wave pattern - some tiles flipped, some not
                    const row = Math.floor(i / cols);
                    const col = i % cols;
                    const isFlipped = (row + col) % 3 === 0;

                    return (
                        <div
                            key={i}
                            className="w-full h-full"
                            style={{
                                backgroundColor: isFlipped
                                    ? 'var(--background)'
                                    : 'var(--foreground)',
                                borderRadius: \`\${borderRadius}px\`,
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
}

export default FlipGrid;
`
    },
    {
        id: 'ascii-simulation',
        name: 'ASCII Simulation',
        index: 2,
        description: 'A retro-style 3D renderer that projects shapes into ASCII characters.',
        tags: ['ascii', '3d', 'retro', 'terminal', 'simulation', 'code-art'],
        category: 'animation',
        previewConfig: { shape: 'car', scale: 1, speed: 1 },
        dependencies: ['react'],
        usage: `import { AsciiSimulation } from '@/components/ui';

<AsciiSimulation
    config={{
        shape: 'donut',
        scale: 1,
        speed: 1,
        charSet: '.,-~:;=!*#$@',
        color: '#00ff00',
    }}
/>`,
        props: [
            { name: 'config', type: 'AsciiSimulationConfig', default: '{}', description: 'Configuration object for the simulation' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' },
        ],
        fullCode: `
"use client";

import React, { useEffect, useRef, useState } from 'react';

// ============================================
// TYPES & INTERFACES
// ============================================

export type AsciiShape = 'torus' | 'cube' | 'car';

export interface ObjMesh {
    vertices: number[]; // x, y, z flat array
    faces: number[];    // v1, v2, v3 indices flat array
    normals?: number[]; // matching vertices
}

export interface AsciiSimulationConfig {
    shape: AsciiShape;
    scale: number;
    speed: number;
    rotationX: number;
    rotationY: number;
    charSet: string;
    color: string;
    fontSize: number;
    invert: boolean;
}

export interface AsciiSimulationProps {
    config?: Partial<AsciiSimulationConfig>;
    className?: string;
    autoPlay?: boolean;
    isFullScreen?: boolean; // If true, adapts to fill the fullscreen viewport
}

// ============================================
// DEFAULT CONFIG
// ============================================

const defaultCharSet = ".,-~:;=!*#$@";
const defaultConfig: AsciiSimulationConfig = {
    shape: 'car',
    scale: 1,
    speed: 8,
    rotationX: 0,
    rotationY: 0,
    charSet: defaultCharSet,
    color: 'var(--foreground)',
    fontSize: 12,
    invert: false,
};

// ============================================
// OBJ PARSER (Simplified)
// ============================================

const parseObj = (text: string, maxVertices = 10000): ObjMesh => {
    const vertices: number[] = [];
    const faces: number[] = [];

    // Quick estimation to skip lines if file is huge
    const lines = text.split('\\n');
    const step = Math.max(1, Math.floor(lines.length / (maxVertices * 2)));

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('v ')) {
            // Parse vertex
            // Randomly skip some to decimate if we are just doing point cloud style for performance
            if (Math.random() > 0.5 && step > 1) continue;

            const parts = line.split(/\\s+/);
            const vx = parseFloat(parts[1]);
            const vy = parseFloat(parts[2]);
            const vz = parseFloat(parts[3]);
            if (!isNaN(vx)) {
                // Assume standard Y-up, or different Z-up mapping
                // Try: X -> X, Z -> Y, Y -> Z (Standard Blender export often does Z-up, but let's try mapping Y to vertical)
                // If it is vertical now, it means it's standing on its nose or tail.

                // Let's try: X->X, Z->-Y (Height), Y->Z (Depth) meant it was standing up.
                // If the car looks "vertical" (like a wall), maybe the file IS Y-up?
                // Let's try direct mapping X, -Y, Z
                vertices.push(vx * 1.5, -vy * 1.5, vz * 1.5);
            }
        }
        // For point cloud ascii, we might not strictly need faces if we just splat points
        // But for solid look, we might. Given performance constraints of JS ASCII, 
        // a dense point cloud is often better/faster than rasterizing triangles in JS.
    }

    return { vertices, faces };
};

// ============================================
// ASCII RENDERER COMPONENT
// ============================================

export function AsciiSimulation({
    config: userConfig,
    className = "",
    autoPlay = true,
    isFullScreen = false
}: AsciiSimulationProps) {
    const config = { ...defaultConfig, ...userConfig };
    const containerRef = useRef<HTMLDivElement>(null);
    const preRef = useRef<HTMLPreElement>(null);
    const animationRef = useRef<number>(0);
    const meshCache = useRef<ObjMesh | null>(null);
    const [isLoadingModel, setIsLoadingModel] = useState(false);
    const [modelReady, setModelReady] = useState(0); // Counter to trigger re-render when model loads

    // Rotation state
    const A = useRef(0);
    const B = useRef(0);

    // Load Model Effect
    useEffect(() => {
        if (config.shape === 'car' && !meshCache.current && !isLoadingModel) {
            setIsLoadingModel(true);
            fetch('/Gulf%20Mclaren%202022.obj')
                .then(res => res.text())
                .then(text => {
                    // heavy parsing
                    const mesh = parseObj(text, 15000); // Target ~15k points
                    // Center and Normalize Mesh
                    let minX = Infinity, maxX = -Infinity;
                    let minY = Infinity, maxY = -Infinity;
                    let minZ = Infinity, maxZ = -Infinity;

                    for (let i = 0; i < mesh.vertices.length; i += 3) {
                        const x = mesh.vertices[i];
                        const y = mesh.vertices[i + 1];
                        const z = mesh.vertices[i + 2];
                        if (x < minX) minX = x; if (x > maxX) maxX = x;
                        if (y < minY) minY = y; if (y > maxY) maxY = y;
                        if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
                    }

                    const cx = (minX + maxX) / 2;
                    const cy = (minY + maxY) / 2;
                    const cz = (minZ + maxZ) / 2;
                    const scaleFactor = 3 / Math.max(maxX - minX, maxY - minY, maxZ - minZ);

                    for (let i = 0; i < mesh.vertices.length; i += 3) {
                        mesh.vertices[i] = (mesh.vertices[i] - cx) * scaleFactor;
                        mesh.vertices[i + 1] = (mesh.vertices[i + 1] - cy) * scaleFactor;
                        mesh.vertices[i + 2] = (mesh.vertices[i + 2] - cz) * scaleFactor;
                    }

                    meshCache.current = mesh;
                    setIsLoadingModel(false);
                    setModelReady(prev => prev + 1); // Trigger re-render
                })
                .catch(err => {
                    console.error("Failed to load car model", err);
                    setIsLoadingModel(false);
                });
        }
    }, [config.shape]);

    const [dimensions, setDimensions] = useState({ width: 100, height: 50 });
    // Create a primitive key for dimensions to use in dependency array
    const dimensionsKey = \`\${dimensions.width}x\${dimensions.height}\`;

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                // Use container dimensions instead of window dimensions
                const containerRect = containerRef.current.getBoundingClientRect();
                const containerWidth = containerRect.width || window.innerWidth;
                const containerHeight = containerRect.height || window.innerHeight;

                // Estimate char size - reduced aspect ratio assumption for denser grid
                const charW = config.fontSize * 0.6;
                const charH = config.fontSize * 0.6;
                // Fill the container with characters
                const w = Math.floor(containerWidth / charW);
                const h = Math.floor(containerHeight / charH);
                // Fill the container with characters - use higher caps for full-screen mode
                const maxWidth = isFullScreen ? 3000 : 500;
                const maxHeight = isFullScreen ? 2000 : 300;
                setDimensions({ width: Math.min(maxWidth, Math.max(20, w)), height: Math.min(maxHeight, Math.max(10, h)) });
            }
        };

        // Use ResizeObserver for accurate container dimension tracking
        const resizeObserver = new ResizeObserver(updateDimensions);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        window.addEventListener('resize', updateDimensions);
        updateDimensions();

        return () => {
            window.removeEventListener('resize', updateDimensions);
            resizeObserver.disconnect();
        };
    }, [config.fontSize, isFullScreen]);

    const renderFrame = () => {
        if (!preRef.current) return;

        // Configuration
        const { width, height } = dimensions;
        const screenWidth = width;
        const screenHeight = height;

        // Buffers
        const b: string[] = new Array(screenWidth * screenHeight).fill(" ");
        const z: number[] = new Array(screenWidth * screenHeight).fill(0);

        // Adjust params based on shape
        const R1 = 1;
        const R2 = 2;
        const K2 = 5;
        // Scale K1 based on screen size so object fills view better
        const K1 = Math.min(screenWidth, screenHeight) * config.scale * 0.8;

        // Update rotation
        if (autoPlay) {
            if (config.shape === 'car') {
                // Showroom spin: Only rotate Y (horizontal), keep X fixed slightly tilted
                A.current = 0; // Flat (no tilt)
                B.current += 0.02 * config.speed;
            } else {
                A.current += 0.04 * config.speed;
                B.current += 0.02 * config.speed;
            }
        } else {
            // Manual rotation from config could be applied here if interactive
            A.current = config.rotationX;
            B.current = config.rotationY;
        }

        const chars = config.charSet;
        const color = config.color;

        // Pre-calculate trig
        const cA = Math.cos(A.current);
        const sA = Math.sin(A.current);
        const cB = Math.cos(B.current);
        const sB = Math.sin(B.current);

        // SHAPE RENDER LOGIC
        if (config.shape === 'car' && meshCache.current) {
            const mesh = meshCache.current;
            const len = mesh.vertices.length;

            // Render Point Cloud
            for (let i = 0; i < len; i += 3) {
                const vx = mesh.vertices[i];
                const vy = mesh.vertices[i + 1];
                const vz = mesh.vertices[i + 2];

                // Rotate X (A)
                let y1 = vy * cA - vz * sA;
                let z1 = vy * sA + vz * cA;

                // Rotate Y (B)
                let x1 = vx * cB - z1 * sB;
                let z2 = vx * sB + z1 * cB;

                // Rotate Z (Optional, for car usually we rotate around Y mainly)
                // Let's stick to X/Y user controls

                const z_depth = z2 + 4; // Camera offset
                if (z_depth <= 0) continue; // Behind camera

                const ooz = 1 / z_depth;
                const screenX = 0 | (screenWidth / 2 + K1 * ooz * x1 * 2);
                const screenY = 0 | (screenHeight / 2 + K1 * ooz * y1);

                const idx = screenX + screenWidth * screenY;

                if (screenX >= 0 && screenX < screenWidth && screenY >= 0 && screenY < screenHeight) {
                    if (ooz > z[idx]) {
                        z[idx] = ooz;
                        // For point cloud, we fake lighting based on depth or just solid
                        // Let's try depth based lighting to see structure
                        const depthLum = Math.max(0, Math.min(1, 1 - (z_depth / 8)));

                        // Or calculate a fake normal based on position (spherical approx)
                        // const dot = x1*0 + y1*0 + z2*-1; // simple facing

                        const charIdx = Math.floor(depthLum * (chars.length - 1));
                        b[idx] = chars[config.invert ? chars.length - 1 - charIdx : charIdx];
                    }
                }
            }
        }
        else if (config.shape === 'torus') {
            // Torus Logic
            for (let j = 0; j < 6.28; j += 0.07) {
                const ct = Math.cos(j);
                const st = Math.sin(j);
                for (let i = 0; i < 6.28; i += 0.02) {
                    const sp = Math.sin(i);
                    const cp = Math.cos(i);
                    const h = ct + 2;
                    const D = 1 / (sp * h * sA + st * cA + 5);
                    const t = sp * h * cA - st * sA;

                    const x = 0 | (screenWidth / 2 + (screenWidth / 4) * D * (cp * h * cB - t * sB));
                    const y = 0 | (screenHeight / 2 + (screenHeight / 2) * D * (cp * h * sB + t * cB));

                    const o = x + screenWidth * y;
                    const N = 0 | (8 * ((st * sA - sp * ct * cA) * cB - sp * ct * sA - st * cA - cp * ct * sB));

                    if (y < screenHeight && y >= 0 && x >= 0 && x < screenWidth && D > z[o]) {
                        z[o] = D;
                        // Map N (luminance) to charSet
                        const lumIndex = Math.max(0, Math.min(chars.length - 1, Math.floor(N > 0 ? N / 1.5 : 0))); // Simplified mapping
                        b[o] = chars[config.invert ? chars.length - 1 - lumIndex : lumIndex];
                    }
                }
            }
        }

        else if (config.shape === 'cube') {
            // Cube Logic
            const size = 1;
            // Draw 6 faces
            // Helper for drawing points
            const drawPoint = (cubeX: number, cubeY: number, cubeZ: number, nx: number, ny: number, nz: number) => {
                // Rotate X
                let y = cubeY * cA - cubeZ * sA;
                let z_coord = cubeY * sA + cubeZ * cA;

                // Rotate Y
                let x = cubeX * cB - z_coord * sB;
                let z2 = cubeX * sB + z_coord * cB;

                const z_depth = z2 + 3;
                const ooz = 1 / z_depth;

                const screenX = 0 | (screenWidth / 2 + K1 * ooz * x * 2);
                const screenY = 0 | (screenHeight / 2 + K1 * ooz * y);

                const idx = screenX + screenWidth * screenY;

                // Lighting
                // Rotate Normal
                let ny1 = ny * cA - nz * sA;
                let nz1 = ny * sA + nz * cA;

                let nx1 = nx * cB - nz1 * sB;
                let nz2 = nx * sB + nz1 * cB;

                const lx = 0, ly = 0, lz = -1;
                const dot = nx1 * lx + ny1 * ly + nz2 * lz;

                if (screenX >= 0 && screenX < screenWidth && screenY >= 0 && screenY < screenHeight) {
                    if (ooz > z[idx]) {
                        z[idx] = ooz;
                        const validDot = Math.max(0, dot);
                        const charIdx = Math.floor(validDot * (chars.length - 1));
                        b[idx] = chars[config.invert ? chars.length - 1 - charIdx : chars.length - 1]; // Use solid char for facing logic roughly
                        // Better lighting for cube:
                        b[idx] = chars[Math.min(chars.length - 1, Math.floor(Math.abs(dot) * chars.length))];
                    }
                }
            };

            for (let x = -size; x <= size; x += 0.05) {
                for (let y = -size; y <= size; y += 0.05) {
                    drawPoint(x, y, -size, 0, 0, -1);
                    drawPoint(x, y, size, 0, 0, 1);
                    drawPoint(x, -size, y, 0, -1, 0);
                    drawPoint(x, size, y, 0, 1, 0);
                    drawPoint(-size, x, y, -1, 0, 0);
                    drawPoint(size, x, y, 1, 0, 0);
                }
            }
        }


        // Construct string
        let output = "";
        for (let k = 0; k < screenWidth * screenHeight; k++) {
            output += (k % screenWidth === 0 && k !== 0) ? "\\n" : b[k];
        }

        preRef.current.innerText = output;

        if (autoPlay) {
            animationRef.current = requestAnimationFrame(renderFrame);
        }
    };

    useEffect(() => {
        // Start LOOP - also re-run when model finishes loading or dimensions change
        renderFrame();
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [config.shape, config.charSet, config.speed, config.scale, config.rotationX, config.rotationY, config.invert, autoPlay, modelReady, dimensionsKey]);

    return (
        <div
            ref={containerRef}
            className={\`flex items-center justify-center w-full h-full overflow-hidden \${className}\`}
            style={{ color: config.color, backgroundColor: 'transparent' }}
        >
            {isLoadingModel && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                    <span className="font-mono text-sm animate-pulse">LOADING MODEL...</span>
                </div>
            )}
            <pre
                ref={preRef}
                className="font-mono leading-[0.6] whitespace-pre text-center cursor-default user-select-none"
                style={{
                    fontSize: \`\${config.fontSize}px\`,
                    fontFamily: 'monospace'
                }}
            />
        </div>
    );
}

// ============================================
// PREVIEW COMPONENT
// ============================================

export function AsciiSimulationPreview() {
    // Real ASCII simulation but with autoPlay disabled for static side view
    return (
        <AsciiSimulation
            config={{
                scale: 1.2,
                speed: 0,
                fontSize: 5,
                shape: 'car',
                color: 'var(--foreground)',
                rotationX: 0,
                rotationY: Math.PI / 2, // 90 degrees - side view of the car
            }}
            autoPlay={false}
            className="w-full h-full"
        />
    );
}

export default AsciiSimulation;
`
    },
    {
        id: 'liquid-morph',
        name: 'Liquid Morph',
        index: 3,
        description: 'A soft, organic blob that subtly morphs and undulates like liquid metal.',
        tags: ['3d', 'interactive', 'fluid', 'webgl', 'organic', 'metal'],
        category: 'animation',
        previewConfig: { distort: 0.4, speed: 2, color: '#4a9eff' },
        dependencies: ['@react-three/fiber', '@react-three/drei', 'three'],
        usage: `import { LiquidMorph } from '@/components/ui';

<LiquidMorph
    config={{
        distort: 0.4,
        speed: 2,
        color: '#4a9eff',
    }}
/>`,
        props: [
            { name: 'config', type: 'LiquidMorphConfig', default: '{}', description: 'Configuration for the 3D blob' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' },
        ],
        fullCode: `
"use client";

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, Environment, Float, Center } from '@react-three/drei';
import * as THREE from 'three';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface LiquidMorphConfig {
    color: string;
    radius: number;
    distort: number;
    speed: number;
    metalness: number;
    roughness: number;
    intensity: number;
}

export interface LiquidMorphProps {
    config?: Partial<LiquidMorphConfig>;
    className?: string;
    autoRotate?: boolean; // If true, adds subtle rotation
    static?: boolean; // If true, disables all animations for preview mode
    isFullScreen?: boolean; // If true, adapts to fill the fullscreen viewport
}

// ============================================
// DEFAULT CONFIG
// ============================================

const defaultConfig: LiquidMorphConfig = {
    color: "#ffffff",
    radius: 1,
    distort: 0.5,
    speed: 2,
    metalness: 0.9,
    roughness: 0.1,
    intensity: 1,
};

// ============================================
// BLOB COMPONENT
// ============================================

// ============================================
// TEXTURE HOOK
// ============================================

function useStripedPattern() {
    return useMemo(() => {
        if (typeof document === 'undefined') return null;

        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        // Dark background for contrast
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, 1024, 1024);

        // Glowing Pattern
        // We create a gradient for the glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ffffff';
        ctx.fillStyle = '#ffffff';

        // Horizontal lines only
        const lineCount = 60;
        const spacing = 1024 / lineCount;

        for (let i = 0; i < lineCount; i++) {
            const y = i * spacing + spacing / 2;
            // Draw thin bright line
            ctx.fillRect(0, y, 1024, 1);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);

        return texture;
    }, []);
}

function Blob({ config, autoRotate, isStatic, isFullScreen }: { config: LiquidMorphConfig; autoRotate: boolean; isStatic: boolean; isFullScreen: boolean }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<any>(null);
    const texture = useStripedPattern();

    useFrame((state) => {
        if (!meshRef.current || !materialRef.current || isStatic) return;

        // Subtle rotation if autoRotate is true or always to make it look alive
        if (autoRotate) {
            meshRef.current.rotation.y += 0.005;
            meshRef.current.rotation.x += 0.002;
        }
    });

    // Keep sphere scale consistent - camera adjustment handles fullscreen sizing
    const sphereScale = 1.5;

    const sphereContent = (
        <Sphere args={[config.radius, 64, 64]} ref={meshRef} scale={sphereScale}>
            <MeshDistortMaterial
                ref={materialRef}
                map={texture}
                color={config.color}
                envMapIntensity={0}
                clearcoat={0}
                clearcoatRoughness={0.1}
                metalness={0.2}
                roughness={0.2}
                distort={isStatic ? config.distort : config.distort}
                speed={isStatic ? 0 : config.speed}
            />
        </Sphere>
    );

    // If static mode, skip Float animation wrapper
    if (isStatic) {
        return sphereContent;
    }

    return (
        <Float
            speed={2} // Animation speed
            rotationIntensity={1} // XYZ rotation intensity
            floatIntensity={2} // Up/down float intensity
        >
            {sphereContent}
        </Float>
    );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function LiquidMorph({
    config: userConfig,
    className = "",
    autoRotate = true,
    static: isStatic = false,
    isFullScreen = false
}: LiquidMorphProps) {
    const config = useMemo(() => ({ ...defaultConfig, ...userConfig }), [userConfig]);

    // Camera position: closer in fullscreen mode for better viewport fill
    const cameraZ = isFullScreen ? 3.2 : 4;

    return (
        <div className={\`w-full h-full relative \${className}\`} style={{ minHeight: '100%' }}>
            <Canvas
                key={\`canvas-\${isFullScreen}\`}
                camera={{ position: [0, 0, cameraZ], fov: 45 }}
                dpr={[1, 2]}
                gl={{ antialias: true, alpha: true }}
                frameloop={isStatic ? 'demand' : 'always'}
                style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
            >
                <ambientLight intensity={3} />

                <Center>
                    <Blob config={config} autoRotate={autoRotate} isStatic={isStatic} isFullScreen={isFullScreen} />
                </Center>

                {/* Environment for reflections - iridescence from colorful environment */}

            </Canvas>
        </div>
    );
}

// ============================================
// PREVIEW COMPONENT
// ============================================

export function LiquidMorphPreview() {
    // Real 3D component but with animations disabled for performance
    return (
        <LiquidMorph
            config={{
                distort: 0.6,
                speed: 0, // No distortion animation
                color: "#e2e8f0", // silvery white
                radius: 1,
            }}
            className="w-full h-full"
            autoRotate={false}
            static={true}
        />
    );
}

export default LiquidMorph;
`
    },
    {
        id: 'page-reveal',
        name: 'Page Reveal',
        index: 4,
        description: 'A cinematic page transition with logo blur and split animations.',
        tags: ['animation', 'transition', 'reveal', 'intro', 'page-load'],
        category: 'animation',
        previewConfig: { duration: 2.5, logoText: 'MORPHYS' },
        dependencies: ['framer-motion', 'react'],
        usage: `import { PageReveal } from '@/components/ui';

<PageReveal
    config={{
        duration: 2.5,
        logoText: 'YOUR LOGO',
    }}
    onComplete={() => console.log('Reveal complete!')}
/>`,
        props: [
            { name: 'config', type: 'PageRevealConfig', default: '{}', description: 'Configuration for the reveal animation' },
            { name: 'onComplete', type: '() => void', default: 'undefined', description: 'Callback when animation completes' },
        ],
        fullCode: `
"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface PageRevealConfig {
    logoText: string;
    logoFontSize: number;
    splitCount: {
        mobile: number;
        tablet: number;
        desktop: number;
    };
    logoBlurDuration: number;
    logoHoldDuration: number;
    slitAnimationDuration: number;
    slitStaggerDelay: number;
    backgroundColor: string;
    logoColor: string;
}

export interface PageRevealProps {
    config?: Partial<PageRevealConfig>;
    onComplete?: () => void;
    className?: string;
    children?: React.ReactNode;
    autoStart?: boolean;
    isPreview?: boolean;
    contained?: boolean; // If true, uses absolute positioning within parent (sandbox mode). If false, uses fixed for full viewport.
}

// ============================================
// DEFAULT CONFIG
// ============================================

const defaultConfig: PageRevealConfig = {
    logoText: "MORPHYS",
    logoFontSize: 80,
    splitCount: {
        mobile: 10,
        tablet: 15,
        desktop: 20,
    },
    logoBlurDuration: 0.8,
    logoHoldDuration: 0.5,
    logoBlurExit: 0.6,
    slitAnimationDuration: 0.6,
    slitStaggerDelay: 0.06,
    backgroundColor: "#000000",
    logoColor: "#ffffff",
} as PageRevealConfig & { logoBlurExit: number };

// ============================================
// HELPER FUNCTIONS
// ============================================

function getSplitCount(width: number, config: PageRevealConfig): number {
    if (width < 768) return config.splitCount.mobile;
    if (width < 1024) return config.splitCount.tablet;
    return config.splitCount.desktop;
}

// ============================================
// LOGO COMPONENT
// ============================================

interface LogoProps {
    text: string;
    fontSize: number;
    color: string;
    phase: 'entering' | 'visible' | 'exiting' | 'hidden';
    blurDuration: number;
    holdDuration: number;
    exitDuration: number;
    onExitComplete?: () => void;
}

function Logo({
    text,
    fontSize,
    color,
    phase,
    blurDuration,
    exitDuration,
    onExitComplete
}: LogoProps) {
    const variants: Variants = {
        entering: {
            filter: 'blur(30px)',
            opacity: 0,
            scale: 0.8,
        },
        visible: {
            filter: 'blur(0px)',
            opacity: 1,
            scale: 1,
            transition: {
                duration: blurDuration,
                ease: [0.22, 1, 0.36, 1],
            }
        },
        exiting: {
            filter: 'blur(30px)',
            opacity: 0,
            scale: 0.9,
            transition: {
                duration: exitDuration,
                ease: [0.22, 1, 0.36, 1],
            }
        },
        hidden: {
            filter: 'blur(30px)',
            opacity: 0,
            scale: 0.8,
        }
    };

    return (
        <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
            initial="entering"
            animate={phase}
            variants={variants}
            onAnimationComplete={() => {
                if (phase === 'exiting' && onExitComplete) {
                    onExitComplete();
                }
            }}
        >
            <h1
                className="font-bold tracking-wider select-none"
                style={{
                    fontSize: \`clamp(32px, 10vw, \${fontSize}px)\`,
                    color,
                    fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                }}
            >
                {text}
            </h1>
        </motion.div>
    );
}

// ============================================
// SPLIT OVERLAY COMPONENT
// ============================================

interface SplitOverlayProps {
    splitCount: number;
    backgroundColor: string;
    isAnimating: boolean;
    duration: number;
    staggerDelay: number;
    onComplete?: () => void;
}

function SplitOverlay({
    splitCount,
    backgroundColor,
    isAnimating,
    duration,
    staggerDelay,
    onComplete,
}: SplitOverlayProps) {
    const slits = useMemo(() => {
        return Array.from({ length: splitCount }, (_, i) => ({
            index: i,
            delay: i * staggerDelay,
        }));
    }, [splitCount, staggerDelay]);

    return (
        <div className="absolute inset-0 flex overflow-hidden pointer-events-none">
            {slits.map(({ index, delay }) => (
                <motion.div
                    key={index}
                    className="h-full"
                    style={{
                        width: \`\${100 / splitCount}%\`,
                        backgroundColor,
                    }}
                    initial={{ y: 0 }}
                    animate={isAnimating ? { y: '-100%' } : { y: 0 }}
                    transition={{
                        duration,
                        delay,
                        ease: [0.65, 0, 0.35, 1], // Custom easing for staircase effect
                    }}
                    onAnimationComplete={() => {
                        // Call onComplete when the LAST slit finishes its animation
                        if (isAnimating && index === splitCount - 1 && onComplete) {
                            // Small delay to ensure visual completion
                            setTimeout(onComplete, 50);
                        }
                    }}
                />
            ))}
        </div>
    );
}

// ============================================
// PREVIEW SPLIT OVERLAY (for demo purposes)
// ============================================

interface PreviewSplitOverlayProps {
    splitCount: number;
    backgroundColor: string;
    animationProgress: number; // 0 to 1
}

function PreviewSplitOverlay({
    splitCount,
    backgroundColor,
    animationProgress,
}: PreviewSplitOverlayProps) {
    const slits = useMemo(() => {
        return Array.from({ length: splitCount }, (_, i) => ({
            index: i,
            offset: Math.max(0, Math.min(1, (animationProgress * splitCount - i) / 1)),
        }));
    }, [splitCount, animationProgress]);

    return (
        <div className="absolute inset-0 flex overflow-hidden pointer-events-none">
            {slits.map(({ index, offset }) => (
                <div
                    key={index}
                    className="h-full"
                    style={{
                        width: \`\${100 / splitCount}%\`,
                        backgroundColor,
                        transform: \`translateY(\${-offset * 100}%)\`,
                    }}
                />
            ))}
        </div>
    );
}

// ============================================
// MAIN PAGE REVEAL COMPONENT
// ============================================

export function PageReveal({
    config: userConfig,
    onComplete,
    className = "",
    children,
    autoStart = true,
    isPreview = false,
    contained = true, // Default to sandbox mode (contained within parent)
}: PageRevealProps) {
    const config = useMemo(() => ({ ...defaultConfig, ...userConfig }), [userConfig]);

    const [phase, setPhase] = useState<'logo-enter' | 'logo-hold' | 'logo-exit' | 'curtain' | 'complete'>(
        autoStart ? 'logo-enter' : 'complete'
    );
    const [splitCount, setSplitCount] = useState(config.splitCount.desktop);
    const [isOverlayVisible, setIsOverlayVisible] = useState(autoStart);

    // Preview animation state
    const [previewProgress, setPreviewProgress] = useState(0);
    const previewAnimationRef = useRef<number | null>(null);

    // Handle responsive split count
    useEffect(() => {
        const updateSplitCount = () => {
            setSplitCount(getSplitCount(window.innerWidth, config));
        };

        updateSplitCount();
        window.addEventListener('resize', updateSplitCount);
        return () => window.removeEventListener('resize', updateSplitCount);
    }, [config]);

    // Phase transitions
    useEffect(() => {
        if (isPreview) return;

        if (phase === 'logo-enter') {
            // Wait for logo to finish entering, then hold
            const timer = setTimeout(() => {
                setPhase('logo-hold');
            }, config.logoBlurDuration * 1000);
            return () => clearTimeout(timer);
        }

        if (phase === 'logo-hold') {
            // Hold the logo visible, then start exit
            const timer = setTimeout(() => {
                setPhase('logo-exit');
            }, config.logoHoldDuration * 1000);
            return () => clearTimeout(timer);
        }
    }, [phase, config.logoBlurDuration, config.logoHoldDuration, isPreview]);

    // Handle logo exit complete
    const handleLogoExitComplete = useCallback(() => {
        if (!isPreview) {
            setPhase('curtain');
        }
    }, [isPreview]);

    // Handle curtain animation complete
    const handleCurtainComplete = useCallback(() => {
        if (!isPreview) {
            setPhase('complete');
            setIsOverlayVisible(false);
            if (onComplete) {
                onComplete();
            }
        }
    }, [onComplete, isPreview]);

    // Preview animation loop
    useEffect(() => {
        if (!isPreview) return;

        let startTime: number | null = null;
        const totalDuration = 4000; // 4 second loop

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = (elapsed % totalDuration) / totalDuration;

            // Map progress to different phases
            // 0-0.2: Logo enter
            // 0.2-0.4: Logo visible
            // 0.4-0.6: Logo exit
            // 0.6-1.0: Curtain reveal
            if (progress < 0.2) {
                // Logo entering - blur decreasing
                setPreviewProgress(0);
            } else if (progress < 0.4) {
                // Logo visible
                setPreviewProgress(0);
            } else if (progress < 0.6) {
                // Logo exiting
                setPreviewProgress(0);
            } else {
                // Curtain revealing
                setPreviewProgress((progress - 0.6) / 0.4);
            }

            previewAnimationRef.current = requestAnimationFrame(animate);
        };

        previewAnimationRef.current = requestAnimationFrame(animate);

        return () => {
            if (previewAnimationRef.current) {
                cancelAnimationFrame(previewAnimationRef.current);
            }
        };
    }, [isPreview]);

    // Get logo phase for animation
    const getLogoPhase = (): 'entering' | 'visible' | 'exiting' | 'hidden' => {
        if (isPreview) {
            // For preview, calculate based on previewProgress
            return 'visible';
        }

        switch (phase) {
            case 'logo-enter':
                return 'visible';
            case 'logo-hold':
                return 'visible';
            case 'logo-exit':
                return 'exiting';
            default:
                return 'hidden';
        }
    };

    // Extended config type with logoBlurExit
    const extendedConfig = config as typeof config & { logoBlurExit?: number };

    return (
        <div className={\`relative w-full h-full \${className}\`}>
            {/* Content underneath */}
            <div className="relative w-full h-full">
                {children}
            </div>

            {/* Overlay animation */}
            <AnimatePresence>
                {(isOverlayVisible || isPreview) && (
                    <motion.div
                        className={contained ? "absolute inset-0 z-10" : "fixed inset-0 z-[9999]"}
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Split overlay */}
                        {isPreview ? (
                            <PreviewSplitOverlay
                                splitCount={splitCount}
                                backgroundColor={config.backgroundColor}
                                animationProgress={previewProgress}
                            />
                        ) : (
                            <SplitOverlay
                                splitCount={splitCount}
                                backgroundColor={config.backgroundColor}
                                isAnimating={phase === 'curtain'}
                                duration={config.slitAnimationDuration}
                                staggerDelay={config.slitStaggerDelay}
                                onComplete={handleCurtainComplete}
                            />
                        )}

                        {/* Logo */}
                        {(phase !== 'curtain' && phase !== 'complete') && (
                            <Logo
                                text={config.logoText}
                                fontSize={config.logoFontSize}
                                color={config.logoColor}
                                phase={getLogoPhase()}
                                blurDuration={config.logoBlurDuration}
                                holdDuration={config.logoHoldDuration}
                                exitDuration={extendedConfig.logoBlurExit ?? 0.6}
                                onExitComplete={handleLogoExitComplete}
                            />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ============================================
// STATIC PREVIEW COMPONENT
// ============================================

export function PageRevealPreview() {
    const splitCount = 8;
    const backgroundColor = "#000000";

    return (
        <div className="relative w-full h-full overflow-hidden" style={{ backgroundColor }}>
            {/* Static preview showing the split overlay mid-animation */}
            <div className="absolute inset-0 flex overflow-hidden">
                {Array.from({ length: splitCount }, (_, i) => {
                    // Create a staircase static preview
                    const offset = (i / splitCount) * 40; // Percentage offset for staircase effect
                    return (
                        <div
                            key={i}
                            className="h-full"
                            style={{
                                width: \`\${100 / splitCount}%\`,
                                backgroundColor,
                                transform: \`translateY(-\${offset}%)\`,
                                borderRight: i < splitCount - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                            }}
                        />
                    );
                })}
            </div>

            {/* Logo in the center with slight blur */}
            <div className="absolute inset-0 flex items-center justify-center">
                <h1
                    className="font-bold tracking-wider select-none"
                    style={{
                        fontSize: 'clamp(16px, 6vw, 32px)',
                        color: '#ffffff',
                        fontFamily: "'Inter', system-ui, sans-serif",
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        opacity: 0.9,
                        filter: 'blur(1px)',
                    }}
                >
                    MORPHYS
                </h1>
            </div>
        </div>
    );
}

export default PageReveal;
`
    },
    {
        id: 'navbar-menu',
        name: 'Navbar Menu',
        index: 5,
        description: 'An animated navigation bar with smooth expand/collapse transitions.',
        tags: ['navigation', 'menu', 'header', 'responsive', 'animation'],
        category: 'layout',
        previewConfig: { logoText: 'RUN', accentColor: '#ef4444' },
        dependencies: ['framer-motion', 'react'],
        usage: `import { NavbarMenu } from '@/components/ui';

<NavbarMenu
    config={{
        logoText: 'BRAND',
        accentColor: '#ef4444',
        animationSpeed: 1,
    }}
/>`,
        props: [
            { name: 'config', type: 'NavbarMenuConfig', default: '{}', description: 'Configuration for the navbar' },
        ],
        fullCode: `
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================
// PREVIEW COMPONENT (For Component Card)
// ============================================

export function NavbarMenuPreview() {
    // Static preview - scaled down to fit in card, matching original component styling
    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-3 md:p-4 relative">
            {/* Scaled-down navbar representation */}
            <div className="w-full max-w-[160px] md:max-w-[180px] flex flex-col items-center gap-1">
                {/* Navbar bar - using rounded-lg for proper rounded corners (not pill) */}
                <div className="w-full h-7 md:h-8 glass-navbar rounded-lg flex items-center justify-between px-2.5 md:px-3">
                    {/* Logo - matches font-heading font-black italic text-white */}
                    <span className="font-heading font-black italic text-[7px] md:text-[8px] tracking-wider text-white">
                        RUN
                    </span>
                    {/* Menu text - matches text-xs font-bold tracking-widest text-white */}
                    <span className="text-[5px] md:text-[6px] font-bold tracking-widest text-white/70 uppercase">
                        CLOSE
                    </span>
                </div>

                {/* Expanded menu representation - using rounded-xl for proper corners */}
                <div className="w-full glass-navbar rounded-xl flex flex-col items-center py-2 md:py-3 gap-0.5 md:gap-1">
                    {/* Menu Items - matches text-red-500 font-heading font-black */}
                    {["HOME", "REGISTER", "TRAINING", "ABOUT"].map((item) => (
                        <span
                            key={item}
                            className="font-heading font-black text-[7px] md:text-[8px] tracking-tighter text-red-500 uppercase"
                        >
                            {item}
                        </span>
                    ))}
                </div>

                {/* Privacy Policy Container - using rounded-md for smaller element */}
                <div className="w-full glass-navbar rounded-md py-1.5 md:py-2 flex justify-between items-center px-2 md:px-3">
                    <span className="text-[4px] md:text-[5px] font-mono uppercase text-white/40">Privacy Policy</span>
                    <span className="text-[4px] md:text-[5px] font-mono uppercase text-white/40">Terms of Use</span>
                </div>

                {/* Theme Toggle Container - using rounded-md for smaller element */}
                <div className="w-full glass-navbar rounded-md grid grid-cols-2 divide-x divide-white/10 overflow-hidden">
                    <div className="py-1.5 md:py-2 flex items-center justify-center gap-1">
                        <svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/40">
                            <circle cx="12" cy="12" r="5" />
                            <line x1="12" y1="1" x2="12" y2="3" />
                            <line x1="12" y1="21" x2="12" y2="23" />
                        </svg>
                        <span className="text-[4px] md:text-[5px] font-bold text-white/40">LIGHT</span>
                    </div>
                    <div className="py-1.5 md:py-2 flex items-center justify-center gap-1">
                        <svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/40">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                        </svg>
                        <span className="text-[4px] md:text-[5px] font-bold text-white/40">DARK</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================
// TYPES & CONFIG
// ============================================

export interface NavbarMenuConfig {
    logoText: string;
    accentColor: string;
    animationSpeed: number; // 0.5 to 2 multiplier
    borderRadius: number; // in pixels
}

export interface NavbarMenuProps {
    config?: Partial<NavbarMenuConfig>;
}

const defaultConfig: NavbarMenuConfig = {
    logoText: "RUN",
    accentColor: "#ef4444", // red-500
    animationSpeed: 1,
    borderRadius: 32,
};

// ============================================
// MAIN COMPONENT (For Sandbox/Detail page)
// ============================================

export function NavbarMenu({ config: userConfig }: NavbarMenuProps = {}) {
    const [isOpen, setIsOpen] = useState(false);

    // Merge user config with defaults
    const config = { ...defaultConfig, ...userConfig };

    // Calculate animation durations based on speed multiplier
    const baseDuration = 0.4 / config.animationSpeed;
    const staggerDelay = 0.05 / config.animationSpeed;

    // Internal theme state for the menu component
    const [isDarkMode, setIsDarkMode] = useState(true);

    return (
        <div
            className="w-full h-full flex flex-col items-center pt-6 md:pt-16 pb-8 md:pb-10 px-4 md:px-0 relative overflow-hidden"
            style={{
                backgroundImage: 'url(/back5.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {/* Background overlay for better contrast */}
            <div
                className={\`absolute inset-0 transition-colors duration-500 \${isDarkMode ? 'bg-black/40' : 'bg-white/30'
                    }\`}
            />

            {/* Inner container - full height flex column */}
            <div className="relative flex flex-col items-center w-full md:w-auto h-full z-10">
                {/* Navbar Container - fixed height */}
                <motion.div
                    layout
                    className={\`w-full md:w-[420px] h-[64px] shrink-0 flex items-center justify-between px-5 md:px-6 relative z-50 backdrop-blur-xl border transition-colors duration-300 \${isDarkMode
                        ? 'bg-black/40 border-white/10'
                        : 'bg-white/60 border-black/10'
                        }\`}
                    style={{ borderRadius: \`\${config.borderRadius}px\` }}
                    initial={false}
                >
                    {/* Logo */}
                    <div className="flex items-center">
                        {/* Using a simple text logo with italic style to simulate movement/speed */}
                        <span className={\`font-heading font-black italic text-lg md:text-xl tracking-wider transition-colors duration-300 \${isDarkMode ? 'text-white' : 'text-gray-900'
                            }\`}>
                            {config.logoText}
                        </span>
                    </div>

                    {/* Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={\`text-[10px] md:text-xs font-bold tracking-widest transition-colors uppercase \${isDarkMode
                            ? 'text-white hover:text-white/70'
                            : 'text-gray-900 hover:text-gray-600'
                            }\`}
                    >
                        {isOpen ? "CLOSE" : "MENU"}
                    </button>
                </motion.div>

                {/* Dropdown Menu - fills remaining space */}
                <AnimatePresence>
                    {isOpen && (
                        <>
                            {/* Main Menu Container */}
                            <motion.div
                                initial={{ opacity: 0, y: -20, scaleY: 0, filter: "blur(10px)" }}
                                animate={{
                                    opacity: 1,
                                    y: 8,
                                    scaleY: 1,
                                    filter: "blur(0px)",
                                    transition: {
                                        duration: baseDuration,
                                        type: "spring",
                                        bounce: 0
                                    }
                                }}
                                exit={{
                                    opacity: 0,
                                    y: -40,
                                    filter: "blur(10px)",
                                    transition: {
                                        duration: baseDuration * 0.75,
                                        delay: baseDuration * 0.6,
                                        ease: [0.4, 0, 1, 1]
                                    }
                                }}
                                style={{ transformOrigin: 'top', borderRadius: \`\${config.borderRadius}px\` }}
                                className={\`w-full md:w-[420px] flex-1 overflow-hidden flex flex-col relative z-40 mt-0 backdrop-blur-xl border transition-colors duration-300 \${isDarkMode
                                        ? 'bg-black/40 border-white/10'
                                        : 'bg-white/60 border-black/10'
                                    }\`}
                            >
                                {/* Menu Items - takes remaining space and centers content */}
                                <div className="flex-1 flex flex-col items-center justify-center gap-3 md:gap-4 py-6 md:py-8 w-full">
                                    {["HOME", "REGISTER", "TRAINING", "ABOUT"].map((item, i) => (
                                        <motion.a
                                            key={item}
                                            href="#"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            transition={{ delay: i * staggerDelay + 0.1, duration: baseDuration * 0.75 }}
                                            className={\`font-heading font-black text-6xl md:text-6xl tracking-tighter transition-colors uppercase \${isDarkMode ? 'hover:text-white' : 'hover:text-gray-900'
                                                }\`}
                                            style={{ color: config.accentColor }}
                                        >
                                            {item}
                                        </motion.a>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Privacy Policy Container - appears after main menu expands */}
                            <motion.div
                                initial={{ opacity: 0, y: -30, scaleY: 0 }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    scaleY: 1,
                                    transition: {
                                        duration: baseDuration * 0.7,
                                        delay: baseDuration * 0.5,
                                        type: "spring",
                                        bounce: 0
                                    }
                                }}
                                exit={{
                                    opacity: 0,
                                    y: -20,
                                    transition: {
                                        duration: baseDuration * 0.5,
                                        delay: baseDuration * 0.2,
                                        ease: [0.4, 0, 1, 1]
                                    }
                                }}
                                style={{ transformOrigin: 'top', borderRadius: \`\${Math.round(config.borderRadius * 0.625)}px\` }}
                                className={\`w-full md:w-[420px] mt-4 py-4 md:py-5 px-4 md:px-6 flex justify-between items-center text-[9px] md:text-[10px] font-mono uppercase shrink-0 z-40 backdrop-blur-xl border transition-colors duration-300 \${isDarkMode
                                        ? 'bg-black/40 border-white/10 text-white/40'
                                        : 'bg-white/60 border-black/10 text-gray-500'
                                    }\`}
                            >
                                <span className={\`cursor-pointer transition-colors \${isDarkMode ? 'hover:text-white' : 'hover:text-gray-900'}\`}>Privacy Policy</span>
                                <span className={\`cursor-pointer transition-colors \${isDarkMode ? 'hover:text-white' : 'hover:text-gray-900'}\`}>Terms of Use</span>
                            </motion.div>

                            {/* Theme Toggle Container - appears after privacy container */}
                            <motion.div
                                initial={{ opacity: 0, y: -30, scaleY: 0 }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    scaleY: 1,
                                    transition: {
                                        duration: baseDuration * 0.7,
                                        delay: baseDuration * 0.65,
                                        type: "spring",
                                        bounce: 0
                                    }
                                }}
                                exit={{
                                    opacity: 0,
                                    y: -20,
                                    transition: {
                                        duration: baseDuration * 0.5,
                                        delay: 0,
                                        ease: [0.4, 0, 1, 1]
                                    }
                                }}
                                style={{ transformOrigin: 'top', borderRadius: \`\${Math.round(config.borderRadius * 0.625)}px\` }}
                                className={\`w-full md:w-[420px] mt-2 grid grid-cols-2 shrink-0 overflow-hidden z-40 backdrop-blur-xl border transition-colors duration-300 \${isDarkMode
                                        ? 'bg-black/40 border-white/10 divide-white/10'
                                        : 'bg-white/60 border-black/10 divide-black/10'
                                    } divide-x\`}
                            >
                                <button
                                    onClick={() => setIsDarkMode(false)}
                                    className={\`py-4 md:py-5 text-[9px] md:text-[10px] font-bold transition-colors flex items-center justify-center gap-2 \${!isDarkMode
                                            ? 'text-gray-900 bg-white/30'
                                            : 'text-white/40 hover:text-white hover:bg-white/5'
                                        }\`}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="5" />
                                        <line x1="12" y1="1" x2="12" y2="3" />
                                        <line x1="12" y1="21" x2="12" y2="23" />
                                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                        <line x1="1" y1="12" x2="3" y2="12" />
                                        <line x1="21" y1="12" x2="23" y2="12" />
                                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                                    </svg>
                                    LIGHT
                                </button>
                                <button
                                    onClick={() => setIsDarkMode(true)}
                                    className={\`py-4 md:py-5 text-[9px] md:text-[10px] font-bold transition-colors flex items-center justify-center gap-2 \${isDarkMode
                                            ? 'text-white bg-white/10'
                                            : 'text-gray-400 hover:text-gray-900 hover:bg-black/5'
                                        }\`}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                    </svg>
                                    DARK
                                </button>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
`
    },
    {
        id: 'navbar-menu-2',
        name: 'Navbar Menu 2',
        index: 6,
        description: 'A modern navbar with clean animations and entrance effects.',
        tags: ['navigation', 'menu', 'header', 'minimal', 'animation'],
        category: 'layout',
        previewConfig: { logoText: 'Morphys' },
        dependencies: ['framer-motion', 'react'],
        usage: `import { NavbarMenu2 } from '@/components/ui';

<NavbarMenu2
    config={{
        logoText: 'Morphys',
        backgroundColor: '#ffffff',
        textColor: '#000000',
    }}
/>`,
        props: [
            { name: 'config', type: 'object', default: '{}', description: 'Configuration for the navbar' },
        ],
        fullCode: `
"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================
// PREVIEW COMPONENT (For Component Card)
// ============================================

export function NavbarMenu2Preview() {
    return (
        <div className="w-full h-full flex items-center justify-center p-4 bg-gray-50/50">
            {/* Navbar representation */}
            <div className="w-[180px] h-10 bg-white rounded-full flex items-center justify-between px-4 shadow-sm border border-black/5">
                <span className="font-logo italic font-black text-xs text-black">Morphys</span>
                <div className="flex flex-col gap-[3px]">
                    <div className="w-3 h-0.5 bg-black rounded-full" />
                    <div className="w-3 h-0.5 bg-black rounded-full" />
                </div>
            </div>
        </div>
    );
}

// ============================================
// TYPES & CONFIG
// ============================================

export interface NavbarMenu2Config {
    logoText: string;
    backgroundColor: string;
    textColor: string;
}

export interface NavbarMenu2Props {
    config?: Partial<NavbarMenu2Config>;
}

const defaultConfig: NavbarMenu2Config = {
    logoText: "Morphys",
    backgroundColor: "#ffffff",
    textColor: "#000000",
};

// ============================================
// MAIN COMPONENT
// ============================================

export function NavbarMenu2({ config: userConfig }: NavbarMenu2Props = {}) {
    const config = { ...defaultConfig, ...userConfig };
    const [isOpen, setIsOpen] = useState(false);
    const [hasInitialized, setHasInitialized] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    // Get container dimensions for expansion
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setContainerSize({ width: rect.width, height: rect.height });
                // Mark as initialized once we have valid dimensions
                if (rect.width > 0 && rect.height > 0) {
                    setHasInitialized(true);
                }
            }
        };
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    // Toggle menu state
    const toggleMenu = () => setIsOpen(!isOpen);

    // Closed navbar dimensions - responsive
    const isMobile = containerSize.width < 640;
    const closedWidth = isMobile ? containerSize.width - 32 : Math.min(420, containerSize.width - 32);
    const closedHeight = isMobile ? 52 : 56;
    const topOffset = Math.max(20, containerSize.height * 0.15); // 15% from top, minimum 20px
    const navbarPadding = isMobile ? 20 : 24; // Internal padding of navbar

    // Calculate positions
    const closedLeft = (containerSize.width - closedWidth) / 2;
    const closedTop = topOffset;

    // When open, padding should be such that logo stays at same screen position
    // Logo screen X when closed = closedLeft + navbarPadding
    // Logo screen X when open with paddingLeft P = P
    // So P = closedLeft + navbarPadding
    const openPaddingLeft = closedLeft + navbarPadding;
    const openPaddingRight = closedLeft + navbarPadding;

    // Animation transition - buttery smooth spring
    const springTransition = {
        type: "spring" as const,
        stiffness: 80,
        damping: 18,
        mass: 0.8,
    };

    const menuItemVariants = {
        hidden: {
            opacity: 0,
            y: 60,
            filter: "blur(8px)"
        },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: {
                type: "spring" as const,
                stiffness: 100,
                damping: 20,
                delay: i * 0.08 + 0.15
            }
        }),
        exit: (i: number) => ({
            opacity: 0,
            y: -30,
            filter: "blur(4px)",
            transition: {
                duration: 0.2,
                delay: (3 - i) * 0.03
            }
        })
    };

    const footerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                delay: 0.5,
                duration: 0.4
            }
        },
        exit: {
            opacity: 0,
            transition: { duration: 0.15 }
        }
    };

    const menuItems = ['SERVICES', 'ABOUT', 'ROLES', 'CONTACT'];

    return (
        <div
            ref={containerRef}
            className="w-full h-full relative overflow-hidden"
            style={{ backgroundColor: '#e7e5df' }}
        >
            {hasInitialized && (
                <motion.div
                    initial={{
                        width: closedWidth * 0.5,
                        height: closedHeight,
                        left: closedLeft + (closedWidth * 0.25),
                        top: -80,
                        borderRadius: 100,
                        opacity: 0,
                    }}
                    animate={{
                        width: isOpen ? containerSize.width : closedWidth,
                        height: isOpen ? containerSize.height : closedHeight,
                        left: isOpen ? 0 : closedLeft,
                        top: isOpen ? 0 : closedTop,
                        borderRadius: isOpen ? 0 : 100,
                        opacity: 1,
                    }}
                    transition={springTransition}
                    className="absolute flex flex-col overflow-hidden z-50"
                    style={{
                        backgroundColor: config.backgroundColor,
                        color: config.textColor,
                        boxShadow: isOpen
                            ? 'none'
                            : '0 8px 32px -8px rgba(0,0,0,0.12), 0 4px 16px -4px rgba(0,0,0,0.08)',
                    }}
                >
                    {/* Header Bar - Logo and button stay at same screen position */}
                    <motion.div
                        className="flex items-center justify-between shrink-0 w-full"
                        animate={{
                            height: isOpen ? (closedHeight + topOffset) : closedHeight,
                            paddingLeft: isOpen ? openPaddingLeft : navbarPadding,
                            paddingRight: isOpen ? openPaddingRight : navbarPadding,
                            paddingTop: isOpen ? topOffset : 0,
                        }}
                        transition={springTransition}
                    >
                        {/* Logo */}
                        <span className="font-logo italic font-black text-xl md:text-2xl tracking-tight cursor-pointer select-none">
                            {config.logoText}
                        </span>

                        {/* Hamburger / Close Button */}
                        <button
                            onClick={toggleMenu}
                            className="relative z-50 p-2 -mr-2 focus:outline-none"
                        >
                            <div className="flex flex-col gap-[5px] items-center justify-center w-7 h-7">
                                <motion.span
                                    animate={isOpen
                                        ? { rotate: 45, y: 7, width: 24 }
                                        : { rotate: 0, y: 0, width: 20 }
                                    }
                                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                                    className="h-[2px] block origin-center"
                                    style={{ backgroundColor: config.textColor }}
                                />
                                <motion.span
                                    animate={isOpen
                                        ? { opacity: 0, scaleX: 0 }
                                        : { opacity: 1, scaleX: 1 }
                                    }
                                    transition={{ duration: 0.2 }}
                                    className="w-5 h-[2px] block"
                                    style={{ backgroundColor: config.textColor }}
                                />
                                <motion.span
                                    animate={isOpen
                                        ? { rotate: -45, y: -7, width: 24 }
                                        : { rotate: 0, y: 0, width: 20 }
                                    }
                                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                                    className="h-[2px] block origin-center"
                                    style={{ backgroundColor: config.textColor }}
                                />
                            </div>
                        </button>
                    </motion.div>

                    {/* Expanded Menu Content */}
                    <AnimatePresence mode="wait">
                        {isOpen && (
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="flex-1 flex flex-col justify-center items-center relative px-6 md:px-10"
                            >
                                {/* Main Links */}
                                <div className="flex flex-col items-start justify-center gap-1 sm:gap-2 md:gap-4 w-full pl-4 sm:pl-0 sm:items-center">
                                    {menuItems.map((item, i) => (
                                        <motion.div
                                            key={item}
                                            custom={i}
                                            variants={menuItemVariants}
                                            className="overflow-hidden relative group cursor-pointer"
                                        >
                                            <div className="flex items-baseline gap-2 sm:gap-3">
                                                <span
                                                    className="text-[8px] sm:text-[10px] md:text-xs font-mono opacity-40"
                                                    style={{ color: config.textColor }}
                                                >
                                                    /0{i + 1}
                                                </span>
                                                <span
                                                    className="block text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-serif font-normal tracking-tight transition-all duration-300 group-hover:italic"
                                                    style={{ color: config.textColor }}
                                                >
                                                    {item}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Footer Info */}
                                <motion.div
                                    variants={footerVariants}
                                    className="absolute bottom-4 sm:bottom-6 md:bottom-10 left-0 w-full px-4 sm:px-6 md:px-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-4 text-[10px] sm:text-xs md:text-sm font-mono"
                                    style={{ color: config.textColor, opacity: 0.5 }}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-base sm:text-lg">✦</span>
                                        <p>Curated Chaos</p>
                                    </div>
                                    <div className="flex gap-4 sm:gap-6 md:gap-8">
                                        <a href="#" className="hover:opacity-100 transition-opacity uppercase tracking-wider">Instagram</a>
                                        <a href="#" className="hover:opacity-100 transition-opacity uppercase tracking-wider">Contact</a>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </div>
    );
}

export default NavbarMenu2;
`
    },
    {
        id: 'spotlight-search',
        name: 'Spotlight Search',
        index: 7,
        description: 'A macOS-inspired spotlight search with smooth morphing animations.',
        tags: ['search', 'spotlight', 'modal', 'input', 'animation'],
        category: 'interaction',
        previewConfig: { morphDelay: 800, searchWidth: 600 },
        dependencies: ['framer-motion', 'react'],
        usage: `import SpotlightSearch from '@/components/ui/SpotlightSearch';

<SpotlightSearch
    config={{
        morphDelay: 800,
        searchWidth: 600,
    }}
/>`,
        props: [
            { name: 'config', type: 'object', default: '{}', description: 'Configuration for the search' },
        ],
        fullCode: `
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, AppWindow, Folder, Layers, File, Command, Sun, Moon } from 'lucide-react';

export interface SpotlightSearchConfig {
    morphDelay: number;
    searchWidth: number;
    springStiffness: number;
    springDamping: number;
}

export interface SpotlightSearchProps {
    config?: Partial<SpotlightSearchConfig>;
}

const defaultConfig: SpotlightSearchConfig = {
    morphDelay: 800,
    searchWidth: 600,
    springStiffness: 400,
    springDamping: 15,
};

export default function SpotlightSearch({ config: userConfig }: SpotlightSearchProps = {}) {
    // Merge provided config with defaults
    const config = { ...defaultConfig, ...userConfig };

    const [isOpen, setIsOpen] = useState(false);
    const [isMorphed, setIsMorphed] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [containerWidth, setContainerWidth] = useState(0);

    // Handle resize - measure container
    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.offsetWidth);
            }
        };

        // Initial measure
        updateWidth();

        // Listen for window resize
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    // Helper: Determine if we are in a "compact" (mobile-like) environment
    const isCompact = containerWidth > 0 && containerWidth < 640;

    // Handle Ctrl+K shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (isOpen) {
            if (inputRef.current) inputRef.current.focus();
            const timer = setTimeout(() => {
                setIsMorphed(true);
            }, config.morphDelay);
            return () => clearTimeout(timer);
        } else {
            setIsMorphed(false);
        }
    }, [isOpen, config.morphDelay]);

    const toggleSearch = () => setIsOpen(!isOpen);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.9 }
    };

    const actionButtons = [
        { icon: isDark ? Sun : Moon, label: "Theme", action: () => setIsDark(!isDark) },
        { icon: AppWindow, label: "Apps", action: () => { } },
        { icon: Folder, label: "Finder", action: () => { } },
        { icon: Layers, label: "Stack", action: () => { } },
    ];

    return (
        <div
            ref={containerRef}
            className={\`h-full w-full flex flex-col items-center justify-center relative font-sans rounded-xl overflow-hidden \${isDark ? 'dark' : ''}\`}
            style={{
                backgroundImage: 'url(/back5.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {/* Dark overlay for contrast */}
            <div className={\`absolute inset-0 transition-colors duration-500 \${isDark ? 'bg-black/40 backdrop-blur-[2px]' : 'bg-transparent'}\`} />

            {/* Content Container */}
            <div className="z-10 flex flex-col items-center gap-8 text-center px-4">
                <h1 className="text-3xl md:text-4xl font-light tracking-tight text-gray-800 dark:text-gray-100">
                    Spotlight Search
                </h1>
                <div className="bg-white/30 dark:bg-black/30 backdrop-blur-md border border-white/20 dark:border-white/10 px-6 py-2.5 rounded-full shadow-sm max-w-full">
                    <p className="text-gray-800 dark:text-gray-200 font-medium flex flex-wrap justify-center items-center gap-2 text-sm md:text-base">
                        Click the button below or
                        <span className="font-mono text-xs bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded border border-black/5 dark:border-white/5 whitespace-nowrap">
                            Ctrl + K
                        </span>
                    </p>
                </div>
            </div>

            {/* Main Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
                        />

                        {/* Search Container */}
                        <motion.div
                            layout
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={containerVariants}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className={\`relative z-10 flex items-center justify-center p-2 \${isCompact ? 'flex-col gap-4' : 'flex-row'}\`}
                        // Constraint max width prevents valid width animation if we hardcode width logic below?
                        // We handle size logic in children.
                        >
                            {/* Search Bar Input Area */}
                            <motion.div
                                layout
                                className={\`
                  relative flex items-center overflow-hidden
                  backdrop-blur-xl border
                  shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]
                  transition-colors duration-300
                  \${isDark
                                        ? 'bg-black/40 border-white/10'
                                        : 'bg-white/30 border-white/20'
                                    }
                \`}
                                style={{
                                    borderRadius: 32,
                                    height: '64px'
                                }}
                                animate={{
                                    // Robust width logic:
                                    // 1. If compact (mobile), always full width minus margins
                                    // 2. If morphed, shrink to 380 (or available space)
                                    // 3. Otherwise default config width (or available space)
                                    width: isCompact
                                        ? Math.max(280, containerWidth - 32)
                                        : isMorphed
                                            ? Math.min(380, containerWidth - 80)
                                            : Math.min(config.searchWidth, containerWidth - 48)
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: config.springStiffness,
                                    damping: config.springDamping,
                                    mass: 0.8
                                }}
                            >
                                <div className="pl-6 pr-4 text-gray-500 dark:text-gray-400 shrink-0">
                                    <Search size={24} strokeWidth={2} />
                                </div>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Spotlight Search"
                                    className={\`w-full h-full bg-transparent border-none outline-none text-xl placeholder-gray-500/70 transition-colors duration-300 \${isDark ? 'text-white dark:placeholder-gray-400/70' : 'text-gray-800'}\`}
                                />

                                {/* Right side placeholder that disappears */}
                                <AnimatePresence mode='popLayout'>
                                    {!isMorphed && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute right-6 flex items-center gap-2 text-sm text-gray-500/70 font-medium"
                                        >
                                            <span className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-md border border-white/20 hidden sm:flex">
                                                <Command size={14} /> K
                                            </span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>

                            {/* Action Buttons (Morphing out) */}
                            {/* Layout Logic: If Compact, buttons are below. If not compact, to the right */}
                            <motion.div
                                layout
                                className={\`flex items-center gap-2 md:gap-3 \${isCompact ? 'mt-0 w-auto justify-center' : 'ml-3 h-full'}\`}
                            >
                                <AnimatePresence mode='popLayout'>
                                    {isMorphed && actionButtons.map((btn, index) => (
                                        <motion.button
                                            key={btn.label}
                                            onClick={btn.action}
                                            initial={{ scale: 0, opacity: 0, x: -20 }}
                                            animate={{
                                                scale: 1,
                                                opacity: 1,
                                                x: 0,
                                                transition: {
                                                    type: "spring",
                                                    stiffness: 400,
                                                    damping: 15,
                                                    delay: index * 0.05 + 0.1
                                                }
                                            }}
                                            exit={{
                                                scale: 0,
                                                opacity: 0,
                                                x: -20,
                                                transition: { duration: 0.2 }
                                            }}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={\`
                        w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center
                        backdrop-blur-xl border transition-colors duration-300
                        shadow-lg
                        \${isDark
                                                    ? 'bg-black/40 border-white/10 text-gray-200 hover:bg-white/20'
                                                    : 'bg-white/30 border-white/20 text-gray-700 hover:bg-white/50'
                                                }
                      \`}
                                        >
                                            <btn.icon size={isCompact ? 20 : 24} strokeWidth={2} />
                                        </motion.button>
                                    ))}
                                </AnimatePresence>
                            </motion.div>

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Trigger Button at Bottom */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40 w-full flex justify-center px-4">
                <motion.button
                    onClick={toggleSearch}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={\`
            flex items-center gap-3 px-6 py-3 rounded-full
            backdrop-blur-md border transition-colors duration-300
            shadow-lg hover:shadow-xl
            \${isDark
                            ? 'bg-black/30 border-white/10 text-white'
                            : 'bg-white/30 border-white/20 text-gray-800'
                        }
            font-medium text-sm md:text-base whitespace-nowrap
          \`}
                >
                    <Search size={20} />
                    <span>Open Spotlight</span>
                </motion.button>
            </div>

        </div>
    );
}

export function SpotlightSearchPreview() {
    return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-black rounded-[20px] overflow-hidden">
            <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-lg rounded-full px-4 py-2 flex items-center gap-2 w-[80%]">
                <Search size={16} className="text-gray-500 dark:text-gray-400" />
                <div className="h-2 w-20 bg-gray-400/20 rounded-full" />
            </div>
        </div>
    );
}
`
    },
    {
        id: 'image-trail-cursor',
        name: 'Image Trail Cursor',
        index: 8,
        description: 'A cursor effect that leaves a trail of fading images.',
        tags: ['cursor', 'trail', 'images', 'effect', 'interactive'],
        category: 'effect',
        previewConfig: { size: 150, rotation: true, fadeDuration: 0.6 },
        dependencies: ['framer-motion', 'react'],
        usage: `import ImageTrailCursor from '@/components/ui/ImageTrailCursor';

<ImageTrailCursor
    config={{
        size: 150,
        rotation: true,
        fadeDuration: 0.6,
        distanceThreshold: 40,
    }}
/>`,
        props: [
            { name: 'config', type: 'ImageTrailCursorConfig', default: '{}', description: 'Configuration for the cursor trail' },
            { name: 'containerRef', type: 'RefObject<HTMLElement>', default: 'undefined', description: 'Container to attach the effect' },
        ],
        fullCode: `
"use client";

import React, { useState, useEffect, useRef, RefObject } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ImageTrailCursorConfig {
    size: number;
    rotation: boolean;
    fadeDuration: number;
    distanceThreshold: number;
}

export interface ImageTrailCursorProps {
    config?: Partial<ImageTrailCursorConfig>;
    containerRef?: React.RefObject<HTMLElement | null>;
}

const defaultImages = [
    '/Glassmophism.jpg',
    '/Material 3.png',
    '/Retro.jpg',
    '/SKEUOMORPHISM.png',
    '/minimalism.jpg',
    '/neo brutalism.jpg',
    '/neumorphism.jpg',
    '/pop art.png'
];

const defaultConfig: ImageTrailCursorConfig = {
    size: 150,
    rotation: true,
    fadeDuration: 0.6,
    distanceThreshold: 40,
};

interface TrailPoint {
    id: number;
    x: number;
    y: number;
    image: string;
    rotation: number;
}

export default function ImageTrailCursor({ config: userConfig, containerRef }: ImageTrailCursorProps = {}) {
    // Merge provided config with defaults
    const config = { ...defaultConfig, ...userConfig };

    const [trail, setTrail] = useState<TrailPoint[]>([]);
    const lastPoint = useRef<{ x: number, y: number } | null>(null);
    const pointId = useRef(0);
    const imageIndex = useRef(0);

    useEffect(() => {
        const container = containerRef?.current;

        const handleMove = (clientX: number, clientY: number) => {
            let x = clientX;
            let y = clientY;

            // If container is provided, calculate position relative to container
            if (container) {
                const rect = container.getBoundingClientRect();
                x = clientX - rect.left;
                y = clientY - rect.top;

                // Ignore if outside container bounds
                if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
                    return;
                }
            }

            if (!lastPoint.current) {
                lastPoint.current = { x, y };
                return;
            }

            const dx = x - lastPoint.current.x;
            const dy = y - lastPoint.current.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance >= config.distanceThreshold) {
                const newPoint: TrailPoint = {
                    id: pointId.current++,
                    x,
                    y,
                    image: defaultImages[imageIndex.current % defaultImages.length],
                    rotation: config.rotation ? (Math.random() - 0.5) * 40 : 0
                };

                imageIndex.current += 1;
                lastPoint.current = { x, y };

                // Limit trail size to avoid memory issues if fade is slow
                setTrail(prev => {
                    const newTrail = [...prev, newPoint];
                    if (newTrail.length > 20) return newTrail.slice(newTrail.length - 20);
                    return newTrail;
                });
            }
        };

        const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
        const onTouchMove = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                handleMove(e.touches[0].clientX, e.touches[0].clientY);
            }
        };

        // Attach to container if provided, otherwise to window
        const target = container || window;
        target.addEventListener('mousemove', onMouseMove as EventListener);
        target.addEventListener('touchmove', onTouchMove as EventListener);

        return () => {
            target.removeEventListener('mousemove', onMouseMove as EventListener);
            target.removeEventListener('touchmove', onTouchMove as EventListener);
        };
    }, [config.distanceThreshold, config.rotation, containerRef]);

    // Clear trail when leaving container
    useEffect(() => {
        const container = containerRef?.current;
        if (!container) return;

        const handleLeave = () => {
            lastPoint.current = null;
        };

        container.addEventListener('mouseleave', handleLeave);
        return () => container.removeEventListener('mouseleave', handleLeave);
    }, [containerRef]);

    return (
        <div className="absolute inset-0 pointer-events-none z-[100] overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-foreground/20 text-sm font-medium uppercase tracking-widest">
                    Move Cursor
                </span>
            </div>
            <AnimatePresence mode="popLayout">
                {trail.map((point) => (
                    <motion.div
                        key={point.id}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.2, filter: 'blur(10px)' }}
                        transition={{ duration: config.fadeDuration, ease: "easeOut" }}
                        onAnimationComplete={() => {
                            setTrail(prev => prev.filter(p => p.id !== point.id));
                        }}
                        style={{
                            position: 'absolute',
                            left: point.x,
                            top: point.y,
                            width: config.size,
                            height: config.size * 0.75, // Aspect ratio roughly 4:3
                            rotate: point.rotation,
                            x: "-50%",
                            y: "-50%",
                        }}
                        className="rounded-xl overflow-hidden shadow-xl border border-white/20"
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={point.image}
                            alt="trail"
                            className="w-full h-full object-cover"
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

export function ImageTrailCursorPreview() {
    return (
        <div className="w-full h-full flex items-center justify-center bg-zinc-900 rounded-[20px] overflow-hidden relative">
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                    <div className="w-16 h-12 rounded-lg bg-zinc-800 border border-white/10 absolute -left-10 -top-6 rotate-[-12deg] z-10 shadow-lg"
                        style={{ backgroundImage: "url('/Glassmophism.jpg')", backgroundSize: 'cover' }} />
                    <div className="w-16 h-12 rounded-lg bg-zinc-800 border border-white/10 absolute -left-2 -top-2 rotate-[-5deg] z-20 shadow-lg"
                        style={{ backgroundImage: "url('/Material 3.png')", backgroundSize: 'cover' }} />
                    <div className="w-16 h-12 rounded-lg bg-zinc-800 border border-white/10 absolute top-4 left-6 rotate-[10deg] z-30 shadow-lg"
                        style={{ backgroundImage: "url('/Retro.jpg')", backgroundSize: 'cover' }} />

                    {/* Cursor */}
                    <svg
                        className="absolute left-16 top-16 z-40 text-white fill-white drop-shadow-md"
                        width="24" height="24" viewBox="0 0 24 24"
                    >
                        <path d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19169L11.7841 12.3673H5.65376Z" stroke="black" strokeWidth="1" />
                    </svg>
                </div>
            </div>
        </div>
    );
}
`
    },
    {
        id: 'reality-lens',
        name: 'Liquid Reveal',
        index: 9,
        description: 'A liquid brush stroke effect that reveals hidden content.',
        tags: ['lens', 'reveal', 'liquid', 'interactive', 'effect'],
        category: 'effect',
        previewConfig: { lensSize: 200 },
        dependencies: ['react'],
        usage: `import { RealityLens } from '@/components/ui';

<RealityLens
    config={{
        lensSize: 200,
    }}
/>`,
        props: [
            { name: 'config', type: 'object', default: '{}', description: 'Configuration for the lens effect' },
        ],
        fullCode: `
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, useSpring, useMotionValue, useTransform, animate } from "framer-motion";

interface RealityLensProps {
    children: React.ReactNode;
    revealContent: React.ReactNode;
    lensSize?: number; // Base size of the liquid head
    className?: string;
    zoomScale?: number;
}

interface LiquidPoint {
    id: number;
    x: number;
    y: number;
    radius: number;
    createdAt: number;
    life: number; // 1.0 to 0.0
    driftX: number; // Slight random drift
    driftY: number;
}

export function RealityLens({
    children,
    revealContent,
    lensSize = 120,
    className = "",
    zoomScale = 1,
}: RealityLensProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isHovering, setIsHovering] = useState(false);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    const points = useRef<LiquidPoint[]>([]);
    const pointIdCounter = useRef(0);
    const lastPointPos = useRef<{ x: number, y: number } | null>(null);
    const mousePos = useRef({ x: 0, y: 0 });

    // Animation frame
    const animationRef = useRef<number>(0);
    const [svgMask, setSvgMask] = useState<string>("");

    // Parallax
    const parallaxX = useSpring(0, { stiffness: 150, damping: 20 });
    const parallaxY = useSpring(0, { stiffness: 150, damping: 20 });

    const glowIntensity = useMotionValue(0.15);
    const glowShadow = useTransform(glowIntensity, (intensity) =>
        \`0 0 \${30 * intensity}px rgba(255,255,255,\${intensity * 0.8}), 0 0 \${60 * intensity}px rgba(255,255,255,\${intensity * 0.3})\`
    );

    // Resize handler
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setContainerSize({ width: rect.width, height: rect.height });
            }
        };
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    // Loop
    useEffect(() => {
        if (!containerSize.width) return;

        const loop = () => {
            const now = Date.now();
            const isActive = isHovering;

            // 1. Update Points
            const lifeTime = 2000; // 2 seconds

            // Update life and remove dead points
            points.current = points.current.filter(p => {
                const age = now - p.createdAt;
                p.life = 1 - (age / lifeTime);

                // Slight drift for organic fluid feel
                p.x += p.driftX;
                p.y += p.driftY;

                return p.life > 0;
            });

            // 2. Generate SVG for Metaballs
            // We render a circle for every point.
            // The magic happens in the CSS filter (applied in the SVG defs later)
            // Note: The main cursor is also just a point (but a big fresh one)

            let elements = "";

            // Render trailing points
            points.current.forEach(p => {
                // Shrink radius as it dies
                const currentRadius = p.radius * Math.pow(p.life, 0.5);
                elements += \`<circle cx="\${p.x}" cy="\${p.y}" r="\${currentRadius}" fill="white" />\`;
            });

            // Render current cursor head (if active)
            if (isActive) {
                const headRadius = (lensSize / 2) * 0.45; // Base size (45%)
                elements += \`<circle cx="\${mousePos.current.x}" cy="\${mousePos.current.y}" r="\${headRadius}" fill="white" />\`;
            }

            if (elements) {
                // The 'gooey' filter makes the separate circles blend into a single liquid shape
                const svg = \`
                    <svg xmlns="http://www.w3.org/2000/svg" width="\${containerSize.width}" height="\${containerSize.height}">
                        <defs>
                            <filter id="liquid-goo">
                                <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur"/>
                                <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo"/>
                                <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
                            </filter>
                        </defs>
                        <g filter="url(#liquid-goo)">
                            \${elements}
                        </g>
                    </svg>
                \`;
                setSvgMask(\`url("data:image/svg+xml,\${encodeURIComponent(svg)}")\`);
            } else if (!isActive && points.current.length === 0) {
                setSvgMask("");
            }

            animationRef.current = requestAnimationFrame(loop);
        };

        animationRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animationRef.current);
    }, [containerSize, isHovering, lensSize]);

    const createDrop = (x: number, y: number) => {
        // Random "multiple lengths" -> Random size of the drops creates the illusion of different stroke weights
        const randomSize = 0.5 + Math.random() * 0.8;
        const radius = (lensSize / 2) * 0.4 * randomSize;

        // Random drift direction
        const driftSpeed = 0.1;
        const driftAngle = Math.random() * Math.PI * 2;

        points.current.push({
            id: pointIdCounter.current++,
            x,
            y,
            radius,
            createdAt: Date.now(),
            life: 1.0,
            driftX: Math.cos(driftAngle) * driftSpeed,
            driftY: Math.sin(driftAngle) * driftSpeed,
        });
    };

    const onPointerMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();

        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        const x = clientX - rect.left;
        const y = clientY - rect.top;
        mousePos.current = { x, y };

        // Drop logic:
        // We drop circle "blobs" as we move to create the trail.
        // Distance-based dropping ensures smooth strokes regardless of speed.
        if (lastPointPos.current) {
            const dx = x - lastPointPos.current.x;
            const dy = y - lastPointPos.current.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Drop a blob every ~15px
            const threshold = 15;

            if (dist > threshold) {
                // Interpolate drops for very fast movement to avoid gaps
                const steps = Math.floor(dist / threshold);
                for (let i = 1; i <= steps; i++) {
                    const ix = lastPointPos.current.x + (dx * i / steps);
                    const iy = lastPointPos.current.y + (dy * i / steps);
                    // Add some randomness to position ("random way")
                    const jitter = 5;
                    const jx = ix + (Math.random() - 0.5) * jitter;
                    const jy = iy + (Math.random() - 0.5) * jitter;
                    createDrop(jx, jy);
                }
                lastPointPos.current = { x, y };
            }
        } else {
            lastPointPos.current = { x, y };
            createDrop(x, y);
        }
    };

    const onEnter = (e: React.MouseEvent | React.TouchEvent) => {
        setIsHovering(true);
        lastPointPos.current = null;
        onPointerMove(e);
    };

    const onLeave = () => {
        setIsHovering(false);
        lastPointPos.current = null;
    };

    return (
        <div
            ref={containerRef}
            className={\`relative overflow-hidden w-full h-full cursor-none selection:bg-none \${className}\`}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
            onMouseMove={onPointerMove}
            onTouchStart={onEnter}
            onTouchEnd={onLeave}
            onTouchMove={onPointerMove}
        >
            {/* Base Layer */}
            <div className="absolute inset-0 w-full h-full pointer-events-none">
                {children}
            </div>

            {/* Reveal Layer masked by Liquid Goo */}
            {/* Visible if hovering OR if there are leftover drops */}
            {(isHovering || svgMask) && (
                <motion.div
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    style={{
                        maskImage: svgMask,
                        WebkitMaskImage: svgMask,
                        maskSize: "100% 100%",
                        WebkitMaskSize: "100% 100%",
                    }}
                >
                    <motion.div
                        className="absolute inset-0 w-full h-full"
                        style={{
                            scale: 1.05,
                        }}
                    >
                        {revealContent}
                    </motion.div>
                </motion.div>
            )}

            {/* Liquid Border/Glow (using same mask) */}
            {(isHovering || svgMask) && (
                <motion.div
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    style={{
                        maskImage: svgMask,
                        WebkitMaskImage: svgMask,
                        maskSize: "100% 100%",
                        WebkitMaskSize: "100% 100%",
                    }}
                >
                    <motion.div
                        className="absolute inset-0 w-full h-full"
                        style={{
                            boxShadow: glowShadow,
                            border: "2px solid rgba(255,255,255,0.2)",
                            // We need to apply the filter to the border container too or it looks sharp?
                            // Actually, applying border to a masked element works, but the 'goo' filter is in the mask, so the mask shape IS gooey.
                            // So the border will follow the goo shape.
                        }}
                    />
                </motion.div>
            )}
        </div>
    );
}

export function RealityLensPreview() {
    return (
        <div className="w-full h-full rounded-[20px] overflow-hidden relative border border-black/5 dark:border-white/10">
            <RealityLens
                lensSize={100}
                revealContent={
                    <div
                        className="w-full h-full bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: "url('/backcol.jpg')" }}
                    />
                }
            >
                <div
                    className="w-full h-full bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: "url('/back5.png')" }}
                />
            </RealityLens>
            <div className="absolute bottom-3 left-0 right-0 text-center text-[9px] text-white/60 pointer-events-none uppercase tracking-wider drop-shadow-md">
                Draw to reveal
            </div>
        </div>
    );
}
`
    },
    {
        id: 'scroll-to-reveal',
        name: 'Scroll To Reveal',
        index: 10,
        description: 'Text that reveals with opacity based on scroll position.',
        tags: ['scroll', 'reveal', 'text', 'animation', 'opacity'],
        category: 'animation',
        previewConfig: {},
        dependencies: ['react'],
        usage: `import { ScrollToReveal } from '@/components/ui';

<ScrollToReveal
    text="Your text here..."
    className="text-4xl"
    minOpacity={0.15}
/>`,
        props: [
            { name: 'text', type: 'string', default: "''", description: 'Text to reveal' },
            { name: 'className', type: 'string', default: "''", description: 'CSS classes for styling' },
            { name: 'minOpacity', type: 'number', default: '0.15', description: 'Minimum opacity for unrevealed text' },
        ],
        fullCode: `
"use client";

import { motion, useMotionValue } from "framer-motion";
import React, { useRef, createContext, useContext, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

// Context to pass the scroll container ref and scroll trigger
interface ScrollContextValue {
    containerRef: React.RefObject<HTMLDivElement | null>;
    registerWord: (element: HTMLSpanElement, setOpacity: (val: number) => void) => () => void;
}

const ScrollContainerContext = createContext<ScrollContextValue | null>(null);

interface ScrollToRevealProps {
    text: string;
    className?: string;
    minOpacity?: number;
}

const Word = ({
    children,
    minOpacity = 0.15
}: {
    children: string;
    minOpacity?: number;
}) => {
    const ref = useRef<HTMLSpanElement>(null);
    const context = useContext(ScrollContainerContext);
    const opacity = useMotionValue(minOpacity);

    useEffect(() => {
        if (!ref.current || !context) return;

        const setOpacityValue = (val: number) => {
            opacity.set(val);
        };

        const unregister = context.registerWord(ref.current, setOpacityValue);
        return unregister;
    }, [context, opacity]);

    return (
        <motion.span
            ref={ref}
            style={{ opacity }}
            className="mr-3 md:mr-4 inline-block"
        >
            {children}
        </motion.span>
    );
};

export const ScrollToReveal: React.FC<ScrollToRevealProps> = ({
    text,
    className,
    minOpacity = 0.15,
}) => {
    const words = text.split(" ");

    return (
        <div className={cn("flex flex-wrap leading-[1.5] font-kugile", className)}>
            {words.map((word, i) => (
                <Word key={i} minOpacity={minOpacity}>
                    {word}
                </Word>
            ))}
        </div>
    );
};

// Self-contained sandbox component with its own scroll container
interface ScrollToRevealSandboxProps {
    text: string;
    className?: string;
    minOpacity?: number;
}

export const ScrollToRevealSandbox: React.FC<ScrollToRevealSandboxProps> = ({
    text,
    className,
    minOpacity = 0.15,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const words = text.split(" ");
    const wordRefs = useRef<Map<HTMLSpanElement, (val: number) => void>>(new Map());

    // Calculate opacity based on element position within container
    const updateOpacities = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        const containerRect = container.getBoundingClientRect();
        const containerCenter = containerRect.height / 2;

        wordRefs.current.forEach((setOpacity, element) => {
            const elementRect = element.getBoundingClientRect();
            // Get element center relative to container top
            const elementCenterY = elementRect.top - containerRect.top + elementRect.height / 2;

            // Calculate distance from container center (0 = at center, 1 = at edge)
            const distanceFromCenter = Math.abs(elementCenterY - containerCenter) / containerCenter;

            // Clamp distance
            const normalizedDistance = Math.min(1, Math.max(0, distanceFromCenter));

            // Apply power curve for sharper falloff - higher power = more focused highlight
            // This makes only ~2-3 lines bright at a time
            const sharpness = 4;
            const focusedFalloff = Math.pow(1 - normalizedDistance, sharpness);
            const calculatedOpacity = minOpacity + focusedFalloff * (1 - minOpacity);

            setOpacity(calculatedOpacity);
        });
    }, [minOpacity]);

    // Register word elements
    const registerWord = useCallback((element: HTMLSpanElement, setOpacity: (val: number) => void) => {
        wordRefs.current.set(element, setOpacity);
        // Initial update
        requestAnimationFrame(updateOpacities);
        return () => {
            wordRefs.current.delete(element);
        };
    }, [updateOpacities]);

    // Handle scroll events
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            requestAnimationFrame(updateOpacities);
        };

        container.addEventListener('scroll', handleScroll, { passive: true });
        // Initial calculation
        handleScroll();

        return () => {
            container.removeEventListener('scroll', handleScroll);
        };
    }, [updateOpacities]);

    // Smooth scroll state
    const targetScrollRef = useRef(0);
    const currentScrollRef = useRef(0);
    const isAnimatingRef = useRef(false);

    // Use native event listener to prevent Lenis from intercepting scroll
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Initialize scroll positions
        targetScrollRef.current = container.scrollTop;
        currentScrollRef.current = container.scrollTop;

        const smoothScroll = () => {
            if (!container) return;

            // Lerp towards target
            const ease = 0.12; // Lower = smoother, higher = snappier
            currentScrollRef.current += (targetScrollRef.current - currentScrollRef.current) * ease;

            // Apply scroll
            container.scrollTop = currentScrollRef.current;

            // Continue animation if not close enough
            if (Math.abs(targetScrollRef.current - currentScrollRef.current) > 0.5) {
                requestAnimationFrame(smoothScroll);
            } else {
                isAnimatingRef.current = false;
                currentScrollRef.current = targetScrollRef.current;
                container.scrollTop = targetScrollRef.current;
            }
        };

        const handleWheel = (e: WheelEvent) => {
            const { scrollHeight, clientHeight } = container;
            const maxScroll = scrollHeight - clientHeight;

            // Calculate new target
            const scrollAmount = e.deltaY * 0.8; // Reduce scroll speed slightly
            let newTarget = targetScrollRef.current + scrollAmount;

            // Clamp target
            newTarget = Math.max(0, Math.min(maxScroll, newTarget));

            const isAtTop = newTarget <= 0 && e.deltaY < 0;
            const isAtBottom = newTarget >= maxScroll && e.deltaY > 0;

            // If we can scroll in the direction of the wheel, capture the event
            if (!isAtTop && !isAtBottom) {
                e.preventDefault();
                e.stopPropagation();

                targetScrollRef.current = newTarget;

                // Start animation if not already running
                if (!isAnimatingRef.current) {
                    isAnimatingRef.current = true;
                    requestAnimationFrame(smoothScroll);
                }
            }
        };

        // Use passive: false to allow preventDefault
        container.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            container.removeEventListener('wheel', handleWheel);
        };
    }, []);

    const contextValue: ScrollContextValue = {
        containerRef,
        registerWord,
    };

    return (
        <ScrollContainerContext.Provider value={contextValue}>
            {/* Dark background wrapper */}
            <div className="w-full h-full bg-[#0a0a0a]">
                <div
                    ref={containerRef}
                    className="w-full h-full overflow-y-auto"
                    style={{
                        overscrollBehavior: 'contain',
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    {/* Top spacer for scroll room - allows first words to reach center */}
                    <div className="h-[50%]" />

                    {/* Main text content */}
                    <div className={cn(
                        "px-6 md:px-20 lg:px-32 flex flex-wrap leading-[1.15] justify-start font-kugile",
                        className
                    )}>
                        {words.map((word, i) => (
                            <Word key={i} minOpacity={minOpacity}>
                                {word}
                            </Word>
                        ))}
                    </div>

                    {/* Bottom spacer for scroll room - allows last words to reach center */}
                    <div className="h-[50%]" />
                </div>
            </div>
        </ScrollContainerContext.Provider>
    );
};

// Preview component for the card (static, no scroll needed)
export function ScrollToRevealPreview() {
    // Sample words with opacity values simulating the center-focused highlight effect
    const previewWords = [
        { text: "Morphys", opacity: 0.15 },
        { text: "is", opacity: 0.15 },
        { text: "a", opacity: 0.25 },
        { text: "curated", opacity: 0.4 },
        { text: "collection", opacity: 0.7 },
        { text: "of", opacity: 0.9 },
        { text: "high", opacity: 1 },
        { text: "performance", opacity: 1 },
        { text: "UI", opacity: 0.9 },
        { text: "components", opacity: 0.7 },
        { text: "designed", opacity: 0.4 },
        { text: "to", opacity: 0.25 },
        { text: "elevate", opacity: 0.15 },
        { text: "your", opacity: 0.15 },
    ];

    return (
        <div className="w-full h-full bg-[#0a0a0a] overflow-hidden">
            {/* Content wrapper with same padding as original */}
            <div className="w-full h-full flex items-center">
                <div className="px-4 md:px-6 flex flex-wrap leading-[1.15] justify-start font-kugile text-xl md:text-2xl lg:text-3xl">
                    {previewWords.map((word, i) => (
                        <span
                            key={i}
                            className="mr-2 md:mr-3 inline-block"
                            style={{
                                opacity: word.opacity,
                                color: '#e8e4dc'
                            }}
                        >
                            {word.text}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ScrollToReveal;
`
    },
    {
        id: 'diffuse-text',
        name: 'Diffuse Text',
        index: 11,
        description: 'Blurred text with a diffuse glow effect.',
        tags: ['text', 'blur', 'diffuse', 'glow', 'effect'],
        category: 'effect',
        previewConfig: { text: 'MORPHYS', blurLevel: 24 },
        dependencies: ['react'],
        usage: `import { DiffuseText } from '@/components/ui';

<DiffuseText
    config={{
        text: 'MORPHYS',
        blurLevel: 24,
        intensity: 1,
        color: '#ffffff',
    }}
/>`,
        props: [
            { name: 'config', type: 'object', default: '{}', description: 'Configuration for the diffuse effect' },
        ],
        fullCode: `
"use client";

import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { cn } from "@/lib/utils";

// ============================================
// TYPES
// ============================================

export interface DiffuseTextConfig {
    text: string;
    subtextLeft?: string;
    subtextRight?: string;
    blurLevel: number;
    intensity: number;
    color: string;
    backgroundColor: string; // Base background color (fallback)
}

export interface DiffuseTextProps {
    config?: Partial<DiffuseTextConfig>;
    className?: string;
}

// ============================================
// DEFAULT CONFIG
// ============================================

const defaultConfig: DiffuseTextConfig = {
    text: "MORPHYS",
    subtextLeft: "Barcelona Arts Summer School",
    subtextRight: "by ESCAC / ESMUC / Institut del Teatre",
    blurLevel: 10,
    intensity: 1,
    color: "#ffffff",
    backgroundColor: "#7ca5b8",
};

// ============================================
// VIDEO BACKGROUND COMPONENT
// ============================================

function BackgroundVideo() {
    return (
        <div className="absolute inset-0 overflow-hidden bg-slate-900">
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover blur-[20px] scale-110"
            >
                <source src="/vid.mp4" type="video/mp4" />
            </video>
            {/* Minimal overlay just to ensure text pops slightly if video is too bright */}
            <div className="absolute inset-0 bg-black/10" />
        </div>
    );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function DiffuseText({ config: userConfig, className }: DiffuseTextProps) {
    const config = { ...defaultConfig, ...userConfig };

    // Helper to calculate responsive font size based on character count
    const getFontSize = (length: number) => {
        if (length <= 2) return "35vw";
        if (length <= 4) return "28vw";
        if (length <= 6) return "22vw";
        if (length <= 9) return "15vw";
        return "10vw";
    };

    const fontSize = getFontSize(config.text.length);

    return (
        <div
            className={cn("relative w-full h-full overflow-hidden font-sans", className)}
        >
            {/* 1. Background Video (Clean) */}
            <BackgroundVideo />

            {/* 2. Main Center Content - Diffuse Glow Effect */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10">
                <div className="relative w-full text-center px-4">

                    {/* Layer 1: Deep Atmospheric Halo (The softest/widest blur) */}
                    <motion.h1
                        className="absolute inset-0 flex items-center justify-center font-black leading-none tracking-tighter"
                        style={{
                            fontSize,
                            color: config.color,
                            opacity: 0.4,
                            filter: \`blur(\${config.blurLevel * 4}px)\`,
                        }}
                        animate={{
                            opacity: [0.4, 0.6, 0.4],
                            filter: [\`blur(\${config.blurLevel * 4}px)\`, \`blur(\${config.blurLevel * 5}px)\`, \`blur(\${config.blurLevel * 4}px)\`]
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                        {config.text}
                    </motion.h1>

                    {/* Layer 2: The Soft Glow (The middle blur) */}
                    <motion.h1
                        className="absolute inset-0 flex items-center justify-center font-black leading-none tracking-tighter"
                        style={{
                            fontSize,
                            color: config.color,
                            opacity: 0.4, // Slightly less transparent
                            filter: \`blur(\${config.blurLevel}px)\`,
                        }}
                        animate={{
                            filter: [\`blur(\${config.blurLevel}px)\`, \`blur(\${config.blurLevel * 1.5}px)\`, \`blur(\${config.blurLevel}px)\`]
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                        {config.text}
                    </motion.h1>

                    {/* Layer 3: The Core (Soft but Defined) */}
                    {/* Reduced base blur slightly to make it less intense but still soft */}
                    <motion.h1
                        className="relative font-black leading-none tracking-tighter z-10"
                        style={{
                            fontSize,
                            color: config.color,
                            opacity: 0.55, // More solid core
                            filter: \`blur(\${config.blurLevel * 0.2}px)\`,
                        }}
                        animate={{
                            filter: [\`blur(\${config.blurLevel * 0.2}px)\`, \`blur(\${config.blurLevel * 0.3}px)\`, \`blur(\${config.blurLevel * 0.2}px)\`]
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                        {config.text}
                    </motion.h1>

                </div>
            </div>

            {/* 3. Foreground UI Layer (Empty as per request) */}
            <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-12 z-20 pointer-events-none">
                <div className="w-full flex justify-between" />
            </div>
        </div>
    );
}

// ============================================
// PREVIEW COMPONENT
// ============================================

export function DiffuseTextPreview() {
    return (
        <div className="w-full h-full relative overflow-hidden bg-slate-900">
            {/* Gradient Background matching the video vibe */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/80 to-slate-900" />

            {/* Glow Overlay */}
            <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay" />

            <div className="absolute inset-0 flex items-center justify-center z-10 scale-75">
                {/* Layer 1: Glow */}
                <h1 className="absolute text-5xl font-black tracking-tighter text-white/40 blur-[12px]">
                    MORPHYS
                </h1>
                {/* Layer 2: Core */}
                <h1 className="relative text-5xl font-black tracking-tighter text-white/80 blur-[1px]">
                    MORPHYS
                </h1>
            </div>
        </div>
    );
}

export default DiffuseText;
`
    },
    {
        id: 'diagonal-focus',
        name: 'Diagonal Carousel',
        index: 12,
        description: 'A draggable diagonal carousel with infinite scroll and focus depth effects. Cards are arranged at an angle with dynamic scaling and opacity based on position.',
        tags: ['carousel', 'diagonal', 'infinite', 'cards', 'animation', 'draggable'],
        category: 'animation',
        previewConfig: {},
        dependencies: ['framer-motion', 'react'],
        usage: `import { DiagonalFocus } from '@/components/ui/DiagonalFocus';

// Basic usage
<DiagonalFocus />

// With custom className
<DiagonalFocus className="h-full min-h-[500px]" />`,
        props: [
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes for container' },
        ],
        fullCode: `
"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
    motion,
    useMotionValue,
    useSpring,
    useTransform,
    PanInfo,
    useAnimationFrame,
} from "framer-motion";
import { uiStyles } from "@/data/styles";

interface DiagonalFocusProps {
    className?: string;
}

const cards = uiStyles;
const CARD_COUNT = cards.length;

// Preview Component
export function DiagonalFocusPreview() {
    const angle = 35 * (Math.PI / 180);
    // Scale down constants
    const cardWidth = 50;
    const cardHeight = 70;
    const gap = 10;
    const step = cardWidth + gap;

    return (
        <div className="w-full h-full bg-zinc-950 relative overflow-hidden flex items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center">
                {[-2, -1, 0, 1, 2].map((i) => {
                    const index = i + 3; // Shift to start from a valid index
                    const styleItem = uiStyles[index % uiStyles.length];

                    const grayscale = i === 0 ? "0%" : "100%";
                    const blur = i === 0 ? "0px" : "2px";
                    const scale = i === 0 ? 1.2 : 0.85;
                    const opacity = Math.abs(i) >= 2 ? 0.3 : 1; // Fade clear ends
                    const zIndex = 10 - Math.abs(i);

                    const x = i * step * Math.cos(angle);
                    const y = i * step * Math.sin(angle);

                    return (
                        <div
                            key={i}
                            className="absolute rounded-lg overflow-hidden shadow-xl border border-white/10"
                            style={{
                                width: cardWidth,
                                height: cardHeight,
                                transform: \`translate(\${x}px, \${y}px) scale(\${scale})\`,
                                filter: \`grayscale(\${grayscale}) blur(\${blur})\`,
                                zIndex,
                                opacity,
                                backgroundColor: styleItem?.accentColor || '#333',
                                backgroundImage: styleItem?.image ? \`url(\${styleItem.image})\` : undefined,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
}

export function DiagonalFocus({ className = "" }: DiagonalFocusProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    const ANGLE = 35;
    const ANGLE_RAD = (ANGLE * Math.PI) / 180;

    // Use a simple linear motion value (no spring for the base to avoid overshoots)
    const scrollX = useMotionValue(0);
    // Apply smoothing only for rendering
    const smoothScrollX = useSpring(scrollX, { stiffness: 200, damping: 40, mass: 0.5 });

    const AUTO_SCROLL_SPEED = 4.0;

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return undefined;

        const resizeObserver = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (entry) {
                setContainerSize({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height
                });
            }
        });
        resizeObserver.observe(container);
        return () => resizeObserver.disconnect();
    }, []);

    const getCardDimensions = () => {
        const minDim = Math.min(containerSize.width || 800, containerSize.height || 600);
        const cardWidth = Math.max(140, Math.min(320, minDim * 0.45));
        const cardHeight = cardWidth * 1.4;
        const gap = 20; // Gap between cards
        const step = cardWidth + gap; // Side by side spacing
        return { cardWidth, cardHeight, step };
    };

    const { cardWidth, cardHeight, step } = getCardDimensions();
    const cycleWidth = CARD_COUNT * step;

    // Render many cycles - enough for "infinite" practical use
    // 50 cycles = 400 cards, would take ~10 minutes of auto-scroll to traverse
    const CYCLES = 50;
    const START_CYCLE = 25; // Start in the middle

    const allCards = useMemo(() => {
        const result = [];
        for (let cycle = 0; cycle < CYCLES; cycle++) {
            for (let i = 0; i < CARD_COUNT; i++) {
                result.push({
                    ...cards[i],
                    instanceId: \`\${cycle}-\${i}\`,
                    absoluteIndex: cycle * CARD_COUNT + i,
                });
            }
        }
        return result;
    }, []);

    // Initialize scroll position
    const [initialized, setInitialized] = useState(false);
    useEffect(() => {
        if (step > 0 && !initialized) {
            const initialScroll = START_CYCLE * cycleWidth;
            scrollX.set(initialScroll);
            smoothScrollX.set(initialScroll);
            setInitialized(true);
        }
    }, [step, initialized, cycleWidth, scrollX, smoothScrollX]);

    // Auto scroll - continuously
    useAnimationFrame(() => {
        if (isDragging || isHovering || step === 0 || !initialized) return;
        scrollX.set(scrollX.get() + AUTO_SCROLL_SPEED);
    });

    const handleDragStart = () => setIsDragging(true);

    const handleDragEnd = (_: any, info: PanInfo) => {
        setIsDragging(false);
        // Add momentum
        scrollX.set(scrollX.get() - info.velocity.x * 0.3);
    };

    const handleDrag = (_: any, info: PanInfo) => {
        scrollX.set(scrollX.get() - info.delta.x);
    };

    const handleCardClick = (absoluteIndex: number) => {
        if (isDragging) return;
        const targetScroll = absoluteIndex * step;
        scrollX.set(targetScroll);
    };

    return (
        <div
            ref={containerRef}
            className={\`w-full h-full flex items-center justify-center relative overflow-hidden \${className}\`}
            style={{ perspective: 1000 }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <motion.div
                className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0}
                onDrag={handleDrag}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                style={{ touchAction: "none" }}
            />

            <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
                {containerSize.width > 0 && initialized && allCards.map((card) => (
                    <Card
                        key={card.instanceId}
                        item={card}
                        absoluteIndex={card.absoluteIndex}
                        smoothScrollX={smoothScrollX}
                        angle={ANGLE_RAD}
                        onSelect={() => handleCardClick(card.absoluteIndex)}
                        cardWidth={cardWidth}
                        cardHeight={cardHeight}
                        step={step}
                    />
                ))}
            </div>
        </div>
    );
}

interface CardProps {
    item: typeof cards[0];
    absoluteIndex: number;
    smoothScrollX: ReturnType<typeof useSpring>;
    angle: number;
    onSelect: () => void;
    cardWidth: number;
    cardHeight: number;
    step: number;
}

const Card = ({
    item,
    absoluteIndex,
    smoothScrollX,
    angle,
    onSelect,
    cardWidth,
    cardHeight,
    step,
}: CardProps) => {
    const basePosition = absoluteIndex * step;
    const position = useTransform(smoothScrollX, (scroll: number) => basePosition - scroll);
    const distanceFromCenter = useTransform(position, (pos: number) => Math.abs(pos));

    // Visual Effects
    const grayscale = useTransform(distanceFromCenter, [0, step * 0.8], ["0%", "100%"]);
    const blur = useTransform(distanceFromCenter, [0, step * 1.5], ["0px", "5px"]);
    const scale = useTransform(distanceFromCenter, [0, step], [1.15, 0.85]);
    // Fade cards that are far away (optimization + nice effect)
    const opacity = useTransform(distanceFromCenter, [step * 5, step * 8], [1, 0]);
    const zIndex = useTransform(distanceFromCenter, (d) => Math.round(1000 - d));

    // Diagonal coordinates
    const xPos = useTransform(position, (pos: number) => pos * Math.cos(angle));
    const yPos = useTransform(position, (pos: number) => pos * Math.sin(angle));

    const filterValue = useTransform(
        [grayscale, blur],
        ([g, b]) => \`grayscale(\${g}) blur(\${b})\`
    );

    return (
        <motion.div
            className="absolute rounded-2xl overflow-hidden shadow-2xl cursor-pointer pointer-events-auto bg-black"
            style={{
                width: cardWidth,
                height: cardHeight,
                x: xPos,
                y: yPos,
                scale,
                zIndex,
                opacity,
                filter: filterValue,
                willChange: 'transform, filter, opacity',
            }}
            onClick={onSelect}
            whileHover={{ scale: 1.2, transition: { duration: 0.2 } }}
        >
            <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
                draggable={false}
            />
        </motion.div>
    );
};

export default DiagonalFocus;
`
    },
    {
        id: 'notification-stack',
        name: 'Stack Carousel',
        index: 13,
        description: 'A draggable vertical stack of notification cards with smooth spring animations. Features depth-based scaling, draggable scrolling, and a floating scrollbar indicator.',
        tags: ['notification', 'stack', 'toast', 'cards', 'animation', 'draggable'],
        category: 'interaction',
        previewConfig: {},
        dependencies: ['framer-motion', 'react'],
        usage: `import { NotificationStack } from '@/components/ui/NotificationStack';

// Basic usage
<NotificationStack />

// With custom className
<NotificationStack className="h-full min-h-[500px]" />`,
        props: [
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes for container' },
        ],
        fullCode: `
"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform, useSpring, MotionValue } from "framer-motion";

// Types
interface NotificationCard {
    id: number;
    title: string;
    description: string;
    image: string;
    color: string;
}

// Sample Data
const defaultCards: NotificationCard[] = [
    {
        id: 1,
        title: "Quantum",
        description: "Atmospheric data visualization",
        image: "/carousel1.png",
        color: "#8b5cf6"
    },
    {
        id: 2,
        title: "Cybernetics",
        description: "Modular sound synthesis",
        image: "/carousel2.jpg",
        color: "#10b981"
    },
    {
        id: 3,
        title: "Nebula",
        description: "Connected node systems",
        image: "/carousel3.jpg",
        color: "#3b82f6"
    },
    {
        id: 4,
        title: "Chronos",
        description: "Empty space rendering",
        image: "/carousel4.jpg",
        color: "#f59e0b"
    },
    {
        id: 5,
        title: "Velocity",
        description: "Rhythmic signal processing",
        image: "/carousel5.jpg",
        color: "#ef4444"
    },
    {
        id: 6,
        title: "Horizon",
        description: "Peak performance metrics",
        image: "/carousel6.jpg",
        color: "#ec4899"
    },
];

// Hook to detect theme (returns true if site is in light mode)
function useTheme() {
    const [isLightMode, setIsLightMode] = useState(false);

    useEffect(() => {
        // Check initial theme
        const checkTheme = () => {
            const theme = document.documentElement.getAttribute("data-theme");
            setIsLightMode(theme === "light");
        };

        checkTheme();

        // Watch for theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === "data-theme") {
                    checkTheme();
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });
        return () => observer.disconnect();
    }, []);

    return isLightMode;
}

export function NotificationStackPreview() {
    const isLightMode = useTheme();
    // Invert: light mode site = dark carousel, dark mode site = light carousel
    const isDarkCarousel = isLightMode;

    return (
        <div className={\`w-full h-full flex items-center justify-center overflow-hidden relative \${isDarkCarousel ? 'bg-neutral-950' : 'bg-neutral-100'
            }\`}>
            {/* Background ambiance */}
            <div className={\`absolute inset-0 \${isDarkCarousel
                ? 'bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]'
                : 'bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.15),rgba(0,0,0,0))]'
                }\`} />
            <NotificationStack />
        </div>
    );
}

// Custom Scrollbar Component
function FloatingScrollbar({
    dragY,
    totalCards,
    onScrollChange,
    isDarkCarousel,
    gap,
}: {
    dragY: MotionValue<number>;
    totalCards: number;
    onScrollChange: (newY: number) => void;
    isDarkCarousel: boolean;
    gap: number;
}) {
    const scrollTrackRef = useRef<HTMLDivElement>(null);
    const THUMB_HEIGHT = 40;
    const TRACK_HEIGHT = 200;

    // Calculate scroll range
    const MIN_DRAG_Y = 300 - (totalCards - 1) * gap;
    const MAX_DRAG_Y = 300;
    const DRAG_RANGE = MAX_DRAG_Y - MIN_DRAG_Y;

    // Transform dragY to thumb position
    const thumbY = useTransform(dragY, (val: number) => {
        const clampedVal = Math.min(MAX_DRAG_Y, Math.max(MIN_DRAG_Y, val));
        const progress = (MAX_DRAG_Y - clampedVal) / (DRAG_RANGE || 1);
        return progress * (TRACK_HEIGHT - THUMB_HEIGHT);
    });

    const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!scrollTrackRef.current) return;
        const rect = scrollTrackRef.current.getBoundingClientRect();
        const clickY = e.clientY - rect.top;
        const progress = clickY / TRACK_HEIGHT;
        const newDragY = MAX_DRAG_Y - (progress * (DRAG_RANGE || 1));
        onScrollChange(newDragY);
    };

    return (
        <div
            ref={scrollTrackRef}
            className={\`absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-2 rounded-full backdrop-blur-sm cursor-pointer overflow-hidden \${isDarkCarousel ? 'bg-white/10' : 'bg-black/10'
                }\`}
            style={{ height: TRACK_HEIGHT, zIndex: 100000 }}
            onClick={handleTrackClick}
        >
            {/* Scroll Thumb with Glow */}
            <motion.div
                className={\`absolute left-0 right-0 w-2 rounded-full transition-colors cursor-grab active:cursor-grabbing \${isDarkCarousel
                    ? 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                    : 'bg-black shadow-[0_0_15px_rgba(0,0,0,0.3)]'
                    }\`}
                style={{
                    y: thumbY,
                    height: THUMB_HEIGHT,
                }}
                drag="y"
                dragConstraints={{ top: 0, bottom: TRACK_HEIGHT - THUMB_HEIGHT }}
                dragElastic={0}
                dragMomentum={false}
                onDrag={(_, info) => {
                    const currentThumbY = thumbY.get();
                    const newThumbY = Math.min(Math.max(0, currentThumbY + info.delta.y), TRACK_HEIGHT - THUMB_HEIGHT);
                    const progress = newThumbY / (TRACK_HEIGHT - THUMB_HEIGHT);
                    const newDragY = MAX_DRAG_Y - (progress * DRAG_RANGE);
                    onScrollChange(newDragY);
                }}
                whileHover={{ scaleX: 1.5 }}
                whileTap={{ scaleX: 1.5 }}
                onPointerDown={(e) => {
                    e.stopPropagation();
                }}
            />
        </div>
    );
}

export function NotificationStack({ className = "" }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [cards] = useState<NotificationCard[]>(defaultCards);
    const isLightMode = useTheme();
    const [impactDirection, setImpactDirection] = useState<'top' | 'bottom' | null>(null);

    // Responsive State stored in ref to avoid re-creating transforms
    const [isMobile, setIsMobile] = useState(false);
    const configRef = useRef({ gap: 280, center: 300 });

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 640;
            setIsMobile(mobile);
            configRef.current = {
                gap: mobile ? 180 : 280,
                center: mobile ? 220 : 300,
            };
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Invert: light mode site = dark carousel, dark mode site = light carousel
    const isDarkCarousel = isLightMode;

    // Scroll boundaries (Responsive)
    const GAP = isMobile ? 180 : 280;
    const CENTER = isMobile ? 220 : 300;
    const MIN_DRAG_Y = CENTER - (cards.length - 1) * GAP;
    const MAX_DRAG_Y = CENTER;

    // Vertical drag/scroll value - use spring directly for smooth dragging
    const dragY = useMotionValue(MAX_DRAG_Y);
    // Smoother spring physics with higher damping for less oscillation
    const y = useSpring(dragY, { stiffness: 300, damping: 35, mass: 0.8 });

    // Boundary Clamp on Resize
    useEffect(() => {
        const current = dragY.get();
        const clamped = Math.min(MAX_DRAG_Y, Math.max(MIN_DRAG_Y, current));
        if (current !== clamped) {
            dragY.set(clamped);
        }
    }, [isMobile]);

    const handleScrollChange = (newY: number) => {
        const clampedY = Math.min(MAX_DRAG_Y, Math.max(MIN_DRAG_Y, newY));
        dragY.set(clampedY);
    };

    const handleDrag = (_: any, info: { delta: { y: number } }) => {
        const currentY = dragY.get();
        let newY = currentY + info.delta.y;

        // Check if hitting boundaries
        if (newY > MAX_DRAG_Y) {
            // Hitting top boundary (first card)
            const overscroll = newY - MAX_DRAG_Y;
            newY = MAX_DRAG_Y + (overscroll * 0.15); // Rubber band effect
            if (!impactDirection) {
                setImpactDirection('top');
                setTimeout(() => setImpactDirection(null), 300);
            }
        } else if (newY < MIN_DRAG_Y) {
            // Hitting bottom boundary (last card)
            const overscroll = MIN_DRAG_Y - newY;
            newY = MIN_DRAG_Y - (overscroll * 0.15); // Rubber band effect
            if (!impactDirection) {
                setImpactDirection('bottom');
                setTimeout(() => setImpactDirection(null), 300);
            }
        }

        dragY.set(newY);
    };

    const handleDragEnd = () => {
        // Snap back to boundaries if overscrolled
        const currentY = dragY.get();
        if (currentY > MAX_DRAG_Y) {
            dragY.set(MAX_DRAG_Y);
        } else if (currentY < MIN_DRAG_Y) {
            dragY.set(MIN_DRAG_Y);
        }
    };

    return (
        <div
            ref={containerRef}
            className={\`w-full h-full flex items-center justify-center relative overflow-hidden \${className} \${isDarkCarousel ? 'bg-neutral-950' : 'bg-neutral-100'
                }\`}
            style={{
                perspective: 1000,
                isolation: "isolate",
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
        >
            {/* Background ambiance */}
            <div className={\`absolute inset-0 \${isDarkCarousel
                ? 'bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]'
                : 'bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.15),rgba(0,0,0,0))]'
                }\`} />

            {/* Impact Effect - Top */}
            <motion.div
                className={\`absolute top-0 left-0 right-0 h-32 pointer-events-none \${isDarkCarousel
                    ? 'bg-gradient-to-b from-white/20 to-transparent'
                    : 'bg-gradient-to-b from-black/10 to-transparent'
                    }\`}
                style={{ zIndex: 100001 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: impactDirection === 'top' ? 1 : 0 }}
                transition={{ duration: 0.15 }}
            />

            {/* Impact Effect - Bottom */}
            <motion.div
                className={\`absolute bottom-0 left-0 right-0 h-32 pointer-events-none \${isDarkCarousel
                    ? 'bg-gradient-to-t from-white/20 to-transparent'
                    : 'bg-gradient-to-t from-black/10 to-transparent'
                    }\`}
                style={{ zIndex: 100001 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: impactDirection === 'bottom' ? 1 : 0 }}
                transition={{ duration: 0.15 }}
            />

            {/* Scroll/Drag Surface - uses framer-motion drag for reliable capture */}
            <motion.div
                className="absolute inset-0 cursor-grab active:cursor-grabbing"
                style={{
                    touchAction: "none",
                    zIndex: 99999,
                }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0}
                dragMomentum={false}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                onDragStart={(e) => {
                    e.stopPropagation();
                }}
                onPointerDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                }}
            />

            {/* Cards Container */}
            <div className="relative w-full h-full flex items-center justify-center pointer-events-none" style={{ zIndex: 1 }}>
                {cards.map((card, index) => (
                    <StackCard
                        key={card.id}
                        card={card}
                        index={index}
                        y={y}
                        isDarkCarousel={isDarkCarousel}
                        gap={GAP}
                        center={CENTER}
                    />
                ))}
            </div>

            {/* Floating Scrollbar */}
            <FloatingScrollbar
                dragY={dragY}
                totalCards={cards.length}
                onScrollChange={handleScrollChange}
                isDarkCarousel={isDarkCarousel}
                gap={GAP}
            />
        </div>
    );
}

function StackCard({ card, index, y, isDarkCarousel, gap, center }: {
    card: NotificationCard;
    index: number;
    y: any;
    isDarkCarousel: boolean;
    gap: number;
    center: number;
}) {
    // Use refs for stable transform calculations
    const configRef = useRef({ gap, center, index });
    configRef.current = { gap, center, index };

    const baseOffset = index * gap;

    // Single transform for raw position
    const rawPos = useTransform(y, (currentY: number) => {
        const { gap: g, index: i } = configRef.current;
        return (i * g) + currentY;
    });

    // Responsive thresholds
    const BUFFER = 200;
    const BOTTOM_CURVE_START = center - BUFFER;
    const TOP_CURVE_START = center + BUFFER;

    // Position with symmetric compression at both ends
    const posTransform = useTransform(rawPos, (val: number) => {
        const { center: c } = configRef.current;
        const bottom = c - 200;
        const top = c + 200;
        if (val < bottom) {
            const diff = bottom - val;
            return bottom - (diff * 0.12);
        } else if (val > top) {
            const diff = val - top;
            return top + (diff * 0.12);
        }
        return val;
    });

    // Scale - symmetric at both ends
    const scale = useTransform(rawPos, (val: number) => {
        const { center: c, gap: g } = configRef.current;
        const distFromCenter = Math.abs(val - c);
        const threshold = g * 0.6;
        if (distFromCenter < threshold) return 1;
        return Math.max(0.65, 1 - ((distFromCenter - threshold) * 0.002));
    });

    // RotateX - symmetric curve effect (wheel-like)
    const rotateX = useTransform(rawPos, (val: number) => {
        const { center: c } = configRef.current;
        const bottom = c - 200;
        const top = c + 200;
        if (val < bottom) {
            const depth = bottom - val;
            return Math.min(60, depth * 0.25);
        } else if (val > top) {
            const depth = val - top;
            return Math.max(-60, -depth * 0.25);
        }
        return 0;
    });

    // Opacity - fade at edges symmetrically
    const opacity = useTransform(rawPos, (val: number) => {
        if (val < -50) return Math.max(0.3, 1 + (val + 50) * 0.01);
        if (val > 650) return Math.max(0.3, 1 - (val - 650) * 0.01);
        return 1;
    });

    // Z-index - items closest to center are on top
    const zIndex = useTransform(rawPos, (val: number) => {
        const { center: c } = configRef.current;
        const distFromCenter = Math.abs(val - c);
        return Math.max(1, 1000 - Math.round(distFromCenter));
    });

    // Translate Y for vertical positioning
    const translateY = useTransform(posTransform, (val: number) => {
        const { center: c } = configRef.current;
        return c - val;
    });

    return (
        <motion.div
            style={{
                y: translateY,
                scale,
                opacity,
                zIndex,
                rotateX,
                transformPerspective: 1200,
                transformOrigin: "center center",
                position: "absolute",
                willChange: "transform, opacity",
            }}
            className="w-full flex justify-center pointer-events-none"
        >
            <div className={\`
                w-[90vw] md:w-[98vw] max-w-[1000px] 
                h-[280px] md:h-[480px] 
                rounded-[20px] md:rounded-[30px] 
                overflow-hidden shadow-2xl
                relative group
                pointer-events-auto
                \${isDarkCarousel ? '' : 'ring-1 ring-black/10'}
            \`}>
                {/* Image Background */}
                <div className={\`absolute inset-0 \${isDarkCarousel ? 'bg-neutral-900' : 'bg-neutral-200'}\`}>
                    <img
                        src={card.image}
                        alt={card.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        draggable={false}
                    />
                    <div className={\`absolute inset-0 \${isDarkCarousel
                        ? 'bg-gradient-to-b from-transparent via-transparent to-black/80'
                        : 'bg-gradient-to-b from-transparent via-transparent to-white/90'
                        }\`} />
                </div>

                {/* Content */}
                <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                    <div className="transform transition-transform duration-500 group-hover:translate-y-[-10px]">
                        <div className="flex items-center gap-4 mb-2 md:mb-4">
                            <div className={\`h-[1px] w-8 md:w-12 \${isDarkCarousel ? 'bg-white/50' : 'bg-black/50'}\`} />
                            <span className={\`text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase \${isDarkCarousel ? 'text-white/70' : 'text-black/70'
                                }\`}>
                                Collection 0{card.id}
                            </span>
                        </div>

                        <h3 className={\`text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter mb-2 \${isDarkCarousel ? 'text-white' : 'text-black'
                            }\`} style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                            {card.title}
                        </h3>

                        <div className={\`overflow-hidden transition-all duration-500 max-h-0 opacity-0 group-hover:max-h-20 group-hover:opacity-100\`}>
                            <p className={\`text-lg font-light \${isDarkCarousel ? 'text-white/80' : 'text-black/80'
                                }\`}>{card.description}</p>
                        </div>
                    </div>
                </div>

                {/* Shine effect - Subtle scanline */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 pointer-events-none"
                    style={{ background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 1px, black 1px, black 2px)' }}
                />
            </div>
        </motion.div>
    );
}

export default NotificationStack;
`
    },
    {
        id: 'text-pressure',
        name: 'Text Pressure',
        index: 14,
        description: 'Variable font weight that responds to cursor pressure. Text characters dynamically adjust their weight based on cursor proximity.',
        tags: ['text', 'variable-font', 'interactive', 'weight', 'effect'],
        category: 'effect',
        previewConfig: { text: 'MORPHYS' },
        dependencies: ['react'],
        usage: `import { TextPressure } from '@/components/ui/TextPressure';

// Basic usage
<TextPressure text="MORPHYS" />

// With custom configuration
<TextPressure
    text="MORPHYS"
    config={{
        textColor: '#ff0000',
        minFontSize: 48,
    }}
/>`,
        props: [
            { name: 'text', type: 'string', default: "'MORPHYS'", description: 'Text to display' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' },
            { name: 'textColor', type: 'string', default: "'var(--foreground)'", description: 'Color of the text' },
            { name: 'minFontSize', type: 'number', default: '36', description: 'Minimum font size in pixels' },
            { name: 'config', type: 'object', default: '{}', description: 'Configuration object with text, textColor, minFontSize' },
        ],
        fullCode: `
"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface TextPressureProps {
    text?: string;
    fontFamily?: string;
    className?: string;
    textColor?: string;
    strokeColor?: string;
    strokeWidth?: boolean;
    minFontSize?: number;
    weight?: boolean;
    alpha?: boolean;
    config?: {
        text?: string;
        textColor?: string;
        minFontSize?: number;
    };
}

export function TextPressure({
    text = "MORPHYS",
    fontFamily = "Big Shoulders Display", // Default to the variable font (no quotes)
    className = "",
    textColor = "var(--foreground)",
    strokeColor = "#FF0000",
    strokeWidth = false,
    minFontSize = 36,
    weight = true,
    alpha = false,
    config,
}: TextPressureProps) {
    // Use config props if provided
    const displayText = config?.text || text;
    const displayColor = config?.textColor || textColor;
    const displayMinFontSize = config?.minFontSize || minFontSize;

    const containerRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const spansRef = useRef<(HTMLSpanElement | null)[]>([]);

    const mouseRef = useRef({ x: 0, y: 0 });
    const cursorRef = useRef({ x: 0, y: 0 });

    const [fontSize, setFontSize] = useState(displayMinFontSize);
    const [lineHeight, setLineHeight] = useState(1);

    const chars = displayText.split("");

    const dist = useCallback((a: { x: number; y: number }, b: { x: number; y: number }) => {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        return Math.sqrt(dx * dx + dy * dy);
    }, []);

    // Mouse/touch tracking
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            cursorRef.current = { x: e.clientX, y: e.clientY };
        };
        const handleTouchMove = (e: TouchEvent) => {
            const touch = e.touches[0];
            cursorRef.current = { x: touch.clientX, y: touch.clientY };
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("touchmove", handleTouchMove, { passive: true });

        // Initialize cursor position to center of container
        if (containerRef.current) {
            const { left, top, width, height } = containerRef.current.getBoundingClientRect();
            mouseRef.current = { x: left + width / 2, y: top + height / 2 };
            cursorRef.current = { x: left + width / 2, y: top + height / 2 };
        }

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("touchmove", handleTouchMove);
        };
    }, []);

    // Responsive font sizing
    const setSize = useCallback(() => {
        if (!containerRef.current || !titleRef.current) return;

        const { width: containerW, height: containerH } = containerRef.current.getBoundingClientRect();

        // "Big Shoulders Display" is very condensed, aspect ratio ~0.4 -> 0.5
        // We want the text to fill roughly 80% of width
        const charWidth = 0.5; // Approximation for condensed font
        let newFontSize = (containerW * 0.8) / (chars.length * charWidth);

        // Clamp between min and reasonable max (e.g., 300px or container height)
        newFontSize = Math.min(Math.max(newFontSize, displayMinFontSize), 800, containerH);

        setFontSize(newFontSize);
        setLineHeight(1);
    }, [chars.length, displayMinFontSize]);

    useEffect(() => {
        setSize();
        window.addEventListener("resize", setSize);
        return () => window.removeEventListener("resize", setSize);
    }, [setSize, displayText]);

    // Animation loop - updates font weight based on cursor proximity
    useEffect(() => {
        let rafId: number;

        const animate = () => {
            // Smooth cursor interpolation
            mouseRef.current.x += (cursorRef.current.x - mouseRef.current.x) * 0.15;
            mouseRef.current.y += (cursorRef.current.y - mouseRef.current.y) * 0.15;

            if (titleRef.current) {
                const titleRect = titleRef.current.getBoundingClientRect();
                const maxDist = titleRect.width * 0.5; // Influence radius

                spansRef.current.forEach((span) => {
                    if (!span) return;

                    const rect = span.getBoundingClientRect();
                    const charCenter = {
                        x: rect.left + rect.width / 2,
                        y: rect.top + rect.height / 2,
                    };

                    const d = dist(mouseRef.current, charCenter);

                    // Calculate weight: closer = heavier (up to 900), farther = lighter (down to 100)
                    const getWeight = (distance: number) => {
                        if (distance >= maxDist) return 100;
                        const ratio = 1 - (distance / maxDist);
                        return Math.floor(100 + ratio * 800); // 100 to 900
                    };

                    // Calculate alpha if enabled
                    const getAlpha = (distance: number) => {
                        if (distance >= maxDist) return 1;
                        const ratio = 1 - (distance / maxDist); // 1 at center, 0 at edge
                        return 0.5 + ratio * 0.5; // 0.5 to 1
                    };

                    const wght = weight ? getWeight(d) : 400;
                    const alph = alpha ? getAlpha(d) : 1;

                    span.style.opacity = alph.toString();
                    span.style.fontVariationSettings = \`'wght' \${wght}\`;
                });
            }

            rafId = requestAnimationFrame(animate);
        };

        animate();
        return () => cancelAnimationFrame(rafId);
    }, [weight, alpha, dist]);

    return (
        <div
            ref={containerRef}
            className={\`relative w-full h-full flex items-center justify-center overflow-hidden \${className}\`}
            style={{ background: "transparent" }}
        >
            <h1
                ref={titleRef}
                className="text-center flex justify-center items-center select-none"
                style={{
                    fontFamily: \`\${fontFamily}, sans-serif\`,
                    fontSize: fontSize,
                    lineHeight: 1,
                    color: displayColor,
                    WebkitTextStroke: strokeWidth ? \`1px \${strokeColor}\` : "none",
                    whiteSpace: "nowrap",
                    transformOrigin: "center center",
                    fontVariationSettings: "'wght' 100", // Initial light weight
                    textTransform: "uppercase",
                    letterSpacing: "0.02em",
                }}
            >
                {chars.map((char, i) => (
                    <span
                        key={i}
                        ref={(el) => { spansRef.current[i] = el; }}
                        style={{
                            display: "inline-block",
                            transition: "font-variation-settings 0.1s ease-out",
                        }}
                    >
                        {char === " " ? "\\u00A0" : char}
                    </span>
                ))}
            </h1>
        </div>
    );
}

export default TextPressure;
`
    },
    {
        id: 'fluid-height',
        name: 'Fluid Height',
        index: 15,
        description: 'Text with fluid height animation that grows on load and retracts on hover with a smooth neighbor effect.',
        tags: ['text', 'height', 'animation', 'hover', 'fluid'],
        category: 'animation',
        previewConfig: {},
        dependencies: ['framer-motion', 'react'],
        usage: `import FluidHeight from '@/components/ui/FluidHeight';

// Basic usage (displays "MORPHYS" by default)
<FluidHeight />

// With custom styling
<FluidHeight 
    className="text-[5rem]"
    showHint={false}
/>`,
        props: [
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes for text styling' },
            { name: 'containerClassName', type: 'string', default: "''", description: 'CSS classes for container' },
            { name: 'showHint', type: 'boolean', default: 'true', description: 'Show "Hover to retract" hint' },
        ],
        fullCode: `
"use client";

import React, { useState, useEffect } from 'react';
import { motion, useSpring } from 'framer-motion';

// Static preview for component cards
export function FluidHeightPreview() {
    return (
        <div className="w-full h-full flex items-center justify-center overflow-hidden">
            <style>{\`
                @import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700&display=swap');
                .fluid-preview-font {
                    font-family: 'Big Shoulders Display', sans-serif;
                    font-weight: 700;
                }
            \`}</style>
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
        <div className={\`relative w-full h-full flex flex-col items-center justify-center overflow-hidden font-sans \${containerClassName}\`}>
            {/* Import Big Shoulders Display */}
            <style>{\`
                @import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700&display=swap');
                
                .fluid-font {
                    font-family: 'Big Shoulders Display', sans-serif;
                    font-weight: 700;
                }
            \`}</style>

            {/* Main Container */}
            <motion.div
                animate={impactTrigger ? { y: [0, 20, -10, 5, 0] } : { y: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="relative z-10 flex -mt-[15%]"
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
                className={\`fluid-font leading-[0.8] block text-foreground \${className || 'text-[3rem] sm:text-[5rem] md:text-[8rem] lg:text-[11rem]'}\`}
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
`
    },
    {
        id: 'text-mirror',
        name: 'Text Mirror',
        index: 16,
        description: 'Interactive mirrored text that spreads vertically based on cursor position. Features smooth animations that respond to mouse movement and auto-reset on idle.',
        tags: ['text', 'mirror', 'cursor', 'interactive', 'effect', 'responsive'],
        category: 'effect',
        previewConfig: { text: 'MORPHYS' },
        dependencies: ['react'],
        usage: `import TextMirror from '@/components/ui/TextMirror';

// Basic usage
<TextMirror />

// With custom configuration
<TextMirror
    config={{
        text: 'MORPHYS',
        spread: 30,
        fontSize: 120,
        color: '#ff0000',
        idleTimeout: 5000,
    }}
/>`,
        props: [
            { name: 'config.text', type: 'string', default: "'MORPHYS'", description: 'Text to display and mirror' },
            { name: 'config.spread', type: 'number', default: '30', description: 'Maximum vertical spread in pixels' },
            { name: 'config.fontSize', type: 'number', default: '120', description: 'Font size in pixels' },
            { name: 'config.color', type: 'string', default: 'theme-based', description: 'Text color' },
            { name: 'config.idleTimeout', type: 'number', default: '5000', description: 'Auto-reset timeout in milliseconds' },
        ],
        fullCode: `
"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";

interface TextMirrorProps {
    text?: string;
    className?: string;
    hasTrigger?: boolean;
    config?: {
        idleTimeout?: number;
        spread?: number;
        color?: string;
        fontSize?: number;
    };
}

const TextMirror: React.FC<TextMirrorProps> = ({
    text = "MORPHYS",
    className = "",
    hasTrigger = true,
    config = {},
}) => {
    const {
        idleTimeout = 5000,
        spread = 30,
        color: configColor,
        fontSize = 120,
    } = config;

    // Theme detection
    const [isLightMode, setIsLightMode] = useState(false);
    useEffect(() => {
        const checkTheme = () => {
            const theme = document.documentElement.getAttribute("data-theme");
            // Check if theme is explicitly "light", otherwise default to dark mode
            const isLight = theme === "light";
            setIsLightMode(isLight);
        };
        // Initial check
        checkTheme();

        // Observer for theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === "data-theme") {
                    checkTheme();
                }
            });
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["data-theme"]
        });
        return () => observer.disconnect();
    }, []);

    // Use config color if provided, otherwise use theme-aware default
    const color = configColor || (isLightMode ? "#000000" : "#ffffff");

    const [isIdle, setIsIdle] = useState(true);
    const idleTimer = useRef<NodeJS.Timeout | null>(null);

    // Velocity tracking for direction
    const velocityX = useMotionValue(0);
    const velocityY = useMotionValue(0);

    // Previous position to calculate delta
    const prevX = useRef(0);
    const prevY = useRef(0);

    const containerRef = useRef<HTMLDivElement>(null);

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Responsive font size
    const responsiveFontSize = isMobile ? Math.min(fontSize, 48) : fontSize;

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (idleTimer.current) {
                clearTimeout(idleTimer.current);
            }

            const dx = e.clientX - prevX.current;
            const dy = e.clientY - prevY.current;

            velocityX.set(dx);
            velocityY.set(dy);

            prevX.current = e.clientX;
            prevY.current = e.clientY;

            setIsIdle(false);

            idleTimer.current = setTimeout(() => {
                setIsIdle(true);
                velocityX.set(0);
                velocityY.set(0);
            }, idleTimeout);
        };

        const handleMouseLeave = () => {
            setIsIdle(true);
            velocityX.set(0);
            velocityY.set(0);
            if (idleTimer.current) clearTimeout(idleTimer.current);
        };

        const handleMouseEnter = (e: MouseEvent) => {
            prevX.current = e.clientX;
            prevY.current = e.clientY;
            setIsIdle(false);
        };

        container.addEventListener("mousemove", handleMouseMove);
        container.addEventListener("mouseleave", handleMouseLeave);
        container.addEventListener("mouseenter", handleMouseEnter);

        return () => {
            container.removeEventListener("mousemove", handleMouseMove);
            container.removeEventListener("mouseleave", handleMouseLeave);
            container.removeEventListener("mouseenter", handleMouseEnter);
            if (idleTimer.current) clearTimeout(idleTimer.current);
        };
    }, [idleTimeout, velocityX, velocityY]);

    // Generate clones
    const cloneCount = 6;
    const clones = Array.from({ length: cloneCount });

    return (
        <div
            ref={containerRef}
            className={\`relative flex items-center justify-center w-full h-full overflow-hidden \${className}\`}
        >
            <div className="relative" style={{ perspective: "1000px" }}>
                {clones.map((_, i) => {
                    // Use transforms based on velocity
                    // We limit the offset so it doesn't fly off screen
                    // Use spread to control sensitivity
                    const spreadFactor = spread / 50; // Normalize

                    const x = useTransform(velocityX, (v) => {
                        if (isIdle) return 0;
                        const val = v * (i + 1) * spreadFactor;
                        return Math.max(Math.min(val, 300), -300);
                    });

                    const y = useTransform(velocityY, (v) => {
                        if (isIdle) return 0;
                        const val = v * (i + 1) * spreadFactor;
                        return Math.max(Math.min(val, 300), -300);
                    });

                    // Spring the values for smoothness
                    const springX = useSpring(x, { stiffness: 150, damping: 15 });
                    const springY = useSpring(y, { stiffness: 150, damping: 15 });

                    // Opacity fades for further clones
                    const opacity = 1 - (i / cloneCount) * 0.8;

                    // Z-index: main text on top (handled after loop), clones behind? 
                    // Or clones in front with mix-blend-mode.
                    // The images show "outline" style clones.

                    return (
                        <motion.div
                            key={i}
                            className="absolute top-0 left-0 flex items-center justify-center w-full h-full pointer-events-none"
                            style={{
                                x: springX,
                                y: springY,
                                zIndex: 10 - i, // Closest to main text is higher
                                opacity: isIdle ? 0 : opacity, // Fade out when idle
                            }}
                            animate={{
                                opacity: isIdle ? 0 : opacity,
                                scale: isIdle ? 0.95 : 1, // Slight shrink on idle
                            }}
                            transition={{ duration: 0.5 }}
                        >
                            <span
                                style={{
                                    fontSize: \`\${responsiveFontSize}px\`,
                                    fontWeight: 900,
                                    color: "transparent",
                                    WebkitTextStroke: \`1px \${color}\`,
                                    fontFamily: "Inter, sans-serif",
                                    textTransform: "uppercase",
                                    whiteSpace: "nowrap"
                                }}
                            >
                                {text}
                            </span>
                        </motion.div>
                    );
                })}

                {/* Main Text */}
                <motion.div
                    className="relative z-20"
                    style={{
                        // The main text stays relatively still or just slight parallax
                        x: useSpring(useTransform(velocityX, v => v * 0.1), { stiffness: 200, damping: 20 }),
                        y: useSpring(useTransform(velocityY, v => v * 0.1), { stiffness: 200, damping: 20 }),
                    }}
                >
                    <span
                        style={{
                            fontSize: \`\${responsiveFontSize}px\`,
                            fontWeight: 900,
                            color: color,
                            fontFamily: "Inter, sans-serif",
                            textTransform: "uppercase",
                            whiteSpace: "nowrap"
                        }}
                    >
                        {text}
                    </span>
                </motion.div>
            </div>

            {/* Instructions/Subtitle */}
            {hasTrigger && (
                <div className="absolute bottom-10 text-foreground/50 text-sm font-light tracking-widest pointer-events-none">
                    MOVE CURSOR To ACTIVATE
                </div>
            )}
        </div>
    );
};

export default TextMirror;
`
    },
    {
        id: 'step-morph',
        name: 'Step Morph',
        index: 17,
        description: 'Stair-stepped text that expands with smooth weight transitions on hover. Letters are arranged in a diagonal staircase pattern.',
        tags: ['morph', 'text', 'steps', 'animation', 'interactive'],
        category: 'interaction',
        previewConfig: {},
        dependencies: ['framer-motion', 'react'],
        usage: `import StepMorph from '@/components/ui/StepMorph';

// Basic usage (displays "MORPHYS" by default)
<StepMorph />

// With custom text and step size
<StepMorph 
    text="HELLO"
    stepSize={20}
    showHint={false}
/>`,
        props: [
            { name: 'text', type: 'string', default: "'MORPHYS'", description: 'Text to display' },
            { name: 'stepSize', type: 'number', default: '28', description: 'Vertical step size between letters in pixels' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes for text' },
            { name: 'showHint', type: 'boolean', default: 'true', description: 'Show "Hover to expand" hint' },
        ],
        fullCode: `
"use client";

import React, { useState, useEffect } from "react";
import { motion, useSpring } from "framer-motion";

interface StepMorphProps {
    text?: string;
    className?: string;
    containerClassName?: string;
    innerClassName?: string;
    stepSize?: number;
    showHint?: boolean;
}

const StepMorph: React.FC<StepMorphProps> = ({
    text = "MORPHYS",
    className = "",
    containerClassName = "",
    innerClassName = "pb-20 pt-10",
    stepSize = 28,
    showHint = true,
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile viewport
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Responsive config
    const responsiveStepSize = isMobile ? Math.min(stepSize, 14) : stepSize;
    const fontHeight = isMobile ? 50 : 110;

    return (
        <div
            className={\`relative w-full h-full flex items-center justify-center overflow-hidden font-sans \${containerClassName}\`}
        >
            <style>{\`
                @import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@100..900&display=swap');
                .step-morph-font {
                    font-family: 'Big Shoulders Display', sans-serif;
                }
            \`}</style>

            <div
                className={\`relative flex items-start justify-center cursor-pointer \${innerClassName}\`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {text.split("").map((char, index) => (
                    <Letter
                        key={index}
                        char={char}
                        index={index}
                        total={text.length}
                        stepSize={responsiveStepSize}
                        isHovered={isHovered}
                        className={className}
                        fontHeight={fontHeight}
                        isMobile={isMobile}
                    />
                ))}
            </div>

            {showHint && (
                <div className="absolute bottom-8 left-0 right-0 text-center text-foreground/40 text-xs tracking-[0.2em] font-light uppercase">
                    Hover to expand
                </div>
            )}
        </div>
    );
};

interface LetterProps {
    char: string;
    index: number;
    total: number;
    stepSize: number;
    isHovered: boolean;
    className?: string;
    fontHeight: number;
    isMobile: boolean;
}

const Letter: React.FC<LetterProps> = ({
    char,
    index,
    total,
    stepSize,
    isHovered,
    className,
    fontHeight,
    isMobile
}) => {
    // 1. Calculate Transform Origin (0% to 100%)
    const originYPercentage = (index / (total - 1)) * 100;

    // 2. Calculate Required Scale
    //    Total gap span = (total letters - 1) * stepSize
    const totalGap = (total - 1) * stepSize;

    // Scale Logic:
    // EXACT calculation: To fill the gap precisely, we must scale by this ratio.
    const fullScale = (fontHeight + totalGap) / fontHeight;

    const targetScale = isHovered ? fullScale : 1;
    const targetWeight = isHovered ? 800 : 100;

    // 3. Spring Animation
    const scaleY = useSpring(1, {
        stiffness: 120,
        damping: 18,
        mass: 0.6
    });

    // Spring for weight
    const weight = useSpring(100, {
        stiffness: 100,
        damping: 20
    });

    useEffect(() => {
        scaleY.set(targetScale);
        weight.set(targetWeight);
    }, [targetScale, targetWeight, scaleY, weight]);

    // Responsive font size class
    const fontSizeClass = className || (isMobile ? 'text-[3.5rem]' : 'text-[8rem]');

    return (
        <div
            className="flex flex-col items-center mx-[-0.02em]"
            style={{
                marginTop: \`\${index * stepSize}px\`
            }}
        >
            <motion.span
                className={\`step-morph-font uppercase leading-[0.85] text-foreground block select-none \${fontSizeClass}\`}
                style={{
                    scaleY,
                    fontWeight: weight,
                    transformOrigin: \`50% \${originYPercentage}%\`,
                    willChange: "transform, font-weight",
                    height: \`\${fontHeight}px\`,
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                {char}
            </motion.span>
        </div>
    );
};

// Static preview for component cards
export function StepMorphPreview() {
    return (
        <div className="w-full h-full flex items-center justify-center overflow-hidden">
            <style>{\`
                @import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@100..900&display=swap');
                .step-morph-preview-font {
                    font-family: 'Big Shoulders Display', sans-serif;
                    font-weight: 100;
                }
            \`}</style>
            <div className="relative flex items-start justify-center">
                {"MORPHYS".split("").map((char, index) => (
                    <span
                        key={index}
                        className="step-morph-preview-font text-[2rem] md:text-[2.5rem] uppercase leading-none text-foreground block"
                        style={{
                            marginTop: \`\${index * 12}px\`,
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

export default StepMorph;
`
    },
    {
        id: 'center-menu',
        name: 'Center Menu',
        index: 18,
        description: 'A centered navigation menu that expands smoothly from a compact icon. Features theme toggle, navigation links, and responsive design that adapts between mobile and desktop layouts.',
        tags: ['menu', 'center', 'expand', 'animation', 'navigation', 'responsive'],
        category: 'layout',
        previewConfig: {},
        dependencies: ['framer-motion', 'react', 'lucide-react'],
        usage: `import { CenterMenu } from '@/components/ui/CenterMenu';

// Basic usage
<CenterMenu />

// With custom className
<CenterMenu className="absolute bottom-8" />`,
        props: [
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes for positioning' },
        ],
        fullCode: `
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, ArrowUpRight } from "lucide-react";

export const CenterMenu = ({ className = "" }: { className?: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined" && document.documentElement.classList.contains('dark')) {
            setIsDarkMode(true);
        }
    }, []);

    // Detect mobile viewport
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const toggleTheme = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        if (newMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const menuItems = [
        { label: "Work", href: "#" },
        { label: "Studio", href: "#" },
        { label: "News", href: "#" },
        { label: "Contact", href: "#" }
    ];

    const socialLinks = [
        { label: "Instagram", href: "#" },
        { label: "Twitter", href: "#" },
        { label: "LinkedIn", href: "#" }
    ];

    // Define theme-based colors directly
    const bgColor = isDarkMode ? "#1f1f1f" : "#e7e5df";
    const textColor = isDarkMode ? "#ffffff" : "#171717";
    const textMuted = isDarkMode ? "#a3a3a3" : "#737373";
    const borderColor = isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.2)";
    const dividerColor = isDarkMode ? "#262626" : "#e5e5e5";
    const dotColor = isDarkMode ? "#ffffff" : "#171717";
    const closeBtnBg = isDarkMode ? "#262626" : "#e5e5e5";
    const toggleBtnBg = isDarkMode ? "#262626" : "#ffffff";
    const toggleBtnBorder = isDarkMode ? "#404040" : "#e5e5e5";

    // Responsive dimensions
    const pillHeight = isMobile ? 48 : 64;
    const pillRadius = isMobile ? 24 : 32;
    const triggerSize = isMobile ? 48 : 64;
    const expandedWidth = isMobile ? 280 : 340;
    const expandedHeight = isMobile ? 340 : 420;
    const expandedRadius = isMobile ? 20 : 24;

    // Menu content component (shared between mobile and desktop)
    const MenuContent = () => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={\`flex flex-col w-full h-full \${isMobile ? 'p-5 pt-5' : 'p-8 pt-20'}\`}
        >
            {/* Main Navigation */}
            <nav className="flex flex-col gap-2">
                {menuItems.map((item, idx) => (
                    <motion.a
                        key={item.label}
                        href={item.href}
                        className={\`group flex items-center justify-between font-semibold \${isMobile ? 'text-xl' : 'text-3xl'}\`}
                        style={{ color: textColor }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + idx * 0.05 }}
                    >
                        <span>{item.label}</span>
                        <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            whileHover={{ opacity: 1, x: 0 }}
                            className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                        >
                            <ArrowUpRight
                                className={isMobile ? 'w-4 h-4' : 'w-6 h-6'}
                                style={{ color: textMuted }}
                            />
                        </motion.span>
                    </motion.a>
                ))}
            </nav>

            {/* Footer: Socials & Theme */}
            <div
                className={\`mt-auto flex items-end justify-between \${isMobile ? 'pt-4' : 'pt-8'}\`}
                style={{ borderTop: \`1px solid \${dividerColor}\` }}
            >
                <div className="flex flex-col gap-2">
                    {socialLinks.map((social, idx) => (
                        <motion.a
                            key={social.label}
                            href={social.href}
                            className={\`font-medium transition-colors \${isMobile ? 'text-xs' : 'text-sm'}\`}
                            style={{ color: textMuted }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + idx * 0.05 }}
                        >
                            {social.label}
                        </motion.a>
                    ))}
                </div>

                {/* Theme Toggle Button */}
                <motion.button
                    type="button"
                    onClick={toggleTheme}
                    className={\`group relative rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all \${isMobile ? 'w-10 h-10' : 'w-12 h-12'}\`}
                    style={{
                        backgroundColor: toggleBtnBg,
                        border: \`1px solid \${toggleBtnBorder}\`,
                    }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="relative">
                        {isDarkMode ? (
                            <Sun className={isMobile ? 'w-4 h-4' : 'w-5 h-5'} style={{ color: "#ffffff" }} />
                        ) : (
                            <Moon className={isMobile ? 'w-4 h-4' : 'w-5 h-5'} style={{ color: "#171717" }} />
                        )}
                    </div>
                </motion.button>
            </div>
        </motion.div>
    );

    // Mobile Layout - Pills in row, menu expands centered below
    if (isMobile) {
        return (
            <div className={\`w-full min-h-[600px] flex flex-col items-center pt-10 overflow-hidden \${className}\`}>
                <div className="relative flex flex-col items-center z-50 font-sans">
                    {/* Top Row: Logo Pill + Trigger */}
                    <div className="flex items-center gap-2">
                        {/* Logo Pill */}
                        <motion.div
                            layout
                            className="flex items-center justify-center px-5 shadow-lg"
                            style={{
                                height: pillHeight,
                                borderRadius: pillRadius,
                                backgroundColor: bgColor,
                                border: \`1px solid \${borderColor}\`,
                            }}
                        >
                            <span
                                className="text-base font-bold tracking-tight cursor-default"
                                style={{ color: textColor }}
                            >
                                Morphys
                            </span>
                        </motion.div>

                        {/* Trigger Button */}
                        <motion.button
                            className="flex items-center justify-center shadow-lg focus:outline-none"
                            style={{
                                width: triggerSize,
                                height: triggerSize,
                                borderRadius: pillRadius,
                                backgroundColor: bgColor,
                                border: \`1px solid \${borderColor}\`,
                            }}
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            <motion.div
                                animate={{ scale: isOpen ? 0 : 1, opacity: isOpen ? 0 : 1 }}
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: dotColor }}
                            />
                            <motion.div
                                className="absolute flex items-center justify-center pointer-events-none"
                                animate={{ scale: isOpen ? 1 : 0, opacity: isOpen ? 1 : 0 }}
                                initial={{ scale: 0, opacity: 0 }}
                            >
                                <div
                                    className="w-6 h-6 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: closeBtnBg }}
                                >
                                    <div
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{ backgroundColor: dotColor }}
                                    />
                                </div>
                            </motion.div>
                        </motion.button>
                    </div>

                    {/* Expanded Menu - Centered below pills */}
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                className="absolute shadow-lg overflow-hidden z-40"
                                style={{
                                    backgroundColor: bgColor,
                                    border: \`1px solid \${borderColor}\`,
                                    top: pillHeight + 8, // Below the pills with gap
                                    left: '50%',
                                    x: '-50%', // Center horizontally
                                }}
                                initial={{
                                    width: triggerSize,
                                    height: triggerSize,
                                    borderRadius: pillRadius,
                                    opacity: 0,
                                    scale: 0.8,
                                }}
                                animate={{
                                    width: expandedWidth,
                                    height: expandedHeight,
                                    borderRadius: expandedRadius,
                                    opacity: 1,
                                    scale: 1,
                                }}
                                exit={{
                                    width: triggerSize,
                                    height: triggerSize,
                                    borderRadius: pillRadius,
                                    opacity: 0,
                                    scale: 0.8,
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 260,
                                    damping: 20,
                                }}
                            >
                                <MenuContent />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        );
    }

    // Desktop Layout - Original horizontal expansion
    return (
        <div className={\`w-full min-h-[600px] flex flex-col items-center pt-10 overflow-hidden \${className}\`}>
            <div className="relative flex items-start gap-4 z-50 font-sans">
                {/* 1. Logo Pill */}
                <motion.div
                    layout
                    className="flex items-center justify-center px-8 shadow-lg"
                    style={{
                        height: pillHeight,
                        borderRadius: pillRadius,
                        backgroundColor: bgColor,
                        border: \`1px solid \${borderColor}\`,
                    }}
                >
                    <span
                        className="text-xl font-bold tracking-tight cursor-default"
                        style={{ color: textColor }}
                    >
                        Morphys
                    </span>
                </motion.div>

                {/* 2. Trigger Button / Expanding Menu */}
                <div className="relative" style={{ width: triggerSize, height: triggerSize }}>
                    <motion.div
                        layout
                        className="absolute top-0 left-0 shadow-lg overflow-hidden z-50"
                        style={{
                            backgroundColor: bgColor,
                            border: \`1px solid \${borderColor}\`,
                        }}
                        initial={false}
                        animate={{
                            width: isOpen ? expandedWidth : triggerSize,
                            height: isOpen ? expandedHeight : triggerSize,
                            borderRadius: isOpen ? expandedRadius : pillRadius,
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                        }}
                    >
                        {/* The Trigger Button */}
                        <button
                            className="absolute top-0 left-0 z-20 flex items-center justify-center focus:outline-none"
                            style={{ width: triggerSize, height: triggerSize }}
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            <motion.div
                                animate={{ scale: isOpen ? 0 : 1, opacity: isOpen ? 0 : 1 }}
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: dotColor }}
                            />
                            <motion.div
                                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                animate={{ scale: isOpen ? 1 : 0, opacity: isOpen ? 1 : 0 }}
                                initial={{ scale: 0, opacity: 0 }}
                            >
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: closeBtnBg }}
                                >
                                    <div
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: dotColor }}
                                    />
                                </div>
                            </motion.div>
                        </button>

                        {/* Expanded Menu Content */}
                        <AnimatePresence>
                            {isOpen && <MenuContent />}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

`
    },
    {
        id: 'glass-surge',
        name: 'Glass Surge',
        index: 19,
        description: 'An optical distortion effect that applies a smooth, liquid-like surge to text or content on hover. Uses SVG turbulence and displacement maps to create organic bending.',
        tags: ['text', 'glass', 'distortion', 'hover', 'animation', 'svg', 'liquid'],
        category: 'effect',
        previewConfig: { text: 'MORPHYS' },
        dependencies: ['react'],
        usage: `import { GlassSurge } from '@/components/ui';

// Basic Usage
<GlassSurge 
    text="SURGE"
    className="text-6xl font-bold"
/>

// Wrapping Custom Content
<GlassSurge>
    <div className="bg-blue-500 text-white p-4 rounded-lg">
        Hover Me
    </div>
</GlassSurge>`,
        props: [
            { name: 'text', type: 'string', default: "'MORPHYS'", description: 'Text to display (optional if children provided)' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' },
            { name: 'children', type: 'ReactNode', default: 'undefined', description: 'Content to apply the refraction effect to' },
        ],
        fullCode: `
"use client";

import React, { useRef, useEffect, useId } from "react";

interface GlassSurgeProps {
    className?: string;
    text?: string;
    children?: React.ReactNode;
}

export const GlassSurge = ({ text = "MORPHYS", className = "", children }: GlassSurgeProps) => {
    // Generate a unique ID for the filter to avoid conflicts
    const id = useId();
    const filterId = \`glass-surge-filter-\${id}\`;
    const turbulenceRef = useRef<SVGFETurbulenceElement>(null);
    const displacementRef = useRef<SVGFEDisplacementMapElement>(null);
    const targetScale = useRef(0);
    const currentScale = useRef(0);

    useEffect(() => {
        const turbulence = turbulenceRef.current;
        const displacement = displacementRef.current;
        if (!turbulence || !displacement) return;

        let frame = 0;
        let animationFrameId: number;

        const animate = () => {
            frame++;
            // Adjusted frequency for visible but smooth ripples
            const freqY = 0.015 + Math.sin(frame * 0.02) * 0.004;
            const freqX = 0.01 + Math.cos(frame * 0.02) * 0.004;

            turbulence.setAttribute("baseFrequency", \`\${freqX} \${freqY}\`);

            // Smoothly interpolate scale
            const diff = targetScale.current - currentScale.current;
            if (Math.abs(diff) > 0.01) {
                currentScale.current += diff * 0.1; // Ease factor
                displacement.setAttribute("scale", currentScale.current.toString());
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    const content = children || (
        <span className="text-foreground">{text}</span>
    );

    return (
        <div
            className={\`relative inline-block \${className}\`}
            onMouseEnter={() => { targetScale.current = 50; }} // Increased scale for "more bend" 
            onMouseLeave={() => { targetScale.current = 0; }}
        >
            <svg className="fixed top-0 left-0 w-0 h-0 pointer-events-none" aria-hidden="true">
                <defs>
                    <filter
                        id={filterId}
                        colorInterpolationFilters="linearRGB"
                        filterUnits="userSpaceOnUse"
                        primitiveUnits="userSpaceOnUse"
                        x="-50%"
                        y="-50%"
                        width="200%"
                        height="200%"
                    >
                        {/* 
                            Turbulence creates the "noise" or "liquid" texture. 
                            baseFrequency determines the density of the liquid ripples.
                        */}
                        <feTurbulence
                            ref={turbulenceRef}
                            type="fractalNoise"
                            baseFrequency="0.01 0.015" // Restored to visible ripple range
                            numOctaves="2"
                            seed="5"
                            result="noise"
                        />
                        {/*
                             Gaussian blur smooths the noise to prevent jagged edges
                             scale determines the intensity of the distortion.
                        */}
                        <feGaussianBlur
                            in="noise"
                            stdDeviation="1.5" // Balanced blur for smoothness + definition
                            result="smoothed"
                        />
                        {/* 
                            DisplacementMap uses the noise to push pixels around.
                        */}
                        <feDisplacementMap
                            ref={displacementRef}
                            in="SourceGraphic"
                            in2="smoothed"
                            scale="0" // Start at 0
                            xChannelSelector="R"
                            yChannelSelector="G"
                        />
                    </filter>
                </defs>
            </svg>

            {/* Apply the filter to the content */}
            <div
                style={{
                    filter: \`url(#\${filterId})\`,
                    transform: "translateZ(0)" // GPU acceleration hint
                }}
            >
                {content}
            </div>
        </div>
    );
};

export default GlassSurge;
`
    },
    {
        id: 'layered-image-showcase',
        name: 'Layered Image Showcase',
        index: 20,
        description: 'A sophisticated image gallery with staggered letter animations on hover. Features smooth background transitions and customizable accent colors.',
        tags: ['image', 'gallery', 'hover', 'animation', 'reveal', 'text-animation'],
        category: 'interaction',
        previewConfig: {},
        dependencies: ['framer-motion', 'react'],
        usage: `import { LayeredImageShowcase } from '@/components/ui';

// Basic usage
<LayeredImageShowcase />

// With custom configuration
<LayeredImageShowcase 
    config={{
        title: "MORPHYS",
        accentColor: "#FF3333",
        textColor: "#ffffff"
    }}
/>`,
        props: [
            { name: 'className', type: 'string', default: "'h-full min-h-[500px]'", description: 'Additional CSS classes for height/styling' },
            { name: 'config', type: 'object', default: '{}', description: 'Configuration object with title, accentColor, and textColor' },
        ],
        fullCode: `
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
        <div className={\`relative w-full bg-black overflow-hidden font-sans \${className}\`}>
            <style jsx global>{\`
                @font-face {
                    font-family: 'Overheat';
                    src: url('/overheat-regular.ttf') format('truetype');
                    font-weight: normal;
                    font-style: normal;
                }
            \`}</style>
            {/* Background Images */}
            <div className="absolute inset-0 z-0">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className={\`absolute inset-0 w-full h-full transition-opacity duration-500 ease-linear pointer-events-none \${hoveredIndex === index ? 'opacity-100' : 'opacity-0'}\`}
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
`
    },
    {
        id: 'impact-text',
        name: 'Loading 1',
        index: 21,
        description: 'A dynamic loading animation with smooth wave-like font weight transitions. Letters morph between thin and bold weights with italic effects in a continuous loop.',
        tags: ['text', 'loading', 'wave', 'animation', 'variable-font', 'weight'],
        category: 'animation',
        previewConfig: {
            text: 'LOADING',
            fontSize: 80
        },
        dependencies: ['framer-motion', 'react'],
        usage: `import { ImpactText } from '@/components/ui';

// Basic usage
<ImpactText />

// Custom configuration
<ImpactText
    text="STARTING"
    config={{
        fontSize: 120,
        color: '#ff0000',
        kerning: 2
    }}
/>`,
        props: [
            { name: 'text', type: 'string', default: "'MORPHYS'", description: 'Text to animate' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' },
            { name: 'config', type: 'object', default: '{}', description: 'Configuration object' },
        ],
        fullCode: `
"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback, useMemo } from "react";

// Hook to detect mobile screen size
function useResponsiveSize(baseFontSize: number) {
    const [fontSize, setFontSize] = useState(baseFontSize);

    useEffect(() => {
        const updateSize = () => {
            const width = window.innerWidth;
            if (width < 480) {
                // Mobile small
                setFontSize(Math.min(baseFontSize, Math.max(32, baseFontSize * 0.35)));
            } else if (width < 768) {
                // Mobile
                setFontSize(Math.min(baseFontSize, Math.max(48, baseFontSize * 0.5)));
            } else if (width < 1024) {
                // Tablet
                setFontSize(Math.min(baseFontSize, baseFontSize * 0.75));
            } else {
                // Desktop
                setFontSize(baseFontSize);
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, [baseFontSize]);

    return fontSize;
}

interface ImpactTextProps {
    className?: string;
    text?: string;
    config?: {
        fontSize?: number;
        color?: string;
        kerning?: number;
    };
}

// 0: Initial (All Thin, Normal)
// 1: Sequence 1 (Gradient Thin->Bold, Italic)
// 2: Sequence 2 (Gradient Bold->Thin, Normal)
type LetterState = 0 | 1 | 2;

export function ImpactText({
    className,
    text = "MORPHYS",
    config = {},
}: ImpactTextProps) {
    const letters = text.split("");
    const [phase, setPhase] = useState<"entering" | "wave">("entering");
    const [letterStates, setLetterStates] = useState<LetterState[]>(
        new Array(letters.length).fill(0)
    );
    const [isAnimating, setIsAnimating] = useState(false);

    const baseFontSize = config.fontSize ?? 100;
    const color = config.color ?? "var(--foreground)";
    const baseKerning = config.kerning ?? -20;

    // Use responsive font size
    const responsiveFontSize = useResponsiveSize(baseFontSize);

    // Scale kerning proportionally with font size
    const responsiveKerning = useMemo(() => {
        const scale = responsiveFontSize / baseFontSize;
        return baseKerning * scale;
    }, [responsiveFontSize, baseFontSize, baseKerning]);

    // Blur reveal container animation
    const containerVariants = {
        hidden: { opacity: 1 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.1,
            },
        },
    };

    // Wave animation logic
    const runWaveAnimation = useCallback(async () => {
        if (isAnimating) return;
        setIsAnimating(true);

        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        const stepDelay = 120; // Delay between each letter

        // Initial Start: We are at State 0.
        // We want to enter the loop of 1 -> 2 -> 1 -> 2

        // On first run, we define the "next" state targets
        let nextState: LetterState = 1;

        while (true) {
            if (nextState === 1) {
                // Sequence 1: Forward Wave (0/2 -> 1)
                for (let i = 0; i < letters.length; i++) {
                    setLetterStates(prev => {
                        const newStates = [...prev];
                        newStates[i] = 1;
                        return newStates;
                    });
                    await delay(stepDelay);
                }
                nextState = 2; // Next target is Sequence 2
            } else {
                // Sequence 2: Backward Wave (1 -> 2)
                for (let i = letters.length - 1; i >= 0; i--) {
                    setLetterStates(prev => {
                        const newStates = [...prev];
                        newStates[i] = 2;
                        return newStates;
                    });
                    await delay(stepDelay);
                }
                nextState = 1; // Next target is Sequence 1
            }

            // Pause between sequences
            await delay(2000);
        }
    }, [letters.length, isAnimating]);

    // Start wave animation after entrance
    useEffect(() => {
        if (phase === "wave" && !isAnimating) {
            runWaveAnimation();
        }
    }, [phase, isAnimating, runWaveAnimation]);

    return (
        <div
            className={cn(
                "relative flex items-center justify-center w-full h-full overflow-hidden bg-transparent",
                className
            )}
        >
            <motion.div
                className="flex flex-wrap justify-center"
                style={{ gap: responsiveKerning }}
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                onAnimationComplete={() => {
                    setTimeout(() => setPhase("wave"), 800);
                }}
            >
                {letters.map((char, index) => (
                    <Letter
                        key={index}
                        char={char}
                        index={index}
                        fontSize={responsiveFontSize}
                        color={color}
                        state={letterStates[index]}
                        phase={phase}
                        totalLetters={letters.length}
                    />
                ))}
            </motion.div>
        </div>
    );
}

function Letter({
    char,
    index,
    fontSize,
    color,
    state,
    phase,
    totalLetters
}: {
    char: string,
    index: number,
    fontSize: number,
    color: string,
    state: LetterState,
    phase: "entering" | "wave",
    totalLetters: number
}) {
    // Calculate weights for different states
    const minWeight = 200;
    const maxWeight = 700;

    // Avoid division by zero
    const progress = totalLetters > 1 ? index / (totalLetters - 1) : 1;

    // State 1: Gradient Thin -> Bold (Left to Right)
    // Index 0 = Min, Index N = Max
    const weightSeq1 = minWeight + (progress * (maxWeight - minWeight));

    // State 2: Gradient Bold -> Thin (Left to Right)
    // Index 0 = Max, Index N = Min
    // This is effectively reversing the gradient
    const weightSeq2 = maxWeight - (progress * (maxWeight - minWeight));

    // Determine current target properties based on state
    let currentWeight = minWeight;
    let currentSkew = 0;

    if (phase === "wave") {
        switch (state) {
            case 0: // Initial Flat
                currentWeight = minWeight;
                currentSkew = 0;
                break;
            case 1: // Seq 1 (Italic, Gradient A)
                currentWeight = weightSeq1;
                currentSkew = -12;
                break;
            case 2: // Seq 2 (Normal, Gradient B)
                currentWeight = weightSeq2;
                currentSkew = 0;
                break;
        }
    }

    const animateValue = phase === "wave"
        ? {
            filter: "blur(0px)",
            opacity: 1,
            skewX: currentSkew,
            fontVariationSettings: \`'wght' \${currentWeight}\`,
        }
        : "visible";

    return (
        <motion.span
            className="inline-block uppercase"
            style={{
                fontSize: fontSize,
                color: color,
                fontFamily: "'Clash Display Variable', sans-serif",
                transformOrigin: "bottom center",
                letterSpacing: 0,
                textDecoration: "none",
                WebkitTextStroke: "0px transparent",
                overflow: "hidden",
                border: "none",
                outline: "none",
                boxShadow: "none",
                textShadow: "none",
                WebkitFontSmoothing: "antialiased",
                MozOsxFontSmoothing: "grayscale",
            }}
            initial="hidden"
            animate={animateValue}
            variants={{
                hidden: {
                    filter: "blur(20px)",
                    opacity: 0,
                    skewX: 0,
                    fontVariationSettings: "'wght' 200",
                },
                visible: {
                    filter: "blur(0px)",
                    opacity: 1,
                    skewX: 0,
                    fontVariationSettings: "'wght' 200",
                    transition: {
                        duration: 0.8,
                        ease: [0.25, 0.1, 0.25, 1],
                    }
                },
            }}
            transition={{
                duration: 0.6,
                ease: "easeInOut",
            }}
        >
            {char === " " ? "\\u00A0" : char}
        </motion.span>
    );
}

// Preview component for component listing cards
export function ImpactTextPreview() {
    return (
        <ImpactText
            text="LOADING"
            config={{
                fontSize: 56,
                color: "var(--foreground)",
                kerning: -4
            }}
        />
    );
}
`
    },
    {
        id: 'reveal-marquee',
        name: 'Reveal Marquee',
        index: 22,
        description: 'An infinite scrolling marquee where words reveal images on hover with smooth parallax effects and weight animations.',
        tags: ['ticker', 'marquee', 'scroll', 'parallax', 'hover', 'reveal', '3d'],
        category: 'animation',
        previewConfig: { speed: 1, parallaxStrength: 30 },
        dependencies: ['framer-motion', 'react'],
        usage: `import { ClothTicker } from '@/components/ui';

// Basic usage
<ClothTicker />

// With custom configuration
<ClothTicker
    config={{
        speed: 2,
        fontSize: '4rem',
        parallaxStrength: 50
    }}
/>`,
        props: [
            { name: 'words', type: 'string[]', default: 'defaultWords', description: 'Array of words to display' },
            { name: 'images', type: 'string[]', default: 'defaultImages', description: 'Array of images to reveal' },
            { name: 'config', type: 'Partial<ClothTickerConfig>', default: '{}', description: 'Configuration object' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' },
        ],
        fullCode: `
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
    const x = useTransform(baseX, (v) => \`\${v}%\`);
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
            className={\`relative w-full h-full overflow-hidden flex items-center justify-center bg-transparent \${className}\`}
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
    const x = useTransform(rawParallaxX, (v) => \`calc(-50% + \${v}px)\`);
    const y = useTransform(rawParallaxY, (v) => \`calc(-50% + \${v}px)\`);

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
                marginRight: \`\${config.gap}px\`,
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
`
    },
    {
        id: 'wave-marquee',
        name: 'Wave Marquee',
        index: 23,
        description: 'A smooth sine-wave marquee of company logos that swing up and down. Features magnetic hover effects, pause-on-hover, and grayscale-to-color transitions.',
        tags: ['marquee', 'wave', 'logos', 'partners', 'animation', 'scroll'],
        category: 'animation',
        previewConfig: { speed: 2, amplitude: 60 },
        dependencies: ['framer-motion', 'react'],
        usage: `import { WaveMarquee } from '@/components/ui';

// Basic usage
<WaveMarquee />

// Custom configuration
<WaveMarquee
    config={{
        speed: 2,
        amplitude: 80,
        wavelength: 200,
        grayscale: true
    }}
/>`,
        props: [
            { name: 'config', type: 'Partial<WaveMarqueeConfig>', default: '{}', description: 'Configuration object' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' },
        ],
        fullCode: `
"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import { motion, useSpring, useMotionValue, useAnimationFrame, useTransform } from "framer-motion";

// Responsive config interface
interface ResponsiveWaveConfig {
    amplitude: number;
    wavelength: number;
    itemSpacing: number;
    logoSize: number;
    containerSize: number;
}

// Hook to get responsive sizing
function useResponsiveWave(): ResponsiveWaveConfig {
    const [config, setConfig] = useState<ResponsiveWaveConfig>({
        amplitude: 80,
        wavelength: 200,
        itemSpacing: 90,
        logoSize: 80,
        containerSize: 100,
    });

    useEffect(() => {
        const updateConfig = () => {
            const width = window.innerWidth;

            if (width < 480) {
                // Mobile small
                setConfig({
                    amplitude: 30,
                    wavelength: 100,
                    itemSpacing: 65,
                    logoSize: 55,
                    containerSize: 80,
                });
            } else if (width < 768) {
                // Mobile
                setConfig({
                    amplitude: 45,
                    wavelength: 130,
                    itemSpacing: 75,
                    logoSize: 65,
                    containerSize: 90,
                });
            } else if (width < 1024) {
                // Tablet
                setConfig({
                    amplitude: 60,
                    wavelength: 160,
                    itemSpacing: 75,
                    logoSize: 65,
                    containerSize: 85,
                });
            } else {
                // Desktop
                setConfig({
                    amplitude: 80,
                    wavelength: 200,
                    itemSpacing: 90,
                    logoSize: 80,
                    containerSize: 100,
                });
            }
        };

        updateConfig();
        window.addEventListener('resize', updateConfig);
        return () => window.removeEventListener('resize', updateConfig);
    }, []);

    return config;
}

interface WaveMarqueeConfig {
    speed?: number;
    amplitude?: number;
    wavelength?: number;
    logoScale?: number;
    blurAmount?: number;
    grayscale?: boolean;
}

interface WaveMarqueeProps {
    config?: WaveMarqueeConfig;
    className?: string;
}

// Sample logos (SVGs and images) - with viewBox info
const LOGOS = [
    { name: "Amazon", imageUrl: "https://img.icons8.com/ios-filled/50/amazon.png" },
    { name: "Salesforce", imageUrl: "https://img.icons8.com/ios-filled/50/salesforce.png" },
    { name: "Microsoft", viewBox: "0 0 50 50", path: "M 5 4 C 4.448 4 4 4.447 4 5 L 4 24 L 24 24 L 24 4 L 5 4 z M 26 4 L 26 24 L 46 24 L 46 5 C 46 4.447 45.552 4 45 4 L 26 4 z M 4 26 L 4 45 C 4 45.553 4.448 46 5 46 L 24 46 L 24 26 L 4 26 z M 26 26 L 26 46 L 45 46 C 45.552 46 46 45.553 46 45 L 46 26 L 26 26 z" },
    { name: "Google", viewBox: "0 0 48 48", path: "M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" },
    { name: "Apple", imageUrl: "https://img.icons8.com/ios-filled/50/mac-os.png" },
    { name: "Netflix", imageUrl: "https://img.icons8.com/ios-filled/50/netflix.png" },
    { name: "Spotify", imageUrl: "https://img.icons8.com/ios-filled/50/spotify.png" },
    { name: "Steam", viewBox: "0 0 50 50", path: "M 25 3 C 13.59 3 4.209375 11.680781 3.109375 22.800781 L 14.300781 28.529297 C 15.430781 27.579297 16.9 27 18.5 27 L 18.550781 27 C 18.940781 26.4 19.389375 25.649141 19.859375 24.869141 C 20.839375 23.259141 21.939531 21.439062 23.019531 20.039062 C 23.259531 15.569063 26.97 12 31.5 12 C 36.19 12 40 15.81 40 20.5 C 40 25.03 36.430937 28.740469 31.960938 28.980469 C 30.560938 30.060469 28.750859 31.160859 27.130859 32.130859 C 26.350859 32.610859 25.6 33.059219 25 33.449219 L 25 33.5 C 25 37.09 22.09 40 18.5 40 C 14.91 40 12 37.09 12 33.5 C 12 33.33 12.009531 33.17 12.019531 33 L 3.2792969 28.519531 C 4.9692969 38.999531 14.05 47 25 47 C 37.15 47 47 37.15 47 25 C 47 12.85 37.15 3 25 3 z M 31.5 14 C 27.92 14 25 16.92 25 20.5 C 25 24.08 27.92 27 31.5 27 C 35.08 27 38 24.08 38 20.5 C 38 16.92 35.08 14 31.5 14 z M 31.5 16 C 33.99 16 36 18.01 36 20.5 C 36 22.99 33.99 25 31.5 25 C 29.01 25 27 22.99 27 20.5 C 27 18.01 29.01 16 31.5 16 z M 18.5 29 C 17.71 29 16.960313 29.200312 16.320312 29.570312 L 19.640625 31.269531 C 20.870625 31.899531 21.350469 33.410625 20.730469 34.640625 C 20.280469 35.500625 19.41 36 18.5 36 C 18.11 36 17.729375 35.910469 17.359375 35.730469 L 14.029297 34.019531 C 14.289297 36.259531 16.19 38 18.5 38 C 20.99 38 23 35.99 23 33.5 C 23 31.01 20.99 29 18.5 29 z" },
    { name: "Slack", imageUrl: "https://img.icons8.com/ios-filled/50/slack-new.png" },
    { name: "Discord", imageUrl: "https://img.icons8.com/ios-filled/50/discord-logo.png" },
    { name: "Dell", viewBox: "0 0 50 50", path: "M 25 2 C 12.296875 2 2 12.296875 2 25 C 2 37.703125 12.296875 48 25 48 C 37.703125 48 48 37.703125 48 25 C 48 12.296875 37.703125 2 25 2 Z M 22.28125 19.125 L 24.125 20.5625 L 19.5625 24.125 L 20.4375 24.8125 L 25 21.25 L 26.84375 22.6875 L 22.28125 26.28125 L 23.15625 26.96875 L 27.71875 23.375 L 27.71875 20.09375 L 31 20.09375 L 31 26.78125 L 34.3125 26.78125 L 34.3125 29.5625 L 27.71875 29.5625 L 27.71875 26.28125 L 22.28125 30.53125 L 17.3125 26.625 C 16.597656 28.347656 14.875 29.5625 12.875 29.5625 L 8.625 29.5625 L 8.625 20.09375 L 12.875 20.09375 C 15.105469 20.09375 16.710938 21.519531 17.3125 23.03125 Z M 35.1875 20.09375 L 38.46875 20.09375 L 38.46875 26.78125 L 41.78125 26.78125 L 41.78125 29.5625 L 35.1875 29.5625 Z M 11.8125 22.8125 L 11.8125 26.84375 L 12.53125 26.84375 C 13.648438 26.84375 14.59375 26.214844 14.59375 24.8125 C 14.59375 23.527344 13.730469 22.8125 12.53125 22.8125 Z" },
    { name: "Tesla", imageUrl: "https://img.icons8.com/ios-filled/50/tesla-logo.png" },
    { name: "GitHub", imageUrl: "https://img.icons8.com/ios-filled/50/github.png" },
    { name: "LinkedIn", imageUrl: "https://img.icons8.com/ios-filled/50/linkedin.png" },
    { name: "Twitter", imageUrl: "https://img.icons8.com/ios-filled/50/twitterx--v2.png" },
];

const WaveMarquee: React.FC<WaveMarqueeProps> = ({ config = {}, className = "" }) => {
    // Get responsive sizing
    const responsiveConfig = useResponsiveWave();

    // Configuration defaults - use responsive amplitude and wavelength
    const defaultConfig: WaveMarqueeConfig = {
        speed: 1,
        amplitude: responsiveConfig.amplitude,
        wavelength: responsiveConfig.wavelength,
        logoScale: 1.2,
        blurAmount: 0,
        grayscale: true,
    };

    const finalConfig = { ...defaultConfig, ...config };

    // Create a duplicated list of logos for infinite scroll
    // We need enough to cover the screen width plus some buffer
    const items = useMemo(() => {
        // Simple heuristic: duplicate enough times.
        // In a real robust scenario we'd measure width, but for this demo a fixed multiplier is safe provided container isn't huge.
        const baseItems = LOGOS;
        const multiplier = 6;
        let combined = [];
        for (let i = 0; i < multiplier; i++) {
            combined.push(...baseItems.map(item => ({ ...item, id: \`\${i}-\${item.name}\` })));
        }
        return combined;
    }, []);

    const containerRef = useRef<HTMLDivElement>(null);
    const time = useMotionValue(0);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Mouse interaction springs
    const mouseInfluence = useSpring(0, { stiffness: 50, damping: 20 });
    const waveAmplitude = useSpring(finalConfig.amplitude!, { stiffness: 40, damping: 15 });

    // Manage animation frame
    useAnimationFrame((t, delta) => {
        // Move time forward
        const currentSpeed = finalConfig.speed! * (1 - mouseInfluence.get());
        time.set(time.get() + (delta * 0.05 * currentSpeed));
    });

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
            mouseX.set(e.clientX - rect.left);
            mouseY.set(e.clientY - rect.top);

            // Calculate normalized Y position (0 to 1)
            const normalizedY = (e.clientY - rect.top) / rect.height;
            // Increase amplitude when mouse is near center verticallly? Or just make it lively
            // Let's make amplitude react to mouse Y. 
            // If mouse is at top/bottom, wave is flatter. If in middle, wave is bigger? 
            // Or maybe scale amplitude based on horizontal movement speed? 
            // Let's just make it react to presence.

            // Actually, let's make the wave "calm down" when hovering to make it easier to click/view
            waveAmplitude.set(finalConfig.amplitude! * 0.5);
            mouseInfluence.set(0.8); // Slow down significantly on hover
        }
    };

    const handleMouseLeave = () => {
        waveAmplitude.set(finalConfig.amplitude!);
        mouseInfluence.set(0);
        mouseY.set(0);
    };

    return (
        <div
            ref={containerRef}
            className={\`relative w-full h-full overflow-hidden flex items-center justify-center \${className}\`}
            style={{
                backgroundImage: 'url(/23.-California_1.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <div className="absolute inset-0 flex items-center justify-center">
                {items.map((item, index) => (
                    <WaveItem
                        key={item.id}
                        item={item}
                        index={index}
                        time={time}
                        config={finalConfig}
                        amplitude={waveAmplitude}
                        mouseX={mouseX}
                        totalItems={items.length}
                        responsiveConfig={responsiveConfig}
                    />
                ))}
            </div>
        </div>
    );
};

const WaveItem = ({ item, index, time, config, amplitude, mouseX, totalItems, responsiveConfig }: any) => {
    // Get item spacing from responsive config
    const ITEM_SPACING = responsiveConfig?.itemSpacing || 90;

    // Dimensions
    const itemWidth = responsiveConfig?.containerSize || 100;
    const totalWidth = totalItems * ITEM_SPACING;

    const x = useTransform(time, (t: number) => {
        // Calculate position based on index and time
        const basePos = (index * ITEM_SPACING) - t;
        // Wrap around
        const wrappedPos = ((basePos % totalWidth) + totalWidth) % totalWidth;
        // Center the coordinate system roughly
        return wrappedPos - ITEM_SPACING;
    });

    // Calculate Y based on X (Wave physics)
    // We need to read the 'x' value. useTransform gives us a MotionValue.
    // To make y dependent on x, we transform x.
    const y = useTransform([x, amplitude], ([currentX, currentAmp]: any) => {
        // Sine wave formula: y = A * sin(kx + wt)
        // We'll just use spatial position for the phase
        const phase = currentX / config.wavelength;
        return Math.sin(phase) * currentAmp;
    });

    // Rotation for 3D effect
    const rotateZ = useTransform([x, amplitude], ([currentX, currentAmp]: any) => {
        // Derivative of sine (cosine) gives us the slope
        const phase = currentX / config.wavelength;
        const slope = Math.cos(phase);
        // Tilt based on slope max +/- 15 deg
        return slope * (currentAmp / 10);
    });

    // Hover / Proximity effect
    // We need a ref to get the actual DOM element's screen position?
    // Actually, we can use the \`x\` value we already have, as it is relative to the container-ish.
    // The container is \`w-full\`. \`x\` is roughly pixels from left.
    // Let's approximate proximity to mouseX.

    // Since x is a motion value, we can't easily use it in another useTransform unless we combine them?
    // Framer Motion \`useTransform\` can combine multiple MotionValues.

    const scale = useTransform([x, mouseX], ([currentX, mX]: any) => {
        // No scaling - always return 1
        return 1;
    });

    const opacity = useTransform([x, mouseX], ([currentX, mX]: any) => {
        // No dimming - always return full opacity
        return 1;
    });

    const grayscale = useTransform([x, mouseX], ([currentX, mX]: any) => {
        const dist = Math.abs(currentX - mX + (itemWidth / 2));
        // If close to cursor, color (grayscale 0%). Else grayscale 100%.
        if (dist < 150) {
            return 0; // Color
        }
        return config.grayscale ? 1 : 0;
    });

    // Fix for initial render flashing or layout issues: 
    // Wait for client side? No, standard React.

    // Get responsive sizes
    const containerSize = responsiveConfig?.containerSize || 100;
    const logoSize = responsiveConfig?.logoSize || 80;

    return (
        <motion.div
            style={{
                x,
                y,
                rotateZ,
                scale,
                opacity,
                position: "absolute",
                left: 0, // We control X via translate
                width: containerSize,
                height: containerSize,
            }}
            className="flex flex-col items-center justify-center cursor-pointer"
        >
            <div
                className="bg-white/20 rounded-full flex items-center justify-center backdrop-blur-xl border border-white/30 shadow-lg hover:bg-white/30 transition-all duration-300 hover:scale-105"
                style={{
                    width: logoSize,
                    height: logoSize,
                    padding: logoSize * 0.1,
                }}
            >
                {/* Render Image or SVG */}
                {item.imageUrl ? (
                    <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-3/5 h-3/5 object-contain"
                        style={{ filter: 'brightness(0)' }}
                    />
                ) : (
                    <svg
                        viewBox={item.viewBox || "0 0 50 50"}
                        className="w-3/5 h-3/5 fill-foreground"
                        style={{ overflow: 'visible' }}
                    >
                        <path d={item.path} />
                    </svg>
                )}
            </div>
            {/* Optional label */}
            {/* <span className="mt-2 text-xs font-medium opacity-50">{item.name}</span> */}
        </motion.div>
    );
};

export { WaveMarquee };
export default WaveMarquee;

export const WaveMarqueePreview = () => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center overflow-hidden">
            <WaveMarquee
                className="h-[300px] w-full"
                config={{
                    speed: 2,
                    amplitude: 30,
                    wavelength: 150,
                    grayscale: false
                }}
            />
        </div>
    );
};
`
    },
    {
        id: 'expandable-strips',
        name: 'Expandable Strips',
        index: 24,
        description: 'An interactive image gallery where strips expand on hover. Features smooth layout transitions and dynamic color reveals.',
        tags: ['gallery', 'accordion', 'expand', 'image', 'interaction'],
        category: 'interaction',
        previewConfig: {},
        dependencies: ['framer-motion', 'react'],
        usage: `import { ExpandableStrips } from '@/components/ui';

// Basic usage
<ExpandableStrips />`,
        props: [
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' },
        ],
        fullCode: `
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
            className={\`w-full h-full min-h-[500px] min-h-[800px] flex flex-col items-center justify-center bg-[#f2f1ef] overflow-hidden py-10 \${className}\`}
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
                className={\`flex \${isMobile ? 'w-fit self-start' : 'w-full'} md:max-w-6xl h-[500px] px-[calc(50vw_-_50px)] md:px-4 gap-4 items-center \${isMobile ? 'overflow-visible cursor-grab active:cursor-grabbing' : 'overflow-x-auto'} md:overflow-visible pb-8 md:pb-0 scrollbar-hide\`}
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
                            key={\`title-\${activeId}\`}
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
                            className={\`\${bangers.className} text-[#1a1a1a]/40\`}
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
            <h2 className={\`text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#1a1a1a] tracking-wider \${className} flex flex-wrap justify-center\`}>
                {letters.map((letter, index) => (
                    <motion.span
                        key={\`\${title}-\${index}\`}
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
                        {letter === ' ' ? '\\u00A0' : letter}
                    </motion.span>
                ))}
            </h2>
            {/* Japanese subtitle */}
            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className={\`text-xl sm:text-2xl md:text-3xl lg:text-4xl text-[#1a1a1a]/20 tracking-wide \${japaneseClassName}\`}
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
            className={\`relative h-[85%] overflow-hidden cursor-pointer \${shouldExpand ? "z-10 shadow-2xl" : "z-0"} md:min-w-0 \${isMobile ? 'flex-shrink-0' : ''}\`}
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
`
    },
    {
        id: 'frosted-glass',
        name: 'Frosted Glass Text',
        index: 25,
        description: 'Knockout text that reveals a blurred background image using SVG masking. Ideal for headers and impact text over complex images.',
        tags: ['text', 'glass', 'blur', 'mask', 'svg'],
        category: 'effect',
        previewConfig: { text: 'CURATED CHAOS', blurAmount: 30 },
        dependencies: ['react'],
        usage: `import { FrostedGlass } from '@/components/ui';

// Basic usage
<FrostedGlass />

// Custom configuration
<FrostedGlass
    config={{
        text: "CURATED CHAOS",
        blurAmount: 30,
        fontSize: 300
    }}
/>`,
        props: [
            { name: 'config', type: 'object', default: '{}', description: 'Configuration object' },
            { name: 'containerClassName', type: 'string', default: "''", description: 'Class for the container' },
        ],
        fullCode: `
"use client";

import React, { useState, useEffect, useRef } from 'react';

interface FrostedGlassConfig {
    text: string;
    videoSources?: string[];
    blurAmount?: number;
    fontSize?: number;
    fontWeight?: number;
    className?: string;
}

const defaultVideos = [
    "/251.webm",
    "/252.webm",
    "/253.webm",
    "/254.webm"
];

export const FrostedGlass = ({
    config = {},
    containerClassName = ""
}: {
    config?: Partial<FrostedGlassConfig>;
    containerClassName?: string;
}) => {
    const {
        text = "CURATED CHAOS",
        videoSources = defaultVideos,
        blurAmount = 30,
        fontSize = 300,
        fontWeight = 900,
        className = ""
    } = config;

    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    // Initial video source
    const [videoSrc, setVideoSrc] = useState(videoSources[0]);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const effectiveFontSize = isMobile ? Math.min(fontSize, 150) : fontSize;

    useEffect(() => {
        setVideoSrc(videoSources[currentVideoIndex]);
    }, [currentVideoIndex, videoSources]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentVideoIndex((prev) => (prev + 1) % videoSources.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [videoSources.length]);

    const words = text.split(" ");
    const lineHeight = 0.9; // em

    return (
        <div className={\`relative w-full h-full min-h-[400px] md:min-h-[600px] overflow-hidden flex items-center justify-center bg-black \${containerClassName}\`}>

            {/* 1. Background Layer (Sharp) */}
            <div className="absolute inset-0 z-0">
                <video
                    key={\`bg-\${videoSrc}\`} // Force re-render ensures smooth sync on src change if needed, but react handles src updates well usually. 
                    src={videoSrc}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                />
            </div>

            {/* 2. Text Mask Layer (Reveals Blurred Video) */}
            <div className="relative z-10 w-full h-full flex items-center justify-center pointer-events-none">
                <svg width="100%" height="100%" className="absolute inset-0">
                    <defs>
                        <mask id="text-mask">
                            {/* Fill with black (hide everything) */}
                            <rect width="100%" height="100%" fill="black" />
                            {/* Text with white (reveal this part) */}
                            <text
                                x="50%"
                                y="50%"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize={effectiveFontSize}
                                fontWeight={fontWeight}
                                fontFamily="'Thunder', sans-serif"
                                fill="white"
                            >
                                {words.map((word, i) => (
                                    <tspan
                                        key={i}
                                        x="50%"
                                        dy={i === 0 ? \`-\${((words.length - 1) * lineHeight) / 2}em\` : \`\${lineHeight}em\`}
                                    >
                                        {word}
                                    </tspan>
                                ))}
                            </text>
                        </mask>
                    </defs>

                    {/* ForeignObject allows embedding HTML (div > video) inside SVG to be masked */}
                    <foreignObject width="100%" height="100%" mask="url(#text-mask)">
                        <div className="w-full h-full">
                            <video
                                key={\`fg-\${videoSrc}\`}
                                src={videoSrc}
                                className="w-full h-full object-cover"
                                autoPlay
                                muted
                                loop
                                playsInline
                                style={{
                                    filter: \`blur(\${blurAmount}px) saturate(1.5)\`,
                                    transform: 'scale(1.1)' // Slight scale to avoid edge blur artifacts
                                }}
                            />
                        </div>
                    </foreignObject>
                </svg>
            </div>

        </div>
    );
};

export default FrostedGlass;
`
    },
    {
        id: 'text-reveal',
        name: 'Text Reveal',
        index: 26,
        description: 'A text animation where letters reveal by rotating from 90 degrees on the Y-axis.',
        tags: ['text', 'reveal', 'rotation', '3d', 'animation'],
        category: 'animation',
        previewConfig: { text: 'MORPHYS', delay: 0.5 },
        dependencies: ['framer-motion', 'react'],
        usage: `import TextReveal from '@/components/ui/TextReveal';

// Basic usage
<TextReveal text="MORPHYS" />

// Custom configuration
<TextReveal
    text="MORPHYS"
    delay={0.5}
    className="text-6xl"
/>`,
        props: [
            { name: 'text', type: 'string', default: "'Text Reveal Animation'", description: 'Text to display' },
            { name: 'delay', type: 'number', default: '0', description: 'Delay before animation starts' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' },
        ],
        fullCode: `
import React from 'react';
import { motion, Variants } from 'framer-motion';

interface TextRevealProps {
    text: string;
    className?: string;
    delay?: number;
}

const TextReveal: React.FC<TextRevealProps> = ({
    text = "Text Reveal Animation",
    className = "",
    delay = 0,
}) => {
    const words = text.split(" ");

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
                delayChildren: delay,
            },
        },
    };

    const letterVariants = {
        hidden: {
            rotateY: -90,
            opacity: 0,
        },
        visible: {
            rotateY: 0,
            opacity: 1,
            transition: {
                duration: 0.5,
                ease: "easeOut",
            },
        },
    };

    const [animationKey, setAnimationKey] = React.useState(0);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setAnimationKey(prev => prev + 1);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Helper to keep global index for stagger if needed, 
    // BUT since we want to keep it simple and compatible with staggerChildren, 
    // we can try to rely on Framer Motion's natural propagation.
    // However, nested stagger is tricky. 
    // Let's use the manual delay approach for 100% control as discussed.

    const manualLetterVariants: Variants = {
        hidden: {
            rotateY: -90,
            opacity: 0
        },
        visible: (i: number) => ({
            rotateY: 0,
            opacity: 1,
            transition: {
                delay: delay + (i * 0.05),
                duration: 0.5,
                ease: "easeOut",
            },
        }),
    };

    let globalLetterIndex = 0;

    return (
        <div className={\`relative flex items-center justify-center p-4 \${className}\`}>
            <motion.div
                key={animationKey}
                className="flex flex-wrap items-center justify-center gap-[0.3em] font-bold uppercase"
                initial="hidden"
                animate="visible"
                style={{ perspective: "1000px", fontFamily: '"Big Shoulders Display", cursive', fontWeight: 900 }}
            >
                {words.map((word, wIndex) => (
                    <div key={wIndex} className="flex whitespace-nowrap">
                        {word.split("").map((char, cIndex) => {
                            const index = globalLetterIndex++;
                            return (
                                <motion.span
                                    key={cIndex}
                                    custom={index}
                                    variants={manualLetterVariants}
                                    style={{ display: "inline-block", transformStyle: "preserve-3d" }}
                                >
                                    {char}
                                </motion.span>
                            );
                        })}
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

export default TextReveal;
`
    },
    {
        id: 'text-reveal-2',
        name: 'Text Reveal 2',
        index: 27,
        description: 'A step-wise telescoping text reveal where letters slide out from behind each other.',
        tags: ['text', 'reveal', 'telescope', 'slide', 'animation'],
        category: 'animation',
        previewConfig: { text: 'MORPHYS', delay: 0 },
        dependencies: ['framer-motion', 'react'],
        usage: `import TextReveal2 from '@/components/ui/TextReveal2';

// Basic usage
<TextReveal2 text="MORPHYS" />

// Custom configuration
<TextReveal2
    text="MORPHYS"
    delay={0}
    className="text-6xl"
/>`,
        props: [
            { name: 'text', type: 'string', default: "'MORPHYS'", description: 'Text to display' },
            { name: 'delay', type: 'number', default: '0', description: 'Delay before animation starts' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' },
        ],
        fullCode: `

import React from 'react';
import { motion } from 'framer-motion';

interface TextReveal2Props {
    text?: string;
    className?: string;
    delay?: number;
}

const TextReveal2: React.FC<TextReveal2Props> = ({
    text = "MORPHYS",
    className = "",
    delay = 0,
}) => {
    // Split text into words, then letters
    const content = text.split("").map((char, index) => ({ char, index }));

    return (
        <div className={\`flex items-center justify-center p-8 \${className}\`}>
            <div className="relative inline-block">
                {/* Ghost Text - Reserves Space So Layout is Stable */}
                <span className="invisible opacity-0 uppercase whitespace-pre font-victory tracking-wide" style={{ lineHeight: '1' }}>
                    {text}
                </span>

                {/* Animated Overlay */}
                <div className="absolute inset-0 flex items-end">
                    {content.map((item, i) => (
                        <span
                            key={i}
                            className="inline-flex relative"
                            style={{
                                clipPath: 'inset(-20% -30% -20% 0)' // Allow vertical overflow, hard left clip
                            }}
                        >
                            <motion.span
                                className="uppercase whitespace-pre inline-block font-victory tracking-wide"
                                style={{
                                    lineHeight: '1',
                                }}
                                initial={{ x: '-105%' }}
                                animate={{ x: 0 }}
                                transition={{
                                    delay: delay + (i * 0.05),
                                    duration: 0.5,
                                    ease: [0.2, 0.65, 0.3, 0.9],
                                    repeat: Infinity,
                                    repeatDelay: 1.5,
                                }}
                            >
                                {item.char}
                            </motion.span>
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TextReveal2;
`
    },
    {
        id: 'crt-glitch',
        name: 'CRT Glitch',
        index: 28,
        description: 'A realistic CRT TV and VHS glitch effect with static noise, scan lines, RGB chromatic aberration, and random glitch distortions.',
        tags: ['glitch', 'crt', 'vhs', 'retro', 'noise', 'distortion', 'effect'],
        category: 'effect',
        previewConfig: { text: 'GLITCH', noiseIntensity: 0.15, glitchFrequency: 0.3 },
        dependencies: ['framer-motion', 'react'],
        usage: `import { CRTGlitch } from '@/components/ui';

// Basic usage
<CRTGlitch />

// With custom configuration
<CRTGlitch
    config={{
        text: "ERROR 404",
        noiseIntensity: 0.2,
        scanlineIntensity: 0.5,
        rgbShiftIntensity: 0.8,
        glitchFrequency: 0.5,
        colorTint: 'green',
        curvedScreen: true
    }}
/>`,
        props: [
            { name: 'config.text', type: 'string', default: "'MORPHYS'", description: 'Text to display' },
            { name: 'config.noiseIntensity', type: 'number', default: '0.15', description: 'Static noise amount (0-1)' },
            { name: 'config.scanlineIntensity', type: 'number', default: '0.4', description: 'Scan line visibility (0-1)' },
            { name: 'config.rgbShiftIntensity', type: 'number', default: '0.6', description: 'RGB chromatic aberration (0-1)' },
            { name: 'config.glitchFrequency', type: 'number', default: '0.3', description: 'How often glitches occur (0-1)' },
            { name: 'config.flickerIntensity', type: 'number', default: '0.1', description: 'Screen flicker amount (0-1)' },
            { name: 'config.vhsTracking', type: 'boolean', default: 'true', description: 'Enable VHS tracking distortion' },
            { name: 'config.phosphorGlow', type: 'boolean', default: 'true', description: 'Enable CRT phosphor bloom' },
            { name: 'config.curvedScreen', type: 'boolean', default: 'true', description: 'Enable barrel distortion effect' },
            { name: 'config.colorTint', type: "'green' | 'amber' | 'blue' | 'none'", default: "'none'", description: 'Retro monitor color tint' },
            { name: 'config.autoGlitch', type: 'boolean', default: 'true', description: 'Enable automatic random glitches' },
            { name: 'config.hoverTrigger', type: 'boolean', default: 'true', description: 'Trigger glitches on hover' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' },
        ],
        fullCode: `
"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// TYPES & INTERFACES
// ============================================

interface CRTGlitchConfig {
    // Content
    text?: string;
    children?: React.ReactNode;

    // Effects intensity (0-1)
    noiseIntensity?: number;      // Static noise amount
    scanlineIntensity?: number;   // Scan line visibility
    rgbShiftIntensity?: number;   // Chromatic aberration
    glitchFrequency?: number;     // How often glitches occur
    flickerIntensity?: number;    // Screen flicker amount
    vhsTracking?: boolean;        // VHS tracking distortion

    // Visual
    phosphorGlow?: boolean;       // CRT phosphor bloom
    curvedScreen?: boolean;       // CRT barrel distortion
    colorTint?: 'green' | 'amber' | 'blue' | 'none';  // Retro monitor tint

    // Animation
    autoGlitch?: boolean;         // Automatic random glitches
    hoverTrigger?: boolean;       // Glitch on hover

    // Styling
    fontSize?: number;
    fontFamily?: string;
}

interface GlitchState {
    active: boolean;
    xShift: number;
    yShift: number;
    rgbSplit: number;
    slice: { top: number; height: number; xOffset: number }[];
}

// ============================================
// DEFAULT CONFIG
// ============================================

const defaultConfig: Required<Omit<CRTGlitchConfig, 'text' | 'children'>> = {
    noiseIntensity: 0.15,
    scanlineIntensity: 0.4,
    rgbShiftIntensity: 0.6,
    glitchFrequency: 0.3,
    flickerIntensity: 0.1,
    vhsTracking: true,
    phosphorGlow: true,
    curvedScreen: true,
    colorTint: 'none',
    autoGlitch: true,
    hoverTrigger: true,
    fontSize: 80,
    fontFamily: "'Big Shoulders Display', sans-serif",
};

// ============================================
// NOISE CANVAS COMPONENT
// ============================================

const NoiseCanvas = React.memo(({ intensity, width, height }: {
    intensity: number;
    width: number;
    height: number;
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = width / 2;  // Lower res for performance
        canvas.height = height / 2;

        const imageData = ctx.createImageData(canvas.width, canvas.height);
        const data = imageData.data;

        const drawNoise = () => {
            for (let i = 0; i < data.length; i += 4) {
                const noise = Math.random() * 255;
                data[i] = noise;     // R
                data[i + 1] = noise; // G
                data[i + 2] = noise; // B
                data[i + 3] = 255 * intensity; // A
            }
            ctx.putImageData(imageData, 0, 0);
            animationRef.current = requestAnimationFrame(drawNoise);
        };

        drawNoise();

        return () => {
            cancelAnimationFrame(animationRef.current);
        };
    }, [intensity, width, height]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none mix-blend-overlay"
            style={{ imageRendering: 'pixelated' }}
        />
    );
});

NoiseCanvas.displayName = 'NoiseCanvas';

// ============================================
// SCAN LINES COMPONENT
// ============================================

const ScanLines = React.memo(({ intensity }: { intensity: number }) => {
    return (
        <div
            className="absolute inset-0 pointer-events-none"
            style={{
                background: \`repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 2px,
                    rgba(0, 0, 0, \${intensity * 0.5}) 2px,
                    rgba(0, 0, 0, \${intensity * 0.5}) 4px
                )\`,
                zIndex: 10,
            }}
        />
    );
});

ScanLines.displayName = 'ScanLines';

// ============================================
// VHS TRACKING COMPONENT
// ============================================

const VHSTracking = React.memo(({ active }: { active: boolean }) => {
    const [lines, setLines] = useState<{ y: number; height: number; opacity: number }[]>([]);

    useEffect(() => {
        if (!active) {
            setLines([]);
            return;
        }

        const interval = setInterval(() => {
            if (Math.random() > 0.7) {
                const newLines = Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => ({
                    y: Math.random() * 100,
                    height: Math.random() * 8 + 2,
                    opacity: Math.random() * 0.5 + 0.2,
                }));
                setLines(newLines);

                setTimeout(() => setLines([]), 100 + Math.random() * 200);
            }
        }, 500);

        return () => clearInterval(interval);
    }, [active]);

    return (
        <>
            {lines.map((line, i) => (
                <div
                    key={i}
                    className="absolute left-0 right-0 pointer-events-none"
                    style={{
                        top: \`\${line.y}%\`,
                        height: \`\${line.height}px\`,
                        background: \`linear-gradient(90deg, 
                            transparent 0%, 
                            rgba(255, 255, 255, \${line.opacity}) 10%, 
                            rgba(255, 255, 255, \${line.opacity}) 90%, 
                            transparent 100%
                        )\`,
                        zIndex: 15,
                    }}
                />
            ))}
        </>
    );
});

VHSTracking.displayName = 'VHSTracking';

// ============================================
// RGB SHIFT LAYER
// ============================================

const RGBShiftLayer = React.memo(({
    children,
    intensity,
    glitchActive
}: {
    children: React.ReactNode;
    intensity: number;
    glitchActive: boolean;
}) => {
    const offset = glitchActive ? intensity * 8 : intensity * 2;

    return (
        <div className="relative">
            {/* Red channel */}
            <div
                className="absolute inset-0"
                style={{
                    color: '#ff0000',
                    mixBlendMode: 'screen',
                    transform: \`translateX(\${-offset}px)\`,
                    opacity: 0.8,
                }}
            >
                {children}
            </div>

            {/* Green channel (base) */}
            <div className="relative" style={{ color: '#00ff00', mixBlendMode: 'screen' }}>
                {children}
            </div>

            {/* Blue channel */}
            <div
                className="absolute inset-0"
                style={{
                    color: '#0000ff',
                    mixBlendMode: 'screen',
                    transform: \`translateX(\${offset}px)\`,
                    opacity: 0.8,
                }}
            >
                {children}
            </div>
        </div>
    );
});

RGBShiftLayer.displayName = 'RGBShiftLayer';

// ============================================
// GLITCH SLICE COMPONENT
// ============================================

const GlitchSlices = React.memo(({
    slices,
    children
}: {
    slices: GlitchState['slice'];
    children: React.ReactNode;
}) => {
    if (slices.length === 0) return <>{children}</>;

    return (
        <div className="relative">
            {children}
            {slices.map((slice, i) => (
                <div
                    key={i}
                    className="absolute left-0 right-0 overflow-hidden pointer-events-none"
                    style={{
                        top: \`\${slice.top}%\`,
                        height: \`\${slice.height}%\`,
                        transform: \`translateX(\${slice.xOffset}px)\`,
                        clipPath: \`inset(0 0 0 0)\`,
                        zIndex: 20,
                    }}
                >
                    <div style={{ transform: \`translateY(-\${slice.top}%)\` }}>
                        {children}
                    </div>
                </div>
            ))}
        </div>
    );
});

GlitchSlices.displayName = 'GlitchSlices';

// ============================================
// MAIN CRT GLITCH COMPONENT
// ============================================

export const CRTGlitch = ({
    config = {},
    className = "",
    containerClassName = "",
}: {
    config?: Partial<CRTGlitchConfig>;
    className?: string;
    containerClassName?: string;
}) => {
    const mergedConfig = useMemo(() => ({ ...defaultConfig, ...config }), [config]);
    const {
        text = "MORPHYS",
        noiseIntensity,
        scanlineIntensity,
        rgbShiftIntensity,
        glitchFrequency,
        flickerIntensity,
        vhsTracking,
        phosphorGlow,
        curvedScreen,
        colorTint,
        autoGlitch,
        hoverTrigger,
        fontSize,
        fontFamily,
    } = { ...mergedConfig, ...config };

    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const [isHovering, setIsHovering] = useState(false);
    const [glitchState, setGlitchState] = useState<GlitchState>({
        active: false,
        xShift: 0,
        yShift: 0,
        rgbSplit: 0,
        slice: [],
    });
    const [flickerOpacity, setFlickerOpacity] = useState(1);
    const [isMobile, setIsMobile] = useState(false);

    // Handle resize
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setDimensions({ width: rect.width, height: rect.height });
            }
            setIsMobile(window.innerWidth < 768);
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    // Generate random glitch
    const triggerGlitch = useCallback(() => {
        const numSlices = Math.floor(Math.random() * 5) + 2;
        const slices = Array.from({ length: numSlices }, () => ({
            top: Math.random() * 80,
            height: Math.random() * 15 + 5,
            xOffset: (Math.random() - 0.5) * 60,
        }));

        setGlitchState({
            active: true,
            xShift: (Math.random() - 0.5) * 20,
            yShift: (Math.random() - 0.5) * 10,
            rgbSplit: Math.random() * 10 + 5,
            slice: slices,
        });

        // Rapid sub-glitches for more chaos
        const subGlitchCount = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < subGlitchCount; i++) {
            setTimeout(() => {
                setGlitchState(prev => ({
                    ...prev,
                    xShift: (Math.random() - 0.5) * 30,
                    slice: prev.slice.map(s => ({
                        ...s,
                        xOffset: (Math.random() - 0.5) * 80,
                    })),
                }));
            }, 50 * (i + 1));
        }

        // End glitch
        setTimeout(() => {
            setGlitchState({
                active: false,
                xShift: 0,
                yShift: 0,
                rgbSplit: 0,
                slice: [],
            });
        }, 150 + Math.random() * 200);
    }, []);

    // Auto glitch effect
    useEffect(() => {
        if (!autoGlitch) return;

        const scheduleGlitch = () => {
            const delay = 2000 / glitchFrequency + Math.random() * 3000;
            return setTimeout(() => {
                if (Math.random() < glitchFrequency) {
                    triggerGlitch();
                }
                scheduleGlitch();
            }, delay);
        };

        const timeout = scheduleGlitch();
        return () => clearTimeout(timeout);
    }, [autoGlitch, glitchFrequency, triggerGlitch]);

    // Flicker effect
    useEffect(() => {
        if (flickerIntensity <= 0) return;

        const interval = setInterval(() => {
            if (Math.random() < 0.3) {
                setFlickerOpacity(1 - Math.random() * flickerIntensity);
                setTimeout(() => setFlickerOpacity(1), 50);
            }
        }, 100);

        return () => clearInterval(interval);
    }, [flickerIntensity]);

    // Hover glitch trigger
    useEffect(() => {
        if (hoverTrigger && isHovering) {
            const interval = setInterval(() => {
                if (Math.random() < 0.4) {
                    triggerGlitch();
                }
            }, 300);
            return () => clearInterval(interval);
        }
    }, [hoverTrigger, isHovering, triggerGlitch]);

    // Color tint values
    const tintColors = {
        green: 'rgba(0, 255, 100, 0.1)',
        amber: 'rgba(255, 176, 0, 0.1)',
        blue: 'rgba(100, 180, 255, 0.1)',
        none: 'transparent',
    };

    const effectiveFontSize = isMobile ? Math.min(fontSize, 48) : fontSize;

    // Content to display
    const content = config.children || (
        <div
            className={\`font-black uppercase tracking-wider select-none \${className}\`}
            style={{
                fontSize: \`\${effectiveFontSize}px\`,
                fontFamily,
                lineHeight: 1,
                textShadow: phosphorGlow
                    ? '0 0 10px currentColor, 0 0 20px currentColor, 0 0 40px currentColor'
                    : 'none',
            }}
        >
            {text}
        </div>
    );

    return (
        <div
            ref={containerRef}
            className={\`relative w-full h-full min-h-[300px] overflow-hidden flex items-center justify-center bg-black \${containerClassName}\`}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            style={{
                // CRT curved screen effect
                borderRadius: curvedScreen ? '20px' : '0',
                boxShadow: curvedScreen
                    ? 'inset 0 0 100px rgba(0,0,0,0.9), inset 0 0 50px rgba(0,0,0,0.5)'
                    : 'none',
            }}
        >
            {/* CRT Bezel */}
            {curvedScreen && (
                <div
                    className="absolute inset-0 pointer-events-none rounded-[20px]"
                    style={{
                        background: \`radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.8) 100%)\`,
                        zIndex: 25,
                    }}
                />
            )}

            {/* Color tint overlay */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundColor: tintColors[colorTint],
                    zIndex: 20,
                }}
            />

            {/* Noise layer */}
            <NoiseCanvas
                intensity={noiseIntensity * (glitchState.active ? 2 : 1)}
                width={dimensions.width}
                height={dimensions.height}
            />

            {/* Scan lines */}
            <ScanLines intensity={scanlineIntensity} />

            {/* VHS tracking distortion */}
            {vhsTracking && <VHSTracking active={glitchState.active || isHovering} />}

            {/* Main content with effects */}
            <motion.div
                className="relative z-5 text-white"
                style={{ opacity: flickerOpacity }}
                animate={{
                    x: glitchState.xShift,
                    y: glitchState.yShift,
                }}
                transition={{ duration: 0.05, ease: 'linear' }}
            >
                <GlitchSlices slices={glitchState.slice}>
                    <RGBShiftLayer
                        intensity={rgbShiftIntensity}
                        glitchActive={glitchState.active}
                    >
                        {content}
                    </RGBShiftLayer>
                </GlitchSlices>
            </motion.div>

            {/* Phosphor glow overlay */}
            {phosphorGlow && (
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.03) 0%, transparent 70%)',
                        zIndex: 30,
                    }}
                />
            )}

            {/* Power-on line effect (occasional) */}
            <AnimatePresence>
                {glitchState.active && Math.random() > 0.7 && (
                    <motion.div
                        initial={{ scaleY: 1, opacity: 1 }}
                        animate={{ scaleY: 0.002, opacity: 0.8 }}
                        exit={{ scaleY: 1, opacity: 0 }}
                        transition={{ duration: 0.1 }}
                        className="absolute inset-0 bg-white pointer-events-none"
                        style={{ zIndex: 50 }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default CRTGlitch;
`
    },
    {
        id: 'flip-clock',
        name: 'Flip Clock',
        index: 29,
        description: 'A kinetic flip-dot style clock where numbers are formed by a grid of individually flipping pixels, creating a mechanical retro aesthetic. Features rounded matrix numbers and wave-based flip animations.',
        tags: ['clock', 'time', 'flip', 'kinetic', 'retro', 'matrix'],
        category: 'animation',
        previewConfig: { theme: 'dark' },
        dependencies: ['framer-motion', 'react'],
        usage: `import { FlipClock } from '@/components/ui';

// Basic usage
<FlipClock />`,
        props: [],
        fullCode: `
"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';

// ============================================
// DIGIT PATTERNS (4x6 Grid)
// 1 = Active (Visible Pixel)
// 0 = Inactive (Background)
// Corners are rounded as requested
// ============================================
const DIGIT_PATTERNS: Record<string, number[][]> = {
    '0': [
        [0, 1, 1, 0],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [0, 1, 1, 0]
    ],
    '1': [
        [0, 0, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 1, 1, 1]
    ],
    '2': [
        [0, 1, 1, 0],
        [1, 0, 0, 1],
        [0, 0, 0, 1],
        [0, 0, 1, 0],
        [0, 1, 0, 0],
        [1, 1, 1, 1]
    ],
    '3': [
        [0, 1, 1, 0],
        [1, 0, 0, 1],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
        [1, 0, 0, 1],
        [0, 1, 1, 0]
    ],
    '4': [
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [1, 1, 1, 1],
        [0, 0, 0, 1],
        [0, 0, 0, 1],
        [0, 0, 0, 1]
    ],
    '5': [
        [1, 1, 1, 1],
        [1, 0, 0, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 1],
        [1, 0, 0, 1],
        [0, 1, 1, 0]
    ],
    '6': [
        [0, 1, 1, 0],
        [1, 0, 0, 0],
        [1, 1, 1, 0],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [0, 1, 1, 0]
    ],
    '7': [
        [1, 1, 1, 1],
        [0, 0, 0, 1],
        [0, 0, 1, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0]
    ],
    '8': [
        [0, 1, 1, 0],
        [1, 0, 0, 1],
        [0, 1, 1, 0],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [0, 1, 1, 0]
    ],
    '9': [
        [0, 1, 1, 0],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [0, 1, 1, 1],
        [0, 0, 0, 1],
        [0, 1, 1, 0]
    ]
};

// ============================================
// TYPES
// ============================================
interface FlipPixelProps {
    active: boolean;
    x: number;
    y: number;
}

// ============================================
// SUB-COMPONENT: FLIP PIXEL
// ============================================
const FlipPixel = React.memo(({ active, x, y }: FlipPixelProps) => {
    return (
        <motion.div
            initial={false}
            animate={{
                rotateX: active ? 180 : 0,
            }}
            transition={{
                duration: 0.3, // Faster transition
                ease: [0.4, 0.0, 0.2, 1], // Smooth easing
                // Removed wave delay to prevent sticking
            }}
            style={{
                width: '100%',
                height: '100%',
                borderRadius: '4px',
                position: 'relative',
                transformStyle: 'preserve-3d',
                boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
                willChange: 'transform', // Performance optimization
            }}
        >
            {/* Front Face (Inactive/Dark) */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    backfaceVisibility: 'hidden',
                    backgroundColor: '#1a1a1a',
                    borderRadius: '4px',
                    border: '1px solid #333'
                }}
            />
            {/* Back Face (Active/Bright) */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    backfaceVisibility: 'hidden',
                    transform: 'rotateX(180deg)',
                    backgroundColor: '#ffffff',
                    borderRadius: '4px',
                    boxShadow: '0 0 10px rgba(255,255,255,0.5)'
                }}
            />
        </motion.div>
    );
});

// ============================================
// MAIN COMPONENT
// ============================================
export function FlipClock() {
    const [timeStr, setTimeStr] = useState("000000"); // HHMMSS

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const h = now.getHours().toString().padStart(2, '0');
            const m = now.getMinutes().toString().padStart(2, '0');
            const s = now.getSeconds().toString().padStart(2, '0');
            setTimeStr(h + m + s);
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    // Grid Configuration
    // - Digits are 4x6
    // - Fill the screen with flip cards
    // - Time centered vertically
    // - Layout: PAD(1) | H1(4) | sp(1) | H2(4) | colon(2) | M1(4) | sp(1) | M2(4) | colon(2) | S1(4) | sp(1) | S2(4) | PAD(1)
    // - Cols: 37 (to accommodate all digits with spacing)
    // - Rows: Expanded to fill screen (30 rows for more coverage)

    const rows = 30; // Increased for full screen coverage
    const cols = 37;

    const grid = useMemo(() => {
        // Initialize empty grid (all idle/inactive)
        const newGrid = Array(rows).fill(0).map(() => Array(cols).fill(0));

        const insertDigit = (digit: string, startCol: number, startRow: number) => {
            const pattern = DIGIT_PATTERNS[digit];
            if (!pattern) return;
            pattern.forEach((row, r) => {
                row.forEach((val, c) => {
                    if (startRow + r < rows && startCol + c < cols) {
                        newGrid[startRow + r][startCol + c] = val;
                    }
                });
            });
        };

        const [h1, h2, m1, m2, s1, s2] = timeStr.split('');
        // Center the time vertically in the expanded grid
        // Digit height is 6, so center at (30 - 6) / 2 = 12
        const startRow = 12;

        insertDigit(h1, 1, startRow);       // First Hour Digit (col 1-4)
        insertDigit(h2, 6, startRow);       // Second Hour Digit (col 6-9)

        // First Colon (HH:MM) at cols 11-12
        newGrid[startRow + 1][11] = 1;
        newGrid[startRow + 4][11] = 1;
        newGrid[startRow + 1][12] = 1;
        newGrid[startRow + 4][12] = 1;

        insertDigit(m1, 14, startRow);      // First Minute Digit (col 14-17)
        insertDigit(m2, 19, startRow);      // Second Minute Digit (col 19-22)

        // Second Colon (MM:SS) at cols 24-25
        newGrid[startRow + 1][24] = 1;
        newGrid[startRow + 4][24] = 1;
        newGrid[startRow + 1][25] = 1;
        newGrid[startRow + 4][25] = 1;

        insertDigit(s1, 27, startRow);      // First Second Digit (col 27-30)
        insertDigit(s2, 32, startRow);      // Second Second Digit (col 32-35)

        return newGrid;
    }, [timeStr]);

    return (
        <div className="w-full h-full flex items-center justify-center bg-black p-4">
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: \`repeat(\${cols}, 1fr)\`,
                    gridTemplateRows: \`repeat(\${rows}, 1fr)\`,
                    gap: '6px', // Gap between flip cards
                    width: '100%',
                    aspectRatio: \`\${cols}/\${rows}\`
                }}
            >
                {grid.map((row, r) => (
                    row.map((isActive, c) => (
                        <FlipPixel
                            key={\`\${r}-\${c}\`}
                            active={isActive === 1}
                            x={c}
                            y={r}
                        />
                    ))
                ))}
            </div>
        </div>
    );
}
`
    },
    {
        id: 'gravity',
        name: 'Gravity',
        index: 30,
        description: 'A physics-based layout where UI elements fall, stack, and collide using real-time rigid body physics. Fully interactive: grab, throw, and watch them settle.',
        tags: ['physics', 'matter-js', 'gravity', 'interactive', 'playground', 'collision'],
        category: 'interaction',
        previewConfig: { gravityStrength: 1, wallBounciness: 0.8 },
        dependencies: ['matter-js', 'react', 'framer-motion'],
        usage: `import { Gravity } from '@/components/ui';

// Basic usage
<Gravity />

// Custom configuration
<Gravity
    config={{
        gravityStrength: 2,
        interactive: true,
        debug: false
    }}
/>`,
        props: [
            { name: 'items', type: 'GravityItem[]', default: 'defaultItems', description: 'Array of items to render as physics bodies' },
            { name: 'config', type: 'GravityConfig', default: '{}', description: 'Physics configuration' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' },
        ],
        fullCode: `
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Matter from "matter-js";

// ============================================
// TYPES
// ============================================

export interface GravityItem {
    id: string;
    content: React.ReactNode;
    width: number;
    height: number;
}

export interface GravityConfig {
    gravityStrength: number;
    gravityX: number;
    gravityY: number;
    wallBounciness: number;
    itemBounciness: number;
    friction: number;
    frictionAir: number;
    minFontSize: number; // For mobile/small screens
    maxFontSize: number; // For desktop
}

export interface GravityProps {
    text?: string;
    config?: Partial<GravityConfig>;
    className?: string;
}

// ============================================
// FONT LIST - Diverse typographic styles
// ============================================

// ============================================
// FONT LIST - Wild & Unique
// ============================================

const fontFamilies = [
    "'Robota', sans-serif",                   // Geometric
    "'Abril Fatface', cursive",               // Heavy Didone
    "'Rubik Glitch', system-ui",             // Chaos/Glitch
    "'Monoton', system-ui",                  // Retro Lines
    "'Bangers', system-ui",                  // Comic Loud
    "'Creepster', system-ui",                // Horror Melt
    "'Permanent Marker', cursive",           // Sharpie
    "'Black Ops One', system-ui",            // Stencil Military
    "'Rye', serif",                          // Western
    "'UnifrakturMaguntia', cursive",         // Gothic Blackletter
    "'Bungee Shade', system-ui",             // 3D Block
    "'Audiowide', system-ui",                // Sci-Fi
    "'Press Start 2P', system-ui",           // 8-bit
];

// Google Fonts URL for the above fonts
const googleFontsUrl = "https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Audiowide&family=Bangers&family=Black+Ops+One&family=Bungee+Shade&family=Creepster&family=Monoton&family=Permanent+Marker&family=Press+Start+2P&family=Righteous&family=Rubik+Glitch&family=Rye&family=UnifrakturMaguntia&display=swap";

// ============================================
// LETTER COMPONENT
// ============================================

const Letter = ({ letter, fontSize }: { letter: string; fontSize: number }) => {
    return (
        <span
            className="font-black pointer-events-none select-none relative block text-foreground transition-colors duration-300"
            style={{
                fontSize: \`\${fontSize}px\`,
                lineHeight: 1,
                // Initial font - will be overridden by physics loop
                fontFamily: fontFamilies[0],
                letterSpacing: '-0.02em',
                textShadow: \`
                    1px 1px 0px rgba(100,100,100,0.4),
                    2px 2px 0px rgba(100,100,100,0.35),
                    3px 3px 0px rgba(100,100,100,0.3),
                    4px 4px 0px rgba(100,100,100,0.25),
                    5px 5px 0px rgba(100,100,100,0.2),
                    6px 6px 0px rgba(100,100,100,0.15),
                    0px 0px 10px rgba(0,0,0,0.2)
                \`,
                // Use a mix-blend-mode for better depth integration if background allows
                transformOrigin: 'center center',
            }}
        >
            {letter.toUpperCase()}
        </span>
    );
};

// ============================================
// DEFAULT CONFIG
// ============================================

const defaultConfig: GravityConfig = {
    gravityStrength: 1,
    gravityX: 0,
    gravityY: 1,
    wallBounciness: 0.7,
    itemBounciness: 0.5,
    friction: 0.05,
    frictionAir: 0.01,
    minFontSize: 60, // Reduced to 60px for mobile to fit 7 letters
    maxFontSize: 240, // ~15rem approx for desktop
};

// ============================================
// SPRING PHYSICS UTILS
// ============================================

interface DistortionState {
    scaleX: number;
    scaleY: number;
    skewX: number;
    skewY: number;
}

interface SpringVelocity {
    scaleX: number;
    scaleY: number;
    skewX: number;
    skewY: number;
}

// ============================================
// GRAVITY COMPONENT
// ============================================

export function Gravity({
    text = "MORPHYS",
    config: userConfig,
    className = "",
}: GravityProps) {
    const config = { ...defaultConfig, ...userConfig };

    const containerRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<Matter.Engine | null>(null);
    const runnerRef = useRef<Matter.Runner | null>(null);
    const bodiesMapRef = useRef<Map<string, Matter.Body>>(new Map());
    const elementsRef = useRef<Map<string, HTMLDivElement>>(new Map());
    const requestRef = useRef<number | null>(null);

    // Spring Physics State
    const distortionMapRef = useRef<Map<string, DistortionState>>(new Map());
    const velocityMapRef = useRef<Map<string, SpringVelocity>>(new Map());

    // Font State
    const fontMapRef = useRef<Map<string, number>>(new Map());
    const lastCollisionRef = useRef<Map<string, number>>(new Map()); // Debounce font changes

    const [isReady, setIsReady] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Check for mobile
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Determined font size
    const currentFontSize = isMobile ? config.minFontSize : config.maxFontSize;

    // Letter dimensions - Derived from font size for consistency
    const letterWidth = currentFontSize * 0.8;
    const letterHeight = currentFontSize * 0.9;

    // Generate items from text
    const letters = text.split('');
    const items: GravityItem[] = letters.map((letter, index) => ({
        id: \`letter-\${index}-\${letter}\`,
        content: <Letter letter={letter} fontSize={currentFontSize} />,
        width: letterWidth,
        height: letterHeight,
    }));

    // Store element ref
    const setElementRef = useCallback((el: HTMLDivElement | null, id: string) => {
        if (el) elementsRef.current.set(id, el);
    }, []);

    // Initialize after first render & Load Fonts
    useEffect(() => {
        const timer = setTimeout(() => setIsReady(true), 100);

        // Load Google Fonts
        const link = document.createElement('link');
        link.href = googleFontsUrl;
        link.rel = 'stylesheet';
        document.head.appendChild(link);

        return () => {
            clearTimeout(timer);
            // Optional: remove font link on cleanup? Usually better to keep it cached.
            document.head.removeChild(link);
        };
    }, []);

    // Physics initialization
    useEffect(() => {
        if (!isReady || !containerRef.current) return;

        const { Engine, Runner, World, Bodies, Mouse, MouseConstraint, Events } = Matter;

        const engine = Engine.create({ enableSleeping: false });
        engineRef.current = engine;

        engine.world.gravity.y = config.gravityY * config.gravityStrength;
        engine.world.gravity.x = config.gravityX * config.gravityStrength;

        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;

        // Walls
        const wallThickness = 100;
        World.add(engine.world, [
            Bodies.rectangle(containerWidth / 2, containerHeight + wallThickness / 2, containerWidth + 200, wallThickness, { isStatic: true, friction: 0.1, restitution: config.wallBounciness, label: 'Wall' }), // Bottom
            Bodies.rectangle(-wallThickness / 2, containerHeight / 2, wallThickness, containerHeight * 2, { isStatic: true, friction: 0.1, restitution: config.wallBounciness, label: 'Wall' }), // Left
            Bodies.rectangle(containerWidth + wallThickness / 2, containerHeight / 2, wallThickness, containerHeight * 2, { isStatic: true, friction: 0.1, restitution: config.wallBounciness, label: 'Wall' }), // Right
            Bodies.rectangle(containerWidth / 2, -wallThickness / 2, containerWidth + 200, wallThickness, { isStatic: true, restitution: config.wallBounciness, label: 'Wall' }), // Top
        ]);

        // Bodies
        items.forEach((item, index) => {
            const spacing = containerWidth / (items.length + 1);
            const x = spacing * (index + 1);

            // Safer spawn logic to prevent floor clipping
            const verticalStrut = isMobile ? 40 : 80;
            const startY = isMobile ? 50 : 100;
            const calculatedY = startY + (index * verticalStrut);
            // Clamp to be inside container
            const maxY = containerHeight - item.height - 20;
            const y = Math.max(20, Math.min(calculatedY, maxY));

            const body = Bodies.rectangle(x, y, item.width, item.height, {
                angle: (Math.random() - 0.5) * 0.5,
                restitution: config.itemBounciness,
                friction: config.friction,
                frictionAir: config.frictionAir,
                label: item.id,
            });

            World.add(engine.world, body);
            bodiesMapRef.current.set(item.id, body);

            // Initialize states
            distortionMapRef.current.set(item.id, { scaleX: 1, scaleY: 1, skewX: 0, skewY: 0 });
            velocityMapRef.current.set(item.id, { scaleX: 0, scaleY: 0, skewX: 0, skewY: 0 });

            // Random initial font
            fontMapRef.current.set(item.id, Math.floor(Math.random() * fontFamilies.length));
        });

        // Runner
        const runner = Runner.create();
        runnerRef.current = runner;
        Runner.run(runner, engine);

        // Mouse
        const mouse = Mouse.create(containerRef.current);
        const mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: { stiffness: 0.2, render: { visible: false } }
        });
        World.add(engine.world, mouseConstraint);
        if (mouse.element) mouse.element.removeEventListener("wheel", (mouse as any).mousewheel);

        // Collision Event - JELLY & FONT SWAP
        Events.on(engine, "collisionStart", (event) => {
            event.pairs.forEach((pair) => {
                const bodyA = pair.bodyA;
                const bodyB = pair.bodyB;

                const speed = Matter.Vector.magnitude(
                    Matter.Vector.sub(bodyA.velocity, bodyB.velocity)
                );

                if (speed > 1.5) {
                    const impulse = Math.min(speed * 0.015, 0.2);
                    const now = Date.now();

                    // Apply JELLY Impulse & Change Font
                    [bodyA, bodyB].forEach(body => {
                        if (body.isStatic) return;

                        // Jelly Physics
                        const vel = velocityMapRef.current.get(body.label);
                        if (vel) {
                            velocityMapRef.current.set(body.label, {
                                scaleX: vel.scaleX + (Math.random() > 0.5 ? impulse : -impulse),
                                scaleY: vel.scaleY + (Math.random() > 0.5 ? impulse : -impulse),
                                skewX: vel.skewX + (Math.random() - 0.5) * impulse * 15,
                                skewY: vel.skewY + (Math.random() - 0.5) * impulse * 15,
                            });
                        }

                        // Change Font (Debounced 100ms)
                        const lastChange = lastCollisionRef.current.get(body.label) || 0;
                        if (now - lastChange > 100) {
                            const currentFont = fontMapRef.current.get(body.label) || 0;
                            // Pick random new font different from current
                            let newFont;
                            do {
                                newFont = Math.floor(Math.random() * fontFamilies.length);
                            } while (newFont === currentFont);

                            fontMapRef.current.set(body.label, newFont);
                            lastCollisionRef.current.set(body.label, now);
                        }
                    });
                }
            });
        });

        // Animation Loop
        const loop = () => {
            const stiffness = 0.1;
            const damping = 0.12;

            bodiesMapRef.current.forEach((body, id) => {
                const element = elementsRef.current.get(id);
                const item = items.find(i => i.id === id);

                if (element && item) {
                    const { x, y } = body.position;
                    const rotation = body.angle;

                    // Spring Physics Solver
                    const dist = distortionMapRef.current.get(id) || { scaleX: 1, scaleY: 1, skewX: 0, skewY: 0 };
                    const vel = velocityMapRef.current.get(id) || { scaleX: 0, scaleY: 0, skewX: 0, skewY: 0 };

                    const currentFontIndex = fontMapRef.current.get(id) || 0;

                    // Helper to solve spring dimension
                    const solve = (pos: number, target: number, vel: number) => {
                        const force = -stiffness * (pos - target);
                        const newVel = (vel + force) * (1 - damping);
                        return { pos: pos + newVel, vel: newVel };
                    };

                    const sX = solve(dist.scaleX, 1, vel.scaleX);
                    const sY = solve(dist.scaleY, 1, vel.scaleY);
                    const skX = solve(dist.skewX, 0, vel.skewX);
                    const skY = solve(dist.skewY, 0, vel.skewY);

                    // Update Refs
                    distortionMapRef.current.set(id, { scaleX: sX.pos, scaleY: sY.pos, skewX: skX.pos, skewY: skY.pos });
                    velocityMapRef.current.set(id, { scaleX: sX.vel, scaleY: sY.vel, skewX: skX.vel, skewY: skY.vel });

                    // Apply Transform & Font
                    // We target the span inside the div (first child) for font change to respect 'text-foreground'
                    const span = element.firstElementChild as HTMLElement;
                    if (span) {
                        span.style.fontFamily = fontFamilies[currentFontIndex];
                    }

                    element.style.transform = \`
                        translate3d(\${x - item.width / 2}px, \${y - item.height / 2}px, 0) 
                        rotate(\${rotation}rad)
                        scale(\${sX.pos}, \${sY.pos})
                        skew(\${skX.pos}deg, \${skY.pos}deg)
                    \`;
                    element.style.opacity = '1';
                }
            });
            requestRef.current = requestAnimationFrame(loop);
        };

        requestRef.current = requestAnimationFrame(loop);

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            if (runnerRef.current) Runner.stop(runnerRef.current);
            if (engineRef.current) Engine.clear(engineRef.current);
            bodiesMapRef.current.clear();
            distortionMapRef.current.clear();
            velocityMapRef.current.clear();
            fontMapRef.current.clear();
            engineRef.current = null;
            runnerRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReady, isMobile, text]);

    // Handle resize
    useEffect(() => {
        if (!isReady) return;

        const handleResize = () => {
            if (!containerRef.current || !engineRef.current) return;
            const { World, Bodies, Composite } = Matter;
            const width = containerRef.current.clientWidth;
            const height = containerRef.current.clientHeight;

            Composite.allBodies(engineRef.current.world).forEach(b => {
                if (b.label === 'Wall') World.remove(engineRef.current!.world, b);
            });

            const wallThickness = 100;
            World.add(engineRef.current.world, [
                Bodies.rectangle(width / 2, height + wallThickness / 2, width + 200, wallThickness, { isStatic: true, restitution: config.wallBounciness, label: 'Wall' }),
                Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height * 2, { isStatic: true, restitution: config.wallBounciness, label: 'Wall' }),
                Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height * 2, { isStatic: true, restitution: config.wallBounciness, label: 'Wall' }),
                Bodies.rectangle(width / 2, -wallThickness / 2, width + 200, wallThickness, { isStatic: true, restitution: config.wallBounciness, label: 'Wall' }),
            ]);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isReady, config.wallBounciness]);

    return (
        <div
            ref={containerRef}
            className={\`relative w-full h-full overflow-hidden bg-transparent \${className}\`}
            style={{ touchAction: 'none' }}
        >
            {/* Letter Items */}
            {items.map((item) => (
                <div
                    key={item.id}
                    ref={(el) => setElementRef(el, item.id)}
                    className="absolute top-0 left-0 cursor-grab active:cursor-grabbing flex items-center justify-center p-4 md:p-8"
                    style={{
                        width: item.width,
                        height: item.height,
                        opacity: 0,
                        willChange: 'transform',
                        userSelect: 'none',
                    }}
                >
                    {item.content}
                </div>
            ))}

            {/* Helper Text */}
            <div className="absolute bottom-4 md:bottom-6 left-0 w-full text-center pointer-events-none">
                <p className="text-xs md:text-sm font-medium font-mono text-foreground/30 tracking-wider">GRAB & THROW</p>
            </div>
        </div>
    );
}

export default Gravity;
`
    },
    {
        id: 'pixel-simulation',
        name: 'Pixel Simulation',
        index: 31,
        description: 'A voxel-based 3D renderer that visualizes shapes using a grid of dynamic pixels. Features canvas-based rendering with customizable resolution, gap, and color modes.',
        tags: ['pixel', '3d', 'voxel', 'canvas', 'simulation', 'retro'],
        category: 'animation',
        previewConfig: {
            shape: 'car',
            pixelSize: 8,
            gap: 2,
        },
        dependencies: ['react'],
        usage: `import { PixelSimulation } from '@/components/ui';

// Basic usage
<PixelSimulation />

// With custom configuration
<PixelSimulation
    config={{
        shape: 'car',
        pixelSize: 8,
        gap: 2,
        rotationX: 0,
        rotationY: 0,
        colorMode: 'depth',
        color1: '#4F46E5', // Indigo
        color2: '#EC4899', // Pink
        speed: 2,
    }}
    autoPlay={true}
/>`,
        props: [
            { name: 'config', type: 'Partial<PixelSimulationConfig>', default: '{}', description: 'Appearance and behavior configuration' },
            { name: 'autoPlay', type: 'boolean', default: 'true', description: 'Enable automatic rotation' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' },
        ],
        fullCode: `
"use client";

import React, { useEffect, useRef, useState } from 'react';

// ============================================
// TYPES & INTERFACES
// ============================================

export type PixelShape = 'torus' | 'cube' | 'car';

interface ObjMesh {
    vertices: number[];
    faces: number[];
    normals?: number[];
}


export type ColorMode = 'monochrome' | 'depth' | 'normal' | 'rainbow';

export interface PixelSimulationConfig {
    shape: PixelShape;
    pixelSize: number; // Size of each pixel in px
    gap: number;       // Gap between pixels in px
    speed: number;
    rotationX: number;
    rotationY: number;
    colorMode: ColorMode;
    color1: string;    // Primary color (or near color)
    color2: string;    // Secondary color (or far color)
}

export interface PixelSimulationProps {
    config?: Partial<PixelSimulationConfig>;
    className?: string;
    autoPlay?: boolean;
}

// ============================================
// DEFAULT CONFIG
// ============================================

const defaultConfig: PixelSimulationConfig = {
    shape: 'car',
    pixelSize: 8,
    gap: 1,
    speed: 4,
    rotationX: 0,
    rotationY: 0,
    colorMode: 'depth',
    color1: '#6366f1', // Indigo-500
    color2: '#a855f7', // Purple-500
};

// ============================================
// HELPER: COLOR INTERPOLATION
// ============================================

const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
};

const lerpColor = (c1: { r: number, g: number, b: number }, c2: { r: number, g: number, b: number }, t: number) => {
    const r = Math.round(c1.r + (c2.r - c1.r) * t);
    const g = Math.round(c1.g + (c2.g - c1.g) * t);
    const b = Math.round(c1.b + (c2.b - c1.b) * t);
    return \`rgb(\${r}, \${g}, \${b})\`;
};

const parseObj = (text: string, maxVertices = 10000): ObjMesh => {
    const vertices: number[] = [];
    const faces: number[] = [];
    const lines = text.split('\\n');
    const step = Math.max(1, Math.floor(lines.length / (maxVertices * 2)));

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('v ')) {
            if (Math.random() > 0.5 && step > 1) continue;
            const parts = line.split(/\\s+/);
            const vx = parseFloat(parts[1]);
            const vy = parseFloat(parts[2]);
            const vz = parseFloat(parts[3]);
            if (!isNaN(vx)) {
                vertices.push(vx * 1.5, -vy * 1.5, vz * 1.5);
            }
        }
    }
    return { vertices, faces };
};

// ============================================
// PIXEL RENDERER COMPONENT
// ============================================

export function PixelSimulation({
    config: userConfig,
    className = "",
    autoPlay = true
}: PixelSimulationProps) {
    const config = { ...defaultConfig, ...userConfig };
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const meshCache = useRef<ObjMesh | null>(null);
    const [isLoadingModel, setIsLoadingModel] = useState(false);
    const [modelReady, setModelReady] = useState(0);

    // Rotation state
    const A = useRef(0); // X Rotation
    const B = useRef(0); // Y Rotation

    // Dimensions state
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { clientWidth, clientHeight } = containerRef.current;
                setDimensions({ width: clientWidth, height: clientHeight });
            }
        };

        const resizeObserver = new ResizeObserver(updateDimensions);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        // Initial call
        updateDimensions();

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    // Load Model Effect
    useEffect(() => {
        if (config.shape === 'car' && !meshCache.current && !isLoadingModel) {
            setIsLoadingModel(true);
            fetch('/Gulf%20Mclaren%202022.obj')
                .then(res => res.text())
                .then(text => {
                    const mesh = parseObj(text, 60000);
                    let minX = Infinity, maxX = -Infinity;
                    let minY = Infinity, maxY = -Infinity;
                    let minZ = Infinity, maxZ = -Infinity;

                    for (let i = 0; i < mesh.vertices.length; i += 3) {
                        const x = mesh.vertices[i];
                        const y = mesh.vertices[i + 1];
                        const z = mesh.vertices[i + 2];
                        if (x < minX) minX = x; if (x > maxX) maxX = x;
                        if (y < minY) minY = y; if (y > maxY) maxY = y;
                        if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
                    }

                    const cx = (minX + maxX) / 2;
                    const cy = (minY + maxY) / 2;
                    const cz = (minZ + maxZ) / 2;
                    const scaleFactor = 4.5 / Math.max(maxX - minX, maxY - minY, maxZ - minZ);

                    for (let i = 0; i < mesh.vertices.length; i += 3) {
                        mesh.vertices[i] = (mesh.vertices[i] - cx) * scaleFactor;
                        mesh.vertices[i + 1] = (mesh.vertices[i + 1] - cy) * scaleFactor;
                        mesh.vertices[i + 2] = (mesh.vertices[i + 2] - cz) * scaleFactor;
                    }

                    meshCache.current = mesh;
                    setIsLoadingModel(false);
                    setModelReady(prev => prev + 1);
                })
                .catch(err => {
                    console.error("Failed to load car model", err);
                    setIsLoadingModel(false);
                });
        }
    }, [config.shape]);

    const renderFrame = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { width, height } = dimensions;
        if (width === 0 || height === 0) return;

        // Handle high-DPI displays
        const dpr = window.devicePixelRatio || 1;
        if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);
        }

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Parameters
        const pixelSize = config.pixelSize;
        const gap = config.gap;
        const cellSize = pixelSize + gap;

        const cols = Math.ceil(width / cellSize);
        const rows = Math.ceil(height / cellSize);

        // Z-Buffer (Depth Buffer)
        // Store simple depth value (1/z) for each cell
        const zBuffer = new TypedFloat32Array(cols * rows);

        const K1 = Math.min(width, height) * 0.7; // Scale factor

        // Update Rotation
        if (autoPlay) {
            if (config.shape === 'car') {
                A.current = 0;
                B.current += 0.02 * (config.speed / 4);
            } else {
                A.current += 0.04 * (config.speed / 4);
                B.current += 0.02 * (config.speed / 4);
            }
        } else {
            A.current = config.rotationX;
            B.current = config.rotationY;
        }

        const cA = Math.cos(A.current);
        const sA = Math.sin(A.current);
        const cB = Math.cos(B.current);
        const sB = Math.sin(B.current);

        // Pre-compute colors
        const rgb1 = hexToRgb(config.color1);
        const rgb2 = hexToRgb(config.color2);

        // Helper to draw a pixel
        const drawPixel = (x: number, y: number, z: number, lum: number) => {
            // Screen coords to Grid coords
            const col = Math.floor(x / cellSize);
            const row = Math.floor(y / cellSize);

            if (col >= 0 && col < cols && row >= 0 && row < rows) {
                const idx = row * cols + col;
                const invDepth = 1 / z;

                if (invDepth > zBuffer[idx]) {
                    zBuffer[idx] = invDepth;

                    // Render Pixel Position
                    const pxX = col * cellSize + gap / 2;
                    const pxY = row * cellSize + gap / 2;

                    // Determine Color
                    let color = 'white';

                    if (config.colorMode === 'monochrome') {
                        // Closer = Brighter + Lum
                        // invDepth varies ~0.1 (far) to ~0.3 (near)
                        const brightness = Math.min(1, Math.max(0.1, invDepth * 3 * lum));
                        color = \`rgba(\${rgb1.r}, \${rgb1.g}, \${rgb1.b}, \${brightness})\`;
                    }
                    else if (config.colorMode === 'depth') {
                        // Depth mix
                        // Norm depth approx 0.1 to 0.4
                        // T near 1 = bright/close, T near 0 = dark/far
                        const t = Math.min(1, Math.max(0, (invDepth - 0.1) * 3));
                        color = lerpColor(rgb2, rgb1, t);
                    }
                    else if (config.colorMode === 'normal') {
                        // Use lum (normal-based lighting)
                        // This gives that "shaded" look
                        const t = Math.min(1, Math.max(0, lum));
                        color = lerpColor(rgb2, rgb1, t);
                    }
                    else if (config.colorMode === 'rainbow') {
                        const hue = (col * 2 + row * 2 + Date.now() * 0.1) % 360;
                        color = \`hsl(\${hue}, 70%, 60%)\`;
                    }

                    // Actual Draw
                    ctx.fillStyle = color;

                    // Optional: Draw smaller pixel if further away?
                    // const size = pixelSize * (invDepth * 5); // Example dynamic size
                    // ctx.fillRect(pxX, pxY, size, size);

                    ctx.fillRect(pxX, pxY, pixelSize, pixelSize);
                }
            }
        };

        // RENDER SHAPES
        if (config.shape === 'torus') {
            // Torus Logic
            // R1=1, R2=2
            for (let j = 0; j < 6.28; j += 0.04) {
                const ct = Math.cos(j);
                const st = Math.sin(j);
                for (let i = 0; i < 6.28; i += 0.02) {
                    const sp = Math.sin(i);
                    const cp = Math.cos(i);
                    const h = ct + 2; // R2
                    const D = 1 / (sp * h * sA + st * cA + 5); // 1/z
                    const t = sp * h * cA - st * sA;

                    const x = (width / 2) + K1 * D * (cp * h * cB - t * sB);
                    const y = (height / 2) + (K1) * D * (cp * h * sB + t * cB);

                    // Luminance
                    // N is normal dot light
                    const N = ((st * sA - sp * ct * cA) * cB - sp * ct * sA - st * cA - cp * ct * sB);
                    const lum = Math.max(0.1, N);

                    drawPixel(x, y, 1 / D, lum);
                }
            }
        }
        else if (config.shape === 'car' && meshCache.current) {
            const mesh = meshCache.current;
            const len = mesh.vertices.length;

            for (let i = 0; i < len; i += 3) {
                const vx = mesh.vertices[i];
                const vy = mesh.vertices[i + 1];
                const vz = mesh.vertices[i + 2];

                // Rotate X (A)
                let y1 = vy * cA - vz * sA;
                let z1 = vy * sA + vz * cA;

                // Rotate Y (B)
                let x1 = vx * cB - z1 * sB;
                let z2 = vx * sB + z1 * cB;

                const z_depth = z2 + 3.25;
                if (z_depth <= 0) continue;

                const ooz = 1 / z_depth;
                const x = (width / 2) + K1 * ooz * x1;
                const y = (height / 2) + K1 * ooz * y1;

                // Estimate lum
                const lum = Math.max(0.1, 1 - (z_depth / 8));

                drawPixel(x, y, z_depth, lum);
            }
        }
        else if (config.shape === 'cube') {
            // Cube Logic
            const size = 1.2;
            const step = 0.08;

            // Draw Face Helper
            const drawFace = (
                uMin: number, uMax: number,
                vMin: number, vMax: number,
                fixedVal: number,
                coordIdx: 0 | 1 | 2,
                nx: number, ny: number, nz: number
            ) => {
                for (let u = uMin; u <= uMax; u += step) {
                    for (let v = vMin; v <= vMax; v += step) {
                        let cx = 0, cy = 0, cz = 0;
                        // Map uv to coords
                        if (coordIdx === 0) { cx = fixedVal; cy = u; cz = v; }
                        else if (coordIdx === 1) { cx = u; cy = fixedVal; cz = v; }
                        else if (coordIdx === 2) { cx = u; cy = v; cz = fixedVal; }

                        // Rotate
                        // Corresponds to Torus rotation matrices for consistency

                        // X rotation (A)
                        let y = cy * cA - cz * sA;
                        let z = cy * sA + cz * cA;

                        // Y rotation (B)
                        let xFinal = cx * cB - z * sB;
                        let zFinal = cx * sB + z * cB;

                        const z_depth = zFinal + 3.5; // Offset camera
                        if (z_depth <= 0) continue;

                        const ooz = 1 / z_depth;
                        const x = (width / 2) + K1 * ooz * xFinal;
                        const yScreen = (height / 2) + K1 * ooz * y;

                        // Normal rotation for lighting
                        // X rot
                        let ny1 = ny * cA - nz * sA;
                        let nz1 = ny * sA + nz * cA;
                        // Y rot
                        let nx1 = nx * cB - nz1 * sB;
                        let nz2 = nx * sB + nz1 * cB;

                        // Light vector (0, 0, -1) => facing camera
                        // Dot product = nx1*0 + ny1*0 + nz2*(-1) = -nz2
                        const lum = Math.max(0.1, -nz2);

                        drawPixel(x, yScreen, z_depth, lum);
                    }
                }
            };

            // Draw 6 faces
            // Back/Front
            drawFace(-size, size, -size, size, -size, 2, 0, 0, -1);
            drawFace(-size, size, -size, size, size, 2, 0, 0, 1);
            // Top/Bottom
            drawFace(-size, size, -size, size, -size, 1, 0, -1, 0);
            drawFace(-size, size, -size, size, size, 1, 0, 1, 0);
            // Left/Right
            drawFace(-size, size, -size, size, -size, 0, -1, 0, 0);
            drawFace(-size, size, -size, size, size, 0, 1, 0, 0);
        }

        if (autoPlay) {
            animationRef.current = requestAnimationFrame(renderFrame);
        }
    };

    useEffect(() => {
        // Start loop
        renderFrame();
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [config.shape, config.pixelSize, config.gap, config.speed, config.rotationX, config.rotationY, config.colorMode, config.color1, config.color2, autoPlay, dimensions, modelReady]);

    return (
        <div ref={containerRef} className={\`w-full h-full relative overflow-hidden \${className}\`}>
            {isLoadingModel && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                    <span className="font-mono text-sm animate-pulse">LOADING MODEL...</span>
                </div>
            )}
            <canvas
                ref={canvasRef}
                className="block w-full h-full"
                style={{ imageRendering: 'pixelated' }}
            />
        </div>
    );
}

// Float32Array constructor shim for safety if needed, though standard
const TypedFloat32Array = (typeof Float32Array !== 'undefined') ? Float32Array : Array;

export default PixelSimulation;
`
    },
    {
        id: 'running-outline',
        name: 'Running Outline',
        index: 32,
        description: 'Vertical stack of text that transforms into a running dotted outline loop with an italic style shift on hover.',
        tags: ['text', 'outline', 'animation', 'hover', 'typography', 'svg'],
        category: 'animation',
        previewConfig: {},
        dependencies: ['framer-motion', 'react'],
        usage: `import { RunningOutline } from '@/components/ui';

// Basic usage
<RunningOutline />

// With custom word
<RunningOutline
    config={{
        words: [
            { text: "HELLO", font: "font-sans" }
        ],
        color: "#ff0000"
    }}
/>`,
        props: [
            { name: 'config', type: 'RunningOutlineConfig', default: '{}', description: 'Configuration object' },
            { name: 'containerClassName', type: 'string', default: "''", description: 'Class for the container' },
        ],
        fullCode: `
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RunningOutlineConfig {
    words?: Item[];
    color?: string;
    gap?: number;
}

interface Item {
    text: string;
    font: string;
}

interface RunningOutlineProps {
    config?: RunningOutlineConfig;
    containerClassName?: string;
}

const defaultWords: Item[] = [
    { text: "OUTLINE", font: "font-thunder" }
];

export function RunningOutline({ config = {}, containerClassName = "" }: RunningOutlineProps) {
    const items = config.words || defaultWords;
    const customColor = config.color; // Allow overriding the color via config
    const gap = config.gap || 20;

    return (
        <div
            className={\`w-full h-full flex flex-col items-center justify-center bg-transparent text-foreground \${containerClassName}\`}
            style={{
                gap,
                color: customColor // This sets 'currentColor' for children
            }}
        >
            {items.map((item, i) => (
                <OutlineItem key={i} text={item.text} font={item.font} />
            ))}
        </div>
    );
}

function OutlineItem({ text, font }: { text: string; font: string }) {
    // Split text into array of characters, preserving spaces
    const chars = Array.from(text);
    const [isHovered, setIsHovered] = useState(false);

    // Determine font size based on font family
    // Kugile stays smaller, others get much bigger
    const isKugile = font.includes('kugile');
    const textSizeClass = isKugile
        ? "text-9xl md:text-[10rem]"
        : "text-[10rem] md:text-[15rem] leading-[0.8]";

    return (
        <div
            className="flex flex-nowrap justify-center items-center select-none cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {chars.map((char, i) => (
                <LetterItem
                    key={i}
                    char={char}
                    font={font}
                    textSizeClass={textSizeClass}
                    isHovered={isHovered}
                />
            ))}
        </div>
    );
}

function LetterItem({ char, font, textSizeClass, isHovered }: { char: string; font: string; textSizeClass: string; isHovered: boolean }) {
    const id = React.useId();
    const maskId = \`mask-\${id.replace(/:/g, "")}\`;

    // Randomize animation params per letter
    const animationParams = React.useMemo(() => {
        const direction = Math.random() > 0.5 ? 1 : -1;
        // Fixed duration for synchronized movement
        const duration = 10;

        // Longer lines (60px), not thicker
        const dashArray = "60 20";

        // Distance covers the bigger size
        const distance = 250 * direction;

        return { duration, dashArray, distance };
    }, []);

    // Handle space character
    if (char === " ") {
        return <span className={\`\${textSizeClass} opacity-0\`}>&nbsp;</span>;
    }

    return (
        <div className="relative flex items-center justify-center py-10">
            {/* Invisible text for layout */}
            <span className={\`\${font} \${textSizeClass} opacity-0 pointer-events-none\`}>
                {char}
            </span>

            {/* Absolute SVG for effect */}
            <svg
                className="absolute inset-0 w-full h-full overflow-visible"
            >
                <defs>
                    <mask id={maskId}>
                        <motion.text
                            x="50%"
                            y="50%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            // Use same font classes to match layout
                            className={\`\${font} \${textSizeClass} uppercase\`}
                            initial={{
                                strokeDasharray: "0 0",
                                strokeWidth: 0,
                                fill: "white"
                            }}
                            animate={{
                                strokeWidth: isHovered ? 4 : 0, // Medium thickness lines
                                strokeDasharray: isHovered ? animationParams.dashArray : "0 0",
                                fontStyle: isHovered ? "italic" : "normal",
                                strokeDashoffset: isHovered ? [0, animationParams.distance, 0] : 0,
                                fill: isHovered ? "black" : "white"
                            }}
                            transition={{
                                strokeDashoffset: {
                                    repeat: Infinity,
                                    // Use the cubic bezier for the dramatic slow-down effect
                                    ease: [
                                        [0.215, 0.61, 0.355, 1],
                                        [0.215, 0.61, 0.355, 1]
                                    ],
                                    duration: animationParams.duration,
                                    times: [0, 0.5, 1]
                                },
                                // Instant transitions for state changes
                                fill: { duration: 0 },
                                strokeWidth: { duration: 0 },
                                strokeDasharray: { duration: 0 },
                                fontStyle: { duration: 0 }
                            }}
                            style={{
                                stroke: "white",
                                paintOrder: "stroke fill"
                            }}
                        >
                            {char}
                        </motion.text>
                    </mask>
                </defs>

                <rect
                    x="-50%"
                    y="-50%"
                    width="200%"
                    height="200%"
                    fill="currentColor"
                    mask={\`url(#\${maskId})\`}
                />
            </svg>
        </div>
    );
}
`
    },
    {
        id: 'synthwave-lines',
        name: 'Synthwave Lines',
        index: 33,
        description: 'Interactive background lines with arrival impact, wave morphing, and elastic cursor physics. Features a dramatic arrival sequence and smooth elastic interaction.',
        tags: ['background', 'lines', 'physics', 'interactive', 'canvas', 'synthwave'],
        category: 'animation',
        previewConfig: {
            lineCount: 10
        },
        dependencies: ['react'],
        usage: `import { SynthwaveLines } from '@/components/ui';

// Basic usage
<SynthwaveLines />

// Custom configuration
<SynthwaveLines
    config={{
        lineCount: 15,
        color: 'var(--foreground)'
    }}
/>`,
        props: [
            { name: 'config', type: 'Partial<SynthwaveLinesConfig>', default: '{}', description: 'Configuration object' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' }
        ],
        fullCode: `
"use client";

import React, { useRef, useEffect, useState } from 'react';

interface SynthwaveLinesProps {
    className?: string;
    config?: {
        lineCount?: number;
        color?: string;
    };
}

interface Line {
    y: number; // Percentage 0-1
    direction: -1 | 1;
    progress: number; // 0 to 1 (arrival)
    phase: 'arrival' | 'impact' | 'wave' | 'idle';

    // Wave animation params
    waveAmp: number;
    waveFreq: number;
    wavePhase: number;

    // Interaction params
    spring: {
        pos: number;
        vel: number;
        target: number;
    };
    mouseX: number; // X position of the bend
    isHovered: boolean;
}

export function SynthwaveLines({ className = "", config = {} }: SynthwaveLinesProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const linesRef = useRef<Line[]>([]);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const mouseRef = useRef({ x: -1000, y: -1000, vx: 0, vy: 0, lastX: 0, lastY: 0 });

    const [lineColor, setLineColor] = useState(config.color || '');

    useEffect(() => {
        // Function to resolve color from theme or config
        const updateColor = () => {
            if (config.color) {
                setLineColor(config.color);
                return;
            }

            // Resolve from CSS variable for adaptive theme support
            if (typeof window !== 'undefined') {
                const style = getComputedStyle(document.documentElement);
                const fg = style.getPropertyValue('--foreground').trim();
                // Add opacity if it's the default foreground to match original style
                // If it's pure black/white, we might want to soften it slightly like the original 0.8 alpha
                // But for now, let's just use the raw variable or a calculated value
                // The original was rgba(255, 255, 255, 0.8) which is ~#ededed with opacity in dark mode.
                // In light mode #171717 is dark.
                setLineColor(fg || 'rgba(255, 255, 255, 0.8)');
            }
        };

        updateColor();

        // Observe theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && (mutation.attributeName === 'data-theme' || mutation.attributeName === 'class')) {
                    updateColor();
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });

        return () => observer.disconnect();
    }, [config.color]);

    const CONF = {
        lineCount: config.lineCount || 10,
        color: lineColor,
        springStiffness: 0.1,
        springDamping: 0.85,
        hoverThreshold: 30, // px
    };

    // Initialize Lines
    useEffect(() => {
        linesRef.current = Array.from({ length: CONF.lineCount }).map((_, i) => ({
            y: (i + 0.5) / CONF.lineCount,
            direction: Math.random() > 0.5 ? 1 : -1,
            progress: 0,
            phase: 'arrival' as const,
            waveAmp: 0,
            waveFreq: 0.01 + Math.random() * 0.02,
            wavePhase: Math.random() * Math.PI * 2,
            spring: { pos: 0, vel: 0, target: 0 },
            mouseX: 0,
            isHovered: false
        }));
    }, [CONF.lineCount]);

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { clientWidth, clientHeight } = containerRef.current;
                setDimensions({ width: clientWidth, height: clientHeight });
                if (canvasRef.current) {
                    canvasRef.current.width = clientWidth;
                    canvasRef.current.height = clientHeight;
                }
            }
        };

        window.addEventListener('resize', updateDimensions);
        updateDimensions();
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        const lines = linesRef.current;

        const updateMouse = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            mouseRef.current.vx = x - mouseRef.current.lastX;
            mouseRef.current.vy = y - mouseRef.current.lastY;
            mouseRef.current.lastX = x;
            mouseRef.current.lastY = y;
            mouseRef.current.x = x;
            mouseRef.current.y = y;
        };

        const handleMouseLeave = () => {
            mouseRef.current.x = -1000;
            mouseRef.current.y = -1000;
        };

        canvas.addEventListener('mousemove', updateMouse);
        canvas.addEventListener('mouseleave', handleMouseLeave);

        const render = () => {
            const { width, height } = dimensions;
            ctx.clearRect(0, 0, width, height);

            // Update lines
            lines.forEach((line) => {
                const baseY = line.y * height;
                const speed = 0.01 + Math.random() * 0.005;

                // --- PHASE 1: ARRIVAL ---
                if (line.phase === 'arrival') {
                    line.progress += speed;
                    if (line.progress >= 1) {
                        line.progress = 1;
                        line.phase = 'impact';
                    }
                }
                // --- PHASE 2: IMPACT ---
                else if (line.phase === 'impact') {
                    // Quick recoil effect handled by spring or simply transition to wave
                    // Let's set a small initial waveAmp as impact
                    line.waveAmp = 20;
                    line.phase = 'wave';
                }
                // --- PHASE 3: WAVE MORPH ---
                else if (line.phase === 'wave') {
                    // Dampen the initial impact wave
                    line.waveAmp *= 0.95;
                    line.wavePhase += 0.1;

                    // Transition to synth wave
                    // Target is slightly wavy
                    // Then eventually go to idle (straight)
                    if (Math.abs(line.waveAmp) < 0.5) {
                        line.waveAmp = 0;
                        line.phase = 'idle';
                    }
                }
                // --- PHASE 4: IDLE / INTERACTION ---
                else if (line.phase === 'idle') {
                    // Interaction Logic
                    const dy = mouseRef.current.y - baseY;
                    const dx = mouseRef.current.x; // Current mouse X

                    // Check if mouse is interacting
                    // "When the cursor moving in that time the cursor is hovered on top of the line"
                    // We check vertical distance
                    const distCheck = Math.abs(dy);

                    if (distCheck < CONF.hoverThreshold) {
                        line.isHovered = true;
                    }

                    // If hovered, dragging, but break if too far
                    if (line.isHovered) {
                        if (distCheck > CONF.hoverThreshold * 4) {
                            line.isHovered = false; // Snap back if pulled too far
                        } else {
                            line.spring.target = dy;
                            line.mouseX = mouseRef.current.x;
                        }
                    } else {
                        line.spring.target = 0;
                    }
                }

                // Physics update
                const k = CONF.springStiffness;
                const d = CONF.springDamping;
                const ax = (line.spring.target - line.spring.pos) * k;
                line.spring.vel += ax;
                line.spring.vel *= d;
                line.spring.pos += line.spring.vel;

                // Drawing
                ctx.beginPath();
                ctx.strokeStyle = CONF.color;
                ctx.lineWidth = 2; // Thinner, crisper lines
                // Add glow
                ctx.shadowBlur = 4;
                ctx.shadowColor = CONF.color;


                if (line.phase === 'arrival') {
                    const startX = line.direction === 1 ? 0 : width;
                    const endX = line.direction === 1 ? width * line.progress : width * (1 - line.progress);
                    ctx.moveTo(startX, baseY);
                    ctx.lineTo(endX, baseY);
                } else {
                    // Resolution of line points
                    const steps = 100;
                    const stepSize = width / steps;

                    ctx.moveTo(0, baseY); // Start

                    for (let i = 0; i <= steps; i++) {
                        const x = i * stepSize;
                        let y = baseY;

                        // Apply Wave
                        if (line.phase === 'wave') {
                            y += Math.sin(x * line.waveFreq + line.wavePhase) * line.waveAmp;
                        }

                        // Apply Interaction (Gaussian pluck)
                        if (line.phase === 'idle' || line.phase === 'wave') {
                            // Gaussian curve for smooth bend
                            // Peak at line.mouseX
                            const distX = x - line.mouseX;
                            // Width of the pluck
                            const spread = 80;
                            const gaussian = Math.exp(- (distX * distX) / (2 * spread * spread));
                            y += line.spring.pos * gaussian;
                        }

                        ctx.lineTo(x, y);
                    }
                }
                ctx.stroke();
                ctx.shadowBlur = 0;
            });

            animationId = requestAnimationFrame(render);
        };

        render();

        return () => {
            canvas.removeEventListener('mousemove', updateMouse);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(animationId);
        };
    }, [dimensions, CONF.color, CONF.lineCount, CONF.springDamping, CONF.springStiffness, CONF.hoverThreshold]);

    return (
        <div ref={containerRef} className={\`relative w-full h-full overflow-hidden bg-transparent \${className}\`}>
            <canvas ref={canvasRef} className="block" />
        </div>
    );
}

export default SynthwaveLines;
`
    },
    {
        id: 'hover-image-list',
        name: 'Hover Image List',
        index: 34,
        description: 'A minimal list component where hovering over items reveals a following image. Features smooth spring-based cursor tracking and layout based on the user\'s provided screenshot.',
        tags: ['list', 'hover', 'image', 'reveal', 'cursor', 'follow', 'spring', 'framer-motion'],
        category: 'interaction',
        previewConfig: {},
        dependencies: ['framer-motion', 'react'],
        usage: `import { HoverImageList } from '@/components/ui';

// Basic usage
<HoverImageList />

// With custom items
<HoverImageList
    items={[
        {
            id: 1,
            text: "ITEM 1",
            subtext: "01",
            image: "https://example.com/image.jpg"
        }
    ]}
/>`,
        props: [
            { name: 'items', type: 'HoverImageListItem[]', default: 'defaultItems', description: 'Array of items with text and images' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' }
        ],
        fullCode: `
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
        <h2 className="relative z-30 overflow-hidden text-4xl md:text-6xl font-kugile tracking-tighter text-foreground transition-colors group-hover:text-muted-foreground leading-tight">
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
                        {char === " " ? "\\u00A0" : char}
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
                        {char === " " ? "\\u00A0" : char}
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
                        <span className="text-sm md:text-lg font-light text-muted-foreground group-hover:text-foreground transition-colors relative z-30">
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
`
    },
    {
        id: 'scroll-skew',
        name: 'Scroll Skew',
        index: 35,
        description: 'A velocity-based scrolling marquee where text direction and slant react to scroll speed. Features smooth physics-based skew deformation using Framer Motion.',
        tags: ['scroll', 'skew', 'text', 'velocity', 'marquee', 'animation', 'typography', 'skew-scroll', 'parallax'],
        category: 'animation',
        previewConfig: {},
        dependencies: ['framer-motion', 'react'],
        usage: `import { ScrollSkew } from '@/components/ui';

<ScrollSkew />`,
        props: [
            { name: 'baseVelocity', type: 'number', default: '5', description: 'Base scrolling speed' },
            { name: 'children', type: 'string', default: 'Text', description: 'Text to display' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' }
        ],
        fullCode: `
"use client";

import { useRef } from "react";
import {
    motion,
    useSpring,
    useTransform,
    useVelocity,
    useAnimationFrame,
    useMotionValue,
    MotionValue,
} from "framer-motion";

// Utility function for wrapping
const wrap = (min: number, max: number, v: number) => {
    const rangeSize = max - min;
    return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

interface ParallaxTextProps {
    children: string;
    baseVelocity?: number;
    className?: string;
    scrollY: MotionValue<number>;
    style?: React.CSSProperties;
}

function ParallaxText({ children, baseVelocity = 5, className = "", scrollY, style }: ParallaxTextProps) {
    const baseX = useMotionValue(0);
    const scrollVelocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(scrollVelocity, {
        damping: 100,
        stiffness: 300
    });

    // Skew based on velocity
    // Velocity range: -1000 to 1000
    // Skew range: 30deg to -30deg (inverse relation for natural feel)
    // Skew range: 15deg to -15deg (reduced for heavier feel)
    const skewX = useTransform(smoothVelocity, [-1000, 1000], [15, -15]);

    const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 1.5], {
        clamp: false
    });

    // Calculate x position
    // Wrap between 0 and -12.5% (assuming 8 repeating items: 100/8 = 12.5)
    // This ensures a seamless loop for any screen size
    const x = useTransform(baseX, (v) => \`\${wrap(0, -12.5, v)}%\`);

    useAnimationFrame((t, delta) => {
        // Move only based on scroll velocity
        // This ensures the component is static when not scrolling
        let moveBy = velocityFactor.get() * baseVelocity * (delta / 1000);

        baseX.set(baseX.get() + moveBy);
    });

    return (
        <div style={{ containerType: "inline-size" }} className="parallax overflow-visible w-full m-0 flex flex-nowrap whitespace-nowrap leading-[1] py-2">
            <motion.div
                className={\`font-vank text-[clamp(12.5rem,25cqi,37.5rem)] md:text-[clamp(7.5rem,15cqi,22.5rem)] tracking-[1px] flex flex-nowrap whitespace-nowrap \${className}\`}
                style={{ x, skewX, ...style }}
            >
                {/* Repeat content 8 times to ensure seamless infinite scroll */}
                {[...Array(8)].map((_, i) => (
                    <span key={i} className="block mr-32">{children}</span>
                ))}
            </motion.div>
        </div>
    );
}

export function ScrollSkew() {
    const scrollY = useMotionValue(0);

    const handleWheel = (e: React.WheelEvent) => {
        scrollY.set(scrollY.get() + e.deltaY);
    };

    return (
        <div
            onWheel={handleWheel}
            className="w-full h-full flex items-center justify-center overflow-hidden cursor-ns-resize text-foreground"
        >
            <div className="flex flex-col gap-0 w-full">
                <ParallaxText baseVelocity={3} className="uppercase font-normal" scrollY={scrollY}>
                    Velocity Based Skew
                </ParallaxText>
                <ParallaxText
                    baseVelocity={-3}
                    className="uppercase font-normal text-transparent"
                    scrollY={scrollY}
                    style={{ WebkitTextStroke: '2px var(--foreground)', color: 'transparent' }}
                >
                    Scroll To Deform
                </ParallaxText>
            </div>
        </div>
    );
}

export default ScrollSkew;
`
    },
    {
        id: 'liquid-reveal',
        name: 'Liquid Reveal',
        index: 36,
        description: 'A WebGL shader component that uses high-frequency sine waves to create a liquid distortion effect, revealing an image on hover or scroll. Features chromatic aberration and smooth physics.',
        tags: ['webgl', 'shader', 'liquid', 'distortion', 'reveal', 'react-three-fiber', '3d'],
        category: 'animation',
        previewConfig: {},
        dependencies: ['@react-three/fiber', '@react-three/drei', 'three', 'react'],
        usage: `import { LiquidReveal } from '@/components/ui';

<LiquidReveal />`,
        props: [
            { name: 'imageUrl', type: 'string', default: 'undefined', description: 'URL of the image to reveal' },
            { name: 'isHovered', type: 'boolean', default: 'false', description: 'Control hover state externally' }
        ],
        fullCode: `
"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

// ============================================
// SHADERS
// ============================================

const vertexShader = \`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
\`;

const fragmentShader = \`
uniform float uTime;
uniform float uProgress; // 0.0 (distorted) -> 1.0 (clear)
uniform sampler2D uTexture;
varying vec2 vUv;

void main() {
    vec2 uv = vUv;
    
    // Smooth transition
    float smoothProgress = smoothstep(0.0, 1.0, uProgress);
    float distortion = 1.0 - smoothProgress;
    
    // CURVED 45 DEGREE PATTERN
    // We bend the diagonal lines by adding a low-frequency sine wave
    
    float freq = 60.0;
    float amp = 0.3 * distortion; 
    
    // Calculate 45 degree projection (diagonal)
    // We warp this coordinate to create the "bend"
    // (uv.x + uv.y) is the perpendicular diagonal axis
    float bendWave = sin((uv.x + uv.y) * 2.0 + uTime * 1.0) * 0.3;
    float diagonal = (uv.x - uv.y) + bendWave;
    
    // Main wave oscillation along the bent diagonal
    float wave = sin(diagonal * freq + uTime * 4.0);
    
    // Add harmonic detail for jagged/flame look
    wave += sin(diagonal * freq * 2.1 + uTime * 7.0) * 0.4;
    
    // Displacement Vector
    // We displace along the diagonal direction vector
    vec2 dispDir = vec2(1.0, 1.0); 
    
    vec2 distortedUV = uv + dispDir * wave * amp * 0.5;
    
    // RGB Split (Chromatic Aberration along 45 degrees)
    vec2 rgbShift = dispDir * 0.05 * distortion;
    
    float r = texture2D(uTexture, distortedUV + rgbShift).r;
    float g = texture2D(uTexture, distortedUV).g;
    float b = texture2D(uTexture, distortedUV - rgbShift).b;
    
    vec3 color = vec3(r, g, b);
    
    gl_FragColor = vec4(color, 1.0);
}
\`;

// ============================================
// COMPONENT
// ============================================

interface LiquidImageProps {
    imageUrl: string;
    isHovered: boolean;
    enableAnimation?: boolean;
}

const LiquidImage = ({ imageUrl, isHovered, enableAnimation = true }: LiquidImageProps) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const { viewport } = useThree();

    // Load texture
    const texture = useTexture(imageUrl) as THREE.Texture;

    // Calculate scaling to "cover" the viewport
    const resizeValues = useMemo(() => {
        const img = texture.image as HTMLImageElement;
        if (!texture || !img) return { width: viewport.width, height: viewport.height };

        const screenAspect = viewport.width / viewport.height;
        const imageAspect = img.width / img.height;

        let scaleX = 1;
        let scaleY = 1;

        if (screenAspect > imageAspect) {
            // Screen is wider than image aspect
            scaleX = viewport.width;
            scaleY = viewport.width / imageAspect;
        } else {
            // Screen is taller than image aspect
            scaleX = viewport.height * imageAspect;
            scaleY = viewport.height;
        }

        return { width: scaleX, height: scaleY };
    }, [texture, viewport.width, viewport.height]);

    // Use LinearSRGBColorSpace to avoid "darkening" or double-gamma correction
    // when using raw shaders
    useEffect(() => {
        if (texture) {
            texture.colorSpace = THREE.LinearSRGBColorSpace;
            texture.needsUpdate = true;
        }
    }, [texture]);

    // Uniforms
    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uProgress: { value: 0 },
            uTexture: { value: texture },
        }),
        [texture]
    );

    // Ref for easy access in loop
    const hoveredRef = useRef(isHovered);
    useEffect(() => {
        hoveredRef.current = isHovered;
    }, [isHovered]);

    useFrame((state, delta) => {
        if (meshRef.current) {
            const material = meshRef.current.material as THREE.ShaderMaterial;

            // Update time
            if (enableAnimation) {
                material.uniforms.uTime.value += delta;
            }

            // Determine target progress
            const target = hoveredRef.current ? 1.0 : 0.0;

            // Smooth interpolation (Lerp)
            // Speed factor 3.0 gives a nice responsive feel
            material.uniforms.uProgress.value = THREE.MathUtils.lerp(
                material.uniforms.uProgress.value,
                target,
                delta * 3.0
            );
        }
    });

    return (
        <mesh ref={meshRef} scale={[1, 1, 1]}>
            <planeGeometry args={[resizeValues.width, resizeValues.height, 32, 32]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent={true}
            />
        </mesh>
    );
};

export const LiquidReveal = ({ config = {}, isFullScreen }: { config?: any, isFullScreen?: boolean }) => {
    const [isHovered, setIsHovered] = useState(false);
    const imageUrl = config.imageUrl || "/harri-p-L8p9qMMiCWs-unsplash.jpg";


    // Use LinearToneMapping to prevent auto-exposure darkening
    return (
        <div
            className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="absolute inset-0 z-0">
                <Canvas
                    camera={{ position: [0, 0, 5], fov: 45 }}
                    gl={{ toneMapping: THREE.NoToneMapping }}
                    dpr={[1, 2]}
                >
                    <React.Suspense fallback={null}>
                        <LiquidImage
                            key={imageUrl}
                            imageUrl={imageUrl}
                            isHovered={isHovered}
                            enableAnimation={config.enableAnimation !== false}
                        />
                    </React.Suspense>
                </Canvas>
            </div>

            <div className={\`pointer-events-none relative z-10 text-white text-center px-4 transition-all duration-700 transform \${isHovered ? 'translate-y-8 opacity-0 blur-sm' : 'translate-y-0 opacity-100 blur-0'}\`}>
                <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tighter mb-2 md:mb-4 mix-blend-difference drop-shadow-2xl">
                    {config.text || "reveal."}
                </h2>
                <p className="text-white/50 font-light tracking-widest text-[10px] sm:text-xs md:text-sm uppercase drop-shadow-md">
                    Hover to undistort
                </p>
            </div>
        </div>
    );
};

export default LiquidReveal;
`
    },
    {
        id: 'pinned-carousel',
        name: 'Pinned Carousel',
        index: 37,
        description: 'A cinematic horizontal scroll component where large serial numbers and names pin to the left edge while images scroll across. Features multi-layered parallax and smooth chained transitions.',
        tags: ['scroll', 'horizontal', 'pinning', 'parallax', 'animation', 'framer-motion', 'cinematic'],
        category: 'layout',
        previewConfig: {},
        dependencies: ['framer-motion', 'react', 'lucide-react'],
        usage: `import { PinnedCarousel } from '@/components/ui';

<PinnedCarousel />`,
        props: [
            { name: 'config', type: 'object', default: '{}', description: 'Configuration for items and behavior' }
        ],
        fullCode: `
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
        <div style={{ containerType: "inline-size" }} className="absolute inset-0 pointer-events-none">
            <motion.div
                style={{ x: nameX }}
                className="absolute bottom-0 left-0 z-10"
            >
                <h3 className={\`text-[clamp(6.0rem,12cqi,18.0rem)] font-black tracking-tighter whitespace-nowrap leading-none select-none font-victory \${isLight ? 'text-black/20' : 'text-white/20'}\`}>
                    {item.name}
                </h3>
            </motion.div>

            <div className="absolute inset-0 z-20 overflow-hidden">
                <motion.div
                    style={{ x: imgX, y: imgY, width: item.scale || "25vw" }}
                    className={\`absolute aspect-auto max-h-[70vh] overflow-hidden shadow-2xl border \${isLight ? 'border-black/10' : 'border-white/10'}\`}
                >
                    <img src={item.image} alt="" className="w-full h-full object-cover transition-all duration-500" />
                </motion.div>
            </div>

            <motion.div
                style={{ x: numberX }}
                className="absolute top-0 bottom-0 left-0 flex items-center z-30"
            >
                <h2 className={\`text-[70vh] tracking-tighter leading-none select-none font-victory translate-y-[5%] \${isLight ? 'text-black drop-shadow-[0_0_50px_rgba(0,0,0,0.3)]' : 'text-white drop-shadow-[0_0_50px_rgba(0,0,0,0.5)]'}\`}>
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
            className="h-full min-h-[500px] w-full relative overflow-hidden"
            onWheel={handleWheel}
        >

            <motion.div
                style={{ opacity: hintOpacity, x: hintX }}
                className={\`absolute right-12 bottom-12 z-50 flex items-center gap-4 \${isLight ? 'text-black/50' : 'text-white/50'}\`}
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
                className={\`absolute bottom-0 left-0 h-1 z-50 \${isLight ? 'bg-black' : 'bg-white'}\`}
                style={{ width: useTransform(smoothProgress, [0, 1], ["0%", "100%"]) }}
            />
        </div>
    );
};

export default PinnedCarousel;
`
    },

    {
        id: 'timeline-zoom',
        name: 'Timeline Zoom',
        index: 39,
        description: 'A horizontal timeline that reveals content based on cursor proximity and wave-like pressure interactions.',
        tags: ['timeline', 'zoom', 'navigation', 'reveal', 'wave', 'interaction'],
        category: 'interaction',
        previewConfig: {},
        dependencies: ['framer-motion', 'react'],
        usage: `import { TimelineZoom } from '@/components/ui';

// Basic usage
<TimelineZoom />`,
        props: [
            { name: 'items', type: 'TimelineItem[]', default: '[]', description: 'Array of timeline items' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' },
        ],
        fullCode: `
"use client";

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { motion, useSpring, useTransform, useMotionValue, useVelocity, useAnimationFrame } from 'framer-motion';
import { ProgressiveBlur } from './ProgressiveBlur';

// ============================================
// TYPES
// ============================================

interface TimelineItem {
    id: string;
    label: string;
    subLabel?: string;
    image: string; // URL to the background image
    logo?: string; // URL to the logo image
    offset: number; // Position on the timeline (0-100 or pixel based)
}

interface TimelineZoomProps {
    items?: TimelineItem[];
    className?: string;
    defaultImage?: string;
}

// ============================================
// DEFAULT DATA
// ============================================

const DEFAULT_ITEMS: TimelineItem[] = [
    {
        id: '1',
        label: 'ONE PIECE',
        subLabel: '1999',
        image: '/desktop/one-piece-season-15-3840x2160-22064.jpg',
        logo: '/anime logo/one-piece - logo.png',
        offset: 5
    },
    {
        id: '2',
        label: 'DEMON SLAYER',
        subLabel: '2019',
        image: '/desktop/demon-slayer-3840x2160-23615.jpg',
        logo: '/anime logo/demon-slayer-logo.png',
        offset: 15
    },
    {
        id: '3',
        label: 'JUJUTSU KAISEN',
        subLabel: '2020',
        image: '/desktop/jujutsu-kaisen-3840x2160-19746.jpg',
        logo: '/anime logo/Jujutsu_Kaisen_logo.png',
        offset: 25
    },
    {
        id: '4',
        label: 'CHAINSAW MAN',
        subLabel: '2022',
        image: '/desktop/chainsaw-man-the-5120x2880-23013.jpg',
        logo: '/anime logo/Chainsaw_Man_logo.png',
        offset: 35
    },
    {
        id: '5',
        label: 'SPY X FAMILY',
        subLabel: '2022',
        image: '/desktop/spy-x-family-season-5120x2880-24443.png',
        logo: '/anime logo/Spy_×_Family_logo.png',
        offset: 45
    },
    {
        id: '6',
        label: 'SOLO LEVELING',
        subLabel: '2024',
        image: '/desktop/solo-leveling-3840x2160-20374.png',
        logo: '/anime logo/Solo_Leveling_English_logo.png',
        offset: 55
    },
    {
        id: '7',
        label: 'KAIJU NO. 8',
        subLabel: '2024',
        image: '/desktop/kaiju-no-8-mission-7680x4320-21963.jpg',
        logo: '/anime logo/怪獣8号_logo.png',
        offset: 65
    },
    {
        id: '8',
        label: 'DANDADAN',
        subLabel: '2024',
        image: '/desktop/dandadan-evil-eye-5120x2880-22717.jpg',
        logo: '/anime logo/dandandan-logo.png',
        offset: 75
    },
    {
        id: '9',
        label: 'SAKAMOTO DAYS',
        subLabel: '2025',
        image: '/desktop/sakamoto-days-5120x2880-23913.jpg',
        logo: '/anime logo/sakamoto days - logo.png',
        offset: 85
    },
    {
        id: '10',
        label: 'GACHIAKUTA',
        subLabel: '2025',
        image: '/desktop/gachiakuta-3840x2160-22842.jpg',
        logo: '/anime logo/gachiakuta logo.png',
        offset: 95
    }
];

// ============================================
// TICK COMPONENT
// ============================================

interface TickProps {
    index: number;
    totalTicks: number;
    x: number; // normalized position 0-1
    activeItem: TimelineItem | null;
    mouseX: any; // MotionValue
    isMajor: boolean;
    label?: string;
    subLabel?: string;
    logo?: string;
    containerWidth: number;
    onClick?: () => void;
}

const Tick = ({ index, x, mouseX, isMajor, label, subLabel, logo, containerWidth, onClick }: TickProps) => {


    // Calculate distance from mouse to this tick
    // We use a spring to smooth out the height changes
    const heightSpring = useSpring(isMajor ? 32 : 18, { stiffness: 300, damping: 20 });
    const errorFix = 0; // variable unused

    // Wave physics parameters
    const MAX_DIST = 150; // Influence radius of the cursor
    const MAX_HEIGHT = isMajor ? 80 : 50; // Max height when hovered
    const BASE_HEIGHT = isMajor ? 32 : 18; // Resting height
    const [isHovered, setIsHovered] = useState(false);

    useAnimationFrame(() => {
        // precise X position of this tick relative to container
        const currentX = x * containerWidth;

        const mouseXValue = mouseX.get();
        const mouseVel = mouseX.getVelocity();

        const dist = currentX - mouseXValue; // Signed distance

        // Add velocity skew
        const skew = mouseVel * 0.05;

        // Effective distance calculation with skew
        const effectiveDist = Math.abs(dist - skew);

        if (effectiveDist < MAX_DIST) {
            // Gaussian-ish curve for smooth wave
            const power = 1 - (effectiveDist / MAX_DIST);

            // Add some "pressure" effect
            const velocityFactor = Math.min(Math.abs(mouseVel) / 1000, 0.5);

            const targetHeight = BASE_HEIGHT + (MAX_HEIGHT - BASE_HEIGHT) * Math.pow(power, 2) * (1 + velocityFactor);
            heightSpring.set(targetHeight);

            // We removed opacity modulation for minor ticks to ensure uniformity

            // Show logo if we are close enough (threshold)
            const shouldHover = power > 0.4;
            if (shouldHover !== isHovered) {
                setIsHovered(shouldHover);
            }

        } else {
            heightSpring.set(BASE_HEIGHT);
            if (isHovered) setIsHovered(false);
        }
    });

    return (
        <div
            // ref removed

            className={\`absolute bottom-0 flex flex-col items-center justify-end cursor-pointer group\`}
            style={{
                left: \`\${x * 100}%\`,
                width: isMajor ? '2px' : '1px',
                transform: 'translateX(-50%)',
                zIndex: isMajor ? 10 : 1
            }}
            onClick={onClick}
        >
            {isMajor && (
                <motion.div
                    className="mb-4 flex flex-col items-center justify-center select-none"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{
                        opacity: isHovered ? 1 : 0,
                        y: isHovered ? 0 : 10,
                        scale: isHovered ? 1 : 0.8
                    }}
                    transition={{ duration: 0.2 }}
                >
                    {logo ? (
                        <div className="relative w-32 h-16 flex items-end justify-center pb-2">
                            <img
                                src={logo}
                                alt={label || 'logo'}
                                className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] brightness-125"
                            />
                        </div>
                    ) : (
                        label && (
                            <div className="bg-black/80 backdrop-blur-md text-white/90 px-4 py-2 rounded-full text-sm font-bold border border-white/10 shadow-lg flex items-center gap-2 font-thunder tracking-wide">
                                <span className="uppercase">{label}</span>
                                {subLabel && <span className="text-white/50 border-l border-white/20 pl-2 font-normal">{subLabel}</span>}
                            </div>
                        )
                    )}
                </motion.div>
            )}

            <motion.div
                className={\`w-full bg-white \${isMajor ? 'rounded-t-full shadow-[0_0_10px_rgba(255,255,255,0.3)]' : ''}\`}
                style={{
                    height: heightSpring,
                    opacity: isMajor ? 1 : 0.75,
                }}
            />
        </div>
    );
};

// ============================================
// COMPONENT
// ============================================

export function TimelineZoom({
    items = DEFAULT_ITEMS,
    className = "",
    defaultImage
}: TimelineZoomProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(-1000); // Initialize off-screen
    const [containerWidth, setContainerWidth] = useState(1000);
    const [activeItem, setActiveItem] = useState<TimelineItem>(items[0]);
    const [scrollProgress, setScrollProgress] = useState(0);

    // Initial background
    const [currentImage, setCurrentImage] = useState(items[0].image);

    // Handle resize
    useEffect(() => {
        if (containerRef.current) {
            setContainerWidth(containerRef.current.getBoundingClientRect().width);
        }

        const handleResize = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.getBoundingClientRect().width);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Generate ticks
    // We want a tick every X pixels approximately
    const TICK_DENSITY = 12; // increased density slightly
    const TOTAL_TICKS = Math.max(2, Math.floor(containerWidth / TICK_DENSITY)); // ensure at least 2 ticks

    // Map items to closest tick indices
    const majorTickIndices = useMemo(() => {
        const indices = new Map<number, TimelineItem>();
        items.forEach(item => {
            // calculated index 0 to TOTAL_TICKS-1
            // item.offset is 0-100
            // index = (offset / 100) * (TOTAL_TICKS - 1)
            const index = Math.round((item.offset / 100) * (TOTAL_TICKS - 1));
            indices.set(index, item);
        });
        return indices;
    }, [TOTAL_TICKS, items]);

    // Create tick data
    const ticks = useMemo(() => {
        return Array.from({ length: TOTAL_TICKS }).map((_, i) => {
            const majorItem = majorTickIndices.get(i);

            return {
                id: i,
                x: i / (TOTAL_TICKS - 1),
                isMajor: !!majorItem,
                item: majorItem
            };
        });
    }, [TOTAL_TICKS, majorTickIndices]);

    // Handle mouse movement
    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
            mouseX.set(e.clientX - rect.left);

            // Calculate hover percent to potentially seek/preview (optional)
            // const x = e.clientX - rect.left;
            // const percent = x / rect.width;
        }
    };

    const handleMouseLeave = () => {
        mouseX.set(-1000);
    };

    // Click to jump to section
    const handleTickClick = (item: TimelineItem) => {
        setActiveItem(item);
        setCurrentImage(item.image);
    };

    // Find closest item to cursor for "settling" logic ideally
    // For now, we'll simple detect hover near major points or just let click interaction work
    // The prompt implies "scrolling" reveals. 
    // Let's implement a scroll container logic if requested, but horizontally.
    // However, the "pressure wave" implies mouse interaction as primary for the wave.

    // Update active item based on hover-scrubbing could be cool:
    // If the user hovers over a major point, maybe we "peek" that image?
    // "when the user settles at that point by scrolling then the picture is revealed"

    // Let's implement actual horizontal scrolling
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useTransform(mouseX, [0, 1], [0, 1]) as any; // placeholder

    const onScroll = () => {
        if (!scrollContainerRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        const progress = (scrollLeft / (scrollWidth - clientWidth)) * 100;
        setScrollProgress(progress);

        // Find closest item
        let closest = items[0];
        let minDiff = Infinity;

        items.forEach(item => {
            const diff = Math.abs(item.offset - progress);
            if (diff < minDiff) {
                minDiff = diff;
                closest = item;
            }
        });

        // If we are "close enough" and "settled" (velocity low), we switch
        // For simplicity, let's switch active item when within range
        if (closest.id !== activeItem.id && minDiff < 10) {
            setActiveItem(closest);
            setCurrentImage(closest.image); // Instant switch or transition?
        }
    };

    // Smooth transition of background
    // We can layer the images and fade opacity

    return (
        <div
            className={\`relative w-full h-full min-h-[600px] bg-black overflow-hidden font-sans select-none \${className}\`}
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* Background Images Layer */}
            <div className="absolute inset-0 z-0">
                {items.map((item) => (
                    <motion.div
                        key={item.id}
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: \`url(\${item.image})\` }}
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: activeItem.id === item.id ? 1 : 0,
                            scale: activeItem.id === item.id ? 1.05 : 1
                        }}
                        transition={{ duration: 1, ease: 'easeInOut' }}
                    />
                ))}
                {/* Overlay Vignette removed */}
            </div>

            {/* Content Container */}
            <div className="relative z-10 w-full h-full flex flex-col justify-end pb-0">

                {/* Unified Text Layer (SVG for perfect alignment) */}
                <div className="absolute inset-0 z-20 pointer-events-none mix-blend-normal">
                    <motion.div
                        key={activeItem.id + "-text-layer"}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full h-full"
                    >
                        <svg width="100%" height="100%">
                            <defs>
                                <mask id={\`title-mask-\${activeItem.id}\`}>
                                    <rect width="100%" height="100%" fill="black" />
                                    <text
                                        x="48"
                                        y="70"
                                        fill="white"
                                        fontSize="9rem"
                                        fontFamily="'Thunder', sans-serif"
                                        fontWeight="bold"
                                        letterSpacing="1px"
                                        className="uppercase font-thunder tracking-[1px] leading-[0.8]"
                                        dominantBaseline="hanging"
                                    >
                                        {activeItem.label}
                                    </text>
                                </mask>
                            </defs>

                            {/* 1. Top Label: CURRENT SERIES */}
                            <text
                                x="48"
                                y="40"
                                fill="white"
                                fillOpacity="0.6"
                                fontSize="1.25rem"
                                fontFamily="'Thunder', sans-serif"
                                fontWeight="bold"
                                letterSpacing="0.2em"
                                className="uppercase font-thunder"
                                dominantBaseline="auto"
                            >
                                CURRENT SERIES
                            </text>

                            {/* 2. Frosted Title Layer */}
                            <foreignObject width="100%" height="100%" mask={\`url(#title-mask-\${activeItem.id})\`}>
                                <div className="w-full h-full relative overflow-hidden">
                                    {/* Blurred Background Layer */}
                                    <div className="absolute inset-0">
                                        {items.map((item) => (
                                            <div
                                                key={item.id}
                                                className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
                                                style={{
                                                    backgroundImage: \`url(\${item.image})\`,
                                                    opacity: activeItem.id === item.id ? 1 : 0,
                                                }}
                                            >
                                                <div className="absolute inset-0 backdrop-blur-[20px] backdrop-saturate-150 backdrop-brightness-125" />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="absolute inset-0 bg-white/10" />
                                </div>
                            </foreignObject>

                            {/* 3. Bottom Label: YEAR */}
                            <text
                                x="48"
                                y="175"
                                fill="white"
                                fillOpacity="0.8"
                                fontSize="2rem"
                                fontFamily="'Thunder', sans-serif"
                                fontWeight="bold"
                                letterSpacing="0.1em"
                                className="uppercase font-thunder"
                                dominantBaseline="hanging"
                            >
                                {activeItem.subLabel}
                            </text>
                        </svg>
                    </motion.div>
                </div>

                {/* Progressive Blur at Bottom Edge - moved behind timeline */}
                <ProgressiveBlur
                    position="bottom"
                    height="150px"
                    blurLevels={[0.5, 1, 2, 3, 4, 5, 6, 8]}
                    className="z-0 pointer-events-none"
                />

                {/* Main Timeline Interactive Area */}
                {/* We use a scrollable container to allow "scrolling" behavior if desired, 
                    OR we can map mouse position to scroll. 
                    Given "scrolling" description, let's assume actual scroll interaction or drag.
                */}

                <div className="w-full px-0 relative z-20">

                    {/* The Ruler */}
                    <div className="relative h-32 w-full flex items-end">
                        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                        {/* Render Ticks */}
                        {ticks.map((tick, i) => (
                            <Tick
                                key={tick.id}
                                index={i}
                                totalTicks={TOTAL_TICKS}
                                x={tick.x} // Position 0-1
                                activeItem={activeItem}
                                mouseX={mouseX}
                                isMajor={tick.isMajor}
                                label={tick.item?.label}
                                subLabel={tick.item?.subLabel}
                                logo={tick.item?.logo}
                                containerWidth={containerWidth}
                                onClick={() => tick.item && handleTickClick(tick.item)}
                            />
                        ))}
                    </div>

                    {/* Indicator "Now" or "Cursor" text following mouse? */}
                    <motion.div
                        className="absolute bottom-40 pointer-events-none"
                        style={{ left: mouseX, x: '-50%' }}
                    >
                        {/* <div className="px-3 py-1 rounded bg-white/10 backdrop-blur text-xs text-white border border-white/20">
                            SCANNING
                        </div> */}
                    </motion.div>
                </div>


            </div>

            {/* Draggable/Scrollable hint overlay if needed */}
        </div>
    );
}
`
    },
    {
        id: 'elastic-scroll',
        name: 'Elastic Scroll',
        index: 39,
        description: 'A velocity-based scroll component where text weight and stretch react to scroll speed, creating elastic typography effects.',
        tags: ['scroll', 'velocity', 'elastic', 'typography', 'variable-font'],
        category: 'interaction',
        previewConfig: {},
        dependencies: ['framer-motion', 'react'],
        usage: `import { ElasticScroll } from '@/components/ui';

// Basic usage
<ElasticScroll />`,
        props: [
            { name: 'config', type: 'ElasticScrollConfig', default: '{}', description: 'Configuration object' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' },
        ],
        fullCode: `
"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useVelocity, useTransform, useSpring, useMotionValue, useMotionTemplate, AnimatePresence } from 'framer-motion';

// ============================================
// CONFIGURATION
// ============================================

interface ElasticScrollConfig {
    items: {
        name: string;
        id: string;
        image?: string;
    }[];
    sensitivity: number;
    damping: number;
    stiffness: number;
}

const defaultItems = [
    { name: "CHAINSAW MAN", id: "01", image: "/desktop/chainsaw-man-the-5120x2880-23013.jpg" },
    { name: "DANDADAN", id: "02", image: "/desktop/dandadan-evil-eye-5120x2880-22717.jpg" },
    { name: "DEMON SLAYER", id: "03", image: "/desktop/demon-slayer-3840x2160-23615.jpg" },
    { name: "JUJUTSU KAISEN", id: "04", image: "/desktop/jujutsu-kaisen-3840x2160-19746.jpg" },
    { name: "KAIJU NO. 8", id: "05", image: "/desktop/kaiju-no-8-mission-7680x4320-21963.jpg" },
    { name: "ONE PIECE", id: "06", image: "/desktop/one-piece-season-15-3840x2160-22064.jpg" },
    { name: "SOLO LEVELING", id: "07", image: "/desktop/solo-leveling-3840x2160-20374.png" },
    { name: "SAKAMOTO DAYS", id: "08", image: "/desktop/sakamoto-days-5120x2880-23913.jpg" },
    { name: "GACHIAKUTA", id: "09", image: "/desktop/gachiakuta-3840x2160-22842.jpg" },
    { name: "SPY X FAMILY", id: "10", image: "/desktop/spy-x-family-season-5120x2880-24443.png" },
    { name: "TO BE HERO X", id: "11", image: "/desktop/solo-leveling-3840x2160-20374.png" }, // Reusing solo leveling as placeholder if HERO X is missing
];

const defaultConfig: ElasticScrollConfig = {
    items: defaultItems,
    sensitivity: 0.15,
    damping: 15,
    stiffness: 150,
};

// ============================================
// ELASTIC ITEM COMPONENT
// ============================================

const ElasticItem = ({
    item,
    velocity,
    index,
    totalItems
}: {
    item: { name: string; id: string; image?: string };
    velocity: any;
    index: number;
    totalItems: number;
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const textRef = useRef<HTMLSpanElement>(null);
    const [formattedName, setFormattedName] = useState(item.name);

    // Physics for Scroll
    const rawWeight = useTransform(velocity, (v: number) => {
        const absV = Math.abs(v);
        return Math.max(100, 900 - (absV * 0.4));
    });

    const weight = useSpring(rawWeight, { stiffness: 400, damping: 30 });

    const rawScaleY = useTransform(velocity, (v: number) => {
        const absV = Math.abs(v);
        return 1 + (absV * 0.0002);
    });
    const scaleY = useSpring(rawScaleY, { stiffness: 200, damping: 20 });

    const rawSkewX = useTransform(velocity, [-3000, 3000], [15, -15]);
    const skewX = useSpring(rawSkewX, { stiffness: 100, damping: 20 });

    const fontSettings = useMotionTemplate\`'wdth' 100, 'wght' \${weight}, 'opsz' 72\`;

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
    };

    // calculateWrap: Enforce wrapping from full-weight state
    useEffect(() => {
        const checkWrapping = () => {
            if (!textRef.current) return;

            // Normalize to single line for testing
            const originalText = item.name.replace(/\\n/g, ' ');
            const words = originalText.split(' ');
            if (words.length <= 1) {
                setFormattedName(originalText);
                return;
            }

            const parentWidth = textRef.current.clientWidth;
            const computedStyle = window.getComputedStyle(textRef.current);
            const fontSize = computedStyle.fontSize;
            const fontFamily = computedStyle.fontFamily;
            const letterSpacing = computedStyle.letterSpacing;

            // Create a temporary element to measure
            const testEl = document.createElement('div');
            testEl.style.width = \`\${parentWidth}px\`;
            testEl.style.fontSize = fontSize;
            testEl.style.fontFamily = fontFamily;
            testEl.style.letterSpacing = letterSpacing;
            testEl.style.fontVariationSettings = "'wdth' 100, 'wght' 900, 'opsz' 72"; // Force full weight
            testEl.style.whiteSpace = 'pre-wrap';
            testEl.style.position = 'absolute';
            testEl.style.visibility = 'hidden';
            testEl.style.lineHeight = '0.8';
            testEl.style.top = '-9999px';
            testEl.style.left = '-9999px';

            document.body.appendChild(testEl);

            // Measure single line height
            testEl.textContent = "A";
            const singleLineHeight = testEl.clientHeight;

            let lines: string[] = [];
            let currentLine = words[0];

            for (let i = 1; i < words.length; i++) {
                const word = words[i];
                const testString = currentLine + " " + word;
                testEl.textContent = testString;

                // If height exceeds single line significantly, it wrapped
                if (testEl.clientHeight > singleLineHeight * 1.5) {
                    lines.push(currentLine);
                    currentLine = word;
                } else {
                    currentLine = testString;
                }
            }
            lines.push(currentLine);

            setFormattedName(lines.join('\\n'));
            document.body.removeChild(testEl);
        };

        // Run initially and on resize
        checkWrapping();
        window.addEventListener('resize', checkWrapping);
        return () => window.removeEventListener('resize', checkWrapping);
    }, [item.name]);

    return (
        <motion.div
            className="relative w-full border-b border-foreground/10 py-16 cursor-pointer overflow-visible group"
            style={{ zIndex: totalItems - index, isolation: 'isolate' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseMove={handleMouseMove}
        >
            {/* Floating Image Reveal */}
            <AnimatePresence>
                {isHovered && item.image && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.8, rotate: 5 }}
                        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                        className="absolute pointer-events-none z-20 w-[400px] h-[250px] overflow-hidden"
                        style={{
                            x: mouseX,
                            y: mouseY,
                            translateX: '-50%',
                            translateY: '-50%',
                        }}
                    >
                        <div className="w-full h-full relative">
                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover shadow-2xl"
                            />
                            {/* Simple dark overlay without blur */}
                            <div className="absolute inset-0 bg-black/5" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Text Layer */}
            <div className="relative z-10 w-full flex items-center justify-center pointer-events-none px-8">
                <motion.span
                    ref={textRef}
                    style={{
                        scaleY,
                        skewX,
                        fontVariationSettings: fontSettings,
                    }}
                    className="text-[clamp(5.0rem,10cqi,15.0rem)] leading-[0.8] text-foreground font-whyte select-none text-center origin-center block will-change-transform whitespace-pre-line"
                >
                    {formattedName}
                </motion.span>
            </div>

            {/* ID Number */}
            <div className="absolute left-8 top-1/2 -translate-y-1/2 text-sm font-mono opacity-30 mix-blend-difference pointer-events-none z-30 transition-colors duration-300">
                {item.id}
            </div>
        </motion.div>
    );
};

// ============================================
// MAIN COMPONENT
// ============================================

export function ElasticScroll({
    config: userConfig,
    className = ""
}: {
    config?: Partial<ElasticScrollConfig>,
    className?: string
}) {
    const config = { ...defaultConfig, ...userConfig };
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // Scroll position motion value — drives the translateY of the content
    const scrollY = useMotionValue(0);

    // Velocity derived from scrollY — drives the elastic text effects
    const velocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(velocity, { damping: 50, stiffness: 400 });

    // Track content height for scroll bounds
    const [maxScroll, setMaxScroll] = useState(0);

    useEffect(() => {
        const updateBounds = () => {
            if (contentRef.current && containerRef.current) {
                const contentH = contentRef.current.scrollHeight;
                const containerH = containerRef.current.clientHeight;
                setMaxScroll(Math.max(0, contentH - containerH));
            }
        };
        // Small delay to let items fully render/measure
        const timer = setTimeout(updateBounds, 100);
        window.addEventListener('resize', updateBounds);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateBounds);
        };
    }, [config.items]);

    const handleWheel = useCallback((e: React.WheelEvent) => {
        const current = scrollY.get();
        // Clamp the scroll within bounds
        const next = Math.min(Math.max(current + e.deltaY, 0), maxScroll);
        scrollY.set(next);
    }, [scrollY, maxScroll]);

    // Negate scroll for translateY directly (no spring = no overshoot at bounds)
    const translateY = useTransform(scrollY, (v) => -v);

    return (
        <div
            ref={containerRef}
            onWheel={handleWheel}
            className={\`w-full h-full bg-transparent cursor-ns-resize overflow-hidden relative \${className}\`}
        >
            {/* Inject Font Face */}
            <style jsx global>{\`
                @font-face {
                    font-family: 'ABC Whyte Inktrap';
                    src: url('/ABCWhyteInktrapVariable-Trial.ttf') format('truetype');
                    font-weight: 100 900;
                    font-style: normal;
                    font-display: swap;
                }
                .font-whyte {
                    font-family: 'ABC Whyte Inktrap', sans-serif;
                }
            \`}</style>

            <motion.div
                ref={contentRef}
                style={{ y: translateY }}
                className="w-full max-w-7xl mx-auto px-4 pb-32 will-change-transform"
            >
                {config.items.map((item, i) => (
                    <ElasticItem
                        key={item.id}
                        item={item}
                        index={i}
                        totalItems={config.items.length}
                        velocity={smoothVelocity}
                    />
                ))}
            </motion.div>

            <div className="fixed bottom-8 left-8 text-xs font-mono opacity-40 pointer-events-none mix-blend-difference text-white z-50">
                SCROLL VELOCITY DRIVEN TYPOGRAPHY
            </div>
        </div>
    );
}

// ============================================
// PREVIEW COMPONENT
// ============================================

export function ElasticScrollPreview() {
    return (
        <div style={{ containerType: "inline-size" }} className="w-full h-full bg-background flex flex-col overflow-hidden relative">
            <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,_rgba(0,0,0,0.2),transparent_70%)]" />

            <div className="flex flex-col w-full h-full overflow-hidden">
                {defaultItems.slice(0, 5).map((item, i) => (
                    <div key={i} className="flex-1 w-full border-b border-foreground/10 flex items-center justify-center relative min-h-[60px]">
                        <div className="text-3xl md:text-4xl text-foreground font-whyte font-bold tracking-tighter text-center whitespace-nowrap px-4" style={{ fontVariationSettings: "'wght' 600, 'wdth' 100" }}>
                            {item.name}
                        </div>
                        <div className="absolute left-4 text-[10px] font-mono opacity-30">
                            {item.id}
                        </div>
                    </div>
                ))}
            </div>

            <style jsx global>{\`
                @font-face {
                    font-family: 'ABC Whyte Inktrap';
                    src: url('/ABCWhyteInktrapVariable-Trial.ttf') format('truetype');
                    font-weight: 100 900;
                    font-style: normal;
                    font-display: swap;
                }
                .font-whyte {
                    font-family: 'ABC Whyte Inktrap', sans-serif;
                }
            \`}</style>
        </div>
    );
}

export default ElasticScroll;
`
    },
    {
        id: 'diagonal-arrival',
        name: 'Diagonal Arrival',
        index: 40,
        description: 'A draggable, multi-column diagonal carousel with infinite scrolling and smooth entrance animations. Features randomized scroll directions and staggered layouts for a dynamic visual effect.',
        tags: ['carousel', 'infinite', 'scroll', 'random', 'staggered', 'diagonal', 'framer-motion'],
        category: 'interaction',
        previewConfig: {},
        dependencies: ['framer-motion', 'react'],
        usage: `import DiagonalArrival from '@/components/ui/DiagonalArrival';

// Basic usage
<DiagonalArrival />`,
        props: [],
        fullCode: `
"use client";

import React, { useRef, useEffect } from "react";
import {
    motion,
    useSpring,
    useTransform,
    useMotionValue,
    MotionValue,
} from "framer-motion";

interface CardProps {
    id: number;
    image: string;
}

const cards: CardProps[] = [
    { id: 1, image: "/24/chainsaw-man-the-5120x2880-23013.jpg" },
    { id: 2, image: "/24/dandadan.jpg" },
    { id: 3, image: "/24/demon-slayer-3840x2160-23615.jpg" },
    { id: 4, image: "/24/gachiakuta-season-1-1440x2560-23000.jpg" },
    { id: 5, image: "/24/jujutsu kaisen.jpg" },
    { id: 6, image: "/24/kaiju-no-8-video-1440x2560-20422.jpg" },
    { id: 7, image: "/24/onepiece.jpg" },
    { id: 8, image: "/24/solo leveling.jpg" },
    { id: 9, image: "/24/spyxfamily.jpg" },
    { id: 10, image: "/24/taro-sakamoto-1440x2560-23904.jpg" },
    { id: 11, image: "/24/to-be-hero-x-5k-1440x2560-22857.png" },
];

const CARD_WIDTH = 260;
const CARD_HEIGHT = 364;
const GAP = 20;
const ANGLE_DEG = 15; // Moderate diagonal angle

const DiagonalArrival = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollY = useMotionValue(0);
    // Smooth spring for the scrolling action
    const smoothY = useSpring(scrollY, {
        damping: 40,
        stiffness: 200,
        mass: 1,
    });

    // Handle wheel event
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            // Scroll direction: scrolling down (positive delta) moves content up (negative Y)
            // We subtract deltaY to simulate natural scroll
            scrollY.set(scrollY.get() - e.deltaY);
        };

        container.addEventListener("wheel", handleWheel, { passive: false });
        // Clean up
        return () => container.removeEventListener("wheel", handleWheel);
    }, [scrollY]);

    // Total height of the loop
    const totalHeight = cards.length * (CARD_HEIGHT + GAP);

    // Calculate columns with random directions
    const COLUMN_GAP = 20;
    const colWidth = CARD_WIDTH + COLUMN_GAP;

    // Define specific directions: Odd and even columns move in opposite directions
    // Index -3 (0): Down (1), Index -2 (1): Up (-1), ...
    const columns = [
        { xOffset: -3 * colWidth, direction: 1, yOffset: 120 },
        { xOffset: -2 * colWidth, direction: -1, yOffset: -50 },
        { xOffset: -1 * colWidth, direction: 1, yOffset: 200 },
        { xOffset: 0, direction: -1, yOffset: 0 },
        { xOffset: 1 * colWidth, direction: 1, yOffset: 150 },
        { xOffset: 2 * colWidth, direction: -1, yOffset: -100 },
        { xOffset: 3 * colWidth, direction: 1, yOffset: 80 },
    ];

    return (
        <motion.div
            ref={containerRef}
            className="relative w-full h-full overflow-hidden bg-black flex items-center justify-center cursor-grab active:cursor-grabbing"
            onPan={(e, info) => {
                scrollY.set(scrollY.get() + info.delta.y);
            }}
        >
            <div className="absolute inset-0 bg-neutral-950" />

            {/* 3D perspective container */}
            <div
                className="relative w-full h-full flex items-center justify-center preserve-3d"
                style={{ transform: \`rotate(-\${ANGLE_DEG}deg)\` }}
            >
                {/* Render multiple columns with entrance animation */}
                {columns.map((col, colIndex) => {
                    // Shift cards for each column to avoid matching images
                    // Deterministic shift based on column index (2 steps per column)
                    const shift = (colIndex * 2) % cards.length;
                    const columnCards = [...cards.slice(shift), ...cards.slice(0, shift)];

                    // Entrance animation:
                    // If direction is 1 (moves down), arrival should be from top (-Y).
                    // If direction is -1 (moves up), arrival should be from bottom (+Y).
                    // We'll use a large offset for the entrance.
                    const initialY = col.direction === 1 ? -800 : 800;

                    return (
                        <motion.div
                            key={colIndex}
                            initial={{ y: initialY, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{
                                duration: 1.5,
                                ease: [0.16, 1, 0.3, 1], // Smooth easeOutExpo-ish curve
                                delay: colIndex * 0.1, // Stagger effect
                            }}
                            className="absolute inset-0 pointer-events-none" // Ensure wrapper doesn't capture clicks, pass through to cards if needed, though cards are absolute too.
                        >
                            {columnCards.map((card, index) => (
                                <Card
                                    key={\`\${colIndex}-\${card.id}\`}
                                    card={card}
                                    index={index}
                                    scrollY={smoothY}
                                    totalHeight={totalHeight}
                                    xOffset={col.xOffset}
                                    direction={col.direction}
                                    yOffset={col.yOffset}
                                />
                            ))}
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
};

const Card = ({
    card,
    index,
    scrollY,
    totalHeight,
    xOffset,
    direction = 1,
    yOffset = 0,
}: {
    card: CardProps;
    index: number;
    scrollY: MotionValue<number>;
    totalHeight: number;
    xOffset: number;
    direction?: number;
    yOffset?: number;
}) => {
    const y = useTransform(scrollY, (latest) => {
        // Initial position based on index, centered
        const itemPos = index * (CARD_HEIGHT + GAP);

        // Adjust by scroll with direction multiplier + random Y offset
        const offset = (latest * direction) + itemPos + yOffset;

        // Wrap logic:
        // We want the result to be in [-Total/2, Total/2] range roughly
        // Or just [0, Total] and then center it.

        // Standard modulo for infinite positive/negative
        const wrapped = ((offset % totalHeight) + totalHeight) % totalHeight;

        // Center it: [0, totalHeight] -> [-totalHeight/2, totalHeight/2]
        // This makes the transition happen when the item is totalHeight/2 away from center.
        // If totalHeight/2 is larger than screen half-height, the jump is invisible.
        return wrapped - totalHeight / 2;
    });

    return (
        <motion.div
            style={{
                y,
                x: xOffset,
                // Since the parent container is rotated, just moving Y moves it diagonally in screen space.
                // But we want the card to be upright.
                // So we rotate the card back by ANGLE_DEG.
                rotate: ANGLE_DEG,
            }}
            className="absolute left-1/2 top-1/2 -ml-[130px] -mt-[182px] w-[260px] h-[364px] overflow-hidden shadow-2xl border border-white/10 bg-neutral-900"
        >
            <img
                src={card.image}
                alt=""
                className="w-full h-full object-cover pointer-events-none select-none"
                loading="eager"
            />
        </motion.div>
    );
};

export default DiagonalArrival;
`
    },
    {
        id: 'carousel',
        name: 'Carousel',
        index: 41,
        description: 'A full-screen image carousel with smooth transitions, centered controls, and glassmorphism UI elements.',
        tags: ['carousel', 'full-screen', 'gallery', 'slider', 'interaction', 'framer-motion'],
        category: 'interaction',
        previewConfig: {},
        dependencies: ['framer-motion', 'react', 'lucide-react'],
        usage: `import Carousel from '@/components/ui/Carousel';

// Basic usage
<Carousel />`,
        props: [],
        fullCode: `
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
                        className={\`h-1 rounded-full transition-all duration-300 \${index === currentIndex ? "w-8 bg-white" : "w-2 bg-white/40"
                            }\`}
                    />
                ))}
            </div>
        </div>
    );
}

export default Carousel;
`
    },
    {
        id: 'carousel-2',
        name: 'Carousel 2',
        index: 42,
        description: 'A neon cyberpunk-style carousel with massive typography and distributed UI layout.',
        tags: ['carousel', 'cyberpunk', 'neon', 'animation', 'typography'],
        category: 'animation',
        previewConfig: {},
        dependencies: ['framer-motion', 'react', 'lucide-react'],
        usage: `import Carousel2 from '@/components/ui/Carousel2';

// Basic usage
<Carousel2 />`,
        props: [],
        fullCode: `
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
            className="relative w-full h-full min-h-[500px] overflow-hidden bg-black text-white font-sans selection:bg-[#00f0ff] selection:text-black cursor-none"
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
                key={\`card-\${currentIndex}\`}
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
                    key={\`year-\${currentIndex}\`}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-[#00f0ff] font-bold tracking-widest mb-2"
                >
                    {currentItem.year || "2025"}
                </motion.div>

                <div className="overflow-hidden">
                    <motion.h1
                        key={\`title-\${currentIndex}\`}
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
                            className={\`w-2 h-2 rounded-full border transition-all duration-300 \${idx === currentIndex
                                ? "bg-[#00f0ff] border-[#00f0ff] w-8"
                                : "bg-transparent border-[#00f0ff]/50 hover:border-[#00f0ff]"
                                }\`}
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
`
    },
    {
        id: 'carousel-3',
        name: 'Carousel 3',
        index: 43,
        description: 'A curved carousel where the center item is larger, featuring smooth scrolling and looping.',
        tags: ['carousel', 'curved', 'infinite', 'animation', 'framer-motion'],
        category: 'animation',
        previewConfig: {},
        dependencies: ['framer-motion', 'react'],
        usage: `import Carousel3 from '@/components/ui/Carousel3';

// Basic usage
<Carousel3 />`,
        props: [],
        fullCode: `
"use client";

import React, { useRef, useState, useEffect } from "react";
import {
    motion,
    useMotionValue,
    useTransform,
    MotionValue,
    animate
} from "framer-motion";

// Using the images found in public directory
const CAROUSEL_IMAGES = [
    "/carousel1.png",
    "/carousel2.jpg",
    "/carousel3.jpg",
    "/carousel4.jpg",
    "/carousel5.jpg",
    "/carousel6.jpg",
    "/carousel7.jpg",
    "/carousel8.jpg",
    "/24/chainsaw-man-the-5120x2880-23013.jpg",
    "/harri-p-L8p9qMMiCWs-unsplash.jpg",
    "/carousel1.png",
    "/carousel2.jpg",
    "/carousel3.jpg",
    "/carousel4.jpg",
    "/carousel5.jpg",
];

const ITEM_WIDTH = 150;
const SPACING = 160;

interface Carousel3Props {
    className?: string;
}

export default function Carousel3({ className = "" }: Carousel3Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(1000);

    // The global scroll position
    // We allow 'x' to grow infinitely to support momentum scrolling
    const x = useMotionValue(0);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setContainerWidth(window.innerWidth);
            const handleResize = () => setContainerWidth(window.innerWidth);
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, []);

    return (
        <div
            ref={containerRef}
            className={\`relative w-full h-[850px] flex items-center justify-center overflow-hidden \${className}\`}
        >
            {/* Background removed as per reference */}

            {/* Draggable Surface - Static hit area with Pan handler */}
            <motion.div
                className="absolute inset-0 z-[60] cursor-grab active:cursor-grabbing touch-none select-none"
                onPanStart={() => {
                    x.stop();
                }}
                onPan={(_, info) => {
                    x.set(x.get() + info.delta.x);
                }}
                onPanEnd={(_, info) => {
                    // Apply momentum/inertia
                    // Using a decay animation to simulate friction
                    // The 'power' and 'timeConstant' allow tuning the feel
                    const velocity = info.velocity.x;
                    // We project a target or just let decay run
                    if (Math.abs(velocity) > 10) {
                        // animate(x, target) with type: "decay" isn't the standard signature for generic animate.
                        // Standard way for motion value inertia is:
                        x.set(x.get()); // ensure clean state
                        // "inertia" type is specific to dragging usually, manual use "decay"
                        animate(x, x.get() + velocity * 0.2, {
                            type: "decay",
                            velocity: velocity,
                            timeConstant: 200,
                            power: 0.8
                        });
                    }
                }}
            >
                {/* Invisible touch surface */}
            </motion.div>

            {/* 
         Curved Carousel Implementation
      */}
            <div className="relative w-full h-full flex items-center justify-center perspective-1000">
                {CAROUSEL_IMAGES.map((src, i) => (
                    <CarouselItem
                        key={i}
                        index={i}
                        x={x}
                        totalItems={CAROUSEL_IMAGES.length}
                        containerWidth={containerWidth}
                        src={src}
                    />
                ))}
            </div>
        </div>
    );
}

function CarouselItem({
    index,
    x,
    totalItems,
    containerWidth,
    src
}: {
    index: number,
    x: MotionValue<number>,
    totalItems: number,
    containerWidth: number,
    src: string
}) {
    const itemTotalWidth = totalItems * SPACING;

    const position = useTransform(x, (currentX) => {
        const rawPos = (index * SPACING) + currentX;
        const wrappedPos = ((rawPos % itemTotalWidth) + itemTotalWidth) % itemTotalWidth;
        // Center the range
        const centeredPos = wrappedPos - itemTotalWidth / 2;
        return centeredPos;
    });

    // Calculate visual properties based on distance from center
    // Only 9 cards visible (approx +/- 400px from center based on 100px spacing)
    // Scale steps: 0->100%, 1->85%, 2->65%, 3->50%, 4->40%
    const scaleInput = [-640, -480, -320, -160, 0, 160, 320, 480, 640];
    const scaleOutput = [0.4, 0.5, 0.65, 0.85, 1, 0.85, 0.65, 0.5, 0.4];

    // Base max size (Center card)
    const MAX_WIDTH = ITEM_WIDTH * 2.3;
    const MAX_HEIGHT = ITEM_WIDTH * 3.2;

    const width = useTransform(position, scaleInput, scaleOutput.map(s => MAX_WIDTH * s));
    const height = useTransform(position, scaleInput, scaleOutput.map(s => MAX_HEIGHT * s));

    // Opacity: Hide items beyond the 9th card (approx 450px)
    const activeRange = SPACING * 4.5;
    const opacity = useTransform(position,
        [-activeRange, -activeRange * 0.75, 0, activeRange * 0.75, activeRange],
        [0, 1, 1, 1, 0]
    );

    const zIndex = useTransform(position, (pos) => {
        return 50 - Math.abs(Math.round(pos / 10));
    });

    // Arch Curve - Precise mapping to match scale steps
    // Previous curve approx values: 0->-10, 1->10, 2->70, 3->170, 4->310
    // Added 10px cumulative drop: 0->-10, 1->20, 2->90, 3->200, 4->350
    // Moved up by 5px: 0->-15, 1->15, 2->85, 3->195, 4->345
    const yOutput = [345, 195, 85, 15, -15, 15, 85, 195, 345];
    const y = useTransform(position, scaleInput, yOutput);

    return (
        <motion.div
            style={{
                x: position,
                y: y,
                zIndex,
                width,
                height,
                opacity,
            }}
            className="absolute overflow-hidden shadow-2xl bg-gray-900"
        >
            <img
                src={src}
                alt="Carousel Item"
                className="w-full h-full object-cover pointer-events-none"
            />
            {/* Glossy Overlay/Reflection */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/50 pointer-events-none" />
        </motion.div>
    );
}
`
    },
    {
        id: 'carousel-4',
        name: 'Carousel 4',
        index: 44,
        description: 'A waterfall carousel where items flow from the right edge and drop down into depth.',
        tags: ['carousel', 'waterfall', 'animation', 'framer-motion'],
        category: 'animation',
        previewConfig: {},
        dependencies: ['framer-motion', 'react'],
        usage: `import Carousel4 from '@/components/ui/Carousel4';

// Basic usage
<Carousel4 />`,
        props: [],
        fullCode: `
"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from "framer-motion";

interface CarouselItemData {
    id: number;
    name: string;
    image: string;
}

const items: CarouselItemData[] = [
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
];

const CARD_WIDTH = 480; // Landscape width
const CARD_HEIGHT = 270; // 16:9 Aspect Ratio
const SPACING = 550; // Increased spacing to prevent overlap (480px width + 70px gap)

export default function Carousel4() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(1200);

    // Global scroll value
    const scrollX = useMotionValue(0);
    const smoothScrollX = useSpring(scrollX, {
        damping: 40,
        stiffness: 200,
        mass: 1
    });

    const [activeIndex, setActiveIndex] = useState(0);

    // Track width
    useEffect(() => {
        if (typeof window === "undefined") return;
        const handleResize = () => {
            if (containerRef.current) {
                setWidth(containerRef.current.clientWidth);
            }
        };
        handleResize(); // Initial
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const dropPoint = width * 0.55; // Moved slightly left to give more fall space

    // Update active index
    useEffect(() => {
        const unsubscribe = smoothScrollX.on("change", (v) => {
            // v relates to offset.
            // Items move left.
            // index closest to dropPoint.
            const index = Math.round(-v / SPACING);
            const wrappedIndex = ((index % items.length) + items.length) % items.length;
            setActiveIndex(wrappedIndex);
        });
        return unsubscribe;
    }, [smoothScrollX, width]);

    const handleDrag = (_: any, info: any) => {
        scrollX.set(scrollX.get() + info.delta.x);
    };

    // Wheel Scroll Support
    const handleWheel = (e: React.WheelEvent) => {
        // Scroll down (positive) -> Move left (negative scrollX interaction)
        // Adjust multiplier for sensitivity
        scrollX.set(scrollX.get() - e.deltaY * 0.8);
    };

    return (
        <div
            ref={containerRef}
            className="w-full h-[850px] relative overflow-hidden flex items-center select-none"
            onWheel={handleWheel} // Attach wheel listener
        >
            {/* Title Display (Left) */}
            <div className="absolute left-0 top-0 w-[50%] h-full z-10 pointer-events-none flex flex-col justify-center pl-20">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                        className="flex flex-col items-start leading-none"
                    >
                        {/* ID Number */}
                        <h1 className="text-[clamp(6.0rem,12cqi,18.0rem)] font-schabo text-foreground tracking-[1px] leading-[0.8] mb-6">
                            {String(items[activeIndex].id).padStart(2, '0')}
                        </h1>

                        {/* Text Container - Name */}
                        <div className="flex flex-wrap w-full gap-x-6 gap-y-6">
                            {items[activeIndex].name.split(" ").map((word, i) => (
                                <h1
                                    key={i}
                                    className="text-[clamp(6.0rem,12cqi,18.0rem)] font-schabo text-foreground tracking-[1px] uppercase leading-[0.75]"
                                >
                                    {word}
                                </h1>
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Carousel Items */}
            {items.map((item, index) => (
                <WaterfallItem
                    key={item.id}
                    index={index}
                    item={item}
                    scrollX={smoothScrollX}
                    dropPoint={dropPoint}
                    totalItems={items.length}
                />
            ))}

            <motion.div
                className="absolute inset-0 z-50 cursor-grab active:cursor-grabbing"
                onPan={handleDrag}
            />
        </div>
    );
}

function WaterfallItem({
    index,
    item,
    scrollX,
    dropPoint,
    totalItems
}: {
    index: number;
    item: CarouselItemData;
    scrollX: any;
    dropPoint: number;
    totalItems: number;
}) {
    // Total width of the loop
    const totalWidth = totalItems * SPACING;

    // Note: older commented-out 'x' and 'y' logic removed for clarity.

    // Derived transform
    const realX = useTransform(scrollX, (value: any) => {
        // Offset by SPACING ensures Item 0 is at dropPoint when value=0
        const base = (index * SPACING) + value + SPACING;
        const modulo = (base % totalWidth + totalWidth) % totalWidth;

        // Subtract SPACING to create the 'falling' zone window
        // Range effectively: [-SPACING, TotalWidth - SPACING]
        return dropPoint + modulo - SPACING;
    });

    const x = useTransform(realX, (val) => val);

    const y = useTransform(realX, (val) => {
        if (val < dropPoint) {
            const dist = dropPoint - val;
            return Math.pow(dist, 1.5) * 0.5;
        }
        return 0;
    });

    const scale = useTransform(realX, (val) => {
        if (val < dropPoint) {
            const dist = dropPoint - val;
            return Math.max(0, 1 - (dist * 0.002));
        }
        return 1;
    });

    const rotateZ = useTransform(realX, (val) => {
        if (val < dropPoint) {
            const dist = dropPoint - val;
            return dist * -0.05; // Reduced rotation speed
        }
        return 0;
    });

    const rotateY = useTransform(realX, (val) => {
        // Twist as it falls - Smooth interpolation
        if (val < dropPoint) {
            const dist = dropPoint - val;
            // Smoothly rotate up to 45 degrees over 300px
            return Math.min(45, dist * 0.15);
        }
        return 0;
    });

    const opacity = useTransform(realX, (val) => {
        if (val < dropPoint) {
            const dist = dropPoint - val;
            return Math.max(0, 1 - (dist * 0.004));
        }
        // Fade in from right
        if (val > dropPoint + 800) {
            return Math.max(0, 1 - (val - (dropPoint + 800)) * 0.005);
        }
        return 1;
    });

    const zIndex = useTransform(realX, (val) => {
        return Math.floor(val);
    });

    return (
        <motion.div
            style={{
                x,
                y,
                scale,
                opacity,
                zIndex,
                rotateZ,
                perspective: 1000,
                originX: 0.5,
                originY: 0.5 // Changed to center for better rotation feel
            }}
            // Centered vertically (-mt-[half height])
            className="absolute top-1/2 left-0 -mt-[135px] w-[480px] h-[270px]"
        >
            <motion.div
                style={{
                    rotateY
                }}
                className="w-full h-full relative overflow-hidden shadow-2xl"
            >
                <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover pointer-events-none select-none"
                    draggable={false}
                />
                {/* Lighting overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-white/10 opacity-60" />
            </motion.div>
        </motion.div>
    );
}
`
    },
    {
        id: 'retro-404',
        name: 'Retro 404',
        index: 45,
        description: 'A retro-style 404 error component with glitching neon colors and scanline effects.',
        tags: ['404', 'retro', 'glitch', 'neon', 'error', 'page'],
        category: 'animation',
        previewConfig: {},
        dependencies: ['framer-motion', 'react'],
        usage: `import Retro404 from '@/components/ui/Retro404';

// Basic usage
<Retro404 />`,
        props: [],
        fullCode: `
"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const bootLines = [
    "> INITIALIZING SYSTEM...",
    "> CHECKING MEMORY... 64KB OK",
    "> LOADING KERNEL... OK",
    "> MOUNTING VOLUMES... OK",
    "> NETWORK CHECK... FAILED",
    "> ERROR: CONNECTION RESET",
    "> RETRYING CONNECTION... FAILED",
    "> CRITICAL SYSTEM FAILURE",
    "> ERROR CODE: 404_NOT_FOUND"
];

const Retro404 = () => {
    // State for interactive features
    const [bootState, setBootState] = useState<'booting' | 'error'>('booting');
    const [typedLines, setTypedLines] = useState<string[]>([]);
    const [glitchIntensity, setGlitchIntensity] = useState(0); // 0 to 1

    // Audio Context Ref
    const audioContextRef = useRef<AudioContext | null>(null);
    const oscillatorRef = useRef<OscillatorNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initialize Audio
    useEffect(() => {
        const initAudio = () => {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

                // Create Gain Node for volume control
                const gainNode = audioContextRef.current.createGain();
                gainNode.gain.value = 0; // Start silent
                gainNode.connect(audioContextRef.current.destination);
                gainNodeRef.current = gainNode;

                // Create Oscillator for hum
                const oscillator = audioContextRef.current.createOscillator();
                oscillator.type = 'sawtooth';
                oscillator.frequency.value = 50; // Low hum
                oscillator.connect(gainNode);
                oscillator.start();
                oscillatorRef.current = oscillator;
            }
        };

        const handleInteraction = () => {
            if (audioContextRef.current?.state === 'suspended') {
                audioContextRef.current.resume();
            }
            if (!audioContextRef.current) initAudio();
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('mousemove', handleInteraction);
        };

        window.addEventListener('click', handleInteraction);
        window.addEventListener('mousemove', handleInteraction);

        return () => {
            oscillatorRef.current?.stop();
            audioContextRef.current?.close();
        };
    }, []);

    // Boot Sequence Logic
    useEffect(() => {
        if (bootState !== 'booting') return;

        let lineIndex = 0;
        const interval = setInterval(() => {
            if (lineIndex < bootLines.length) {
                setTypedLines(prev => [...prev, bootLines[lineIndex]]);
                lineIndex++;

                // Play keystroke sound
                playKeystrokeSound();
            } else {
                clearInterval(interval);
                setTimeout(() => {
                    playBoomSound();
                    setBootState('error');
                }, 800);
            }
        }, 150); // Typing speed

        return () => clearInterval(interval);
    }, [bootState]);

    // Audio Helpers
    const playKeystrokeSound = () => {
        if (!audioContextRef.current || !gainNodeRef.current) return;

        const osc = audioContextRef.current.createOscillator();
        const gain = audioContextRef.current.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(600, audioContextRef.current.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, audioContextRef.current.currentTime + 0.05);

        gain.gain.setValueAtTime(0.025, audioContextRef.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 0.05);

        osc.connect(gain);
        gain.connect(audioContextRef.current.destination);
        osc.start();
        osc.stop(audioContextRef.current.currentTime + 0.05);
    };

    const playBoomSound = () => {
        if (!audioContextRef.current) return;

        // 1. Deep Sine Drop (Sub-bass boom)
        const osc = audioContextRef.current.createOscillator();
        const gain = audioContextRef.current.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, audioContextRef.current.currentTime);
        osc.frequency.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.5);

        gain.gain.setValueAtTime(0.5, audioContextRef.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 0.5);

        osc.connect(gain);
        gain.connect(audioContextRef.current.destination);
        osc.start();
        osc.stop(audioContextRef.current.currentTime + 0.5);

        // 2. Filtered Noise (Explosion texture)
        const bufferSize = audioContextRef.current.sampleRate * 0.5; // 500ms
        const buffer = audioContextRef.current.createBuffer(1, bufferSize, audioContextRef.current.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = audioContextRef.current.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = audioContextRef.current.createGain();

        // Low pass filter to make it "heavy"
        const filter = audioContextRef.current.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, audioContextRef.current.currentTime);
        filter.frequency.linearRampToValueAtTime(100, audioContextRef.current.currentTime + 0.4);

        noiseGain.gain.setValueAtTime(0.4, audioContextRef.current.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 0.4);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(audioContextRef.current.destination);
        noise.start();
    };

    const playStaticBurst = useCallback((intensity: number) => {
        if (!audioContextRef.current) return;

        const bufferSize = audioContextRef.current.sampleRate * 0.1; // 100ms
        const buffer = audioContextRef.current.createBuffer(1, bufferSize, audioContextRef.current.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = audioContextRef.current.createBufferSource();
        noise.buffer = buffer;
        const gain = audioContextRef.current.createGain();

        // Volume based on intensity
        gain.gain.value = intensity * 0.05;

        noise.connect(gain);
        gain.connect(audioContextRef.current.destination);
        noise.start();
    }, []);


    // Mouse Movement Handler for Glitch Intensity
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dist = Math.sqrt(Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2));
        const maxDist = Math.max(rect.width, rect.height) / 1.5;

        // Closer = Higher Intensity (Inverted distance)
        // Also factor in speed (delta) if we wanted, but proximity is cleaner
        const intensity = Math.max(0, 1 - (dist / maxDist));

        setGlitchIntensity(intensity);

        // Modulate hum volume based on intensity
        if (gainNodeRef.current) {
            gainNodeRef.current.gain.setTargetAtTime(intensity * 0.05, audioContextRef.current?.currentTime || 0, 0.1);
        }

        // Random static bursts at high intensity
        if (intensity > 0.8 && Math.random() > 0.92) {
            playStaticBurst(intensity);
        }
    };


    // Increase slice count for more detailed "shredding"
    const sliceCount = 40;
    const slices = Array.from({ length: sliceCount }).map((_, i) => i);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Common font styles
    const fontStyles = "font-black text-[150px] md:text-[220px] tracking-tighter leading-none";
    const fontFamilyStyle = { fontFamily: "Arial Black, Impact, sans-serif" };

    // Generate debris
    const debrisCount = 20;
    const debris = Array.from({ length: debrisCount }).map((_, i) => ({
        id: i,
        top: Math.random() * 100,
        height: Math.random() * 5 + 1,
        width: Math.random() * 30 + 10,
        left: Math.random() * 100,
        color: ["#ff00c1", "#00fff9", "#ffff00", "#ff0000", "#0000ff"][Math.floor(Math.random() * 5)],
        delay: Math.random() * 2,
        duration: Math.random() * 0.2 + 0.05
    }));

    if (!isMounted) return null;

    return (
        <div
            ref={containerRef}
            className="flex h-full w-full items-center justify-center bg-black overflow-hidden relative cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => {
                setGlitchIntensity(0);
                if (gainNodeRef.current) {
                    gainNodeRef.current.gain.setTargetAtTime(0, audioContextRef.current?.currentTime || 0, 0.5);
                }
            }}
        >

            {/* CRT Background - Dark purple scanlines */}
            <div className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    background: "repeating-linear-gradient(to bottom, #050005, #050005 3px, #1a051a 3px, #1a051a 6px)",
                    backgroundSize: "100% 6px"
                }}
            />
            {/* Vignette */}
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_90%)] pointer-events-none" />

            <AnimatePresence mode="wait">
                {bootState === 'booting' ? (
                    <motion.div
                        key="boot-sequence"
                        initial={{ opacity: 1, scaleY: 1 }}
                        exit={{ opacity: 0, scaleY: 0, filter: "brightness(5)" }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="relative z-10 font-mono text-green-500 text-sm md:text-lg flex flex-col items-start justify-center p-8 w-full max-w-2xl"
                    >
                        {typedLines.map((line, i) => (
                            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                {line}
                            </motion.div>
                        ))}
                        <motion.div
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="w-3 h-5 bg-green-500 mt-2"
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="error-display"
                        initial={{ opacity: 0, scaleY: 0 }}
                        animate={{ opacity: 1, scaleY: 1 }}
                        transition={{ duration: 0.2, ease: "circOut", delay: 0.2 }}
                        className="relative z-20 flex flex-col items-center justify-center w-full"
                    >
                        <div className="relative inline-block">

                            {/* SPACER: Invisible text used for layout */}
                            <h1 className={\`\${fontStyles} opacity-0 select-none\`} style={fontFamilyStyle}>
                                404
                            </h1>

                            {/* Glow Layer - Intensity based on mouse propinquity */}
                            <motion.h1
                                className={\`absolute inset-0 \${fontStyles} z-0 select-none blur-xl\`}
                                style={fontFamilyStyle}
                                animate={{
                                    color: ["#ff00c1", "#00fff9", "#ffff00", "#ff00c1"],
                                    opacity: [0.3, 0.6 + (glitchIntensity * 0.4), 0.3], // Pulsates more intensely when near
                                    filter: \`blur(\${10 + glitchIntensity * 20}px)\`
                                }}
                                transition={{
                                    duration: 0.5 - (glitchIntensity * 0.4), // Faster pulse when near
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                            >
                                404
                            </motion.h1>

                            {/* Background Glitch Layers (Deep shifts) - Reacts to intensity */}
                            <motion.h1
                                className={\`absolute inset-0 \${fontStyles} text-[#ff00c1] z-0 mix-blend-screen select-none\`}
                                style={fontFamilyStyle}
                                animate={{
                                    x: [-5, 5, -2, 8, -5].map(v => v * (1 + glitchIntensity * 5)), // Exaggerate movement 
                                    opacity: [0.8, 0.4, 0.8]
                                }}
                                transition={{ duration: 0.2 - (glitchIntensity * 0.1), repeat: Infinity, ease: "linear" }}
                            >
                                404
                            </motion.h1>
                            <motion.h1
                                className={\`absolute inset-0 \${fontStyles} text-[#00fff9] z-0 mix-blend-screen select-none\`}
                                style={fontFamilyStyle}
                                animate={{
                                    x: [5, -5, 2, -8, 5].map(v => v * (1 + glitchIntensity * 5)),
                                    opacity: [0.8, 0.4, 0.8]
                                }}
                                transition={{ duration: 0.2 - (glitchIntensity * 0.1), repeat: Infinity, ease: "linear" }}
                            >
                                404
                            </motion.h1>

                            {/* Base White Text */}
                            <h1
                                className={\`absolute inset-0 \${fontStyles} text-white z-20 select-none drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]\`}
                                style={fontFamilyStyle}
                            >
                                404
                            </h1>

                            {/* Detailed Horizontal Slices */}
                            {slices.map((i) => {
                                const top = Math.random() * 100;
                                const height = Math.random() * 3 + 1;
                                const duration = Math.random() * 0.15 + 0.05;
                                const offset = Math.random() * 20 - 10;

                                const isColored = Math.random() > 0.8;
                                const sliceColor = isColored
                                    ? ["#ff00c1", "#00fff9", "#ffff00", "#ff0000"][Math.floor(Math.random() * 4)]
                                    : "#ffffff";

                                return (
                                    <motion.h1
                                        key={\`slice-\${i}\`}
                                        className={\`absolute inset-0 \${fontStyles} z-30 select-none\`}
                                        style={{
                                            ...fontFamilyStyle,
                                            color: sliceColor,
                                            clipPath: \`inset(\${top}% 0 \${100 - (top + height)}% 0)\`
                                        }}
                                        animate={{
                                            // Intensity multiplier for offset
                                            x: [0, offset * (1 + glitchIntensity * 8), 0],
                                        }}
                                        transition={{
                                            duration: duration, // Faster jitter when intense
                                            repeat: Infinity,
                                            repeatType: "loop",
                                            ease: "linear",
                                            repeatDelay: Math.random() * 2 * (1 - glitchIntensity * 0.8) // Less delay when intense
                                        }}
                                    >
                                        404
                                    </motion.h1>
                                );
                            })}

                            {/* Foreground Debris */}
                            {debris.map((d) => (
                                <motion.div
                                    key={\`debris-fg-\${d.id}\`}
                                    className="absolute z-40 mix-blend-normal"
                                    style={{
                                        top: \`\${d.top}%\`,
                                        height: \`\${d.height}%\`,
                                        width: \`\${d.width}%\`,
                                        left: \`\${d.left}%\`,
                                        backgroundColor: d.color,
                                        transform: "translateX(-50%)"
                                    }}
                                    animate={{
                                        x: [0, Math.random() > 0.5 ? 20 : -20, 0].map(v => v * (1 + glitchIntensity * 2)),
                                        opacity: [0, 1, 0, 1, 0]
                                    }}
                                    transition={{
                                        duration: d.duration * 2,
                                        repeat: Infinity,
                                        repeatDelay: Math.random() * 3 * (1 - glitchIntensity * 0.5),
                                        ease: "linear"
                                    }}
                                />
                            ))}

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Heavy Noise Overlay - Increases with intensity */}
            <motion.div
                className="absolute inset-0 pointer-events-none z-50 mix-blend-overlay"
                animate={{ opacity: 0.08 + glitchIntensity * 0.15 }}
                style={{
                    backgroundImage: \`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")\`
                }}
            />

            {/* Scanline Rolling Bar */}
            <motion.div
                className="absolute inset-x-0 h-[10px] bg-white/10 z-50 pointer-events-none blur-sm"
                animate={{ top: ["-10%", "110%"] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
        </div>
    );
};

export default Retro404;
`
    },
    {
        id: 'mouse-interaction-1',
        name: 'Mouse Interaction 1',
        index: 46,
        description: 'A highly optimized grid interaction where a trail of boxes follows the cursor with smooth corner smoothing.',
        tags: ['interaction', 'grid', 'trail', 'box', 'canvas', 'performance'],
        category: 'interaction',
        previewConfig: {},
        dependencies: ['react'],
        usage: `import MouseInteraction1 from '@/components/ui/MouseInteraction1';\n\n<MouseInteraction1 />`,
        props: [],
        fullCode: `
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface MouseInteraction1Props {
    className?: string;
    boxSize?: number; // Size of each grid box
    trailSize?: number; // Number of boxes in the trail
    gridGap?: number; // Gap between boxes (0 for tightly packed)
    onHoverColor?: string; // High contrast color
    hideGrid?: boolean; // If true, only trail is visible
}

const MouseInteraction1: React.FC<MouseInteraction1Props> = ({
    className = '',
    boxSize = 35,
    trailSize = 5,
    gridGap = 0,
    onHoverColor = '#ffffff', // Default to white
    hideGrid = true,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const trailRef = useRef<{ x: number; y: number }[]>([]);
    const lastMouseRef = useRef<{ x: number; y: number } | null>(null);
    const animationFrameRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let columns = 0;
        let rows = 0;

        const handleResize = () => {
            const rect = container.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;

            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            canvas.style.width = \`\${rect.width}px\`;
            canvas.style.height = \`\${rect.height}px\`;

            ctx.scale(dpr, dpr);

            columns = Math.ceil(rect.width / boxSize);
            rows = Math.ceil(rect.height / boxSize);
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        const drawRoundedRect = (
            context: CanvasRenderingContext2D,
            x: number,
            y: number,
            width: number,
            height: number,
            radius: number | { tl: number; tr: number; br: number; bl: number }
        ) => {
            context.beginPath();
            if (typeof radius === 'number') {
                if ('roundRect' in context) {
                    // @ts-ignore
                    context.roundRect(x, y, width, height, radius);
                } else {
                    (context as CanvasRenderingContext2D).rect(x, y, width, height);
                }
            } else {
                // Custom radius per corner
                const { tl, tr, br, bl } = radius;
                context.moveTo(x + tl, y);
                context.lineTo(x + width - tr, y);
                context.quadraticCurveTo(x + width, y, x + width, y + tr);
                context.lineTo(x + width, y + height - br);
                context.quadraticCurveTo(x + width, y + height, x + width - br, y + height);
                context.lineTo(x + bl, y + height);
                context.quadraticCurveTo(x, y + height, x, y + height - bl);
                context.lineTo(x, y + tl);
                context.quadraticCurveTo(x, y, x + tl, y);
            }
            context.closePath();
            context.fill();
        };



        const render = () => {
            ctx.clearRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));

            // If we are not hiding grid, we might draw it here, but requirement says "grids not visible"

            ctx.fillStyle = onHoverColor;

            const trail = trailRef.current;

            // Build lookup for neighbors (perf opt)
            const trailSet = new Set(trail.map(p => \`\${p.x},\${p.y}\`));
            const hasPoint = (x: number, y: number) => trailSet.has(\`\${x},\${y}\`);

            for (let i = 0; i < trail.length; i++) {
                const point = trail[i];
                const { x, y } = point;

                const hasLeft = hasPoint(x - 1, y);
                const hasRight = hasPoint(x + 1, y);
                const hasTop = hasPoint(x, y - 1);
                const hasBottom = hasPoint(x, y + 1);

                const hasTL = hasPoint(x - 1, y - 1);
                const hasTR = hasPoint(x + 1, y - 1);
                const hasBL = hasPoint(x - 1, y + 1);
                const hasBR = hasPoint(x + 1, y + 1);

                const r = 14; // Increased smoothness

                // Outer Corners
                const radius = {
                    tl: (!hasTop && !hasLeft) ? r : 0,
                    tr: (!hasTop && !hasRight) ? r : 0,
                    br: (!hasBottom && !hasRight) ? r : 0,
                    bl: (!hasBottom && !hasLeft) ? r : 0,
                };

                const xPos = Math.round(x * boxSize + (x * gridGap));
                const yPos = Math.round(y * boxSize + (y * gridGap));

                // Increased overlap to 2px to ensure no hairlines on any display
                const overlap = 2;
                drawRoundedRect(
                    ctx,
                    xPos - overlap,
                    yPos - overlap,
                    boxSize + (overlap * 2),
                    boxSize + (overlap * 2),
                    radius
                );

                // Inner Corner Fillets
                // Use quadratic curves to fill the sharp inner corners

                // Top-Left Fillet
                if (hasLeft && hasTop && !hasTL) {
                    ctx.beginPath();
                    ctx.moveTo(xPos - r, yPos);
                    ctx.quadraticCurveTo(xPos, yPos, xPos, yPos - r);
                    ctx.lineTo(xPos, yPos);
                    ctx.closePath();
                    ctx.fill();
                }

                // Top-Right Fillet
                if (hasRight && hasTop && !hasTR) {
                    const vx = xPos + boxSize;
                    const vy = yPos;
                    ctx.beginPath();
                    ctx.moveTo(vx, vy - r);
                    ctx.quadraticCurveTo(vx, vy, vx + r, vy);
                    ctx.lineTo(vx, vy);
                    ctx.closePath();
                    ctx.fill();
                }

                // Bottom-Left Fillet
                if (hasLeft && hasBottom && !hasBL) {
                    const vx = xPos;
                    const vy = yPos + boxSize;
                    ctx.beginPath();
                    ctx.moveTo(vx - r, vy);
                    ctx.quadraticCurveTo(vx, vy, vx, vy + r);
                    ctx.lineTo(vx, vy);
                    ctx.closePath();
                    ctx.fill();
                }

                // Bottom-Right Fillet
                if (hasRight && hasBottom && !hasBR) {
                    const vx = xPos + boxSize;
                    const vy = yPos + boxSize;
                    ctx.beginPath();
                    ctx.moveTo(vx, vy + r);
                    ctx.quadraticCurveTo(vx, vy, vx + r, vy);
                    ctx.lineTo(vx, vy);
                    ctx.closePath();
                    ctx.fill();
                }
            }

            // Fade out logic not strictly requested, "last 5 boxes should be visible" implies constant visibility or instant removal after 5.
            // We are just drawing the array.
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const col = Math.floor(x / (boxSize + gridGap));
            const row = Math.floor(y / (boxSize + gridGap));

            // Use a set or check strictly to avoid duplicates if mouse stays in same box
            const currentPos = { x: col, y: row };

            const trail = trailRef.current;
            const lastPos = trail[trail.length - 1];

            // Interpolate if distance > 1
            if (lastPos) {
                const dx = col - lastPos.x;
                const dy = row - lastPos.y;
                const steps = Math.max(Math.abs(dx), Math.abs(dy));

                if (steps > 0) {
                    for (let i = 1; i <= steps; i++) {
                        const nextX = lastPos.x + Math.round((dx * i) / steps);
                        const nextY = lastPos.y + Math.round((dy * i) / steps);

                        let cur = trail[trail.length - 1];

                        // Enforce 4-connectivity: handle diagonal jumps
                        if (cur.x !== nextX && cur.y !== nextY) {
                            trail.push({ x: nextX, y: cur.y });
                            while (trail.length > trailSize) trail.shift();
                            cur = trail[trail.length - 1];
                        }

                        if (cur.x !== nextX || cur.y !== nextY) {
                            trail.push({ x: nextX, y: nextY });
                            while (trail.length > trailSize) trail.shift();
                        }
                    }
                    lastMouseRef.current = { x: col, y: row };
                    requestAnimationFrame(render);
                }
            } else {
                trail.push(currentPos);
                while (trail.length > trailSize) trail.shift();
                lastMouseRef.current = currentPos;
                requestAnimationFrame(render);
            }
        };

        const handleMouseLeave = () => {
            // Optionally clear trail on leave?
            // trailRef.current = [];
            // requestAnimationFrame(render);
        };

        window.addEventListener('mousemove', handleMouseMove);
        // We attach to window to catch global movement if desired, or container?
        // "when the mouse is hovered" -> Usually implies over the component.
        // I will attach to container.
        // Actually, changing to container for specific interaction.
        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            window.removeEventListener('resize', handleResize);
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseleave', handleMouseLeave);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [boxSize, trailSize, gridGap, onHoverColor]);

    return (
        <div
            ref={containerRef}
            className={\`w-full h-full relative overflow-hidden bg-black \${className}\`}
        >
            <canvas ref={canvasRef} className="block absolute top-0 left-0 hover:cursor-none" />
        </div>
    );
};

export default MouseInteraction1;
`
    },
    {
        id: 'perspective-carousel',
        name: 'Perspective Carousel',
        index: 47,
        description: 'A horizontally scrolling 3D perspective carousel with parallax depth, blur, and smooth inertia.',
        tags: ['carousel', '3d', 'perspective', 'animation', 'gallery', 'framer-motion'],
        category: 'animation',
        previewConfig: {},
        dependencies: ['framer-motion', 'react', 'lucide-react'],
        usage: `import PerspectiveCarousel from '@/components/ui/PerspectiveCarousel';\n\n<PerspectiveCarousel />`,
        props: [],
        fullCode: `
import React, { useRef, useCallback, useEffect, memo } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

interface PerspectiveCarouselConfig {
    xSpacing?: number;
    ySpacing?: number;
    zDepth?: number;
    rotateY?: number;
    rotateX?: number;
    scale?: number;
    perspective?: number;
    carouselRotation?: number;
}

interface PerspectiveCarouselProps {
    config?: PerspectiveCarouselConfig;
    interactive?: boolean;
}
const CARDS = [
    { id: 1, title: 'CAROUSEL 1', category: 'CONCEPT', img: '/carousel1.png' },
    { id: 2, title: 'CAROUSEL 2', category: 'LIFESTYLE', img: '/carousel2.jpg' },
    { id: 3, title: 'CAROUSEL 3', category: 'DESIGN', img: '/carousel3.jpg' },
    { id: 4, title: 'CAROUSEL 4', category: 'PHOTOGRAPHY', img: '/carousel4.jpg' },
    { id: 5, title: 'CAROUSEL 5', category: 'ARCHIVE', img: '/carousel5.jpg' },
    { id: 6, title: 'CAROUSEL 6', category: 'STUDIO', img: '/carousel6.jpg' },
    { id: 7, title: 'CAROUSEL 7', category: 'FASHION', img: '/carousel7.jpg' },
    { id: 8, title: 'CAROUSEL 8', category: 'EDITORIAL', img: '/carousel8.jpg' },
];

const TOTAL_CARDS = CARDS.length;

// Reduced from 23 to 11 visible slots — only cards that can actually be seen
const VISIBLE_SLOTS = 11;
const HALF_SLOTS = Math.floor(VISIBLE_SLOTS / 2);

// Individual card rendered via rAF-driven style updates (bypasses React rendering entirely)
const CarouselCard = memo(({ slot, smoothScrollPos, xSpacing, ySpacing, zDepth, cfgRotateY, cfgRotateX, cfgScale }: {
    slot: number;
    smoothScrollPos: any;
    xSpacing: number;
    ySpacing: number;
    zDepth: number;
    cfgRotateY: number;
    cfgRotateX: number;
    cfgScale: number;
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const categoryRef = useRef<HTMLSpanElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const lastCardIndexRef = useRef(-1);

    // Shared function to apply transform + update card content for a given scroll position
    const applyTransform = useCallback((latestScroll: number) => {
        const el = cardRef.current;
        if (!el) return;

        const centerIndex = Math.round(latestScroll);
        const fractional = latestScroll - centerIndex;
        const offset = slot - fractional;
        const absOffset = Math.abs(offset);

        // Transform
        const translateX = offset * xSpacing;
        const translateY = offset * ySpacing;
        const translateZ = offset * zDepth;
        const rotateX = absOffset * (cfgRotateX / 10);
        const scale = cfgScale / 100;

        el.style.transform = \`translateX(\${translateX}px) translateY(\${translateY}px) translateZ(\${translateZ}px) rotateY(\${cfgRotateY}deg) rotateX(\${rotateX}deg) scale(\${scale})\`;
        el.style.zIndex = String(20 - Math.round(absOffset));

        // Update card content only when the card index actually changes
        const newIndex = ((centerIndex + slot) % TOTAL_CARDS + TOTAL_CARDS) % TOTAL_CARDS;
        if (newIndex !== lastCardIndexRef.current) {
            lastCardIndexRef.current = newIndex;
            const card = CARDS[newIndex];
            if (card && imgRef.current) {
                imgRef.current.src = card.img;
                imgRef.current.alt = card.title;
            }
            if (card && categoryRef.current) {
                categoryRef.current.textContent = card.category;
            }
            if (card && titleRef.current) {
                titleRef.current.textContent = card.title;
            }
        }
    }, [slot, xSpacing, ySpacing, zDepth, cfgRotateY, cfgRotateX, cfgScale]);

    // Apply initial transform on mount so cards are positioned before any scroll
    useEffect(() => {
        applyTransform(smoothScrollPos.get());
    }, [applyTransform, smoothScrollPos]);

    // Drive ongoing updates from motion value subscription — zero React re-renders
    useEffect(() => {
        const unsubscribe = smoothScrollPos.on("change", applyTransform);
        return () => unsubscribe();
    }, [smoothScrollPos, applyTransform]);

    // Compute initial card index
    const initialIndex = ((slot) % TOTAL_CARDS + TOTAL_CARDS) % TOTAL_CARDS;
    const initialCard = CARDS[initialIndex] || CARDS[0];

    return (
        <div
            ref={cardRef}
            className="absolute w-[360px] h-[500px] bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.2)] group overflow-hidden pointer-events-auto border border-black/5"
            style={{
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'visible',
                willChange: 'transform',
                contain: 'layout style paint',
            }}
        >
            <div className="relative w-full h-full bg-gray-200">
                <img
                    ref={imgRef}
                    src={initialCard.img}
                    alt={initialCard.title}
                    className="w-full h-full object-cover"
                    style={{ opacity: 0.96 }}
                    loading="lazy"
                    decoding="async"
                />

                {/* Branding Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-10 text-white">
                    <span ref={categoryRef} className="text-[9px] tracking-[0.5em] uppercase mb-2 font-semibold text-white/80">{initialCard.category}</span>
                    <h2 ref={titleRef} className="text-2xl font-light tracking-tighter leading-none">{initialCard.title}</h2>
                    <div className="mt-6 w-0 h-[1px] bg-white/30 group-hover:w-full transition-all duration-1000 ease-in-out"></div>
                </div>
            </div>
        </div>
    );
});
CarouselCard.displayName = 'CarouselCard';

const PerspectiveCarousel = ({ config = {}, interactive = true }: PerspectiveCarouselProps) => {
    const xSpacing = config.xSpacing ?? 100;
    const ySpacing = config.ySpacing ?? 2;
    const zDepth = config.zDepth ?? -25;
    const cfgRotateY = config.rotateY ?? 130;
    const cfgRotateX = config.rotateX ?? 0;
    const cfgScale = config.scale ?? 75;
    const cfgPerspective = config.perspective ?? 4000;
    const carouselRotation = config.carouselRotation ?? 0;

    const containerRef = useRef<HTMLDivElement>(null);

    // High-performance motion values
    const scrollPos = useMotionValue(0);
    const smoothScrollPos = useSpring(scrollPos, { damping: 30, stiffness: 200, mass: 1 });

    // Scoped wheel handler — only active when carousel is in view
    useEffect(() => {
        if (!interactive) return;

        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            // Prevent the page from scrolling when interacting with the carousel
            e.preventDefault();
            e.stopPropagation();

            const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
            scrollPos.set(scrollPos.get() + delta * 0.005);
        };

        // Use non-passive to allow preventDefault
        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, [scrollPos, interactive]);

    const handleDrag = useCallback((e: any, info: any) => {
        if (!interactive) return;
        scrollPos.set(scrollPos.get() - info.delta.x * 0.015);
    }, [scrollPos, interactive]);

    // Fixed viewing angle
    const containerTransform = \`rotateX(-28deg) rotateY(-144.8deg) rotateZ(\${carouselRotation}deg)\`;

    // Pre-compute slot array once
    const slots = React.useMemo(() =>
        Array.from({ length: VISIBLE_SLOTS }, (_, i) => i - HALF_SLOTS),
    []);

    return (
        <motion.div
            ref={containerRef}
            className={\`relative w-full h-full min-h-[600px] bg-transparent text-gray-900 font-sans overflow-hidden select-none flex flex-col \${interactive ? 'cursor-grab active:cursor-grabbing' : ''}\`}
            style={{ clipPath: 'inset(0)', contain: 'layout style paint' }}
            drag={interactive ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDrag={handleDrag}
            whileDrag={interactive ? { cursor: 'grabbing' } : undefined}
        >
            {/* --- CAROUSEL --- */}
            <main className="flex-1 relative flex items-center justify-center overflow-hidden" style={{ perspective: \`\${cfgPerspective}px\` }}>
                <div
                    className="relative w-full h-full flex items-center justify-center pointer-events-none"
                    style={{
                        transformStyle: 'preserve-3d',
                        transform: containerTransform,
                    }}
                >
                    {slots.map((slot) => (
                        <CarouselCard
                            key={\`slot-\${slot}\`}
                            slot={slot}
                            smoothScrollPos={smoothScrollPos}
                            xSpacing={xSpacing}
                            ySpacing={ySpacing}
                            zDepth={zDepth}
                            cfgRotateY={cfgRotateY}
                            cfgRotateX={cfgRotateX}
                            cfgScale={cfgScale}
                        />
                    ))}
                </div>
            </main>

        </motion.div>
    );
};

export default PerspectiveCarousel;
`
    },
    {
        id: 'full-screen-menu',
        name: 'Full Screen Menu',
        index: 48,
        description: 'A full screen menu matching the reference image.',
        tags: ['menu', 'full-screen', 'layout', 'navigation'],
        category: 'layout',
        previewConfig: {},
        dependencies: ['framer-motion', 'react'],
        usage: `import FullScreenMenu from '@/components/ui/FullScreenMenu';\n\n<FullScreenMenu />`,
        props: [],
        fullCode: `
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FullScreenMenu() {
    const [isOpen, setIsOpen] = useState(false);

    const menuVariants: any = {
        initial: { y: "-100%" },
        animate: {
            y: 0,
            transition: {
                duration: 0.8,
                ease: [0.76, 0, 0.24, 1],
                staggerChildren: 0.1,
                delayChildren: 0.3
            }
        },
        exit: {
            y: "-100%",
            transition: {
                duration: 0.8,
                ease: [0.76, 0, 0.24, 1]
            }
        }
    };

    const itemVariants: any = {
        initial: { y: 50, opacity: 0 },
        animate: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
        exit: { opacity: 0, transition: { duration: 0.2 } }
    };

    return (
        <div style={{ containerType: "inline-size" }} className="relative w-full h-full min-h-[600px] bg-transparent text-[#1a1a1a] overflow-hidden flex flex-col font-sans">
            {/* Minimal Menu Button when closed */}
            <div className={\`absolute inset-0 flex justify-center items-center z-0 transition-opacity duration-300 \${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}\`}>
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 group hover:opacity-70 transition-opacity"
                >
                    <span className="text-sm md:text-base font-bold tracking-widest uppercase relative before:absolute before:-bottom-1 before:left-0 before:w-full before:h-[1px] before:bg-[#1a1a1a] before:scale-x-0 group-hover:before:scale-x-100 before:transition-transform before:duration-300 before:origin-right group-hover:before:origin-left">
                        MENU
                    </span>
                </button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        variants={menuVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="absolute inset-0 bg-[#acaa9c] text-[#1a1a1a] flex flex-col z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <motion.div variants={itemVariants} className="flex justify-end items-start w-full px-8 py-6 z-10 absolute top-0 left-0 right-0">
                            <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none">
                                <h1 className="font-sans font-black italic text-5xl md:text-6xl tracking-tighter flex items-start mt-[-0.5rem]">
                                    morphys
                                    <span className="text-xl not-italic font-sans -mt-1 ml-0.5">®</span>
                                </h1>
                            </div>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-2 group hover:opacity-70 transition-opacity mt-1"
                            >
                                <span className="text-sm md:text-base font-bold tracking-widest uppercase relative before:absolute before:-bottom-1 before:left-0 before:w-full before:h-[1px] before:bg-[#1a1a1a] before:scale-x-0 group-hover:before:scale-x-100 before:transition-transform before:duration-300 before:origin-right group-hover:before:origin-left">
                                    CLOSE
                                </span>
                                <svg className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </motion.div>

                        {/* Main Menu Links Grid */}
                        <div className="flex-1 w-full flex flex-col justify-center px-4 md:px-12 xl:px-24 mt-20 mb-12">
                            <motion.div variants={itemVariants} className="w-full h-px border-t border-dashed border-[#1a1a1a]/40" />

                            <motion.div variants={itemVariants}>
                                <MenuItem text="HOME" align="left" marginTopClass="pt-[31px]" />
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <MenuItem text="WORK" align="left" offsetClass="ml-[15%] md:ml-[18%]" />
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <MenuItem text="DIRECTORS" align="center" />
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <MenuItem text="ABOUT" align="right" offsetClass="mr-[15%] md:mr-[20%]" />
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <MenuItem text="NEWS" align="left" />
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <MenuItem text="CONTACT" align="center" />
                            </motion.div>
                        </div>

                        {/* Footer */}
                        <motion.div variants={itemVariants} className="flex justify-between items-end w-full px-8 pb-6 z-10 absolute bottom-0 left-0 right-0">
                            <div className="flex flex-col text-[10px] md:text-xs font-bold uppercase tracking-widest gap-1">
                                <span className="italic font-serif font-normal text-black/80 capitalize">(Privacy)</span>
                                <span className="uppercase">PRIVACY POLICY</span>
                            </div>

                            <div className="absolute left-1/2 -translate-x-1/2 bottom-6 text-[11px] md:text-xs font-serif italic text-[#1a1a1a] tracking-wide">
                                2026© Morphys
                            </div>

                            <div className="flex flex-col items-end text-[10px] md:text-xs font-bold tracking-widest gap-1 pr-6 pb-6 md:pb-0">
                                <span className="italic font-serif font-normal text-black/80 capitalize">(Legal)</span>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function MenuItem({
    text,
    align,
    offsetClass = "",
    marginTopClass = "pt-[30px]"
}: {
    text: string;
    align: "left" | "center" | "right";
    offsetClass?: string;
    marginTopClass?: string;
}) {
    let containerClass = "justify-start";
    if (align === "center") containerClass = "justify-center";
    if (align === "right") containerClass = "justify-end";

    return (
        <div className={\`w-full flex flex-col group relative overflow-hidden cursor-pointer \${marginTopClass}\`}>

            {/* Hover Background - Animates up from bottom */}
            <div className="absolute inset-0 w-full h-full bg-[#1a1a1a] origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] z-0" />

            <div className={\`w-full flex \${containerClass} px-2 relative z-10\`}>
                <div className={\`relative flex items-end \${offsetClass}\`}>
                    <span className="font-kugile text-[clamp(35px,9cqi,85px)] leading-[0.7] tracking-tight text-[#1a1a1a] group-hover:text-[#acaa9c] transition-colors duration-500 origin-bottom">
                        {text}
                    </span>
                </div>
            </div>
            {/* Dashed line under each item */}
            <div className="w-full h-px border-t border-dashed border-[#1a1a1a]/40 group-hover:border-[#1a1a1a]/0 transition-colors duration-500 -mt-[10px] relative z-10" />
        </div>
    );
}
`
    },
    {
        id: 'kinetic-grid',
        name: 'Kinetic Grid',
        index: 49,
        description: 'A grid of plus symbols that react directly to mouse movement, rotating smoothly based on cursor direction.',
        tags: ['background', 'grid', 'physics', 'interactive', 'canvas', 'performance'],
        category: 'interaction',
        previewConfig: {},
        dependencies: ['react'],
        usage: `import { KineticGrid } from '@/components/ui';\n\n<KineticGrid />`,
        props: [
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' },
            { name: 'gridSize', type: 'number', default: '40', description: 'Spacing between plus symbols' },
            { name: 'influenceRadius', type: 'number', default: '400', description: 'Radius of cursor effect' },
        ],
        fullCode: `
"use client";

import React, { useEffect, useRef } from "react";

export interface KineticGridProps {
  className?: string;
  gridSize?: number; // Distance between pluses
  plusSize?: number; // Size of the plus icon
  color?: string; // Color of the plus
  influenceRadius?: number; // How far the mouse affects
  forceMultiplier?: number; // How strong the wind is
  damping?: number; // How quickly it slows down (0 to 1)
}

interface PointState {
  x: number;
  y: number;
  angle: number;
  angularVelocity: number;
  scale: number;
  scaleVelocity: number;
  type: 'plus' | 'cross' | 'dot' | 'circle' | 'square' | 'triangle' | 'dash';
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  force: number;
  life: number;
}

export const KineticGrid = ({
  className = "",
  gridSize = 40,
  plusSize = 10,
  color = "currentColor",
  influenceRadius = 400,
  forceMultiplier = 0.0005,
  damping = 0.9,
}: KineticGridProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse tracking
  const mouse = useRef({ x: -1000, y: -1000, vx: 0, vy: 0 });
  const smoothedMouse = useRef({ x: -1000, y: -1000 });
  const lastMouse = useRef({ x: -1000, y: -1000 });
  const mouseTimeout = useRef<NodeJS.Timeout | null>(null);

  // Grid and Effects state
  const gridState = useRef<PointState[]>([]);
  const ripples = useRef<Ripple[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;

    const getActualColor = () => {
      if (color === "currentColor") {
        const computed = window.getComputedStyle(container);
        return computed.color || "#000000";
      }
      return color;
    };

    let actualColor = getActualColor();

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;

      const dpr = window.devicePixelRatio || 1;
      // Increase canvas size slightly to allow for parallax panning without clipping edges
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      
      canvas.style.width = \`\${width}px\`;
      canvas.style.height = \`\${height}px\`;

      ctx.scale(dpr, dpr);
      
      actualColor = getActualColor();

      cols = Math.ceil(width / gridSize) + 2;
      rows = Math.ceil(height / gridSize) + 2;

      const offsetX = (width - cols * gridSize) / 2 + gridSize / 2;
      const offsetY = (height - rows * gridSize) / 2 + gridSize / 2;

      const newGrid: PointState[] = [];
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const px = offsetX + x * gridSize;
          const py = offsetY + y * gridSize;
          
          let type: PointState['type'] = 'plus';
          const rand = Math.random();
          if (rand < 0.15) type = 'dot';
          else if (rand < 0.3) type = 'circle';
          else if (rand < 0.45) type = 'square';
          else if (rand < 0.6) type = 'triangle';
          else if (rand < 0.75) type = 'dash';
          else if (rand < 0.85) type = 'cross';
          else type = 'plus';

          newGrid.push({
            x: px,
            y: py,
            angle: 0,
            angularVelocity: 0,
            scale: 1,
            scaleVelocity: 0,
            type,
          });
        }
      }
      gridState.current = newGrid;
    };

    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      if (lastMouse.current.x !== -1000) {
        mouse.current.vx = currentX - lastMouse.current.x;
        mouse.current.vy = currentY - lastMouse.current.y;
      }
      
      mouse.current.x = currentX;
      mouse.current.y = currentY;

      if (smoothedMouse.current.x === -1000) {
        smoothedMouse.current.x = currentX;
        smoothedMouse.current.y = currentY;
      }

      lastMouse.current.x = currentX;
      lastMouse.current.y = currentY;

      if (mouseTimeout.current) clearTimeout(mouseTimeout.current);
      mouseTimeout.current = setTimeout(() => {
        mouse.current.vx = 0;
        mouse.current.vy = 0;
      }, 50);
    };

    const onClick = (e: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        ripples.current.push({
            x: currentX,
            y: currentY,
            radius: 0,
            force: 0.2, // Ripple strength
            life: 1
        });
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("click", onClick);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse for soft tracking
      if (mouse.current.x !== -1000) {
         smoothedMouse.current.x += (mouse.current.x - smoothedMouse.current.x) * 0.1;
         smoothedMouse.current.y += (mouse.current.y - smoothedMouse.current.y) * 0.1;
      }

      // Parallax effect on the canvas wrapper
      if (mouse.current.x !== -1000) {
          const parallaxX = (smoothedMouse.current.x / width - 0.5) * 20;
          const parallaxY = (smoothedMouse.current.y / height - 0.5) * 20;
          canvas.style.transform = \`translate(\${-parallaxX}px, \${-parallaxY}px) scale(1.05)\`;
      } else {
          canvas.style.transform = \`translate(0px, 0px) scale(1.05)\`;
      }

      // Update ripples
      for (let i = ripples.current.length - 1; i >= 0; i--) {
          const r = ripples.current[i];
          r.radius += 12; // Expansion speed
          r.life -= 0.015; // Fade speed
          if (r.life <= 0) {
              ripples.current.splice(i, 1);
          }
      }

      ctx.strokeStyle = actualColor;
      ctx.fillStyle = actualColor;
      ctx.lineWidth = 1.5;
      ctx.lineCap = "round";

      gridState.current.forEach((p) => {
        // Spotlight calculations
        const distToSmoothed = Math.sqrt((p.x - smoothedMouse.current.x)**2 + (p.y - smoothedMouse.current.y)**2);
        
        // Base opacity is 0.15, peaks at 1.0 near mouse
        const spotlightFade = mouse.current.x === -1000 ? 0 : Math.max(0, 1 - distToSmoothed / (influenceRadius * 1.5));
        ctx.globalAlpha = 0.15 + (spotlightFade * 0.85);

        // Apply mouse wind force
        const distToMouse = Math.sqrt((p.x - mouse.current.x)**2 + (p.y - mouse.current.y)**2);
        if (distToMouse < influenceRadius && (mouse.current.vx !== 0 || mouse.current.vy !== 0)) {
           const falloff = 1 - (distToMouse / influenceRadius);
           
           const spinTypes = ['plus', 'cross', 'square', 'triangle', 'dash'];
           const typeMultiplier = spinTypes.includes(p.type) ? (p.type === 'cross' ? 1.5 : 1) : 0;
           const torque = (mouse.current.vx + mouse.current.vy) * forceMultiplier * falloff * typeMultiplier;
           p.angularVelocity += torque;
           
           // Slight squeeze effect as mouse passes over
           const speed = Math.sqrt(mouse.current.vx**2 + mouse.current.vy**2);
           p.scaleVelocity -= falloff * 0.005 * Math.min(speed, 20); 
        }

        // Apply Ripple Forces
        ripples.current.forEach(r => {
            const distToRipple = Math.sqrt((p.x - r.x)**2 + (p.y - r.y)**2);
            const ringDist = Math.abs(distToRipple - r.radius);
            if (ringDist < 60 && r.life > 0) {
                const push = (1 - ringDist / 60) * r.force * r.life;
                if (p.type !== 'dot' && p.type !== 'circle') {
                   p.angularVelocity += push * (p.x > r.x ? 1 : -1) * 2; // Spin burst
                }
                p.scaleVelocity += push * 0.5; // Scale burst
            }
        });

        // Spring physics for scale
        p.scaleVelocity += (1 - p.scale) * 0.1; // Spring to target scale 1
        p.scaleVelocity *= 0.8; // Damping
        p.scale += p.scaleVelocity;

        // Spin physics
        p.angularVelocity *= damping;
        p.angle += p.angularVelocity;

        const currentSize = plusSize * Math.max(0.1, p.scale);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);

        ctx.beginPath();
        if (p.type === 'dot') {
            const dotSize = currentSize * 0.25;
            ctx.arc(0, 0, dotSize, 0, Math.PI * 2);
            ctx.fill();
        } else if (p.type === 'circle') {
            const circleSize = currentSize * 0.4;
            ctx.arc(0, 0, circleSize, 0, Math.PI * 2);
            ctx.stroke();
        } else if (p.type === 'square') {
            const sqSize = currentSize * 0.6;
            ctx.rect(-sqSize / 2, -sqSize / 2, sqSize, sqSize);
            ctx.stroke();
        } else if (p.type === 'triangle') {
            const triSize = currentSize * 0.5;
            ctx.moveTo(0, -triSize);
            ctx.lineTo(triSize * 0.866, triSize * 0.5);
            ctx.lineTo(-triSize * 0.866, triSize * 0.5);
            ctx.closePath();
            ctx.stroke();
        } else if (p.type === 'dash') {
            ctx.moveTo(-currentSize / 2, 0);
            ctx.lineTo(currentSize / 2, 0);
            ctx.stroke();
        } else {
            if (p.type === 'cross') {
               ctx.rotate(Math.PI / 4);
            }
            ctx.moveTo(-currentSize / 2, 0);
            ctx.lineTo(currentSize / 2, 0);
            ctx.moveTo(0, -currentSize / 2);
            ctx.lineTo(0, currentSize / 2);
            ctx.stroke();
        }
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("click", onClick);
      if (mouseTimeout.current) clearTimeout(mouseTimeout.current);
      cancelAnimationFrame(animationFrameId);
    };
  }, [gridSize, plusSize, color, influenceRadius, forceMultiplier, damping]);

  return (
    <div 
      ref={containerRef} 
      className={\`relative w-full h-full overflow-hidden \${className}\`} 
      style={{ minHeight: "100%", minWidth: "100%" }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-auto transition-transform duration-300 ease-out" />
    </div>
  );
};

export default KineticGrid;
`
    },
    {
        id: 'chromatic-text',
        name: 'Chromatic Text',
        index: 50,
        description: 'A vibrant, glowing text effect with chromatic aberration and neon blur offsets.',
        tags: ['text', 'chromatic', 'aberration', 'neon', 'glow', 'effect'],
        category: 'effect',
        previewConfig: {},
        dependencies: ['framer-motion', 'react'],
        usage: `import { ChromaticText } from '@/components/ui';\n\n<ChromaticText />`,
        props: [
            { name: 'config', type: 'Partial<ChromaticTextConfig>', default: '{}', description: 'Configuration for colors, blurs and intensity' },
            { name: 'text', type: 'string', default: 'undefined', description: 'The text to display (overrides config.text)' },
            { name: 'className', type: 'string', default: 'undefined', description: 'Additional CSS classes' }
        ],
        fullCode: `
"use client";

import React from "react";
import { cn } from "@/lib/utils";

// ============================================
// TYPES
// ============================================

export interface ChromaticTextConfig {
    text: string;
    /** Chromatic offset in pixels */
    offset: number;
    /** Outer glow blur radius */
    glowRadius: number;
    /** Enable bottom fade to dark */
    bottomFade: boolean;
}

export interface ChromaticTextProps {
    config?: Partial<ChromaticTextConfig>;
    className?: string;
    text?: string;
}

// ============================================
// DEFAULT CONFIG
// ============================================

const defaultConfig: ChromaticTextConfig = {
    text: "MORPHYS",
    offset: 6,
    glowRadius: 30,
    bottomFade: true,
};

// ============================================
// MAIN COMPONENT
// ============================================

export function ChromaticText({ config: userConfig, className, text }: ChromaticTextProps) {
    const config = { ...defaultConfig, ...userConfig };
    if (text !== undefined) config.text = text;

    const { offset, glowRadius } = config;
    const glowOffset = offset * 5;
    const midOffset = offset * 2.5;

    return (
        <div
            className={cn(
                "relative flex items-center justify-center font-black tracking-tighter uppercase select-none w-full h-full bg-black",
                className
            )}
        >
            {/* Added generous padding here so the heavy blur layers never hit the bounding box edges and clip. */}
            <div className="relative inline-flex items-center justify-center px-24 py-12" style={{ isolation: "isolate" }}>

                {/* Invisible sizer */}
                <span className="relative opacity-0 pointer-events-none" aria-hidden="true">
                    {config.text}
                </span>

                {/* ========== OUTER GLOW (largest blur, widest color separation) ========== */}

                <span
                    className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-screen"
                    style={{
                        color: "#ff2200",
                        filter: \`blur(\${glowRadius * 1.2}px)\`,
                        transform: \`translate(-\${glowOffset}px, -\${offset}px)\`,
                    }}
                    aria-hidden="true"
                >
                    {config.text}
                </span>

                <span
                    className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-screen"
                    style={{
                        color: "#00ff44",
                        filter: \`blur(\${glowRadius * 1.2}px)\`,
                    }}
                    aria-hidden="true"
                >
                    {config.text}
                </span>

                <span
                    className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-screen"
                    style={{
                        color: "#0044ff",
                        filter: \`blur(\${glowRadius * 1.2}px)\`,
                        transform: \`translate(\${glowOffset}px, \${offset}px)\`,
                    }}
                    aria-hidden="true"
                >
                    {config.text}
                </span>

                {/* ========== MID GLOW (medium blur, medium separation) ========== */}

                <span
                    className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-screen"
                    style={{
                        color: "#ff0000",
                        filter: \`blur(\${glowRadius * 0.5}px)\`,
                        transform: \`translate(-\${midOffset}px, -\${offset * 0.5}px)\`,
                    }}
                    aria-hidden="true"
                >
                    {config.text}
                </span>

                <span
                    className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-screen"
                    style={{
                        color: "#00ff00",
                        filter: \`blur(\${glowRadius * 0.5}px)\`,
                    }}
                    aria-hidden="true"
                >
                    {config.text}
                </span>

                <span
                    className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-screen"
                    style={{
                        color: "#0000ff",
                        filter: \`blur(\${glowRadius * 0.5}px)\`,
                        transform: \`translate(\${midOffset}px, \${offset * 0.5}px)\`,
                    }}
                    aria-hidden="true"
                >
                    {config.text}
                </span>

                {/* ========== TIGHT FRINGE (slight blur, close to the sharp text) ========== */}

                <span
                    className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-screen"
                    style={{
                        color: "#ff0000",
                        filter: \`blur(\${offset * 0.6}px)\`,
                        transform: \`translate(-\${offset * 1.5}px, -\${offset * 0.3}px)\`,
                    }}
                    aria-hidden="true"
                >
                    {config.text}
                </span>

                <span
                    className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-screen"
                    style={{
                        color: "#00ff00",
                        filter: \`blur(\${offset * 0.6}px)\`,
                    }}
                    aria-hidden="true"
                >
                    {config.text}
                </span>

                <span
                    className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-screen"
                    style={{
                        color: "#0000ff",
                        filter: \`blur(\${offset * 0.6}px)\`,
                        transform: \`translate(\${offset * 1.5}px, \${offset * 0.3}px)\`,
                    }}
                    aria-hidden="true"
                >
                    {config.text}
                </span>

                {/* ========== CRISP RGB CHANNELS (sharp text edges) ========== */}

                <span
                    className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-screen"
                    style={{
                        color: "#ff0000",
                        transform: \`translate(-\${offset}px, -\${offset * 0.2}px)\`,
                    }}
                    aria-hidden="true"
                >
                    {config.text}
                </span>

                <span
                    className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-screen"
                    style={{
                        color: "#00ff00",
                    }}
                    aria-hidden="true"
                >
                    {config.text}
                </span>

                <span
                    className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-screen"
                    style={{
                        color: "#0000ff",
                        transform: \`translate(\${offset}px, \${offset * 0.2}px)\`,
                    }}
                    aria-hidden="true"
                >
                    {config.text}
                </span>

                {/* ========== BOTTOM FADE (warm-toned gradient) ========== */}
                {config.bottomFade && (
                    <div
                        className="absolute inset-0 z-30 pointer-events-none"
                        style={{
                            background: "linear-gradient(to bottom, transparent 20%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.6) 80%, rgba(0,0,0,0.85) 100%)",
                        }}
                    />
                )}
            </div>
        </div>
    );
}

// ============================================
// PREVIEW COMPONENT
// ============================================

export function ChromaticTextPreview() {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-transparent overflow-hidden relative rounded-xl font-sans">
            <ChromaticText
                className="text-4xl md:text-5xl"
                config={{
                    offset: 3,
                    glowRadius: 15,
                    bottomFade: false,
                }}
            />
        </div>
    );
}

export default ChromaticText;
`
    },
    {
        id: 'index-scroll-reveal',
        name: 'Index Scroll Reveal',
        index: 51,
        description: 'A layout where index boxes expand according to scroll position on the right, displaying blurred images and numbers smoothly.',
        tags: ['layout', 'scroll', 'reveal', 'index', 'interactive', 'framer-motion'],
        category: 'interaction',
        previewConfig: {},
        dependencies: ['framer-motion', 'react'],
        usage: `import { IndexScrollReveal } from '@/components/ui';\n\n<IndexScrollReveal />`,
        props: [
            { name: 'items', type: 'ScrollItem[]', default: 'defaultItems', description: 'Array of items to display' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' }
        ],
        fullCode: `
"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";

export interface ScrollItem {
    id: string;
    index: string;
    title: string;
    description?: string;
    image: string;
    color: string;
}

export interface IndexScrollRevealProps {
    items?: ScrollItem[];
    className?: string;
    title?: string;
    config?: any; // Allow config object for sandbox compatibility
}

const defaultItems: ScrollItem[] = [
    {
        id: "1",
        index: "01",
        title: "Chainsaw Man",
        image: "/desktop/chainsaw-man-the-5120x2880-23013.jpg",
        color: "#f05023" // Orange
    },
    {
        id: "2",
        index: "02",
        title: "Dandadan",
        image: "/desktop/dandadan-evil-eye-5120x2880-22717.jpg",
        color: "#ff004d" // Pink/Red
    },
    {
        id: "3",
        index: "03",
        title: "Demon Slayer",
        image: "/desktop/demon-slayer-3840x2160-23615.jpg",
        color: "#2a52be" // Blue
    },
    {
        id: "4",
        index: "04",
        title: "Gachiakuta",
        image: "/desktop/gachiakuta-3840x2160-22842.jpg",
        color: "#eaff00" // Yellow
    },
    {
        id: "5",
        index: "05",
        title: "Jujutsu Kaisen",
        image: "/desktop/jujutsu-kaisen-3840x2160-19746.jpg",
        color: "#4a00e0" // Purple
    },
    {
        id: "6",
        index: "06",
        title: "Kaiju No. 8",
        image: "/desktop/kaiju-no-8-mission-7680x4320-21963.jpg",
        color: "#00b2ff" // Cyan
    },
    {
        id: "7",
        index: "07",
        title: "One Piece",
        image: "/desktop/one-piece-season-15-3840x2160-22064.jpg",
        color: "#ff0000" // Red
    },
    {
        id: "8",
        index: "08",
        title: "Sakamoto Days",
        image: "/desktop/sakamoto-days-5120x2880-23913.jpg",
        color: "#111111" // Black
    },
    {
        id: "9",
        index: "09",
        title: "Solo Leveling",
        image: "/desktop/solo-leveling-3840x2160-20374.png",
        color: "#3a3a3a" // Dark Gray
    },
    {
        id: "10",
        index: "10",
        title: "Spy x Family",
        image: "/desktop/spy-x-family-season-5120x2880-24443.png",
        color: "#008a00" // Green
    },
    {
        id: "11",
        index: "11",
        title: "To Be Hero X",
        image: "/desktop/to-be-hero-x-anime-3840x2160-22645.jpg",
        color: "#cc00ff" // Purple
    }
];

// Individual Right Side Section
const RightSection = ({ 
    item, 
    setActiveIndex, 
    index,
    root
}: { 
    item: ScrollItem; 
    setActiveIndex: (val: number) => void; 
    index: number;
    root?: React.RefObject<HTMLElement | null>;
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { 
        margin: "-50% 0px -50% 0px",
        root: root as React.RefObject<Element>
    });

    useEffect(() => {
        if (isInView) {
            setActiveIndex(index);
        }
    }, [isInView, index, setActiveIndex]);

    return (
        <div 
            ref={ref}
            id={\`section-\${index}\`}
            className="w-full flex flex-col gap-2 md:gap-3 scroll-mt-2 md:scroll-mt-3"
        >
            {/* Title Container - Consistent Gap with images */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
                className="w-full shrink-0 flex items-center justify-between rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-12 lg:p-16 overflow-hidden relative border border-white/10"
                style={{ backgroundColor: item.color }}
            >
                <div className="flex justify-between items-center w-full z-10 relative translate-y-0.5">
                    <span className="text-white mix-blend-difference text-lg md:text-3xl font-bold font-mono tracking-tight">
                        {item.index}
                    </span>
                    <h2 className="text-2xl md:text-7xl lg:text-9xl text-white mix-blend-difference font-black font-mono tracking-tighter uppercase leading-none">
                        {item.title}
                    </h2>
                </div>
                {/* Grain Texture */}
                <div className="absolute inset-0 opacity-[0.05] select-none pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
            </motion.div>

            {/* Picture Container */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1], delay: 0.1 }}
                className="w-full h-[60vh] md:h-screen rounded-[1.5rem] md:rounded-[2rem] overflow-hidden relative border border-black/5"
            >
                <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover"
                />
            </motion.div>
        </div>
    );
};

export function IndexScrollReveal({ items = defaultItems, className = "", title = "MORPHYS" }: IndexScrollRevealProps) {
    const [activeIndex, setActiveIndex] = useState(-1);

    return (
        <div className={\`w-full bg-[#f4ece3] text-zinc-900 relative flex flex-row p-2 md:p-3 gap-1.5 md:gap-3 \${className}\`}>
            {/* Left Side: Index Navigation */}
            <div className="w-10 md:w-18 lg:w-22 h-[calc(100vh-1rem)] md:h-[calc(100vh-1.5rem)] sticky top-2 md:top-3 flex flex-col gap-1 z-50">
                {items.map((item, index) => {
                    const isActive = activeIndex === index;
                    return (
                        <motion.div
                            key={item.id}
                            className="w-full rounded-2xl md:rounded-3xl relative overflow-hidden cursor-pointer"
                            animate={{
                                flex: isActive ? 12 : 1,
                                backgroundColor: isActive ? item.color : "rgba(0,0,0,0.06)",
                            }}
                            transition={{
                                duration: 0.8,
                                ease: [0.22, 1, 0.36, 1]
                            }}
                            onClick={() => {
                                document.getElementById(\`section-\${index}\`)?.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            {/* Content */}
                            <div className="absolute inset-0 p-2 md:p-3 flex items-center justify-center pointer-events-none">
                                <motion.span
                                    animate={{
                                        color: isActive ? "#ffffff" : "#000000",
                                        opacity: isActive ? 1 : 0.4,
                                        scale: isActive ? 2.5 : 1,
                                        rotate: isActive ? 0 : -90
                                    }}
                                    transition={{ duration: 0.6 }}
                                    className="text-[10px] md:text-sm font-black font-mono mix-blend-difference"
                                >
                                    {item.index}
                                </motion.span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Right Side: Main Content area */}
            <div className="flex-1 w-full bg-zinc-900/5 rounded-[2.5rem] border border-black/5 px-2 md:px-3 flex flex-col gap-2 md:gap-3 relative">
                {/* Intro Section */}
                <div className="w-full h-screen flex flex-col items-center justify-center">
                    <div 
                        className="w-full h-full flex flex-col items-center justify-center bg-zinc-900/5 rounded-[2rem] border border-black/5 relative overflow-hidden backdrop-blur-sm"
                        style={{ containerType: 'inline-size' }}
                    >
                         <div className="absolute top-10 left-10 md:top-16 md:left-16 flex flex-col gap-1">
                            <span className="text-[10px] md:text-xs font-bold font-mono uppercase tracking-[0.3em] opacity-40">System</span>
                            <h1 className="text-xl md:text-3xl font-black font-mono leading-none tracking-tighter uppercase whitespace-nowrap">Morphys<br />Archive</h1>
                         </div>
                         <div className="absolute top-10 right-10 md:top-16 md:right-16 text-right">
                            <span className="text-[10px] md:text-xs font-bold font-mono uppercase tracking-[0.3em] opacity-40 italic">Ver 1.0.4</span>
                         </div>
                         
                         <div className="relative z-10 flex flex-col items-center px-4">
                            <h1 className="text-[19cqw] leading-none font-black font-mono tracking-tighter opacity-[0.03] select-none uppercase truncate max-w-full text-center">
                                {title}
                            </h1>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                    className="px-4 py-2 md:px-5 md:py-2.5 bg-white/40 backdrop-blur-md border border-black/5 rounded-full flex items-center gap-2 md:gap-2.5 shadow-[0_4px_10px_rgba(0,0,0,0.03)]"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-black/20" />
                                    <span className="text-[9px] md:text-[11px] font-bold font-mono uppercase tracking-[0.2em] text-black/60 whitespace-nowrap">
                                        Interface / Reveal
                                    </span>
                                </motion.div>
                            </div>
                         </div>

                         <div className="absolute bottom-10 md:bottom-16 flex flex-col items-center gap-6">
                            <p className="text-[10px] md:text-xs font-black font-mono uppercase tracking-[0.5em] opacity-40">Begin Exploration</p>
                            <div className="relative w-px h-16 md:h-24 bg-gradient-to-b from-black/20 to-transparent">
                                <motion.div 
                                    animate={{ 
                                        y: [0, 60, 0],
                                        opacity: [0, 1, 0]
                                    }} 
                                    transition={{ 
                                        duration: 2.5, 
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="absolute top-0 left-[-1.5px] w-[4px] h-8 bg-black rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)]" 
                                />
                            </div>
                         </div>
                    </div>
                </div>

                {/* Content Sections */}
                {items.map((item, index) => (
                    <RightSection 
                        key={item.id} 
                        item={item} 
                        index={index} 
                        setActiveIndex={setActiveIndex} 
                    />
                ))}
            </div>
        </div>
    );
}

// Sandbox version with internal scroll for component detail pages
export function IndexScrollRevealSandbox({ items: propItems, className = "", title: propTitle, config }: IndexScrollRevealProps) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(-1);
    
    // Use config if available (from preview page), otherwise props, otherwise defaults
    const items = (config?.items || propItems || defaultItems) as ScrollItem[];
    const title = (config?.title || propTitle || "MORPHYS") as string;

    // Robust manual scroll handling to bypass global scroll interceptors (like Lenis)
    useEffect(() => {
        const wrapper = wrapperRef.current;
        const container = containerRef.current;
        if (!wrapper || !container) return;

        const handleWheel = (e: WheelEvent) => {
            // Stop this event from reaching Lenis or the main page
            e.preventDefault();
            e.stopPropagation();

            // Manually update scroll position
            // This is the most reliable way to ensure internal scrolling in a sandbox
            container.scrollTop += e.deltaY;
        };

        wrapper.addEventListener('wheel', handleWheel, { passive: false });
        return () => {
            wrapper.removeEventListener('wheel', handleWheel);
        };
    }, []);

    return (
        <div 
            ref={wrapperRef}
            className={\`w-full h-full overflow-hidden bg-[#f4ece3] text-zinc-900 relative p-2 md:p-3 \${className}\`}
        >
            <style jsx global>{\`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            \`}</style>
            <div className="flex w-full h-full relative gap-2 md:gap-3">
                {/* Left Side: Index Navigation */}
                <div className="w-14 md:w-18 lg:w-22 h-full sticky top-0 flex flex-col gap-1 z-50 pointer-events-none">
                    <div className="pointer-events-auto flex flex-col gap-1 w-full h-full">
                        {items.map((item, index) => {
                            const isActive = activeIndex === index;
                            return (
                                <motion.div
                                    key={item.id}
                                    className="w-full rounded-2xl md:rounded-3xl relative overflow-hidden cursor-pointer"
                                    animate={{
                                        flex: isActive ? 12 : 1,
                                        backgroundColor: isActive ? item.color : "rgba(0,0,0,0.06)",
                                    }}
                                    transition={{
                                        duration: 0.8,
                                        ease: [0.22, 1, 0.36, 1]
                                    }}
                                    onClick={() => {
                                        const sections = containerRef.current?.querySelectorAll('.section-item');
                                        if (sections && sections[index + 1]) { // +1 because of intro section
                                            sections[index + 1].scrollIntoView({ behavior: 'smooth' });
                                        }
                                    }}
                                >
                                    <div className="absolute inset-0 p-2 md:p-3 flex items-center justify-center pointer-events-none">
                                        <motion.span
                                            animate={{
                                                color: isActive ? "#ffffff" : "#000000",
                                                opacity: isActive ? 1 : 0.4,
                                                scale: isActive ? 2.5 : 1,
                                                rotate: isActive ? 0 : -90
                                            }}
                                            transition={{ duration: 0.6 }}
                                            className="text-[10px] md:text-xs font-black font-mono mix-blend-difference"
                                        >
                                            {item.index}
                                        </motion.span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex-1 h-full relative min-h-0 bg-zinc-900/5 rounded-[2.5rem] border border-black/5 overflow-hidden">
                    <div 
                        ref={containerRef}
                        data-lenis-prevent
                        className="absolute inset-0 h-full w-full overflow-y-auto pt-0 px-0 flex flex-col gap-2 md:gap-3 scrollbar-hide pb-0"
                        style={{ overscrollBehavior: 'contain' }}
                    >
                        {/* Intro Section */}
                        <div className="section-item w-full h-screen flex-shrink-0 flex flex-col items-center justify-center min-h-[500px]">
                        <div 
                            className="w-full h-full flex flex-col items-center justify-center bg-zinc-900/5 rounded-[2.5rem] border border-black/5 relative overflow-hidden backdrop-blur-sm"
                            style={{ containerType: 'inline-size' }}
                        >
                             <div className="absolute top-10 left-10 flex flex-col gap-0.5">
                                <span className="text-[8px] md:text-[10px] font-bold font-mono uppercase tracking-widest opacity-40">Project</span>
                                <h1 className="text-lg md:text-xl font-black font-mono leading-tight tracking-tighter uppercase whitespace-nowrap">Morphys<br />Sandbox</h1>
                             </div>
                             
                             <div className="relative flex flex-col items-center">
                                <h1 className="text-[19cqw] leading-none font-black font-mono tracking-tighter opacity-[0.03] select-none uppercase truncate max-w-full text-center">
                                    {title}
                                </h1>
                                <div className="absolute inset-0 flex items-center justify-center scale-75 md:scale-100">
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="px-4 py-2 bg-white/40 backdrop-blur-md border border-black/5 rounded-full flex items-center gap-2 shadow-[0_4px_10px_rgba(0,0,0,0.02)]"
                                    >
                                        <div className="w-1 h-1 rounded-full bg-black/20" />
                                        <span className="text-[8px] md:text-[10px] font-bold font-mono uppercase tracking-[0.2em] text-black/50">
                                            Component / Preview
                                        </span>
                                    </motion.div>
                                </div>
                             </div>

                             <div className="absolute bottom-10 flex flex-col items-center gap-4">
                                <p className="text-[8px] md:text-[10px] font-bold font-mono uppercase tracking-[0.4em] opacity-40 italic">Swipe to navigate</p>
                                <div className="relative w-px h-12 bg-gradient-to-b from-black/10 to-transparent">
                                    <motion.div 
                                        animate={{ 
                                            y: [0, 48, 0],
                                            opacity: [0, 1, 0]
                                        }} 
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute top-0 left-[-1px] w-[2px] h-6 bg-black opacity-30 rounded-full" 
                                    />
                                </div>
                             </div>
                        </div>
                    </div>

                    {/* Content Sections */}
                        {items.map((item, index) => (
                            <div key={item.id} className="section-item shrink-0 w-full min-h-screen">
                                <RightSection 
                                    item={item} 
                                    index={index} 
                                    setActiveIndex={setActiveIndex} 
                                    root={containerRef}
                                />
                            </div>
                        ))}
                    
                    </div>
                </div>
            </div>
        </div>
    );
}

export default IndexScrollReveal;
`
    },
    {
        id: 'infinity-brand-scroll',
        name: 'Infinity Brand Scroll',
        index: 52,
        description: 'A 3D infinite looping strip of pictures in a twisted lemniscate shape with smooth scrolling physics.',
        tags: ['3d', 'scroll', 'infinite', 'brand', 'showcase', 'three-js'],
        category: 'interaction',
        previewConfig: { speed: 0.5, radius: 8, weight: 5, impact: 1 },
        dependencies: ['@react-three/fiber', '@react-three/drei', 'three', 'react'],
        usage: `import { InfinityBrandScroll } from '@/components/ui';\n\n<InfinityBrandScroll />`,
        props: [
            { name: 'items', type: 'Array<{image: string}>', default: 'defaultImages', description: 'Array of images to loop' },
            { name: 'speed', type: 'number', default: '0.5', description: 'Base auto-scroll speed' },
            { name: 'radius', type: 'number', default: '8', description: 'Radius of the loop' },
            { name: 'weight', type: 'number', default: '5', description: 'Weight of the scroll physics' },
            { name: 'impact', type: 'number', default: '1', description: 'Strength of the impact/jiggle effect' }
        ],
        fullCode: `
"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture, Html } from "@react-three/drei";
import * as THREE from "three";
import { Loader2 } from "lucide-react";

// --- Configuration Interfaces ---

export interface InfinityBrandScrollProps {
    items?: { image: string; alt?: string }[];
    speed?: number; // Base auto-scroll speed
    radius?: number; // Size of the loop
    text?: string;
    interactive?: boolean; // Whether to enable user interaction (scroll, drag, hover)
    weight?: number; // Weight of the scroll (drag resistance & momentum) - default: 3
    impact?: number; // Strength of the impact/jiggle effect - default: 1
}

// --- The 3D Scene ---

// Custom curve definition - Lemniscate of Bernoulli (Infinity Symbol)
class InfinityCurve extends THREE.Curve<THREE.Vector3> {
    scale: number;

    constructor(scale = 1) {
        super();
        this.scale = scale;
    }

    getPoint(t: number, optionalTarget = new THREE.Vector3()) {
        // Parametric equation for a 3D Lemniscate / Twisted Loop
        // t goes from 0 to 1
        const theta = t * Math.PI * 2;

        // X and Y form the figure-8
        const x = (this.scale * Math.cos(theta)) / (1 + Math.sin(theta) * Math.sin(theta));
        const y = (this.scale * Math.sin(theta) * Math.cos(theta)) / (1 + Math.sin(theta) * Math.sin(theta));
        
        // Z adds depth to make it 3D (twists it)
        const z = (this.scale * 0.5) * Math.sin(theta);

        return optionalTarget.set(x, y, z);
    }
}

// --- Reusable Scratch Vectors (Module Scope) to prevent GC ---
const UP_VECTOR = new THREE.Vector3(0, 1, 0);
const FOCUS_POS = new THREE.Vector3(0, 0, 15);
const FOCUS_EULER = new THREE.Euler(0, 0, 0);
const START_CENTER = new THREE.Vector3(0, 0, -50);
const MIN_SCALE = new THREE.Vector3(0.1, 0.1, 0.1);

const Card = ({ 
    url, 
    positionAt, 
    curve, 
    index, 
    total, 
    scrollOffset,
    hovered,
    setHovered,
    selected,
    setSelected,
    interactive = true,
    animProgress,
    expansion
}: { 
    url: string; 
    positionAt: number; 
    curve: InfinityCurve; 
    index: number; 
    total: number;
    scrollOffset: React.MutableRefObject<number>;
    hovered: number | null;
    setHovered: (i: number | null) => void;
    selected: number | null;
    setSelected: (i: number | null) => void;
    interactive?: boolean;
    animProgress: React.MutableRefObject<number>;
    expansion: React.MutableRefObject<number>;
}) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const texture = useTexture(url) as THREE.Texture;
    
    // Fix texture aspect ratio
    const img = texture.image as HTMLImageElement;
    const aspect = (img && img.width) ? img.width / img.height : 1.5;
    
    // Smooth transition state (0 = loop, 1 = focused)
    const transition = useRef(0);
    // Smooth hover state
    const hoverScale = useRef(1);

    // Instance-specific scratch objects to prevent allocation in useFrame
    const scratch = useMemo(() => ({
        point: new THREE.Vector3(),
        tangent: new THREE.Vector3(),
        loopQuaternion: new THREE.Quaternion(),
        mat: new THREE.Matrix4(),
        scaleVec: new THREE.Vector3(),
        startPoint: new THREE.Vector3(),
        startTangent: new THREE.Vector3(),
        startQuaternion: new THREE.Quaternion(),
        focusQuaternion: new THREE.Quaternion().setFromEuler(FOCUS_EULER),
        focusScale: new THREE.Vector3(),
        tempVec: new THREE.Vector3()
    }), []);

    useFrame(() => {
        if (!meshRef.current) return;

        const isSelected = selected === index;
        const targetTransition = isSelected ? 1 : 0;
        
        // Custom damp for smooth transition
        transition.current = THREE.MathUtils.lerp(transition.current, targetTransition, 0.1);

        // Hover scale smooth damp
        const targetHoverScale = (interactive && hovered === index && !isSelected) ? 1.2 : 1;
        hoverScale.current = THREE.MathUtils.lerp(hoverScale.current, targetHoverScale, 0.1);

        // 1. Plot Curve Position
        // Calculate current position on curve (0..1)
        const basePosition = index / total;
        let t = (basePosition + scrollOffset.current) % 1;
        if (t < 0) t += 1;

        // Use scratch vectors
        curve.getPoint(t, scratch.point);
        
        // --- LOCAL EXPANSION LOGIC ---
        // Apply "jiggle" expansion only to items near the front (Z > 0 roughly)
        // This makes the impact local to the user's "holding" area
        const zInfluence = THREE.MathUtils.smoothstep(scratch.point.z, -2, 5); 
        // Normalize expansion relative to curve scale to get a multiplier
        const expansionFactor = 1 + (expansion.current / curve.scale) * zInfluence;
        scratch.point.multiplyScalar(expansionFactor);
        
        // Tangent calculation
        // Note: We use original tangent which is "good enough" and stable
        const tangent = curve.getTangent(t).normalize(); 
        
        // Loop Orientation
        // scratch.mat.lookAt(eye, target, up)
        scratch.tempVec.copy(scratch.point).add(tangent);
        scratch.mat.lookAt(scratch.point, scratch.tempVec, UP_VECTOR);
        scratch.loopQuaternion.setFromRotationMatrix(scratch.mat);

        // Loop Scale
        const zNorm = (scratch.point.z + curve.scale * 0.5) / curve.scale; 
        const scaleBase = 1 + zNorm * 1.5; 
        // Apply smooth hover scale
        const loopTargetScale = scaleBase * hoverScale.current;
        const loopScale = scratch.scaleVec.set(3 * aspect, 3, 1).multiplyScalar(loopTargetScale * 0.25);



        // 2. Plot Focus Position
        // Used module constant FOCUS_POS
        
        // Fit based on viewport
        const maxH = 2.5;
        // scratch.focusScale.set(maxH * aspect, maxH, 1);
        const focusScale = scratch.focusScale.set(maxH * aspect, maxH, 1);

        // --- Arrival Animation Interpolation ---
        const p = animProgress.current; // 0..1
        // Cubic Easing for "Smooth AF" feel
        const ease = 1 - Math.pow(1 - p, 4);

        // Start (Arrival) Position & Orientation
        // Center Depth of the screen (Start far back z=-50)
        // Map t (0..1) to an angle for the start shape
        const startAngle = t * Math.PI * 2;
        
        // Form a smaller, tighter circle/string in the center depth
        scratch.startPoint.set(
            START_CENTER.x + Math.cos(startAngle) * 4, 
            START_CENTER.y + Math.sin(startAngle) * 4,
            START_CENTER.z + Math.sin(startAngle * 3) * 5
        );

        // Calculate Start Tangent for orientation
        scratch.startTangent.set(
            -Math.sin(startAngle), 
            Math.cos(startAngle), 
            Math.cos(startAngle * 3) 
        ).normalize();
        
        scratch.tempVec.copy(scratch.startPoint).add(scratch.startTangent);
        scratch.mat.lookAt(scratch.startPoint, scratch.tempVec, UP_VECTOR);
        scratch.startQuaternion.setFromRotationMatrix(scratch.mat);

        // 3. Interpolate Final Logic
        if (transition.current < 0.001) {
            // Pure Loop (with Arrival Animation)
            
            // Interpolate Position (Arrival -> Loop)
            meshRef.current.position.lerpVectors(scratch.startPoint, scratch.point, ease);
            
            // Interpolate Rotation (Arrival -> Loop)
            meshRef.current.quaternion.slerpQuaternions(scratch.startQuaternion, scratch.loopQuaternion, ease);
            
            // Interpolate Scale (Small in depth -> Normal loop size)
            meshRef.current.scale.lerpVectors(MIN_SCALE, loopScale, ease); // loopScale is scratch.scaleVec

            // Render Order: standard
            meshRef.current.renderOrder = 0;
            if (meshRef.current.material instanceof THREE.Material) {
                meshRef.current.material.depthTest = true;
                meshRef.current.material.depthWrite = true;
            }
        } else {
            // Blending or Focal (Selected State)
            
            // Position (Loop -> Focus)
            meshRef.current.position.lerpVectors(scratch.point, FOCUS_POS, transition.current);
            
            // Rotation (Loop -> Focus)
            meshRef.current.quaternion.slerpQuaternions(scratch.loopQuaternion, scratch.focusQuaternion, transition.current);
            
            // Scale (Loop -> Focus)
            meshRef.current.scale.lerpVectors(loopScale, focusScale, transition.current);

            // Z-Index / Render Order hacks
            if (transition.current > 0.1) {
                meshRef.current.renderOrder = 999;
                if (meshRef.current.material instanceof THREE.Material) {
                   meshRef.current.material.depthTest = false; 
                   meshRef.current.material.depthWrite = false;
                }
            } else {
                 // Reset to standard depth handling when close to the loop position so it sorts correctly
                 meshRef.current.renderOrder = 0;
                 if (meshRef.current.material instanceof THREE.Material) {
                    meshRef.current.material.depthTest = true; 
                    meshRef.current.material.depthWrite = true;
                 }
            }
        }
    });

    return (
        <mesh 
            ref={meshRef}
            onPointerOver={(e) => { 
                if (!interactive) return;
                e.stopPropagation(); 
                setHovered(index); 
                document.body.style.cursor = 'pointer'; 
            }}
            onPointerOut={() => { 
                if (!interactive) return;
                setHovered(null); 
                document.body.style.cursor = 'auto'; 
            }}
            onClick={(e) => {
                if (!interactive) return;
                e.stopPropagation();
                // Toggle selection
                setSelected(selected === index ? null : index);
            }}
        >
            <planeGeometry args={[1, 1, 32, 32]} />
            <meshBasicMaterial 
                map={texture} 
                side={THREE.DoubleSide} 
                transparent 
            />
        </mesh>
    );
};

const Scene = ({ items, baseSpeed, radius, interactive = true, weight = 3, impact = 1 }: { items: { image: string }[], baseSpeed: number, radius: number, interactive?: boolean, weight?: number, impact?: number }) => {
    const curve = useMemo(() => new InfinityCurve(radius), [radius]);
    const scrollOffset = useRef(0);
    const scrollVelocity = useRef(baseSpeed);
    const targetVelocity = useRef(baseSpeed);
    const [hovered, setHovered] = useState<number | null>(null);
    const [selected, setSelected] = useState<number | null>(null);

    // Interaction state
    const isDragging = useRef(false);
    const previousPointer = useRef(0);

    // NEW: Smooth Dragging refs
    const scrollTarget = useRef(0);
    const lastScrollOffset = useRef(0);

    // Friction / Expansion physics
    const expansion = useRef(0); // Current expansion amount
    const expansionVelocity = useRef(0); // For spring physics

    // Arrival animation ref (0 to 1) 
    const animProgress = useRef(0);

    // Precalculate physics properties based on weight
    // Base values (weight=1):
    // Damping: 0.08 (fast)
    // Sensitivity: 0.0015 (fast)
    // Momentum Friction: 0.05 (stops quickly)
    
    // Adjusted for better default feel
    const dragDamping = useMemo(() => 0.08 / Math.max(weight * 0.5, 0.1), [weight]);
    const sensitivity = useMemo(() => 0.0012 / Math.max(weight * 0.5, 0.1), [weight]);
    const friction = useMemo(() => 0.05 / Math.max(weight * 0.8, 0.1), [weight]);

    useFrame((state, delta) => {
        // Prepare for arrival animation - prevent frame skip on first render
        // Cap delta to 0.1s (10FPS) to prevent huge jumps from shader compilation stutter
        const dt = Math.min(delta, 0.1);

        // Animate arrival: Linear increment with eased usage
        if (animProgress.current < 1) {
             // 0.8 speed = ~1.25s duration
             animProgress.current += dt * 0.5; 
             if (animProgress.current > 1) animProgress.current = 1;
        }

        // --- Expansion / Jiggle Physics ---
        // Target expansion is based on current scroll velocity
        // The faster we scroll, the wider the loop gets
        // Multiplied by impact factor
        const speed = Math.abs(scrollVelocity.current);
        const targetExpansion = Math.min(speed * 3 * impact, 5 * impact); 

        // Spring physics for expansion (Hooke's Law with Damping)
        // F = -k*x - c*v
        const k = 80; // Stiffness (higher = snappier jiggle)
        const c = 8; // Damping (lower = more wobble/bouncier stop)
        
        const force = (targetExpansion - expansion.current) * k - expansionVelocity.current * c;
        expansionVelocity.current += force * dt;
        expansion.current += expansionVelocity.current * dt;

        // Apply updated radius to the curve
        // This dynamically changes the loop size based on velocity!
        // curve.scale = radius + expansion.current; // REMOVED GLOBAL SCALING


        if (isDragging.current) {
            // "Weighted" Drag Logic
            // Instead of direct manipulation, we lerp towards the target
            // This gives it a "heavy" feel and smooths out mouse jitter
            scrollOffset.current = THREE.MathUtils.lerp(scrollOffset.current, scrollTarget.current, dragDamping);

            // Calculate velocity based on actual movement for momentum release
            // Original logic used: scrollOffset.current += scrollVelocity.current * dt * 0.1;
            // So Velocity = (Change / dt) * 10
            const change = scrollOffset.current - lastScrollOffset.current;
            if (dt > 0.001) {
                // Smooth velocity calculation to prevent spikes
                const instantVelocity = (change / dt) * 10;
                scrollVelocity.current = THREE.MathUtils.lerp(scrollVelocity.current, instantVelocity, 0.5);
            }
            targetVelocity.current = baseSpeed; // Reset target for when we release
            
        } else {
            // Smoothly interpolate velocity back to baseSpeed (or slowed speed if hovered)
            scrollVelocity.current = THREE.MathUtils.lerp(scrollVelocity.current, targetVelocity.current, friction);
            
            // Apply velocity to offset
            scrollOffset.current += scrollVelocity.current * dt * 0.1;

            // Determine target speed based on hover state (slow down if hovered)
            // If not interactive, always use baseSpeed (no hover slowdown)
            const destinationSpeed = (interactive && hovered !== null) ? baseSpeed * 0.05 : baseSpeed;

            // Reset target velocity if not interacting (simple auto-scroll resume)
            if (Math.abs(targetVelocity.current - destinationSpeed) > 0.001) {
                targetVelocity.current = THREE.MathUtils.lerp(targetVelocity.current, destinationSpeed, 0.02);
            } else {
                targetVelocity.current = destinationSpeed;
            }
        }
        
        lastScrollOffset.current = scrollOffset.current;
    });

    const { gl } = useThree();
    
    // Wheel + Drag handling
    useEffect(() => {
        if (!interactive) return;

        const canvas = gl.domElement;

        const handleWheel = (e: WheelEvent) => {
            // Add momentum
            const speed = e.deltaY * 0.0005;
            scrollVelocity.current += speed;
            targetVelocity.current = baseSpeed + speed * 2; // temporary boost
        };

        const handlePointerDown = (e: PointerEvent) => {
            isDragging.current = true;
            previousPointer.current = e.clientX;
            
            // Sync target so we don't jump
            scrollTarget.current = scrollOffset.current;
        };

        const handlePointerMove = (e: PointerEvent) => {
            if (!isDragging.current) return;
            const deltaX = e.clientX - previousPointer.current;
            previousPointer.current = e.clientX;
            
            // Move TARGET, not offset directly
            // Increased sensitivity slightly to compensate for the lerp feel
            scrollTarget.current -= deltaX * sensitivity; 
        };

        const handlePointerUp = () => {
            isDragging.current = false;
        };

        canvas.addEventListener('wheel', handleWheel, { passive: false });
        canvas.addEventListener('pointerdown', handlePointerDown);
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
        
        return () => {
            canvas.removeEventListener('wheel', handleWheel);
            canvas.removeEventListener('pointerdown', handlePointerDown);
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [gl, baseSpeed, interactive]);

    return (
        <group>
             {/* Visual Guide Line (Optional, cool style) */}
            {/* <mesh>
                <tubeGeometry args={[curve, 100, 0.05, 8, true]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.1} wireframe={false} />
            </mesh> */}

            {items.map((item, i) => (
                <Card 
                    key={i} 
                    url={item.image} 
                    index={i}
                    total={items.length}
                    curve={curve}
                    positionAt={i / items.length}
                    scrollOffset={scrollOffset}
                    hovered={hovered}
                    setHovered={setHovered}
                    selected={selected}
                    setSelected={setSelected}
                    interactive={interactive}
                    animProgress={animProgress}
                    expansion={expansion}
                />
            ))}
        </group>
    );
};

// --- Main Component ---

const defaultImages = [
    { image: "/desktop/chainsaw-man-the-5120x2880-23013.jpg" },
    { image: "/desktop/dandadan-evil-eye-5120x2880-22717.jpg" },
    { image: "/desktop/demon-slayer-3840x2160-23615.jpg" },
    { image: "/desktop/gachiakuta-3840x2160-22842.jpg" },
    { image: "/desktop/jujutsu-kaisen-3840x2160-19746.jpg" },
    { image: "/desktop/kaiju-no-8-mission-7680x4320-21963.jpg" },
    { image: "/desktop/one-piece-season-15-3840x2160-22064.jpg" },
    { image: "/desktop/sakamoto-days-5120x2880-23913.jpg" },
    { image: "/desktop/solo-leveling-3840x2160-20374.png" },
    { image: "/desktop/spy-x-family-season-5120x2880-24443.png" },
    { image: "/desktop/to-be-hero-x-anime-3840x2160-22645.jpg" },
    { image: "/24/chainsaw-man-the-5120x2880-23013.jpg" },
    { image: "/24/demon-slayer-3840x2160-23615.jpg" },
    { image: "/24/jujutsu kaisen.jpg" },
    { image: "/24/onepiece.jpg" },
    // Duplicate set to fill the loop
    { image: "/desktop/chainsaw-man-the-5120x2880-23013.jpg" },
    { image: "/desktop/dandadan-evil-eye-5120x2880-22717.jpg" },
    { image: "/desktop/demon-slayer-3840x2160-23615.jpg" },
    { image: "/desktop/gachiakuta-3840x2160-22842.jpg" },
    { image: "/desktop/jujutsu-kaisen-3840x2160-19746.jpg" },
    { image: "/desktop/kaiju-no-8-mission-7680x4320-21963.jpg" },
    { image: "/desktop/one-piece-season-15-3840x2160-22064.jpg" },
    { image: "/desktop/sakamoto-days-5120x2880-23913.jpg" },
    { image: "/desktop/solo-leveling-3840x2160-20374.png" },
    { image: "/desktop/spy-x-family-season-5120x2880-24443.png" },
    { image: "/desktop/to-be-hero-x-anime-3840x2160-22645.jpg" },
    { image: "/24/chainsaw-man-the-5120x2880-23013.jpg" },
    { image: "/24/demon-slayer-3840x2160-23615.jpg" },
    { image: "/24/jujutsu kaisen.jpg" },
    { image: "/24/onepiece.jpg" },
    // One more set for good measure
    { image: "/desktop/chainsaw-man-the-5120x2880-23013.jpg" },
    { image: "/desktop/dandadan-evil-eye-5120x2880-22717.jpg" },
    { image: "/desktop/demon-slayer-3840x2160-23615.jpg" },
    { image: "/desktop/gachiakuta-3840x2160-22842.jpg" },
    { image: "/desktop/jujutsu-kaisen-3840x2160-19746.jpg" },
    { image: "/desktop/kaiju-no-8-mission-7680x4320-21963.jpg" },
    { image: "/desktop/one-piece-season-15-3840x2160-22064.jpg" },
    { image: "/desktop/sakamoto-days-5120x2880-23913.jpg" },
    { image: "/desktop/solo-leveling-3840x2160-20374.png" },
    { image: "/desktop/spy-x-family-season-5120x2880-24443.png" },
];

function SuspenseLoader() {
    return (
        <Html center>
            <div className="flex flex-col items-center justify-center text-foreground bg-background/80 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-xl animate-in fade-in zoom-in duration-300 pointer-events-none select-none">
                <Loader2 className="w-8 h-8 animate-spin mb-2 text-primary" />
                <span className="text-xs font-mono uppercase tracking-widest opacity-70">Loading Assets...</span>
            </div>
        </Html>
    );
}


export function InfinityBrandScroll({ 
    items = defaultImages, 
    speed = 0.5, 
    radius = 8,
    interactive = true,
    text,
    weight = 5, // Default weight
    impact = 1 // Default impact
}: InfinityBrandScrollProps) {
    return (
        <div className="w-full h-full relative overflow-hidden">
            {/* Background Text Removed */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                 {/* <h1 className="text-[15vw] font-black text-foreground/5 tracking-tighter leading-none">
                    {text}
                 </h1> */}
            </div>

            <Canvas 
                camera={{ position: [0, 0, 22], fov: 35 }}
                gl={{ antialias: true, alpha: true }}
                dpr={[1, 1.5]} // Optimization for varying screens
            >
                {/* <color attach="background" args={["#09090b"]} /> */}
                {/* <fog attach="fog" args={["#09090b", 15, 30]} /> */}
                
                <React.Suspense fallback={<SuspenseLoader />}>
                    <Scene items={items} baseSpeed={speed} radius={radius} interactive={interactive} weight={weight} impact={impact} />
                </React.Suspense>
            </Canvas>

            {/* Overlay UI */}
             {interactive && (
                <div className="absolute bottom-10 left-10 pointer-events-none">
                    <span className="text-xs font-mono text-foreground/40 uppercase tracking-widest">
                        Scroll / Drag to navigate
                    </span>
                </div>
             )}
        </div>
    );
}

export default InfinityBrandScroll;
`
    }
];



// Fast lookup by ID
const dataMap = new Map<string, any>(componentsData.map(c => [c.id, c]));

export function getComponentById(id: string): any {
    return dataMap.get(id);
}

// Re-export type for compatibility
export type { ComponentDataLite as ComponentData };
