"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

// Lazy Loader Component with Hysteresis
const PreviewLazyLoader = ({ children }: { children: React.ReactNode }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { margin: "200px 0px 200px 0px", once: false });
    const [shouldRender, setShouldRender] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        if (isInView) {
            // Mount after delay to ensure user has stopped/slowed down
            if (!shouldRender) {
                timeoutRef.current = setTimeout(() => {
                    setShouldRender(true);
                }, 600); // Increased delay
            }
        } else {
            // Unmount after a long delay (hysteresis) to prevent thrashing
            if (shouldRender) {
                timeoutRef.current = setTimeout(() => {
                    setShouldRender(false);
                }, 4000); // Keep alive for 4s after leaving view
            }
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [isInView, shouldRender]);

    return (
        <div ref={ref} className="w-full h-full flex items-center justify-center">
            <AnimatePresence>
                {shouldRender && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="w-full h-full flex items-center justify-center"
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
import Link from "next/link";
import { componentsDataLite as componentsData } from "@/data/componentsDataLite";
import { GlobalLoader } from "./GlobalLoader";
import { FlipGridPreview } from "./FlipGrid";
import { AsciiSimulationPreview } from "./AsciiSimulation";
import { LiquidMorphPreview } from "./LiquidMorph";
import { PageRevealPreview } from "./PageReveal";
import { WaveMarqueePreview } from "./WaveMarquee";
import { StepMorphPreview } from "./StepMorph";
import { ScrollToRevealPreview } from "./ScrollToReveal";
import { SpotlightSearchPreview } from "./SpotlightSearch";
import { RealityLensPreview } from "./RealityLens";
import { NotificationStackPreview } from "./NotificationStack";
import { NavbarMenuPreview } from "./NavbarMenu";
import { NavbarMenu2Preview } from "./NavbarMenu2";
import { ImpactTextPreview } from "./ImpactText";
import { ImageTrailCursorPreview } from "./ImageTrailCursor";
import { FluidHeightPreview } from "./FluidHeight";
import { DiagonalFocusPreview } from "./DiagonalFocus";
import { DiffuseTextPreview } from "./DiffuseText";
import { ClothTickerPreview } from "./ClothTicker";
import { TextPressure } from "./TextPressure";
import TextMirror from "./TextMirror";
import { CenterMenu } from "./CenterMenu";
import { GlassSurge } from "./GlassSurge";
import { LayeredImageShowcase } from "./LayeredImageShowcase";
import { ExpandableStrips } from "./ExpandableStrips";
import { FrostedGlass } from "./FrostedGlass";
import TextReveal from "./TextReveal";
import TextReveal2 from "./TextReveal2";
import { CRTGlitch } from "./CRTGlitch";
import { FlipClock } from "./FlipClock";
import { Gravity } from "./Gravity"; // Import Gravity
import { PixelSimulation } from "./PixelSimulation";
import { RunningOutline } from "./RunningOutline";
import { SynthwaveLines } from "./SynthwaveLines";
import { HoverImageList } from "./HoverImageList";
import { ScrollSkew } from "./ScrollSkew";
import { LiquidReveal } from "./LiquidReveal";
import { PinnedCarousel } from "./PinnedCarousel";
import { TimelineZoom } from "./TimelineZoom";
import { ElasticScrollPreview } from "./ElasticScroll";

// Preview Wrappers
const TimelineZoomPreview = () => (
    <div className="w-full h-full flex items-center justify-center bg-transparent overflow-hidden relative rounded-[20px]">
        <div className="absolute inset-0 w-[200%] h-[200%] scale-[0.5] origin-top-left">
            <TimelineZoom className="!min-h-0 w-full h-full" />
        </div>
    </div>
);

// Preview Wrappers
const TextPressurePreview = () => (
    <div className="w-full h-full flex items-center justify-center bg-transparent overflow-hidden relative">
        <TextPressure text="MORPHYS" config={{ minFontSize: 24 }} />
    </div>
);

const TextMirrorPreview = () => (
    <div className="w-full h-full flex items-center justify-center bg-transparent overflow-hidden relative">
        <TextMirror text="MORPHYS" config={{ fontSize: 40 }} hasTrigger={false} />
    </div>
);

const CenterMenuPreview = () => (
    <div className="w-full h-full flex items-center justify-center overflow-hidden relative">
        <div className="transform scale-[0.6] w-full">
            <CenterMenu className="!min-h-0 !pt-0 !overflow-visible !pb-8" />
        </div>
    </div>
);

const GlassSurgePreview = () => (
    <div className="w-full h-full flex items-center justify-center bg-transparent overflow-hidden relative">
        <GlassSurge text="MORPHYS" className="text-3xl md:text-4xl font-bold tracking-widest font-logo" />
    </div>
);

const LayeredImageShowcasePreview = () => (
    <div className="w-full h-full overflow-hidden relative">
        <LayeredImageShowcase className="!h-full !p-4" config={{ title: "SHOWCASE" }} />
    </div>
);

const ExpandableStripsPreview = () => (
    <div className="w-full h-full flex items-center justify-center bg-transparent overflow-hidden relative">
        <div className="transform scale-[0.5] w-[200%] h-[200%] flex items-center justify-center origin-center">
            <ExpandableStrips className="!h-full !min-h-0 !py-0 !bg-transparent" />
        </div>
    </div>
);

const FrostedGlassPreview = () => (
    <div className="w-full h-full flex items-center justify-center bg-transparent overflow-hidden relative">
        <FrostedGlass config={{ text: "CURATED CHAOS", fontSize: 90, blurAmount: 30 }} containerClassName="!bg-black !min-h-0" />
    </div>
);

const TextRevealPreview = () => (
    <div className="w-full h-full flex items-center justify-center bg-transparent overflow-hidden relative">
        <TextReveal text="MORPHYS" className="text-[3rem] font-bold" />
    </div>
);

const TextReveal2Preview = () => (
    <div className="w-full h-full flex items-center justify-center bg-transparent overflow-hidden relative">
        <TextReveal2 text="MORPHYS" className="text-[3rem] font-bold" />
    </div>
);

const CRTGlitchPreview = () => (
    <div className="w-full h-full flex items-center justify-center bg-black overflow-hidden relative rounded-[20px]">
        <CRTGlitch config={{ text: "MORPHYS", fontSize: 48, curvedScreen: false, noiseIntensity: 0.12, glitchFrequency: 0.4 }} containerClassName="!min-h-0 !bg-transparent" />
    </div>
);

const FlipClockPreview = () => (
    <div className="w-full h-full bg-black overflow-hidden relative">
        <FlipClock />
    </div>
);

const GravityPreview = () => (
    <div className="w-full h-full flex items-center justify-center bg-transparent overflow-hidden relative">
        <Gravity text="MORPHYS" config={{ maxFontSize: 60, minFontSize: 40 }} />
    </div>
);

const PixelSimulationPreview = () => (
    <div className="w-full h-full flex items-center justify-center bg-transparent overflow-hidden relative rounded-[20px]">
        <PixelSimulation config={{ shape: 'car', pixelSize: 3, rotationX: 0, rotationY: -0.6 }} autoPlay={false} />
    </div>
);

const RunningOutlinePreview = () => (
    <div className="w-full h-full flex items-center justify-center bg-transparent overflow-hidden relative">
        <div className="scale-[0.5] origin-center">
            <RunningOutline config={{
                words: [
                    { text: "HOVER", font: "font-thunder" }
                ]
            }} />
        </div>
    </div>
);

const SynthwaveLinesPreview = () => (
    <div className="w-full h-full flex items-center justify-center bg-transparent overflow-hidden relative rounded-[20px]">
        <SynthwaveLines config={{ lineCount: 6 }} />
    </div>
);

const HoverImageListPreview = () => (
    <div className="w-full h-full flex items-center justify-center bg-transparent overflow-hidden relative rounded-[20px]">
        <div className="scale-[0.4] origin-center w-full">
            <HoverImageList className="!py-0" />
        </div>
    </div>
);

const ScrollSkewPreview = () => (
    <div className="w-full h-full flex items-center justify-center bg-transparent overflow-hidden relative">
        <div className="scale-[0.5] w-[200%] origin-center">
            <ScrollSkew />
        </div>
    </div>
);

const LiquidRevealPreview = () => (
    <div className="w-full h-full relative overflow-hidden rounded-[20px] bg-transparent">
        <LiquidReveal config={{ text: "reveal." }} />
    </div>
);

const PinnedCarouselPreview = () => {
    // Determine theme for preview
    const [isLight, setIsLight] = useState(false);

    useEffect(() => {
        const checkTheme = () => {
            const currentTheme = document.documentElement.getAttribute("data-theme");
            setIsLight(currentTheme === "light");
        };

        checkTheme();

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === "data-theme") {
                    checkTheme();
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });

        return () => observer.disconnect();
    }, []);

    return (
        <div className="w-full h-full flex items-center justify-center bg-transparent overflow-hidden relative rounded-[20px]">
            <div className="relative w-full h-full flex items-center justify-center scale-[0.35] origin-center">
                {/* Number */}
                <h2 className={`absolute left-[-20%] top-1/2 -translate-y-[45%] text-[70vh] tracking-tighter leading-none select-none font-victory ${isLight ? 'text-black drop-shadow-[0_0_50px_rgba(0,0,0,0.3)]' : 'text-white drop-shadow-[0_0_50px_rgba(0,0,0,0.5)]'}`}>
                    1
                </h2>

                {/* Name */}
                <div className="absolute bottom-0 left-[-20%] z-10 translate-y-[20%]">
                    <h3 className={`text-[12vw] font-black tracking-tighter whitespace-nowrap leading-none select-none font-victory ${isLight ? 'text-black/20' : 'text-white/20'}`}>
                        CHAINSAW-MAN
                    </h3>
                </div>

                {/* Image */}
                <div className={`absolute right-[-10%] top-1/2 -translate-y-1/2 w-[35vw] aspect-auto max-h-[70vh] overflow-hidden shadow-2xl border ${isLight ? 'border-black/10' : 'border-white/10'}`}>
                    <img
                        src="/24/chainsaw-man-the-5120x2880-23013.jpg"
                        alt=""
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>
        </div>
    );
};

// Component previews mapping
const componentPreviews: Record<string, React.ComponentType> = {
    'flip-grid': FlipGridPreview,
    'ascii-simulation': AsciiSimulationPreview,
    'liquid-morph': LiquidMorphPreview,
    'page-reveal': PageRevealPreview,
    'wave-marquee': WaveMarqueePreview,
    'step-morph': StepMorphPreview,
    'scroll-to-reveal': ScrollToRevealPreview,
    'spotlight-search': SpotlightSearchPreview,
    'reality-lens': RealityLensPreview,
    'notification-stack': NotificationStackPreview,
    'navbar-menu': NavbarMenuPreview,
    'navbar-menu-2': NavbarMenu2Preview,
    'impact-text': ImpactTextPreview,
    'image-trail-cursor': ImageTrailCursorPreview,
    'fluid-height': FluidHeightPreview,
    'diagonal-focus': DiagonalFocusPreview,
    'diffuse-text': DiffuseTextPreview,
    'reveal-marquee': ClothTickerPreview,
    'text-pressure': TextPressurePreview,
    'text-mirror': TextMirrorPreview,
    'center-menu': CenterMenuPreview,
    'glass-surge': GlassSurgePreview,
    'layered-image-showcase': LayeredImageShowcasePreview,
    'expandable-strips': ExpandableStripsPreview,
    'frosted-glass': FrostedGlassPreview,
    'text-reveal': TextRevealPreview,
    'text-reveal-2': TextReveal2Preview,
    'crt-glitch': CRTGlitchPreview,
    'flip-clock': FlipClockPreview,
    'gravity': GravityPreview, // Map Gravity
    'pixel-simulation': PixelSimulationPreview,
    'running-outline': RunningOutlinePreview,
    'synthwave-lines': SynthwaveLinesPreview,
    'hover-image-list': HoverImageListPreview,
    'scroll-skew': ScrollSkewPreview,
    'liquid-reveal': LiquidRevealPreview,
    'pinned-carousel': PinnedCarouselPreview,
    'timeline-zoom': TimelineZoomPreview,
    'elastic-scroll': ElasticScrollPreview,
};

export function NormalComponents() {
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    const [isSorting, setIsSorting] = useState(false);

    const handleSort = (order: 'newest' | 'oldest') => {
        if (order === sortOrder) return;
        setIsSorting(true);

        // Wait for blur to enter
        setTimeout(() => {
            setSortOrder(order);
            // Wait for layout to settle behind the blur
            setTimeout(() => {
                setIsSorting(false);
            }, 800);
        }, 400);
    };

    const sortedComponents = [...componentsData].sort((a, b) => {
        if (sortOrder === 'newest') {
            return b.index - a.index;
        } else {
            return a.index - b.index;
        }
    });

    return (
        <div className="w-full min-h-full flex flex-col items-center justify-start px-4 md:px-8 pb-12 mt-8 md:mt-20">
            {/* Full Screen Blur Loading Overlay */}
            {/* Full Screen Blur Loading Overlay */}
            <AnimatePresence>
                {isSorting && <GlobalLoader />}
            </AnimatePresence>

            <div className="w-full max-w-7xl mb-8 flex justify-end">
                <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md rounded-full p-1 pl-4 border border-white/10 shadow-sm">
                    <span className="text-xs font-medium text-foreground/50 uppercase tracking-wider">Sort</span>
                    <div className="flex bg-black/20 rounded-full p-1">
                        <button
                            onClick={() => handleSort('newest')}
                            className={`
                                px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300
                                ${sortOrder === 'newest'
                                    ? 'bg-white text-black shadow-sm scale-100'
                                    : 'text-foreground/50 hover:text-foreground/80 scale-95 hover:scale-100'}
                            `}
                        >
                            Newest
                        </button>
                        <button
                            onClick={() => handleSort('oldest')}
                            className={`
                                px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300
                                ${sortOrder === 'oldest'
                                    ? 'bg-white text-black shadow-sm scale-100'
                                    : 'text-foreground/50 hover:text-foreground/80 scale-95 hover:scale-100'}
                            `}
                        >
                            Oldest
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full max-w-7xl">
                {sortedComponents.map((component, i) => {
                    const PreviewComponent = componentPreviews[component.id];

                    return (
                        <Link
                            key={component.id}
                            href={`/components/${component.id}`}
                            className="block"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{
                                    duration: 0.5,
                                    delay: i * 0.05,
                                    ease: [0.23, 1, 0.32, 1]
                                }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="
                                    aspect-square w-full rounded-[32px]
                                    backdrop-blur-[8px]
                                    bg-transparent
                                    dark:bg-white/5
                                    shadow-sm
                                    relative overflow-hidden
                                    component-card-border
                                    cursor-pointer
                                    group
                                    transition-shadow duration-300
                                    hover:shadow-lg
                                "
                            >
                                {/* Card Content Container */}
                                <div className="
                                    absolute inset-0 
                                    flex flex-col
                                    p-[15px]
                                    gap-[10px]
                                ">
                                    {/* Top Container - Component Info */}
                                    <div className="
                                        w-full flex-1
                                        rounded-[20px]
                                        flex items-center justify-between
                                        px-4
                                        overflow-hidden
                                        component-sandbox-border
                                    ">
                                        {/* Component Name - Left */}
                                        <span className="
                                            text-sm md:text-base font-medium
                                            text-foreground/80
                                            truncate
                                        ">
                                            {component.name}
                                        </span>

                                        {/* Index Number - Right */}
                                        <span className="
                                            text-xs md:text-sm font-mono
                                            text-foreground/50
                                            ml-2
                                        ">
                                            #{String(component.index).padStart(2, '0')}
                                        </span>
                                    </div>

                                    {/* Bottom Container - Live Preview Sandbox */}
                                    <div className="
                                        w-full h-[80%]
                                        rounded-[20px]
                                        flex items-center justify-center
                                        overflow-hidden
                                        component-sandbox-border
                                    ">
                                        {PreviewComponent ? (
                                            <PreviewLazyLoader>
                                                <PreviewComponent />
                                            </PreviewLazyLoader>
                                        ) : (
                                            <span className="text-foreground/30 text-sm">
                                                Preview coming soon
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

