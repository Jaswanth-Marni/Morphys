"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import { motion, useSpring, useMotionValue, useAnimationFrame, useTransform } from "framer-motion";

// Responsive config interface
interface ResponsiveWaveConfig {
    amplitude: number;
    wavelength: number;
    itemSpacing: number;
    logoSize: number;
    containerSize: number;
}

// Hook to get responsive sizing
function useResponsiveWave(): ResponsiveWaveConfig {
    const [config, setConfig] = useState<ResponsiveWaveConfig>({
        amplitude: 80,
        wavelength: 200,
        itemSpacing: 90,
        logoSize: 80,
        containerSize: 100,
    });

    useEffect(() => {
        const updateConfig = () => {
            const width = window.innerWidth;

            if (width < 480) {
                // Mobile small
                setConfig({
                    amplitude: 30,
                    wavelength: 100,
                    itemSpacing: 65,
                    logoSize: 55,
                    containerSize: 80,
                });
            } else if (width < 768) {
                // Mobile
                setConfig({
                    amplitude: 45,
                    wavelength: 130,
                    itemSpacing: 75,
                    logoSize: 65,
                    containerSize: 90,
                });
            } else if (width < 1024) {
                // Tablet
                setConfig({
                    amplitude: 60,
                    wavelength: 160,
                    itemSpacing: 75,
                    logoSize: 65,
                    containerSize: 85,
                });
            } else {
                // Desktop
                setConfig({
                    amplitude: 80,
                    wavelength: 200,
                    itemSpacing: 90,
                    logoSize: 80,
                    containerSize: 100,
                });
            }
        };

        updateConfig();
        window.addEventListener('resize', updateConfig);
        return () => window.removeEventListener('resize', updateConfig);
    }, []);

    return config;
}

interface WaveMarqueeConfig {
    speed?: number;
    amplitude?: number;
    wavelength?: number;
    logoScale?: number;
    blurAmount?: number;
    grayscale?: boolean;
}

interface WaveMarqueeProps {
    config?: WaveMarqueeConfig;
    className?: string;
}

// Sample logos (SVGs and images) - with viewBox info
const LOGOS = [
    { name: "Amazon", imageUrl: "https://img.icons8.com/ios-filled/50/amazon.png" },
    { name: "Salesforce", imageUrl: "https://img.icons8.com/ios-filled/50/salesforce.png" },
    { name: "Microsoft", viewBox: "0 0 50 50", path: "M 5 4 C 4.448 4 4 4.447 4 5 L 4 24 L 24 24 L 24 4 L 5 4 z M 26 4 L 26 24 L 46 24 L 46 5 C 46 4.447 45.552 4 45 4 L 26 4 z M 4 26 L 4 45 C 4 45.553 4.448 46 5 46 L 24 46 L 24 26 L 4 26 z M 26 26 L 26 46 L 45 46 C 45.552 46 46 45.553 46 45 L 46 26 L 26 26 z" },
    { name: "Google", viewBox: "0 0 48 48", path: "M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" },
    { name: "Apple", imageUrl: "https://img.icons8.com/ios-filled/50/mac-os.png" },
    { name: "Netflix", imageUrl: "https://img.icons8.com/ios-filled/50/netflix.png" },
    { name: "Spotify", imageUrl: "https://img.icons8.com/ios-filled/50/spotify.png" },
    { name: "Steam", viewBox: "0 0 50 50", path: "M 25 3 C 13.59 3 4.209375 11.680781 3.109375 22.800781 L 14.300781 28.529297 C 15.430781 27.579297 16.9 27 18.5 27 L 18.550781 27 C 18.940781 26.4 19.389375 25.649141 19.859375 24.869141 C 20.839375 23.259141 21.939531 21.439062 23.019531 20.039062 C 23.259531 15.569063 26.97 12 31.5 12 C 36.19 12 40 15.81 40 20.5 C 40 25.03 36.430937 28.740469 31.960938 28.980469 C 30.560938 30.060469 28.750859 31.160859 27.130859 32.130859 C 26.350859 32.610859 25.6 33.059219 25 33.449219 L 25 33.5 C 25 37.09 22.09 40 18.5 40 C 14.91 40 12 37.09 12 33.5 C 12 33.33 12.009531 33.17 12.019531 33 L 3.2792969 28.519531 C 4.9692969 38.999531 14.05 47 25 47 C 37.15 47 47 37.15 47 25 C 47 12.85 37.15 3 25 3 z M 31.5 14 C 27.92 14 25 16.92 25 20.5 C 25 24.08 27.92 27 31.5 27 C 35.08 27 38 24.08 38 20.5 C 38 16.92 35.08 14 31.5 14 z M 31.5 16 C 33.99 16 36 18.01 36 20.5 C 36 22.99 33.99 25 31.5 25 C 29.01 25 27 22.99 27 20.5 C 27 18.01 29.01 16 31.5 16 z M 18.5 29 C 17.71 29 16.960313 29.200312 16.320312 29.570312 L 19.640625 31.269531 C 20.870625 31.899531 21.350469 33.410625 20.730469 34.640625 C 20.280469 35.500625 19.41 36 18.5 36 C 18.11 36 17.729375 35.910469 17.359375 35.730469 L 14.029297 34.019531 C 14.289297 36.259531 16.19 38 18.5 38 C 20.99 38 23 35.99 23 33.5 C 23 31.01 20.99 29 18.5 29 z" },
    { name: "Slack", imageUrl: "https://img.icons8.com/ios-filled/50/slack-new.png" },
    { name: "Discord", imageUrl: "https://img.icons8.com/ios-filled/50/discord-logo.png" },
    { name: "Dell", viewBox: "0 0 50 50", path: "M 25 2 C 12.296875 2 2 12.296875 2 25 C 2 37.703125 12.296875 48 25 48 C 37.703125 48 48 37.703125 48 25 C 48 12.296875 37.703125 2 25 2 Z M 22.28125 19.125 L 24.125 20.5625 L 19.5625 24.125 L 20.4375 24.8125 L 25 21.25 L 26.84375 22.6875 L 22.28125 26.28125 L 23.15625 26.96875 L 27.71875 23.375 L 27.71875 20.09375 L 31 20.09375 L 31 26.78125 L 34.3125 26.78125 L 34.3125 29.5625 L 27.71875 29.5625 L 27.71875 26.28125 L 22.28125 30.53125 L 17.3125 26.625 C 16.597656 28.347656 14.875 29.5625 12.875 29.5625 L 8.625 29.5625 L 8.625 20.09375 L 12.875 20.09375 C 15.105469 20.09375 16.710938 21.519531 17.3125 23.03125 Z M 35.1875 20.09375 L 38.46875 20.09375 L 38.46875 26.78125 L 41.78125 26.78125 L 41.78125 29.5625 L 35.1875 29.5625 Z M 11.8125 22.8125 L 11.8125 26.84375 L 12.53125 26.84375 C 13.648438 26.84375 14.59375 26.214844 14.59375 24.8125 C 14.59375 23.527344 13.730469 22.8125 12.53125 22.8125 Z" },
    { name: "Tesla", imageUrl: "https://img.icons8.com/ios-filled/50/tesla-logo.png" },
    { name: "GitHub", imageUrl: "https://img.icons8.com/ios-filled/50/github.png" },
    { name: "LinkedIn", imageUrl: "https://img.icons8.com/ios-filled/50/linkedin.png" },
    { name: "Twitter", imageUrl: "https://img.icons8.com/ios-filled/50/twitterx--v2.png" },
];

const WaveMarquee: React.FC<WaveMarqueeProps> = ({ config = {}, className = "" }) => {
    // Get responsive sizing
    const responsiveConfig = useResponsiveWave();

    // Configuration defaults - use responsive amplitude and wavelength
    const defaultConfig: WaveMarqueeConfig = {
        speed: 1,
        amplitude: responsiveConfig.amplitude,
        wavelength: responsiveConfig.wavelength,
        logoScale: 1.2,
        blurAmount: 0,
        grayscale: true,
    };

    const finalConfig = { ...defaultConfig, ...config };

    // Create a duplicated list of logos for infinite scroll
    // We need enough to cover the screen width plus some buffer
    const items = useMemo(() => {
        // Simple heuristic: duplicate enough times.
        // In a real robust scenario we'd measure width, but for this demo a fixed multiplier is safe provided container isn't huge.
        const baseItems = LOGOS;
        const multiplier = 6;
        let combined = [];
        for (let i = 0; i < multiplier; i++) {
            combined.push(...baseItems.map(item => ({ ...item, id: `${i}-${item.name}` })));
        }
        return combined;
    }, []);

    const containerRef = useRef<HTMLDivElement>(null);
    const time = useMotionValue(0);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Mouse interaction springs
    const mouseInfluence = useSpring(0, { stiffness: 50, damping: 20 });
    const waveAmplitude = useSpring(finalConfig.amplitude!, { stiffness: 40, damping: 15 });

    // Manage animation frame
    useAnimationFrame((t, delta) => {
        // Move time forward
        const currentSpeed = finalConfig.speed! * (1 - mouseInfluence.get());
        time.set(time.get() + (delta * 0.05 * currentSpeed));
    });

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
            mouseX.set(e.clientX - rect.left);
            mouseY.set(e.clientY - rect.top);

            // Calculate normalized Y position (0 to 1)
            const normalizedY = (e.clientY - rect.top) / rect.height;
            // Increase amplitude when mouse is near center verticallly? Or just make it lively
            // Let's make amplitude react to mouse Y. 
            // If mouse is at top/bottom, wave is flatter. If in middle, wave is bigger? 
            // Or maybe scale amplitude based on horizontal movement speed? 
            // Let's just make it react to presence.

            // Actually, let's make the wave "calm down" when hovering to make it easier to click/view
            waveAmplitude.set(finalConfig.amplitude! * 0.5);
            mouseInfluence.set(0.8); // Slow down significantly on hover
        }
    };

    const handleMouseLeave = () => {
        waveAmplitude.set(finalConfig.amplitude!);
        mouseInfluence.set(0);
        mouseY.set(0);
    };

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-full overflow-hidden flex items-center justify-center ${className}`}
            style={{
                backgroundImage: 'url(/23.-California_1.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <div className="absolute inset-0 flex items-center justify-center">
                {items.map((item, index) => (
                    <WaveItem
                        key={item.id}
                        item={item}
                        index={index}
                        time={time}
                        config={finalConfig}
                        amplitude={waveAmplitude}
                        mouseX={mouseX}
                        totalItems={items.length}
                        responsiveConfig={responsiveConfig}
                    />
                ))}
            </div>
        </div>
    );
};

const WaveItem = ({ item, index, time, config, amplitude, mouseX, totalItems, responsiveConfig }: any) => {
    // Get item spacing from responsive config
    const ITEM_SPACING = responsiveConfig?.itemSpacing || 90;

    // Dimensions
    const itemWidth = responsiveConfig?.containerSize || 100;
    const totalWidth = totalItems * ITEM_SPACING;

    const x = useTransform(time, (t: number) => {
        // Calculate position based on index and time
        const basePos = (index * ITEM_SPACING) - t;
        // Wrap around
        const wrappedPos = ((basePos % totalWidth) + totalWidth) % totalWidth;
        // Center the coordinate system roughly
        return wrappedPos - ITEM_SPACING;
    });

    // Calculate Y based on X (Wave physics)
    // We need to read the 'x' value. useTransform gives us a MotionValue.
    // To make y dependent on x, we transform x.
    const y = useTransform([x, amplitude], ([currentX, currentAmp]: any) => {
        // Sine wave formula: y = A * sin(kx + wt)
        // We'll just use spatial position for the phase
        const phase = currentX / config.wavelength;
        return Math.sin(phase) * currentAmp;
    });

    // Rotation for 3D effect
    const rotateZ = useTransform([x, amplitude], ([currentX, currentAmp]: any) => {
        // Derivative of sine (cosine) gives us the slope
        const phase = currentX / config.wavelength;
        const slope = Math.cos(phase);
        // Tilt based on slope max +/- 15 deg
        return slope * (currentAmp / 10);
    });

    // Hover / Proximity effect
    // We need a ref to get the actual DOM element's screen position?
    // Actually, we can use the `x` value we already have, as it is relative to the container-ish.
    // The container is `w-full`. `x` is roughly pixels from left.
    // Let's approximate proximity to mouseX.

    // Since x is a motion value, we can't easily use it in another useTransform unless we combine them?
    // Framer Motion `useTransform` can combine multiple MotionValues.

    const scale = useTransform([x, mouseX], ([currentX, mX]: any) => {
        // No scaling - always return 1
        return 1;
    });

    const opacity = useTransform([x, mouseX], ([currentX, mX]: any) => {
        // No dimming - always return full opacity
        return 1;
    });

    const grayscale = useTransform([x, mouseX], ([currentX, mX]: any) => {
        const dist = Math.abs(currentX - mX + (itemWidth / 2));
        // If close to cursor, color (grayscale 0%). Else grayscale 100%.
        if (dist < 150) {
            return 0; // Color
        }
        return config.grayscale ? 1 : 0;
    });

    // Fix for initial render flashing or layout issues: 
    // Wait for client side? No, standard React.

    // Get responsive sizes
    const containerSize = responsiveConfig?.containerSize || 100;
    const logoSize = responsiveConfig?.logoSize || 80;

    return (
        <motion.div
            style={{
                x,
                y,
                rotateZ,
                scale,
                opacity,
                position: "absolute",
                left: 0, // We control X via translate
                width: containerSize,
                height: containerSize,
            }}
            className="flex flex-col items-center justify-center cursor-pointer"
        >
            <div
                className="bg-white/20 rounded-full flex items-center justify-center backdrop-blur-xl border border-white/30 shadow-lg hover:bg-white/30 transition-all duration-300 hover:scale-105"
                style={{
                    width: logoSize,
                    height: logoSize,
                    padding: logoSize * 0.1,
                }}
            >
                {/* Render Image or SVG */}
                {item.imageUrl ? (
                    <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-3/5 h-3/5 object-contain"
                        style={{ filter: 'brightness(0)' }}
                    />
                ) : (
                    <svg
                        viewBox={item.viewBox || "0 0 50 50"}
                        className="w-3/5 h-3/5 fill-foreground"
                        style={{ overflow: 'visible' }}
                    >
                        <path d={item.path} />
                    </svg>
                )}
            </div>
            {/* Optional label */}
            {/* <span className="mt-2 text-xs font-medium opacity-50">{item.name}</span> */}
        </motion.div>
    );
};

export { WaveMarquee };
export default WaveMarquee;

export const WaveMarqueePreview = () => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center overflow-hidden">
            <WaveMarquee
                className="h-[300px] w-full"
                config={{
                    speed: 2,
                    amplitude: 30,
                    wavelength: 150,
                    grayscale: false
                }}
            />
        </div>
    );
};
