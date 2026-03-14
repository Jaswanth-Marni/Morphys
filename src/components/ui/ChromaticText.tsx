"use client";

import React from "react";
import { cn } from "@/lib/utils";

// ============================================
// TYPES
// ============================================

export interface ChromaticTextConfig {
    text: string;
    /** Chromatic offset in pixels */
    offset: number;
    /** Outer glow blur radius */
    glowRadius: number;
    /** Enable bottom fade to dark */
    bottomFade: boolean;
}

export interface ChromaticTextProps {
    config?: Partial<ChromaticTextConfig>;
    className?: string;
    text?: string;
}

// ============================================
// DEFAULT CONFIG
// ============================================

const defaultConfig: ChromaticTextConfig = {
    text: "MORPHYS",
    offset: 6,
    glowRadius: 30,
    bottomFade: true,
};

// ============================================
// MAIN COMPONENT
// ============================================

export function ChromaticText({ config: userConfig, className, text }: ChromaticTextProps) {
    const config = { ...defaultConfig, ...userConfig };
    if (text !== undefined) config.text = text;

    const { offset, glowRadius } = config;
    const glowOffset = offset * 5;
    const midOffset = offset * 2.5;

    return (
        <div
            className={cn(
                "relative flex items-center justify-center font-black tracking-tighter uppercase select-none w-full h-full bg-black",
                className
            )}
        >
            {/* Added generous padding here so the heavy blur layers never hit the bounding box edges and clip. */}
            <div className="relative inline-flex items-center justify-center px-24 py-12" style={{ isolation: "isolate" }}>

                {/* Invisible sizer */}
                <span className="relative opacity-0 pointer-events-none" aria-hidden="true">
                    {config.text}
                </span>

                {/* ========== OUTER GLOW (largest blur, widest color separation) ========== */}

                <span
                    className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-screen"
                    style={{
                        color: "#ff2200",
                        filter: `blur(${glowRadius * 1.2}px)`,
                        transform: `translate(-${glowOffset}px, -${offset}px)`,
                    }}
                    aria-hidden="true"
                >
                    {config.text}
                </span>

                <span
                    className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-screen"
                    style={{
                        color: "#00ff44",
                        filter: `blur(${glowRadius * 1.2}px)`,
                    }}
                    aria-hidden="true"
                >
                    {config.text}
                </span>

                <span
                    className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-screen"
                    style={{
                        color: "#0044ff",
                        filter: `blur(${glowRadius * 1.2}px)`,
                        transform: `translate(${glowOffset}px, ${offset}px)`,
                    }}
                    aria-hidden="true"
                >
                    {config.text}
                </span>

                {/* ========== MID GLOW (medium blur, medium separation) ========== */}

                <span
                    className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-screen"
                    style={{
                        color: "#ff0000",
                        filter: `blur(${glowRadius * 0.5}px)`,
                        transform: `translate(-${midOffset}px, -${offset * 0.5}px)`,
                    }}
                    aria-hidden="true"
                >
                    {config.text}
                </span>

                <span
                    className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-screen"
                    style={{
                        color: "#00ff00",
                        filter: `blur(${glowRadius * 0.5}px)`,
                    }}
                    aria-hidden="true"
                >
                    {config.text}
                </span>

                <span
                    className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-screen"
                    style={{
                        color: "#0000ff",
                        filter: `blur(${glowRadius * 0.5}px)`,
                        transform: `translate(${midOffset}px, ${offset * 0.5}px)`,
                    }}
                    aria-hidden="true"
                >
                    {config.text}
                </span>

                {/* ========== TIGHT FRINGE (slight blur, close to the sharp text) ========== */}

                <span
                    className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-screen"
                    style={{
                        color: "#ff0000",
                        filter: `blur(${offset * 0.6}px)`,
                        transform: `translate(-${offset * 1.5}px, -${offset * 0.3}px)`,
                    }}
                    aria-hidden="true"
                >
                    {config.text}
                </span>

                <span
                    className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-screen"
                    style={{
                        color: "#00ff00",
                        filter: `blur(${offset * 0.6}px)`,
                    }}
                    aria-hidden="true"
                >
                    {config.text}
                </span>

                <span
                    className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-screen"
                    style={{
                        color: "#0000ff",
                        filter: `blur(${offset * 0.6}px)`,
                        transform: `translate(${offset * 1.5}px, ${offset * 0.3}px)`,
                    }}
                    aria-hidden="true"
                >
                    {config.text}
                </span>

                {/* ========== CRISP RGB CHANNELS (sharp text edges) ========== */}

                <span
                    className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-screen"
                    style={{
                        color: "#ff0000",
                        transform: `translate(-${offset}px, -${offset * 0.2}px)`,
                    }}
                    aria-hidden="true"
                >
                    {config.text}
                </span>

                <span
                    className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-screen"
                    style={{
                        color: "#00ff00",
                    }}
                    aria-hidden="true"
                >
                    {config.text}
                </span>

                <span
                    className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-screen"
                    style={{
                        color: "#0000ff",
                        transform: `translate(${offset}px, ${offset * 0.2}px)`,
                    }}
                    aria-hidden="true"
                >
                    {config.text}
                </span>

                {/* ========== BOTTOM FADE (warm-toned gradient) ========== */}
                {config.bottomFade && (
                    <div
                        className="absolute inset-0 z-30 pointer-events-none"
                        style={{
                            background: "linear-gradient(to bottom, transparent 20%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.6) 80%, rgba(0,0,0,0.85) 100%)",
                        }}
                    />
                )}
            </div>
        </div>
    );
}

// ============================================
// PREVIEW COMPONENT
// ============================================

export function ChromaticTextPreview() {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-transparent overflow-hidden relative rounded-xl font-sans">
            <ChromaticText
                className="text-4xl md:text-5xl"
                config={{
                    offset: 3,
                    glowRadius: 15,
                    bottomFade: false,
                }}
            />
        </div>
    );
}

export default ChromaticText;
