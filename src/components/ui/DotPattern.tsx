"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface DotPatternProps {
    className?: string;
}

const DotPattern: React.FC<DotPatternProps> = ({ className = "" }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Configuration
        const dotSpacing = 40; // Space between dots
        const baseDotRadius = 2; // Dot size - increased for visibility
        const waveAmplitude = 8; // How much dots move up/down
        const waveFrequency = 0.02; // Wave frequency
        const animationSpeed = 0.02; // Speed of horizontal wave movement

        let time = 0;
        let dots: { x: number; y: number; baseY: number; row: number }[] = [];

        const resizeCanvas = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();

            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;

            ctx.scale(dpr, dpr);

            // Regenerate dots on resize
            generateDots(rect.width, rect.height);
        };

        const generateDots = (width: number, height: number) => {
            dots = [];
            const cols = Math.ceil(width / dotSpacing) + 1;
            const rows = Math.ceil(height / dotSpacing) + 1;

            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const x = col * dotSpacing;
                    const y = row * dotSpacing;
                    dots.push({ x, y, baseY: y, row });
                }
            }
        };

        const getThemeColor = () => {
            const isDark = !document.documentElement.hasAttribute("data-theme") ||
                document.documentElement.getAttribute("data-theme") === "dark";

            // More visible colors
            return isDark
                ? "rgba(255, 255, 255, 0.25)" // More visible white for dark mode
                : "rgba(0, 0, 0, 0.35)";       // More visible black for light mode
        };

        const animate = () => {
            const rect = canvas.getBoundingClientRect();
            ctx.clearRect(0, 0, rect.width, rect.height);

            const dotColor = getThemeColor();

            dots.forEach((dot) => {
                // Alternate direction based on row (even rows: left-to-right, odd rows: right-to-left)
                const direction = dot.row % 2 === 0 ? 1 : -1;

                // Calculate wave offset based on x position and time
                // Direction multiplier reverses the wave movement for alternate rows
                const waveOffset = Math.sin((dot.x * waveFrequency) + (time * direction)) * waveAmplitude;

                // Secondary wave for more organic feel (also alternates direction)
                const secondaryWave = Math.sin((dot.x * waveFrequency * 0.5) + (time * 0.7 * direction)) * (waveAmplitude * 0.3);

                const y = dot.baseY + waveOffset + secondaryWave;

                // Subtle size variation based on wave position
                const sizeVariation = Math.sin((dot.x * waveFrequency) + (time * direction)) * 0.3 + 1;
                const currentRadius = baseDotRadius * sizeVariation;

                ctx.beginPath();
                ctx.arc(dot.x, y, currentRadius, 0, Math.PI * 2);
                ctx.fillStyle = dotColor;
                ctx.fill();
            });

            time += animationSpeed;
            animationRef.current = requestAnimationFrame(animate);
        };

        // Initial setup
        resizeCanvas();
        animate();

        // Handle resize
        window.addEventListener("resize", resizeCanvas);

        // Watch for theme changes
        const observer = new MutationObserver(() => {
            // Theme changed, colors will update on next frame
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["data-theme"],
        });

        return () => {
            window.removeEventListener("resize", resizeCanvas);
            cancelAnimationFrame(animationRef.current);
            observer.disconnect();
        };
    }, []);

    return (
        <motion.canvas
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            ref={canvasRef}
            className={`fixed inset-0 pointer-events-none z-0 ${className}`}
            style={{
                width: "100%",
                height: "100%",
            }}
            aria-hidden="true"
        />
    );
};

export { DotPattern };
