"use client";

import React, { useRef, useEffect, useId } from "react";

interface GlassSurgeProps {
    className?: string;
    text?: string;
    children?: React.ReactNode;
}

export const GlassSurge = ({ text = "MORPHYS", className = "", children }: GlassSurgeProps) => {
    // Generate a unique ID for the filter to avoid conflicts
    const id = useId();
    const filterId = `glass-surge-filter-${id}`;
    const turbulenceRef = useRef<SVGFETurbulenceElement>(null);
    const displacementRef = useRef<SVGFEDisplacementMapElement>(null);
    const targetScale = useRef(0);
    const currentScale = useRef(0);

    useEffect(() => {
        const turbulence = turbulenceRef.current;
        const displacement = displacementRef.current;
        if (!turbulence || !displacement) return;

        let frame = 0;
        let animationFrameId: number;

        const animate = () => {
            frame++;
            // Adjusted frequency for visible but smooth ripples
            const freqY = 0.015 + Math.sin(frame * 0.02) * 0.004;
            const freqX = 0.01 + Math.cos(frame * 0.02) * 0.004;

            turbulence.setAttribute("baseFrequency", `${freqX} ${freqY}`);

            // Smoothly interpolate scale
            const diff = targetScale.current - currentScale.current;
            if (Math.abs(diff) > 0.01) {
                currentScale.current += diff * 0.1; // Ease factor
                displacement.setAttribute("scale", currentScale.current.toString());
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    const content = children || (
        <span className="text-foreground">{text}</span>
    );

    return (
        <div
            className={`relative inline-block ${className}`}
            onMouseEnter={() => { targetScale.current = 50; }} // Increased scale for "more bend" 
            onMouseLeave={() => { targetScale.current = 0; }}
        >
            <svg className="fixed top-0 left-0 w-0 h-0 pointer-events-none" aria-hidden="true">
                <defs>
                    <filter
                        id={filterId}
                        colorInterpolationFilters="linearRGB"
                        filterUnits="userSpaceOnUse"
                        primitiveUnits="userSpaceOnUse"
                        x="-50%"
                        y="-50%"
                        width="200%"
                        height="200%"
                    >
                        {/* 
                            Turbulence creates the "noise" or "liquid" texture. 
                            baseFrequency determines the density of the liquid ripples.
                        */}
                        <feTurbulence
                            ref={turbulenceRef}
                            type="fractalNoise"
                            baseFrequency="0.01 0.015" // Restored to visible ripple range
                            numOctaves="2"
                            seed="5"
                            result="noise"
                        />
                        {/*
                             Gaussian blur smooths the noise to prevent jagged edges
                             scale determines the intensity of the distortion.
                        */}
                        <feGaussianBlur
                            in="noise"
                            stdDeviation="1.5" // Balanced blur for smoothness + definition
                            result="smoothed"
                        />
                        {/* 
                            DisplacementMap uses the noise to push pixels around.
                        */}
                        <feDisplacementMap
                            ref={displacementRef}
                            in="SourceGraphic"
                            in2="smoothed"
                            scale="0" // Start at 0
                            xChannelSelector="R"
                            yChannelSelector="G"
                        />
                    </filter>
                </defs>
            </svg>

            {/* Apply the filter to the content */}
            <div
                style={{
                    filter: `url(#${filterId})`,
                    transform: "translateZ(0)" // GPU acceleration hint
                }}
            >
                {content}
            </div>
        </div>
    );
};

export default GlassSurge;
