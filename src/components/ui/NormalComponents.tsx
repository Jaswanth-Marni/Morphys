"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { componentsData } from "@/data/componentsData";
import { FlipGridPreview } from "./FlipGrid";
import { AsciiSimulationPreview } from "./AsciiSimulation";
import { LiquidMorphPreview } from "./LiquidMorph";
import { PageRevealPreview } from "./PageReveal";
import { NavbarMenuPreview } from "./NavbarMenu";
import { SpotlightSearchPreview } from "./SpotlightSearch";
import { ImageTrailCursorPreview } from "./ImageTrailCursor";
import { RealityLensPreview } from "./RealityLens";
import { NavbarMenu2Preview } from "./NavbarMenu2";
import { ScrollToRevealPreview } from "./ScrollToReveal";
import { DiffuseTextPreview } from "./DiffuseText";
import { DiagonalFocusPreview } from "./DiagonalFocus";
import { NotificationStackPreview } from "./NotificationStack";
import { TextPressure } from "./TextPressure";
import { FluidHeightPreview } from "./FluidHeight";
import FluidHeight from "./FluidHeight";
import TextMirror from "./TextMirror";
import { StepMorphPreview } from "./StepMorph";
import StepMorph from "./StepMorph";
import { CenterMenu } from "./CenterMenu";

// Wrapper for interactive previews
const FluidHeightInteractive = () => (
    <FluidHeight
        className="text-[3rem]"
        containerClassName="pb-12"
        showHint={false}
    />
);

const TextMirrorInteractive = () => (
    <TextMirror
        text="MORPHYS"
        hasTrigger={false}
        config={{
            fontSize: 40,
            spread: 15,
            idleTimeout: 3000
        }}
    />
);

const StepMorphInteractive = () => (
    <StepMorph
        className="text-[2.5rem]"
        containerClassName=""
        innerClassName=""
        stepSize={14}
        showHint={false}
    />
);

const CenterMenuPreview = () => (
    <div className="w-full h-full flex items-center justify-center">
        <CenterMenu className="pointer-events-none transform-gpu scale-[0.7] !min-h-0 !h-auto !pt-0 !overflow-visible" />
    </div>
);

// Component previews mapping
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
};

export function NormalComponents() {
    return (
        <div className="w-full h-full flex flex-col items-center justify-start px-4 md:px-8 pb-12 mt-8 md:mt-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full max-w-7xl">
                {componentsData.map((component, i) => {
                    const PreviewComponent = componentPreviews[component.id];

                    return (
                        <Link
                            key={component.id}
                            href={`/components/${component.id}`}
                            className="block"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, y: 50, filter: "blur(4px)" }}
                                whileInView={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{
                                    duration: 0.8,
                                    delay: (i % 3) * 0.1, // Stagger based on column (assuming ~3 cols)
                                    ease: [0.2, 0.8, 0.2, 1], // Smooth custom bezier
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
                                            <PreviewComponent />
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

