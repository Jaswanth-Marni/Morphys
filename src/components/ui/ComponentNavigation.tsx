"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { componentMetadata } from "@/data/componentMetadata";
import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { useNavigationLoading } from "@/context/NavigationLoadingContext";

// Component ID to module path mapping for prefetching
const componentModuleMap: Record<string, string> = {
    'flip-grid': 'FlipGrid',
    'ascii-simulation': 'AsciiSimulation',
    'liquid-morph': 'LiquidMorph',
    'page-reveal': 'PageReveal',
    'navbar-menu': 'NavbarMenu',
    'navbar-menu-2': 'NavbarMenu2',
    'spotlight-search': 'SpotlightSearch',
    'image-trail-cursor': 'ImageTrailCursor',
    'reality-lens': 'RealityLens',
    'scroll-to-reveal': 'ScrollToReveal',
    'diffuse-text': 'DiffuseText',
    'diagonal-focus': 'DiagonalFocus',
    'notification-stack': 'NotificationStack',
    'text-pressure': 'TextPressure',
    'fluid-height': 'FluidHeight',
    'text-mirror': 'TextMirror',
    'step-morph': 'StepMorph',
    'center-menu': 'CenterMenu',
};

// Prefetch cache to avoid duplicate prefetches
const prefetchedComponents = new Set<string>();

// Fixed dimensions for perfect alignment
const ITEM_WIDTH = 44; // Fixed width for each component slot in pixels

export function ComponentNavigation({ currentId }: { currentId: string }) {
    const router = useRouter();
    const { startLoading } = useNavigationLoading();
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const dragStartX = useRef(0);
    const lastClientX = useRef(0);
    const dragDistance = useRef(0);

    // Sort components by index to ensure ruler order
    const sortedComponents = useMemo(() => {
        return [...componentMetadata].sort((a, b) => a.index - b.index);
    }, []);

    // Scroll to center the active component on mount and when currentId changes
    useEffect(() => {
        if (!scrollContainerRef.current) return;

        const activeIndex = sortedComponents.findIndex(c => c.id === currentId);
        if (activeIndex === -1) return;

        const container = scrollContainerRef.current;
        // Center the target item: Item center is (index * WIDTH) + (WIDTH / 2)
        // Scroll target = Item Center - (Container Width / 2)
        const targetScroll = (activeIndex * ITEM_WIDTH) - (container.clientWidth / 2) + (ITEM_WIDTH / 2);

        container.scrollTo({
            left: Math.max(0, targetScroll),
            behavior: 'smooth'
        });
    }, [currentId, sortedComponents]);

    // Prefetch component on hover for faster loading
    const prefetchComponent = useCallback((componentId: string) => {
        if (prefetchedComponents.has(componentId) || componentId === currentId) return;

        const moduleName = componentModuleMap[componentId];
        if (!moduleName) return;

        prefetchedComponents.add(componentId);

        import(`@/components/ui/${moduleName}`).catch(() => {
            prefetchedComponents.delete(componentId);
        });

        router.prefetch(`/components/${componentId}`);
    }, [currentId, router]);

    // Get component at a specific X position
    const getComponentAtPosition = useCallback((clientX: number): string | null => {
        if (!scrollContainerRef.current) return null;

        const container = scrollContainerRef.current;
        const rect = container.getBoundingClientRect();
        const scrollLeft = container.scrollLeft;

        // Calculate position relative to the scroll content
        // We add scrollLeft to clientX relative to container start
        // Subtract padding (16px) to align with first item start
        const x = clientX - rect.left + scrollLeft - 16;

        const index = Math.floor(x / ITEM_WIDTH);
        const clampedIndex = Math.max(0, Math.min(sortedComponents.length - 1, index));

        return sortedComponents[clampedIndex]?.id || null;
    }, [sortedComponents]);

    const handlePointerDown = (e: React.PointerEvent) => {
        if (!scrollContainerRef.current) return;

        setIsDragging(true);
        setIsScrolling(false);
        dragStartX.current = e.clientX;
        lastClientX.current = e.clientX;
        dragDistance.current = 0;

        (e.target as Element).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging || !scrollContainerRef.current) return;

        const deltaX = e.clientX - lastClientX.current;
        const totalDelta = Math.abs(e.clientX - dragStartX.current);
        dragDistance.current = totalDelta;

        // If moved more than 5px, treat as scroll interaction
        if (totalDelta > 5) {
            setIsScrolling(true);
            scrollContainerRef.current.scrollLeft -= deltaX;
        }

        lastClientX.current = e.clientX;

        // Check vertical bounds - if dragged too far up/down, clear selection (cancel)
        const rect = scrollContainerRef.current.getBoundingClientRect();
        const verticalTolerance = 80; // Pixels
        const isOutOfBounds = e.clientY < rect.top - verticalTolerance || e.clientY > rect.bottom + verticalTolerance;

        if (isOutOfBounds) {
            setHoveredId(null);
        } else {
            // Update hovered component
            const componentId = getComponentAtPosition(e.clientX);
            if (componentId) {
                setHoveredId(componentId);
                prefetchComponent(componentId);
            }
        }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (!isDragging) return;

        // Navigate if we have a valid hovered ID on release (Drag Selection)
        // We allow this even if scrolled, restoring the "scrubbing" behavior
        if (hoveredId && hoveredId !== currentId) {
            startLoading();
            router.push(`/components/${hoveredId}`);
        }

        setIsDragging(false);
        setIsScrolling(false);
        setTimeout(() => setHoveredId(null), 100);

        (e.target as Element).releasePointerCapture(e.pointerId);
    };

    const handlePointerLeave = () => {
        if (!isDragging) {
            setHoveredId(null);
        }
    };

    // Minor ticks between major component ticks
    const MinorTicks = () => (
        <div className="flex items-center justify-center gap-[3px] opacity-40">
            <div className="w-[1px] h-2 bg-black/30 dark:bg-white/30 rounded-full" />
            <div className="w-[1px] h-2 bg-black/30 dark:bg-white/30 rounded-full" />
            <div className="w-[1px] h-2 bg-black/30 dark:bg-white/30 rounded-full" />
        </div>
    );

    return (
        <motion.div
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-4 left-0 right-0 flex justify-center z-50 pointer-events-none px-4"
        >
            <div
                ref={containerRef}
                className="
                    pointer-events-auto
                    bg-white/60 dark:bg-black/20 backdrop-blur-xl
                    border border-black/20 dark:border-white/10
                    rounded-2xl
                    shadow-2xl
                    overflow-hidden
                    max-w-[calc(100vw-32px)]
                "
            >
                <div
                    ref={scrollContainerRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerLeave}
                    className="
                        flex items-center
                        py-3
                        cursor-grab active:cursor-grabbing
                        touch-none select-none
                        overflow-x-auto
                        scrollbar-none
                    "
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                    }}
                >
                    {/* Left padding for centering first item */}
                    <div className="flex-shrink-0 w-4" />

                    {sortedComponents.map((component, index) => {
                        const isActive = component.id === currentId;
                        const isHovered = component.id === hoveredId;

                        return (
                            <div
                                key={component.id}
                                className="flex items-center flex-shrink-0 relative h-8"
                                style={{ width: ITEM_WIDTH }}
                            >
                                {/* Component Tick Container - Taking up left portion */}
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
                                    <div className="relative flex flex-col items-center">
                                        {/* Tick Mark */}
                                        <motion.div
                                            animate={{
                                                height: isActive ? 32 : isHovered ? 24 : 16,
                                                width: isActive ? 3 : 2,
                                                backgroundColor: isActive
                                                    ? 'var(--foreground)'
                                                    : isHovered
                                                        ? 'var(--foreground)'
                                                        : 'var(--foreground-muted, rgba(0,0,0,0.4))'
                                            }}
                                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                            className={`rounded-full relative 
                                                ${isActive ? 'bg-black dark:bg-white' : 'bg-black/40 dark:bg-white/40'}
                                            `}
                                        />

                                        {/* Tooltip */}
                                        <div className={`
                                            absolute bottom-full mb-4 
                                            opacity-0 ${isHovered ? 'opacity-100' : ''}
                                            transition-opacity duration-200
                                            pointer-events-none whitespace-nowrap
                                            flex flex-col items-center
                                            left-1/2 -translate-x-1/2
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
                                </div>

                                {/* Minor Ticks - Centered in remaining space to the right */}
                                {index < sortedComponents.length - 1 && (
                                    <div className="absolute left-[3px] right-0 flex items-center justify-center top-1/2 -translate-y-1/2">
                                        <MinorTicks />
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Right padding */}
                    <div className="flex-shrink-0 w-4" />
                </div>
            </div>
        </motion.div>
    );
}
