"use client";

import React, { useEffect, useRef, useState } from "react";

const ScrollSkewText = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);

    // Configuration
    const skewStrength = 0.5; // How much it leans per unit of speed
    const moveSpeed = 0.5; // Horizontal movement multiplier
    const decay = 0.9; // Smooth return to normal (0.0 - 1.0)
    const maxSkew = 45; // Maximum angle

    // State for current values (used in animation loop)
    const state = useRef({
        currentScroll: 0,
        targetSkew: 0,
        currentSkew: 0,
        lastScrollY: 0,
        scrollSpeed: 0,
    });

    useEffect(() => {
        // Initial scroll position
        if (typeof window !== 'undefined') {
            state.current.lastScrollY = window.scrollY;
            state.current.currentScroll = window.scrollY;
        }

        const handleScroll = () => {
            const currentY = window.scrollY;
            const diff = currentY - state.current.lastScrollY;

            // Update speed based on scroll difference
            // If scrolling down (diff > 0), text moves right-to-left. 
            // Skew should be positive (lean right) or negative depending on transform origin?
            // User says: "when scrolling the line moves from right to left... letters should smoothly lean to right side like the italic"
            // Standard italic leans to the right (top right, bottom left). CSS `skewX(-20deg)` does this.
            // So if scrolling down (Right->Left motion), we want skewX negative?
            // Let's assume positive velocity = scroll down.

            state.current.scrollSpeed = diff;
            state.current.lastScrollY = currentY;
            state.current.currentScroll = currentY;
        };

        window.addEventListener("scroll", handleScroll, { passive: true });

        let requestID: number;

        const animate = () => {
            // Smoothly decay the speed/skew target when not scrolling
            state.current.scrollSpeed *= 0.9; // Friction to stop the "force"

            // Calculate target skew based on speed
            // If speed is positive (scrolling down), we want lean right (italic).
            // If text moves R->L, and we want italic (top forward), that's usually skewX(-deg).
            // Let's try: scrollSpeed > 0 => lean right.

            const targetSkew = -state.current.scrollSpeed * skewStrength;

            // Clamp skew
            const clampedSkew = Math.max(Math.min(targetSkew, maxSkew), -maxSkew);

            // Smoothly interpolate current skew to target skew (or just use the speed directly with decay)
            // Since we decay the speed, we can just use that directly or smooth it further.
            // Let's use the decayed speed as the source of truth for "current leaning factor".

            state.current.currentSkew += (clampedSkew - state.current.currentSkew) * 0.1;

            if (textRef.current) {
                // Horizontal movement: scrollY * speed
                // Scroll down -> Move Right to Left (Negative X)
                const xPos = -(state.current.currentScroll * moveSpeed);

                // Apply transform
                textRef.current.style.transform = `translateX(${xPos}px) skewX(${state.current.currentSkew}deg)`;
            }

            requestID = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener("scroll", handleScroll);
            cancelAnimationFrame(requestID);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="w-full h-screen flex items-center justify-center overflow-hidden bg-black relative"
        >
            <div
                ref={textRef}
                className="whitespace-nowrap font-victory text-[120px] md:text-[200px] font-black text-white leading-none tracking-tighter will-change-transform"
                style={{
                    // Apply specific font adjustments if needed
                    fontWeight: 900
                }}
            >
                RUNNING OUTLINE RUNNING OUTLINE RUNNING OUTLINE
            </div>
        </div>
    );
};

export default ScrollSkewText;
