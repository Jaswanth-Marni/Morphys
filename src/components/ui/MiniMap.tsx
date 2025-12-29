"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { canvasStylePositions, CANVAS_BOUNDS } from "@/data/canvasLayout";
import { uiStyles } from "@/data/styles";

type MiniMapProps = {
    activeStyleId: string;
    viewportPosition: { x: number; y: number }; // Canvas offset in pixels
    onNavigate: (styleId: string) => void;
    className?: string;
};

export const MiniMap = ({
    activeStyleId,
    viewportPosition,
    onNavigate,
    className = ""
}: MiniMapProps) => {
    // Map dimensions
    const mapWidth = 140;
    const mapHeight = 120;
    const padding = 15;

    // World bounds from canvas layout (in percentage units)
    const worldWidth = CANVAS_BOUNDS.maxX - CANVAS_BOUNDS.minX || 200;
    const worldHeight = CANVAS_BOUNDS.maxY - CANVAS_BOUNDS.minY || 200;

    // Scale to fit all positions in minimap
    const scale = useMemo(() => {
        const scaleX = (mapWidth - padding * 2) / worldWidth;
        const scaleY = (mapHeight - padding * 2) / worldHeight;
        return Math.min(scaleX, scaleY);
    }, [worldWidth, worldHeight]);

    // Center of the minimap
    const mapCenterX = mapWidth / 2;
    const mapCenterY = mapHeight / 2;

    // Convert world position (% from center) to minimap position (px)
    // This keeps the same orientation as the canvas:
    // - Positive X = Right in canvas = Right in minimap
    // - Positive Y = Down in canvas = Down in minimap
    const worldToMap = (worldX: number, worldY: number) => ({
        x: mapCenterX + worldX * scale,
        y: mapCenterY + worldY * scale,
    });

    // Convert canvas offset to viewport position on minimap
    // The offset is negative when viewing positive positions
    const canvasToMap = (offsetX: number, offsetY: number) => {
        // offsetX/Y are in % units (e.g., -100 means viewing something at x=100)
        // We need to show where the VIEWPORT is, which is the negative of offset
        return worldToMap(-offsetX, -offsetY);
    };

    // Calculate current viewport position from the offset prop
    // viewportPosition is in pixels, convert to percentage
    const offsetPercent = {
        x: -viewportPosition.x / (typeof window !== 'undefined' ? window.innerWidth : 1920) * 100,
        y: -viewportPosition.y / (typeof window !== 'undefined' ? window.innerHeight : 1080) * 100,
    };

    const viewportMapPos = canvasToMap(offsetPercent.x, offsetPercent.y);

    // Viewport indicator size (represents the visible screen area)
    const viewportIndicatorSize = Math.max(100 * scale, 8);

    return (
        <motion.div
            className={`fixed bottom-6 right-6 z-[210] select-none ${className}`}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4, ease: "easeOut" }}
        >
            {/* Glassmorphism container */}
            <div
                className="relative rounded-xl overflow-hidden"
                style={{
                    width: mapWidth,
                    height: mapHeight,
                    background: "rgba(128, 128, 128, 0.15)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    border: "1px solid color-mix(in srgb, var(--foreground) 10%, transparent)",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
                }}
            >
                {/* Title */}
                <div
                    className="absolute top-1.5 left-3 text-[10px] uppercase tracking-wider opacity-50 z-10"
                    style={{ fontFamily: "'Clash Display Variable', sans-serif" }}
                >
                    Map
                </div>

                {/* Grid lines for reference */}
                <div
                    className="absolute opacity-10"
                    style={{
                        left: mapCenterX,
                        top: padding,
                        bottom: padding,
                        width: 1,
                        background: "white",
                    }}
                />
                <div
                    className="absolute opacity-10"
                    style={{
                        top: mapCenterY,
                        left: padding,
                        right: padding,
                        height: 1,
                        background: "white",
                    }}
                />

                {/* Style position dots - FIXED positions */}
                {canvasStylePositions.map((pos) => {
                    const style = uiStyles.find(s => s.id === pos.id);
                    if (!style) return null;

                    // Convert world position to map position
                    const mapPos = worldToMap(pos.x, pos.y);
                    const isActive = pos.id === activeStyleId;

                    return (
                        <button
                            key={pos.id}
                            className="absolute cursor-pointer flex items-center justify-center transition-transform hover:scale-125 active:scale-95"
                            style={{
                                left: mapPos.x,
                                top: mapPos.y,
                                transform: "translate(-50%, -50%)",
                                width: 20,
                                height: 20,
                                padding: 0,
                                background: "transparent",
                                border: "none",
                                zIndex: isActive ? 5 : 1,
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onNavigate(pos.id);
                            }}
                            aria-label={`Navigate to ${style.title}`}
                        >
                            {/* Visible dot */}
                            <div
                                className="rounded-full transition-all duration-200"
                                style={{
                                    width: isActive ? 10 : 6,
                                    height: isActive ? 10 : 6,
                                    backgroundColor: style.accentColor,
                                    boxShadow: isActive
                                        ? `0 0 10px ${style.accentColor}, 0 0 20px ${style.accentColor}60`
                                        : `0 0 4px ${style.accentColor}40`,
                                }}
                            />
                        </button>
                    );
                })}

                {/* Viewport indicator - Shows current position, THIS MOVES */}
                <motion.div
                    className="absolute pointer-events-none z-0"
                    style={{
                        width: viewportIndicatorSize,
                        height: viewportIndicatorSize,
                        transform: "translate(-50%, -50%)",
                        border: "1.5px solid rgba(255, 255, 255, 0.6)",
                        borderRadius: 2,
                        background: "rgba(255, 255, 255, 0.08)",
                    }}
                    animate={{
                        left: viewportMapPos.x,
                        top: viewportMapPos.y,
                    }}
                    transition={{
                        type: "tween",
                        duration: 0.1,
                        ease: "linear",
                    }}
                />

                {/* Center dot inside viewport indicator */}
                <motion.div
                    className="absolute pointer-events-none z-0"
                    style={{
                        width: 4,
                        height: 4,
                        borderRadius: "50%",
                        background: "rgba(255, 255, 255, 0.9)",
                        transform: "translate(-50%, -50%)",
                    }}
                    animate={{
                        left: viewportMapPos.x,
                        top: viewportMapPos.y,
                    }}
                    transition={{
                        type: "tween",
                        duration: 0.1,
                        ease: "linear",
                    }}
                />
            </div>
        </motion.div>
    );
};
