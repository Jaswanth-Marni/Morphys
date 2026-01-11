"use client";

import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { cn } from "@/lib/utils";

// ============================================
// TYPES
// ============================================

export interface DiffuseTextConfig {
    text: string;
    subtextLeft?: string;
    subtextRight?: string;
    blurLevel: number;
    intensity: number;
    color: string;
    backgroundColor: string; // Base background color (fallback)
}

export interface DiffuseTextProps {
    config?: Partial<DiffuseTextConfig>;
    className?: string;
}

// ============================================
// DEFAULT CONFIG
// ============================================

const defaultConfig: DiffuseTextConfig = {
    text: "MORPHYS",
    subtextLeft: "Barcelona Arts Summer School",
    subtextRight: "by ESCAC / ESMUC / Institut del Teatre",
    blurLevel: 10,
    intensity: 1,
    color: "#ffffff",
    backgroundColor: "#7ca5b8",
};

// ============================================
// VIDEO BACKGROUND COMPONENT
// ============================================

function BackgroundVideo() {
    return (
        <div className="absolute inset-0 overflow-hidden bg-slate-900">
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover blur-[20px] scale-110"
            >
                <source src="/vid.mp4" type="video/mp4" />
            </video>
            {/* Minimal overlay just to ensure text pops slightly if video is too bright */}
            <div className="absolute inset-0 bg-black/10" />
        </div>
    );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function DiffuseText({ config: userConfig, className }: DiffuseTextProps) {
    const config = { ...defaultConfig, ...userConfig };

    // Helper to calculate responsive font size based on character count
    const getFontSize = (length: number) => {
        if (length <= 2) return "35vw";
        if (length <= 4) return "28vw";
        if (length <= 6) return "22vw";
        if (length <= 9) return "15vw";
        return "10vw";
    };

    const fontSize = getFontSize(config.text.length);

    return (
        <div
            className={cn("relative w-full h-full overflow-hidden font-sans", className)}
        >
            {/* 1. Background Video (Clean) */}
            <BackgroundVideo />

            {/* 2. Main Center Content - Diffuse Glow Effect */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10">
                <div className="relative w-full text-center px-4">

                    {/* Layer 1: Deep Atmospheric Halo (The softest/widest blur) */}
                    <motion.h1
                        className="absolute inset-0 flex items-center justify-center font-black leading-none tracking-tighter"
                        style={{
                            fontSize,
                            color: config.color,
                            opacity: 0.4,
                            filter: `blur(${config.blurLevel * 4}px)`,
                        }}
                        animate={{
                            opacity: [0.4, 0.6, 0.4],
                            filter: [`blur(${config.blurLevel * 4}px)`, `blur(${config.blurLevel * 5}px)`, `blur(${config.blurLevel * 4}px)`]
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                        {config.text}
                    </motion.h1>

                    {/* Layer 2: The Soft Glow (The middle blur) */}
                    <motion.h1
                        className="absolute inset-0 flex items-center justify-center font-black leading-none tracking-tighter"
                        style={{
                            fontSize,
                            color: config.color,
                            opacity: 0.3, // Even lighter transparency
                            filter: `blur(${config.blurLevel}px)`,
                        }}
                        animate={{
                            filter: [`blur(${config.blurLevel}px)`, `blur(${config.blurLevel * 1.5}px)`, `blur(${config.blurLevel}px)`]
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                        {config.text}
                    </motion.h1>

                    {/* Layer 3: The Core (Soft but Defined) */}
                    {/* Reduced base blur slightly to make it less intense but still soft */}
                    <motion.h1
                        className="relative font-black leading-none tracking-tighter z-10"
                        style={{
                            fontSize,
                            color: config.color,
                            opacity: 0.4, // Significant transparency
                            filter: `blur(${config.blurLevel * 0.2}px)`,
                        }}
                        animate={{
                            filter: [`blur(${config.blurLevel * 0.2}px)`, `blur(${config.blurLevel * 0.3}px)`, `blur(${config.blurLevel * 0.2}px)`]
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                        {config.text}
                    </motion.h1>

                </div>
            </div>

            {/* 3. Foreground UI Layer (Empty as per request) */}
            <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-12 z-20 pointer-events-none">
                <div className="w-full flex justify-between" />
            </div>
        </div>
    );
}

// ============================================
// PREVIEW COMPONENT
// ============================================

export function DiffuseTextPreview() {
    return (
        <div className="w-full h-full relative overflow-hidden bg-slate-900">
            <div className="absolute inset-0 bg-blue-900/50" />
            <div className="absolute inset-0 flex items-center justify-center z-10">
                <h1 className="text-5xl font-black tracking-tighter text-white blur-[2px]">
                    MORPHYS
                </h1>
            </div>
        </div>
    );
}

export default DiffuseText;
