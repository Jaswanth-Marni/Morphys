"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { componentsData } from "@/data/componentsData";
import { useMemo, useState, useRef } from "react";

export function ComponentNavigation({ currentId }: { currentId: string }) {
    const router = useRouter();
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Sort components by index to ensure ruler order
    const sortedComponents = useMemo(() => {
        return [...componentsData].sort((a, b) => a.index - b.index);
    }, []);

    const handleScrub = (clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();

        // Account for horizontal padding (px-4 = 16px on mobile, px-6 = 24px on desktop)
        const isMobile = window.innerWidth < 640;
        const PADDING = isMobile ? 16 : 24;
        const effectiveWidth = rect.width - (PADDING * 2);
        const x = clientX - rect.left - PADDING;

        // Clamp percentage between 0 and 1
        const percent = Math.max(0, Math.min(1, x / effectiveWidth));

        // Map to closest index
        const index = Math.round(percent * (sortedComponents.length - 1));

        // Safety check
        if (sortedComponents[index]) {
            const targetId = sortedComponents[index].id;
            setHoveredId(targetId);
        }
    };

    const handlePointerDown = (e: React.PointerEvent) => {
        setIsDragging(true);
        handleScrub(e.clientX);
        // Capture pointer to track usage even if cursor leaves the element
        (e.target as Element).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (isDragging) {
            handleScrub(e.clientX);
        }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (isDragging && hoveredId) {
            setIsDragging(false);

            // Navigate if different from current
            if (hoveredId !== currentId) {
                router.push(`/components/${hoveredId}`);
            }

            // Clear hover state after a short delay
            setTimeout(() => setHoveredId(null), 100);
        }
        (e.target as Element).releasePointerCapture(e.pointerId);
    };

    const handlePointerLeave = () => {
        if (!isDragging) {
            setHoveredId(null);
        }
    };

    // Helper to render minor decorative ticks
    const MinorTicks = () => (
        <div className="flex gap-[3px] sm:gap-[6px] items-center px-[3px] sm:px-[6px]">
            {/* Always show 1 tick */}
            <div className="w-[1px] h-2 bg-black/40 dark:bg-white/10 rounded-full" />
            {/* Show more on desktop */}
            <div className="hidden sm:block w-[1px] h-2 bg-black/40 dark:bg-white/10 rounded-full" />
            <div className="hidden sm:block w-[1px] h-2 bg-black/40 dark:bg-white/10 rounded-full" />
        </div>
    );

    return (
        <motion.div
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-4 left-0 right-0 flex justify-center z-50 pointer-events-none"
        >
            <div
                ref={containerRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerLeave}
                className="
                pointer-events-auto
                flex items-center justify-between sm:justify-center
                w-[calc(100vw-32px)] sm:w-auto max-w-[600px]
                px-3 sm:px-6 py-3
                bg-white/60 dark:bg-black/20 backdrop-blur-xl
                border border-black/20 dark:border-white/10
                rounded-2xl
                shadow-2xl
                cursor-grab active:cursor-grabbing
                touch-none select-none
            ">
                {sortedComponents.map((component, index) => {
                    const isActive = component.id === currentId;
                    const isHovered = component.id === hoveredId;

                    return (
                        <div key={component.id} className="flex items-center pointer-events-none">
                            {/* Component Tick */}
                            <div
                                className="relative flex flex-col items-center group"
                            >
                                {/* Tick Mark */}
                                <motion.div
                                    animate={{
                                        height: isActive ? 32 : isHovered ? 24 : 16,
                                        width: isActive ? 3 : 2,
                                    }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    className={`rounded-full relative z-10 transition-colors duration-200 ${isActive
                                        ? 'bg-black dark:bg-white'
                                        : isHovered
                                            ? 'bg-black/90 dark:bg-white/90' // Make hover slightly brighter
                                            : 'bg-black/60 dark:bg-white/30'
                                        }`}
                                />

                                {/* Tooltip */}
                                <div className={`
                                    absolute bottom-full mb-4 
                                    opacity-0 ${isHovered ? 'opacity-100' : ''}
                                    transition-opacity duration-200
                                    pointer-events-none whitespace-nowrap
                                    flex flex-col items-center
                                `}>
                                    <div className="
                                        text-[10px] uppercase tracking-wider font-medium 
                                        bg-white/90 dark:bg-black/80 backdrop-blur text-black/90 dark:text-white/90 
                                        px-2 py-1 rounded border border-black/10 dark:border-white/10
                                        shadow-xl
                                    ">
                                        {component.name}
                                    </div>
                                    <div className="w-[1px] h-2 bg-black/20 dark:bg-white/20 mt-[1px]" />
                                </div>
                            </div>

                            {/* Spacing / Minor Ticks (if not last) */}
                            {index < sortedComponents.length - 1 && <MinorTicks />}
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}
