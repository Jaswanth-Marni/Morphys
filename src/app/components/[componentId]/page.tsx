"use client";

import { useParams, notFound } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { getComponentByIdLite, ComponentDataLite as ComponentData } from "@/data/componentsDataLite";
import { useNavigationLoading } from "@/context/NavigationLoadingContext";

// Type imports only (no runtime cost)
import type { FlipGridConfig, GridPattern, EasingType, SpeedType } from "@/components/ui/FlipGrid";
import type { AsciiSimulationConfig, AsciiShape } from "@/components/ui/AsciiSimulation";
import type { LiquidMorphConfig } from "@/components/ui/LiquidMorph";
import type { PageRevealConfig } from "@/components/ui/PageReveal";
import type { ImageTrailCursorConfig } from "@/components/ui/ImageTrailCursor";

// Lightweight components - keep static
import { Slider } from "@/components/ui/Slider";
import { ComponentNavigation } from "@/components/ui/ComponentNavigation";

// Loading placeholder for dynamic components
const ComponentLoader = () => (
    <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground/60 rounded-full animate-spin" />
            <span className="text-sm text-foreground/50">Loading component...</span>
        </div>
    </div>
);

// Dynamic imports with code splitting - each component loads ONLY when needed
const FlipGrid = dynamic(() => import("@/components/ui/FlipGrid").then(mod => ({ default: mod.FlipGrid })), {
    loading: ComponentLoader,
    ssr: false
});

const AsciiSimulation = dynamic(() => import("@/components/ui/AsciiSimulation").then(mod => ({ default: mod.AsciiSimulation })), {
    loading: ComponentLoader,
    ssr: false
});

const LiquidMorph = dynamic(() => import("@/components/ui/LiquidMorph").then(mod => ({ default: mod.LiquidMorph })), {
    loading: ComponentLoader,
    ssr: false
});

const PageReveal = dynamic(() => import("@/components/ui/PageReveal").then(mod => ({ default: mod.PageReveal })), {
    loading: ComponentLoader,
    ssr: false
});

const NavbarMenu = dynamic(() => import("@/components/ui/NavbarMenu").then(mod => ({ default: mod.NavbarMenu })), {
    loading: ComponentLoader,
    ssr: false
});

const NavbarMenu2 = dynamic(() => import("@/components/ui/NavbarMenu2").then(mod => ({ default: mod.NavbarMenu2 })), {
    loading: ComponentLoader,
    ssr: false
});

const SpotlightSearch = dynamic(() => import("@/components/ui/SpotlightSearch"), {
    loading: ComponentLoader,
    ssr: false
});

const ImageTrailCursor = dynamic(() => import("@/components/ui/ImageTrailCursor"), {
    loading: ComponentLoader,
    ssr: false
});

const RealityLens = dynamic(() => import("@/components/ui/RealityLens").then(mod => ({ default: mod.RealityLens })), {
    loading: ComponentLoader,
    ssr: false
});

const ScrollToRevealSandbox = dynamic(() => import("@/components/ui/ScrollToReveal").then(mod => ({ default: mod.ScrollToRevealSandbox })), {
    loading: ComponentLoader,
    ssr: false
});

const DiffuseText = dynamic(() => import("@/components/ui/DiffuseText").then(mod => ({ default: mod.DiffuseText })), {
    loading: ComponentLoader,
    ssr: false
});

const DiagonalFocus = dynamic(() => import("@/components/ui/DiagonalFocus").then(mod => ({ default: mod.DiagonalFocus })), {
    loading: ComponentLoader,
    ssr: false
});

const NotificationStack = dynamic(() => import("@/components/ui/NotificationStack").then(mod => ({ default: mod.NotificationStack })), {
    loading: ComponentLoader,
    ssr: false
});

const TextPressure = dynamic(() => import("@/components/ui/TextPressure").then(mod => ({ default: mod.TextPressure })), {
    loading: ComponentLoader,
    ssr: false
});

const FluidHeight = dynamic(() => import("@/components/ui/FluidHeight"), {
    loading: ComponentLoader,
    ssr: false
});

const TextMirror = dynamic(() => import("@/components/ui/TextMirror"), {
    loading: ComponentLoader,
    ssr: false
});

const StepMorph = dynamic(() => import("@/components/ui/StepMorph"), {
    loading: ComponentLoader,
    ssr: false
});

const CenterMenu = dynamic(() => import("@/components/ui/CenterMenu").then(mod => ({ default: mod.CenterMenu })), {
    loading: ComponentLoader,
    ssr: false
});

const GlassSurge = dynamic(() => import("@/components/ui/GlassSurge"), {
    loading: ComponentLoader,
    ssr: false
});

const LayeredImageShowcase = dynamic(() => import("@/components/ui/LayeredImageShowcase").then(mod => ({ default: mod.LayeredImageShowcase })), {
    loading: ComponentLoader,
    ssr: false
});

const ImpactText = dynamic(() => import("@/components/ui/ImpactText").then(mod => ({ default: mod.ImpactText })), {
    loading: ComponentLoader,
    ssr: false
});

const ClothTicker = dynamic(() => import("@/components/ui/ClothTicker").then(mod => ({ default: mod.ClothTicker })), {
    loading: ComponentLoader,
    ssr: false
});

const WaveMarquee = dynamic(() => import("@/components/ui/WaveMarquee").then(mod => ({ default: mod.default })), {
    loading: ComponentLoader,
    ssr: false
});

const ExpandableStrips = dynamic(() => import("@/components/ui/ExpandableStrips").then(mod => ({ default: mod.ExpandableStrips })), {
    loading: ComponentLoader,
    ssr: false
});

const FrostedGlass = dynamic(() => import("@/components/ui/FrostedGlass").then(mod => ({ default: mod.FrostedGlass })), {
    loading: ComponentLoader,
    ssr: false
});

const TextReveal = dynamic(() => import("@/components/ui/TextReveal").then(mod => ({ default: mod.default })), {
    loading: ComponentLoader,
    ssr: false
});

const TextReveal2 = dynamic(() => import("@/components/ui/TextReveal2").then(mod => ({ default: mod.default })), {
    loading: ComponentLoader,
    ssr: false
});

const CRTGlitch = dynamic(() => import("@/components/ui/CRTGlitch").then(mod => ({ default: mod.CRTGlitch })), {
    loading: ComponentLoader,
    ssr: false
});

const FlipClock = dynamic(() => import("@/components/ui/FlipClock").then(mod => ({ default: mod.FlipClock })), {
    loading: ComponentLoader,
    ssr: false
});

const Gravity = dynamic(() => import("@/components/ui/Gravity").then(mod => ({ default: mod.Gravity })), {
    loading: ComponentLoader,
    ssr: false
});

const PixelSimulation = dynamic(() => import("@/components/ui/PixelSimulation").then(mod => ({ default: mod.PixelSimulation })), {
    loading: ComponentLoader,
    ssr: false
});

const RunningOutline = dynamic(() => import("@/components/ui/RunningOutline").then(mod => ({ default: mod.RunningOutline })), {
    loading: ComponentLoader,
    ssr: false
});

const SynthwaveLines = dynamic(() => import("@/components/ui/SynthwaveLines").then(mod => ({ default: mod.SynthwaveLines })), {
    loading: ComponentLoader,
    ssr: false
});

const HoverImageList = dynamic(() => import("@/components/ui/HoverImageList").then(mod => ({ default: mod.HoverImageList })), {
    loading: ComponentLoader,
    ssr: false
});

const ScrollSkew = dynamic(() => import("@/components/ui/ScrollSkew").then(mod => ({ default: mod.ScrollSkew })), {
    loading: ComponentLoader,
    ssr: false
});

const LiquidReveal = dynamic(() => import("@/components/ui/LiquidReveal").then(mod => ({ default: mod.LiquidReveal })), {
    loading: ComponentLoader,
    ssr: false
});

const PinnedCarousel = dynamic(() => import("@/components/ui/PinnedCarousel").then(mod => ({ default: mod.PinnedCarousel })), {
    loading: ComponentLoader,
    ssr: false
});

const TimelineZoom = dynamic(() => import("@/components/ui/TimelineZoom").then(mod => ({ default: mod.TimelineZoom })), {
    loading: ComponentLoader,
    ssr: false
});

const ElasticScroll = dynamic(() => import("@/components/ui/ElasticScroll").then(mod => ({ default: mod.ElasticScroll })), {
    loading: ComponentLoader,
    ssr: false
});

const DiagonalArrival = dynamic(() => import("@/components/ui/DiagonalArrival").then(mod => ({ default: mod.default })), {
    loading: ComponentLoader,
    ssr: false
});

const Carousel = dynamic(() => import("@/components/ui/Carousel").then(mod => ({ default: mod.default })), {
    loading: ComponentLoader,
    ssr: false
});

const Carousel2 = dynamic(() => import("@/components/ui/Carousel2").then(mod => ({ default: mod.default })), {
    loading: ComponentLoader,
    ssr: false
});

const Carousel3 = dynamic(() => import("@/components/ui/Carousel3").then(mod => ({ default: mod.default })), {
    loading: ComponentLoader,
    ssr: false
});

const Carousel4 = dynamic(() => import("@/components/ui/Carousel4").then(mod => ({ default: mod.default })), {
    loading: ComponentLoader,
    ssr: false
});



const Retro404 = dynamic(() => import("@/components/ui/Retro404").then(mod => ({ default: mod.default })), {
    loading: ComponentLoader,
    ssr: false
});

const MouseInteraction1 = dynamic(() => import("@/components/ui/MouseInteraction1").then(mod => ({ default: mod.default })), {
    loading: ComponentLoader,
    ssr: false
});

const PerspectiveCarousel = dynamic(() => import("@/components/ui/PerspectiveCarousel").then(mod => ({ default: mod.default })), {
    loading: ComponentLoader,
    ssr: false
});

const FullScreenMenu = dynamic(() => import("@/components/ui/FullScreenMenu"), {
    loading: ComponentLoader,
    ssr: false
});

const KineticGrid = dynamic(() => import("@/components/ui/KineticGrid").then(mod => ({ default: mod.KineticGrid })), {
    loading: ComponentLoader,
    ssr: false
});

const ChromaticText = dynamic(() => import("@/components/ui/ChromaticText").then(mod => ({ default: mod.ChromaticText })), {
    loading: ComponentLoader,
    ssr: false
});

const IndexScrollReveal = dynamic(() => import("@/components/ui/IndexScrollReveal").then(mod => ({ default: mod.IndexScrollReveal })), {
    loading: ComponentLoader,
    ssr: false
});

const IndexScrollRevealSandbox = dynamic(() => import("@/components/ui/IndexScrollReveal").then(mod => ({ default: mod.IndexScrollRevealSandbox })), {
    loading: ComponentLoader,
    ssr: false
});

const InfinityBrandScroll = dynamic(() => import("@/components/ui/InfinityBrandScroll"), {
    loading: ComponentLoader,
    ssr: false
});

const InfinityBrand = dynamic(() => import("@/components/ui/InfinityBrand").then(mod => ({ default: mod.InfinityBrand })), {
    loading: ComponentLoader,
    ssr: false
});

// Helper for robust clipboard copy
const copyToClipboard = async (text: string) => {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback for older browsers / non-secure contexts
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "absolute";
            textArea.style.left = "-9999px";
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                document.body.removeChild(textArea);
                return true;
            } catch (err) {
                document.body.removeChild(textArea);
                console.error('Fallback copy failed', err);
                return false;
            }
        }
    } catch (err) {
        console.error('Copy failed', err);
        return false;
    }
};

// COMPONENT REGISTRY
const componentRegistry: Record<string, React.ComponentType<{ config?: any; isFullScreen?: boolean }>> = {
    'flip-grid': FlipGrid,
    'ascii-simulation': AsciiSimulation,
    'liquid-morph': LiquidMorph,
    'page-reveal': PageReveal as React.ComponentType<{ config?: any }>,
    'navbar-menu': NavbarMenu as React.ComponentType<{ config?: any }>,
    'navbar-menu-2': NavbarMenu2 as React.ComponentType<{ config?: any }>,
    'spotlight-search': SpotlightSearch as React.ComponentType<{ config?: any }>,
    'image-trail-cursor': ImageTrailCursor as React.ComponentType<{ config?: any }>,
    'reality-lens': RealityLens as React.ComponentType<{ config?: any }>,
    'scroll-to-reveal': ({ config = {}, isFullScreen }: { config?: any; isFullScreen?: boolean }) => (
        <ScrollToRevealSandbox
            text={config.text || "Morphys is a curated collection of high-performance, aesthetically pleasing UI components designed to elevate your web applications. Built with React, Tailwind CSS, and Framer Motion, it offers seamless integration for developers seeking valid, modern design. Our library features a diverse range of animations, interactions, and layout utilities that are fully customizable and responsive. Whether you're building stunning landing pages or complex applications, Morphys provides the essential building blocks to create immersive user experiences that captivate and engage your audience."}
            className={config.className || "text-3xl md:text-5xl lg:text-7xl font-kugile text-[#e8e4dc]"}
            minOpacity={config.minOpacity ?? 0.15}
        />
    ),
    'diffuse-text': DiffuseText as React.ComponentType<{ config?: any }>,
    'diagonal-focus': DiagonalFocus as React.ComponentType<{ config?: any }>,
    'notification-stack': NotificationStack as React.ComponentType<{ config?: any }>,
    'text-pressure': TextPressure as React.ComponentType<{ config?: any }>,
    'fluid-height': FluidHeight as React.ComponentType<{ config?: any }>,
    'text-mirror': TextMirror as React.ComponentType<{ config?: any }>,
    'step-morph': StepMorph as React.ComponentType<{ config?: any }>,
    'center-menu': CenterMenu as React.ComponentType<{ config?: any }>,
    'glass-surge': ({ config = {}, isFullScreen }: { config?: any; isFullScreen?: boolean }) => (
        <div className="flex items-center justify-center w-full h-full">
            <GlassSurge
                text={config.text || "MORPHYS"}
                className="text-[5rem] md:text-[9rem] font-bold tracking-widest font-logo"
            />
        </div>
    ),
    'layered-image-showcase': LayeredImageShowcase as React.ComponentType<{ config?: any }>,
    'impact-text': ({ config = {}, isFullScreen }: { config?: any; isFullScreen?: boolean }) => (
        <ImpactText
            text={config.text || "LOADING"}
            config={{
                fontSize: config.fontSize || 100,
                color: config.color || "var(--foreground)",
                kerning: config.kerning || 0
            }}
        />
    ),
    'reveal-marquee': ClothTicker as React.ComponentType<{ config?: any }>,
    'wave-marquee': WaveMarquee as React.ComponentType<{ config?: any }>,
    'expandable-strips': ExpandableStrips as React.ComponentType<{ config?: any }>,
    'frosted-glass': FrostedGlass as React.ComponentType<{ config?: any }>,
    'text-reveal': ({ config = {}, isFullScreen }: { config?: any; isFullScreen?: boolean }) => (
        <div className="flex items-center justify-center w-full h-full">
            <TextReveal
                text={config.text || "MORPHYS"}
                delay={config.delay || 0.5}
                className={config.className || "text-[3rem] md:text-[5rem] lg:text-[8rem] font-bold tracking-tighter text-foreground"}
            />
        </div>
    ),
    'text-reveal-2': ({ config = {}, isFullScreen }: { config?: any; isFullScreen?: boolean }) => (
        <div className="flex items-center justify-center w-full h-full">
            <TextReveal2
                text={config.text || "MORPHYS"}
                delay={config.delay || 0}
                className={config.className || "text-[3rem] md:text-[5rem] lg:text-[8rem] font-bold tracking-tighter text-foreground"}
            />
        </div>
    ),
    'crt-glitch': ({ config = {}, isFullScreen }: { config?: any; isFullScreen?: boolean }) => (
        <CRTGlitch
            config={{
                text: config.text || "MORPHYS",
                noiseIntensity: config.noiseIntensity ?? 0.15,
                scanlineIntensity: config.scanlineIntensity ?? 0.4,
                rgbShiftIntensity: config.rgbShiftIntensity ?? 0.6,
                glitchFrequency: config.glitchFrequency ?? 0.3,
                flickerIntensity: config.flickerIntensity ?? 0.1,
                vhsTracking: config.vhsTracking ?? true,
                phosphorGlow: config.phosphorGlow ?? true,
                curvedScreen: config.curvedScreen ?? true,
                colorTint: config.colorTint || 'none',
                autoGlitch: config.autoGlitch ?? true,
                hoverTrigger: config.hoverTrigger ?? true,
                fontSize: config.fontSize || 80,
            }}
        />
    ),
    'flip-clock': FlipClock as React.ComponentType<{ config?: any }>,
    'gravity': Gravity as React.ComponentType<{ config?: any }>,
    'pixel-simulation': PixelSimulation as React.ComponentType<{ config?: any }>,
    'running-outline': RunningOutline as React.ComponentType<{ config?: any }>,
    'synthwave-lines': SynthwaveLines as React.ComponentType<{ config?: any }>,
    'hover-image-list': HoverImageList as React.ComponentType<{ config?: any }>,
    'scroll-skew': ScrollSkew as React.ComponentType<{ config?: any }>,
    'liquid-reveal': LiquidReveal as React.ComponentType<{ config?: any }>,
    'pinned-carousel': PinnedCarousel as React.ComponentType<{ config?: any }>,
    'timeline-zoom': ({ config = {} }: { config?: any }) => (
        <TimelineZoom items={config.items} className={config.className} />
    ),
    'elastic-scroll': ElasticScroll as React.ComponentType<{ config?: any }>,
    'diagonal-arrival': DiagonalArrival as React.ComponentType<{ config?: any }>,
    'carousel': Carousel as React.ComponentType<{ config?: any }>,
    'carousel-2': Carousel2 as React.ComponentType<{ config?: any }>,
    'carousel-3': Carousel3 as React.ComponentType<{ config?: any }>,
    'carousel-4': Carousel4 as React.ComponentType<{ config?: any }>,

    'retro-404': Retro404 as React.ComponentType<{ config?: any }>,
    'mouse-interaction-1': ({ config = {} }: { config?: any }) => (
        <MouseInteraction1
            boxSize={config.boxSize ?? 35}
            trailSize={config.trailSize ?? 8}
            gridGap={config.gridGap ?? 0}
            onHoverColor={config.onHoverColor || '#500724'}
            hideGrid={config.hideGrid ?? true}
            className="w-full h-full bg-black rounded-lg overflow-hidden"
        />
    ),
    'perspective-carousel': ({ config = {} }: { config?: any }) => (
        <PerspectiveCarousel config={config} />
    ),
    'full-screen-menu': FullScreenMenu as React.ComponentType<{ config?: any }>,
    'kinetic-grid': ({ config = {} }: { config?: any }) => (
        <KineticGrid
            gridSize={config.gridSize ?? 40}
            plusSize={config.plusSize ?? 10}
            color={config.color || 'currentColor'}
            influenceRadius={config.influenceRadius ?? 400}
            forceMultiplier={config.forceMultiplier ?? 0.005}
            damping={config.damping ?? 0.95}
        />
    ),
    'chromatic-text': ({ config = {} }: { config?: any }) => (
        <ChromaticText
            config={{
                text: config.text ?? 'MORPHYS',
                offset: config.offset ?? 4,
                glowRadius: config.glowRadius ?? 25,
                bottomFade: config.bottomFade ?? true,
            }}
            className="text-[5rem] md:text-[9rem] lg:text-[12rem]"
        />
    ),
    'index-scroll-reveal': IndexScrollRevealSandbox as React.ComponentType<{ config?: any }>,
    'infinity-brand': ({ config = {} }: { config?: any }) => <InfinityBrand {...config} />,
    'infinity-brand-scroll': ({ config = {} }: { config?: any }) => <InfinityBrandScroll {...config} />,
};



interface NumberControlProps {
    label: string;
    value: number;
    min: number;
    max: number;
    suffix?: string;
    onChange: (val: number) => void;
}

function NumberControl({ label, value, min, max, suffix = '', onChange }: NumberControlProps) {
    const safeValue = value ?? min ?? 0;
    const [localValue, setLocalValue] = useState(safeValue.toString());

    // Sync local state when prop changes (e.g. from buttons or external resets)
    useEffect(() => {
        setLocalValue((value ?? min ?? 0).toString());
    }, [value, min]);

    const handleCommit = () => {
        const parsed = parseInt(localValue);
        if (!isNaN(parsed)) {
            const clamped = Math.min(Math.max(parsed, min), max);
            onChange(clamped);
            setLocalValue(clamped.toString());
        } else {
            setLocalValue(value.toString()); // Revert if invalid
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            (e.target as HTMLInputElement).blur();
        }
    };

    return (
        <div>
            <span className="text-xs text-foreground/40 block mb-1.5">{label}</span>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onChange(Math.max(safeValue - 1, min))}
                    disabled={safeValue <= min}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/25 backdrop-blur-md border border-white/30 hover:bg-white/40 disabled:opacity-50 transition-colors text-foreground"
                >
                    -
                </button>
                <div className="flex-1 relative">
                    <input
                        type="number"
                        value={localValue}
                        onChange={(e) => setLocalValue(e.target.value)}
                        onBlur={handleCommit}
                        onKeyDown={handleKeyDown}
                        className="w-full h-8 px-2 text-center bg-white/25 backdrop-blur-md border border-white/30 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-foreground/20 appearance-none"
                    />
                    {suffix && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-foreground/40 pointer-events-none">{suffix}</span>}
                </div>
                <button
                    onClick={() => onChange(Math.min(safeValue + 1, max))}
                    disabled={safeValue >= max}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/25 backdrop-blur-md border border-white/30 hover:bg-white/40 disabled:opacity-50 transition-colors text-foreground"
                >
                    +
                </button>
            </div>
        </div>
    );
}

// ============================================
// CONTROLS PANEL
// ============================================

interface ControlsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    config: any;
    onConfigChange: (key: string, value: unknown) => void;
    componentId: string;
    onTriggerFullPage?: () => void; // For page-reveal full-page mode
}
function ControlsPanel({ isOpen, onClose, config, onConfigChange, componentId, onTriggerFullPage }: ControlsPanelProps) {
    const patterns: GridPattern[] = ['wave', 'cascade', 'random', 'spiral', 'checkerboard', 'horizontal', 'vertical', 'explode', 'implode'];
    const easings: EasingType[] = ['smooth', 'spring', 'bounce', 'elastic'];
    const speeds: SpeedType[] = ['slow', 'normal', 'fast', 'instant'];

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const panelVariants = {
        hidden: isMobile ? { y: "100%", opacity: 0 } : { x: "100%", opacity: 0 },
        visible: isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 },
        exit: isMobile ? { y: "100%", opacity: 0 } : { x: "100%", opacity: 0 }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop - Only on mobile */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[65] md:hidden"
                        onClick={onClose}
                    />

                    {/* Panel - Mobile: Bottom sheet, Desktop: Floating sidebar */}
                    <motion.div
                        variants={panelVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        className="
                            fixed left-0 right-0 bottom-0 w-full h-[50vh] rounded-t-2xl border-t
                            md:absolute md:top-[15px] md:bottom-[15px] md:right-[15px] md:left-auto md:w-[340px] md:h-auto md:rounded-2xl md:border
                            bg-background/95 backdrop-blur-xl
                            border-foreground/10
                            z-[70] overflow-y-auto overscroll-contain scrollbar-thin
                            p-6
                            shadow-[0_-8px_30px_rgba(0,0,0,0.12)] md:shadow-2xl
                        "
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-semibold">Controls</h3>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-full bg-foreground/5 hover:bg-foreground/10 flex items-center justify-center transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-6">
                            {componentId === 'pixel-simulation' ? (
                                <>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Shape</label>
                                        <div className="flex flex-wrap gap-2">
                                            {['torus', 'cube', 'car'].map((shape) => (
                                                <button
                                                    key={shape}
                                                    onClick={() => onConfigChange('shape', shape)}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${config.shape === shape ? 'bg-foreground text-background' : 'bg-foreground/5 hover:bg-foreground/10 text-foreground/70'}`}
                                                >
                                                    {shape.charAt(0).toUpperCase() + shape.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Sizing</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <NumberControl label="Pixel Size" value={config.pixelSize} min={2} max={32} suffix="px" onChange={(val) => onConfigChange('pixelSize', val)} />
                                            <NumberControl label="Gap" value={config.gap} min={0} max={10} suffix="px" onChange={(val) => onConfigChange('gap', val)} />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Simulation</label>
                                        <NumberControl label="Speed" value={config.speed} min={0} max={20} onChange={(val) => onConfigChange('speed', val)} />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Appearance</label>
                                        <div className="space-y-2">
                                            <label className="text-xs text-foreground/40 block">Color Mode</label>
                                            <div className="flex flex-wrap gap-2">
                                                {['monochrome', 'depth', 'normal', 'rainbow'].map((mode) => (
                                                    <button
                                                        key={mode}
                                                        onClick={() => onConfigChange('colorMode', mode)}
                                                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${config.colorMode === mode ? 'bg-foreground text-background' : 'bg-foreground/5 hover:bg-foreground/10 text-foreground/70'}`}
                                                    >
                                                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 mt-2">
                                            <div>
                                                <span className="text-xs text-foreground/40 mb-1 block">Color 1</span>
                                                <input type="color" value={config.color1} onChange={(e) => onConfigChange('color1', e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" />
                                            </div>
                                            <div>
                                                <span className="text-xs text-foreground/40 mb-1 block">Color 2</span>
                                                <input type="color" value={config.color2} onChange={(e) => onConfigChange('color2', e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : componentId === 'ascii-simulation' ? (
                                // ASCII SIMULATION CONTROLS
                                <>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Shape</label>
                                        <div className="flex flex-wrap gap-2">
                                            {(['torus', 'cube', 'car'] as AsciiShape[]).map((shape) => (
                                                <button
                                                    key={shape}
                                                    onClick={() => onConfigChange('shape', shape)}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${config.shape === shape ? 'bg-foreground text-background' : 'bg-foreground/5 hover:bg-foreground/10 text-foreground/70'}`}
                                                >
                                                    {shape.charAt(0).toUpperCase() + shape.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Settings</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <NumberControl label="Scale" value={config.scale * 10} min={1} max={50} onChange={(val) => onConfigChange('scale', val / 10)} />
                                            <NumberControl label="Speed" value={config.speed * 10} min={0} max={100} onChange={(val) => onConfigChange('speed', val / 10)} />
                                            <NumberControl label="Font Size" value={config.fontSize} min={4} max={48} suffix="px" onChange={(val) => onConfigChange('fontSize', val)} />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Appearance</label>
                                        <div className="grid grid-cols-1 gap-3">
                                            <div>
                                                <span className="text-xs text-foreground/40 mb-1 block">Color</span>
                                                <input type="color" value={config.color === 'var(--foreground)' ? '#ffffff' : config.color} onChange={(e) => onConfigChange('color', e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-foreground/60">Invert Characters</span>
                                                <button onClick={() => onConfigChange('invert', !config.invert)} className={`w-12 h-6 rounded-full relative transition-colors ${config.invert ? 'bg-foreground' : 'bg-foreground/20'}`}>
                                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-background transition-transform ${config.invert ? 'left-7' : 'left-1'}`} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : componentId === 'page-reveal' ? (
                                // PAGE REVEAL CONTROLS
                                <>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Timing</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <NumberControl label="Logo Blur" value={Math.round(config.logoBlurDuration * 10)} min={1} max={30} onChange={(val) => onConfigChange('logoBlurDuration', val / 10)} />
                                            <NumberControl label="Logo Hold" value={Math.round(config.logoHoldDuration * 10)} min={1} max={30} onChange={(val) => onConfigChange('logoHoldDuration', val / 10)} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <NumberControl label="Slit Duration" value={Math.round(config.slitAnimationDuration * 10)} min={1} max={20} onChange={(val) => onConfigChange('slitAnimationDuration', val / 10)} />
                                            <NumberControl label="Stagger Delay" value={Math.round(config.slitStaggerDelay * 100)} min={1} max={20} onChange={(val) => onConfigChange('slitStaggerDelay', val / 100)} />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Split Columns</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <NumberControl label="Mobile" value={config.splitCount?.mobile || 10} min={2} max={20} onChange={(val) => onConfigChange('splitCount', { ...config.splitCount, mobile: val })} />
                                            <NumberControl label="Tablet" value={config.splitCount?.tablet || 15} min={4} max={30} onChange={(val) => onConfigChange('splitCount', { ...config.splitCount, tablet: val })} />
                                            <NumberControl label="Desktop" value={config.splitCount?.desktop || 20} min={6} max={40} onChange={(val) => onConfigChange('splitCount', { ...config.splitCount, desktop: val })} />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Appearance</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <span className="text-xs text-foreground/40 mb-1 block">Background</span>
                                                <input type="color" value={config.backgroundColor} onChange={(e) => onConfigChange('backgroundColor', e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" />
                                            </div>
                                            <div>
                                                <span className="text-xs text-foreground/40 mb-1 block">Logo Color</span>
                                                <input type="color" value={config.logoColor} onChange={(e) => onConfigChange('logoColor', e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" />
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-xs text-foreground/40 mb-1 block">Logo Font Size</span>
                                            <NumberControl label="" value={config.logoFontSize} min={40} max={150} suffix="px" onChange={(val) => onConfigChange('logoFontSize', val)} />
                                        </div>
                                    </div>
                                </>
                            ) : componentId === 'running-outline' ? (
                                // RUNNING OUTLINE CONTROLS
                                <>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Text</label>
                                        <input
                                            type="text"
                                            value={config.words?.[0]?.text ?? "OUTLINE"}
                                            onChange={(e) => {
                                                const currentFont = config.words?.[0]?.font || "font-thunder";
                                                onConfigChange('words', [{ text: e.target.value, font: currentFont }]);
                                            }}
                                            className="w-full h-10 px-3 bg-foreground/5 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-foreground/20"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Typography</label>
                                        <div className="flex flex-wrap gap-2">
                                            {['font-thunder', 'font-kugile', 'font-victory', 'font-logo', 'font-heading'].map((font) => {
                                                const activeFont = config.words?.[0]?.font || 'font-thunder';
                                                return (
                                                    <button
                                                        key={font}
                                                        onClick={() => {
                                                            const currentText = config.words?.[0]?.text ?? "OUTLINE";
                                                            onConfigChange('words', [{ text: currentText, font }]);
                                                        }}
                                                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${activeFont === font ? 'bg-foreground text-background' : 'bg-foreground/5 hover:bg-foreground/10 text-foreground/70'}`}
                                                    >
                                                        {font.replace('font-', '').charAt(0).toUpperCase() + font.replace('font-', '').slice(1)}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Color</label>
                                        <div>
                                            <input
                                                type="color"
                                                value={config.color === 'var(--foreground)' ? '#000000' : config.color}
                                                onChange={(e) => onConfigChange('color', e.target.value)}
                                                className="w-full h-10 rounded-lg cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : componentId === 'synthwave-lines' ? (
                                // SYNTHWAVE LINES CONTROLS
                                <>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Settings</label>
                                        <NumberControl
                                            label="Line Count"
                                            value={config.lineCount || 10}
                                            min={5}
                                            max={50}
                                            onChange={(val) => onConfigChange('lineCount', val)}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Appearance</label>
                                        <div>
                                            <span className="text-xs text-foreground/40 mb-1 block">Color</span>
                                            <input
                                                type="color"
                                                value={config.color || '#ffffff'}
                                                onChange={(e) => onConfigChange('color', e.target.value)}
                                                className="w-full h-10 rounded-lg cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : componentId === 'liquid-morph' ? (
                                // LIQUID MORPH CONTROLS
                                <>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Appearance</label>
                                        <div className="grid grid-cols-1 gap-3">
                                            <div>
                                                <span className="text-xs text-foreground/40 mb-1 block">Color</span>
                                                <input type="color" value={config.color} onChange={(e) => onConfigChange('color', e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <NumberControl label="Metalness" value={Math.round(config.metalness * 10)} min={0} max={10} onChange={(val) => onConfigChange('metalness', val / 10)} />
                                            <NumberControl label="Roughness" value={Math.round(config.roughness * 10)} min={0} max={10} onChange={(val) => onConfigChange('roughness', val / 10)} />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Fluid Simulation</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <NumberControl label="Distortion" value={Math.round(config.distort * 10)} min={0} max={20} onChange={(val) => onConfigChange('distort', val / 10)} />
                                            <NumberControl label="Speed" value={Math.round(config.speed * 10)} min={0} max={100} onChange={(val) => onConfigChange('speed', val / 10)} />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Environment</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <NumberControl label="Intensity" value={Math.round(config.intensity * 10)} min={0} max={50} onChange={(val) => onConfigChange('intensity', val / 10)} />
                                            <NumberControl label="Radius" value={Math.round(config.radius * 10)} min={1} max={30} onChange={(val) => onConfigChange('radius', val / 10)} />
                                        </div>
                                    </div>
                                </>
                            ) : componentId === 'kinetic-grid' ? (
                                <>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Layout</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <NumberControl label="Grid Size" value={config.gridSize ?? 40} min={10} max={100} onChange={(val) => onConfigChange('gridSize', val)} />
                                            <NumberControl label="Plus Size" value={config.plusSize ?? 10} min={2} max={40} onChange={(val) => onConfigChange('plusSize', val)} />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Physics</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <NumberControl label="Radius" value={config.influenceRadius ?? 400} min={50} max={1000} onChange={(val) => onConfigChange('influenceRadius', val)} />
                                            <NumberControl label="Force" value={typeof config.forceMultiplier === 'number' ? Math.round(config.forceMultiplier * 10000) : 5} min={1} max={50} onChange={(val) => onConfigChange('forceMultiplier', val / 10000)} />
                                            <NumberControl label="Damping" value={typeof config.damping === 'number' ? Math.round(config.damping * 100) : 90} min={50} max={100} onChange={(val) => onConfigChange('damping', val / 100)} />
                                        </div>
                                    </div>
                                </>
                            ) : componentId === 'chromatic-text' ? (
                                <>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Content</label>
                                        <div>
                                            <span className="text-xs text-foreground/40 mb-1 block">Text</span>
                                            <input
                                                type="text"
                                                value={config.text ?? "MORPHYS"}
                                                onChange={(e) => onConfigChange('text', e.target.value)}
                                                className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-foreground/20"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Appearance</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <NumberControl label="Offset" value={config.offset ?? 4} min={1} max={20} suffix="px" onChange={(val) => onConfigChange('offset', val)} />
                                            <NumberControl label="Glow Radius" value={config.glowRadius ?? 25} min={5} max={100} suffix="px" onChange={(val) => onConfigChange('glowRadius', val)} />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Options</label>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-foreground/60">Bottom Fade</span>
                                            <button onClick={() => onConfigChange('bottomFade', config.bottomFade !== false ? false : true)} className={`w-12 h-6 rounded-full relative transition-colors ${config.bottomFade !== false ? 'bg-foreground' : 'bg-foreground/20'}`}>
                                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-background transition-transform ${config.bottomFade !== false ? 'left-7' : 'left-1'}`} />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : componentId === 'liquid-reveal' ? (
                                // LIQUID REVEAL CONTROLS
                                <>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Content</label>
                                        <div>
                                            <span className="text-xs text-foreground/40 mb-1 block">Overlay Text</span>
                                            <input
                                                type="text"
                                                value={config.text || "reveal."}
                                                onChange={(e) => onConfigChange('text', e.target.value)}
                                                className="w-full h-10 px-3 bg-foreground/5 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-foreground/20"
                                            />
                                        </div>
                                        <div className="mt-3">
                                            <span className="text-xs text-foreground/40 mb-1 block">Image URL</span>
                                            <input
                                                type="text"
                                                value={config.imageUrl || ""}
                                                placeholder="https://..."
                                                onChange={(e) => onConfigChange('imageUrl', e.target.value.trim())}
                                                className="w-full h-10 px-3 bg-foreground/5 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-foreground/20"
                                            />
                                        </div>
                                        <div className="mt-4 flex items-center justify-between">
                                            <span className="text-sm text-foreground/60">Animation</span>
                                            <button
                                                onClick={() => onConfigChange('enableAnimation', config.enableAnimation === false ? true : false)}
                                                className={`w-12 h-6 rounded-full relative transition-colors ${config.enableAnimation !== false ? 'bg-foreground' : 'bg-foreground/20'}`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-background transition-transform ${config.enableAnimation !== false ? 'left-7' : 'left-1'}`} />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : componentId === 'layered-image-showcase' ? (
                                // LAYERED IMAGE SHOWCASE CONTROLS
                                <>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Content</label>
                                        <div>
                                            <span className="text-xs text-foreground/40 mb-1 block">Title</span>
                                            <input
                                                type="text"
                                                value={config.title || "MORPHYS"}
                                                onChange={(e) => onConfigChange('title', e.target.value)}
                                                className="w-full h-10 px-3 bg-foreground/5 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-foreground/20"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Appearance</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <span className="text-xs text-foreground/40 mb-1 block">Accent Color</span>
                                                <input
                                                    type="color"
                                                    value={config.accentColor || '#FF3333'}
                                                    onChange={(e) => onConfigChange('accentColor', e.target.value)}
                                                    className="w-full h-10 rounded-lg cursor-pointer"
                                                />
                                            </div>
                                            <div>
                                                <span className="text-xs text-foreground/40 mb-1 block">Text Color</span>
                                                <input
                                                    type="color"
                                                    value={config.textColor || '#ffffff'}
                                                    onChange={(e) => onConfigChange('textColor', e.target.value)}
                                                    className="w-full h-10 rounded-lg cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : componentId === 'navbar-menu' ? (
                                // NAVBAR MENU CONTROLS
                                <>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Branding</label>
                                        <div>
                                            <span className="text-xs text-foreground/40 mb-1 block">Logo Text</span>
                                            <input
                                                type="text"
                                                value={config.logoText ?? 'RUN'}
                                                onChange={(e) => onConfigChange('logoText', e.target.value)}
                                                maxLength={10}
                                                className="w-full h-10 px-3 bg-foreground/5 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-foreground/20"
                                                placeholder="Logo text"
                                            />
                                        </div>
                                        <div>
                                            <span className="text-xs text-foreground/40 mb-1 block">Accent Color</span>
                                            <input
                                                type="color"
                                                value={config.accentColor || '#ef4444'}
                                                onChange={(e) => onConfigChange('accentColor', e.target.value)}
                                                className="w-full h-10 rounded-lg cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Animation</label>
                                        <div>
                                            <span className="text-xs text-foreground/40 mb-1 block">Speed ({config.animationSpeed || 1}x)</span>
                                            <Slider
                                                min={0.5}
                                                max={2}
                                                step={0.1}
                                                value={config.animationSpeed || 1}
                                                onChange={(val) => onConfigChange('animationSpeed', val)}
                                            />
                                            <div className="flex justify-between text-[10px] text-foreground/30 mt-1">
                                                <span>Slow</span>
                                                <span>Fast</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Appearance</label>
                                        <NumberControl
                                            label="Border Radius"
                                            value={config.borderRadius || 32}
                                            min={8}
                                            max={48}
                                            suffix="px"
                                            onChange={(val) => onConfigChange('borderRadius', val)}
                                        />
                                    </div>
                                </>
                            ) : componentId === 'navbar-menu-2' ? (
                                // NAVBAR MENU 2 CONTROLS
                                <>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Branding</label>
                                        <div>
                                            <span className="text-xs text-foreground/40 mb-1 block">Logo Text</span>
                                            <input
                                                type="text"
                                                value={config.logoText ?? 'Morphys'}
                                                onChange={(e) => onConfigChange('logoText', e.target.value)}
                                                maxLength={15}
                                                className="w-full h-10 px-3 bg-foreground/5 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-foreground/20"
                                                placeholder="Logo text"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Colors</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <span className="text-xs text-foreground/40 mb-1 block">Background</span>
                                                <input
                                                    type="color"
                                                    value={config.backgroundColor || '#ffffff'}
                                                    onChange={(e) => onConfigChange('backgroundColor', e.target.value)}
                                                    className="w-full h-10 rounded-lg cursor-pointer"
                                                />
                                            </div>
                                            <div>
                                                <span className="text-xs text-foreground/40 mb-1 block">Text</span>
                                                <input
                                                    type="color"
                                                    value={config.textColor || '#000000'}
                                                    onChange={(e) => onConfigChange('textColor', e.target.value)}
                                                    className="w-full h-10 rounded-lg cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : componentId === 'spotlight-search' ? (
                                // SPOTLIGHT SEARCH CONTROLS
                                <>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Animation</label>
                                        <NumberControl
                                            label="Morph Delay"
                                            value={config.morphDelay || 800}
                                            min={200}
                                            max={2000}
                                            suffix="ms"
                                            onChange={(val) => onConfigChange('morphDelay', val)}
                                        />
                                        <NumberControl
                                            label="Stiffness"
                                            value={config.springStiffness || 400}
                                            min={50}
                                            max={800}
                                            onChange={(val) => onConfigChange('springStiffness', val)}
                                        />
                                        <NumberControl
                                            label="Damping"
                                            value={config.springDamping || 15}
                                            min={5}
                                            max={50}
                                            onChange={(val) => onConfigChange('springDamping', val)}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Layout</label>
                                        <NumberControl
                                            label="Search Width"
                                            value={config.searchWidth || 600}
                                            min={400}
                                            max={800}
                                            suffix="px"
                                            onChange={(val) => onConfigChange('searchWidth', val)}
                                        />
                                    </div>
                                </>
                            ) : componentId === 'image-trail-cursor' ? (
                                // IMAGE TRAIL CURSOR CONTROLS
                                <>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Appearance</label>
                                        <NumberControl
                                            label="Size"
                                            value={config.size || 150}
                                            min={50}
                                            max={400}
                                            suffix="px"
                                            onChange={(val) => onConfigChange('size', val)}
                                        />
                                        <NumberControl
                                            label="Fade Duration"
                                            value={config.fadeDuration || 0.6}
                                            min={0.1}
                                            max={5}
                                            onChange={(val) => onConfigChange('fadeDuration', parseFloat(val.toFixed(1)))}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Behavior</label>
                                        <NumberControl
                                            label="Distance Threshold"
                                            value={config.distanceThreshold || 40}
                                            min={10}
                                            max={100}
                                            suffix="px"
                                            onChange={(val) => onConfigChange('distanceThreshold', val)}
                                        />
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-foreground/60">Rotation</span>
                                            <button onClick={() => onConfigChange('rotation', !config.rotation)} className={`w-12 h-6 rounded-full relative transition-colors ${config.rotation ? 'bg-foreground' : 'bg-foreground/20'}`}>
                                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-background transition-transform ${config.rotation ? 'left-7' : 'left-1'}`} />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : componentId === 'reality-lens' ? (
                                // REALITY LENS CONTROLS
                                <>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Appearance</label>
                                        <NumberControl
                                            label="Brush Size"
                                            value={config.lensSize || 120}
                                            min={50}
                                            max={400}
                                            suffix="px"
                                            onChange={(val) => onConfigChange('lensSize', val)}
                                        />
                                    </div>
                                </>
                            ) : componentId === 'pixel-simulation' ? (
                                // PIXEL SIMULATION CONTROLS
                                <>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Shape</label>
                                        <div className="flex flex-wrap gap-2">
                                            {(['torus', 'cube'] as const).map((shape) => (
                                                <button
                                                    key={shape}
                                                    onClick={() => onConfigChange('shape', shape)}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${config.shape === shape ? 'bg-foreground text-background' : 'bg-foreground/5 hover:bg-foreground/10 text-foreground/70'}`}
                                                >
                                                    {shape.charAt(0).toUpperCase() + shape.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Pixelation</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <NumberControl
                                                label="Pixel Size"
                                                value={config.pixelSize || 8}
                                                min={2}
                                                max={32}
                                                suffix="px"
                                                onChange={(val) => onConfigChange('pixelSize', val)}
                                            />
                                            <NumberControl
                                                label="Gap"
                                                value={config.gap || 0}
                                                min={0}
                                                max={10}
                                                suffix="px"
                                                onChange={(val) => onConfigChange('gap', val)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Color Mode</label>
                                        <div className="flex flex-wrap gap-2">
                                            {(['monochrome', 'depth', 'normal', 'rainbow'] as const).map((mode) => (
                                                <button
                                                    key={mode}
                                                    onClick={() => onConfigChange('colorMode', mode)}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${config.colorMode === mode ? 'bg-foreground text-background' : 'bg-foreground/5 hover:bg-foreground/10 text-foreground/70'}`}
                                                >
                                                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Colors</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <span className="text-xs text-foreground/40 mb-1 block">Primary</span>
                                                <input
                                                    type="color"
                                                    value={config.color1 || '#4F46E5'}
                                                    onChange={(e) => onConfigChange('color1', e.target.value)}
                                                    className="w-full h-10 rounded-lg cursor-pointer"
                                                />
                                            </div>
                                            <div>
                                                <span className="text-xs text-foreground/40 mb-1 block">Secondary</span>
                                                <input
                                                    type="color"
                                                    value={config.color2 || '#ec4899'}
                                                    onChange={(e) => onConfigChange('color2', e.target.value)}
                                                    className="w-full h-10 rounded-lg cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : componentId === 'scroll-to-reveal' ? (
                                // SCROLL TO REVEAL CONTROLS
                                <>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Appearance</label>
                                        <NumberControl
                                            label="Min Opacity"
                                            value={Math.round((config.minOpacity || 0.15) * 100)}
                                            min={0}
                                            max={100}
                                            suffix="%"
                                            onChange={(val) => onConfigChange('minOpacity', val / 100)}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Content</label>
                                        <div>
                                            <span className="text-xs text-foreground/40 mb-1 block">Text</span>
                                            <textarea
                                                value={config.text}
                                                onChange={(e) => onConfigChange('text', e.target.value)}
                                                className="w-full h-32 px-3 py-2 bg-foreground/5 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-foreground/20 resize-none"
                                                placeholder="Enter text to reveal..."
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : componentId === 'diffuse-text' ? (
                                // DIFFUSE TEXT CONTROLS
                                <>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Appearance</label>
                                        <NumberControl
                                            label="Blur Amount"
                                            value={config.blurLevel ?? 24}
                                            min={0}
                                            max={100}
                                            suffix="px"
                                            onChange={(val) => onConfigChange('blurLevel', val)}
                                        />
                                        <NumberControl
                                            label="Intensity"
                                            value={Math.round((config.intensity ?? 1) * 100)}
                                            min={0}
                                            max={200}
                                            suffix="%"
                                            onChange={(val) => onConfigChange('intensity', val / 100)}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Colors</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <span className="text-xs text-foreground/40">Text</span>
                                                <input
                                                    type="color"
                                                    value={config.color || '#ffffff'}
                                                    onChange={(e) => onConfigChange('color', e.target.value)}
                                                    className="w-full h-10 rounded-lg cursor-pointer"
                                                />
                                            </div>
                                            <div>
                                                <span className="text-xs text-foreground/40">Background</span>
                                                <input
                                                    type="color"
                                                    value={config.backgroundColor || '#7ca5b8'}
                                                    onChange={(e) => onConfigChange('backgroundColor', e.target.value)}
                                                    className="w-full h-10 rounded-lg cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Content</label>
                                        <div>
                                            <span className="text-xs text-foreground/40 mb-1 block">Main Text</span>
                                            <input
                                                type="text"
                                                value={config.text || ''}
                                                onChange={(e) => onConfigChange('text', e.target.value)}
                                                className="w-full h-10 px-3 bg-foreground/5 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-foreground/20"
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : componentId === 'frosted-glass' ? (
                                // FROSTED GLASS CONTROLS
                                <>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Appearance</label>
                                        <NumberControl
                                            label="Blur Amount"
                                            value={config.blurAmount || 30}
                                            min={0}
                                            max={50}
                                            suffix="px"
                                            onChange={(val) => onConfigChange('blurAmount', val)}
                                        />
                                        <NumberControl
                                            label="Font Size"
                                            value={config.fontSize || 300}
                                            min={40}
                                            max={600}
                                            suffix="px"
                                            onChange={(val) => onConfigChange('fontSize', val)}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Content</label>
                                        <div>
                                            <span className="text-xs text-foreground/40 mb-1 block">Text</span>
                                            <input
                                                type="text"
                                                value={config.text ?? 'CURATED CHAOS'}
                                                onChange={(e) => onConfigChange('text', e.target.value)}
                                                className="w-full h-10 px-3 bg-white/25 backdrop-blur-md border border-white/30 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-foreground/20"
                                                placeholder="Enter text..."
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : componentId === 'text-reveal' ? (
                                // TEXT REVEAL CONTROLS
                                <>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Animation</label>
                                        <NumberControl
                                            label="Delay"
                                            value={Math.round((config.delay || 0) * 10)}
                                            min={0}
                                            max={20}
                                            onChange={(val) => onConfigChange('delay', val / 10)}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Content</label>
                                        <div>
                                            <span className="text-xs text-foreground/40 mb-1 block">Text</span>
                                            <input
                                                type="text"
                                                value={config.text ?? ''}
                                                onChange={(e) => onConfigChange('text', e.target.value)}
                                                className="w-full h-10 px-3 bg-white/25 backdrop-blur-md border border-white/30 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-foreground/20"
                                                placeholder="Enter text..."
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : componentId === 'text-reveal-2' ? (
                                // TEXT REVEAL 2 CONTROLS
                                <>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Animation</label>
                                        <NumberControl
                                            label="Delay"
                                            value={Math.round((config.delay || 0) * 10)}
                                            min={0}
                                            max={20}
                                            onChange={(val) => onConfigChange('delay', val / 10)}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Content</label>
                                        <div>
                                            <span className="text-xs text-foreground/40 mb-1 block">Text</span>
                                            <input
                                                type="text"
                                                value={config.text ?? ''}
                                                onChange={(e) => onConfigChange('text', e.target.value)}
                                                className="w-full h-10 px-3 bg-white/25 backdrop-blur-md border border-white/30 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-foreground/20"
                                                placeholder="Enter text..."
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : componentId === 'index-scroll-reveal' ? (
                                // INDEX SCROLL REVEAL CONTROLS
                                <>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Content</label>
                                        <div>
                                            <span className="text-xs text-foreground/40 mb-1 block">Title</span>
                                            <input
                                                type="text"
                                                value={config.title === undefined ? 'MORPHYS' : config.title}
                                                onChange={(e) => onConfigChange('title', e.target.value)}
                                                className="w-full h-10 px-3 bg-foreground/5 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-foreground/20"
                                                placeholder="Enter title..."
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : componentId === 'infinity-brand' ? (
                                // INFINITY BRAND CONTROLS
                                <>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Motion</label>
                                        <NumberControl
                                            label="Speed"
                                            value={Math.round((config.speed || 0.2) * 100)}
                                            min={0}
                                            max={200}
                                            onChange={(val) => onConfigChange('speed', val / 100)}
                                        />
                                        <NumberControl
                                            label="Scale Variation"
                                            value={Math.round((config.scaleVar || 0.3) * 100)}
                                            min={0}
                                            max={200}
                                            onChange={(val) => onConfigChange('scaleVar', val / 100)}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Geometry</label>
                                        <NumberControl
                                            label="Loop Radius"
                                            value={(config.radius || 4) * 10}
                                            min={10}
                                            max={100}
                                            onChange={(val) => onConfigChange('radius', val / 10)}
                                        />
                                    </div>
                                </>
                            ) : componentId === 'crt-glitch' ? (
                                // CRT GLITCH CONTROLS
                                <>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Content</label>
                                        <div>
                                            <span className="text-xs text-foreground/40 mb-1 block">Text</span>
                                            <input
                                                type="text"
                                                value={config.text ?? 'MORPHYS'}
                                                onChange={(e) => onConfigChange('text', e.target.value)}
                                                className="w-full h-10 px-3 bg-white/25 backdrop-blur-md border border-white/30 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-foreground/20"
                                                placeholder="Enter text..."
                                            />
                                        </div>
                                        <NumberControl
                                            label="Font Size"
                                            value={config.fontSize || 80}
                                            min={20}
                                            max={200}
                                            suffix="px"
                                            onChange={(val) => onConfigChange('fontSize', val)}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Effect Intensity</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <NumberControl
                                                label="Noise"
                                                value={Math.round((config.noiseIntensity ?? 0.15) * 100)}
                                                min={0}
                                                max={100}
                                                suffix="%"
                                                onChange={(val) => onConfigChange('noiseIntensity', val / 100)}
                                            />
                                            <NumberControl
                                                label="Scan Lines"
                                                value={Math.round((config.scanlineIntensity ?? 0.4) * 100)}
                                                min={0}
                                                max={100}
                                                suffix="%"
                                                onChange={(val) => onConfigChange('scanlineIntensity', val / 100)}
                                            />
                                            <NumberControl
                                                label="RGB Shift"
                                                value={Math.round((config.rgbShiftIntensity ?? 0.6) * 100)}
                                                min={0}
                                                max={100}
                                                suffix="%"
                                                onChange={(val) => onConfigChange('rgbShiftIntensity', val / 100)}
                                            />
                                            <NumberControl
                                                label="Glitch Freq"
                                                value={Math.round((config.glitchFrequency ?? 0.3) * 100)}
                                                min={0}
                                                max={100}
                                                suffix="%"
                                                onChange={(val) => onConfigChange('glitchFrequency', val / 100)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Options</label>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-foreground/60">Curved Screen</span>
                                                <button onClick={() => onConfigChange('curvedScreen', !config.curvedScreen)} className={`w-12 h-6 rounded-full relative transition-colors ${config.curvedScreen !== false ? 'bg-foreground' : 'bg-foreground/20'}`}>
                                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-background transition-transform ${config.curvedScreen !== false ? 'left-7' : 'left-1'}`} />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-foreground/60">Phosphor Glow</span>
                                                <button onClick={() => onConfigChange('phosphorGlow', !config.phosphorGlow)} className={`w-12 h-6 rounded-full relative transition-colors ${config.phosphorGlow !== false ? 'bg-foreground' : 'bg-foreground/20'}`}>
                                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-background transition-transform ${config.phosphorGlow !== false ? 'left-7' : 'left-1'}`} />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-foreground/60">VHS Tracking</span>
                                                <button onClick={() => onConfigChange('vhsTracking', !config.vhsTracking)} className={`w-12 h-6 rounded-full relative transition-colors ${config.vhsTracking !== false ? 'bg-foreground' : 'bg-foreground/20'}`}>
                                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-background transition-transform ${config.vhsTracking !== false ? 'left-7' : 'left-1'}`} />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-foreground/60">Auto Glitch</span>
                                                <button onClick={() => onConfigChange('autoGlitch', !config.autoGlitch)} className={`w-12 h-6 rounded-full relative transition-colors ${config.autoGlitch !== false ? 'bg-foreground' : 'bg-foreground/20'}`}>
                                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-background transition-transform ${config.autoGlitch !== false ? 'left-7' : 'left-1'}`} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Color Tint</label>
                                        <div className="flex flex-wrap gap-2">
                                            {(['none', 'green', 'amber', 'blue'] as const).map((tint) => (
                                                <button
                                                    key={tint}
                                                    onClick={() => onConfigChange('colorTint', tint)}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${(config.colorTint || 'none') === tint ? 'bg-foreground text-background' : 'bg-foreground/5 hover:bg-foreground/10 text-foreground/70'}`}
                                                >
                                                    {tint.charAt(0).toUpperCase() + tint.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            ) : componentId === 'diagonal-arrival' ? (
                                // DIAGONAL ARRIVAL CONTROLS
                                <>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Alignment</label>
                                        <NumberControl
                                            label="Angle"
                                            value={config.angle ?? 195}
                                            min={0}
                                            max={360}
                                            suffix="°"
                                            onChange={(val) => onConfigChange('angle', val)}
                                        />
                                    </div>
                                </>
                            ) : componentId === 'infinity-brand-scroll' ? (
                                // INFINITY BRAND SCROLL CONTROLS
                                <>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Motion</label>
                                        <NumberControl
                                            label="Speed"
                                            value={config.speed ?? 0.5}
                                            min={0}
                                            max={5}
                                            suffix="x"
                                            onChange={(val) => onConfigChange('speed', val)}
                                        />
                                        <NumberControl
                                            label="Radius"
                                            value={config.radius ?? 8}
                                            min={2}
                                            max={15}
                                            suffix="u"
                                            onChange={(val) => onConfigChange('radius', val)}
                                        />
                                        <NumberControl
                                            label="Weight"
                                            value={config.weight ?? 5}
                                            min={0.1}
                                            max={10}
                                            suffix=""
                                            onChange={(val) => onConfigChange('weight', val)}
                                        />
                                        <NumberControl
                                            label="Impact"
                                            value={config.impact ?? 1}
                                            min={0}
                                            max={3}
                                            suffix="u"
                                            onChange={(val) => onConfigChange('impact', val)}
                                        />
                                    </div>
                                </>
                            ) : componentId === 'expandable-strips' ? (
                                // EXPANDABLE STRIPS CONTROLS
                                <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                                    <div className="w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center mb-4">
                                        <svg
                                            className="w-6 h-6 text-foreground/30"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                        </svg>
                                    </div>
                                    <p className="text-sm font-medium text-foreground/60 mb-1">No Controls Available</p>
                                    <p className="text-xs text-foreground/40 max-w-[200px]">
                                        This component uses pre-configured settings and doesn't have adjustable controls.
                                    </p>
                                </div>
                            ) : componentId === 'mouse-interaction-1' ? (
                                // MOUSE INTERACTION 1 CONTROLS
                                <>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Layout</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <NumberControl label="Box Size" value={config.boxSize || 35} min={10} max={60} suffix="px" onChange={(val) => onConfigChange('boxSize', val)} />
                                            <NumberControl label="Gap" value={config.gridGap ?? 0} min={-2} max={10} suffix="px" onChange={(val) => onConfigChange('gridGap', val)} />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Trail</label>
                                        <NumberControl label="Trail Size" value={config.trailSize || 8} min={1} max={30} onChange={(val) => onConfigChange('trailSize', val)} />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Appearance</label>
                                        <div>
                                            <span className="text-xs text-foreground/40 mb-1 block">Hover Color</span>
                                            <input type="color" value={config.onHoverColor || '#500724'} onChange={(e) => onConfigChange('onHoverColor', e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" />
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-sm text-foreground/60">Hide Grid</span>
                                            <button onClick={() => onConfigChange('hideGrid', !config.hideGrid)} className={`w-12 h-6 rounded-full relative transition-colors ${config.hideGrid !== false ? 'bg-foreground' : 'bg-foreground/20'}`}>
                                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-background transition-transform ${config.hideGrid !== false ? 'left-7' : 'left-1'}`} />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : componentId === 'perspective-carousel' ? (
                                // PERSPECTIVE CAROUSEL CONTROLS
                                <>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Position</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <NumberControl
                                                label="X Spacing"
                                                value={config.xSpacing ?? 100}
                                                min={-300}
                                                max={300}
                                                suffix="px"
                                                onChange={(val) => onConfigChange('xSpacing', val)}
                                            />
                                            <NumberControl
                                                label="Y Spacing"
                                                value={config.ySpacing ?? 2}
                                                min={-200}
                                                max={200}
                                                suffix="px"
                                                onChange={(val) => onConfigChange('ySpacing', val)}
                                            />
                                        </div>
                                        <NumberControl
                                            label="Z Depth"
                                            value={config.zDepth ?? -25}
                                            min={-200}
                                            max={200}
                                            suffix="px"
                                            onChange={(val) => onConfigChange('zDepth', val)}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Rotation</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <NumberControl
                                                label="Rotate Y"
                                                value={config.rotateY ?? 130}
                                                min={0}
                                                max={360}
                                                suffix="°"
                                                onChange={(val) => onConfigChange('rotateY', val)}
                                            />
                                            <NumberControl
                                                label="Rotate X"
                                                value={config.rotateX ?? 0}
                                                min={0}
                                                max={100}
                                                onChange={(val) => onConfigChange('rotateX', val)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Appearance</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <NumberControl
                                                label="Scale"
                                                value={config.scale ?? 75}
                                                min={10}
                                                max={150}
                                                suffix="%"
                                                onChange={(val) => onConfigChange('scale', val)}
                                            />
                                            <NumberControl
                                                label="Perspective"
                                                value={config.perspective ?? 4000}
                                                min={500}
                                                max={10000}
                                                suffix="px"
                                                onChange={(val) => onConfigChange('perspective', val)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Carousel Rotation</label>
                                        <NumberControl
                                            label="Rotation"
                                            value={config.carouselRotation ?? 0}
                                            min={-180}
                                            max={180}
                                            suffix="°"
                                            onChange={(val) => onConfigChange('carouselRotation', val)}
                                        />
                                    </div>
                                </>
                            ) : (
                                // DEFAULT - No controls available
                                <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                                    <div className="w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center mb-4">
                                        <svg
                                            className="w-6 h-6 text-foreground/30"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                        </svg>
                                    </div>
                                    <p className="text-sm font-medium text-foreground/60 mb-1">No Controls Available</p>
                                    <p className="text-xs text-foreground/40 max-w-[200px]">
                                        This component uses pre-configured settings and doesn't have adjustable controls.
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )
            }
        </AnimatePresence >
    );
}









// ============================================
// CODE DISPLAY
// ============================================

interface CodeDisplayProps {
    config: any;
    componentId: string;
    initialFullCode?: string; // Optional - will lazy load if not provided
}

function CodeDisplay({ config, componentId, initialFullCode }: CodeDisplayProps) {
    const [activeTab, setActiveTab] = useState<'usage' | 'full'>('usage');
    const [copied, setCopied] = useState(false);
    const [fullCode, setFullCode] = useState<string | null>(initialFullCode || null);
    const [isLoadingCode, setIsLoadingCode] = useState(false);
    const codeContainerRef = useRef<HTMLPreElement>(null);

    // Lazy load full code when tab is clicked
    const loadFullCode = async () => {
        if (fullCode || isLoadingCode) return;

        setIsLoadingCode(true);
        try {
            // Dynamically import the components data only for fullCode
            const { getComponentById } = await import("@/data/componentsData");
            const data = getComponentById(componentId);
            if (data?.fullCode) {
                setFullCode(data.fullCode);
            } else {
                setFullCode('// Code not found');
            }
        } catch (error) {
            console.error('Failed to load full code:', error);
            setFullCode('// Failed to load code');
        } finally {
            setIsLoadingCode(false);
        }
    };

    // Handle tab change with lazy loading
    const handleTabChange = async (tab: 'usage' | 'full') => {
        setActiveTab(tab);
        if (tab === 'full' && !fullCode) {
            await loadFullCode();
        }
    };

    // Handle wheel events to prevent parent scroll when scrolling inside code section
    const handleWheel = (e: React.WheelEvent<HTMLPreElement>) => {
        const container = codeContainerRef.current;
        if (!container) return;

        const { scrollTop, scrollHeight, clientHeight, scrollLeft, scrollWidth, clientWidth } = container;
        const isScrollableY = scrollHeight > clientHeight;
        const isScrollableX = scrollWidth > clientWidth;

        // If there's vertical or horizontal scrollable content
        if (isScrollableY || isScrollableX) {
            const isAtTop = scrollTop === 0;
            const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
            const isAtLeft = scrollLeft === 0;
            const isAtRight = scrollLeft + clientWidth >= scrollWidth - 1;

            // Prevent parent scroll when scrolling vertically within bounds
            if (isScrollableY) {
                if ((e.deltaY < 0 && !isAtTop) || (e.deltaY > 0 && !isAtBottom)) {
                    e.stopPropagation();
                }
            }

            // Prevent parent scroll when scrolling horizontally within bounds
            if (isScrollableX) {
                if ((e.deltaX < 0 && !isAtLeft) || (e.deltaX > 0 && !isAtRight)) {
                    e.stopPropagation();
                }
            }
        }
    };

    // Generate dynamic usage code based on current config
    const dynamicUsage = useMemo(() => {
        if (componentId === 'ascii-simulation') {
            const defaultConfig: AsciiSimulationConfig = {
                shape: 'torus',
                scale: 1,
                speed: 1,
                rotationX: 0,
                rotationY: 0,
                charSet: ".,-~:;=!*#$@",
                color: 'var(--foreground)',
                fontSize: 12,
                invert: false,
            };

            const configEntries: string[] = [];
            if (config.shape !== defaultConfig.shape) configEntries.push(`        shape: '${config.shape}',`);
            if (config.scale !== defaultConfig.scale) configEntries.push(`        scale: ${config.scale},`);
            if (config.speed !== defaultConfig.speed) configEntries.push(`        speed: ${config.speed},`);
            if (config.charSet !== defaultConfig.charSet) configEntries.push(`        charSet: '${config.charSet}',`);
            if (config.color !== defaultConfig.color) configEntries.push(`        color: '${config.color}',`);
            if (config.fontSize !== defaultConfig.fontSize) configEntries.push(`        fontSize: ${config.fontSize},`);
            if (config.invert !== defaultConfig.invert) configEntries.push(`        invert: ${config.invert},`);

            if (configEntries.length === 0) {
                return `import { AsciiSimulation } from '@/components/ui';\n\n// Basic usage\n<AsciiSimulation />`;
            }
            return `import { AsciiSimulation } from '@/components/ui';\n\n<AsciiSimulation\n    config={{\n${configEntries.join('\n')}\n    }}\n/>`;

        }

        if (componentId === 'liquid-morph') {
            const defaultConfig: LiquidMorphConfig = {
                color: "#ffffff",
                radius: 1,
                distort: 0.5,
                speed: 2,
                metalness: 0.9,
                roughness: 0.1,
                intensity: 1,
            };

            const configEntries: string[] = [];
            if (config.color !== defaultConfig.color) configEntries.push(`        color: '${config.color}',`);
            if (config.radius !== defaultConfig.radius) configEntries.push(`        radius: ${config.radius},`);
            if (config.distort !== defaultConfig.distort) configEntries.push(`        distort: ${config.distort},`);
            if (config.speed !== defaultConfig.speed) configEntries.push(`        speed: ${config.speed},`);
            if (config.metalness !== defaultConfig.metalness) configEntries.push(`        metalness: ${config.metalness},`);
            if (config.roughness !== defaultConfig.roughness) configEntries.push(`        roughness: ${config.roughness},`);
            if (config.intensity !== defaultConfig.intensity) configEntries.push(`        intensity: ${config.intensity},`);

            if (configEntries.length === 0) {
                return `import { LiquidMorph } from '@/components/ui';\n\n// Basic usage\n<LiquidMorph />`;
            }
            return `import { LiquidMorph } from '@/components/ui';\n\n<LiquidMorph\n    config={{\n${configEntries.join('\n')}\n    }}\n/>`;
        }

        if (componentId === 'page-reveal') {
            const defaultConfig = {
                logoText: "MORPHYS",
                logoFontSize: 80,
                splitCount: { mobile: 10, tablet: 15, desktop: 20 },
                logoBlurDuration: 0.8,
                logoHoldDuration: 0.5,
                slitAnimationDuration: 0.6,
                slitStaggerDelay: 0.06,
                backgroundColor: "#000000",
                logoColor: "#ffffff",
            };

            const configEntries: string[] = [];
            if (config.logoText !== defaultConfig.logoText) configEntries.push(`        logoText: '${config.logoText}',`);
            if (config.logoFontSize !== defaultConfig.logoFontSize) configEntries.push(`        logoFontSize: ${config.logoFontSize},`);
            if (config.logoBlurDuration !== defaultConfig.logoBlurDuration) configEntries.push(`        logoBlurDuration: ${config.logoBlurDuration},`);
            if (config.logoHoldDuration !== defaultConfig.logoHoldDuration) configEntries.push(`        logoHoldDuration: ${config.logoHoldDuration},`);
            if (config.slitAnimationDuration !== defaultConfig.slitAnimationDuration) configEntries.push(`        slitAnimationDuration: ${config.slitAnimationDuration},`);
            if (config.slitStaggerDelay !== defaultConfig.slitStaggerDelay) configEntries.push(`        slitStaggerDelay: ${config.slitStaggerDelay},`);
            if (config.backgroundColor !== defaultConfig.backgroundColor) configEntries.push(`        backgroundColor: '${config.backgroundColor}',`);
            if (config.logoColor !== defaultConfig.logoColor) configEntries.push(`        logoColor: '${config.logoColor}',`);

            // Handle splitCount object
            const sc = config.splitCount || defaultConfig.splitCount;
            if (sc.mobile !== defaultConfig.splitCount.mobile ||
                sc.tablet !== defaultConfig.splitCount.tablet ||
                sc.desktop !== defaultConfig.splitCount.desktop) {
                configEntries.push(`        splitCount: { mobile: ${sc.mobile}, tablet: ${sc.tablet}, desktop: ${sc.desktop} },`);
            }

            if (configEntries.length === 0) {
                return `import { PageReveal } from '@/components/ui';\n\n// Basic usage - wraps your page content\n<PageReveal>\n    <YourPageContent />\n</PageReveal>`;
            }
            return `import { PageReveal } from '@/components/ui';\n\n<PageReveal\n    config={{\n${configEntries.join('\n')}\n    }}\n>\n    <YourPageContent />\n</PageReveal>`;
        }

        if (componentId === 'pixel-simulation') {
            const defaultConfig = {
                shape: 'torus',
                scale: 1,
                speed: 1,
                pixelSize: 8,
                gap: 0,
                colorMode: 'depth',
                color1: '#4F46E5',
                color2: '#ec4899',
            };

            const configEntries: string[] = [];
            if (config.shape !== defaultConfig.shape) configEntries.push(`        shape: '${config.shape}',`);
            if (config.pixelSize !== defaultConfig.pixelSize) configEntries.push(`        pixelSize: ${config.pixelSize},`);
            if (config.gap !== defaultConfig.gap) configEntries.push(`        gap: ${config.gap},`);
            if (config.colorMode !== defaultConfig.colorMode) configEntries.push(`        colorMode: '${config.colorMode}',`);
            if (config.color1 !== defaultConfig.color1) configEntries.push(`        color1: '${config.color1}',`);
            if (config.color2 !== defaultConfig.color2) configEntries.push(`        color2: '${config.color2}',`);

            if (configEntries.length === 0) {
                return `import { PixelSimulation } from '@/components/ui';\n\n// Basic usage\n<PixelSimulation />`;
            }
            return `import { PixelSimulation } from '@/components/ui';\n\n<PixelSimulation\n    config={{\n${configEntries.join('\n')}\n    }}\n/>`;
        }

        if (componentId === 'spotlight-search') {
            const defaultConfig = {
                morphDelay: 800,
                searchWidth: 600,
                springStiffness: 400,
                springDamping: 15,
            };

            const configEntries: string[] = [];
            if (config.morphDelay !== defaultConfig.morphDelay) configEntries.push(`        morphDelay: ${config.morphDelay},`);
            if (config.searchWidth !== defaultConfig.searchWidth) configEntries.push(`        searchWidth: ${config.searchWidth},`);
            if (config.springStiffness !== defaultConfig.springStiffness) configEntries.push(`        springStiffness: ${config.springStiffness},`);
            if (config.springDamping !== defaultConfig.springDamping) configEntries.push(`        springDamping: ${config.springDamping},`);

            if (configEntries.length === 0) {
                return `import { SpotlightSearch } from '@/components/ui';\n\n// Basic usage\n<SpotlightSearch />`;
            }
            return `import { SpotlightSearch } from '@/components/ui';\n\n<SpotlightSearch\n    config={{\n${configEntries.join('\n')}\n    }}\n/>`;
        }

        if (componentId === 'diagonal-arrival') {
            const defaultConfig = {
                angle: 195
            };

            const configEntries: string[] = [];
            if (config.angle !== defaultConfig.angle) configEntries.push(`        angle: ${config.angle}`);

            if (configEntries.length === 0) {
                return `import DiagonalArrival from '@/components/ui/DiagonalArrival';\n\n// Basic usage\n<DiagonalArrival />`;
            }
            return `import DiagonalArrival from '@/components/ui/DiagonalArrival';\n\n<DiagonalArrival\n    config={{\n${configEntries.join(',\n')}\n    }}\n/>`;
        }

        if (componentId === 'navbar-menu') {
            const defaultConfig = {
                logoText: "RUN",
                accentColor: "#ef4444",
                animationSpeed: 1,
                borderRadius: 32,
            };

            const configEntries: string[] = [];
            if (config.logoText !== defaultConfig.logoText) configEntries.push(`        logoText: '${config.logoText}',`);
            if (config.accentColor !== defaultConfig.accentColor) configEntries.push(`        accentColor: '${config.accentColor}',`);
            if (config.animationSpeed !== defaultConfig.animationSpeed) configEntries.push(`        animationSpeed: ${config.animationSpeed},`);
            if (config.borderRadius !== defaultConfig.borderRadius) configEntries.push(`        borderRadius: ${config.borderRadius},`);

            if (configEntries.length === 0) {
                return `import { NavbarMenu } from '@/components/ui';\n\n// Basic usage\n<NavbarMenu />`;
            }
            return `import { NavbarMenu } from '@/components/ui';\n\n<NavbarMenu\n    config={{\n${configEntries.join('\n')}\n    }}\n/>`;
        }

        if (componentId === 'navbar-menu-2') {
            const defaultConfig = {
                logoText: "Morphys",
                backgroundColor: "#ffffff",
                textColor: "#000000",
            };

            const configEntries: string[] = [];
            if (config.logoText !== defaultConfig.logoText) configEntries.push(`        logoText: '${config.logoText}',`);
            if (config.backgroundColor !== defaultConfig.backgroundColor) configEntries.push(`        backgroundColor: '${config.backgroundColor}',`);
            if (config.textColor !== defaultConfig.textColor) configEntries.push(`        textColor: '${config.textColor}',`);

            if (configEntries.length === 0) {
                return `import { NavbarMenu2 } from '@/components/ui';\n\n// Basic usage\n<NavbarMenu2 />`;
            }
            return `import { NavbarMenu2 } from '@/components/ui';\n\n<NavbarMenu2\n    config={{\n${configEntries.join('\n')}\n    }}\n/>`;
        }

        if (componentId === 'reality-lens') {
            const defaultConfig = {
                lensSize: 120,
            };

            const configEntries: string[] = [];
            if (config.lensSize !== defaultConfig.lensSize) configEntries.push(`        lensSize: ${config.lensSize},`);

            if (configEntries.length === 0) {
                return `import { RealityLens } from '@/components/ui';\n\n// Basic usage - wrap content to reveal\n<RealityLens\n    revealContent={<YourHiddenContent />}\n>\n    <YourVisibleContent />\n</RealityLens>`;
            }
            return `import { RealityLens } from '@/components/ui';\n\n<RealityLens\n    lensSize={${config.lensSize}}\n    revealContent={<YourHiddenContent />}\n>\n    <YourVisibleContent />\n</RealityLens>`;
        }

        if (componentId === 'image-trail-cursor') {
            const defaultConfig: ImageTrailCursorConfig = {
                size: 150,
                rotation: true,
                fadeDuration: 0.6,
                distanceThreshold: 40,
            };

            const configEntries: string[] = [];
            if (config.size !== defaultConfig.size) configEntries.push(`        size: ${config.size},`);
            if (config.rotation !== defaultConfig.rotation) configEntries.push(`        rotation: ${config.rotation},`);
            if (config.fadeDuration !== defaultConfig.fadeDuration) configEntries.push(`        fadeDuration: ${config.fadeDuration},`);
            if (config.distanceThreshold !== defaultConfig.distanceThreshold) configEntries.push(`        distanceThreshold: ${config.distanceThreshold},`);

            if (configEntries.length === 0) {
                return `import { ImageTrailCursor } from '@/components/ui';\n\n// Basic usage\n<ImageTrailCursor />`;
            }
            return `import { ImageTrailCursor } from '@/components/ui';\n\n<ImageTrailCursor\n    config={{\n${configEntries.join('\n')}\n    }}\n/>`;
        }

        if (componentId === 'scroll-to-reveal') {
            const defaultConfig = {
                minOpacity: 0.15,
                text: "Undefined",
                className: ""
            };

            // Props approach
            return `import { ScrollToReveal } from '@/components/ui';\n\n<ScrollToReveal\n    text="${config.text || 'Your text here...'}"\n    minOpacity={${config.minOpacity ?? 0.15}}\n    className="text-4xl font-bold"\n/>`;
        }

        if (componentId === 'diffuse-text') {
            const defaultConfig = {
                text: "MORPHYS",
                blurLevel: 24,
                intensity: 1,
                color: "#ffffff",
                backgroundColor: "#7ca5b8",
            };

            const configEntries: string[] = [];
            if (config.text !== defaultConfig.text) configEntries.push(`        text: '${config.text}',`);
            if (config.blurLevel !== defaultConfig.blurLevel) configEntries.push(`        blurLevel: ${config.blurLevel},`);
            if (config.intensity !== defaultConfig.intensity) configEntries.push(`        intensity: ${config.intensity},`);
            if (config.color !== defaultConfig.color) configEntries.push(`        color: '${config.color}',`);
            if (config.backgroundColor !== defaultConfig.backgroundColor) configEntries.push(`        backgroundColor: '${config.backgroundColor}',`);

            if (configEntries.length === 0) {
                return `import { DiffuseText } from '@/components/ui';\n\n// Basic usage\n<DiffuseText />`;
            }
            return `import { DiffuseText } from '@/components/ui/DiffuseText';\n\n<DiffuseText\n    config={{\n${configEntries.join('\n')}\n    }}\n/>`;
        }

        if (componentId === 'diagonal-focus') {
            return `import { DiagonalFocus } from '@/components/ui/DiagonalFocus';

// Basic usage - renders a draggable diagonal carousel
<DiagonalFocus />

// With custom className
<DiagonalFocus className="h-screen" />`;
        }

        if (componentId === 'notification-stack') {
            return `import { NotificationStack } from '@/components/ui/NotificationStack';

// Basic usage - renders a draggable notification stack
<NotificationStack />

// With custom className
<NotificationStack className="h-screen" />`;
        }

        if (componentId === 'text-pressure') {
            const defaultConfig = {
                text: "MORPHYS",
                textColor: "var(--foreground)",
                minFontSize: 36,
            };

            const configEntries: string[] = [];
            if (config.text !== defaultConfig.text) configEntries.push(`        text: '${config.text}',`);
            if (config.textColor !== defaultConfig.textColor) configEntries.push(`        textColor: '${config.textColor}',`);
            if (config.minFontSize !== defaultConfig.minFontSize) configEntries.push(`        minFontSize: ${config.minFontSize},`);

            if (configEntries.length === 0) {
                return `import { TextPressure } from '@/components/ui';\n\n// Basic usage\n<TextPressure text="MORPHYS" />`;
            }
            return `import { TextPressure } from '@/components/ui';\n\n<TextPressure\n    text="${config.text || 'MORPHYS'}"\n    config={{\n${configEntries.join('\n')}\n    }}\n/>`;
        }

        if (componentId === 'fluid-height') {
            return `import FluidHeight from '@/components/ui/FluidHeight';

// Basic usage - displays "MORPHYS" with fluid height animation
<FluidHeight />

// With custom styling
<FluidHeight 
    className="text-[5rem]"
    showHint={false}
/>`;
        }

        if (componentId === 'step-morph') {
            return `import StepMorph from '@/components/ui/StepMorph';

// Basic usage - displays "MORPHYS" in stair-step pattern
<StepMorph />

// With custom text and step size
<StepMorph 
    text="HELLO"
    stepSize={20}
    showHint={false}
/>`;
        }

        if (componentId === 'center-menu') {
            return `import { CenterMenu } from '@/components/ui/CenterMenu';

// Basic usage
<CenterMenu />

// With custom positioning
<CenterMenu className="absolute bottom-8" />`;
        }

        if (componentId === 'index-scroll-reveal') {
            return `import { IndexScrollReveal } from '@/components/ui/IndexScrollReveal';

// Basic usage - renders full page layout
<IndexScrollReveal />

// With custom items
<IndexScrollReveal 
    items={[
        {
            id: '1',
            index: '01',
            title: 'Your Title',
            image: '/your-image.jpg',
            color: '#ff0000'
        }
    ]}
/>`;
        }

        if (componentId === 'infinity-brand-scroll') {
            const configEntries: string[] = [];
            if (config.speed !== 0.5) configEntries.push(`    speed={${config.speed}}`);
            if (config.radius !== 8) configEntries.push(`    radius={${config.radius}}`);
            if (config.weight !== 5) configEntries.push(`    weight={${config.weight}}`);
            if (config.impact !== 1) configEntries.push(`    impact={${config.impact}}`);

            if (configEntries.length === 0) {
                return `import InfinityBrandScroll from '@/components/ui/InfinityBrandScroll';\n\n// Basic usage\n<InfinityBrandScroll />`;
            }
            return `import InfinityBrandScroll from '@/components/ui/InfinityBrandScroll';\n\n<InfinityBrandScroll\n${configEntries.join('\n')}\n/>`;
        }

        if (componentId === 'infinity-brand') {
            return `import { InfinityBrand } from '@/components/ui/InfinityBrand';

// Basic usage 
<InfinityBrand />

// With custom configuration
<InfinityBrand 
    speed={0.4}
    radius={5}
    scaleVar={0.5}
/>`;
        }

        if (componentId === 'text-mirror') {
            const defaultConfig = {
                text: "MORPHYS",
                idleTimeout: 5000,
                spread: 30,
                fontSize: 120,
            };

            const configEntries: string[] = [];
            if (config.text !== defaultConfig.text) configEntries.push(`    text="${config.text}"`);

            const nestedConfig: string[] = [];
            if (config.idleTimeout !== defaultConfig.idleTimeout) nestedConfig.push(`        idleTimeout: ${config.idleTimeout}`);
            if (config.spread !== defaultConfig.spread) nestedConfig.push(`        spread: ${config.spread}`);
            if (config.color) nestedConfig.push(`        color: '${config.color}'`);
            if (config.fontSize !== defaultConfig.fontSize) nestedConfig.push(`        fontSize: ${config.fontSize}`);

            if (nestedConfig.length === 0 && configEntries.length === 0) {
                return `import { TextMirror } from '@/components/ui';\n\n// Basic usage\n<TextMirror />`;
            }

            let props = '';
            if (configEntries.length > 0) props = '\n' + configEntries.join('\n');

            let configProp = '';
            if (nestedConfig.length > 0) {
                configProp = `\n    config={{\n${nestedConfig.join(',\n')}\n    }}`;
            }

            return `import { TextMirror } from '@/components/ui';\n\n<TextMirror${props}${configProp}\n/>`;
        }

        if (componentId === 'glass-surge') {
            return `import { GlassSurge } from '@/components/ui';

<GlassSurge 
    text="${config.text || 'MORPHYS'}"
    className="text-[5rem] md:text-[9rem] font-bold tracking-widest font-logo"
/>`;
        }

        if (componentId === 'layered-image-showcase') {
            return `import { LayeredImageShowcase } from '@/components/ui';

<LayeredImageShowcase 
    config={{
        title: "${config.title || 'MORPHYS'}",
        accentColor: "${config.accentColor || '#FF3333'}",
        textColor: "${config.textColor || '#ffffff'}"
    }}
/>`;
        }

        if (componentId === 'mouse-interaction-1') {
            return `import MouseInteraction1 from '@/components/ui/MouseInteraction1';

<MouseInteraction1 
    boxSize={${config.boxSize || 35}}
    trailSize={${config.trailSize || 8}}
    gridGap={${config.gridGap ?? 0}}
    onHoverColor="${config.onHoverColor || '#500724'}"
    hideGrid={${config.hideGrid ?? true}}
    className="w-full h-full bg-black rounded-lg overflow-hidden"
/>`;
        }

        // FLIP GRID - specific handler
        if (componentId === 'flip-grid') {
            const defaultConfig: FlipGridConfig = {
                cols: 10,
                rows: 8,
                pattern: 'wave',
                easing: 'spring',
                speed: 'normal',
                colorFront: 'var(--foreground)',
                colorBack: 'var(--background)',
                interactive: true,
                gap: 2,
                borderRadius: 2,
            };

            // Only include non-default values
            const configEntries: string[] = [];

            if (config.cols !== defaultConfig.cols) configEntries.push(`        cols: ${config.cols},`);
            if (config.rows !== defaultConfig.rows) configEntries.push(`        rows: ${config.rows},`);
            if (config.pattern !== defaultConfig.pattern) configEntries.push(`        pattern: '${config.pattern}',`);
            if (config.easing !== defaultConfig.easing) configEntries.push(`        easing: '${config.easing}',`);
            if (config.speed !== defaultConfig.speed) configEntries.push(`        speed: '${config.speed}',`);
            if (config.colorFront !== defaultConfig.colorFront) configEntries.push(`        colorFront: '${config.colorFront}',`);
            if (config.colorBack !== defaultConfig.colorBack) configEntries.push(`        colorBack: '${config.colorBack}',`);
            if (config.interactive !== defaultConfig.interactive) configEntries.push(`        interactive: ${config.interactive},`);
            if (config.gap !== defaultConfig.gap) configEntries.push(`        gap: ${config.gap},`);
            if (config.borderRadius !== defaultConfig.borderRadius) configEntries.push(`        borderRadius: ${config.borderRadius},`);

            if (configEntries.length === 0) {
                return `import { FlipGrid } from '@/components/ui/FlipGrid';

// Basic usage with default config
<FlipGrid />`;
            }

            return `import { FlipGrid } from '@/components/ui/FlipGrid';

// With your custom configuration
<FlipGrid
    config={{
${configEntries.join('\n')}
    }}
/>`;
        }

        if (componentId === 'text-reveal-2') {
            return `import TextReveal2 from '@/components/ui/TextReveal2';

// Basic usage
<TextReveal2 text="${config.text || 'MORPHYS'}" />

// With custom delay
<TextReveal2
    text="${config.text || 'MORPHYS'}"
    delay={${config.delay || 0}}
    className="text-6xl font-bold"
/>`;
        }

        if (componentId === 'text-reveal') {
            return `import TextReveal from '@/components/ui/TextReveal';

// Basic usage
<TextReveal text="${config.text || 'MORPHYS'}" />

// With custom delay
<TextReveal
    text="${config.text || 'MORPHYS'}"
    delay={${config.delay || 0.5}}
    className="text-6xl font-bold"
/>`;
        }

        if (componentId === 'crt-glitch') {
            return `import { CRTGlitch } from '@/components/ui';

// Basic usage
<CRTGlitch />

// With custom configuration
<CRTGlitch
    config={{
        text: "${config.text || 'MORPHYS'}",
        noiseIntensity: ${config.noiseIntensity ?? 0.15},
        scanlineIntensity: ${config.scanlineIntensity ?? 0.4},
        rgbShiftIntensity: ${config.rgbShiftIntensity ?? 0.6},
        glitchFrequency: ${config.glitchFrequency ?? 0.3},
        colorTint: '${config.colorTint || 'none'}',
        curvedScreen: ${config.curvedScreen !== false},
        phosphorGlow: ${config.phosphorGlow !== false},
        fontSize: ${config.fontSize || 80}
    }}
/>`;
        }

        if (componentId === 'flip-clock') {
            return `import { FlipClock } from '@/components/ui';

// Basic usage
<FlipClock />`;
        }

        // DEFAULT FALLBACK - Use the usage from componentsDataLite
        // This ensures every component shows its correct usage code
        const componentDataForUsage = getComponentByIdLite(componentId);
        if (componentDataForUsage?.usage) {
            return componentDataForUsage.usage;
        }

        // If no usage data found at all
        return `// This component uses pre-configured settings.
// See the "Full Code" tab for the complete implementation.`;
    }, [config, componentId]);



    const handleCopy = async () => {
        const code = activeTab === 'usage' ? dynamicUsage : (fullCode || '');
        const success = await copyToClipboard(code);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Render code content with loading state
    const renderCodeContent = () => {
        if (activeTab === 'usage') {
            return dynamicUsage;
        }

        if (isLoadingCode) {
            return (
                <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground/60 rounded-full animate-spin" />
                        <span className="text-sm text-foreground/50">Loading full code...</span>
                    </div>
                </div>
            );
        }

        return fullCode || 'Click to load full code...';
    };

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2">
                    <button
                        onClick={() => handleTabChange('usage')}
                        className={`
                            px-4 py-2 rounded-lg text-sm font-medium transition-colors
                            ${activeTab === 'usage'
                                ? 'bg-foreground text-background'
                                : 'bg-foreground/5 hover:bg-foreground/10 text-foreground/70'
                            }
                        `}
                    >
                        Usage
                    </button>
                    <button
                        onClick={() => handleTabChange('full')}
                        className={`
                            px-4 py-2 rounded-lg text-sm font-medium transition-colors
                            ${activeTab === 'full'
                                ? 'bg-foreground text-background'
                                : 'bg-foreground/5 hover:bg-foreground/10 text-foreground/70'
                            }
                        `}
                    >
                        Full Code
                    </button>
                </div>
                <button
                    onClick={handleCopy}
                    disabled={activeTab === 'full' && isLoadingCode}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-foreground/5 hover:bg-foreground/10 transition-colors disabled:opacity-50"
                >
                    {copied ? '✓ Copied!' : 'Copy'}
                </button>
            </div>

            <div className="
                relative rounded-2xl overflow-hidden
                bg-foreground/5 border border-foreground/10
            ">
                <pre
                    ref={codeContainerRef}
                    onWheel={handleWheel}
                    className="p-6 overflow-auto text-sm max-h-[500px] scrollbar-thin scrollbar-thumb-foreground/20 scrollbar-track-transparent overscroll-contain"
                >
                    <code className="text-foreground/80 font-mono">
                        {typeof renderCodeContent() === 'string' ? renderCodeContent() : null}
                    </code>
                    {typeof renderCodeContent() !== 'string' && renderCodeContent()}
                </pre>
            </div>
        </div>
    );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================



export default function ComponentDetailPage() {
    const params = useParams();
    const componentId = params.componentId as string;
    const { stopLoading } = useNavigationLoading();

    // Stop the loading overlay as soon as we mount
    useEffect(() => {
        stopLoading();
    }, [stopLoading]);

    const componentData = useMemo(() => getComponentByIdLite(componentId), [componentId]);

    const [config, setConfig] = useState<any>(() => {
        if (componentId === 'ascii-simulation') {
            return {
                shape: 'car',
                scale: 1,
                speed: 1,
                rotationX: 0,
                rotationY: 0,
                charSet: ".,-~:;=!*#$@",
                color: 'var(--foreground)',
                fontSize: 12,
                invert: false,
            };
        }
        if (componentId === 'liquid-morph') {
            return {
                color: "#ffffff",
                radius: 1,
                distort: 0.5,
                speed: 2,
                metalness: 0.9,
                roughness: 0.1,
                intensity: 1,
            };
        }
        if (componentId === 'page-reveal') {
            return {
                logoText: "MORPHYS",
                logoFontSize: 80,
                splitCount: {
                    mobile: 10,
                    tablet: 15,
                    desktop: 20,
                },
                logoBlurDuration: 0.8,
                logoHoldDuration: 0.5,
                slitAnimationDuration: 0.6,
                slitStaggerDelay: 0.06,
                backgroundColor: "#000000",
                logoColor: "#ffffff",
                autoStart: true,
            };
        }
        if (componentId === 'navbar-menu') {
            return {
                logoText: "RUN",
                accentColor: "#ef4444",
                animationSpeed: 1,
                borderRadius: 32,
            };
        }
        if (componentId === 'navbar-menu-2') {
            return {
                logoText: "Morphys",
                backgroundColor: "#ffffff",
                textColor: "#000000",
            };
        }
        if (componentId === 'spotlight-search') {
            return {
                morphDelay: 800,
                searchWidth: 600,
                springStiffness: 400,
                springDamping: 15,
            };
        }
        if (componentId === 'image-trail-cursor') {
            return {
                size: 150,
                rotation: true,
                fadeDuration: 0.6,
                distanceThreshold: 40,
            };
        }
        if (componentId === 'reality-lens') {
            return {
                lensSize: 200,
            };
        }
        if (componentId === 'glass-surge') {
            return {
                text: "MORPHYS",
            };
        }
        if (componentId === 'layered-image-showcase') {
            return {
                title: "MORPHYS",
                accentColor: "#FF3333",
                textColor: "#ffffff"
            };
        }
        if (componentId === 'frosted-glass') {
            return {
                text: "CURATED CHAOS",
                blurAmount: 30,
                fontSize: 300
            };
        }
        if (componentId === 'reveal-marquee') {
            return {}; // Use component defaults
        }
        if (componentId === 'wave-marquee') {
            return {
                speed: 2,
                amplitude: 80,
                wavelength: 200,
                grayscale: true,
                logoScale: 1.2
            };
        }
        if (componentId === 'text-reveal') {
            return {
                text: "MORPHYS",
                delay: 0.5
            };
        }
        if (componentId === 'text-reveal-2') {
            return {
                text: "MORPHYS",
                delay: 0
            };
        }
        if (componentId === 'crt-glitch') {
            return {
                text: "MORPHYS",
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
            };
        }
        if (componentId === 'pixel-simulation') {
            return {
                shape: 'car',
                pixelSize: 8,
                gap: 2,
                speed: 4,
                rotationX: 0,
                rotationY: 0,
                colorMode: 'depth',
                color1: '#6366f1',
                color2: '#a855f7'
            };
        }
        if (componentId === 'mouse-interaction-1') {
            return {
                boxSize: 35,
                trailSize: 8,
                gridGap: 0,
                onHoverColor: '#500724',
                hideGrid: true,
            };
        }
        if (componentId === 'kinetic-grid') {
            return {
                gridSize: 40,
                plusSize: 10,
                color: 'currentColor',
                influenceRadius: 400,
                forceMultiplier: 0.0005,
                damping: 0.9,
            };
        }
        if (componentId === 'running-outline') {
            return {
                words: [{ text: "OUTLINE", font: "font-thunder" }],
                color: 'var(--foreground)'
            };
        }
        if (componentId === 'infinity-brand-scroll') {
            return {
                speed: 0.5,
                radius: 10
            };
        }
        return {
            cols: 10,
            rows: 8,
            pattern: 'wave',
            easing: 'spring',
            speed: 'normal',
            colorFront: 'var(--foreground)',
            colorBack: 'var(--background)',
            interactive: true,
            gap: 2,
            borderRadius: 2,
        };
    });

    const [controlsOpen, setControlsOpen] = useState(false);
    const [depscopied, setDepscopied] = useState(false);
    const [fullPageRevealKey, setFullPageRevealKey] = useState<number | null>(null); // null = not showing, number = key for remount
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isClientMounted, setIsClientMounted] = useState(false);
    const [componentKey, setComponentKey] = useState(0); // For reloading components
    const [isPreviewReady, setIsPreviewReady] = useState(false);
    const sandboxRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsClientMounted(true);
        // Delay component rendering to allow text animations to run smoothly
        const timer = setTimeout(() => setIsPreviewReady(true), 1000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (componentId === 'ascii-simulation') {
            setConfig({
                shape: 'car',
                scale: 1,
                speed: 1,
                rotationX: 0,
                rotationY: 0,
                charSet: ".,-~:;=!*#$@",
                color: 'var(--foreground)',
                fontSize: 12,
                invert: false,
            });
        } else if (componentId === 'liquid-morph') {
            setConfig({
                color: "#ffffff",
                radius: 1,
                distort: 0.5,
                speed: 2,
                metalness: 0.9,
                roughness: 0.1,
                intensity: 1,
            });
        } else if (componentId === 'flip-grid') {
            setConfig({
                cols: 10,
                rows: 8,
                pattern: 'wave',
                easing: 'spring',
                speed: 'normal',
                colorFront: 'var(--foreground)',
                colorBack: 'var(--background)',
                interactive: true,
                gap: 2,
                borderRadius: 2,
            });
        } else if (componentId === 'page-reveal') {
            setConfig({
                logoText: "MORPHYS",
                logoFontSize: 80,
                splitCount: {
                    mobile: 10,
                    tablet: 15,
                    desktop: 20,
                },
                logoBlurDuration: 0.8,
                logoHoldDuration: 0.5,
                slitAnimationDuration: 0.6,
                slitStaggerDelay: 0.06,
                backgroundColor: "#000000",
                logoColor: "#ffffff",
                autoStart: true,
            });
        } else if (componentId === 'navbar-menu') {
            setConfig({
                logoText: "RUN",
                accentColor: "#ef4444",
                animationSpeed: 1,
                borderRadius: 32,
            });
        } else if (componentId === 'spotlight-search') {
            setConfig({
                morphDelay: 800,
                searchWidth: 600,
                springStiffness: 400,
                springDamping: 15,
            });
        } else if (componentId === 'reality-lens') {
            setConfig({
                lensSize: 120,
            });
        } else if (componentId === 'mouse-interaction-1') {
            setConfig({
                boxSize: 35,
                trailSize: 8,
                gridGap: 0,
                onHoverColor: '#500724',
                hideGrid: true,
            });
        } else if (componentId === 'kinetic-grid') {
            setConfig({
                gridSize: 40,
                plusSize: 10,
                color: 'currentColor',
                influenceRadius: 400,
                forceMultiplier: 0.0005,
                damping: 0.9,
            });
        } else if (componentId === 'diffuse-text') {
            setConfig({
                text: "MORPHYS",
                subtextLeft: "Barcelona Arts Summer School",
                subtextRight: "by ESCAC / ESMUC / Institut del Teatre",
                blurLevel: 24,
                intensity: 1,
                color: "#ffffff",
                backgroundColor: "#7ca5b8",
            });
        } else if (componentId === 'text-mirror') {
            setConfig({
                text: "MORPHYS",
                idleTimeout: 5000,
                spread: 30,
                fontSize: 120,
            });
        } else if (componentId === 'glass-surge') {
            setConfig({
                text: "MORPHYS",
            });
        } else if (componentId === 'scroll-to-reveal') {
            setConfig({
                text: "Morphys is a curated collection of high-performance, aesthetically pleasing UI components designed to elevate your web applications. Built with React, Tailwind CSS, and Framer Motion, it offers seamless integration for developers seeking valid, modern design. Our library features a diverse range of animations, interactions, and layout utilities that are fully customizable and responsive. Whether you're building stunning landing pages or complex applications, Morphys provides the essential building blocks to create immersive user experiences that captivate and engage your audience.",
                minOpacity: 0.15,
            });
        } else if (componentId === 'image-trail-cursor') {
            setConfig({
                size: 150,
                rotation: true,
                fadeDuration: 0.6,
                distanceThreshold: 40,
            });
        } else if (componentId === 'navbar-menu-2') {
            setConfig({
                logoText: "Morphys",
                backgroundColor: "#ffffff",
                textColor: "#000000",
            });
        } else if (componentId === 'layered-image-showcase') {
            setConfig({
                title: "MORPHYS",
                accentColor: "#FF3333",
                textColor: "#ffffff",
            });
        } else if (componentId === 'text-pressure') {
            setConfig({
                text: "MORPHYS",
                textColor: "var(--foreground)",
                minFontSize: 36,
            });
        } else if (componentId === 'impact-text') {
            setConfig({
                text: "LOADING",
                fontSize: 100,
                color: "var(--foreground)",
                kerning: 0,
            });
        } else if (componentId === 'frosted-glass') {
            setConfig({
                text: "CURATED CHAOS",
                blurAmount: 30,
                fontSize: 300
            });
        } else if (componentId === 'reveal-marquee') {
            setConfig({}); // Use component defaults
        } else if (componentId === 'wave-marquee') {
            setConfig({
                speed: 2,
                amplitude: 80,
                wavelength: 200,
                grayscale: true,
                logoScale: 1.2
            });
        } else if (componentId === 'text-reveal') {
            setConfig({
                text: "MORPHYS",
                delay: 0.5
            });
        } else if (componentId === 'text-reveal-2') {
            setConfig({
                text: "MORPHYS",
                delay: 0
            });
        } else if (componentId === 'flip-clock') {
            setConfig({});
        } else if (componentId === 'pixel-simulation') {
            setConfig({
                shape: 'car',
                pixelSize: 8,
                gap: 2,
                speed: 4,
                rotationX: 0,
                rotationY: 0,
                colorMode: 'depth',
                color1: '#6366f1',
                color2: '#a855f7'
            });
        } else if (componentId === 'running-outline') {
            setConfig({
                words: [{ text: "OUTLINE", font: "font-thunder" }],
                color: 'var(--foreground)'
            });
        }
    }, [componentId]);

    const handleConfigChange = (key: string, value: unknown) => {
        setConfig((prev: any) => ({ ...prev, [key]: value }));
    };

    if (!componentData) {
        notFound();
    }

    const PreviewComponent = componentRegistry[componentId];

    // Calculate font size based on name length
    const headingSize = useMemo(() => {
        const nameLength = componentData.name.length;
        if (nameLength <= 6) return 'text-[15vw] md:text-[18vw]';
        if (nameLength <= 10) return 'text-[12vw] md:text-[15vw]';
        if (nameLength <= 12) return 'text-[9vw] md:text-[10vw]'; // "Liquid Morph" range
        if (nameLength <= 15) return 'text-[9vw] md:text-[9vw]';
        return 'text-[7vw] md:text-[8vw]';
    }, [componentData.name]);

    return (
        <div className="min-h-screen w-full bg-background">
            {/* Full Page Reveal Overlay - Triggered from controls panel */}
            <AnimatePresence>
                {fullPageRevealKey !== null && componentId === 'page-reveal' && (
                    <PageReveal
                        key={fullPageRevealKey}
                        config={config}
                        autoStart={true}
                        contained={false}
                        onComplete={() => setFullPageRevealKey(null)}
                    >
                        {/* Demo content shown after reveal completes */}
                        <div className="w-full h-full min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
                            <div className="text-center text-white px-4">
                                <h2 className="text-5xl md:text-7xl font-bold mb-4">Welcome</h2>
                                <p className="text-xl md:text-2xl opacity-80 mb-8">Your content has been revealed!</p>
                                <button
                                    onClick={() => setFullPageRevealKey(null)}
                                    className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-white font-medium hover:bg-white/30 transition-colors"
                                >
                                    Close Preview
                                </button>
                            </div>
                        </div>
                    </PageReveal>
                )}
            </AnimatePresence>

            {/* Large Heading */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full px-4 md:px-8 pt-24 md:pt-32"
            >
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-4 mb-4">
                        <span className="text-sm font-mono text-foreground/40">
                            #{String(componentData.index).padStart(2, '0')}
                        </span>
                        <span className="text-sm text-foreground/40">•</span>
                        <span className="text-sm text-foreground/40 capitalize">
                            {componentData.category}
                        </span>
                    </div>

                    <h1
                        className={`
                            ${headingSize}
                            font-heading
                            leading-[0.9] tracking-tight
                            text-foreground
                            uppercase
                        `}
                        style={{ fontVariationSettings: "'wght' 700" }}
                    >
                        {componentData.name.split(' ').map((word, wordIndex, wordsArray) => {
                            // Calculate the character offset for animation delay
                            const charOffset = wordsArray
                                .slice(0, wordIndex)
                                .reduce((acc, w) => acc + w.length + 1, 0);

                            return (
                                <span key={wordIndex} className="inline-block whitespace-nowrap">
                                    {word.split('').map((char, charIndex) => (
                                        <motion.span
                                            key={charIndex}
                                            initial={{ opacity: 0, y: 50 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                duration: 0.5,
                                                delay: (charOffset + charIndex) * 0.03,
                                                ease: [0.23, 1, 0.32, 1]
                                            }}
                                            className="inline-block"
                                        >
                                            {char}
                                        </motion.span>
                                    ))}
                                    {/* Add space after word if not the last word */}
                                    {wordIndex < wordsArray.length - 1 && (
                                        <motion.span
                                            initial={{ opacity: 0, y: 50 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                duration: 0.5,
                                                delay: (charOffset + word.length) * 0.03,
                                                ease: [0.23, 1, 0.32, 1]
                                            }}
                                            className="inline-block"
                                        >
                                            {'\u00A0'}
                                        </motion.span>
                                    )}
                                </span>
                            );
                        })}
                    </h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mt-6 text-lg md:text-xl text-foreground/60 max-w-2xl"
                    >
                        {componentData.description}
                    </motion.p>

                    {/* Tags */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-wrap gap-2 mt-6"
                    >
                        {componentData.tags.map((tag) => (
                            <span
                                key={tag}
                                className="px-3 py-1 rounded-full text-xs font-medium bg-foreground/5 text-foreground/60"
                            >
                                {tag}
                            </span>
                        ))}
                    </motion.div>
                </div>
            </motion.section>

            {/* Full Screen Sandbox */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="w-full px-4 md:px-8 mt-12 md:mt-16"
            >
                <div className="max-w-7xl mx-auto">
                    {(() => {
                        const sandbox = (
                            <motion.div
                                initial={false}
                                animate={{
                                    opacity: 1,
                                }}
                                transition={{
                                    duration: 0.3,
                                    ease: [0.32, 0.72, 0, 1],
                                }}
                                className={`
                                    ${isFullScreen
                                        ? 'fixed inset-0 z-[9990] bg-background'
                                        : 'relative w-full aspect-[16/10] md:aspect-[16/9] rounded-3xl bg-foreground/5 border border-foreground/10'}
                                    overflow-hidden
                                    transition-[border-radius] duration-300 ease-out
                                `}
                            >
                                {/* Sandbox Content */}
                                <div ref={sandboxRef} className="absolute inset-0">
                                    {!isPreviewReady ? (
                                        <ComponentLoader />
                                    ) : PreviewComponent && componentId === 'page-reveal' ? (
                                        <PageReveal
                                            key={config._replay || 'initial'}
                                            config={config}
                                            autoStart={true}
                                            contained={true}
                                        >
                                            {/* Demo content to reveal */}
                                            {/* Demo content to reveal */}
                                            <div className="w-full h-full bg-background flex flex-col items-center justify-center p-8 overflow-hidden relative">
                                                {/* Background Grid Pattern */}
                                                <div className="absolute inset-0 opacity-[0.03]"
                                                    style={{
                                                        backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
                                                        backgroundSize: '40px 40px'
                                                    }}
                                                />

                                                {/* Mock Interface */}
                                                <div className="z-10 w-full max-w-2xl flex flex-col gap-8">
                                                    {/* Mock Header */}
                                                    <div className="w-full h-8 flex items-center justify-between border-b border-foreground/10 pb-4">
                                                        <div className="h-4 w-4 rounded-full bg-foreground/20"></div>
                                                        <div className="flex gap-2">
                                                            <div className="h-2 w-12 rounded-full bg-foreground/10"></div>
                                                            <div className="h-2 w-12 rounded-full bg-foreground/10"></div>
                                                            <div className="h-2 w-12 rounded-full bg-foreground/10"></div>
                                                        </div>
                                                    </div>

                                                    {/* Hero Content */}
                                                    <div className="flex flex-col items-center text-center gap-4 py-8">
                                                        <div className="px-3 py-1 rounded-full border border-foreground/10 bg-foreground/5 text-foreground/60 text-[10px] uppercase tracking-wider font-medium mb-2">
                                                            Reveal Animation
                                                        </div>
                                                        <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-foreground">
                                                            Seamless Entry.
                                                        </h2>
                                                        <p className="text-foreground/60 max-w-md text-sm md:text-base leading-relaxed">
                                                            Create impactful first impressions with a cinematic reveal effect that transitions smoothly into your content.
                                                        </p>

                                                        <div className="flex gap-3 mt-4">
                                                            <div className="px-6 py-2 rounded-lg bg-foreground text-background text-sm font-medium">
                                                                Get Started
                                                            </div>
                                                            <div className="px-6 py-2 rounded-lg border border-foreground/10 text-foreground text-sm font-medium">
                                                                Learn More
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Bottom Cards */}
                                                    <div className="grid grid-cols-3 gap-4 opacity-50">
                                                        {[1, 2, 3].map(i => (
                                                            <div key={i} className="aspect-[4/3] rounded-lg bg-foreground/5 border border-foreground/5"></div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </PageReveal>
                                    ) : PreviewComponent && componentId === 'liquid-morph' ? (
                                        <LiquidMorph config={config} isFullScreen={isFullScreen} />
                                    ) : PreviewComponent && componentId === 'ascii-simulation' ? (
                                        <AsciiSimulation config={config} isFullScreen={isFullScreen} />
                                    ) : PreviewComponent && componentId === 'image-trail-cursor' ? (
                                        <ImageTrailCursor config={config} containerRef={sandboxRef as React.RefObject<HTMLElement | null>} />
                                    ) : PreviewComponent && componentId === 'reality-lens' ? (
                                        <RealityLens
                                            lensSize={config.lensSize || 200}
                                            revealContent={
                                                <div
                                                    className="w-full h-full bg-cover bg-center bg-no-repeat"
                                                    style={{ backgroundImage: "url('/backcol.jpg')" }}
                                                />
                                            }
                                        >
                                            {/* Base layer - Normal view */}
                                            <div
                                                className="w-full h-full bg-cover bg-center bg-no-repeat"
                                                style={{ backgroundImage: "url('/back5.png')" }}
                                            />
                                        </RealityLens>
                                    ) : PreviewComponent && (
                                        <PreviewComponent key={componentKey} config={config} isFullScreen={isFullScreen} />
                                    )}
                                </div>

                                {/* Additional Floating Buttons for Page Reveal */}
                                {componentId === 'page-reveal' && (
                                    <>
                                        {/* Desktop Buttons */}
                                        <motion.div
                                            initial={{ right: 16 }}
                                            animate={{
                                                right: controlsOpen ? 370 : 16,
                                            }}
                                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                            className="hidden md:flex flex-col gap-2 z-[100] absolute bottom-[72px]"
                                        >
                                            {/* Replay Button */}
                                            <button
                                                onClick={() => handleConfigChange('_replay', Date.now())}
                                                title="Replay Animation"
                                                className="
                                            w-12 h-12 rounded-full
                                            bg-foreground/10 backdrop-blur-lg
                                            border border-foreground/10
                                            flex items-center justify-center
                                            hover:bg-foreground/20 transition-colors
                                        "
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M23 4v6h-6" />
                                                    <path d="M1 20v-6h6" />
                                                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                                                </svg>
                                            </button>

                                            {/* Full Page Button */}
                                            <button
                                                onClick={() => {
                                                    setFullPageRevealKey(Date.now());
                                                    setControlsOpen(false);
                                                }}
                                                title="Present Full Page"
                                                className="
                                            w-12 h-12 rounded-full
                                            bg-foreground/10 backdrop-blur-lg
                                            border border-foreground/10
                                            flex items-center justify-center
                                            hover:bg-foreground/20 transition-colors
                                        "
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M15 3h6v6" />
                                                    <path d="M9 21H3v-6" />
                                                    <path d="M21 3l-7 7" />
                                                    <path d="M3 21l7-7" />
                                                </svg>
                                            </button>
                                        </motion.div>

                                        {/* Mobile Buttons */}
                                        <div className="absolute bottom-[72px] right-4 md:hidden flex flex-col gap-2 z-[100]">
                                            <button
                                                onClick={() => handleConfigChange('_replay', Date.now())}
                                                className="
                                            w-12 h-12 rounded-full
                                            bg-foreground/10 backdrop-blur-lg
                                            border border-foreground/10
                                            flex items-center justify-center
                                            hover:bg-foreground/20 transition-colors
                                        "
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M23 4v6h-6" />
                                                    <path d="M1 20v-6h6" />
                                                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setFullPageRevealKey(Date.now());
                                                    setControlsOpen(false);
                                                }}
                                                className="
                                            w-12 h-12 rounded-full
                                            bg-foreground/10 backdrop-blur-lg
                                            border border-foreground/10
                                            flex items-center justify-center
                                            hover:bg-foreground/20 transition-colors
                                        "
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M15 3h6v6" />
                                                    <path d="M9 21H3v-6" />
                                                    <path d="M21 3l-7 7" />
                                                    <path d="M3 21l7-7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </>
                                )}

                                {/* Additional Floating Buttons for Other Components (Generic Full Screen) */}
                                {componentId !== 'page-reveal' && (
                                    <>
                                        {/* Desktop Buttons */}
                                        <motion.div
                                            initial={{ right: 16 }}
                                            animate={{
                                                right: controlsOpen ? 370 : 16,
                                            }}
                                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                            className="hidden md:flex flex-col gap-2 z-[100] absolute bottom-[72px]"
                                        >
                                            <button
                                                onClick={() => setIsFullScreen(!isFullScreen)}
                                                title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
                                                className={`
                                                    w-12 h-12 rounded-full
                                                    backdrop-blur-lg
                                                    flex items-center justify-center
                                                    transition-colors group
                                                    ${['scroll-to-reveal', 'layered-image-showcase'].includes(componentId)
                                                        ? 'bg-white/20 border border-white/30 text-white hover:bg-white/30'
                                                        : componentId === 'notification-stack'
                                                            ? 'bg-background/20 border border-background/20 text-background hover:bg-background/30'
                                                            : 'bg-foreground/10 border border-foreground/10 hover:bg-foreground/20'}
                                                `}
                                            >
                                                {isFullScreen ? (
                                                    <svg className="transition-transform duration-300 group-hover:scale-90" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                                                    </svg>
                                                ) : (
                                                    <svg className="transition-transform duration-300 group-hover:scale-110" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M15 3h6v6" />
                                                        <path d="M9 21H3v-6" />
                                                        <path d="M21 3l-7 7" />
                                                        <path d="M3 21l7-7" />
                                                    </svg>
                                                )}
                                            </button>
                                        </motion.div>

                                        {/* Mobile Buttons */}
                                        <div className="absolute bottom-[72px] right-4 md:hidden flex flex-col gap-2 z-[100]">
                                            <button
                                                onClick={() => setIsFullScreen(!isFullScreen)}
                                                className={`
                                                    w-12 h-12 rounded-full
                                                    backdrop-blur-lg
                                                    flex items-center justify-center
                                                    transition-colors group
                                                    ${['scroll-to-reveal', 'layered-image-showcase'].includes(componentId)
                                                        ? 'bg-white/20 border border-white/30 text-white hover:bg-white/30'
                                                        : componentId === 'notification-stack'
                                                            ? 'bg-background/20 border border-background/20 text-background hover:bg-background/30'
                                                            : 'bg-foreground/10 border border-foreground/10 hover:bg-foreground/20'}
                                                `}
                                            >
                                                {isFullScreen ? (
                                                    <svg className="transition-transform duration-300 group-hover:scale-90" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                                                    </svg>
                                                ) : (
                                                    <svg className="transition-transform duration-300 group-hover:scale-110" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M15 3h6v6" />
                                                        <path d="M9 21H3v-6" />
                                                        <path d="M21 3l-7 7" />
                                                        <path d="M3 21l7-7" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </>
                                )}

                                {/* Reload Button for All Components (except page-reveal which has its own) */}
                                {componentId !== 'page-reveal' && (
                                    <>
                                        {/* Desktop Reload Button */}
                                        <motion.div
                                            initial={{ right: 16 }}
                                            animate={{
                                                right: controlsOpen ? 370 : 16,
                                            }}
                                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                            className="hidden md:flex flex-col gap-2 z-[100] absolute bottom-[128px]"
                                        >
                                            <button
                                                onClick={() => setComponentKey(prev => prev + 1)}
                                                title="Reload Component"
                                                className={`
                                                    w-12 h-12 rounded-full
                                                    backdrop-blur-lg
                                                    flex items-center justify-center
                                                    transition-colors group
                                                    ${['navbar-menu-2', 'layered-image-showcase', 'scroll-to-reveal'].includes(componentId)
                                                        ? 'bg-white/20 border border-white/30 text-white hover:bg-white/30'
                                                        : componentId === 'notification-stack'
                                                            ? 'bg-background/20 border border-background/20 text-background hover:bg-background/30'
                                                            : 'bg-foreground/10 border border-foreground/10 hover:bg-foreground/20'
                                                    }
                                                `}
                                            >
                                                <svg className="transition-transform duration-500 group-hover:rotate-180" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M23 4v6h-6" />
                                                    <path d="M1 20v-6h6" />
                                                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                                                </svg>
                                            </button>
                                        </motion.div>

                                        {/* Mobile Reload Button */}
                                        <div className="absolute bottom-[128px] right-4 md:hidden flex flex-col gap-2 z-[100]">
                                            <button
                                                onClick={() => setComponentKey(prev => prev + 1)}
                                                title="Reload Component"
                                                className={`
                                                    w-12 h-12 rounded-full
                                                    backdrop-blur-lg
                                                    flex items-center justify-center
                                                    transition-colors group
                                                    ${['navbar-menu-2', 'layered-image-showcase', 'scroll-to-reveal'].includes(componentId)
                                                        ? 'bg-white/20 border border-white/30 text-white hover:bg-white/30'
                                                        : componentId === 'notification-stack'
                                                            ? 'bg-background/20 border border-background/20 text-background hover:bg-background/30'
                                                            : 'bg-foreground/10 border border-foreground/10 hover:bg-foreground/20'
                                                    }
                                                `}
                                            >
                                                <svg className="transition-transform duration-500 group-hover:rotate-180" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M23 4v6h-6" />
                                                    <path d="M1 20v-6h6" />
                                                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                                                </svg>
                                            </button>
                                        </div>
                                    </>
                                )}

                                {/* Controls Toggle Button - Animates left on desktop when panel is open */}
                                <motion.button
                                    onClick={() => setControlsOpen(!controlsOpen)}
                                    initial={{ right: 16 }}
                                    animate={{
                                        right: controlsOpen ? 370 : 16,
                                    }}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                    style={{ bottom: 16 }}
                                    className={`
                                        absolute
                                        w-12 h-12 rounded-full
                                        backdrop-blur-lg
                                        flex items-center justify-center
                                        z-[100]
                                        hidden md:flex
                                        transition-colors
                                        ${['scroll-to-reveal', 'layered-image-showcase'].includes(componentId)
                                            ? 'bg-white/20 border border-white/30 text-white hover:bg-white/30'
                                            : componentId === 'notification-stack'
                                                ? 'bg-background/20 border border-background/20 text-background hover:bg-background/30'
                                                : 'bg-foreground/10 border border-foreground/10 hover:bg-foreground/20'}
                                    `}
                                >
                                    <motion.svg
                                        animate={{ rotate: controlsOpen ? 45 : 0 }}
                                        whileHover={{ rotate: controlsOpen ? 90 : 45 }}
                                        transition={{ duration: 0.3 }}
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <circle cx="12" cy="12" r="3" />
                                        <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" />
                                    </motion.svg>
                                </motion.button>

                                {/* Mobile Toggle Button - Fixed position */}
                                <button
                                    onClick={() => setControlsOpen(true)}
                                    className={`
                                        absolute bottom-4 right-4
                                        w-12 h-12 rounded-full
                                        backdrop-blur-lg
                                        flex items-center justify-center
                                        transition-colors group
                                        z-[100]
                                        md:hidden
                                        ${['scroll-to-reveal', 'layered-image-showcase'].includes(componentId)
                                            ? 'bg-white/20 border border-white/30 text-white hover:bg-white/30'
                                            : componentId === 'notification-stack'
                                                ? 'bg-background/20 border border-background/20 text-background hover:bg-background/30'
                                                : 'bg-foreground/10 border border-foreground/10 hover:bg-foreground/20'}
                                    `}
                                >
                                    <svg
                                        className="transition-transform duration-300 group-hover:rotate-45"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <circle cx="12" cy="12" r="3" />
                                        <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" />
                                    </svg>
                                </button>

                                {/* Controls Panel - Inside sandbox on desktop */}
                                <ControlsPanel
                                    isOpen={controlsOpen}
                                    onClose={() => setControlsOpen(false)}
                                    config={config}
                                    onConfigChange={handleConfigChange}
                                    componentId={componentId}
                                />
                            </motion.div>
                        );

                        // When fullscreen, render via a portal so `position: fixed` uses the real viewport.
                        // This avoids clipping when an ancestor has `transform` (e.g., from framer-motion layout animations).
                        if (isFullScreen && isClientMounted) {
                            return createPortal(sandbox, document.body);
                        }

                        return sandbox;
                    })()}
                </div>
            </motion.section >

            {/* Dependencies */}
            < motion.section
                initial={{ opacity: 0 }
                }
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="w-full px-4 md:px-8 mt-12 md:mt-16"
            >
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-xl font-semibold mb-4">Dependencies</h2>
                    <div className="flex flex-wrap gap-3">
                        {componentData.dependencies.map((dep) => (
                            <span
                                key={dep}
                                className="
                                    px-4 py-2 rounded-lg
                                    bg-foreground/5 border border-foreground/10
                                    text-sm font-mono text-foreground/70
                                "
                            >
                                {dep}
                            </span>
                        ))}
                    </div>
                    <div className="
                        mt-4 p-4 rounded-xl
                        bg-foreground/5 border border-foreground/10
                        flex items-center justify-between gap-4
                    ">
                        <code className="font-mono text-sm text-foreground/60">
                            npm install {componentData.dependencies.join(' ')}
                        </code>
                        <button
                            onClick={async () => {
                                const success = await copyToClipboard(`npm install ${componentData.dependencies.join(' ')}`);
                                if (success) {
                                    setDepscopied(true);
                                    setTimeout(() => setDepscopied(false), 2000);
                                }
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-foreground/5 hover:bg-foreground/10 transition-colors whitespace-nowrap"
                        >
                            {depscopied ? '✓ Copied!' : 'Copy'}
                        </button>
                    </div>
                </div>
            </motion.section >

            {/* Code Section */}
            < motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="w-full px-4 md:px-8 mt-12 md:mt-16"
            >
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-xl font-semibold mb-4">Code</h2>
                    <CodeDisplay
                        config={config}
                        componentId={componentId}
                    />
                </div>
            </motion.section >

            {/* Props Table */}
            < motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="w-full px-4 md:px-8 mt-12 md:mt-16 pb-24"
            >
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-xl font-semibold mb-4">Props</h2>
                    <div className="
                        rounded-2xl overflow-hidden
                        bg-foreground/5 border border-foreground/10
                    ">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-foreground/10">
                                        <th className="text-left p-4 font-medium text-foreground/60">Prop</th>
                                        <th className="text-left p-4 font-medium text-foreground/60">Type</th>
                                        <th className="text-left p-4 font-medium text-foreground/60">Default</th>
                                        <th className="text-left p-4 font-medium text-foreground/60">Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {componentData.props.map((prop, i) => (
                                        <tr
                                            key={prop.name}
                                            className={i !== componentData.props.length - 1 ? 'border-b border-foreground/5' : ''}
                                        >
                                            <td className="p-4 font-mono text-foreground/80">{prop.name}</td>
                                            <td className="p-4 font-mono text-foreground/50">{prop.type}</td>
                                            <td className="p-4 font-mono text-foreground/50">{prop.default}</td>
                                            <td className="p-4 text-foreground/60">{prop.description}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </motion.section >
            <ComponentNavigation currentId={componentId} />
        </div >
    );
}
