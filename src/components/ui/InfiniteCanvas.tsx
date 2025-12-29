"use client";

import React, { useRef, useEffect, useCallback, useState, useLayoutEffect, useMemo } from "react";
import { motion, AnimatePresence, useSpring, useMotionValue, animate } from "framer-motion";
import { uiStyles } from "@/data/styles";
import { canvasStylePositions, getStylePosition, getNearestStyle } from "@/data/canvasLayout";
import { useShowcase } from "@/context/ShowcaseContext";
import { StyleDetailSection } from "./StyleDetailSection";
import { MiniMap } from "./MiniMap";
import { PositionIndicator } from "./PositionIndicator";

export const InfiniteCanvas = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const hasInitialized = useRef(false);
    const {
        activeStyleId,
        setActiveStyleId,
        setCanvasPosition,
        isCanvasOpen,
        closeCanvas,
        startDeparture,
        isTransitioning,
        arrivalPhase,
    } = useShowcase();

    // Canvas offset - how far the canvas has moved from origin
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    // Zoom perspective state for entrance and navigation
    const zoomScale = useMotionValue(0.6);  // Start zoomed out for entrance
    const [isZooming, setIsZooming] = useState(false);  // Lock during zoom animations

    // Target offset for smooth weighted drag (creates lag/weight feeling)
    const targetOffset = useRef({ x: 0, y: 0 });

    // Parallax offset based on canvas movement (reduced for performance)
    const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });

    // Dragging state
    const [isDragging, setIsDragging] = useState(false);

    // Track if canvas is ready (position initialized)
    const [isReady, setIsReady] = useState(false);

    // Mobile detection for arrival animation
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Hide UI controls during mobile arrival/departure animation
    const isMobileAnimating = isMobile && arrivalPhase !== "idle" && arrivalPhase !== "complete";

    // For manual drag tracking
    const dragStart = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });

    // Velocity tracking for momentum after release
    const velocity = useRef({ x: 0, y: 0 });
    const lastPointer = useRef({ x: 0, y: 0, time: 0 });
    const momentumFrameRef = useRef<number | null>(null);

    // Animation frame for smooth weighted drag
    const animationFrameRef = useRef<number | null>(null);

    // Lerp factor - lower = more weight (0.1 = heavy, 0.3 = medium, 0.5 = light)
    const DRAG_WEIGHT = 0.15;

    // Detect nearby section for snap button
    const nearbySection = useMemo(() => {
        if (isDragging) return null;

        // Find the section closest to center
        const nearest = getNearestStyle(-offset.x, -offset.y);

        // Calculate distance from perfect center
        const distanceX = Math.abs(nearest.x + offset.x);
        const distanceY = Math.abs(nearest.y + offset.y);
        const totalDistance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        // Only show snap button if section is partially visible but not centered
        // (distance between 10 and 60 viewport units)
        if (totalDistance > 10 && totalDistance < 60) {
            return nearest;
        }
        return null;
    }, [offset, isDragging]);

    // Initialize canvas position INSTANTLY when opening, then zoom in
    useLayoutEffect(() => {
        if (isCanvasOpen && !hasInitialized.current) {
            const targetPos = getStylePosition(activeStyleId);
            if (targetPos) {
                const newOffset = {
                    x: -targetPos.x,
                    y: -targetPos.y,
                };

                setOffset(newOffset);
                setParallaxOffset({ x: newOffset.x * 0.01, y: newOffset.y * 0.01 });

                // Start zoomed out
                zoomScale.set(0.6);
                setIsZooming(true);

                hasInitialized.current = true;

                // Show canvas first, then animate zoom
                requestAnimationFrame(() => {
                    setIsReady(true);

                    // Animate zoom in (perspective flying into canvas)
                    animate(zoomScale, 1, {
                        type: "spring",
                        stiffness: 80,
                        damping: 15,
                        mass: 0.8,
                        onComplete: () => {
                            setIsZooming(false);
                        }
                    });
                });
            }
        } else if (!isCanvasOpen) {
            hasInitialized.current = false;
            setIsReady(false);
            zoomScale.set(0.6);  // Reset for next entrance
        }
    }, [isCanvasOpen, activeStyleId, zoomScale]);

    // Lock body scroll when canvas is open (prevents scroll bleed-through on mobile)
    useEffect(() => {
        if (isCanvasOpen) {
            // Store original styles
            const originalOverflow = document.body.style.overflow;
            const originalPosition = document.body.style.position;
            const originalWidth = document.body.style.width;
            const originalTop = document.body.style.top;
            const scrollY = window.scrollY;

            // Lock body scroll
            document.body.style.overflow = "hidden";
            document.body.style.position = "fixed";
            document.body.style.width = "100%";
            document.body.style.top = `-${scrollY}px`;

            return () => {
                // Restore original styles
                document.body.style.overflow = originalOverflow;
                document.body.style.position = originalPosition;
                document.body.style.width = originalWidth;
                document.body.style.top = originalTop;
                // Restore scroll position
                window.scrollTo(0, scrollY);
            };
        }
    }, [isCanvasOpen]);

    // Navigate to specific style (from minimap, keyboard, or snap button)
    // With perspective zoom: zoom out → scroll → zoom in
    const navigateToStyle = useCallback((styleId: string) => {
        const targetPos = getStylePosition(styleId);
        if (!targetPos || isZooming) return;  // Prevent overlapping animations

        const targetOffsetVal = { x: -targetPos.x, y: -targetPos.y };
        const startOffset = { ...offset };

        // Check if we're already at this position (skip animation)
        const distance = Math.sqrt(
            Math.pow(targetOffsetVal.x - startOffset.x, 2) +
            Math.pow(targetOffsetVal.y - startOffset.y, 2)
        );

        if (distance < 5) {
            // Already close enough, just update active style
            setActiveStyleId(styleId);
            return;
        }

        setIsZooming(true);
        setActiveStyleId(styleId);

        // Phase 1: Zoom out (pull back perspective) - slower, more relaxed
        animate(zoomScale, 0.75, {
            type: "spring",
            stiffness: 120,
            damping: 20,
            mass: 0.8,
            onComplete: () => {
                // Phase 2: Pan to target (while zoomed out) - slower pan
                const panDuration = 600;  // Increased from 350ms
                const panStartTime = performance.now();

                const animatePan = (currentTime: number) => {
                    const elapsed = currentTime - panStartTime;
                    const progress = Math.min(elapsed / panDuration, 1);
                    // Ease in-out cubic for smooth travel
                    const eased = progress < 0.5
                        ? 4 * progress * progress * progress
                        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

                    const newOffset = {
                        x: startOffset.x + (targetOffsetVal.x - startOffset.x) * eased,
                        y: startOffset.y + (targetOffsetVal.y - startOffset.y) * eased,
                    };

                    setOffset(newOffset);
                    // Freeze parallax during zoom to prevent spike
                    if (!isZooming) {
                        setParallaxOffset({ x: newOffset.x * 0.01, y: newOffset.y * 0.01 });
                    }

                    if (progress < 1) {
                        requestAnimationFrame(animatePan);
                    } else {
                        // Phase 3: Zoom in (settle into new position) - slower settle
                        animate(zoomScale, 1, {
                            type: "spring",
                            stiffness: 80,
                            damping: 14,
                            mass: 0.8,
                            onComplete: () => {
                                setIsZooming(false);
                                // Update parallax after zoom completes
                                setParallaxOffset({ x: targetOffsetVal.x * 0.01, y: targetOffsetVal.y * 0.01 });
                            }
                        });
                    }
                };

                requestAnimationFrame(animatePan);
            }
        });
    }, [offset, setActiveStyleId, isZooming, zoomScale]);

    // Smooth weighted drag animation loop
    useEffect(() => {
        if (!isDragging) {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
            return;
        }

        const animateDrag = () => {
            // Lerp towards target offset (creates weight/lag feeling)
            const newX = offset.x + (targetOffset.current.x - offset.x) * DRAG_WEIGHT;
            const newY = offset.y + (targetOffset.current.y - offset.y) * DRAG_WEIGHT;

            setOffset({ x: newX, y: newY });
            setParallaxOffset({ x: newX * 0.01, y: newY * 0.01 });

            animationFrameRef.current = requestAnimationFrame(animateDrag);
        };

        animationFrameRef.current = requestAnimationFrame(animateDrag);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isDragging, offset, DRAG_WEIGHT]);

    // Manual drag handling using pointer events
    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        if ((e.target as HTMLElement).closest('button')) return;
        if (isZooming) return;  // Prevent drag during zoom animation

        // Cancel any ongoing momentum animation
        if (momentumFrameRef.current) {
            cancelAnimationFrame(momentumFrameRef.current);
            momentumFrameRef.current = null;
        }

        setIsDragging(true);
        dragStart.current = {
            x: e.clientX,
            y: e.clientY,
            offsetX: offset.x,
            offsetY: offset.y,
        };
        targetOffset.current = { x: offset.x, y: offset.y };

        // Initialize velocity tracking
        velocity.current = { x: 0, y: 0 };
        lastPointer.current = { x: e.clientX, y: e.clientY, time: performance.now() };

        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }, [offset, isZooming]);

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        if (!isDragging) return;

        const now = performance.now();
        const dt = now - lastPointer.current.time;

        // Calculate velocity (pixels per ms, converted to vw/vh per ms)
        if (dt > 0) {
            const vx = ((e.clientX - lastPointer.current.x) / window.innerWidth * 100) / dt;
            const vy = ((e.clientY - lastPointer.current.y) / window.innerHeight * 100) / dt;

            // Smooth velocity with exponential moving average
            velocity.current = {
                x: velocity.current.x * 0.7 + vx * 0.3,
                y: velocity.current.y * 0.7 + vy * 0.3,
            };
        }

        lastPointer.current = { x: e.clientX, y: e.clientY, time: now };

        const deltaX = (e.clientX - dragStart.current.x) / window.innerWidth * 100;
        const deltaY = (e.clientY - dragStart.current.y) / window.innerHeight * 100;

        // Update target (the actual position follows with lerp/weight)
        targetOffset.current = {
            x: dragStart.current.offsetX + deltaX,
            y: dragStart.current.offsetY + deltaY,
        };
    }, [isDragging]);

    const handlePointerUp = useCallback((e: React.PointerEvent) => {
        if (!isDragging) return;

        setIsDragging(false);
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);

        // Get current velocity and apply momentum
        const releaseVelocity = { ...velocity.current };
        const FRICTION = 0.95;  // Deceleration factor (0.95 = gradual, 0.9 = quick stop)
        const MIN_VELOCITY = 0.001;  // Stop threshold

        let currentOffset = { ...targetOffset.current };

        const applyMomentum = () => {
            // Apply velocity to position
            currentOffset.x += releaseVelocity.x * 16;  // ~16ms per frame
            currentOffset.y += releaseVelocity.y * 16;

            // Apply friction
            releaseVelocity.x *= FRICTION;
            releaseVelocity.y *= FRICTION;

            setOffset({ ...currentOffset });
            setParallaxOffset({ x: currentOffset.x * 0.01, y: currentOffset.y * 0.01 });

            // Continue until velocity is negligible
            const speed = Math.sqrt(releaseVelocity.x ** 2 + releaseVelocity.y ** 2);
            if (speed > MIN_VELOCITY) {
                momentumFrameRef.current = requestAnimationFrame(applyMomentum);
            } else {
                // Momentum complete - update final state
                const nearestStyle = getNearestStyle(-currentOffset.x, -currentOffset.y);
                setActiveStyleId(nearestStyle.id);
                setCanvasPosition({ x: currentOffset.x, y: currentOffset.y });
                momentumFrameRef.current = null;
            }
        };

        // Start momentum animation if there's significant velocity
        const speed = Math.sqrt(releaseVelocity.x ** 2 + releaseVelocity.y ** 2);
        if (speed > MIN_VELOCITY * 2) {
            momentumFrameRef.current = requestAnimationFrame(applyMomentum);
        } else {
            // No significant velocity - just snap to current position
            setOffset(targetOffset.current);
            const nearestStyle = getNearestStyle(-targetOffset.current.x, -targetOffset.current.y);
            setActiveStyleId(nearestStyle.id);
            setCanvasPosition({ x: targetOffset.current.x, y: targetOffset.current.y });
        }
    }, [isDragging, setActiveStyleId, setCanvasPosition]);

    // Keyboard navigation
    useEffect(() => {
        if (!isCanvasOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            const currentIndex = uiStyles.findIndex(s => s.id === activeStyleId);
            if (currentIndex === -1) return;

            let newIndex = currentIndex;

            switch (e.key) {
                case "ArrowRight":
                case "ArrowDown":
                    newIndex = (currentIndex + 1) % uiStyles.length;
                    break;
                case "ArrowLeft":
                case "ArrowUp":
                    newIndex = (currentIndex - 1 + uiStyles.length) % uiStyles.length;
                    break;
                case "Escape":
                    closeCanvas();
                    return;
                default:
                    return;
            }

            e.preventDefault();
            navigateToStyle(uiStyles[newIndex].id);
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isCanvasOpen, activeStyleId, navigateToStyle, closeCanvas]);

    const handleBackToCarousel = useCallback(() => {
        // Cancel any ongoing momentum animation
        if (momentumFrameRef.current) {
            cancelAnimationFrame(momentumFrameRef.current);
            momentumFrameRef.current = null;
        }

        // Reset zoom scale to 1 immediately to prevent transform interference
        zoomScale.set(1);

        // On mobile, start the departing animation (reverse of arrival)
        // The actual closeCanvas will be called after the animation completes
        if (isMobile) {
            startDeparture();
        } else {
            closeCanvas();
        }
    }, [closeCanvas, startDeparture, zoomScale, isMobile]);

    // Get style info for snap button
    const nearbySectionStyle = nearbySection
        ? uiStyles.find(s => s.id === nearbySection.id)
        : null;

    const viewportPositionPx = {
        x: -offset.x * (typeof window !== 'undefined' ? window.innerWidth : 1920) / 100,
        y: -offset.y * (typeof window !== 'undefined' ? window.innerHeight : 1080) / 100,
    };

    // Calculate distance to active style for smart MiniMap visibility on mobile
    const activePosition = useMemo(() => {
        return canvasStylePositions.find(p => p.id === activeStyleId);
    }, [activeStyleId]);

    const distanceFromCenter = activePosition ? Math.sqrt(
        Math.pow(offset.x + activePosition.x, 2) +
        Math.pow(offset.y + activePosition.y, 2)
    ) : 0;

    // Show map on mobile if content is moved away (> 80 units) and not currently auto-navigating
    const showMobileMap = distanceFromCenter > 80 && !isZooming;

    return (
        <AnimatePresence mode="sync">
            {isCanvasOpen && (
                <motion.div
                    ref={containerRef}
                    className="fixed inset-0 z-[200] overflow-hidden touch-none"
                    style={{ cursor: isZooming ? "default" : (isDragging ? "grabbing" : "grab") }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isReady ? 1 : 0 }}
                    exit={{ transition: { duration: 0.5 } }} // Keep container mounted for shared element transition
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                >
                    {/* Background layer - handles fade out */}
                    <motion.div
                        className="absolute inset-0 bg-background"
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.35 }}
                    />

                    {/* CSS-based dot pattern - tiles infinitely */}
                    <div
                        className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-30"
                        style={{
                            backgroundImage: `radial-gradient(circle, var(--foreground) 2px, transparent 2px)`,
                            backgroundSize: "32px 32px",
                            backgroundPosition: `${offset.x % 100}vw ${offset.y % 100}vh`,
                            transform: `translate(${(offset.x % 3.2)}vw, ${(offset.y % 3.2)}vh)`,
                        }}
                    />

                    {/* Canvas Content - with zoom perspective wrapper */}
                    <motion.div
                        className="absolute inset-0"
                        style={{
                            scale: zoomScale,
                            transformOrigin: "center center",
                        }}
                    >
                        <div
                            className="absolute inset-0 will-change-transform"
                            style={{
                                transform: `translate(${offset.x}vw, ${offset.y}vh)`,
                            }}
                        >
                            {/* All style detail sections */}
                            {uiStyles.map((style) => {
                                const position = canvasStylePositions.find(p => p.id === style.id);
                                if (!position) return null;

                                return (
                                    <StyleDetailSection
                                        key={style.id}
                                        style={style}
                                        position={position}
                                        isActive={style.id === activeStyleId}
                                        parallaxOffset={parallaxOffset}
                                        isTransitioning={isTransitioning}
                                        arrivalPhase={style.id === activeStyleId ? arrivalPhase : "complete"}
                                        isMobile={isMobile}
                                    />
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Snap to section button - appears when near a section */}
                    <AnimatePresence>
                        {nearbySection && nearbySectionStyle && (
                            <motion.button
                                className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[210] flex items-center gap-2 px-5 py-3 rounded-full"
                                style={{
                                    background: `${nearbySectionStyle.accentColor}20`,
                                    backdropFilter: "blur(16px)",
                                    WebkitBackdropFilter: "blur(16px)",
                                    border: `1px solid ${nearbySectionStyle.accentColor}40`,
                                    boxShadow: `0 4px 24px ${nearbySectionStyle.accentColor}20`,
                                    fontFamily: "'Clash Display Variable', sans-serif",
                                }}
                                onClick={() => navigateToStyle(nearbySection.id)}
                                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={nearbySectionStyle.accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 8v8M8 12h8" />
                                </svg>
                                <span style={{ color: nearbySectionStyle.accentColor }}>
                                    Center {nearbySectionStyle.title}
                                </span>
                            </motion.button>
                        )}
                    </AnimatePresence>

                    {/* Back button - Hidden during mobile arrival animation */}
                    <motion.button
                        className="fixed top-6 right-6 z-[210] flex items-center gap-2 px-4 py-2.5 rounded-full"
                        style={{
                            background: "rgba(128, 128, 128, 0.1)",
                            backdropFilter: "blur(16px)",
                            WebkitBackdropFilter: "blur(16px)",
                            border: "1px solid color-mix(in srgb, var(--foreground) 10%, transparent)",
                            boxShadow: "0 4px 24px rgba(0, 0, 0, 0.1)",
                            fontFamily: "'Clash Display Variable', sans-serif",
                            pointerEvents: isMobileAnimating ? "none" : "auto",
                        }}
                        onClick={handleBackToCarousel}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: isMobileAnimating ? 0 : 1, x: 0 }}
                        transition={{ delay: isMobileAnimating ? 0 : 0.4, duration: 0.4 }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        <span className="text-sm">Back</span>
                    </motion.button>

                    {/* Position Indicator (top-left) - Hidden during mobile arrival animation */}
                    {!isMobileAnimating && (
                        <PositionIndicator activeStyleId={activeStyleId} />
                    )}

                    {/* MiniMap (bottom-right) - Smart visibility on mobile, hidden during arrival animation */}
                    {!isMobileAnimating && (
                        <div className={`transition-opacity duration-300 ${showMobileMap ? 'block opacity-100' : 'hidden md:block opacity-0 md:opacity-100 pointer-events-none md:pointer-events-auto'}`}>
                            <MiniMap
                                activeStyleId={activeStyleId}
                                viewportPosition={viewportPositionPx}
                                onNavigate={navigateToStyle}
                            />
                        </div>
                    )}

                    {/* Keyboard hint - Hidden on mobile */}
                    <motion.div
                        className="hidden md:flex fixed bottom-6 left-6 z-[210] items-center gap-3 px-4 py-2 rounded-full text-xs text-foreground/50"
                        style={{
                            background: "rgba(128, 128, 128, 0.1)",
                            backdropFilter: "blur(16px)",
                            WebkitBackdropFilter: "blur(16px)",
                            border: "1px solid color-mix(in srgb, var(--foreground) 10%, transparent)",
                            fontFamily: "'Satoshi', sans-serif",
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.4 }}
                    >
                        <span>Use arrow keys or drag to navigate</span>
                        <span className="opacity-30">•</span>
                        <span>ESC to go back</span>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
