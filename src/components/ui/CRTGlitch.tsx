"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// TYPES & INTERFACES
// ============================================

interface CRTGlitchConfig {
    // Content
    text?: string;
    children?: React.ReactNode;

    // Effects intensity (0-1)
    noiseIntensity?: number;      // Static noise amount
    scanlineIntensity?: number;   // Scan line visibility
    rgbShiftIntensity?: number;   // Chromatic aberration
    glitchFrequency?: number;     // How often glitches occur
    flickerIntensity?: number;    // Screen flicker amount
    vhsTracking?: boolean;        // VHS tracking distortion

    // Visual
    phosphorGlow?: boolean;       // CRT phosphor bloom
    curvedScreen?: boolean;       // CRT barrel distortion
    colorTint?: 'green' | 'amber' | 'blue' | 'none';  // Retro monitor tint

    // Animation
    autoGlitch?: boolean;         // Automatic random glitches
    hoverTrigger?: boolean;       // Glitch on hover

    // Styling
    fontSize?: number;
    fontFamily?: string;
}

interface GlitchState {
    active: boolean;
    xShift: number;
    yShift: number;
    rgbSplit: number;
    slice: { top: number; height: number; xOffset: number }[];
}

// ============================================
// DEFAULT CONFIG
// ============================================

const defaultConfig: Required<Omit<CRTGlitchConfig, 'text' | 'children'>> = {
    noiseIntensity: 0.15,
    scanlineIntensity: 0.4,
    rgbShiftIntensity: 0.6,
    glitchFrequency: 0.3,
    flickerIntensity: 0.1,
    vhsTracking: true,
    phosphorGlow: true,
    curvedScreen: true,
    colorTint: 'none',
    autoGlitch: true,
    hoverTrigger: true,
    fontSize: 80,
    fontFamily: "'Big Shoulders Display', sans-serif",
};

// ============================================
// NOISE CANVAS COMPONENT
// ============================================

const NoiseCanvas = React.memo(({ intensity, width, height }: {
    intensity: number;
    width: number;
    height: number;
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = width / 2;  // Lower res for performance
        canvas.height = height / 2;

        const imageData = ctx.createImageData(canvas.width, canvas.height);
        const data = imageData.data;

        const drawNoise = () => {
            for (let i = 0; i < data.length; i += 4) {
                const noise = Math.random() * 255;
                data[i] = noise;     // R
                data[i + 1] = noise; // G
                data[i + 2] = noise; // B
                data[i + 3] = 255 * intensity; // A
            }
            ctx.putImageData(imageData, 0, 0);
            animationRef.current = requestAnimationFrame(drawNoise);
        };

        drawNoise();

        return () => {
            cancelAnimationFrame(animationRef.current);
        };
    }, [intensity, width, height]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none mix-blend-overlay"
            style={{ imageRendering: 'pixelated' }}
        />
    );
});

NoiseCanvas.displayName = 'NoiseCanvas';

// ============================================
// SCAN LINES COMPONENT
// ============================================

const ScanLines = React.memo(({ intensity }: { intensity: number }) => {
    return (
        <div
            className="absolute inset-0 pointer-events-none"
            style={{
                background: `repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 2px,
                    rgba(0, 0, 0, ${intensity * 0.5}) 2px,
                    rgba(0, 0, 0, ${intensity * 0.5}) 4px
                )`,
                zIndex: 10,
            }}
        />
    );
});

ScanLines.displayName = 'ScanLines';

// ============================================
// VHS TRACKING COMPONENT
// ============================================

const VHSTracking = React.memo(({ active }: { active: boolean }) => {
    const [lines, setLines] = useState<{ y: number; height: number; opacity: number }[]>([]);

    useEffect(() => {
        if (!active) {
            setLines([]);
            return;
        }

        const interval = setInterval(() => {
            if (Math.random() > 0.7) {
                const newLines = Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => ({
                    y: Math.random() * 100,
                    height: Math.random() * 8 + 2,
                    opacity: Math.random() * 0.5 + 0.2,
                }));
                setLines(newLines);

                setTimeout(() => setLines([]), 100 + Math.random() * 200);
            }
        }, 500);

        return () => clearInterval(interval);
    }, [active]);

    return (
        <>
            {lines.map((line, i) => (
                <div
                    key={i}
                    className="absolute left-0 right-0 pointer-events-none"
                    style={{
                        top: `${line.y}%`,
                        height: `${line.height}px`,
                        background: `linear-gradient(90deg, 
                            transparent 0%, 
                            rgba(255, 255, 255, ${line.opacity}) 10%, 
                            rgba(255, 255, 255, ${line.opacity}) 90%, 
                            transparent 100%
                        )`,
                        zIndex: 15,
                    }}
                />
            ))}
        </>
    );
});

VHSTracking.displayName = 'VHSTracking';

// ============================================
// RGB SHIFT LAYER
// ============================================

const RGBShiftLayer = React.memo(({
    children,
    intensity,
    glitchActive
}: {
    children: React.ReactNode;
    intensity: number;
    glitchActive: boolean;
}) => {
    const offset = glitchActive ? intensity * 8 : intensity * 2;

    return (
        <div className="relative">
            {/* Red channel */}
            <div
                className="absolute inset-0"
                style={{
                    color: '#ff0000',
                    mixBlendMode: 'screen',
                    transform: `translateX(${-offset}px)`,
                    opacity: 0.8,
                }}
            >
                {children}
            </div>

            {/* Green channel (base) */}
            <div className="relative" style={{ color: '#00ff00', mixBlendMode: 'screen' }}>
                {children}
            </div>

            {/* Blue channel */}
            <div
                className="absolute inset-0"
                style={{
                    color: '#0000ff',
                    mixBlendMode: 'screen',
                    transform: `translateX(${offset}px)`,
                    opacity: 0.8,
                }}
            >
                {children}
            </div>
        </div>
    );
});

RGBShiftLayer.displayName = 'RGBShiftLayer';

// ============================================
// GLITCH SLICE COMPONENT
// ============================================

const GlitchSlices = React.memo(({
    slices,
    children
}: {
    slices: GlitchState['slice'];
    children: React.ReactNode;
}) => {
    if (slices.length === 0) return <>{children}</>;

    return (
        <div className="relative">
            {children}
            {slices.map((slice, i) => (
                <div
                    key={i}
                    className="absolute left-0 right-0 overflow-hidden pointer-events-none"
                    style={{
                        top: `${slice.top}%`,
                        height: `${slice.height}%`,
                        transform: `translateX(${slice.xOffset}px)`,
                        clipPath: `inset(0 0 0 0)`,
                        zIndex: 20,
                    }}
                >
                    <div style={{ transform: `translateY(-${slice.top}%)` }}>
                        {children}
                    </div>
                </div>
            ))}
        </div>
    );
});

GlitchSlices.displayName = 'GlitchSlices';

// ============================================
// MAIN CRT GLITCH COMPONENT
// ============================================

export const CRTGlitch = ({
    config = {},
    className = "",
    containerClassName = "",
}: {
    config?: Partial<CRTGlitchConfig>;
    className?: string;
    containerClassName?: string;
}) => {
    const mergedConfig = useMemo(() => ({ ...defaultConfig, ...config }), [config]);
    const {
        text = "MORPHYS",
        noiseIntensity,
        scanlineIntensity,
        rgbShiftIntensity,
        glitchFrequency,
        flickerIntensity,
        vhsTracking,
        phosphorGlow,
        curvedScreen,
        colorTint,
        autoGlitch,
        hoverTrigger,
        fontSize,
        fontFamily,
    } = { ...mergedConfig, ...config };

    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const [isHovering, setIsHovering] = useState(false);
    const [glitchState, setGlitchState] = useState<GlitchState>({
        active: false,
        xShift: 0,
        yShift: 0,
        rgbSplit: 0,
        slice: [],
    });
    const [flickerOpacity, setFlickerOpacity] = useState(1);
    const [isMobile, setIsMobile] = useState(false);

    // Handle resize
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setDimensions({ width: rect.width, height: rect.height });
            }
            setIsMobile(window.innerWidth < 768);
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    // Generate random glitch
    const triggerGlitch = useCallback(() => {
        const numSlices = Math.floor(Math.random() * 5) + 2;
        const slices = Array.from({ length: numSlices }, () => ({
            top: Math.random() * 80,
            height: Math.random() * 15 + 5,
            xOffset: (Math.random() - 0.5) * 60,
        }));

        setGlitchState({
            active: true,
            xShift: (Math.random() - 0.5) * 20,
            yShift: (Math.random() - 0.5) * 10,
            rgbSplit: Math.random() * 10 + 5,
            slice: slices,
        });

        // Rapid sub-glitches for more chaos
        const subGlitchCount = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < subGlitchCount; i++) {
            setTimeout(() => {
                setGlitchState(prev => ({
                    ...prev,
                    xShift: (Math.random() - 0.5) * 30,
                    slice: prev.slice.map(s => ({
                        ...s,
                        xOffset: (Math.random() - 0.5) * 80,
                    })),
                }));
            }, 50 * (i + 1));
        }

        // End glitch
        setTimeout(() => {
            setGlitchState({
                active: false,
                xShift: 0,
                yShift: 0,
                rgbSplit: 0,
                slice: [],
            });
        }, 150 + Math.random() * 200);
    }, []);

    // Auto glitch effect
    useEffect(() => {
        if (!autoGlitch) return;

        const scheduleGlitch = () => {
            const delay = 2000 / glitchFrequency + Math.random() * 3000;
            return setTimeout(() => {
                if (Math.random() < glitchFrequency) {
                    triggerGlitch();
                }
                scheduleGlitch();
            }, delay);
        };

        const timeout = scheduleGlitch();
        return () => clearTimeout(timeout);
    }, [autoGlitch, glitchFrequency, triggerGlitch]);

    // Flicker effect
    useEffect(() => {
        if (flickerIntensity <= 0) return;

        const interval = setInterval(() => {
            if (Math.random() < 0.3) {
                setFlickerOpacity(1 - Math.random() * flickerIntensity);
                setTimeout(() => setFlickerOpacity(1), 50);
            }
        }, 100);

        return () => clearInterval(interval);
    }, [flickerIntensity]);

    // Hover glitch trigger
    useEffect(() => {
        if (hoverTrigger && isHovering) {
            const interval = setInterval(() => {
                if (Math.random() < 0.4) {
                    triggerGlitch();
                }
            }, 300);
            return () => clearInterval(interval);
        }
    }, [hoverTrigger, isHovering, triggerGlitch]);

    // Color tint values
    const tintColors = {
        green: 'rgba(0, 255, 100, 0.1)',
        amber: 'rgba(255, 176, 0, 0.1)',
        blue: 'rgba(100, 180, 255, 0.1)',
        none: 'transparent',
    };

    const effectiveFontSize = isMobile ? Math.min(fontSize, 48) : fontSize;

    // Content to display
    const content = config.children || (
        <div
            className={`font-black uppercase tracking-wider select-none ${className}`}
            style={{
                fontSize: `${effectiveFontSize}px`,
                fontFamily,
                lineHeight: 1,
                textShadow: phosphorGlow
                    ? '0 0 10px currentColor, 0 0 20px currentColor, 0 0 40px currentColor'
                    : 'none',
            }}
        >
            {text}
        </div>
    );

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-full min-h-[300px] overflow-hidden flex items-center justify-center bg-black ${containerClassName}`}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            style={{
                // CRT curved screen effect
                borderRadius: curvedScreen ? '20px' : '0',
                boxShadow: curvedScreen
                    ? 'inset 0 0 100px rgba(0,0,0,0.9), inset 0 0 50px rgba(0,0,0,0.5)'
                    : 'none',
            }}
        >
            {/* CRT Bezel */}
            {curvedScreen && (
                <div
                    className="absolute inset-0 pointer-events-none rounded-[20px]"
                    style={{
                        background: `radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.8) 100%)`,
                        zIndex: 25,
                    }}
                />
            )}

            {/* Color tint overlay */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundColor: tintColors[colorTint],
                    zIndex: 20,
                }}
            />

            {/* Noise layer */}
            <NoiseCanvas
                intensity={noiseIntensity * (glitchState.active ? 2 : 1)}
                width={dimensions.width}
                height={dimensions.height}
            />

            {/* Scan lines */}
            <ScanLines intensity={scanlineIntensity} />

            {/* VHS tracking distortion */}
            {vhsTracking && <VHSTracking active={glitchState.active || isHovering} />}

            {/* Main content with effects */}
            <motion.div
                className="relative z-5 text-white"
                style={{ opacity: flickerOpacity }}
                animate={{
                    x: glitchState.xShift,
                    y: glitchState.yShift,
                }}
                transition={{ duration: 0.05, ease: 'linear' }}
            >
                <GlitchSlices slices={glitchState.slice}>
                    <RGBShiftLayer
                        intensity={rgbShiftIntensity}
                        glitchActive={glitchState.active}
                    >
                        {content}
                    </RGBShiftLayer>
                </GlitchSlices>
            </motion.div>

            {/* Phosphor glow overlay */}
            {phosphorGlow && (
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.03) 0%, transparent 70%)',
                        zIndex: 30,
                    }}
                />
            )}

            {/* Power-on line effect (occasional) */}
            <AnimatePresence>
                {glitchState.active && Math.random() > 0.7 && (
                    <motion.div
                        initial={{ scaleY: 1, opacity: 1 }}
                        animate={{ scaleY: 0.002, opacity: 0.8 }}
                        exit={{ scaleY: 1, opacity: 0 }}
                        transition={{ duration: 0.1 }}
                        className="absolute inset-0 bg-white pointer-events-none"
                        style={{ zIndex: 50 }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default CRTGlitch;
