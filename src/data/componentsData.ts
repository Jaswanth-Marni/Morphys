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
        fullCode: `"use client";

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

export default FrostedGlass;`
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

// Responsive configuration
<TextReveal
    text="MORPHYS"
    delay={0.5}
    className="text-[3rem] md:text-6xl font-bold tracking-tighter"
/>`,
        fullCode: `import React from 'react';
import { motion } from 'framer-motion';

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

    const [animationKey, setAnimationKey] = React.useState(0);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setAnimationKey(prev => prev + 1);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const letterVariants = {
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
                                    variants={letterVariants}
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

export default TextReveal;`,
        props: [
            { name: 'text', type: 'string', default: "'Text Reveal Animation'", description: 'Text to display' },
            { name: 'delay', type: 'number', default: '0', description: 'Delay before animation starts' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' },
        ]
    },
    {
        id: 'crt-glitch',
        name: 'CRT Glitch',
        index: 28,
        description: 'A realistic CRT TV and VHS glitch effect with static noise, scan lines, RGB chromatic aberration, and random glitch distortions. Perfect for retro aesthetics, error states, or attention-grabbing transitions.',
        tags: ['glitch', 'crt', 'vhs', 'retro', 'noise', 'distortion', 'effect'],
        category: 'effect',
        previewConfig: {
            text: 'GLITCH',
            noiseIntensity: 0.15,
            glitchFrequency: 0.3
        },
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
        fullCode: `"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CRTGlitchConfig {
    text?: string;
    children?: React.ReactNode;
    noiseIntensity?: number;
    scanlineIntensity?: number;
    rgbShiftIntensity?: number;
    glitchFrequency?: number;
    flickerIntensity?: number;
    vhsTracking?: boolean;
    phosphorGlow?: boolean;
    curvedScreen?: boolean;
    colorTint?: 'green' | 'amber' | 'blue' | 'none';
    autoGlitch?: boolean;
    hoverTrigger?: boolean;
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

const defaultConfig = {
    noiseIntensity: 0.15,
    scanlineIntensity: 0.4,
    rgbShiftIntensity: 0.6,
    glitchFrequency: 0.3,
    flickerIntensity: 0.1,
    vhsTracking: true,
    phosphorGlow: true,
    curvedScreen: true,
    colorTint: 'none' as const,
    autoGlitch: true,
    hoverTrigger: true,
    fontSize: 80,
    fontFamily: "'Big Shoulders Display', sans-serif",
};

const NoiseCanvas = React.memo(({ intensity, width, height }: { intensity: number; width: number; height: number }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = width / 2;
        canvas.height = height / 2;
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        const data = imageData.data;
        
        const drawNoise = () => {
            for (let i = 0; i < data.length; i += 4) {
                const noise = Math.random() * 255;
                data[i] = noise; data[i + 1] = noise; data[i + 2] = noise; data[i + 3] = 255 * intensity;
            }
            ctx.putImageData(imageData, 0, 0);
            animationRef.current = requestAnimationFrame(drawNoise);
        };
        drawNoise();
        return () => cancelAnimationFrame(animationRef.current);
    }, [intensity, width, height]);
    
    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none mix-blend-overlay" style={{ imageRendering: 'pixelated' }} />;
});
NoiseCanvas.displayName = 'NoiseCanvas';

const ScanLines = React.memo(({ intensity }: { intensity: number }) => (
    <div className="absolute inset-0 pointer-events-none" style={{ background: \`repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, \${intensity * 0.5}) 2px, rgba(0, 0, 0, \${intensity * 0.5}) 4px)\`, zIndex: 10 }} />
));
ScanLines.displayName = 'ScanLines';

const RGBShiftLayer = React.memo(({ children, intensity, glitchActive }: { children: React.ReactNode; intensity: number; glitchActive: boolean }) => {
    const offset = glitchActive ? intensity * 8 : intensity * 2;
    return (
        <div className="relative">
            <div className="absolute inset-0" style={{ color: '#ff0000', mixBlendMode: 'screen', transform: \`translateX(\${-offset}px)\`, opacity: 0.8 }}>{children}</div>
            <div className="relative" style={{ color: '#00ff00', mixBlendMode: 'screen' }}>{children}</div>
            <div className="absolute inset-0" style={{ color: '#0000ff', mixBlendMode: 'screen', transform: \`translateX(\${offset}px)\`, opacity: 0.8 }}>{children}</div>
        </div>
    );
});
RGBShiftLayer.displayName = 'RGBShiftLayer';

export const CRTGlitch = ({ config = {}, className = "", containerClassName = "" }: { config?: Partial<CRTGlitchConfig>; className?: string; containerClassName?: string }) => {
    const mergedConfig = useMemo(() => ({ ...defaultConfig, ...config }), [config]);
    const { text = "MORPHYS", noiseIntensity, scanlineIntensity, rgbShiftIntensity, glitchFrequency, flickerIntensity, phosphorGlow, curvedScreen, colorTint, autoGlitch, hoverTrigger, fontSize, fontFamily } = { ...mergedConfig, ...config };
    
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const [isHovering, setIsHovering] = useState(false);
    const [glitchState, setGlitchState] = useState<GlitchState>({ active: false, xShift: 0, yShift: 0, rgbSplit: 0, slice: [] });
    const [flickerOpacity, setFlickerOpacity] = useState(1);
    const [isMobile, setIsMobile] = useState(false);
    
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
    
    const triggerGlitch = useCallback(() => {
        const slices = Array.from({ length: Math.floor(Math.random() * 5) + 2 }, () => ({ top: Math.random() * 80, height: Math.random() * 15 + 5, xOffset: (Math.random() - 0.5) * 60 }));
        setGlitchState({ active: true, xShift: (Math.random() - 0.5) * 20, yShift: (Math.random() - 0.5) * 10, rgbSplit: Math.random() * 10 + 5, slice: slices });
        setTimeout(() => setGlitchState({ active: false, xShift: 0, yShift: 0, rgbSplit: 0, slice: [] }), 150 + Math.random() * 200);
    }, []);
    
    useEffect(() => {
        if (!autoGlitch) return;
        const scheduleGlitch = () => setTimeout(() => { if (Math.random() < glitchFrequency) triggerGlitch(); scheduleGlitch(); }, 2000 / glitchFrequency + Math.random() * 3000);
        const timeout = scheduleGlitch();
        return () => clearTimeout(timeout);
    }, [autoGlitch, glitchFrequency, triggerGlitch]);
    
    useEffect(() => {
        if (flickerIntensity <= 0) return;
        const interval = setInterval(() => { if (Math.random() < 0.3) { setFlickerOpacity(1 - Math.random() * flickerIntensity); setTimeout(() => setFlickerOpacity(1), 50); } }, 100);
        return () => clearInterval(interval);
    }, [flickerIntensity]);
    
    useEffect(() => {
        if (hoverTrigger && isHovering) {
            const interval = setInterval(() => { if (Math.random() < 0.4) triggerGlitch(); }, 300);
            return () => clearInterval(interval);
        }
    }, [hoverTrigger, isHovering, triggerGlitch]);
    
    const tintColors = { green: 'rgba(0, 255, 100, 0.1)', amber: 'rgba(255, 176, 0, 0.1)', blue: 'rgba(100, 180, 255, 0.1)', none: 'transparent' };
    const effectiveFontSize = isMobile ? Math.min(fontSize, 48) : fontSize;
    
    const content = config.children || (
        <div className={\`font-black uppercase tracking-wider select-none \${className}\`} style={{ fontSize: \`\${effectiveFontSize}px\`, fontFamily, lineHeight: 1, textShadow: phosphorGlow ? '0 0 10px currentColor, 0 0 20px currentColor, 0 0 40px currentColor' : 'none' }}>{text}</div>
    );
    
    return (
        <div ref={containerRef} className={\`relative w-full h-full min-h-[300px] overflow-hidden flex items-center justify-center bg-black \${containerClassName}\`} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} style={{ borderRadius: curvedScreen ? '20px' : '0', boxShadow: curvedScreen ? 'inset 0 0 100px rgba(0,0,0,0.9), inset 0 0 50px rgba(0,0,0,0.5)' : 'none' }}>
            {curvedScreen && <div className="absolute inset-0 pointer-events-none rounded-[20px]" style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.8) 100%)', zIndex: 25 }} />}
            <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: tintColors[colorTint], zIndex: 20 }} />
            <NoiseCanvas intensity={noiseIntensity * (glitchState.active ? 2 : 1)} width={dimensions.width} height={dimensions.height} />
            <ScanLines intensity={scanlineIntensity} />
            <motion.div className="relative z-5 text-white" style={{ opacity: flickerOpacity }} animate={{ x: glitchState.xShift, y: glitchState.yShift }} transition={{ duration: 0.05, ease: 'linear' }}>
                <RGBShiftLayer intensity={rgbShiftIntensity} glitchActive={glitchState.active}>{content}</RGBShiftLayer>
            </motion.div>
            {phosphorGlow && <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.03) 0%, transparent 70%)', zIndex: 30 }} />}
        </div>
    );
};

export default CRTGlitch;`,
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
        ]
    },
    {
        id: 'flip-clock',
        name: 'Flip Clock',
        index: 29,
        description: 'A kinetic flip-dot style clock where numbers are formed by a grid of individually flipping pixels, creating a mechanical retro aesthetic. Features rounded matrix numbers and wave-based flip animations.',
        tags: ['clock', 'time', 'flip', 'kinetic', 'retro', 'matrix'],
        category: 'animation',
        previewConfig: {
            theme: 'dark'
        },
        dependencies: ['framer-motion', 'react'],
        usage: `import { FlipClock } from '@/components/ui';

// Basic usage
<FlipClock />`,
        fullCode: `"use client";

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
const FlipPixel = ({ active, x, y }: FlipPixelProps) => {
    return (
        <motion.div
            initial={false}
            animate={{ 
                rotateX: active ? 180 : 0,
                backgroundColor: active ? '#ffffff' : '#1a1a1a'
            }}
            transition={{
                duration: 0.6,
                type: 'spring',
                stiffness: 260,
                damping: 20,
                delay: (x + y) * 0.02 // Wave delay effect
            }}
            style={{
                width: '100%',
                height: '100%',
                borderRadius: '4px',
                position: 'relative',
                transformStyle: 'preserve-3d',
                boxShadow: '0 1px 3px rgba(0,0,0,0.5)'
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
};

// ============================================
// MAIN COMPONENT
// ============================================
export function FlipClock() {
    const [timeStr, setTimeStr] = useState("0000"); // HHMM

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const h = now.getHours().toString().padStart(2, '0');
            const m = now.getMinutes().toString().padStart(2, '0');
            setTimeStr(h + m);
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    // Grid Configuration
    // - Digits are 4x6
    // - Spacing between digits: 1
    // - Spacing between HH and MM: 2
    // - Layout: PADDING | H1 | s | H2 | ss | M1 | s | M2 | PADDING
    // - Cols: 2 + 4 + 1 + 4 + 2 + 4 + 1 + 4 + 2 = 24 cols
    // - Rows: 6 rows + 2 padding top + 2 padding bottom = 10 rows
    
    const rows = 10;
    const cols = 24;

    const grid = useMemo(() => {
        // Initialize empty grid
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

        const [h1, h2, m1, m2] = timeStr.split('');
        const startRow = 2; // Vertically centered

        insertDigit(h1, 2, startRow);       // First Hour Digit
        insertDigit(h2, 7, startRow);       // Second Hour Digit
        
        // Colon / Separator
        newGrid[startRow + 1][12] = 1;
        newGrid[startRow + 4][12] = 1;
        newGrid[startRow + 1][13] = 1;
        newGrid[startRow + 4][13] = 1;

        insertDigit(m1, 15, startRow);      // First Minute Digit
        insertDigit(m2, 20, startRow);      // Second Minute Digit

        return newGrid;
    }, [timeStr]);

    return (
        <div className="w-full h-full flex items-center justify-center bg-black p-4">
            <div 
                style={{
                    display: 'grid',
                    gridTemplateColumns: \\\`repeat(\\\${cols}, 1fr)\\\`,
                    gridTemplateRows: \\\`repeat(\\\${rows}, 1fr)\\\`,
                    gap: '6px', // Gap between flip cards
                    width: '100%',
                    aspectRatio: \\\`\\\${cols}/\\\${rows}\\\`
                }}
            >
                {grid.map((row, r) => (
                    row.map((isActive, c) => (
                        <FlipPixel 
                            key={\\\`\\\${r}-\\\${c}\\\`} 
                            active={isActive === 1} 
                            x={c} 
                            y={r} 
                        />
                    ))
                ))}
            </div>
        </div>
    );
}`,
        props: []
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
        fullCode: `"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Matter from "matter-js";
import { motion } from "framer-motion";
import { Loader2, RefreshCcw } from "lucide-react";

// ============================================
// TYPES
// ============================================

export interface GravityItem {
    id: string;
    type: 'text' | 'image' | 'video' | 'shape';
    content: string | React.ReactNode;
    className?: string;
    width?: number;
    height?: number;
    initialX?: number;
    initialY?: number;
    rotation?: number;
}

export interface GravityConfig {
    gravityStrength: number;
    gravityX: number;
    gravityY: number;
    wallBounciness: number; // 0-1
    itemBounciness: number; // 0-1
    friction: number;
    frictionAir: number;
    interaction: boolean;
    autoSpawnRate: number; // 0 = disabled
    debug: boolean;
}

export interface GravityProps {
    items?: GravityItem[];
    config?: Partial<GravityConfig>;
    className?: string;
    children?: React.ReactNode;
}

// ============================================
// DEFAULT DATA
// ============================================

const defaultItems: GravityItem[] = [
    { id: '1', type: 'text', content: 'Creativity', width: 200, height: 80, className: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-bold text-xl rounded-2xl flex items-center justify-center shadow-lg' },
    { id: '2', type: 'text', content: 'Physics', width: 160, height: 60, className: 'bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 text-foreground font-medium text-lg rounded-full flex items-center justify-center shadow-sm' },
    { id: '3', type: 'text', content: 'Interactive', width: 220, height: 120, className: 'bg-[#FF6B6B] text-white font-black text-3xl rounded-[2rem] flex items-center justify-center shadow-xl rotate-12' },
    { id: '4', type: 'text', content: 'Web', width: 100, height: 100, className: 'bg-blue-400 text-white font-bold text-lg rounded-full flex items-center justify-center shadow-md' },
    { id: '5', type: 'image', content: 'Design', width: 180, height: 240, className: 'bg-zinc-900 border border-zinc-800 text-zinc-400 p-6 rounded-xl flex flex-col gap-4 shadow-2xl' },
    { id: '6', type: 'shape', content: '', width: 80, height: 80, className: 'bg-yellow-400 rounded-lg transform rotate-45 shadow-lg border-4 border-yellow-200' },
    { id: '7', type: 'text', content: 'Drag Me', width: 140, height: 50, className: 'bg-black text-white rounded-full flex items-center justify-center font-mono text-sm border-2 border-white/20' },
];

const defaultConfig: GravityConfig = {
    gravityStrength: 1,
    gravityX: 0,
    gravityY: 1,
    wallBounciness: 0.8,
    itemBounciness: 0.6,
    friction: 0.05,
    frictionAir: 0.02,
    interaction: true,
    autoSpawnRate: 0,
    debug: false,
};

// ============================================
// GRAVITY COMPONENT
// ============================================

export function Gravity({
    items = defaultItems,
    config: userConfig,
    className = "",
    children
}: GravityProps) {
    const config = { ...defaultConfig, ...userConfig };

    // Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<any>(null); // Matter.js engine instance store
    const engineRef = useRef<Matter.Engine>(null);
    const renderRef = useRef<Matter.Render>(null);
    const runnerRef = useRef<any>(null);
    const bodiesMapRef = useRef<Map<string, Matter.Body>>(new Map());
    const elementsRef = useRef<Map<string, HTMLDivElement>>(new Map());
    const requestRef = useRef<number>();
    const constraintsRef = useRef<any>(null);

    const [isMounted, setIsMounted] = useState(false);
    const [renderIds, setRenderIds] = useState<string[]>([]);

    // Initialize Physics World
    useEffect(() => {
        if (!containerRef.current) return;

        // 1. Setup Matter.js
        const Engine = Matter.Engine,
            Render = Matter.Render,
            Runner = Matter.Runner,
            World = Matter.World,
            Bodies = Matter.Bodies,
            Mouse = Matter.Mouse,
            MouseConstraint = Matter.MouseConstraint,
            Composite = Matter.Composite;

        const engine = Engine.create();
        engineRef.current = engine;

        // Disable sleeping for interaction
        engine.enableSleeping = false;

        // Set Gravity
        engine.world.gravity.y = config.gravityY * config.gravityStrength;
        engine.world.gravity.x = config.gravityX * config.gravityStrength;

        // 2. Create Render (Optional, for debug/mouse interaction usually)
        // We use a transparent canvas for mouse events primarily
        const render = Render.create({
            element: containerRef.current,
            engine: engine,
            options: {
                width: containerRef.current.clientWidth,
                height: containerRef.current.clientHeight,
                background: 'transparent',
                wireframes: false, // We only show wireframes in debug mode
                showAngleIndicator: config.debug,
            }
        });

        // If not debug, we hide the canvas visually with code below or CSS opacity usually
        // But we need it for MouseConstraint
        render.canvas.style.position = 'absolute';
        render.canvas.style.top = '0';
        render.canvas.style.left = '0';
        render.canvas.style.pointerEvents = 'none'; // We'll handle custom events or let it pass through
        // Actually, for Matter.js MouseConstraint to work, the canvas needs pointer events.
        // But we want the DOM elements to be draggable.
        // Strategy: Use the canvas for physics mouse interaction, but set z-index higher?
        // OR: Map raw DOM events to physics bodies manually.

        // Let's use Matter.MouseConstraint with the canvas.
        // To make DOM elements clickable, we can't block them with the canvas.
        // So we won't use the canvas for input. We'll attach events to the container.

        renderRef.current = render;

        // 3. Create Walls
        const updateWalls = () => {
            if (!containerRef.current || !engine) return;
            const width = containerRef.current.clientWidth;
            const height = containerRef.current.clientHeight;
            const wallThickness = 100;

            const ground = Bodies.rectangle(width / 2, height + wallThickness / 2, width + 200, wallThickness, {
                isStatic: true,
                render: { visible: config.debug },
                friction: 0.1,
                restitution: config.wallBounciness
            });
            const leftWall = Bodies.rectangle(0 - wallThickness / 2, height / 2, wallThickness, height * 2, {
                isStatic: true,
                render: { visible: config.debug },
                friction: 0.1,
                restitution: config.wallBounciness
            });
            const rightWall = Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height * 2, {
                isStatic: true,
                render: { visible: config.debug },
                friction: 0.1,
                restitution: config.wallBounciness
            });
            // No ceiling usually, let them fly high

            // Remove old walls if resizing
            const bodies = Composite.allBodies(engine.world);
            bodies.forEach(b => {
                if (b.isStatic && (b.label === 'Wall')) World.remove(engine.world, b);
            });

            ground.label = 'Wall';
            leftWall.label = 'Wall';
            rightWall.label = 'Wall';

            World.add(engine.world, [ground, leftWall, rightWall]);
        };

        updateWalls();

        // 4. Runner
        const runner = Runner.create();
        runnerRef.current = runner;
        Runner.run(runner, engine);

        // 5. Render start (only if debug)
        if (config.debug) {
            Render.run(render);
        }

        // 6. Handle Interaction (Custom Mouse Controller)
        // We implement a custom mouse controller because we are syncing DOM elements.
        const mouse = Mouse.create(containerRef.current);
        const mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: config.debug
                }
            }
        });

        // We DO NOT add mouseConstraint to world yet, because it interferes with text selection if not careful.
        // Actually, for "Gravity" grab and throw, we want it.
        World.add(engine.world, mouseConstraint);

        // Fix scrolling issue with Matter.js blocking events
        // mouse.element.removeEventListener("mousewheel", mouse.mousewheel);
        // mouse.element.removeEventListener("DOMMouseScroll", mouse.mousewheel);

        setIsMounted(true);

        // Cleanup
        return () => {
            Render.stop(render);
            Runner.stop(runner);
            if (engineRef.current) Matter.Engine.clear(engineRef.current);
            if (render.canvas) render.canvas.remove();
        };
    }, []);

    // Handle Resize
    useEffect(() => {
        const handleResize = () => {
            if (!containerRef.current || !engineRef.current) return;
            // Recreate walls
            const width = containerRef.current.clientWidth;
            const height = containerRef.current.clientHeight;
            const World = Matter.World;
            const Bodies = Matter.Bodies;
            const Composite = Matter.Composite;

            // Remove old walls
            const bodies = Composite.allBodies(engineRef.current.world);
            bodies.forEach(b => {
                if (b.label === 'Wall') World.remove(engineRef.current.world, b);
            });

            const wallThickness = 100;
            const ground = Bodies.rectangle(width / 2, height + wallThickness / 2, width + 200, wallThickness, { isStatic: true, restitution: config.wallBounciness, label: 'Wall' });
            const leftWall = Bodies.rectangle(0 - wallThickness / 2, height / 2, wallThickness, height * 2, { isStatic: true, restitution: config.wallBounciness, label: 'Wall' });
            const rightWall = Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height * 2, { isStatic: true, restitution: config.wallBounciness, label: 'Wall' });

            World.add(engineRef.current.world, [ground, leftWall, rightWall]);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [config.wallBounciness]);

    // Update Bodies when items change
    useEffect(() => {
        if (!engineRef.current || !containerRef.current) return;

        const World = Matter.World;
        const Bodies = Matter.Bodies;
        const currentIds = new Set(items.map(i => i.id));

        // Remove bodies that are no longer in items
        items.forEach(item => {
            if (!bodiesMapRef.current.has(item.id)) {
                // Create new body
                const width = item.width || 100;
                const height = item.height || 100;

                // Random position if not specified
                const x = item.initialX ?? (Math.random() * (containerRef.current!.clientWidth - width) + width / 2);
                const y = item.initialY ?? (-height - Math.random() * 500); // Start above screen

                const body = Bodies.rectangle(x, y, width, height, {
                    angle: item.rotation ? item.rotation * (Math.PI / 180) : (Math.random() - 0.5) * 0.5,
                    restitution: config.itemBounciness,
                    friction: config.friction,
                    frictionAir: config.frictionAir,
                    label: item.id
                });

                World.add(engineRef.current!.world, body);
                bodiesMapRef.current.set(item.id, body);
            } else {
                // Update existing body properties if config changed
                // (Optional optimization: only if changed)
                const body = bodiesMapRef.current.get(item.id);
                if (body) {
                    body.restitution = config.itemBounciness;
                    body.friction = config.friction;
                    body.frictionAir = config.frictionAir;
                }
            }
        });

        // Remove old bodies
        bodiesMapRef.current.forEach((body, id) => {
            if (!currentIds.has(id)) {
                World.remove(engineRef.current!.world, body);
                bodiesMapRef.current.delete(id);
            }
        });

        setRenderIds(items.map(i => i.id));

    }, [items, config.itemBounciness, config.friction, config.frictionAir]);


    // Animation Loop
    useEffect(() => {
        const loop = () => {
            if (!engineRef.current) return;

            // Sync DOM elements to Physics Bodies
            bodiesMapRef.current.forEach((body, id) => {
                const element = elementsRef.current.get(id);
                if (element) {
                    const { x, y } = body.position;
                    // We translate from center (Matter.js) to top-left (DOM)
                    // But actually, we set transform origin to center in CSS probably
                    // Or we just translate.

                    // Optimization: use translate3d for GPU
                    element.style.transform = \`translate3d(\${x - (itemMap.get(id)?.width || 100)/2}px, \${y - (itemMap.get(id)?.height || 100)/2}px, 0) rotate(\${body.angle}rad)\`;
                    element.style.visibility = 'visible'; // Show after first frame to avoid jump
                }
            });
            
            requestRef.current = requestAnimationFrame(loop);
        };
        
        // Helper map for width/height in loop (avoid closure staleness)
        const itemMap = new Map(items.map(i => [i.id, i]));
        
        requestRef.current = requestAnimationFrame(loop);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [items]); // Re-bind loop if items change (to update map)
    
    // Add Element Ref Helper
    const addToRefs = (el: HTMLDivElement | null, id: string) => {
        if (el && !elementsRef.current.has(id)) {
            elementsRef.current.set(id, el);
        } else if (!el && elementsRef.current.has(id)) {
            elementsRef.current.delete(id);
        }
    };
    
    const resetGravity = () => {
        if (!engineRef.current || !containerRef.current) return;
        
        // Reposition all bodies to top
        bodiesMapRef.current.forEach((body) => {
             const x = Math.random() * (containerRef.current!.clientWidth - 100) + 50;
             const y = -Math.random() * 1000 - 100;
             
             Matter.Body.setPosition(body, { x, y });
             Matter.Body.setVelocity(body, { x: 0, y: 0 });
             Matter.Body.setAngularVelocity(body, 0);
        });
    };

    return (
        <div 
            className={\`relative w-full h-full overflow-hidden bg-zinc-50 dark:bg-zinc-950 \${className}\`} 
            ref={containerRef}
            style={{ touchAction: 'none' }} // Prevent scrolling on mobile while interacting
        >
            {/* Reset Button */}
            <button 
                onClick={resetGravity}
                className="absolute top-4 right-4 z-50 p-3 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-md shadow-lg hover:scale-110 transition-all active:scale-95 group border border-zinc-200 dark:border-zinc-800"
            >
                <RefreshCcw className="w-5 h-5 text-zinc-600 dark:text-zinc-300 group-hover:rotate-180 transition-transform duration-500" />
            </button>
            
            {/* Items */}
            {items.map((item) => (
                <div
                    key={item.id}
                    ref={(el) => addToRefs(el, item.id)}
                    className={\`absolute top-0 left-0 hover:z-50 cursor-grab active:cursor-grabbing \${item.className}\`}
                    style={{
                        width: item.width,
                        height: item.height,
                        visibility: 'hidden', // Hidden until physics kicks in
                        willChange: 'transform',
                        userSelect: 'none'
                    }}
                >
                    {item.content || item.id}
                </div>
            ))}
            
            {/* Helper Text */}
            <div className="absolute bottom-6 left-0 w-full text-center pointer-events-none opacity-40">
                <p className="text-sm font-medium font-mono text-zinc-500">GRAB & THROW</p>
            </div>
        </div>
    );
}

export default Gravity;`,
        props: [
            { name: 'items', type: 'GravityItem[]', default: 'defaultItems', description: 'Array of items to render as physics bodies' },
            { name: 'config', type: 'GravityConfig', default: '{}', description: 'Physics configuration' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' },
        ]
    },
    {
        id: 'pixel-simulation',
        name: 'Pixel Simulation',
        index: 31,
        description: 'A voxel-based 3D renderer that visualizes shapes using a grid of dynamic pixels. Features canvas-based rendering with customizable resolution, gap, and color modes.',
        tags: ['pixel', '3d', 'voxel', 'canvas', 'simulation', 'retro'],
        category: 'animation',
        previewConfig: {
            shape: 'torus',
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
        shape: 'torus',
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
        fullCode: `"use client";

import React, { useEffect, useRef, useState } from 'react';

// ============================================
// TYPES & INTERFACES
// ============================================

export type PixelShape = 'torus' | 'cube';

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
    shape: 'torus',
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
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
};

const lerpColor = (c1: {r:number, g:number, b:number}, c2: {r:number, g:number, b:number}, t: number) => {
    const r = Math.round(c1.r + (c2.r - c1.r) * t);
    const g = Math.round(c1.g + (c2.g - c1.g) * t);
    const b = Math.round(c1.b + (c2.b - c1.b) * t);
    return \`rgb(\${r}, \${g}, \${b})\`;
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
            A.current += 0.04 * (config.speed / 4);
            B.current += 0.02 * (config.speed / 4);
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
                    const pxX = col * cellSize + gap/2;
                    const pxY = row * cellSize + gap/2;
                    
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

                    drawPixel(x, y, 1/D, lum);
                }
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
                 coordIdx: 0|1|2, 
                 nx: number, ny: number, nz: number
             ) => {
                 for (let u = uMin; u <= uMax; u += step) {
                     for (let v = vMin; v <= vMax; v += step) {
                        let cx = 0, cy = 0, cz = 0;
                        // Map uv to coords
                        if(coordIdx === 0) { cx=fixedVal; cy=u; cz=v; }
                        else if(coordIdx === 1) { cx=u; cy=fixedVal; cz=v; }
                        else if(coordIdx === 2) { cx=u; cy=v; cz=fixedVal; }

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
    }, [config.shape, config.pixelSize, config.gap, config.speed, config.rotationX, config.rotationY, config.colorMode, config.color1, config.color2, autoPlay, dimensions]);

    return (
        <div ref={containerRef} className={\`w-full h-full relative overflow-hidden \${className}\`}>
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

export default PixelSimulation;`,
        props: [
            { name: 'config', type: 'Partial<PixelSimulationConfig>', default: '{}', description: 'Appearance and behavior configuration' },
            { name: 'autoPlay', type: 'boolean', default: 'true', description: 'Enable automatic rotation' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' },
        ]
    },
    {
        id: 'running-outline',
        name: 'Running Outline',
        index: 30, // Assuming a safe high index
        description: 'An animated outline text component where the stroke runs along the text path with random directions and synchronized timing.',
        tags: ['text', 'outline', 'animation', 'svg'],
        category: 'animation',
        previewConfig: {
            words: [{ text: "OUTLINE", font: "font-thunder" }],
            color: "var(--foreground)"
        },
        usage: `import { RunningOutline } from '@/components/ui';

// Basic usage
<RunningOutline />

// With custom configuration
<RunningOutline
    config={{
        words: [{ text: "MORPHYS", font: "font-thunder" }],
        color: "#ffffff",
        gap: 20
    }}
/>`,
        fullCode: `"use client";

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
            className="flex flex-wrap justify-center items-center select-none cursor-pointer"
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
        <div className="relative flex items-center justify-center">
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
                    x="-20%"
                    y="-20%"
                    width="140%"
                    height="140%"
                    fill="currentColor"
                    mask={\`url(#\${maskId})\`}
                />
            </svg>
        </div>
    );
}`,
        dependencies: ['framer-motion', 'react'],
        props: [
            { name: 'config', type: 'RunningOutlineConfig', default: '{}', description: 'Configuration object' },
            { name: 'containerClassName', type: 'string', default: "''", description: 'Additional CSS classes' }
        ]
    },
    {
        id: 'synthwave-lines',
        name: 'Synthwave Lines',
        index: 29,
        description: 'Interactive background lines with arrival impact, wave morphing, and elastic cursor physics. Features a dramatic arrival sequence and smooth elastic interaction.',
        tags: ['background', 'lines', 'physics', 'interactive', 'canvas', 'synthwave'],
        category: 'animation',
        previewConfig: {
            lineCount: 10,
            color: 'rgba(255, 255, 255, 0.8)'
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
        fullCode: `"use client";

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

    const CONF = {
        lineCount: config.lineCount || 10,
        color: config.color || 'rgba(255, 255, 255, 0.8)',
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

        window.addEventListener('mousemove', updateMouse);
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
                             const gaussian = Math.exp( - (distX * distX) / (2 * spread * spread) );
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
            window.removeEventListener('mousemove', updateMouse);
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

export default SynthwaveLines;`,
        props: [
            { name: 'config', type: 'Partial<SynthwaveLinesConfig>', default: '{}', description: 'Configuration object' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' }
        ]
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
        fullCode: `"use client";

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
        <h2 className="relative z-30 mix-blend-difference overflow-hidden text-4xl md:text-6xl font-kugile tracking-tighter text-zinc-100 transition-colors group-hover:text-zinc-400 leading-tight">
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
                        <span className="text-sm md:text-lg font-light text-zinc-400 group-hover:text-zinc-600 transition-colors relative z-30 mix-blend-difference">
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
}`,
        props: [
            { name: 'items', type: 'HoverImageListItem[]', default: 'defaultItems', description: 'Array of items with text and images' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' }
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
