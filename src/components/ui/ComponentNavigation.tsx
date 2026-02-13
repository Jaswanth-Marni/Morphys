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
    'text-reveal-2': 'TextReveal2',
    'crt-glitch': 'CRTGlitch',
    'flip-clock': 'FlipClock',
    'gravity': 'Gravity',
    'pixel-simulation': 'PixelSimulation',
    'running-outline': 'RunningOutline',
    'synthwave-lines': 'SynthwaveLines',
    'hover-image-list': 'HoverImageList',
    'scroll-skew': 'ScrollSkew',
    'liquid-reveal': 'LiquidReveal',
    'pinned-carousel': 'PinnedCarousel',
    'timeline-zoom': 'TimelineZoom',
    'diagonal-arrival': 'DiagonalArrival',
};

// Prefetch cache to avoid duplicate prefetches
const prefetchedComponents = new Set<string>();

// Fixed dimensions
const ITEM_WIDTH = 40; // Width for each component slot
const PADDING = 16; // Padding on each side
const MAX_NAV_WIDTH = 500; // Maximum width of the navigation bar on desktop
const EDGE_THRESHOLD = 60; // Pixels from edge to trigger scrolling
const MAX_SCROLL_SPEED = 4; // Maximum scroll speed per frame

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

        // Update hovered component during edge scroll based on cursor position
        if (lastClientX.current > 0) {
            const rect = container.getBoundingClientRect();
            const x = lastClientX.current - rect.left + container.scrollLeft - PADDING;
            const index = Math.floor(x / ITEM_WIDTH);
            const clampedIndex = Math.max(0, Math.min(sortedComponents.length - 1, index));
            const componentId = sortedComponents[clampedIndex]?.id || null;
            if (componentId) {
                setHoveredId(componentId);
            }
        }

        // Continue the animation loop
        scrollAnimationRef.current = requestAnimationFrame(smoothScrollLoop);
    }, [totalContentWidth, sortedComponents]);

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

        // Implement drag-to-scroll: REMOVED as per user request to prevent "normal scrolling"
        // We only want to select ticks (scrub) and auto-scroll at edges
        /* 
        const deltaX = lastClientX.current - e.clientX;
        if (Math.abs(deltaX) > 0) {
            container.scrollLeft += deltaX;
            lastClientX.current = e.clientX;
        } 
        */
        // IMPORTANT: Update lastClientX even if we don't scroll, for velocity calc if needed later, 
        // but strictly we just need it for the edge scroll logic which uses a ref. 
        // Actually, edge scroll uses lastClientX.current to recalculate hover. 
        lastClientX.current = e.clientX;

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
            {/* Centered Name Popup - Premium Glass Design */}
            <AnimatePresence>
                {hoveredComponent && (
                    <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95, filter: 'blur(5px)' }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: 10, scale: 0.95, filter: 'blur(5px)' }}
                        transition={{ type: "spring", stiffness: 400, damping: 25, mass: 0.8 }}
                        className="mb-4 px-4 py-2 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-2xl pointer-events-none flex items-center gap-3 border"
                        style={{
                            backgroundColor: isLight ? 'rgba(255,255,255,0.85)' : 'rgba(10,10,10,0.7)',
                            borderColor: isLight ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.08)',
                            boxShadow: isLight
                                ? '0 4px 20px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(255,255,255,0.5)'
                                : '0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 0 rgba(255,255,255,0.1)'
                        }}
                    >
                        <span
                            className="text-[11px] font-mono font-bold tracking-wider"
                            style={{
                                color: isLight ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.4)',
                            }}
                        >
                            {String(hoveredIndex + 1).padStart(2, '0')}
                        </span>

                        {/* Divider */}
                        <div
                            className="h-3 w-[1px]"
                            style={{ backgroundColor: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)' }}
                        />

                        <span
                            className="text-sm font-medium tracking-wide whitespace-nowrap"
                            style={{
                                color: isLight ? '#000000' : '#ffffff',
                                textShadow: isLight ? 'none' : '0 0 20px rgba(255,255,255,0.3)'
                            }}
                        >
                            {/* Format name to ensure human-readable spacing (e.g. "TextReveal2" -> "Text Reveal 2") */}
                            {hoveredComponent.name.replace(/([A-Z])/g, ' $1').replace(/[-_]/g, ' ').trim().replace(/\s+/g, ' ')}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div
                className="pointer-events-auto backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden"
                style={{
                    backgroundColor: isLight ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)', // More transparent
                    border: isLight ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.08)',
                    maxWidth: `min(${MAX_NAV_WIDTH}px, calc(100vw - 32px))`,
                    width: '100%',
                    boxShadow: isLight ? '0 10px 40px -10px rgba(0,0,0,0.1)' : '0 10px 40px -10px rgba(0,0,0,0.5)',
                }}
            >
                <div
                    ref={scrollContainerRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerLeave}
                    onScroll={handleScroll}
                    className="flex items-center py-2 cursor-grab active:cursor-grabbing touch-none select-none overflow-x-auto"
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
                                    height: 38,
                                }}
                                onClick={() => handleTickClick(component.id)}
                            >
                                {/* Major Tick - positioned at start */}
                                {(() => {
                                    // Calculate distance from hovered tick for pressure effect
                                    const hoveredIndex = sortedComponents.findIndex(c => c.id === hoveredId);
                                    const distance = hoveredIndex >= 0 ? Math.abs(index - hoveredIndex) : Infinity;

                                    // Height based on distance (pressure effect) - only during drag
                                    let tickHeight = 16; // baseline
                                    let tickWidth = 2; // baseline

                                    if (isDragging && hoveredIndex >= 0) {
                                        // Pressure effect: height decreases with distance
                                        if (distance === 0) {
                                            tickHeight = 28; // selected
                                            tickWidth = 6; // only selected gets wider
                                        } else if (distance === 1) {
                                            tickHeight = 22;
                                        } else if (distance === 2) {
                                            tickHeight = 18;
                                        } else {
                                            tickHeight = 16;
                                        }
                                    } else {
                                        // Not dragging: original behavior
                                        if (isActive || isHovered) {
                                            tickHeight = 28;
                                            tickWidth = 6;
                                        }
                                    }

                                    const isSelected = isDragging ? isHovered : (isActive || isHovered);

                                    return (
                                        <motion.div
                                            animate={{
                                                height: tickHeight,
                                                width: tickWidth,
                                                backgroundColor: isSelected
                                                    ? (isLight ? '#000000' : '#ffffff')
                                                    : (isLight ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)')
                                            }}
                                            transition={{
                                                type: "spring",
                                                stiffness: 500,
                                                damping: 30,
                                                mass: 0.5
                                            }}
                                            className="rounded-full cursor-pointer flex-shrink-0"
                                        />
                                    );
                                })()}


                                {/* Minor Ticks - evenly spaced after major tick with pressure effect */}
                                {!isLast && (() => {
                                    const hoveredIdx = sortedComponents.findIndex(c => c.id === hoveredId);

                                    return (
                                        <div className="flex-1 flex items-center justify-evenly pointer-events-none">
                                            {[1, 2, 3].map((i) => {
                                                // Calculate fractional distance for minor ticks
                                                // Minor tick i is at position: index + (i * 0.25)
                                                const minorPosition = index + (i * 0.25);
                                                const distanceFromHovered = hoveredIdx >= 0 ? Math.abs(minorPosition - hoveredIdx) : Infinity;

                                                // Height for minor ticks during drag
                                                let minorHeight = 10; // baseline (h-2.5)

                                                if (isDragging && hoveredIdx >= 0) {
                                                    if (distanceFromHovered < 0.5) {
                                                        minorHeight = 18;
                                                    } else if (distanceFromHovered < 1) {
                                                        minorHeight = 14;
                                                    } else if (distanceFromHovered < 1.5) {
                                                        minorHeight = 12;
                                                    } else if (distanceFromHovered < 2) {
                                                        minorHeight = 10;
                                                    } else {
                                                        minorHeight = 8;
                                                    }
                                                }

                                                return (
                                                    <motion.div
                                                        key={i}
                                                        animate={{
                                                            height: minorHeight,
                                                        }}
                                                        transition={{
                                                            type: "spring",
                                                            stiffness: 500,
                                                            damping: 30,
                                                            mass: 0.5
                                                        }}
                                                        className="w-[1px] rounded-full"
                                                        style={{
                                                            backgroundColor: isLight ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)'
                                                        }}
                                                    />
                                                );
                                            })}
                                        </div>
                                    );
                                })()}

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
