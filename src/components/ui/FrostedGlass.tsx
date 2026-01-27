"use client";

import React, { useState, useEffect, useRef } from 'react';

interface FrostedGlassConfig {
    text: string;
    videoSources?: string[];
    blurAmount?: number;
    fontSize?: number;
    fontWeight?: number;
    className?: string;
}

const defaultVideos = [
    "/251.webm",
    "/252.webm",
    "/253.webm",
    "/254.webm"
];

export const FrostedGlass = ({
    config = {},
    containerClassName = ""
}: {
    config?: Partial<FrostedGlassConfig>;
    containerClassName?: string;
}) => {
    const {
        text = "CURATED CHAOS",
        videoSources = defaultVideos,
        blurAmount = 30,
        fontSize = 300,
        fontWeight = 900,
        className = ""
    } = config;

    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    // Initial video source
    const [videoSrc, setVideoSrc] = useState(videoSources[0]);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const effectiveFontSize = isMobile ? Math.min(fontSize, 150) : fontSize;

    useEffect(() => {
        setVideoSrc(videoSources[currentVideoIndex]);
    }, [currentVideoIndex, videoSources]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentVideoIndex((prev) => (prev + 1) % videoSources.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [videoSources.length]);

    const words = text.split(" ");
    const lineHeight = 0.9; // em

    return (
        <div className={`relative w-full h-full min-h-[400px] md:min-h-[600px] overflow-hidden flex items-center justify-center bg-black ${containerClassName}`}>

            {/* 1. Background Layer (Sharp) */}
            <div className="absolute inset-0 z-0">
                <video
                    key={`bg-${videoSrc}`} // Force re-render ensures smooth sync on src change if needed, but react handles src updates well usually. 
                    src={videoSrc}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                />
            </div>

            {/* 2. Text Mask Layer (Reveals Blurred Video) */}
            <div className="relative z-10 w-full h-full flex items-center justify-center pointer-events-none">
                <svg width="100%" height="100%" className="absolute inset-0">
                    <defs>
                        <mask id="text-mask">
                            {/* Fill with black (hide everything) */}
                            <rect width="100%" height="100%" fill="black" />
                            {/* Text with white (reveal this part) */}
                            <text
                                x="50%"
                                y="50%"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize={effectiveFontSize}
                                fontWeight={fontWeight}
                                fontFamily="'Thunder', sans-serif"
                                fill="white"
                            >
                                {words.map((word, i) => (
                                    <tspan
                                        key={i}
                                        x="50%"
                                        dy={i === 0 ? `-${((words.length - 1) * lineHeight) / 2}em` : `${lineHeight}em`}
                                    >
                                        {word}
                                    </tspan>
                                ))}
                            </text>
                        </mask>
                    </defs>

                    {/* ForeignObject allows embedding HTML (div > video) inside SVG to be masked */}
                    <foreignObject width="100%" height="100%" mask="url(#text-mask)">
                        <div className="w-full h-full">
                            <video
                                key={`fg-${videoSrc}`}
                                src={videoSrc}
                                className="w-full h-full object-cover"
                                autoPlay
                                muted
                                loop
                                playsInline
                                style={{
                                    filter: `blur(${blurAmount}px) saturate(1.5)`,
                                    transform: 'scale(1.1)' // Slight scale to avoid edge blur artifacts
                                }}
                            />
                        </div>
                    </foreignObject>
                </svg>
            </div>

        </div>
    );
};

export default FrostedGlass;
