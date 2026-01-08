"use client";

import { useParams, notFound } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { getComponentById, ComponentData } from "@/data/componentsData";
import { FlipGrid, FlipGridConfig, GridPattern, EasingType, SpeedType } from "@/components/ui/FlipGrid";
import { AsciiSimulation, AsciiSimulationConfig, AsciiShape } from "@/components/ui/AsciiSimulation";
import { LiquidMorph, LiquidMorphConfig } from "@/components/ui/LiquidMorph";
import { PageReveal, PageRevealConfig } from "@/components/ui/PageReveal";

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
    const handleChange = (newVal: number) => {
        if (newVal >= min && newVal <= max) {
            onChange(newVal);
        }
    };

    return (
        <div>
            <span className="text-xs text-foreground/40 block mb-1.5">{label}</span>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => handleChange(value - 1)}
                    disabled={value <= min}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-foreground/5 hover:bg-foreground/10 disabled:opacity-50 transition-colors text-foreground/70"
                >
                    -
                </button>
                <div className="flex-1 relative">
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val)) onChange(Math.min(Math.max(val, min), max));
                        }}
                        className="w-full h-8 px-2 text-center bg-foreground/5 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-foreground/20 appearance-none"
                    />
                    {suffix && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-foreground/40 pointer-events-none">{suffix}</span>}
                </div>
                <button
                    onClick={() => handleChange(value + 1)}
                    disabled={value >= max}
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

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop - Only on mobile */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                        onClick={onClose}
                    />

                    {/* Panel - Mobile: Fixed, Desktop: Absolute inside sandbox */}
                    <motion.div
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="
                            fixed right-0 top-0 bottom-0 w-[320px]
                            md:absolute md:right-[15px] md:top-[15px] md:bottom-[15px]
                            md:w-[340px] md:rounded-2xl
                            bg-background/95 backdrop-blur-xl
                            border-l md:border border-foreground/10
                            z-50 overflow-y-auto scrollbar-thin
                            p-6
                            md:shadow-2xl
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
                                            <NumberControl label="Mobile" value={config.splitCount?.mobile || 5} min={2} max={10} onChange={(val) => onConfigChange('splitCount', { ...config.splitCount, mobile: val })} />
                                            <NumberControl label="Tablet" value={config.splitCount?.tablet || 8} min={4} max={15} onChange={(val) => onConfigChange('splitCount', { ...config.splitCount, tablet: val })} />
                                            <NumberControl label="Desktop" value={config.splitCount?.desktop || 12} min={6} max={20} onChange={(val) => onConfigChange('splitCount', { ...config.splitCount, desktop: val })} />
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
    fullCode: string;
    componentId: string;
}

function CodeDisplay({ config, fullCode, componentId }: CodeDisplayProps) {
    const [activeTab, setActiveTab] = useState<'usage' | 'full'>('usage');
    const [copied, setCopied] = useState(false);

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
                splitCount: { mobile: 5, tablet: 8, desktop: 12 },
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
        const code = activeTab === 'usage' ? dynamicUsage : fullCode;
        const success = await copyToClipboard(code);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('usage')}
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
                        onClick={() => setActiveTab('full')}
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
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-foreground/5 hover:bg-foreground/10 transition-colors"
                >
                    {copied ? '✓ Copied!' : 'Copy'}
                </button>
            </div>

            <div className="
                relative rounded-2xl overflow-hidden
                bg-foreground/5 border border-foreground/10
            ">
                <pre className="p-6 overflow-auto text-sm max-h-[500px] scrollbar-thin scrollbar-thumb-foreground/20 scrollbar-track-transparent">
                    <code className="text-foreground/80 font-mono">
                        {activeTab === 'usage' ? dynamicUsage : fullCode}
                    </code>
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

    const componentData = useMemo(() => getComponentById(componentId), [componentId]);

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
                    mobile: 5,
                    tablet: 8,
                    desktop: 12,
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
                    mobile: 5,
                    tablet: 8,
                    desktop: 12,
                },
                logoBlurDuration: 0.8,
                logoHoldDuration: 0.5,
                slitAnimationDuration: 0.6,
                slitStaggerDelay: 0.06,
                backgroundColor: "#000000",
                logoColor: "#ffffff",
                autoStart: true,
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
                        {componentData.name.split('').map((char, i) => (
                            <motion.span
                                key={i}
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.5,
                                    delay: i * 0.03,
                                    ease: [0.23, 1, 0.32, 1]
                                }}
                                className="inline-block"
                            >
                                {char === ' ' ? '\u00A0' : char}
                            </motion.span>
                        ))}
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
                        <div className="absolute inset-0">
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
                            ) : PreviewComponent && (
                                <PreviewComponent config={config} />
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
                                        className="
                                            w-12 h-12 rounded-full
                                            bg-foreground/10 backdrop-blur-lg
                                            border border-foreground/10
                                            flex items-center justify-center
                                            hover:bg-foreground/20 transition-colors
                                        "
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
                                        className="
                                            w-12 h-12 rounded-full
                                            bg-foreground/10 backdrop-blur-lg
                                            border border-foreground/10
                                            flex items-center justify-center
                                            hover:bg-foreground/20 transition-colors
                                        "
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

                        {/* Controls Toggle Button - Animates left on desktop when panel is open */}
                        <motion.button
                            onClick={() => setControlsOpen(!controlsOpen)}
                            initial={{ right: 16 }}
                            animate={{
                                right: controlsOpen ? 370 : 16,
                            }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            style={{ bottom: 16 }}
                            className="
                                absolute
                                w-12 h-12 rounded-full
                                bg-foreground/10 backdrop-blur-lg
                                border border-foreground/10
                                flex items-center justify-center
                                hover:bg-foreground/20
                                z-[60]
                                hidden md:flex
                            "
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
                            className="
                                absolute bottom-4 right-4
                                w-12 h-12 rounded-full
                                bg-foreground/10 backdrop-blur-lg
                                border border-foreground/10
                                flex items-center justify-center
                                hover:bg-foreground/20 transition-colors
                                z-[60]
                                md:hidden
                            "
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
                        fullCode={componentData.fullCode}
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
        </div >
    );
}
