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
const componentRegistry: Record<string, React.ComponentType<{ config?: any }>> = {
    'flip-grid': FlipGrid,
    'ascii-simulation': AsciiSimulation,
    'liquid-morph': LiquidMorph,
    'page-reveal': PageReveal as React.ComponentType<{ config?: any }>,
    'navbar-menu': NavbarMenu as React.ComponentType<{ config?: any }>,
    'navbar-menu-2': NavbarMenu2 as React.ComponentType<{ config?: any }>,
    'spotlight-search': SpotlightSearch as React.ComponentType<{ config?: any }>,
    'image-trail-cursor': ImageTrailCursor as React.ComponentType<{ config?: any }>,
    'reality-lens': RealityLens as React.ComponentType<{ config?: any }>,
    'scroll-to-reveal': ({ config = {} }: { config?: any }) => (
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
    'glass-surge': ({ config = {} }: { config?: any }) => (
        <div className="flex items-center justify-center w-full h-full">
            <GlassSurge
                text={config.text || "MORPHYS"}
                className="text-[5rem] md:text-[9rem] font-bold tracking-widest font-logo"
            />
        </div>
    ),
    'layered-image-showcase': LayeredImageShowcase as React.ComponentType<{ config?: any }>,
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
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-foreground/5 hover:bg-foreground/10 disabled:opacity-50 transition-colors text-foreground/70"
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
                        className="w-full h-8 px-2 text-center bg-foreground/5 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-foreground/20 appearance-none"
                    />
                    {suffix && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-foreground/40 pointer-events-none">{suffix}</span>}
                </div>
                <button
                    onClick={() => onChange(Math.min(safeValue + 1, max))}
                    disabled={safeValue >= max}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-foreground/5 hover:bg-foreground/10 disabled:opacity-50 transition-colors text-foreground/70"
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
                            {componentId === 'ascii-simulation' ? (
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
                            ) : componentId === 'text-mirror' ? (
                                // TEXT MIRROR CONTROLS
                                <>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Appearance</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <NumberControl
                                                label="Font Size"
                                                value={config.fontSize || 120}
                                                min={60}
                                                max={300}
                                                suffix="px"
                                                onChange={(val) => onConfigChange('fontSize', val)}
                                            />
                                            <NumberControl
                                                label="Spread"
                                                value={config.spread || 30}
                                                min={10}
                                                max={100}
                                                onChange={(val) => onConfigChange('spread', val)}
                                            />
                                        </div>
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
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Behavior</label>
                                        <NumberControl
                                            label="Idle Timeout"
                                            value={config.idleTimeout || 5000}
                                            min={500}
                                            max={10000}
                                            suffix="ms"
                                            onChange={(val) => onConfigChange('idleTimeout', val)}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Content</label>
                                        <div>
                                            <span className="text-xs text-foreground/40 mb-1 block">Text</span>
                                            <input
                                                type="text"
                                                value={config.text || 'MORPHYS'}
                                                onChange={(e) => onConfigChange('text', e.target.value)}
                                                className="w-full h-10 px-3 bg-foreground/5 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-foreground/20"
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : componentId === 'glass-surge' ? (
                                // GLASS SURGE CONTROLS
                                <>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Content</label>
                                        <div>
                                            <span className="text-xs text-foreground/40 mb-1 block">Text</span>
                                            <input
                                                type="text"
                                                value={config.text}
                                                onChange={(e) => onConfigChange('text', e.target.value)}
                                                className="w-full h-10 px-3 bg-foreground/5 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-foreground/20 font-logo"
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : componentId === 'notification-stack' || componentId === 'diagonal-focus' || componentId === 'text-pressure' || componentId === 'fluid-height' || componentId === 'step-morph' ? (
                                // NOTIFICATION STACK / DIAGONAL FOCUS / TEXT PRESSURE / STEP MORPH - No adjustable settings
                                <div className="text-center py-8">
                                    <div className="w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center mx-auto mb-4">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground/40">
                                            <circle cx="12" cy="12" r="10" />
                                            <path d="M12 16v-4" />
                                            <path d="M12 8h.01" />
                                        </svg>
                                    </div>
                                    <p className="text-sm text-foreground/50">
                                        This component uses pre-configured settings optimized for the best visual experience.
                                    </p>
                                </div>
                            ) : (
                                // FLIP GRID CONTROLS
                                <>
                                    {/* Grid Size */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Grid Size</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <NumberControl label="Columns" value={config.cols} min={1} max={200} onChange={(val) => onConfigChange('cols', val)} />
                                            <NumberControl label="Rows" value={config.rows} min={1} max={200} onChange={(val) => onConfigChange('rows', val)} />
                                        </div>
                                    </div>
                                    {/* Pattern */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Pattern</label>
                                        <div className="flex flex-wrap gap-2">
                                            {patterns.map((pattern) => (
                                                <button key={pattern} onClick={() => onConfigChange('pattern', pattern)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${config.pattern === pattern ? 'bg-foreground text-background' : 'bg-foreground/5 hover:bg-foreground/10 text-foreground/70'}`}>
                                                    {pattern}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Easing */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Easing</label>
                                        <div className="flex flex-wrap gap-2">
                                            {easings.map((easing) => (
                                                <button key={easing} onClick={() => onConfigChange('easing', easing)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${config.easing === easing ? 'bg-foreground text-background' : 'bg-foreground/5 hover:bg-foreground/10 text-foreground/70'}`}>
                                                    {easing}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Speed */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Speed</label>
                                        <div className="flex flex-wrap gap-2">
                                            {speeds.map((speed) => (
                                                <button key={speed} onClick={() => onConfigChange('speed', speed)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${config.speed === speed ? 'bg-foreground text-background' : 'bg-foreground/5 hover:bg-foreground/10 text-foreground/70'}`}>
                                                    {speed}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Colors */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Colors</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <span className="text-xs text-foreground/40">Front</span>
                                                <input type="color" value={config.colorFront === 'var(--foreground)' ? '#ffffff' : config.colorFront} onChange={(e) => onConfigChange('colorFront', e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" />
                                            </div>
                                            <div>
                                                <span className="text-xs text-foreground/40">Back</span>
                                                <input type="color" value={config.colorBack === 'var(--background)' ? '#000000' : config.colorBack} onChange={(e) => onConfigChange('colorBack', e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Spacing */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground/60">Spacing</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <NumberControl label="Gap" value={config.gap} min={0} max={50} suffix="px" onChange={(val) => onConfigChange('gap', val)} />
                                            <NumberControl label="Radius" value={config.borderRadius} min={0} max={50} suffix="px" onChange={(val) => onConfigChange('borderRadius', val)} />
                                        </div>
                                    </div>
                                    {/* Interactive Toggle */}
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-foreground/60">Interactive Mode</label>
                                        <button onClick={() => onConfigChange('interactive', !config.interactive)} className={`w-12 h-6 rounded-full transition-colors duration-200 ${config.interactive ? 'bg-foreground' : 'bg-foreground/20'} relative`}>
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-background transition-transform duration-200 ${config.interactive ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
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
            return `import { DiffuseText } from '@/components/ui';\n\n<DiffuseText\n    config={{\n${configEntries.join('\n')}\n    }}\n/>`;
        }

        if (componentId === 'notification-stack') {
            return `import { NotificationStack } from '@/components/ui';\n\n// Basic usage\n<NotificationStack />`;
        }

        if (componentId === 'text-pressure') {
            return `import { TextPressure } from '@/components/ui';\n\n// Basic usage\n<TextPressure text="TEXT FORCE" />`;
        }

        if (componentId === 'fluid-height') {
            return `import { FluidHeight } from '@/components/ui';

// Basic usage
<FluidHeight />`;
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

        // FLIP GRID (Default)
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
            return `import { FlipGrid } from '@/components/ui';

// Basic usage with default config
<FlipGrid />`;
        }

        return `import { FlipGrid } from '@/components/ui';

// With your custom configuration
<FlipGrid
    config={{
${configEntries.join('\n')}
    }}
/>`;
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
    const sandboxRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsClientMounted(true);
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
                                layout
                                transition={{
                                    layout: {
                                        type: "spring",
                                        stiffness: 200,
                                        damping: 30,
                                    },
                                }}
                                className={`
                                    ${isFullScreen
                                        ? 'fixed inset-0 z-[9990] bg-background'
                                        : 'relative w-full aspect-[16/10] md:aspect-[16/9] rounded-3xl bg-foreground/5 border border-foreground/10'}
                                    overflow-hidden
                                `}
                            >
                                {/* Sandbox Content */}
                                <div ref={sandboxRef} className="absolute inset-0">
                                    {PreviewComponent && componentId === 'page-reveal' ? (
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
                                        <PreviewComponent key={componentKey} config={config} />
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
                                            className="hidden md:flex flex-col gap-2 z-[60] absolute bottom-[72px]"
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
                                        <div className="absolute bottom-[72px] right-4 md:hidden flex flex-col gap-2 z-[60]">
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
                                            className="hidden md:flex flex-col gap-2 z-[60] absolute bottom-[72px]"
                                        >
                                            <button
                                                onClick={() => setIsFullScreen(!isFullScreen)}
                                                title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
                                                className={`
                                                    w-12 h-12 rounded-full
                                                    backdrop-blur-lg
                                                    flex items-center justify-center
                                                    transition-colors
                                                    ${['scroll-to-reveal', 'layered-image-showcase'].includes(componentId)
                                                        ? 'bg-white/20 border border-white/30 text-white hover:bg-white/30'
                                                        : componentId === 'notification-stack'
                                                            ? 'bg-background/20 border border-background/20 text-background hover:bg-background/30'
                                                            : 'bg-foreground/10 border border-foreground/10 hover:bg-foreground/20'}
                                                `}
                                            >
                                                {isFullScreen ? (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                                                    </svg>
                                                ) : (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M15 3h6v6" />
                                                        <path d="M9 21H3v-6" />
                                                        <path d="M21 3l-7 7" />
                                                        <path d="M3 21l7-7" />
                                                    </svg>
                                                )}
                                            </button>
                                        </motion.div>

                                        {/* Mobile Buttons */}
                                        <div className="absolute bottom-[72px] right-4 md:hidden flex flex-col gap-2 z-[60]">
                                            <button
                                                onClick={() => setIsFullScreen(!isFullScreen)}
                                                className={`
                                                    w-12 h-12 rounded-full
                                                    backdrop-blur-lg
                                                    flex items-center justify-center
                                                    transition-colors
                                                    ${['scroll-to-reveal', 'layered-image-showcase'].includes(componentId)
                                                        ? 'bg-white/20 border border-white/30 text-white hover:bg-white/30'
                                                        : componentId === 'notification-stack'
                                                            ? 'bg-background/20 border border-background/20 text-background hover:bg-background/30'
                                                            : 'bg-foreground/10 border border-foreground/10 hover:bg-foreground/20'}
                                                `}
                                            >
                                                {isFullScreen ? (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                                                    </svg>
                                                ) : (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

                                {/* Reload Button for NavbarMenu2 & LayeredImageShowcase */}
                                {['navbar-menu-2', 'layered-image-showcase'].includes(componentId) && (
                                    <>
                                        {/* Desktop Reload Button */}
                                        <motion.div
                                            initial={{ right: 16 }}
                                            animate={{
                                                right: controlsOpen ? 370 : 16,
                                            }}
                                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                            className="hidden md:flex flex-col gap-2 z-[60] absolute bottom-[128px]"
                                        >
                                            <button
                                                onClick={() => setComponentKey(prev => prev + 1)}
                                                title="Reload Component"
                                                className={`
                                                    w-12 h-12 rounded-full
                                                    backdrop-blur-lg
                                                    flex items-center justify-center
                                                    transition-colors
                                                    ${['navbar-menu-2', 'layered-image-showcase'].includes(componentId)
                                                        ? 'bg-white/20 border border-white/30 text-white hover:bg-white/30'
                                                        : 'bg-foreground/10 border border-foreground/10 hover:bg-foreground/20'
                                                    }
                                                `}
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M23 4v6h-6" />
                                                    <path d="M1 20v-6h6" />
                                                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                                                </svg>
                                            </button>
                                        </motion.div>

                                        {/* Mobile Reload Button */}
                                        <div className="absolute bottom-[128px] right-4 md:hidden flex flex-col gap-2 z-[60]">
                                            <button
                                                onClick={() => setComponentKey(prev => prev + 1)}
                                                title="Reload Component"
                                                className={`
                                                    w-12 h-12 rounded-full
                                                    backdrop-blur-lg
                                                    flex items-center justify-center
                                                    transition-colors
                                                    ${['navbar-menu-2', 'layered-image-showcase'].includes(componentId)
                                                        ? 'bg-white/20 border border-white/30 text-white hover:bg-white/30'
                                                        : 'bg-foreground/10 border border-foreground/10 hover:bg-foreground/20'
                                                    }
                                                `}
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                    style={{ bottom: 16 }}
                                    className={`
                                        absolute
                                        w-12 h-12 rounded-full
                                        backdrop-blur-lg
                                        flex items-center justify-center
                                        z-[60]
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
                                        transition={{ duration: 0.2 }}
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
                                        transition-colors
                                        z-[60]
                                        md:hidden
                                        ${['scroll-to-reveal', 'layered-image-showcase'].includes(componentId)
                                            ? 'bg-white/20 border border-white/30 text-white hover:bg-white/30'
                                            : componentId === 'notification-stack'
                                                ? 'bg-background/20 border border-background/20 text-background hover:bg-background/30'
                                                : 'bg-foreground/10 border border-foreground/10 hover:bg-foreground/20'}
                                    `}
                                >
                                    <svg
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
