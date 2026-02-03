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
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
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
    return `rgb(${r}, ${g}, ${b})`;
};

const parseObj = (text: string, maxVertices = 10000): ObjMesh => {
    const vertices: number[] = [];
    const faces: number[] = [];
    const lines = text.split('\n');
    const step = Math.max(1, Math.floor(lines.length / (maxVertices * 2)));

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('v ')) {
            if (Math.random() > 0.5 && step > 1) continue;
            const parts = line.split(/\s+/);
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
                        color = `rgba(${rgb1.r}, ${rgb1.g}, ${rgb1.b}, ${brightness})`;
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
                        color = `hsl(${hue}, 70%, 60%)`;
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
        <div ref={containerRef} className={`w-full h-full relative overflow-hidden ${className}`}>
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
