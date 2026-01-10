// Components Data - Central registry for all animation components

export interface ComponentData {
    id: string;
    name: string;
    index: number;
    description: string;
    tags: string[];
    category: 'animation' | 'interaction' | 'layout' | 'effect';
    previewConfig?: Record<string, unknown>;
    usage: string;
    fullCode: string;
    dependencies: string[];
    props: {
        name: string;
        type: string;
        default: string;
        description: string;
    }[];
}

export const componentsData: ComponentData[] = [
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
        fullCode: `"use client";

import { motion, useAnimation } from "framer-motion";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";

// ============================================
// TYPES & INTERFACES
// ============================================

type GridPattern =
    | 'wave'
    | 'cascade'
    | 'random'
    | 'spiral'
    | 'checkerboard'
    | 'horizontal'
    | 'vertical'
    | 'explode'
    | 'implode';

type EasingType = 'smooth' | 'spring' | 'bounce' | 'elastic';
type SpeedType = 'slow' | 'normal' | 'fast' | 'instant';

interface FlipGridConfig {
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

interface FlipGridProps {
    config?: Partial<FlipGridConfig>;
    className?: string;
    onFlipComplete?: () => void;
    imageData?: boolean[][];
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
            const dist = Math.sqrt(
                Math.pow(row - centerRow, 2) + Math.pow(col - centerCol, 2)
            );
            return dist * stagger * 1.5;
        }
        case 'implode': {
            const maxDist = Math.sqrt(
                Math.pow(totalRows / 2, 2) + Math.pow(totalCols / 2, 2)
            );
            const dist = Math.sqrt(
                Math.pow(row - centerRow, 2) + Math.pow(col - centerCol, 2)
            );
            return (maxDist - dist) * stagger * 1.5;
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

function FlipCard({ isFlipped, delay, config, onClick }: FlipCardProps) {
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
                    }}
                />
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
                        border: \`1px solid \${config.colorFront}20\`,
                    }}
                />
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
    autoPlay = true,
    autoPlayInterval = 3000,
    imageData,
}: FlipGridProps) {
    const config = useMemo(() => ({ ...defaultConfig, ...userConfig }), [userConfig]);
    const totalCards = config.cols * config.rows;
    const gridKey = \`\${config.cols}-\${config.rows}\`;

    const [isFlipped, setIsFlipped] = useState(false);
    const isMounted = useRef(true);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setIsFlipped(false);
    }, [config.cols, config.rows]);

    const adaptiveStagger = useMemo(() => {
        const baseStagger = speedMap[config.speed].stagger;
        const targetTotalTime = 2.5;
        const maxDelay = totalCards * baseStagger;
        if (maxDelay > targetTotalTime) {
            return targetTotalTime / totalCards;
        }
        return baseStagger;
    }, [config.speed, totalCards]);

    const delays = useMemo(() => {
        return Array.from({ length: totalCards }, (_, i) => {
            const row = Math.floor(i / config.cols);
            const col = i % config.cols;
            return getPatternDelay(i, row, col, config.rows, config.cols, config.pattern, adaptiveStagger);
        });
    }, [config.cols, config.rows, config.pattern, adaptiveStagger, totalCards]);

    const maxDelay = useMemo(() => Math.max(...delays, 0), [delays]);
    const animationDuration = speedMap[config.speed].duration;

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

    useEffect(() => {
        if (!autoPlay || imageData) return;
        if (intervalRef.current) clearInterval(intervalRef.current);
        const fullAnimationTime = (maxDelay + animationDuration) * 1000 + 300;
        const effectiveInterval = Math.max(autoPlayInterval, fullAnimationTime);
        intervalRef.current = setInterval(() => {
            if (isMounted.current) setIsFlipped(prev => !prev);
        }, effectiveInterval);
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [autoPlay, autoPlayInterval, imageData, config.cols, config.rows, maxDelay, animationDuration]);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    const [clickedCards, setClickedCards] = useState<Set<number>>(new Set());

    useEffect(() => {
        setClickedCards(new Set());
    }, [config.cols, config.rows]);

    const handleCardClick = useCallback((index: number) => {
        if (!config.interactive) return;
        setClickedCards(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) newSet.delete(index);
            else newSet.add(index);
            return newSet;
        });
    }, [config.interactive]);

    const getCardFlipped = useCallback((index: number): boolean => {
        if (imageStates) return imageStates[index] ?? false;
        const wasClicked = clickedCards.has(index);
        return wasClicked ? !isFlipped : isFlipped;
    }, [imageStates, clickedCards, isFlipped]);

    return (
        <div
            key={gridKey}
            className={\`w-full h-full \${className}\`}
            style={{
                display: 'grid',
                gridTemplateColumns: \`repeat(\${config.cols}, 1fr)\`,
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

export default FlipGrid;`,
        props: [
            { name: 'config', type: 'Partial<FlipGridConfig>', default: '{}', description: 'Configuration object for grid appearance and behavior' },
            { name: 'autoPlay', type: 'boolean', default: 'true', description: 'Enable automatic pattern cycling' },
            { name: 'autoPlayInterval', type: 'number', default: '3000', description: 'Interval between pattern changes (ms)' },
            { name: 'imageData', type: 'boolean[][]', default: 'undefined', description: '2D array for custom flip patterns' },
            { name: 'onFlipComplete', type: '() => void', default: 'undefined', description: 'Callback when flip animation completes' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes for the grid container' },
        ]
    },
    {
        id: 'ascii-simulation',
        name: 'ASCII Simulation',
        index: 2,
        description: 'A retro-style 3D renderer that projects shapes like Torus, Sphere, and Cube into ASCII characters in real-time. Pure math-based visualization with customizable aesthetics.',
        tags: ['ascii', '3d', 'retro', 'terminal', 'simulation', 'code-art'],
        category: 'animation',
        previewConfig: {
            shape: 'torus',
            scale: 1,
        },
        dependencies: ['react'],
        usage: `import { AsciiSimulation } from '@/components/ui';

// Basic usage
<AsciiSimulation />

// With custom configuration
<AsciiSimulation
    config={{
        shape: 'sphere',
        scale: 1.2,
        speed: 1.5,
        color: '#00ff00',
        charSet: ' .:-=+*#%@',
        fontSize: 10,
        invert: false,
    }}
    autoPlay={true}
/>`,
        fullCode: `"use client";

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
// ASCII RENDERER COMPONENT
// ============================================

export function AsciiSimulation({
    config: userConfig,
    className = "",
    autoPlay = true
}: AsciiSimulationProps) {
    const config = { ...defaultConfig, ...userConfig };
    const preRef = useRef<HTMLPreElement>(null);
    const animationRef = useRef<number>(0);
    const meshCache = useRef<ObjMesh | null>(null);
    const [isLoadingModel, setIsLoadingModel] = useState(false);

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
                    const mesh = parseObj(text, 15000);
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
                })
                .catch(err => {
                    console.error("Failed to load car model", err);
                    setIsLoadingModel(false);
                });
        }
    }, [config.shape]);

    const [dimensions, setDimensions] = useState({ width: 100, height: 50 });

    useEffect(() => {
        const updateDimensions = () => {
            if (preRef.current) {
                const charW = config.fontSize * 0.6;
                const charH = config.fontSize * 0.6;
                const w = Math.floor(window.innerWidth / charW);
                const h = Math.floor(window.innerHeight / charH);
                setDimensions({ width: Math.min(300, w), height: Math.min(150, h) });
            }
        };

        window.addEventListener('resize', updateDimensions);
        updateDimensions();

        return () => window.removeEventListener('resize', updateDimensions);
    }, [config.fontSize]);

    const renderFrame = () => {
        if (!preRef.current) return;

        const { width, height } = dimensions;
        const screenWidth = width;
        const screenHeight = height;

        const b: string[] = new Array(screenWidth * screenHeight).fill(" ");
        const z: number[] = new Array(screenWidth * screenHeight).fill(0);

        const R1 = 1;
        const R2 = 2;
        const K2 = 5;
        const K1 = Math.min(screenWidth, screenHeight) * config.scale * 0.8;

        if (autoPlay) {
            if (config.shape === 'car') {
                A.current = 0;
                B.current += 0.02 * config.speed;
            } else {
                A.current += 0.04 * config.speed;
                B.current += 0.02 * config.speed;
            }
        } else {
            A.current = config.rotationX;
            B.current = config.rotationY;
        }

        const chars = config.charSet;
        const cA = Math.cos(A.current);
        const sA = Math.sin(A.current);
        const cB = Math.cos(B.current);
        const sB = Math.sin(B.current);

        // CAR SHAPE RENDERING
        if (config.shape === 'car' && meshCache.current) {
            const mesh = meshCache.current;
            const len = mesh.vertices.length;

            for (let i = 0; i < len; i += 3) {
                const vx = mesh.vertices[i];
                const vy = mesh.vertices[i + 1];
                const vz = mesh.vertices[i + 2];

                let y1 = vy * cA - vz * sA;
                let z1 = vy * sA + vz * cA;
                let x1 = vx * cB - z1 * sB;
                let z2 = vx * sB + z1 * cB;

                const z_depth = z2 + 4;
                if (z_depth <= 0) continue;

                const ooz = 1 / z_depth;
                const screenX = 0 | (screenWidth / 2 + K1 * ooz * x1 * 2);
                const screenY = 0 | (screenHeight / 2 + K1 * ooz * y1);

                const idx = screenX + screenWidth * screenY;

                if (screenX >= 0 && screenX < screenWidth && screenY >= 0 && screenY < screenHeight) {
                    if (ooz > z[idx]) {
                        z[idx] = ooz;
                        const depthLum = Math.max(0, Math.min(1, 1 - (z_depth / 8)));
                        const charIdx = Math.floor(depthLum * (chars.length - 1));
                        b[idx] = chars[config.invert ? chars.length - 1 - charIdx : charIdx];
                    }
                }
            }
        }
        // TORUS SHAPE RENDERING
        else if (config.shape === 'torus') {
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
                        const lumIndex = Math.max(0, Math.min(chars.length - 1, Math.floor(N > 0 ? N / 1.5 : 0)));
                        b[o] = chars[config.invert ? chars.length - 1 - lumIndex : lumIndex];
                    }
                }
            }
        }
        // CUBE SHAPE RENDERING
        else if (config.shape === 'cube') {
            const size = 1;
            const drawPoint = (cubeX: number, cubeY: number, cubeZ: number, nx: number, ny: number, nz: number) => {
                let y = cubeY * cA - cubeZ * sA;
                let z_coord = cubeY * sA + cubeZ * cA;
                let x = cubeX * cB - z_coord * sB;
                let z2 = cubeX * sB + z_coord * cB;
                const z_depth = z2 + 3;
                const ooz = 1 / z_depth;
                const screenX = 0 | (screenWidth / 2 + K1 * ooz * x * 2);
                const screenY = 0 | (screenHeight / 2 + K1 * ooz * y);
                const idx = screenX + screenWidth * screenY;
                let ny1 = ny * cA - nz * sA;
                let nz1 = ny * sA + nz * cA;
                let nx1 = nx * cB - nz1 * sB;
                let nz2 = nx * sB + nz1 * cB;
                const lx = 0, ly = 0, lz = -1;
                const dot = nx1 * lx + ny1 * ly + nz2 * lz;
                if (screenX >= 0 && screenX < screenWidth && screenY >= 0 && screenY < screenHeight) {
                    if (ooz > z[idx]) {
                        z[idx] = ooz;
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
        renderFrame();
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [config.shape, config.charSet, config.speed, config.scale, config.rotationX, config.rotationY, config.invert, autoPlay]);

    return (
        <div
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

export default AsciiSimulation;`,
        props: [
            { name: 'config', type: 'Partial<AsciiSimulationConfig>', default: '{}', description: 'Appearance configuration' },
            { name: 'autoPlay', type: 'boolean', default: 'true', description: 'Enable automatic rotation' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' },
        ]
    },
    {
        id: 'liquid-morph',
        name: 'Liquid Morph',
        index: 3,
        description: 'A soft, organic blob that subtly morphs and undulates like liquid metal. Features smooth gradients with iridescent reflections and interactive rippling.',
        tags: ['3d', 'interactive', 'fluid', 'webgl', 'organic', 'metal'],
        category: 'animation',
        previewConfig: {
            distort: 0.6,
            speed: 3,
        },
        dependencies: ['@react-three/fiber', '@react-three/drei', 'three'],
        usage: `import { LiquidMorph } from '@/components/ui';

// Basic usage
<LiquidMorph />

// Custom configuration
<LiquidMorph
    config={{
        color: '#ffffff',
        distort: 0.5,
        speed: 2,
        metalness: 0.9,
        roughness: 0.1,
        intensity: 1,
    }}
/>`,
        fullCode: `"use client";

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

        // Dark background
        ctx.fillStyle = '#050505'; 
        ctx.fillRect(0, 0, 1024, 1024);

        // Glowing Pattern
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ffffff';
        ctx.fillStyle = '#ffffff';
        
        // Horizontal lines only
        const lineCount = 60; 
        const spacing = 1024 / lineCount;
        
        for (let i = 0; i < lineCount; i++) {
            const y = i * spacing + spacing / 2;
            ctx.fillRect(0, y, 1024, 1);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);
        
        return texture;
    }, []);
}

function Blob({ config, autoRotate }: { config: LiquidMorphConfig; autoRotate: boolean }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<any>(null);
    const texture = useStripedPattern();

    useFrame((state) => {
        if (!meshRef.current || !materialRef.current) return;

        if (autoRotate) {
             meshRef.current.rotation.y += 0.005;
             meshRef.current.rotation.x += 0.002;
        }
    });

    return (
        <Float
            speed={2} // Animation speed
            rotationIntensity={1} // XYZ rotation intensity
            floatIntensity={2} // Up/down float intensity
        >
            <Sphere args={[config.radius, 64, 64]} ref={meshRef} scale={1.5}>
                <MeshDistortMaterial
                    ref={materialRef}
                    map={texture}
                    color={config.color}
                    envMapIntensity={0}
                    clearcoat={0}
                    clearcoatRoughness={0}
                    metalness={0.2}
                    roughness={0.2}
                    distort={config.distort}
                    speed={config.speed}
                />
            </Sphere>
        </Float>
    );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function LiquidMorph({
    config: userConfig,
    className = "",
    autoRotate = true
}: LiquidMorphProps) {
    const config = useMemo(() => ({ ...defaultConfig, ...userConfig }), [userConfig]);

    return (
        <div className={"w-full h-full relative " + className}>
            <Canvas
                camera={{ position: [0, 0, 4], fov: 45 }}
                dpr={[1, 2]}
                gl={{ antialias: true, alpha: true }}
            >
                 <ambientLight intensity={3} />
                
                <Center>
                    <Blob config={config} autoRotate={autoRotate} />
                </Center>


            </Canvas>
        </div>
    );
}

export default LiquidMorph;`,
        props: [
            { name: 'config', type: 'Partial<LiquidMorphConfig>', default: '{}', description: 'Appearance and behavior configuration' },
            { name: 'autoRotate', type: 'boolean', default: 'true', description: 'Enable subtle background rotation' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' },
        ]
    },
    {
        id: 'page-reveal',
        name: 'Page Reveal',
        index: 4,
        description: 'A dramatic full-page reveal animation featuring a logo with blur-to-reveal effect, followed by a staircase curtain animation that unveils the content beneath.',
        tags: ['animation', 'page-transition', 'reveal', 'loading', 'intro', 'curtain'],
        category: 'animation',
        previewConfig: {
            logoText: 'MORPHYS',
            splitCount: 8,
        },
        dependencies: ['framer-motion', 'react'],
        usage: `import { PageReveal } from '@/components/ui';

// Basic usage - wraps your page content
<PageReveal>
    <YourPageContent />
</PageReveal>

// With custom configuration
<PageReveal
    config={{
        logoText: 'BRAND',
        logoFontSize: 100,
        splitCount: { mobile: 5, tablet: 8, desktop: 12 },
        logoBlurDuration: 1,
        logoHoldDuration: 0.5,
        slitAnimationDuration: 0.8,
        slitStaggerDelay: 0.08,
        backgroundColor: '#000000',
        logoColor: '#ffffff',
    }}
    onComplete={() => console.log('Animation complete!')}
    autoStart={true}
>
    <YourPageContent />
</PageReveal>`,
        fullCode: `"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
}

// ============================================
// DEFAULT CONFIG
// ============================================

const defaultConfig: PageRevealConfig = {
    logoText: "MORPHYS",
    logoFontSize: 80,
    splitCount: {
        mobile: 5,
        tablet: 8,
        desktop: 12,
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
    const variants = {
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
                    fontSize: 'clamp(32px, 10vw, ' + fontSize + 'px)',
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
    const completedCount = useRef(0);

    const handleSlitComplete = useCallback(() => {
        completedCount.current += 1;
        if (completedCount.current >= splitCount && onComplete) {
            onComplete();
        }
    }, [splitCount, onComplete]);

    useEffect(() => {
        if (isAnimating) {
            completedCount.current = 0;
        }
    }, [isAnimating]);

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
                        width: (100 / splitCount) + '%',
                        backgroundColor,
                    }}
                    initial={{ y: 0 }}
                    animate={isAnimating ? { y: '-100%' } : { y: 0 }}
                    transition={{
                        duration,
                        delay,
                        ease: [0.65, 0, 0.35, 1],
                    }}
                    onAnimationComplete={() => {
                        if (isAnimating && index === splitCount - 1) {
                            setTimeout(handleSlitComplete, 50);
                        }
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
}: PageRevealProps) {
    const config = useMemo(() => ({ ...defaultConfig, ...userConfig }), [userConfig]);
    
    const [phase, setPhase] = useState<'logo-enter' | 'logo-hold' | 'logo-exit' | 'curtain' | 'complete'>(
        autoStart ? 'logo-enter' : 'complete'
    );
    const [splitCount, setSplitCount] = useState(config.splitCount.desktop);
    const [isOverlayVisible, setIsOverlayVisible] = useState(autoStart);

    useEffect(() => {
        const updateSplitCount = () => {
            setSplitCount(getSplitCount(window.innerWidth, config));
        };
        
        updateSplitCount();
        window.addEventListener('resize', updateSplitCount);
        return () => window.removeEventListener('resize', updateSplitCount);
    }, [config]);

    useEffect(() => {
        if (isPreview) return;
        
        if (phase === 'logo-enter') {
            const timer = setTimeout(() => {
                setPhase('logo-hold');
            }, config.logoBlurDuration * 1000);
            return () => clearTimeout(timer);
        }
        
        if (phase === 'logo-hold') {
            const timer = setTimeout(() => {
                setPhase('logo-exit');
            }, config.logoHoldDuration * 1000);
            return () => clearTimeout(timer);
        }
    }, [phase, config.logoBlurDuration, config.logoHoldDuration, isPreview]);

    const handleLogoExitComplete = useCallback(() => {
        if (!isPreview) {
            setPhase('curtain');
        }
    }, [isPreview]);

    const handleCurtainComplete = useCallback(() => {
        if (!isPreview) {
            setPhase('complete');
            setIsOverlayVisible(false);
            if (onComplete) {
                onComplete();
            }
        }
    }, [onComplete, isPreview]);

    const getLogoPhase = (): 'entering' | 'visible' | 'exiting' | 'hidden' => {
        if (isPreview) return 'visible';
        
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

    const extendedConfig = config as typeof config & { logoBlurExit?: number };

    return (
        <div className={"relative w-full h-full " + className}>
            <div className="relative w-full h-full">
                {children}
            </div>

            <AnimatePresence>
                {(isOverlayVisible || isPreview) && (
                    <motion.div
                        className="fixed inset-0 z-[9999]"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <SplitOverlay
                            splitCount={splitCount}
                            backgroundColor={config.backgroundColor}
                            isAnimating={phase === 'curtain'}
                            duration={config.slitAnimationDuration}
                            staggerDelay={config.slitStaggerDelay}
                            onComplete={handleCurtainComplete}
                        />

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

export default PageReveal;`,
        props: [
            { name: 'config', type: 'Partial<PageRevealConfig>', default: '{}', description: 'Configuration object for animation timing and appearance' },
            { name: 'onComplete', type: '() => void', default: 'undefined', description: 'Callback fired when the reveal animation completes' },
            { name: 'autoStart', type: 'boolean', default: 'true', description: 'Whether to start the animation automatically on mount' },
            { name: 'children', type: 'React.ReactNode', default: 'undefined', description: 'Content to reveal after animation completes' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes for the container' },
            { name: 'isPreview', type: 'boolean', default: 'false', description: 'Enable preview mode for demonstration purposes' },
        ]
    },
    {
        id: 'navbar-menu',
        name: 'Glass Navbar Menu',
        index: 5,
        description: 'A sleek, floating navigation pill with glassmorphism effects. Features a smooth, spring-animated dropdown menu that expands seamlessly from the navbar container.',
        tags: ['navigation', 'menu', 'glassmorphism', 'animation', 'ui'],
        category: 'interaction',
        previewConfig: {},
        dependencies: ['framer-motion', 'react', 'lucide-react'],
        usage: `import { NavbarMenu } from '@/components/ui';

// Usage
<NavbarMenu />`,
        fullCode: `"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function NavbarMenuPreview() {
    return (
        <div className="w-full h-full flex items-center justify-center relative bg-black/5">
            <NavbarMenu />
        </div>
    );
}

export function NavbarMenu() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative flex flex-col items-center">
            {/* Navbar Container */}
            <motion.div 
                layout
                className="w-[320px] h-[64px] glass-navbar flex items-center justify-between px-6 relative z-50 rounded-[32px]"
                initial={false}
            >
                {/* Logo */}
                <div className="flex items-center">
                    {/* Using a simple text logo with italic style to simulate movement/speed */}
                    <span className="font-heading font-black italic text-xl tracking-wider text-white">
                        RUN
                    </span>
                </div>

                {/* Menu Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-xs font-bold tracking-widest text-white hover:text-white/70 transition-colors uppercase"
                >
                    {isOpen ? "CLOSE" : "MENU"}
                </button>
            </motion.div>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, height: 0, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 8, height: "auto", filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -20, height: 0, filter: "blur(10px)" }}
                        transition={{ 
                            duration: 0.4, 
                            type: "spring", 
                            bounce: 0,
                            ease: [0.23, 1, 0.32, 1] 
                        }}
                        className="w-[320px] glass-navbar overflow-hidden flex flex-col relative z-40 mt-0 rounded-[32px]"
                    >
                         {/* Menu Items */}
                         <div className="flex flex-col items-center gap-2 py-8 w-full">
                            {["HOME", "REGISTER", "TRAINING", "ABOUT"].map((item, i) => (
                                <motion.a
                                    key={item}
                                    href="#"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{ delay: i * 0.05 + 0.1, duration: 0.3 }}
                                    className="text-red-500 hover:text-white font-heading font-black text-3xl tracking-tighter transition-colors uppercase"
                                >
                                    {item}
                                </motion.a>
                            ))}
                         </div>
                         
                         {/* Footer Strip */}
                         <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="w-full bg-white/5 border-t border-white/5 py-3 px-6 flex justify-between items-center text-[10px] text-white/40 font-mono uppercase"
                         >
                            <span className="cursor-pointer hover:text-white transition-colors">Privacy Policy</span>
                            <span className="cursor-pointer hover:text-white transition-colors">Terms of Use</span>
                         </motion.div>

                         {/* Language Toggle/Extra */}
                         <div className="w-full grid grid-cols-4 divide-x divide-white/5 border-t border-white/5">
                            {['EN', 'ES', 'KR', 'CN'].map((lang) => (
                                <button key={lang} className="py-2 text-[10px] font-bold text-white/40 hover:text-red-500 hover:bg-white/5 transition-colors">
                                    {lang}
                                </button>
                            ))}
                         </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}`,
        props: []
    },
    // More components will be added here
    {
        id: 'spotlight-search',
        name: 'Spotlight Search',
        index: 6,
        description: 'A macOS Tahoe-inspired spotlight search that morphs from a bar into a segmented action menu with fluid animations and glassmorphism.',
        tags: ['search', 'interaction', 'morph', 'glassmorphism', 'animation'],
        category: 'interaction',
        previewConfig: {},
        dependencies: ['framer-motion', 'lucide-react'],
        usage: `import { SpotlightSearch } from '@/components/ui';

// Basic usage
<SpotlightSearch />`,
        fullCode: `'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, AppWindow, Folder, Layers, File, Command } from 'lucide-react';

export default function SpotlightSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMorphed, setIsMorphed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (inputRef.current) inputRef.current.focus();
      const timer = setTimeout(() => {
        setIsMorphed(true);
      }, 800); // 800ms delay before morphing
      return () => clearTimeout(timer);
    } else {
      setIsMorphed(false);
    }
  }, [isOpen]);

  const toggleSearch = () => setIsOpen(!isOpen);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
  };

  const actionButtons = [
    { icon: AppWindow, label: "Apps" },
    { icon: Folder, label: "Finder" },
    { icon: Layers, label: "Stack" },
    { icon: File, label: "Files" },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-black overflow-hidden font-sans">
      
      {/* Background decoration to show glass effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl mix-blend-multiply deep-blend" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl mix-blend-multiply deep-blend" />
      </div>

      <div className="z-10 flex flex-col items-center gap-8">
        <h1 className="text-4xl font-light tracking-tight text-gray-800 dark:text-gray-100">
          Tahoe Spotlight
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Click the button below to trigger the experience
        </p>
      </div>

      {/* Main Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
              className="relative z-10 flex items-center"
              style={{ height: '64px' }}
            >
              {/* Search Bar Input Area */}
              <motion.div
                layout
                className={\`
                  relative flex items-center h-full overflow-hidden
                  bg-white/40 dark:bg-black/40 
                  backdrop-blur-xl border border-white/40 dark:border-white/10
                  shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]
                \`}
                animate={{
                  width: isMorphed ? 380 : 600,
                  borderRadius: 32,
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                  mass: 0.8
                }}
              >
                <div className="pl-6 pr-4 text-gray-500 dark:text-gray-400">
                  <Search size={24} strokeWidth={2} />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Spotlight Search"
                  className="w-full h-full bg-transparent border-none outline-none text-xl text-gray-800 dark:text-white placeholder-gray-500/70 dark:placeholder-gray-400/70"
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
                      <span className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-md border border-white/20">
                         <Command size={14} /> K
                      </span>
                    </motion.div>
                  )}
                 </AnimatePresence>
              </motion.div>

              {/* Action Buttons (Morphing out) */}
              <div className="flex items-center gap-3 ml-3 h-full">
                <AnimatePresence mode='popLayout'>
                  {isMorphed && actionButtons.map((btn, index) => (
                    <motion.button
                      key={btn.label}
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
                        w-16 h-16 rounded-full flex items-center justify-center
                        bg-white/40 dark:bg-black/40 
                        backdrop-blur-xl border border-white/40 dark:border-white/10
                        shadow-lg text-gray-700 dark:text-gray-200
                        hover:bg-white/60 dark:hover:bg-white/20
                      \`}
                    >
                      <btn.icon size={24} strokeWidth={2} />
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Trigger Button at Bottom */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40">
        <motion.button
          onClick={toggleSearch}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="
            flex items-center gap-3 px-6 py-3 rounded-full
            bg-white/30 dark:bg-black/30 backdrop-blur-md
            border border-white/40 dark:border-white/10
            shadow-lg hover:shadow-xl transition-all
            text-gray-800 dark:text-white font-medium
          "
        >
          <Search size={20} />
          <span>Open Spotlight</span>
        </motion.button>
      </div>

    </div>
  );
}`,
        props: []
    },
    {
        id: 'image-trail-cursor',
        name: 'Image Trail',
        index: 7,
        description: 'A smooth, dynamic cursor trail effect that disperses style images as you move. Adds a layer of depth and artistic flair to mouse interactions.',
        tags: ['cursor', 'trail', 'interaction', 'image', 'effect'],
        category: 'effect',
        previewConfig: {
            size: 150,
            rotation: true,
            fadeDuration: 0.6
        },
        dependencies: ['framer-motion', 'react'],
        usage: `import { ImageTrailCursor } from '@/components/ui';

// Basic usage
<ImageTrailCursor />

// Custom configuration
<ImageTrailCursor
    config={{
        size: 150,
        rotation: true,
        fadeDuration: 0.6,
        distanceThreshold: 40
    }}
/>`,
        fullCode: `"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ImageTrailCursorConfig {
    size: number;
    rotation: boolean;
    fadeDuration: number;
    distanceThreshold: number;
}

export interface ImageTrailCursorProps {
    config?: Partial<ImageTrailCursorConfig>;
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

export default function ImageTrailCursor({ config: userConfig }: ImageTrailCursorProps = {}) {
    // Merge provided config with defaults
    const config = { ...defaultConfig, ...userConfig };

    const [trail, setTrail] = useState<TrailPoint[]>([]);
    const lastPoint = useRef<{ x: number, y: number } | null>(null);
    const pointId = useRef(0);
    const imageIndex = useRef(0);

    useEffect(() => {
        const handleMove = (x: number, y: number) => {
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

                // Use functional update to ensure we have latest state if needed, 
                // though usually for trails we just append.
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

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('touchmove', onTouchMove);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('touchmove', onTouchMove);
        };
    }, [config.distanceThreshold, config.rotation]);

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
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
}"`,
        props: [
            { name: 'config', type: 'Partial<ImageTrailCursorConfig>', default: '{}', description: 'Appearance configuration' },
        ]
    },
    {
        id: 'reality-lens',
        name: 'Liquid Reveal',
        index: 8,
        description: 'A liquid-like brush that paints revealing strokes over content. The persistent liquid trail lingers before evaporating, allowing for artistic and organic reveal effects.',
        tags: ['interaction', 'liquid', 'reveal', 'brush', 'cursor'],
        category: 'interaction',
        previewConfig: {
            lensSize: 120,
        },
        dependencies: ['framer-motion', 'react'],
        usage: `import { RealityLens } from '@/components/ui';

// Basic usage
<RealityLens
  revealContent={<img src="/after.jpg" className="w-full h-full object-cover" />}
>
  <img src="/before.jpg" className="w-full h-full object-cover grayscale" />
</RealityLens>

// Custom lens size
<RealityLens lensSize={250} revealContent={...}>
  {...}
</RealityLens>`,
        fullCode: `"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, useSpring } from "framer-motion";

interface RealityLensProps {
  /** The base content visible by default */
  children: React.ReactNode;
  /** The content to reveal inside the lens */
  revealContent: React.ReactNode;
  /** Size of the lens in pixels. Default: 150 */
  lensSize?: number;
  /** Custom class for the container */
  className?: string;
  /** Optional: Magnification scale for the revealed content. Default: 1 (no zoom) */
  zoomScale?: number;
}

export function RealityLens({
  children,
  revealContent,
  lensSize = 150,
  className = "",
  zoomScale = 1,
}: RealityLensProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  // Use spring physics for smooth lens movement
  const mouseX = useSpring(0, { stiffness: 300, damping: 30 });
  const mouseY = useSpring(0, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
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

    mouseX.set(x);
    mouseY.set(y);
  };

  return (
    <div
      ref={containerRef}
      className={\`relative overflow-hidden w-full h-full cursor-none selection:bg-none \${className}\`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
      onTouchMove={handleMouseMove}
      onTouchStart={() => setIsHovering(true)}
      onTouchEnd={() => setIsHovering(false)}
    >
      {/* Base Layer */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        {children}
      </div>

      {/* Reveal Layer (Masked) */}
      <motion.div
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          maskImage: "radial-gradient(circle at var(--x) var(--y), black var(--size), transparent var(--size))",
          WebkitMaskImage: "radial-gradient(circle at var(--x) var(--y), black var(--size), transparent var(--size))",
          // @ts-ignore
          "--x": mouseX,
          "--y": mouseY,
          "--size": \`\${lensSize / 2}px\`,
        }}
      >
        {revealContent}
      </motion.div>

      {/* Lens Border / UI Element */}
      {isHovering && (
        <motion.div
            style={{
                x: mouseX,
                y: mouseY,
                width: lensSize,
                height: lensSize,
                left: -lensSize / 2,
                top: -lensSize / 2,
            }}
            className="absolute pointer-events-none rounded-full border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.2)] backdrop-blur-[1px]"
        />
      )}
    </div>
  );
}`,
        props: [
            { name: 'children', type: 'ReactNode', default: 'undefined', description: 'Base visible content' },
            { name: 'revealContent', type: 'ReactNode', default: 'undefined', description: 'Content shown inside the lens' },
            { name: 'lensSize', type: 'number', default: '150', description: 'Diameter of the lens in pixels' },
        ]
    },
    {
        id: 'navbar-menu-2',
        name: 'Navbar Menu 2',
        index: 22,
        description: 'A premium expanding navbar that smoothly transitions from a floating capsule to a full-screen menu. Features high-performance layout animations.',
        tags: ['navbar', 'menu', 'animation', 'layout', 'overlay'],
        category: 'layout',
        previewConfig: {},
        dependencies: ['framer-motion', 'react'],
        usage: `import { NavbarMenu2 } from '@/components/ui';

// Basic usage
<NavbarMenu2 />

// Custom configuration
<NavbarMenu2
    config={{
        logoText: "Brand",
        backgroundColor: "#ffffff",
        textColor: "#000000"
    }}
/>`,
        fullCode: `"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================
// PREVIEW COMPONENT (For Component Card)
// ============================================

export function NavbarMenu2Preview() {
    return (
        <div className="w-full h-full flex items-center justify-center p-4 bg-gray-50/50">
            {/* Navbar representation */}
            <div className="w-[180px] h-10 bg-white rounded-full flex items-center justify-between px-4 shadow-sm border border-black/5">
                <span className="font-serif italic font-black text-xs text-black">Offsite</span>
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
    logoText: "Offsite",
    backgroundColor: "#ffffff",
    textColor: "#000000",
};

// ============================================
// MAIN COMPONENT
// ============================================

export function NavbarMenu2({ config: userConfig }: NavbarMenu2Props = {}) {
    const config = { ...defaultConfig, ...userConfig };
    const [isOpen, setIsOpen] = useState(false);

    // Toggle menu state
    const toggleMenu = () => setIsOpen(!isOpen);

    // Animation transition - "smooth AF"
    // Using a slightly lower stiffness/damping ratio for a buttery smooth feel
    const transition = {
        type: "spring",
        stiffness: 100,
        damping: 20,
        mass: 1,
    };

    const staggerTransition = {
        staggerChildren: 0.1,
        delayChildren: 0.2, // Wait for expand a bit
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 50, rotateX: 20 },
        show: {
            opacity: 1,
            y: 0,
            rotateX: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 20
            }
        }
    };

    return (
        <div className="w-full h-full flex items-center justify-center relative z-50">
            <motion.div
                layout
                data-isOpen={isOpen}
                initial={false}
                transition={transition}
                className={\`
                    shadow-lg overflow-hidden z-50
                    \${isOpen ? 'fixed inset-0 m-0 w-full h-full rounded-none' : 'relative w-[280px] h-[60px] rounded-full'}
                \`}
                style={{
                    backgroundColor: config.backgroundColor,
                    color: config.textColor,
                    boxShadow: isOpen
                        ? 'none'
                        : '0px 10px 30px -10px rgba(0,0,0,0.1), 0px 4px 10px -2px rgba(0,0,0,0.05)'
                }}
            >
                {/* Navbar Header Content */}
                <motion.div
                    layout="position"
                    className="absolute top-0 left-0 w-full px-6 md:px-8 h-[60px] md:h-[80px] flex items-center justify-between z-50"
                >
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <motion.span
                            layout="position"
                            className="font-serif italic font-black text-2xl tracking-tight z-50 cursor-pointer"
                        >
                            {config.logoText}
                        </motion.span>
                    </div>

                    {/* Menu Trigger / Close Button */}
                    <motion.button
                        layout="position"
                        onClick={toggleMenu}
                        className="relative z-50 p-2 mix-blend-difference focus:outline-none"
                    >
                        <div className="flex flex-col gap-[6px] items-end justify-center w-8 h-8">
                            <motion.span
                                animate={isOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                                className="w-8 h-[2px] bg-black block origin-center"
                                style={{ backgroundColor: config.textColor }}
                            />
                            <motion.span
                                animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
                                className="w-8 h-[2px] bg-black block"
                                style={{ backgroundColor: config.textColor }}
                            />
                            <motion.span
                                animate={isOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                                className="w-8 h-[2px] bg-black block origin-center"
                                style={{ backgroundColor: config.textColor }}
                            />
                        </div>
                    </motion.button>
                </motion.div>

                {/* Expanded Menu Content */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial="hidden"
                            animate="show"
                            exit="hidden"
                            variants={staggerTransition}
                            className="w-full h-full flex flex-col justify-center items-center relative z-40 p-10"
                        >
                            {/* Main Links */}
                            <div className="flex flex-col items-center justify-center gap-4 md:gap-8">
                                {['SERVICES', 'ABOUT', 'ROLES', 'CONTACT'].map((item, i) => (
                                    <div key={item} className="overflow-hidden relative group cursor-pointer">
                                        <motion.div
                                            variants={itemVariants}
                                            className="relative"
                                        >
                                            <span className="block text-5xl md:text-8xl lg:text-9xl font-serif font-medium tracking-tight hover:italic transition-all duration-300">
                                                {item}
                                            </span>
                                            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-current transition-all duration-300 group-hover:w-full" />
                                        </motion.div>
                                        
                                        <motion.span 
                                            variants={itemVariants}
                                            className="absolute -top-2 -right-4 text-xs font-mono opacity-50 hidden md:block"
                                        >
                                            0{i + 1}
                                        </motion.span>
                                    </div>
                                ))}
                            </div>

                            {/* Footer Info inside Menu */}
                            <motion.div
                                variants={itemVariants}
                                className="absolute bottom-10 left-0 w-full px-10 flex flex-col md:flex-row justify-between items-end text-sm font-mono opacity-60"
                            >
                                <div className="max-w-xs">
                                    <p>This is the room. These are the people. We are Offsite.</p>
                                </div>
                                <div className="flex gap-8 mt-4 md:mt-0">
                                    <a href="#" className="hover:underline">INSTAGRAM</a>
                                    <a href="#" className="hover:underline">LINKEDIN</a>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}

export default NavbarMenu2;`,
        props: [
            { name: 'config', type: 'Partial<NavbarMenu2Config>', default: '{}', description: 'Configuration object' }
        ]
    },
    {
        id: 'scroll-to-reveal',
        name: 'Scroll To Reveal',
        index: 23,
        description: 'Text that lights up as you scroll, highlighting words in the center of the scroll container. Works within any scrollable element.',
        tags: ['text', 'scroll', 'animation', 'reveal', 'spotlight'],
        category: 'animation',
        previewConfig: {
            text: "AT OFFSITE, WE ARE INVESTING IN THE FUTURE OF DESIGN & CREATIVE TALENT BY PUTTING COMMUNITY FIRST.",
            minOpacity: 0.15
        },
        dependencies: ['framer-motion', 'react'],
        usage: `import { ScrollToReveal, ScrollToRevealSandbox } from '@/components/ui';

// For page-level scroll (uses window scroll)
<ScrollToReveal
    text="Your long text here..."
    className="text-4xl font-bold"
    minOpacity={0.15}
/>

// For container-based scroll (self-contained sandbox)
<ScrollToRevealSandbox
    text="Your long text here..."
    className="text-4xl font-bold"
    minOpacity={0.15}
/>`,
        fullCode: `"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import React, { useRef, createContext, useContext } from "react";
import { cn } from "@/lib/utils";

// Context for container-based scrolling
const ScrollContainerContext = createContext<React.RefObject<HTMLDivElement | null> | null>(null);

interface ScrollToRevealProps {
    text: string;
    className?: string;
    minOpacity?: number;
}

const Word = ({
    children,
    minOpacity = 0.3
}: {
    children: string;
    minOpacity?: number;
}) => {
    const ref = useRef<HTMLSpanElement>(null);
    const containerRef = useContext(ScrollContainerContext);

    const { scrollYProgress } = useScroll({
        target: ref,
        container: containerRef || undefined,
        offset: ["start 0.9", "end 0.25"],
    });

    const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [minOpacity, 1, minOpacity]);

    return (
        <motion.span ref={ref} style={{ opacity }} className="mr-2 inline-block">
            {children}
        </motion.span>
    );
};

// Page-level scroll version
export const ScrollToReveal: React.FC<ScrollToRevealProps> = ({ text, className, minOpacity = 0.15 }) => {
    const words = text.split(" ");
    return (
        <div className={cn("flex flex-wrap leading-[1.5]", className)}>
            {words.map((word, i) => <Word key={i} minOpacity={minOpacity}>{word}</Word>)}
        </div>
    );
};

// Container-based scroll version (self-contained sandbox)
export const ScrollToRevealSandbox: React.FC<ScrollToRevealProps> = ({ text, className, minOpacity = 0.15 }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const words = text.split(" ");
    return (
        <ScrollContainerContext.Provider value={containerRef}>
            <div ref={containerRef} className="w-full h-full overflow-y-auto overscroll-contain">
                <div className="h-[50vh]" />
                <div className={cn("px-4 md:px-16 flex flex-wrap leading-[1.3]", className)}>
                    {words.map((word, i) => <Word key={i} minOpacity={minOpacity}>{word}</Word>)}
                </div>
                <div className="h-[50vh]" />
            </div>
        </ScrollContainerContext.Provider>
    );
};

export default ScrollToReveal;`,
        props: [
            { name: 'text', type: 'string', default: 'undefined', description: 'The text content to reveal' },
            { name: 'className', type: 'string', default: 'undefined', description: 'Additional CSS classes for styling' },
            { name: 'minOpacity', type: 'number', default: '0.15', description: 'Opacity of words not in focus (0-1)' }
        ]
    }
];

// Get component by ID
export function getComponentById(id: string): ComponentData | undefined {
    return componentsData.find(c => c.id === id);
}

// Get components by category
export function getComponentsByCategory(category: ComponentData['category']): ComponentData[] {
    return componentsData.filter(c => c.category === category);
}

// Get components by tag
export function getComponentsByTag(tag: string): ComponentData[] {
    return componentsData.filter(c => c.tags.includes(tag));
}
