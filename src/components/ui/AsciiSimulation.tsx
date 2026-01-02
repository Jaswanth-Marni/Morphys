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
    const lines = text.split('\n');
    const step = Math.max(1, Math.floor(lines.length / (maxVertices * 2)));

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('v ')) {
            // Parse vertex
            // Randomly skip some to decimate if we are just doing point cloud style for performance
            if (Math.random() > 0.5 && step > 1) continue;

            const parts = line.split(/\s+/);
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
    autoPlay = true
}: AsciiSimulationProps) {
    const config = { ...defaultConfig, ...userConfig };
    const containerRef = useRef<HTMLDivElement>(null);
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
                // Cap max resolution to prevent performance death on huge containers
                setDimensions({ width: Math.min(300, Math.max(20, w)), height: Math.min(150, Math.max(10, h)) });
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
    }, [config.fontSize]);

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
            output += (k % screenWidth === 0 && k !== 0) ? "\n" : b[k];
        }

        preRef.current.innerText = output;

        if (autoPlay) {
            animationRef.current = requestAnimationFrame(renderFrame);
        }
    };

    useEffect(() => {
        // Start LOOP
        renderFrame();
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [config.shape, config.charSet, config.speed, config.scale, config.rotationX, config.rotationY, config.invert, autoPlay]);

    return (
        <div
            ref={containerRef}
            className={`flex items-center justify-center w-full h-full overflow-hidden ${className}`}
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
                    fontSize: `${config.fontSize}px`,
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
    return (
        <AsciiSimulation
            config={{
                scale: 1.2,
                speed: 0.5,
                fontSize: 5,
                shape: 'car',
                color: 'var(--foreground)'
            }}
            autoPlay={true}
        />
    );
}

export default AsciiSimulation;
