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
        index: 9,
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
                <span className="font-logo italic font-black text-xs text-black">Offsite</span>
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
                            className="font-logo italic font-black text-2xl tracking-tight z-50 cursor-pointer"
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
                                            <span className="block text-5xl md:text-8xl lg:text-9xl font-logo font-medium tracking-tight hover:italic transition-all duration-300">
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
        index: 10,
        description: 'Text that lights up as you scroll, highlighting words in the center of the scroll container. Works within any scrollable element.',
        tags: ['text', 'scroll', 'animation', 'reveal', 'spotlight'],
        category: 'animation',
        previewConfig: {
            text: "Morphys is a curated collection of high-performance, aesthetically pleasing UI components designed to elevate your web applications. Built with React, Tailwind CSS, and Framer Motion, it offers seamless integration for developers seeking valid, modern design. Our library features a diverse range of animations, interactions, and layout utilities that are fully customizable and responsive.",
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
    },
    {
        id: 'diffuse-text',
        name: 'Diffuse Text',
        index: 11,
        description: 'A cinematic text effect that simulates diffuse light bleeding through a foggy atmosphere. Creates a soft, breathing glow with layered blurs for a premium, ethereal aesthetic.',
        tags: ['text', 'blur', 'glow', 'cinema', 'atmosphere', 'light'],
        category: 'effect',
        previewConfig: {
            text: 'BASS',
            blurLevel: 24,
            intensity: 1,
            color: '#ffffff',
            backgroundColor: '#7ca5b8'
        },
        dependencies: ['framer-motion', 'react'],
        usage: `import { DiffuseText } from '@/components/ui';

// Basic usage
<DiffuseText />

// Custom configuration
<DiffuseText 
    config={{
        text: 'ECHO',
        blurLevel: 20,
        intensity: 0.8,
        color: '#ffdd00'
    }}
/>`,
        fullCode: `"use client";

import React, { useEffect, useRef } from "react";
import { motion, useAnimation, useMotionValue, useTransform } from "framer-motion";
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
    backgroundColor: string;
}

export interface DiffuseTextProps {
    config?: Partial<DiffuseTextConfig>;
    className?: string;
}

// ============================================
// DEFAULT CONFIG
// ============================================

const defaultConfig: DiffuseTextConfig = {
    text: "BASS",
    subtextLeft: "Barcelona Arts Summer School",
    subtextRight: "by ESCAC / ESMUC / Institut del Teatre",
    blurLevel: 24,
    intensity: 1,
    color: "#ffffff",
    backgroundColor: "#7ca5b8", // Muted slate blue from image
};

// ============================================
// MAIN COMPONENT
// ============================================

export function DiffuseText({ config: userConfig, className }: DiffuseTextProps) {
    const config = { ...defaultConfig, ...userConfig };
    
    // Animation controls for the breathing effect
    const controls = useAnimation();

    useEffect(() => {
        controls.start({
            filter: [
                \`blur(\${config.blurLevel}px) brightness(\${1 + config.intensity * 0.2})\`,
                \`blur(\${config.blurLevel * 1.5}px) brightness(\${1 + config.intensity * 0.5})\`,
                \`blur(\${config.blurLevel}px) brightness(\${1 + config.intensity * 0.2})\`,
            ],
            transition: {
                duration: 4,
                ease: "easeInOut",
                repeat: Infinity,
            }
        });
    }, [config.blurLevel, config.intensity, controls]);

    return (
        <div 
            className={cn("relative w-full h-full overflow-hidden font-sans", className)}
            style={{ 
                background: \`linear-gradient(135deg, \${config.backgroundColor} 0%, #4a5568 100%)\` 
            }}
        >
            {/* Ambient Light Overlay */}
            <div className="absolute inset-0 bg-black/10 mix-blend-overlay pointer-events-none" />

            {/* Main Center Content */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                <div className="relative w-full text-center">
                    {/* Layer 1: Deep Atmosphere Glow (The "Aura") */}
                    <motion.h1 
                        className="text-[25vw] sm:text-[30vw] font-black leading-none tracking-tighter"
                        style={{ 
                            color: config.color,
                            opacity: 0.4 * config.intensity,
                            filter: \`blur(\${config.blurLevel * 2}px)\`,
                        }}
                        animate={{
                            opacity: [0.4 * config.intensity, 0.6 * config.intensity, 0.4 * config.intensity],
                            scale: [1, 1.05, 1],
                        }}
                        transition={{
                            duration: 5,
                            ease: "easeInOut",
                            repeat: Infinity,
                            repeatType: "reverse"
                        }}
                    >
                        {config.text}
                    </motion.h1>

                    {/* Layer 2: The Core Shape (Animated Breathing) */}
                    <motion.h1 
                        className="absolute top-0 left-0 right-0 text-[25vw] sm:text-[30vw] font-black leading-none tracking-tighter mix-blend-screen"
                        style={{ color: config.color }}
                        animate={controls}
                    >
                        {config.text}
                    </motion.h1>

                     {/* Layer 3: Subtle Definition (Optional tint for depth) */}
                     <h1 
                        className="absolute top-0 left-0 right-0 text-[25vw] sm:text-[30vw] font-black leading-none tracking-tighter opacity-10"
                        style={{ 
                            color: config.color,
                            filter: \`blur(\${config.blurLevel * 0.5}px)\`
                        }}
                    >
                        {config.text}
                    </h1>
                </div>
            </div>

            {/* Foreground UI Layer (Sharp) */}
            <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-12 z-10 pointer-events-none">
                {/* Top Row - empty for now or could have nav */}
                <div className="w-full flex justify-between" />
                
                {/* Bottom Row - Subtext */}
                <div className="w-full flex items-end justify-between text-[#fcd34d] text-xs md:text-sm font-medium tracking-wide opacity-90 mix-blend-hard-light">
                    <span className="max-w-[30%] text-left">
                        {config.subtextLeft}
                    </span>
                    <span className="max-w-[30%] text-right">
                        {config.subtextRight}
                    </span>
                </div>
            </div>

            {/* Simple Grain/Noise Overlay for Texture */}
            <div 
                className="absolute inset-0 opacity-[0.07] pointer-events-none mix-blend-overlay"
                style={{
                    backgroundImage: \`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")\`
                }}
            />
        </div>
    );
}

// ============================================
// PREVIEW COMPONENT
// ============================================

export function DiffuseTextPreview() {
    return (
        <div className="w-full h-full relative overflow-hidden bg-[#7ca5b8]">
            <div className="absolute inset-0 flex items-center justify-center">
                 <h1 
                    className="text-[80px] font-black tracking-tighter text-white/90 blur-xl scale-150 opacity-80"
                >
                    BASS
                </h1>
            </div>
             <div className="absolute bottom-4 left-4 text-[10px] text-[#fcd34d] font-medium opacity-80">
                Barcelona Arts...
            </div>
             <div className="absolute bottom-4 right-4 text-[10px] text-[#fcd34d] font-medium opacity-80">
                by ESCAC...
            </div>
        </div>
    );
}`,
        props: [
            { name: 'config', type: 'Partial<DiffuseTextConfig>', default: '{}', description: 'Configuration object' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' }
        ]
    },
    {
        id: 'diagonal-focus',
        name: 'Diagonal Focus',
        index: 12,
        description: 'A linear diagonal list that emphasizes the center item with a physics-based, non-locking scroll. Features progressive blur and grayscale effects for depth.',
        tags: ['layout', 'interaction', 'scroll', 'focus', '3d'],
        category: 'layout',
        previewConfig: {},
        dependencies: ['framer-motion', 'react'],
        usage: `import { DiagonalFocus } from '@/components/ui';

// Usage
<DiagonalFocus />`,
        fullCode: `"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform, PanInfo } from "framer-motion";

// Sample data
const cards = [
    { id: 1, image: "https://images.unsplash.com/photo-1535376472810-5d229c65da09?q=80&w=1000&auto=format&fit=crop", title: "Ethereal", category: "Abstract" },
    { id: 2, image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop", title: "Synthesis", category: "Digital" },
    { id: 3, image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop", title: "Momentum", category: "Motion" },
    { id: 4, image: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=1000&auto=format&fit=crop", title: "Spectrum", category: "Light" },
    { id: 5, image: "https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?q=80&w=1000&auto=format&fit=crop", title: "Flux", category: "Energy" },
    { id: 6, image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop", title: "Nebula", category: "Space" },
    { id: 7, image: "https://images.unsplash.com/photo-1614851099511-773084f6911d?q=80&w=1000&auto=format&fit=crop", title: "Eclipse", category: "Phenomenon" },
];

export function DiagonalFocusPreview() {
    return (
        <div className="w-full h-full bg-black relative overflow-hidden">
            <DiagonalFocus />
        </div>
    );
}

export function DiagonalFocus({ className = "" }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const [isDragging, setIsDragging] = useState(false);

    // Physics constants
    const ANGLE = -35; 
    const ANGLE_RAD = (ANGLE * Math.PI) / 180;

    const x = useMotionValue(0);
    const smoothX = useSpring(x, { stiffness: 150, damping: 30, mass: 1.2 });

    useEffect(() => {
        if (!containerRef.current) return;
        const resizeObserver = new ResizeObserver((entries) => {
            const entry = entries[0];
            setContainerSize({ 
                width: entry.contentRect.width, 
                height: entry.contentRect.height 
            });
        });
        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    const handleDrag = (_: any, info: PanInfo) => {
        const delta = info.delta.x * 1.5; 
        x.set(x.get() + delta);
    };

    const handleDragEnd = (_: any, info: PanInfo) => {
        setIsDragging(false);
        const velocity = info.velocity.x;
        const currentX = x.get();
        const predictedDistance = velocity * 0.4;
        x.set(currentX + predictedDistance);
    };

    const scrollToCard = (index: number) => {
        if (isDragging) return;
        const STEP = 280;
        const targetX = -index * STEP;
        x.set(targetX);
    };

    return (
        <div 
            ref={containerRef}
            className={\`w-full h-full flex items-center justify-center relative bg-transparent overflow-hidden \${className}\`}
            style={{ perspective: 1000, background: 'transparent' }}
        >
            <motion.div 
                className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing"
                onPan={handleDrag}
                onPanStart={() => setIsDragging(true)}
                onPanEnd={handleDragEnd}
                style={{ touchAction: "none" }}
            />
            <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
                {cards.map((card, index) => (
                    <Card 
                        key={card.id} 
                        item={card} 
                        index={index} 
                        parentX={smoothX} 
                        angle={ANGLE_RAD}
                        onSelect={() => scrollToCard(index)}
                    />
                ))}
            </div>
        </div>
    );
}

const Card = ({ item, index, parentX, angle, onSelect }: any) => {
    const STEP = 280;
    const position = useTransform(parentX, (latest: number) => latest + (index * STEP));
    const distanceFromCenter = useTransform(position, (pos: number) => Math.abs(pos));
    
    const grayscale = useTransform(distanceFromCenter, [0, 200], ["0%", "100%"]);
    const blur = useTransform(distanceFromCenter, [0, 500], ["0px", "6px"]);
    const scale = useTransform(distanceFromCenter, [0, 300], [1.1, 0.85]);
    const x = useTransform(position, (pos: number) => pos * Math.cos(angle));
    const y = useTransform(position, (pos: number) => pos * Math.sin(angle));
    const zIndex = useTransform(distanceFromCenter, (d) => 1000 - Math.round(d));

    return (
        <motion.div
            className="absolute rounded-2xl overflow-hidden shadow-2xl cursor-pointer pointer-events-auto"
            style={{
                width: 300,
                height: 420,
                x,
                y,
                scale,
                filter: useTransform([grayscale, blur], ([g, b]) => \`grayscale(\${g}) blur(\${b})\`),
                zIndex,
            }}
            onClick={onSelect}
            whileHover={{ scale: 1.15, transition: { duration: 0.2 } }}
        >
            <motion.img 
                src={item.image} 
                alt={item.title}
                className="w-full h-full object-cover"
                draggable={false}
            />
        </motion.div>
    );
};`,
        props: [
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' }
        ]
    },
    {
        id: 'notification-stack',
        name: 'Stack Carousel',
        index: 13,
        description: 'A vertical carousel inspired by iOS notifications with a visual twist. Large image cards emerge from a depth stack at the bottom and curve gracefully at the top, creating a wheel-like fluid scrolling experience.',
        tags: ['layout', 'carousel', 'stack', 'scroll', 'ios', '3d', 'wheel'],
        category: 'layout',
        previewConfig: {},
        dependencies: ['framer-motion', 'react'],
        usage: `import { NotificationStack } from '@/components/ui';

// Usage
<NotificationStack />`,
        fullCode: `"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform, useSpring, PanInfo, AnimatePresence } from "framer-motion";

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
        title: "Ether", 
        description: "Atmospheric data visualization", 
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop",
        color: "#8b5cf6" 
    },
    { 
        id: 2, 
        title: "Synth", 
        description: "Modular sound synthesis", 
        image: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=1000&auto=format&fit=crop",
        color: "#10b981" 
    },
    { 
        id: 3, 
        title: "Nexus", 
        description: "Connected node systems", 
        image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop",
        color: "#3b82f6" 
    },
    { 
        id: 4, 
        title: "Void", 
        description: "Empty space rendering", 
        image: "https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?q=80&w=1000&auto=format&fit=crop",
        color: "#f59e0b" 
    },
    { 
        id: 5, 
        title: "Pulse", 
        description: "Rhythmic signal processing", 
        image: "https://images.unsplash.com/photo-1506259091721-347f798196d4?q=80&w=1000&auto=format&fit=crop",
        color: "#ef4444" 
    },
    { 
        id: 6, 
        title: "Zenith", 
        description: "Peak performance metrics", 
        image: "https://images.unsplash.com/photo-1535376472810-5d229c65da09?q=80&w=1000&auto=format&fit=crop",
        color: "#ec4899" 
    },
];

export function NotificationStackPreview() {
    return (
        <div className="w-full h-full bg-neutral-950 flex items-center justify-center overflow-hidden relative">
            {/* Background ambiance */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
            <NotificationStack />
        </div>
    );
}

export function NotificationStack({ className = "" }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [cards] = useState<NotificationCard[]>(defaultCards);
    
    // Vertical drag/scroll value
    const dragY = useMotionValue(0);
    // Smooth spring physics for the scroll
    const y = useSpring(dragY, { stiffness: 200, damping: 20, mass: 0.5 });
    
    const handleDrag = (_: any, info: PanInfo) => {
        const load = dragY.get() + info.delta.y;
        dragY.set(load);
    };

    return (
        <div 
            ref={containerRef}
            className={\`w-full h-full flex items-center justify-center relative overflow-hidden \${className}\`}
            style={{ perspective: 1000 }}
        >
            {/* Scroll/Drag Surface */}
            <motion.div 
                className="absolute inset-0 z-50 cursor-grab active:cursor-grabbing"
                onPan={handleDrag}
                style={{ touchAction: "none" }}
            />

            <div className="relative w-full max-w-md h-[80vh] flex flex-col justify-end items-center pb-10 perspective-1000">
                {cards.map((card, index) => (
                    <StackCard 
                        key={card.id} 
                        card={card} 
                        index={index} 
                        total={cards.length}
                        y={y} 
                    />
                ))}
            </div>
            
             {/* Helper Text */}
             <div className="absolute bottom-6 right-6 text-white/20 text-xs font-mono select-none pointer-events-none z-0">
                DRAG TO SCROLL
            </div>
        </div>
    );
}

function StackCard({ card, index, total, y }: { card: NotificationCard, index: number, total: number, y: any }) {
    const GAP = 250; 
    const baseOffset = index * GAP;
    
    const displayY = useTransform(y, (currentY: number) => baseOffset + currentY);

    const posTransform = useTransform(displayY, (val: number) => {
        const BOTTOM_THRESHOLD = 0;
        const TOP_THRESHOLD = 600;
        
        if (val < BOTTOM_THRESHOLD) {
             return val * 0.15;
        } else if (val > TOP_THRESHOLD) {
             const diff = val - TOP_THRESHOLD;
             return TOP_THRESHOLD + (diff * 0.15);
        } else {
             return val;
        }
    });
    
    const scale = useTransform(posTransform, (val: number) => {
        const BOTTOM_THRESHOLD = 0;
        const TOP_THRESHOLD = 600;
        
        if (val < BOTTOM_THRESHOLD) {
             const depth = Math.abs(val);
             return Math.max(0.7, 1 - (depth * 0.003));
        } else if (val > TOP_THRESHOLD) {
             const depth = val - TOP_THRESHOLD;
             return Math.max(0.7, 1 - (depth * 0.003));
        }
        return 1;
    });
    
    const rotateX = useTransform(posTransform, (val: number) => {
        const BOTTOM_THRESHOLD = 0;
        const TOP_THRESHOLD = 600;
        
        if (val < BOTTOM_THRESHOLD) {
            const depth = Math.abs(val);
            return Math.min(45, depth * 0.2); 
        } else if (val > TOP_THRESHOLD) {
            const depth = val - TOP_THRESHOLD;
            return Math.max(-45, -depth * 0.2);
        }
        return 0;
    });
    
    const opacity = useTransform(posTransform, (val: number) => {
        if (val < -100 || val > 700) return 0.6;
        return 1;
    });

    const blur = useTransform(posTransform, (val: number) => {
         if (val < 0) return \`blur(\${Math.abs(val) * 0.05}px)\`;
         if (val > 600) return \`blur(\${(val - 600) * 0.05}px)\`;
         return "blur(0px)";
    });

    const zIndex = useTransform(posTransform, (val: number) => {
        const distFromCenter = Math.abs(val - 300); 
        return 1000 - Math.round(distFromCenter);
    });

    return (
        <motion.div
            style={{
                bottom: posTransform,
                scale,
                opacity,
                filter: blur,
                zIndex,
                rotateX,
                transformPerspective: 1000,
                transformOrigin: "center center",
                position: "absolute",
            }}
            className="w-full flex justify-center"
        >
            <div className="
                w-full max-w-[90%] md:max-w-[600px] h-[400px] rounded-[30px] 
                overflow-hidden shadow-2xl
                relative group
                cursor-pointer
            ">
                <div className="absolute inset-0 bg-neutral-900">
                    <img 
                        src={card.image} 
                        alt={card.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-2">
                    <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md bg-white/10 border border-white/20 text-white mb-2"
                        style={{ boxShadow: \`0 0 20px \${card.color}40\` }}
                    >
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: card.color }} />
                    </div>
                    
                    <div>
                        <h3 className="text-2xl font-bold text-white tracking-tight">{card.title}</h3>
                        <p className="text-white/60 text-sm font-medium">{card.description}</p>
                    </div>
                </div>
                
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                     <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </div>
            </div>
        </motion.div>
    );
}

export default NotificationStack;`,
        props: []
    },
    {
        id: 'text-pressure',
        name: 'Text Pressure',
        index: 14,
        description: 'A typographic component where text weight reacts dynamically to cursor proximity, creating a "pressure" or "force" effect using the Big Shoulders Display variable font.',
        tags: ['text', 'interactive', 'variable-font', 'animation', 'typography', 'cursor'],
        category: 'interaction',
        previewConfig: {
            text: 'MORPHYS',
            minFontSize: 36,
        },
        dependencies: ['react'],
        usage: `import { TextPressure } from '@/components/ui';

// Basic usage
<TextPressure text="MORPHYS" />

// With custom configuration
<TextPressure
    text="MORPHYS"
    textColor="var(--foreground)"
    minFontSize={48}
    weight={true}
    alpha={false}
/>`,
        fullCode: `"use client";

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

export default TextPressure;`,
        props: [
            { name: 'text', type: 'string', default: 'MORPHYS', description: 'The text to display' },
            { name: 'fontFamily', type: 'string', default: 'Big Shoulders Display', description: 'Variable font family to use (must support wght axis)' },
            { name: 'weight', type: 'boolean', default: 'true', description: 'Animate font weight based on cursor proximity' },
            { name: 'alpha', type: 'boolean', default: 'false', description: 'Animate opacity based on cursor distance' },
            { name: 'textColor', type: 'string', default: 'var(--foreground)', description: 'Color of the text' },
            { name: 'minFontSize', type: 'number', default: '36', description: 'Minimum font size in pixels' },
        ]
    },
    {
        id: 'fluid-height',
        name: 'Fluid Height',
        index: 15,
        description: 'A text interaction where letters fluidly grow in height (YTUC axis) and react to hover by retracting. Uses Roboto Flex variable font features for smooth impact.',
        tags: ['text', 'animation', 'variable-font', 'interaction'],
        category: 'interaction',
        previewConfig: {},
        dependencies: ['framer-motion', 'react'],
        usage: `import { FluidHeight } from '@/components/ui';

// Basic usage
<FluidHeight />`,
        fullCode: `"use client";

import React, { useState, useEffect } from 'react';
import { motion, useAnimation, AnimationControls } from 'framer-motion';

const FluidHeight: React.FC = () => {
  const [hasGrown, setHasGrown] = useState(false);
  const [impactTrigger, setImpactTrigger] = useState(false);

  // Configuration
  const text = "MORPHYS";
  const minHeight = 528; // YTUC min
  const maxHeight = 760; // YTUC max
  const duration = 0.8; 
  const delay = 0.5;

  const containerControls = useAnimation();

  useEffect(() => {
    const sequence = async () => {
      // 1. Entrance handled by initial props
      
      // 2. Wait for blur to clear
      await new Promise(r => setTimeout(r, delay * 1000 + 500));

      // 3. Trigger Growth Phase
      setHasGrown(true);

      // 4. Wait for growth to finish (approx duration)
      await new Promise(r => setTimeout(r, duration * 1000));

      // 5. Trigger Impact
      setImpactTrigger(true);
      setTimeout(() => setImpactTrigger(false), 300);
    };

    sequence();
  }, [containerControls]);

  return (
    <div className="relative w-full h-full bg-[#111] flex flex-col items-center justify-center overflow-hidden font-sans text-white">
      {/* Import Roboto Flex with all necessary axes */}
      <style>
        {\`
          @import url('https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wdth,wght,YTLC,YTUC@8..144,25..151,100..1000,416..570,528..760&display=swap');
          
          .fluid-font {
            font-family: 'Roboto Flex', sans-serif;
            font-variation-settings: 'wdth' 151, 'wght' 200;
          }
        \`}
      </style>

      <motion.div
        animate={impactTrigger ? { y: [0, 15, -10, 5, 0] } : { y: 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="relative z-10 flex items-start"
      >
        {text.split('').map((char, index) => (
          <Letter 
            key={index} 
            char={char} 
            hasGrown={hasGrown}
            minHeight={minHeight} 
            maxHeight={maxHeight} 
            duration={duration}
          />
        ))}
      </motion.div>

      <div className="absolute bottom-8 left-0 right-0 text-center text-neutral-600 text-xs tracking-[0.2em] font-light uppercase opacity-60">
        Hover to retract
      </div>
    </div>
  );
};

interface LetterProps {
  char: string;
  hasGrown: boolean;
  minHeight: number;
  maxHeight: number;
  duration: number;
}

const Letter: React.FC<LetterProps> = ({ char, hasGrown, minHeight, maxHeight, duration }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Determine current target height based on state
  // If not grown yet: minHeight
  // If grown and not hovered: maxHeight
  // If grown and hovered: minHeight
  const targetHeight = !hasGrown ? minHeight : (isHovered ? minHeight : maxHeight);

  // Transition settings
  // If hovering: snappy
  // If growing initially: smooth and slow
  const currentDuration = isHovered ? 0.3 : duration;
  const currentEase = isHovered ? "circOut" : "easeInOut";

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
        ease: "easeOut" 
      }}
      className="fluid-font text-[8rem] md:text-[10rem] leading-[0.8] cursor-pointer select-none origin-top flex justify-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.span
        animate={{
          fontVariationSettings: \`"wdth" 151, "wght" 200, "YTUC" \${targetHeight}\`
        }}
        transition={{
          duration: currentDuration,
          ease: currentEase
        }}
        style={{
             display: "block",
             willChange: "font-variation-settings"
        }}
      >
        {char}
      </motion.span>
    </motion.div>
  );
};

export default FluidHeight;`,
        props: []
    },
    {
        id: 'text-mirror',
        name: 'Text Mirror',
        index: 16,
        description: 'A dynamic text effect that creates a trail of mirrored copies tracking cursor movement. Features idle detection to automatically hide the effect when inactive.',
        tags: ['text', 'mirror', 'trail', 'interactive', 'animation'],
        category: 'effect',
        previewConfig: {
            text: 'MORPHYS',
        },
        dependencies: ['framer-motion', 'react'],
        usage: `import { TextMirror } from '@/components/ui';

// Basic usage
<TextMirror />

// Custom configuration
<TextMirror
    text="MORPHYS"
    config={{
        idleTimeout: 3000,
        spread: 40,
        color: '#ff0000',
        fontSize: 150
    }}
/>`,
        fullCode: `"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";

interface TextMirrorProps {
    text?: string;
    className?: string;
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
    config = {},
}) => {
    const {
        idleTimeout = 2000,
        spread = 30,
        color = "#ffffff",
        fontSize = 120,
    } = config;

    const [isIdle, setIsIdle] = useState(true);
    const idleTimer = useRef<NodeJS.Timeout | null>(null);

    // Mouse position
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth mouse for the main element
    const smoothX = useSpring(mouseX, { stiffness: 300, damping: 30 });
    const smoothY = useSpring(mouseY, { stiffness: 300, damping: 30 });

    // Velocity tracking for direction
    const velocityX = useMotionValue(0);
    const velocityY = useMotionValue(0);

    // Previous position to calculate delta
    const prevX = useRef(0);
    const prevY = useRef(0);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            // Clear existing timer
            if (idleTimer.current) {
                clearTimeout(idleTimer.current);
            }

            // Calculate delta/velocity
            const dx = e.clientX - prevX.current;
            const dy = e.clientY - prevY.current;

            velocityX.set(dx);
            velocityY.set(dy);

            prevX.current = e.clientX;
            prevY.current = e.clientY;

            // Update state to active
            setIsIdle(false);

            // Set new idle timer
            idleTimer.current = setTimeout(() => {
                setIsIdle(true);
                // Reset velocity when idle
                velocityX.set(0); 
                velocityY.set(0);
            }, idleTimeout);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            if (idleTimer.current) clearTimeout(idleTimer.current);
        };
    }, [idleTimeout, velocityX, velocityY]);

    // Generate clones
    const cloneCount = 6;
    const clones = Array.from({ length: cloneCount });

    return (
        <div className={\`relative flex items-center justify-center w-full h-full bg-black overflow-hidden \${className}\`}>
            <div className="relative" style={{ perspective: "1000px" }}>
                {clones.map((_, i) => {
                    // Calculate lag/offset for each clone
                    // We want the clones to 'trail' or 'mirror' the movement.
                    // If we move right (positive dx), we might want clones to shift left.
                    const reverseIndex = cloneCount - i; // 6, 5, 4...

                    // Use transforms based on velocity
                    // We limit the offset so it doesn't fly off screen
                    const x = useTransform(velocityX, (v) => {
                        if (isIdle) return 0;
                        // Dampen the velocity and multiply by index for spread
                        const val = -v * (i + 1) * 0.5;
                        // Clamp for safety
                        return Math.max(Math.min(val, 100), -100);
                    });

                    const y = useTransform(velocityY, (v) => {
                        if (isIdle) return 0;
                        const val = -v * (i + 1) * 0.5;
                        return Math.max(Math.min(val, 100), -100);
                    });

                    // Spring the values for smoothness
                    const springX = useSpring(x, { stiffness: 150, damping: 15 });
                    const springY = useSpring(y, { stiffness: 150, damping: 15 });

                    // Opacity fades for further clones
                    const opacity = 1 - (i / cloneCount) * 0.8;

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
                                    fontSize: \`\${fontSize}px\`,
                                    fontWeight: 900,
                                    color: "transparent",
                                    WebkitTextStroke: \`1px \${color}\`, // Outline effect
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
                            fontSize: \`\${fontSize}px\`,
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
            <div className="absolute bottom-10 text-white/50 text-sm font-light tracking-widest">
                MOVE CURSOR To ACTIVATE • IDLES IN 2S
            </div>
        </div>
    );
};

export default TextMirror;`,
        props: [
            { name: 'text', type: 'string', default: "'MORPHYS'", description: 'The text to display' },
            { name: 'config', type: 'object', default: '{}', description: 'Configuration options for timeout, spread, color, etc.' },
        ]
    },
    {
        id: 'step-morph',
        name: 'Step Morph',
        index: 17,
        description: 'A stepped text layout where letters expand fluidly on hover, growing from their unique step positions to fill the vertical space. Uses Big Shoulders Display.',
        tags: ['text', 'animation', 'stepped', 'interaction', 'variable-font'],
        category: 'interaction',
        previewConfig: {
            text: 'MORPHYS',
            stepSize: 40
        },
        dependencies: ['framer-motion', 'react'],
        usage: `import { StepMorph } from '@/components/ui';

// Basic usage
<StepMorph />`,
        fullCode: `"use client";

import React, { useState, useEffect } from "react";
import { motion, useSpring } from "framer-motion";

interface StepMorphProps {
    text?: string;
    className?: string;
    stepSize?: number; // Y offset per letter in pixels (or relative units if implemented differently)
}

const StepMorph: React.FC<StepMorphProps> = ({
    text = "MORPHYS",
    className = "",
    stepSize = 40,
}) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <div className={\`relative w-full h-full bg-[#111] flex items-center justify-center overflow-hidden font-sans \${className}\`}>
            {/* Import Big Shoulders Display */}
            <style>{\`
            @import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@100..900&display=swap');
            .step-morph-font {
                font-family: 'Big Shoulders Display', sans-serif;
                font-weight: 800;
            }
        \`}</style>

            <div className="relative flex items-start justify-center h-[60vh] w-full">
                {text.split("").map((char, index) => (
                    <Letter
                        key={index}
                        char={char}
                        index={index}
                        total={text.length}
                        stepSize={stepSize}
                        hoveredIndex={hoveredIndex}
                        setHoveredIndex={setHoveredIndex}
                    />
                ))}
            </div>

            <div className="absolute bottom-8 left-0 right-0 text-center text-neutral-600 text-xs tracking-[0.2em] font-light uppercase opacity-60">
                Hover to expand
            </div>
        </div>
    );
};

interface LetterProps {
    char: string;
    index: number;
    total: number;
    stepSize: number;
    hoveredIndex: number | null;
    setHoveredIndex: (index: number | null) => void;
}

const Letter: React.FC<LetterProps> = ({
    char,
    index,
    total,
    stepSize,
    hoveredIndex,
    setHoveredIndex,
}) => {
    // Config
    const baseHeight = 1; // scale 1
    const maxHeight = 3.5; // expansion factor
    const neighborRange = 2; // letters affected

    // Calculate Target Scale
    let targetScale = baseHeight;

    if (hoveredIndex !== null) {
        const distance = Math.abs(hoveredIndex - index);
        if (distance === 0) {
            targetScale = maxHeight;
        } else if (distance <= neighborRange) {
            // Smooth falloff
            const progress = 1 - (distance / (neighborRange + 1));
            targetScale = baseHeight + (maxHeight - baseHeight) * Math.pow(progress, 2); // quadratic falloff
        }
    }

    // Determine Transform Origin
    // M (0) -> Top (0%)
    // S (last) -> Bottom (100%)
    // Middle -> Center (50%)
    const originY = (index / (total - 1)) * 100;

    // Spring physics
    const scaleY = useSpring(baseHeight, {
        stiffness: 200,
        damping: 25,
        mass: 0.5
    });

    useEffect(() => {
        scaleY.set(targetScale);
    }, [targetScale, scaleY]);

    // Determine vertical offset (step alignment)
    const yOffset = index * stepSize;

    return (
        <div
            className="relative flex flex-col items-center justify-start h-full mx-[-0.05em]"
            style={{
                marginTop: \`\${yOffset}px\`,
                height: '300px',
            }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
        >
            <motion.span
                className="step-morph-font text-[6rem] md:text-[9rem] uppercase leading-none text-white block cursor-pointer select-none"
                style={{
                    scaleY,
                    transformOrigin: \`50% \${originY}%\`,
                    willChange: "transform",
                }}
            >
                {char}
            </motion.span>
        </div>
    );
};

export default StepMorph;`,
        props: [
            { name: 'text', type: 'string', default: 'MORPHYS', description: 'The text to display' },
            { name: 'stepSize', type: 'number', default: '40', description: 'Vertical offset per letter' },
        ]
    },
    {
        id: 'center-menu',
        name: 'Center Menu',
        index: 18,
        description: 'A floating navbar with a dot-triggered menu that expands seamlessly from the trigger button.',
        tags: ['menu', 'navbar', 'interaction', 'floating', 'framer-motion'],
        category: 'interaction',
        previewConfig: {},
        dependencies: ['framer-motion', 'react'],
        usage: `import { CenterMenu } from '@/components/ui/CenterMenu';

// Usage
<CenterMenu />`,
        fullCode: `"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, ArrowUpRight } from "lucide-react";

export const CenterMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined" && document.documentElement.classList.contains('dark')) {
            setIsDarkMode(true);
        }
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

    return (
        <div className={\`w-full min-h-[600px] flex flex-col items-center pt-10 overflow-hidden \${isDarkMode ? "dark" : ""}\`}>
            {/* 
                Top-Center Container.
                Gap separates the Logo Capsule from the Trigger Button.
            */}
            <div className="relative flex items-start gap-4 z-50 font-sans">
                
                {/* 1. Logo Pill */}
                <motion.div
                    layout
                    className="flex items-center justify-center px-8 bg-[#fafafa] dark:bg-[#1f1f1f] shadow-lg border border-white/20 dark:border-white/5"
                    style={{
                        height: 64,
                        borderRadius: 32,
                    }}
                >
                    <span className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white cursor-default">
                        Morphys
                    </span>
                </motion.div>

                {/* 2. Trigger Button / Expanding Menu */}
                {/*Wrapper has fixed dimensions to prevent layout shift when menu expands.
                   The Logo will stay perfectly centered relative to this fixed anchor. */}
                <div className="relative w-[64px] h-[64px]">
                    <motion.div
                        layout
                        className="absolute top-0 left-0 bg-[#fafafa] dark:bg-[#1f1f1f] shadow-lg border border-white/20 dark:border-white/5 overflow-hidden z-50"
                        initial={false}
                        animate={{
                            width: isOpen ? 340 : 64,
                            height: isOpen ? 420 : 64,
                            borderRadius: isOpen ? 24 : 32,
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                        }}
                    >
                        {/* The Trigger Button - Always at top-left of the expanding box */}
                        <button 
                            className="absolute top-0 left-0 z-20 flex items-center justify-center focus:outline-none"
                            style={{ width: 64, height: 64 }}
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            <motion.div
                                animate={{ scale: isOpen ? 0 : 1, opacity: isOpen ? 0 : 1 }}
                                className="w-3 h-3 rounded-full bg-neutral-900 dark:bg-white"
                            />
                            {/* Close State Dot / Icon */}
                            <motion.div 
                                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                animate={{ scale: isOpen ? 1 : 0, opacity: isOpen ? 1 : 0 }}
                                initial={{ scale: 0, opacity: 0 }}
                            >
                                <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
                                     <div className="w-2 h-2 rounded-full bg-neutral-900 dark:bg-white" />
                                </div>
                            </motion.div>
                        </button>

                        {/* Expanded Menu Content */}
                        <AnimatePresence>
                            {isOpen && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex flex-col w-full h-full p-8 pt-20"
                                >
                                    {/* Main Navigation */}
                                    <nav className="flex flex-col gap-2">
                                        {menuItems.map((item, idx) => (
                                            <motion.a
                                                key={item.label}
                                                href={item.href}
                                                className="group flex items-center justify-between text-3xl font-semibold text-neutral-900 dark:text-white"
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
                                                    <ArrowUpRight className="w-6 h-6 text-neutral-400 dark:text-neutral-500" />
                                                </motion.span>
                                            </motion.a>
                                        ))}
                                    </nav>
                                    
                                    {/* Footer: Socials & Theme */}
                                    <div className="mt-auto pt-8 flex items-end justify-between border-t border-neutral-200 dark:border-neutral-800">
                                        <div className="flex flex-col gap-2">
                                            {socialLinks.map((social, idx) => (
                                                <motion.a
                                                    key={social.label}
                                                    href={social.href}
                                                    className="text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
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
                                            onClick={toggleTheme}
                                            className="group relative w-12 h-12 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.4 }}
                                        >
                                           <div className="relative">
                                               {isDarkMode ? (
                                                   <Sun className="w-5 h-5 text-white" />
                                               ) : (
                                                   <Moon className="w-5 h-5 text-neutral-900" />
                                               )}
                                           </div>
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};`,
        props: []
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
        fullCode: `"use client";

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
                            stdDeviation="2" // Higher blur for smoother displacement map
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

export default GlassSurge;`,
        props: [
            { name: 'text', type: 'string', default: "'MORPHYS'", description: 'Text to display (optional if children provided)' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' },
            { name: 'children', type: 'ReactNode', default: 'undefined', description: 'Content to apply the refraction effect to' },
        ]
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
        fullCode: `"use client";

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

DirectorLink.displayName = "DirectorLink";`,
        props: [
            { name: 'className', type: 'string', default: "'h-screen'", description: 'Additional CSS classes for height/styling' },
            { name: 'config', type: 'object', default: '{}', description: 'Configuration object with title, accentColor, and textColor' },
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
