"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { componentsData } from "@/data/componentsData";
import { FlipGridPreview } from "./FlipGrid";
import { AsciiSimulationPreview } from "./AsciiSimulation";
import { LiquidMorphPreview } from "./LiquidMorph";
import { PageRevealPreview } from "./PageReveal";

// Component previews mapping
const componentPreviews: Record<string, React.ComponentType> = {
    'flip-grid': FlipGridPreview,
    'ascii-simulation': AsciiSimulationPreview,
    'liquid-morph': LiquidMorphPreview,
    'page-reveal': PageRevealPreview,
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

