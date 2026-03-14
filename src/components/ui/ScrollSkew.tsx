"use client";

import { useRef } from "react";
import {
    motion,
    useSpring,
    useTransform,
    useVelocity,
    useAnimationFrame,
    useMotionValue,
    MotionValue,
} from "framer-motion";

// Utility function for wrapping
const wrap = (min: number, max: number, v: number) => {
    const rangeSize = max - min;
    return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

interface ParallaxTextProps {
    children: string;
    baseVelocity?: number;
    className?: string;
    scrollY: MotionValue<number>;
    style?: React.CSSProperties;
}

function ParallaxText({ children, baseVelocity = 5, className = "", scrollY, style }: ParallaxTextProps) {
    const baseX = useMotionValue(0);
    const scrollVelocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(scrollVelocity, {
        damping: 100,
        stiffness: 300
    });

    // Skew based on velocity
    // Velocity range: -1000 to 1000
    // Skew range: 30deg to -30deg (inverse relation for natural feel)
    // Skew range: 15deg to -15deg (reduced for heavier feel)
    const skewX = useTransform(smoothVelocity, [-1000, 1000], [15, -15]);

    const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 1.5], {
        clamp: false
    });

    // Calculate x position
    // Wrap between 0 and -12.5% (assuming 8 repeating items: 100/8 = 12.5)
    // This ensures a seamless loop for any screen size
    const x = useTransform(baseX, (v) => `${wrap(0, -12.5, v)}%`);

    useAnimationFrame((t, delta) => {
        // Move only based on scroll velocity
        // This ensures the component is static when not scrolling
        let moveBy = velocityFactor.get() * baseVelocity * (delta / 1000);

        baseX.set(baseX.get() + moveBy);
    });

    return (
        <div style={{ containerType: "inline-size" }} className="parallax overflow-visible w-full m-0 flex flex-nowrap whitespace-nowrap leading-[1] py-2">
            <motion.div
                className={`font-vank text-[clamp(12.5rem,25cqi,37.5rem)] md:text-[clamp(7.5rem,15cqi,22.5rem)] tracking-[1px] flex flex-nowrap whitespace-nowrap ${className}`}
                style={{ x, skewX, ...style }}
            >
                {/* Repeat content 8 times to ensure seamless infinite scroll */}
                {[...Array(8)].map((_, i) => (
                    <span key={i} className="block mr-32">{children}</span>
                ))}
            </motion.div>
        </div>
    );
}

export function ScrollSkew() {
    const scrollY = useMotionValue(0);

    const handleWheel = (e: React.WheelEvent) => {
        scrollY.set(scrollY.get() + e.deltaY);
    };

    return (
        <div
            onWheel={handleWheel}
            className="w-full h-full flex items-center justify-center overflow-hidden cursor-ns-resize text-foreground"
        >
            <div className="flex flex-col gap-0 w-full">
                <ParallaxText baseVelocity={3} className="uppercase font-normal" scrollY={scrollY}>
                    Velocity Based Skew
                </ParallaxText>
                <ParallaxText
                    baseVelocity={-3}
                    className="uppercase font-normal text-transparent"
                    scrollY={scrollY}
                    style={{ WebkitTextStroke: '2px var(--foreground)', color: 'transparent' }}
                >
                    Scroll To Deform
                </ParallaxText>
            </div>
        </div>
    );
}

export default ScrollSkew;
