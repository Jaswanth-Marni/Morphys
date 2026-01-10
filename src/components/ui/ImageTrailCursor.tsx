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
    containerRef?: RefObject<HTMLElement>;
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
