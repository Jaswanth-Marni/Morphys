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
        `0 0 ${30 * intensity}px rgba(255,255,255,${intensity * 0.8}), 0 0 ${60 * intensity}px rgba(255,255,255,${intensity * 0.3})`
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
                elements += `<circle cx="${p.x}" cy="${p.y}" r="${currentRadius}" fill="white" />`;
            });

            // Render current cursor head (if active)
            if (isActive) {
                const headRadius = (lensSize / 2) * 0.45; // Base size (45%)
                elements += `<circle cx="${mousePos.current.x}" cy="${mousePos.current.y}" r="${headRadius}" fill="white" />`;
            }

            if (elements) {
                // The 'gooey' filter makes the separate circles blend into a single liquid shape
                const svg = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="${containerSize.width}" height="${containerSize.height}">
                        <defs>
                            <filter id="liquid-goo">
                                <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur"/>
                                <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo"/>
                                <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
                            </filter>
                        </defs>
                        <g filter="url(#liquid-goo)">
                            ${elements}
                        </g>
                    </svg>
                `;
                setSvgMask(`url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
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
            className={`relative overflow-hidden w-full h-full cursor-none selection:bg-none ${className}`}
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
