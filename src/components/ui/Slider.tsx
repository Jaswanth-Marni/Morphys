"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useDragControls } from 'framer-motion';

interface SliderProps {
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (value: number) => void;
    className?: string;
}

export function Slider({ value, min, max, step = 1, onChange, className = '' }: SliderProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dragging, setDragging] = useState(false);

    // Calculate percentage for initial position
    const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const clientX = e.clientX;

        updateValue(clientX, rect);
        setDragging(true);

        // Capture pointer to handle dragging even if cursor leaves the element
        container.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!dragging) return;
        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        updateValue(e.clientX, rect);
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        setDragging(false);
        const container = containerRef.current;
        if (container) {
            container.releasePointerCapture(e.pointerId);
        }
    };

    const updateValue = (clientX: number, rect: DOMRect) => {
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const rawPercent = x / rect.width;
        let newValue = min + rawPercent * (max - min);

        // Snap to step
        if (step) {
            newValue = Math.round(newValue / step) * step;
        }

        // Clamp
        newValue = Math.max(min, Math.min(max, newValue));

        // Avoid unnecessary updates
        if (newValue !== value) {
            onChange(newValue);
        }
    };

    return (
        <div
            className={`relative w-full h-6 flex items-center cursor-pointer touch-none ${className}`}
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
        >
            {/* Track Background */}
            <div className="absolute left-0 right-0 h-1.5 bg-foreground/10 rounded-full overflow-hidden">
                {/* Fill Track */}
                <motion.div
                    className="absolute left-0 top-0 bottom-0 bg-foreground/80 dark:bg-white/90"
                    style={{ width: `${percentage}%` }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            </div>

            {/* Thumb */}
            <motion.div
                className="absolute w-5 h-5 bg-white dark:bg-foreground border border-black/10 dark:border-white/20 rounded-full shadow-md flex items-center justify-center pointer-events-none"
                style={{ left: `calc(${percentage}% - 10px)` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
                {/* Thumb Inner Dot */}
                <div className="w-1.5 h-1.5 bg-black/80 dark:bg-white/80 rounded-full" />
            </motion.div>
        </div>
    );
}
