"use client";

import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, Suspense, lazy, useRef } from "react";
import dynamic from "next/dynamic";
import { componentsDataLite } from "@/data/componentsDataLite";
import { useNavigationLoading } from "@/context/NavigationLoadingContext";

// Component module mapping for prefetching
const componentModuleMap: Record<string, string> = {
    'flip-grid': 'FlipGrid',
    'ascii-simulation': 'AsciiSimulation',
    'liquid-morph': 'LiquidMorph',
    'page-reveal': 'PageReveal',
    'navbar-menu': 'NavbarMenu',
    'navbar-menu-2': 'NavbarMenu2',
    'spotlight-search': 'SpotlightSearch',
    'image-trail-cursor': 'ImageTrailCursor',
    'reality-lens': 'RealityLens',
    'scroll-to-reveal': 'ScrollToReveal',
    'diffuse-text': 'DiffuseText',
    'diagonal-focus': 'DiagonalFocus',
    'notification-stack': 'NotificationStack',
    'text-pressure': 'TextPressure',
    'fluid-height': 'FluidHeight',
    'text-mirror': 'TextMirror',
    'step-morph': 'StepMorph',
    'center-menu': 'CenterMenu',
    'glass-surge': 'GlassSurge',
    'layered-image-showcase': 'LayeredImageShowcase',
    'impact-text': 'ImpactText',
};

// Prefetch cache
const prefetchedComponents = new Set<string>();

// Helper to only render heavy previews when in viewport
const VisiblePreview = ({ children }: { children: React.ReactNode }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { margin: "200px" });

    return (
        <div ref={ref} className="w-full h-full flex items-center justify-center">
            {isInView ? children : null}
        </div>
    );
};

// Simple loading placeholder for preview cards
const PreviewLoader = () => (
    <div className="w-full h-full flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-foreground/10 border-t-foreground/30 rounded-full animate-spin" />
    </div>
);

// Dynamic imports for ALL preview components - NO synchronous imports!
// This prevents Three.js and other heavy libraries from blocking initial page load
const FlipGridPreview = dynamic(
    () => import("./FlipGrid").then(mod => ({ default: mod.FlipGridPreview })),
    { loading: PreviewLoader, ssr: false }
);

const AsciiSimulationPreview = dynamic(
    () => import("./AsciiSimulation").then(mod => ({ default: mod.AsciiSimulationPreview })),
    { loading: PreviewLoader, ssr: false }
);

const LiquidMorphPreview = dynamic(
    () => import("./LiquidMorph").then(mod => ({ default: mod.LiquidMorphPreview })),
    { loading: PreviewLoader, ssr: false }
);

const PageRevealPreview = dynamic(
    () => import("./PageReveal").then(mod => ({ default: mod.PageRevealPreview })),
    { loading: PreviewLoader, ssr: false }
);

const NavbarMenuPreview = dynamic(
    () => import("./NavbarMenu").then(mod => ({ default: mod.NavbarMenuPreview })),
    { loading: PreviewLoader, ssr: false }
);

const NavbarMenu2Preview = dynamic(
    () => import("./NavbarMenu2").then(mod => ({ default: mod.NavbarMenu2Preview })),
    { loading: PreviewLoader, ssr: false }
);

const SpotlightSearchPreview = dynamic(
    () => import("./SpotlightSearch").then(mod => ({ default: mod.SpotlightSearchPreview })),
    { loading: PreviewLoader, ssr: false }
);

const ImageTrailCursorPreview = dynamic(
    () => import("./ImageTrailCursor").then(mod => ({ default: mod.ImageTrailCursorPreview })),
    { loading: PreviewLoader, ssr: false }
);

const RealityLensPreview = dynamic(
    () => import("./RealityLens").then(mod => ({ default: mod.RealityLensPreview })),
    { loading: PreviewLoader, ssr: false }
);

const ScrollToRevealPreview = dynamic(
    () => import("./ScrollToReveal").then(mod => ({ default: mod.ScrollToRevealPreview })),
    { loading: PreviewLoader, ssr: false }
);

const DiffuseTextPreview = dynamic(
    () => import("./DiffuseText").then(mod => ({ default: mod.DiffuseTextPreview })),
    { loading: PreviewLoader, ssr: false }
);

const DiagonalFocusPreview = dynamic(
    () => import("./DiagonalFocus").then(mod => ({ default: mod.DiagonalFocusPreview })),
    { loading: PreviewLoader, ssr: false }
);

const NotificationStackPreview = dynamic(
    () => import("./NotificationStack").then(mod => ({ default: mod.NotificationStackPreview })),
    { loading: PreviewLoader, ssr: false }
);

const TextPressure = dynamic(
    () => import("./TextPressure").then(mod => ({ default: mod.TextPressure })),
    { loading: PreviewLoader, ssr: false }
);

// Wrapper components with inline definitions to avoid additional imports
const FluidHeightInteractive = dynamic(
    () => import("./FluidHeight").then(mod => {
        const FluidHeight = mod.default;
        return {
            default: () => (
                <FluidHeight
                    className="text-[3rem]"
                    containerClassName="pb-12"
                    showHint={false}
                />
            )
        };
    }),
    { loading: PreviewLoader, ssr: false }
);

const TextMirrorInteractive = dynamic(
    () => import("./TextMirror").then(mod => {
        const TextMirror = mod.default;
        return {
            default: () => (
                <TextMirror
                    text="MORPHYS"
                    hasTrigger={false}
                    config={{
                        fontSize: 40,
                        spread: 15,
                        idleTimeout: 3000
                    }}
                />
            )
        };
    }),
    { loading: PreviewLoader, ssr: false }
);

const StepMorphInteractive = dynamic(
    () => import("./StepMorph").then(mod => {
        const StepMorph = mod.default;
        return {
            default: () => (
                <StepMorph
                    className="text-[2.5rem]"
                    containerClassName=""
                    innerClassName=""
                    stepSize={14}
                    showHint={false}
                />
            )
        };
    }),
    { loading: PreviewLoader, ssr: false }
);

const CenterMenuPreview = dynamic(
    () => import("./CenterMenu").then(mod => {
        const CenterMenu = mod.CenterMenu;
        return {
            default: () => (
                <div className="w-full h-full flex items-center justify-center">
                    <CenterMenu className="pointer-events-none transform-gpu scale-[0.7] !min-h-0 !h-auto !pt-0 !overflow-visible" />
                </div>
            )
        };
    }),
    { loading: PreviewLoader, ssr: false }
);

const GlassSurgePreview = dynamic(
    () => import("./GlassSurge").then(mod => {
        const GlassSurge = mod.default;
        return {
            default: () => (
                <div className="w-full h-full flex items-center justify-center">
                    <GlassSurge className="text-5xl font-bold tracking-widest font-logo" text="MORPHYS" />
                </div>
            )
        };
    }),
    { loading: PreviewLoader, ssr: false }
);

const LayeredImageShowcasePreview = dynamic(
    () => import("./LayeredImageShowcase").then(mod => {
        const LayeredImageShowcase = mod.LayeredImageShowcase;
        return {
            default: () => (
                <LayeredImageShowcase className="!h-full text-[0.5rem]" />
            )
        };
    }),
    { loading: PreviewLoader, ssr: false }
);

const ImpactTextPreview = dynamic(
    () => import("./ImpactText").then(mod => ({ default: mod.ImpactTextPreview })),
    { loading: PreviewLoader, ssr: false }
);

// Component previews mapping - all are now dynamically loaded
const componentPreviews: Record<string, React.ComponentType> = {
    'flip-grid': FlipGridPreview,
    'ascii-simulation': AsciiSimulationPreview,
    'liquid-morph': LiquidMorphPreview,
    'page-reveal': PageRevealPreview,
    'navbar-menu': NavbarMenuPreview,
    'navbar-menu-2': NavbarMenu2Preview,
    'spotlight-search': SpotlightSearchPreview,
    'image-trail-cursor': ImageTrailCursorPreview,
    'reality-lens': RealityLensPreview,
    'scroll-to-reveal': ScrollToRevealPreview,
    'diffuse-text': DiffuseTextPreview,
    'diagonal-focus': DiagonalFocusPreview,
    'notification-stack': NotificationStackPreview,
    'text-pressure': TextPressure,
    'fluid-height': FluidHeightInteractive,
    'text-mirror': TextMirrorInteractive,
    'step-morph': StepMorphInteractive,
    'center-menu': CenterMenuPreview,
    'glass-surge': GlassSurgePreview,
    'layered-image-showcase': LayeredImageShowcasePreview,
    'impact-text': ImpactTextPreview,
};

export function NormalComponents() {
    const router = useRouter();
    const { startLoading } = useNavigationLoading();

    // Prefetch component on hover for faster navigation
    const handleMouseEnter = useCallback((componentId: string) => {
        if (prefetchedComponents.has(componentId)) return;

        const moduleName = componentModuleMap[componentId];
        if (!moduleName) return;

        prefetchedComponents.add(componentId);

        // Prefetch the component module
        import(`@/components/ui/${moduleName}`).catch(() => {
            prefetchedComponents.delete(componentId);
        });

        // Prefetch the route
        router.prefetch(`/components/${componentId}`);
    }, [router]);

    // Handle card click - show loading immediately
    const handleCardClick = useCallback(() => {
        startLoading();
    }, [startLoading]);

    return (
        <div className="w-full h-full flex flex-col items-center justify-start px-4 md:px-8 pb-12 mt-0 md:mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full max-w-7xl">
                {componentsDataLite.map((component, i) => {
                    const PreviewComponent = componentPreviews[component.id];

                    return (
                        <Link
                            key={component.id}
                            href={`/components/${component.id}`}
                            prefetch={true}
                            onMouseEnter={() => handleMouseEnter(component.id)}
                            onClick={handleCardClick}
                            className="block"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, y: 50, filter: "blur(4px)" }}
                                whileInView={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{
                                    duration: 0.8,
                                    delay: (i % 3) * 0.1,
                                    ease: [0.2, 0.8, 0.2, 1],
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
                                            <VisiblePreview>
                                                <PreviewComponent />
                                            </VisiblePreview>
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
