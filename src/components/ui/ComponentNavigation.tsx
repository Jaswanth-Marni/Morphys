"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { componentMetadata } from "@/data/componentMetadata";
import { useMemo, useState, useRef, useCallback, useEffect, useLayoutEffect } from "react";
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
    'glass-surge': 'GlassSurge',
    'layered-image-showcase': 'LayeredImageShowcase',
    'impact-text': 'ImpactText',
    'reveal-marquee': 'ClothTicker',
    'wave-marquee': 'WaveMarquee',
    'expandable-strips': 'ExpandableStrips',
    'frosted-glass': 'FrostedGlass',
    'text-reveal': 'TextReveal',
};

// Prefetch cache to avoid duplicate prefetches
const prefetchedComponents = new Set<string>();

// Fixed dimensions
const ITEM_WIDTH = 40; // Width for each component slot
const PADDING = 16; // Padding on each side
const MAX_NAV_WIDTH = 500; // Maximum width of the navigation bar on desktop
const EDGE_THRESHOLD = 60; // Pixels from edge to trigger scrolling
const MAX_SCROLL_SPEED = 8; // Maximum scroll speed per frame

// Store scroll position globally to persist across remounts
let lastScrollPosition = 0;

export function ComponentNavigation({ currentId }: { currentId: string }) {
    const router = useRouter();
    const { startLoading } = useNavigationLoading();
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [theme, setTheme] = useState<"light" | "dark">("dark");
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const scrollAnimationRef = useRef<number | null>(null);
    const scrollDirectionRef = useRef<'left' | 'right' | null>(null);
    const scrollSpeedRef = useRef(0);
    const lastClientX = useRef(0);

    // Sort components by index
    const sortedComponents = useMemo(() => {
        return [...componentMetadata].sort((a, b) => a.index - b.index);
    }, []);

    // Calculate total content width (all items except last have ITEM_WIDTH, last has 6px for just the tick)
    const LAST_ITEM_WIDTH = 6;
    const totalContentWidth = useMemo(() => {
        const itemsWidth = (sortedComponents.length - 1) * ITEM_WIDTH + LAST_ITEM_WIDTH;
        return PADDING + itemsWidth + PADDING; // left padding + items + right padding
    }, [sortedComponents.length]);

    // Restore scroll position before paint
    useLayoutEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = lastScrollPosition;
        }
    }, []);

    // Scroll to center the active component
    useEffect(() => {
        if (!scrollContainerRef.current) return;

        const activeIndex = sortedComponents.findIndex(c => c.id === currentId);
        if (activeIndex === -1) return;

        const container = scrollContainerRef.current;
        const rect = container.getBoundingClientRect();
        const isLast = activeIndex === sortedComponents.length - 1;

        // Calculate position of the active component's center
        const activeItemWidth = isLast ? LAST_ITEM_WIDTH : ITEM_WIDTH;
        const itemCenterPosition = PADDING + (activeIndex * ITEM_WIDTH) + (activeItemWidth / 2);
        const targetScroll = itemCenterPosition - (container.clientWidth / 2);

        // Calculate actual max scroll based on content width (use rect.width for float precision)
        const maxScroll = Math.max(0, totalContentWidth - rect.width - 1); // -1 buffer to ensure no gap
        const clampedScroll = Math.max(0, Math.min(targetScroll, maxScroll));

        container.scrollTo({
            left: clampedScroll,
            behavior: 'smooth'
        });
    }, [currentId, sortedComponents, totalContentWidth]);

    // Observe theme changes
    useEffect(() => {
        const currentTheme = document.documentElement.getAttribute("data-theme") as "light" | "dark" || "dark";
        setTheme(currentTheme);

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === "data-theme") {
                    const newTheme = document.documentElement.getAttribute("data-theme") as "light" | "dark" || "dark";
                    setTheme(newTheme);
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });
        return () => observer.disconnect();
    }, []);

    // Smooth scroll animation loop
    const smoothScrollLoop = useCallback(() => {
        if (!scrollContainerRef.current || !scrollDirectionRef.current) {
            scrollAnimationRef.current = null;
            return;
        }

        const container = scrollContainerRef.current;
        const maxScroll = Math.max(0, totalContentWidth - container.clientWidth - 1);
        const speed = scrollSpeedRef.current;

        if (scrollDirectionRef.current === 'left') {
            const newScroll = Math.max(0, container.scrollLeft - speed);
            container.scrollLeft = newScroll;
        } else if (scrollDirectionRef.current === 'right') {
            const newScroll = Math.min(maxScroll, container.scrollLeft + speed);
            container.scrollLeft = newScroll;
        }

        // Continue the animation loop
        scrollAnimationRef.current = requestAnimationFrame(smoothScrollLoop);
    }, [totalContentWidth]);

    // Start smooth scrolling
    const startSmoothScroll = useCallback((direction: 'left' | 'right', speed: number) => {
        scrollDirectionRef.current = direction;
        scrollSpeedRef.current = speed;

        // Only start the loop if it's not already running
        if (scrollAnimationRef.current === null) {
            scrollAnimationRef.current = requestAnimationFrame(smoothScrollLoop);
        }
    }, [smoothScrollLoop]);

    // Stop smooth scrolling
    const stopSmoothScroll = useCallback(() => {
        scrollDirectionRef.current = null;
        scrollSpeedRef.current = 0;
        if (scrollAnimationRef.current !== null) {
            cancelAnimationFrame(scrollAnimationRef.current);
            scrollAnimationRef.current = null;
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (scrollAnimationRef.current !== null) {
                cancelAnimationFrame(scrollAnimationRef.current);
            }
        };
    }, []);

    // Prefetch component on hover
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

    // Get component at X position
    const getComponentAtPosition = useCallback((clientX: number): string | null => {
        if (!scrollContainerRef.current) return null;

        const container = scrollContainerRef.current;
        const rect = container.getBoundingClientRect();
        const x = clientX - rect.left + container.scrollLeft - PADDING;

        const index = Math.floor(x / ITEM_WIDTH);
        const clampedIndex = Math.max(0, Math.min(sortedComponents.length - 1, index));

        return sortedComponents[clampedIndex]?.id || null;
    }, [sortedComponents]);

    // Handle click on a tick
    const handleTickClick = (componentId: string) => {
        if (componentId !== currentId) {
            startLoading();
            router.push(`/components/${componentId}`);
        }
    };

    const handlePointerDown = (e: React.PointerEvent) => {
        setIsDragging(true);
        lastClientX.current = e.clientX;
        e.currentTarget.setPointerCapture(e.pointerId);

        // Set initial hovered component
        const componentId = getComponentAtPosition(e.clientX);
        if (componentId) {
            setHoveredId(componentId);
            prefetchComponent(componentId);
        }
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging || !scrollContainerRef.current) return;

        const container = scrollContainerRef.current;
        const rect = container.getBoundingClientRect();

        // Update hovered component based on cursor position
        const componentId = getComponentAtPosition(e.clientX);
        if (componentId) {
            setHoveredId(componentId);
            prefetchComponent(componentId);
        }

        // Calculate cursor position relative to container
        const cursorX = e.clientX - rect.left;
        const containerWidth = rect.width;

        // Implement drag-to-scroll: Move content with the mouse
        // Use a multiplier to make the drag feel more responsive if needed, but 1:1 is standard
        const deltaX = lastClientX.current - e.clientX;
        if (Math.abs(deltaX) > 0) {
            container.scrollLeft += deltaX;
            lastClientX.current = e.clientX;
        }

        // Check if near edges and calculate scroll speed based on distance from edge
        if (cursorX < EDGE_THRESHOLD && container.scrollLeft > 0) {
            // Near left edge - calculate speed based on how close to edge
            const distanceFromEdge = cursorX;
            const normalizedDistance = 1 - (distanceFromEdge / EDGE_THRESHOLD); // 0 at threshold, 1 at edge
            const speed = normalizedDistance * MAX_SCROLL_SPEED;
            startSmoothScroll('left', Math.max(1, speed));
        } else if (cursorX > containerWidth - EDGE_THRESHOLD) {
            // Near right edge - calculate speed based on how close to edge
            const maxScroll = Math.max(0, totalContentWidth - containerWidth - 1);
            if (container.scrollLeft < maxScroll) {
                const distanceFromEdge = containerWidth - cursorX;
                const normalizedDistance = 1 - (distanceFromEdge / EDGE_THRESHOLD); // 0 at threshold, 1 at edge
                const speed = normalizedDistance * MAX_SCROLL_SPEED;
                startSmoothScroll('right', Math.max(1, speed));
            } else {
                stopSmoothScroll();
            }
        } else {
            // Not near edges - stop scrolling
            stopSmoothScroll();
        }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (!isDragging) return;

        // Stop any ongoing scroll animation
        stopSmoothScroll();

        // Navigate to hovered component on release
        if (hoveredId && hoveredId !== currentId) {
            startLoading();
            router.push(`/components/${hoveredId}`);
        }

        setIsDragging(false);
        e.currentTarget.releasePointerCapture(e.pointerId);
        setTimeout(() => setHoveredId(null), 100);
    };

    const handlePointerLeave = () => {
        if (!isDragging) {
            setHoveredId(null);
        }
        stopSmoothScroll();
    };

    const handleScroll = () => {
        if (scrollContainerRef.current) {
            lastScrollPosition = scrollContainerRef.current.scrollLeft;
        }
    };

    const isLight = theme === "light";

    // Get hovered component info for the popup
    const hoveredComponent = hoveredId ? sortedComponents.find(c => c.id === hoveredId) : null;
    const hoveredIndex = hoveredComponent ? sortedComponents.findIndex(c => c.id === hoveredId) : -1;

    return (
        <motion.div
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-4 md:bottom-4 left-0 right-0 flex flex-col items-center z-[60] pointer-events-none px-4 pb-safe"
        >
            {/* Centered Name Popup */}
            <AnimatePresence>
                {hoveredComponent && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="mb-2 md:mb-3 px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl shadow-2xl backdrop-blur-xl pointer-events-none"
                        style={{
                            backgroundColor: isLight ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.85)',
                            border: isLight ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.15)',
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                style={{
                                    backgroundColor: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)',
                                    color: isLight ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)',
                                }}
                            >
                                {String(hoveredIndex + 1).padStart(2, '0')}
                            </span>
                            <span
                                className="text-xs md:text-sm font-semibold tracking-wide"
                                style={{
                                    color: isLight ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)',
                                }}
                            >
                                {hoveredComponent.name}
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div
                className="pointer-events-auto backdrop-blur-xl rounded-xl md:rounded-2xl shadow-2xl overflow-hidden"
                style={{
                    backgroundColor: isLight ? 'transparent' : 'rgba(0,0,0,0.6)',
                    border: isLight ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.2)',
                    maxWidth: `min(${MAX_NAV_WIDTH}px, calc(100vw - 32px))`,
                    width: '100%',
                }}
            >
                <div
                    ref={scrollContainerRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerLeave}
                    onScroll={handleScroll}
                    className="flex items-center py-3 cursor-grab active:cursor-grabbing touch-none select-none overflow-x-auto"
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        overscrollBehaviorX: 'contain',
                    }}
                >
                    {/* Left padding */}
                    <div className="flex-shrink-0" style={{ width: PADDING }} />
                    {sortedComponents.map((component, index) => {
                        const isActive = component.id === currentId;
                        const isHovered = component.id === hoveredId;
                        const isLast = index === sortedComponents.length - 1;

                        return (
                            <div
                                key={component.id}
                                className="flex-shrink-0 flex items-center relative"
                                style={{
                                    width: isLast ? 6 : ITEM_WIDTH, // Last item only has the major tick width
                                    height: 32,
                                }}
                                onClick={() => handleTickClick(component.id)}
                            >
                                {/* Major Tick - positioned at start */}
                                <motion.div
                                    animate={{
                                        height: isActive ? 28 : isHovered ? 24 : 16,
                                        width: isActive ? 6 : 2,
                                        backgroundColor: isActive || isHovered
                                            ? (isLight ? '#000000' : '#ffffff')
                                            : (isLight ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)')
                                    }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 25
                                    }}
                                    className="rounded-full cursor-pointer flex-shrink-0"
                                />

                                {/* Minor Ticks - evenly spaced after major tick */}
                                {!isLast && (
                                    <div className="flex-1 flex items-center justify-evenly pointer-events-none">
                                        {[1, 2, 3].map((i) => (
                                            <div
                                                key={i}
                                                className="w-[1px] h-2.5 rounded-full"
                                                style={{
                                                    backgroundColor: isLight ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)'
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}

                            </div>
                        );
                    })}
                    {/* Right padding - fixed element to prevent gap growth */}
                    <div className="flex-shrink-0" style={{ width: PADDING }} />
                </div>
            </div>
        </motion.div>
    );
}
