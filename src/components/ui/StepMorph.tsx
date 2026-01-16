"use client";

import React, { useState, useEffect } from "react";
import { motion, useSpring } from "framer-motion";

interface StepMorphProps {
    text?: string;
    className?: string;
    containerClassName?: string;
    innerClassName?: string;
    stepSize?: number;
    showHint?: boolean;
}

const StepMorph: React.FC<StepMorphProps> = ({
    text = "MORPHYS",
    className = "",
    containerClassName = "",
    innerClassName = "pb-20 pt-10",
    stepSize = 28,
    showHint = true,
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile viewport
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Responsive config
    const responsiveStepSize = isMobile ? Math.min(stepSize, 14) : stepSize;
    const fontHeight = isMobile ? 50 : 110;

    return (
        <div
            className={`relative w-full h-full flex items-center justify-center overflow-hidden font-sans ${containerClassName}`}
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@100..900&display=swap');
                .step-morph-font {
                    font-family: 'Big Shoulders Display', sans-serif;
                }
            `}</style>

            <div
                className={`relative flex items-start justify-center cursor-pointer ${innerClassName}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {text.split("").map((char, index) => (
                    <Letter
                        key={index}
                        char={char}
                        index={index}
                        total={text.length}
                        stepSize={responsiveStepSize}
                        isHovered={isHovered}
                        className={className}
                        fontHeight={fontHeight}
                        isMobile={isMobile}
                    />
                ))}
            </div>

            {showHint && (
                <div className="absolute bottom-8 left-0 right-0 text-center text-foreground/40 text-xs tracking-[0.2em] font-light uppercase">
                    Hover to expand
                </div>
            )}
        </div>
    );
};

interface LetterProps {
    char: string;
    index: number;
    total: number;
    stepSize: number;
    isHovered: boolean;
    className?: string;
    fontHeight: number;
    isMobile: boolean;
}

const Letter: React.FC<LetterProps> = ({
    char,
    index,
    total,
    stepSize,
    isHovered,
    className,
    fontHeight,
    isMobile
}) => {
    // 1. Calculate Transform Origin (0% to 100%)
    const originYPercentage = (index / (total - 1)) * 100;

    // 2. Calculate Required Scale
    //    Total gap span = (total letters - 1) * stepSize
    const totalGap = (total - 1) * stepSize;

    // Scale Logic:
    // EXACT calculation: To fill the gap precisely, we must scale by this ratio.
    const fullScale = (fontHeight + totalGap) / fontHeight;

    const targetScale = isHovered ? fullScale : 1;
    const targetWeight = isHovered ? 800 : 100;

    // 3. Spring Animation
    const scaleY = useSpring(1, {
        stiffness: 120,
        damping: 18,
        mass: 0.6
    });

    // Spring for weight
    const weight = useSpring(100, {
        stiffness: 100,
        damping: 20
    });

    useEffect(() => {
        scaleY.set(targetScale);
        weight.set(targetWeight);
    }, [targetScale, targetWeight, scaleY, weight]);

    // Responsive font size class
    const fontSizeClass = className || (isMobile ? 'text-[3.5rem]' : 'text-[8rem]');

    return (
        <div
            className="flex flex-col items-center mx-[-0.02em]"
            style={{
                marginTop: `${index * stepSize}px`
            }}
        >
            <motion.span
                className={`step-morph-font uppercase leading-[0.85] text-foreground block select-none ${fontSizeClass}`}
                style={{
                    scaleY,
                    fontWeight: weight,
                    transformOrigin: `50% ${originYPercentage}%`,
                    willChange: "transform, font-weight",
                    height: `${fontHeight}px`,
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                {char}
            </motion.span>
        </div>
    );
};

// Static preview for component cards
export function StepMorphPreview() {
    return (
        <div className="w-full h-full flex items-center justify-center overflow-hidden">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@100..900&display=swap');
                .step-morph-preview-font {
                    font-family: 'Big Shoulders Display', sans-serif;
                    font-weight: 100;
                }
            `}</style>
            <div className="relative flex items-start justify-center">
                {"MORPHYS".split("").map((char, index) => (
                    <span
                        key={index}
                        className="step-morph-preview-font text-[2rem] md:text-[2.5rem] uppercase leading-none text-foreground block"
                        style={{
                            marginTop: `${index * 12}px`,
                            marginLeft: index === 0 ? 0 : '-0.02em',
                        }}
                    >
                        {char}
                    </span>
                ))}
            </div>
        </div>
    );
}

export default StepMorph;
