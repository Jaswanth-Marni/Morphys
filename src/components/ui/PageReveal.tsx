"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface PageRevealConfig {
    logoText: string;
    logoFontSize: number;
    splitCount: {
        mobile: number;
        tablet: number;
        desktop: number;
    };
    logoBlurDuration: number;
    logoHoldDuration: number;
    slitAnimationDuration: number;
    slitStaggerDelay: number;
    backgroundColor: string;
    logoColor: string;
}

export interface PageRevealProps {
    config?: Partial<PageRevealConfig>;
    onComplete?: () => void;
    className?: string;
    children?: React.ReactNode;
    autoStart?: boolean;
    isPreview?: boolean;
    contained?: boolean; // If true, uses absolute positioning within parent (sandbox mode). If false, uses fixed for full viewport.
}

// ============================================
// DEFAULT CONFIG
// ============================================

const defaultConfig: PageRevealConfig = {
    logoText: "MORPHYS",
    logoFontSize: 80,
    splitCount: {
        mobile: 10,
        tablet: 15,
        desktop: 20,
    },
    logoBlurDuration: 0.8,
    logoHoldDuration: 0.5,
    logoBlurExit: 0.6,
    slitAnimationDuration: 0.6,
    slitStaggerDelay: 0.06,
    backgroundColor: "#000000",
    logoColor: "#ffffff",
} as PageRevealConfig & { logoBlurExit: number };

// ============================================
// HELPER FUNCTIONS
// ============================================

function getSplitCount(width: number, config: PageRevealConfig): number {
    if (width < 768) return config.splitCount.mobile;
    if (width < 1024) return config.splitCount.tablet;
    return config.splitCount.desktop;
}

// ============================================
// LOGO COMPONENT
// ============================================

interface LogoProps {
    text: string;
    fontSize: number;
    color: string;
    phase: 'entering' | 'visible' | 'exiting' | 'hidden';
    blurDuration: number;
    holdDuration: number;
    exitDuration: number;
    onExitComplete?: () => void;
}

function Logo({
    text,
    fontSize,
    color,
    phase,
    blurDuration,
    exitDuration,
    onExitComplete
}: LogoProps) {
    const variants: Variants = {
        entering: {
            filter: 'blur(30px)',
            opacity: 0,
            scale: 0.8,
        },
        visible: {
            filter: 'blur(0px)',
            opacity: 1,
            scale: 1,
            transition: {
                duration: blurDuration,
                ease: [0.22, 1, 0.36, 1],
            }
        },
        exiting: {
            filter: 'blur(30px)',
            opacity: 0,
            scale: 0.9,
            transition: {
                duration: exitDuration,
                ease: [0.22, 1, 0.36, 1],
            }
        },
        hidden: {
            filter: 'blur(30px)',
            opacity: 0,
            scale: 0.8,
        }
    };

    return (
        <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
            initial="entering"
            animate={phase}
            variants={variants}
            onAnimationComplete={() => {
                if (phase === 'exiting' && onExitComplete) {
                    onExitComplete();
                }
            }}
        >
            <h1
                className="font-bold tracking-wider select-none"
                style={{
                    fontSize: `clamp(32px, 10vw, ${fontSize}px)`,
                    color,
                    fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                }}
            >
                {text}
            </h1>
        </motion.div>
    );
}

// ============================================
// SPLIT OVERLAY COMPONENT
// ============================================

interface SplitOverlayProps {
    splitCount: number;
    backgroundColor: string;
    isAnimating: boolean;
    duration: number;
    staggerDelay: number;
    onComplete?: () => void;
}

function SplitOverlay({
    splitCount,
    backgroundColor,
    isAnimating,
    duration,
    staggerDelay,
    onComplete,
}: SplitOverlayProps) {
    const slits = useMemo(() => {
        return Array.from({ length: splitCount }, (_, i) => ({
            index: i,
            delay: i * staggerDelay,
        }));
    }, [splitCount, staggerDelay]);

    return (
        <div className="absolute inset-0 flex overflow-hidden pointer-events-none">
            {slits.map(({ index, delay }) => (
                <motion.div
                    key={index}
                    className="h-full"
                    style={{
                        width: `${100 / splitCount}%`,
                        backgroundColor,
                    }}
                    initial={{ y: 0 }}
                    animate={isAnimating ? { y: '-100%' } : { y: 0 }}
                    transition={{
                        duration,
                        delay,
                        ease: [0.65, 0, 0.35, 1], // Custom easing for staircase effect
                    }}
                    onAnimationComplete={() => {
                        // Call onComplete when the LAST slit finishes its animation
                        if (isAnimating && index === splitCount - 1 && onComplete) {
                            // Small delay to ensure visual completion
                            setTimeout(onComplete, 50);
                        }
                    }}
                />
            ))}
        </div>
    );
}

// ============================================
// PREVIEW SPLIT OVERLAY (for demo purposes)
// ============================================

interface PreviewSplitOverlayProps {
    splitCount: number;
    backgroundColor: string;
    animationProgress: number; // 0 to 1
}

function PreviewSplitOverlay({
    splitCount,
    backgroundColor,
    animationProgress,
}: PreviewSplitOverlayProps) {
    const slits = useMemo(() => {
        return Array.from({ length: splitCount }, (_, i) => ({
            index: i,
            offset: Math.max(0, Math.min(1, (animationProgress * splitCount - i) / 1)),
        }));
    }, [splitCount, animationProgress]);

    return (
        <div className="absolute inset-0 flex overflow-hidden pointer-events-none">
            {slits.map(({ index, offset }) => (
                <div
                    key={index}
                    className="h-full"
                    style={{
                        width: `${100 / splitCount}%`,
                        backgroundColor,
                        transform: `translateY(${-offset * 100}%)`,
                    }}
                />
            ))}
        </div>
    );
}

// ============================================
// MAIN PAGE REVEAL COMPONENT
// ============================================

export function PageReveal({
    config: userConfig,
    onComplete,
    className = "",
    children,
    autoStart = true,
    isPreview = false,
    contained = true, // Default to sandbox mode (contained within parent)
}: PageRevealProps) {
    const config = useMemo(() => ({ ...defaultConfig, ...userConfig }), [userConfig]);

    const [phase, setPhase] = useState<'logo-enter' | 'logo-hold' | 'logo-exit' | 'curtain' | 'complete'>(
        autoStart ? 'logo-enter' : 'complete'
    );
    const [splitCount, setSplitCount] = useState(config.splitCount.desktop);
    const [isOverlayVisible, setIsOverlayVisible] = useState(autoStart);

    // Preview animation state
    const [previewProgress, setPreviewProgress] = useState(0);
    const previewAnimationRef = useRef<number | null>(null);

    // Handle responsive split count
    useEffect(() => {
        const updateSplitCount = () => {
            setSplitCount(getSplitCount(window.innerWidth, config));
        };

        updateSplitCount();
        window.addEventListener('resize', updateSplitCount);
        return () => window.removeEventListener('resize', updateSplitCount);
    }, [config]);

    // Phase transitions
    useEffect(() => {
        if (isPreview) return;

        if (phase === 'logo-enter') {
            // Wait for logo to finish entering, then hold
            const timer = setTimeout(() => {
                setPhase('logo-hold');
            }, config.logoBlurDuration * 1000);
            return () => clearTimeout(timer);
        }

        if (phase === 'logo-hold') {
            // Hold the logo visible, then start exit
            const timer = setTimeout(() => {
                setPhase('logo-exit');
            }, config.logoHoldDuration * 1000);
            return () => clearTimeout(timer);
        }
    }, [phase, config.logoBlurDuration, config.logoHoldDuration, isPreview]);

    // Handle logo exit complete
    const handleLogoExitComplete = useCallback(() => {
        if (!isPreview) {
            setPhase('curtain');
        }
    }, [isPreview]);

    // Handle curtain animation complete
    const handleCurtainComplete = useCallback(() => {
        if (!isPreview) {
            setPhase('complete');
            setIsOverlayVisible(false);
            if (onComplete) {
                onComplete();
            }
        }
    }, [onComplete, isPreview]);

    // Preview animation loop
    useEffect(() => {
        if (!isPreview) return;

        let startTime: number | null = null;
        const totalDuration = 4000; // 4 second loop

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = (elapsed % totalDuration) / totalDuration;

            // Map progress to different phases
            // 0-0.2: Logo enter
            // 0.2-0.4: Logo visible
            // 0.4-0.6: Logo exit
            // 0.6-1.0: Curtain reveal
            if (progress < 0.2) {
                // Logo entering - blur decreasing
                setPreviewProgress(0);
            } else if (progress < 0.4) {
                // Logo visible
                setPreviewProgress(0);
            } else if (progress < 0.6) {
                // Logo exiting
                setPreviewProgress(0);
            } else {
                // Curtain revealing
                setPreviewProgress((progress - 0.6) / 0.4);
            }

            previewAnimationRef.current = requestAnimationFrame(animate);
        };

        previewAnimationRef.current = requestAnimationFrame(animate);

        return () => {
            if (previewAnimationRef.current) {
                cancelAnimationFrame(previewAnimationRef.current);
            }
        };
    }, [isPreview]);

    // Get logo phase for animation
    const getLogoPhase = (): 'entering' | 'visible' | 'exiting' | 'hidden' => {
        if (isPreview) {
            // For preview, calculate based on previewProgress
            return 'visible';
        }

        switch (phase) {
            case 'logo-enter':
                return 'visible';
            case 'logo-hold':
                return 'visible';
            case 'logo-exit':
                return 'exiting';
            default:
                return 'hidden';
        }
    };

    // Extended config type with logoBlurExit
    const extendedConfig = config as typeof config & { logoBlurExit?: number };

    return (
        <div className={`relative w-full h-full ${className}`}>
            {/* Content underneath */}
            <div className="relative w-full h-full">
                {children}
            </div>

            {/* Overlay animation */}
            <AnimatePresence>
                {(isOverlayVisible || isPreview) && (
                    <motion.div
                        className={contained ? "absolute inset-0 z-10" : "fixed inset-0 z-[9999]"}
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Split overlay */}
                        {isPreview ? (
                            <PreviewSplitOverlay
                                splitCount={splitCount}
                                backgroundColor={config.backgroundColor}
                                animationProgress={previewProgress}
                            />
                        ) : (
                            <SplitOverlay
                                splitCount={splitCount}
                                backgroundColor={config.backgroundColor}
                                isAnimating={phase === 'curtain'}
                                duration={config.slitAnimationDuration}
                                staggerDelay={config.slitStaggerDelay}
                                onComplete={handleCurtainComplete}
                            />
                        )}

                        {/* Logo */}
                        {(phase !== 'curtain' && phase !== 'complete') && (
                            <Logo
                                text={config.logoText}
                                fontSize={config.logoFontSize}
                                color={config.logoColor}
                                phase={getLogoPhase()}
                                blurDuration={config.logoBlurDuration}
                                holdDuration={config.logoHoldDuration}
                                exitDuration={extendedConfig.logoBlurExit ?? 0.6}
                                onExitComplete={handleLogoExitComplete}
                            />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ============================================
// STATIC PREVIEW COMPONENT
// ============================================

export function PageRevealPreview() {
    const splitCount = 8;
    const backgroundColor = "#000000";

    return (
        <div className="relative w-full h-full overflow-hidden" style={{ backgroundColor }}>
            {/* Static preview showing the split overlay mid-animation */}
            <div className="absolute inset-0 flex overflow-hidden">
                {Array.from({ length: splitCount }, (_, i) => {
                    // Create a staircase static preview
                    const offset = (i / splitCount) * 40; // Percentage offset for staircase effect
                    return (
                        <div
                            key={i}
                            className="h-full"
                            style={{
                                width: `${100 / splitCount}%`,
                                backgroundColor,
                                transform: `translateY(-${offset}%)`,
                                borderRight: i < splitCount - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                            }}
                        />
                    );
                })}
            </div>

            {/* Logo in the center with slight blur */}
            <div className="absolute inset-0 flex items-center justify-center">
                <h1
                    className="font-bold tracking-wider select-none"
                    style={{
                        fontSize: 'clamp(16px, 6vw, 32px)',
                        color: '#ffffff',
                        fontFamily: "'Inter', system-ui, sans-serif",
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        opacity: 0.9,
                        filter: 'blur(1px)',
                    }}
                >
                    MORPHYS
                </h1>
            </div>
        </div>
    );
}

export default PageReveal;
