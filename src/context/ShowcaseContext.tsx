"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";

export type CanvasPosition = {
    x: number;
    y: number;
};

// Mobile arrival animation phases
export type ArrivalPhase = "idle" | "hero" | "settling" | "revealing" | "complete" | "departing";

type ShowcaseContextType = {
    // Animation tracking
    hasShowcaseAnimated: boolean;
    markShowcaseAsAnimated: () => void;

    // Active style tracking (bi-directional sync)
    activeStyleId: string;
    setActiveStyleId: (id: string) => void;

    // Canvas visibility state (overlay approach)
    isCanvasOpen: boolean;
    openCanvas: (styleId: string) => void;
    closeCanvas: () => void;
    // Start departing animation (mobile reverse animation)
    startDeparture: () => void;

    // Callback for carousel to sync before canvas closes
    registerCarouselSync: (callback: (styleId: string) => void) => void;

    // Canvas navigation state
    canvasPosition: CanvasPosition;
    setCanvasPosition: (position: CanvasPosition) => void;

    // Transition state for shared element animations
    isTransitioning: boolean;
    setIsTransitioning: (value: boolean) => void;
    transitionDirection: "to-canvas" | "to-carousel" | null;
    setTransitionDirection: (direction: "to-canvas" | "to-carousel" | null) => void;

    // Source element rect for morph transition
    sourceImageRect: DOMRect | null;
    setSourceImageRect: (rect: DOMRect | null) => void;

    // Mobile arrival animation phase
    arrivalPhase: ArrivalPhase;
    setArrivalPhase: (phase: ArrivalPhase) => void;
};

const ShowcaseContext = createContext<ShowcaseContextType | undefined>(undefined);

export function ShowcaseProvider({ children }: { children: React.ReactNode }) {
    const [hasShowcaseAnimated, setHasShowcaseAnimated] = useState(false);
    const [activeStyleId, setActiveStyleIdState] = useState("glassmorphism");
    const [isCanvasOpen, setIsCanvasOpen] = useState(false);
    const [canvasPosition, setCanvasPositionState] = useState<CanvasPosition>({ x: 0, y: 0 });
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [transitionDirection, setTransitionDirection] = useState<"to-canvas" | "to-carousel" | null>(null);
    const [sourceImageRect, setSourceImageRect] = useState<DOMRect | null>(null);
    const [arrivalPhase, setArrivalPhase] = useState<ArrivalPhase>("idle");

    // Ref to hold carousel sync callback
    const carouselSyncCallback = useRef<((styleId: string) => void) | null>(null);

    const markShowcaseAsAnimated = useCallback(() => {
        setHasShowcaseAnimated(true);
    }, []);

    const setActiveStyleId = useCallback((id: string) => {
        setActiveStyleIdState(id);
    }, []);

    const setCanvasPosition = useCallback((position: CanvasPosition) => {
        setCanvasPositionState(position);
    }, []);

    const registerCarouselSync = useCallback((callback: (styleId: string) => void) => {
        carouselSyncCallback.current = callback;
    }, []);

    const openCanvas = useCallback((styleId: string) => {
        setActiveStyleIdState(styleId);
        setIsTransitioning(true);
        setTransitionDirection("to-canvas");
        // Start with hero phase for mobile arrival animation
        setArrivalPhase("hero");
        // Open canvas immediately
        setIsCanvasOpen(true);
        // Extended transition time for smooth shared element animation (especially on mobile)
        setTimeout(() => {
            setIsTransitioning(false);
        }, 600);
    }, []);

    const closeCanvas = useCallback(() => {
        setIsTransitioning(true);
        setTransitionDirection("to-carousel");

        // Only reset arrival phase if NOT in departing mode
        // When departing, the animation needs to maintain its state until canvas is fully closed
        // The phase will be reset to "hero" when canvas opens again via openCanvas
        setArrivalPhase((currentPhase) => {
            if (currentPhase === "departing") {
                return currentPhase; // Keep departing phase to maintain animation state
            }
            return "idle";
        });

        // First, tell carousel to scroll to the active style INSTANTLY
        if (carouselSyncCallback.current) {
            carouselSyncCallback.current(activeStyleId);
        }

        // Give carousel more time to sync before closing canvas
        setTimeout(() => {
            setIsCanvasOpen(false);
        }, 150);

        setTimeout(() => {
            setIsTransitioning(false);
            setTransitionDirection(null);
            // Reset phase to idle after everything is closed (safe cleanup)
            setArrivalPhase("idle");
        }, 700);
    }, [activeStyleId]);

    // Start departing animation (reverse of arrival) - used on mobile
    const startDeparture = useCallback(() => {
        setArrivalPhase("departing");
    }, []);

    return (
        <ShowcaseContext.Provider value={{
            hasShowcaseAnimated,
            markShowcaseAsAnimated,
            activeStyleId,
            setActiveStyleId,
            isCanvasOpen,
            openCanvas,
            closeCanvas,
            startDeparture,
            registerCarouselSync,
            canvasPosition,
            setCanvasPosition,
            isTransitioning,
            setIsTransitioning,
            transitionDirection,
            setTransitionDirection,
            sourceImageRect,
            setSourceImageRect,
            arrivalPhase,
            setArrivalPhase,
        }}>
            {children}
        </ShowcaseContext.Provider>
    );
}

export function useShowcase() {
    const context = useContext(ShowcaseContext);
    if (context === undefined) {
        throw new Error("useShowcase must be used within a ShowcaseProvider");
    }
    return context;
}
