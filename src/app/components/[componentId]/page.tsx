"use client";

import { useParams, notFound } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { getComponentById, ComponentData } from "@/data/componentsData";
import { FlipGrid, FlipGridConfig, GridPattern, EasingType, SpeedType } from "@/components/ui/FlipGrid";
import { AsciiSimulation, AsciiSimulationConfig, AsciiShape } from "@/components/ui/AsciiSimulation";
import { LiquidMorph, LiquidMorphConfig } from "@/components/ui/LiquidMorph";

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
}
function ControlsPanel({ isOpen, onClose, config, onConfigChange, componentId }: ControlsPanelProps) {
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
                    <div className="
                        relative w-full aspect-[16/10] md:aspect-[16/9]
                        rounded-3xl overflow-hidden
                        bg-foreground/5 border border-foreground/10
                    ">
                        {/* Sandbox Content */}
                        <div className="absolute inset-0">
                            {PreviewComponent && (
                                <PreviewComponent config={config} />
                            )}
                        </div>

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
                                z-30
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
                                z-30
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
                    </div>
                </div>
            </motion.section>

            {/* Dependencies */}
            <motion.section
                initial={{ opacity: 0 }}
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
            </motion.section>

            {/* Code Section */}
            <motion.section
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
            </motion.section>

            {/* Props Table */}
            <motion.section
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
            </motion.section>
        </div>
    );
}
