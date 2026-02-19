"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const bootLines = [
    "> INITIALIZING SYSTEM...",
    "> CHECKING MEMORY... 64KB OK",
    "> LOADING KERNEL... OK",
    "> MOUNTING VOLUMES... OK",
    "> NETWORK CHECK... FAILED",
    "> ERROR: CONNECTION RESET",
    "> RETRYING CONNECTION... FAILED",
    "> CRITICAL SYSTEM FAILURE",
    "> ERROR CODE: 404_NOT_FOUND"
];

const Retro404 = () => {
    // State for interactive features
    const [bootState, setBootState] = useState<'booting' | 'error'>('booting');
    const [typedLines, setTypedLines] = useState<string[]>([]);
    const [glitchIntensity, setGlitchIntensity] = useState(0); // 0 to 1

    // Audio Context Ref
    const audioContextRef = useRef<AudioContext | null>(null);
    const oscillatorRef = useRef<OscillatorNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initialize Audio
    useEffect(() => {
        const initAudio = () => {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

                // Create Gain Node for volume control
                const gainNode = audioContextRef.current.createGain();
                gainNode.gain.value = 0; // Start silent
                gainNode.connect(audioContextRef.current.destination);
                gainNodeRef.current = gainNode;

                // Create Oscillator for hum
                const oscillator = audioContextRef.current.createOscillator();
                oscillator.type = 'sawtooth';
                oscillator.frequency.value = 50; // Low hum
                oscillator.connect(gainNode);
                oscillator.start();
                oscillatorRef.current = oscillator;
            }
        };

        const handleInteraction = () => {
            if (audioContextRef.current?.state === 'suspended') {
                audioContextRef.current.resume();
            }
            if (!audioContextRef.current) initAudio();
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('mousemove', handleInteraction);
        };

        window.addEventListener('click', handleInteraction);
        window.addEventListener('mousemove', handleInteraction);

        return () => {
            oscillatorRef.current?.stop();
            audioContextRef.current?.close();
        };
    }, []);

    // Boot Sequence Logic
    useEffect(() => {
        if (bootState !== 'booting') return;

        let lineIndex = 0;
        const interval = setInterval(() => {
            if (lineIndex < bootLines.length) {
                setTypedLines(prev => [...prev, bootLines[lineIndex]]);
                lineIndex++;

                // Play keystroke sound
                playKeystrokeSound();
            } else {
                clearInterval(interval);
                setTimeout(() => {
                    playBoomSound();
                    setBootState('error');
                }, 800);
            }
        }, 150); // Typing speed

        return () => clearInterval(interval);
    }, [bootState]);

    // Audio Helpers
    const playKeystrokeSound = () => {
        if (!audioContextRef.current || !gainNodeRef.current) return;

        const osc = audioContextRef.current.createOscillator();
        const gain = audioContextRef.current.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(600, audioContextRef.current.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, audioContextRef.current.currentTime + 0.05);

        gain.gain.setValueAtTime(0.025, audioContextRef.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 0.05);

        osc.connect(gain);
        gain.connect(audioContextRef.current.destination);
        osc.start();
        osc.stop(audioContextRef.current.currentTime + 0.05);
    };

    const playBoomSound = () => {
        if (!audioContextRef.current) return;

        // 1. Deep Sine Drop (Sub-bass boom)
        const osc = audioContextRef.current.createOscillator();
        const gain = audioContextRef.current.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, audioContextRef.current.currentTime);
        osc.frequency.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.5);

        gain.gain.setValueAtTime(0.5, audioContextRef.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 0.5);

        osc.connect(gain);
        gain.connect(audioContextRef.current.destination);
        osc.start();
        osc.stop(audioContextRef.current.currentTime + 0.5);

        // 2. Filtered Noise (Explosion texture)
        const bufferSize = audioContextRef.current.sampleRate * 0.5; // 500ms
        const buffer = audioContextRef.current.createBuffer(1, bufferSize, audioContextRef.current.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = audioContextRef.current.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = audioContextRef.current.createGain();

        // Low pass filter to make it "heavy"
        const filter = audioContextRef.current.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, audioContextRef.current.currentTime);
        filter.frequency.linearRampToValueAtTime(100, audioContextRef.current.currentTime + 0.4);

        noiseGain.gain.setValueAtTime(0.4, audioContextRef.current.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 0.4);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(audioContextRef.current.destination);
        noise.start();
    };

    const playStaticBurst = useCallback((intensity: number) => {
        if (!audioContextRef.current) return;

        const bufferSize = audioContextRef.current.sampleRate * 0.1; // 100ms
        const buffer = audioContextRef.current.createBuffer(1, bufferSize, audioContextRef.current.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = audioContextRef.current.createBufferSource();
        noise.buffer = buffer;
        const gain = audioContextRef.current.createGain();

        // Volume based on intensity
        gain.gain.value = intensity * 0.05;

        noise.connect(gain);
        gain.connect(audioContextRef.current.destination);
        noise.start();
    }, []);


    // Mouse Movement Handler for Glitch Intensity
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dist = Math.sqrt(Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2));
        const maxDist = Math.max(rect.width, rect.height) / 1.5;

        // Closer = Higher Intensity (Inverted distance)
        // Also factor in speed (delta) if we wanted, but proximity is cleaner
        const intensity = Math.max(0, 1 - (dist / maxDist));

        setGlitchIntensity(intensity);

        // Modulate hum volume based on intensity
        if (gainNodeRef.current) {
            gainNodeRef.current.gain.setTargetAtTime(intensity * 0.05, audioContextRef.current?.currentTime || 0, 0.1);
        }

        // Random static bursts at high intensity
        if (intensity > 0.8 && Math.random() > 0.92) {
            playStaticBurst(intensity);
        }
    };


    // Increase slice count for more detailed "shredding"
    const sliceCount = 40;
    const slices = Array.from({ length: sliceCount }).map((_, i) => i);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Common font styles
    const fontStyles = "font-black text-[150px] md:text-[220px] tracking-tighter leading-none";
    const fontFamilyStyle = { fontFamily: "Arial Black, Impact, sans-serif" };

    // Generate debris
    const debrisCount = 20;
    const debris = Array.from({ length: debrisCount }).map((_, i) => ({
        id: i,
        top: Math.random() * 100,
        height: Math.random() * 5 + 1,
        width: Math.random() * 30 + 10,
        left: Math.random() * 100,
        color: ["#ff00c1", "#00fff9", "#ffff00", "#ff0000", "#0000ff"][Math.floor(Math.random() * 5)],
        delay: Math.random() * 2,
        duration: Math.random() * 0.2 + 0.05
    }));

    if (!isMounted) return null;

    return (
        <div
            ref={containerRef}
            className="flex h-full w-full items-center justify-center bg-black overflow-hidden relative cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => {
                setGlitchIntensity(0);
                if (gainNodeRef.current) {
                    gainNodeRef.current.gain.setTargetAtTime(0, audioContextRef.current?.currentTime || 0, 0.5);
                }
            }}
        >

            {/* CRT Background - Dark purple scanlines */}
            <div className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    background: "repeating-linear-gradient(to bottom, #050005, #050005 3px, #1a051a 3px, #1a051a 6px)",
                    backgroundSize: "100% 6px"
                }}
            />
            {/* Vignette */}
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_90%)] pointer-events-none" />

            <AnimatePresence mode="wait">
                {bootState === 'booting' ? (
                    <motion.div
                        key="boot-sequence"
                        initial={{ opacity: 1, scaleY: 1 }}
                        exit={{ opacity: 0, scaleY: 0, filter: "brightness(5)" }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="relative z-10 font-mono text-green-500 text-sm md:text-lg flex flex-col items-start justify-center p-8 w-full max-w-2xl"
                    >
                        {typedLines.map((line, i) => (
                            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                {line}
                            </motion.div>
                        ))}
                        <motion.div
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="w-3 h-5 bg-green-500 mt-2"
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="error-display"
                        initial={{ opacity: 0, scaleY: 0 }}
                        animate={{ opacity: 1, scaleY: 1 }}
                        transition={{ duration: 0.2, ease: "circOut", delay: 0.2 }}
                        className="relative z-20 flex flex-col items-center justify-center w-full"
                    >
                        <div className="relative inline-block">

                            {/* SPACER: Invisible text used for layout */}
                            <h1 className={`${fontStyles} opacity-0 select-none`} style={fontFamilyStyle}>
                                404
                            </h1>

                            {/* Glow Layer - Intensity based on mouse propinquity */}
                            <motion.h1
                                className={`absolute inset-0 ${fontStyles} z-0 select-none blur-xl`}
                                style={fontFamilyStyle}
                                animate={{
                                    color: ["#ff00c1", "#00fff9", "#ffff00", "#ff00c1"],
                                    opacity: [0.3, 0.6 + (glitchIntensity * 0.4), 0.3], // Pulsates more intensely when near
                                    filter: `blur(${10 + glitchIntensity * 20}px)`
                                }}
                                transition={{
                                    duration: 0.5 - (glitchIntensity * 0.4), // Faster pulse when near
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                            >
                                404
                            </motion.h1>

                            {/* Background Glitch Layers (Deep shifts) - Reacts to intensity */}
                            <motion.h1
                                className={`absolute inset-0 ${fontStyles} text-[#ff00c1] z-0 mix-blend-screen select-none`}
                                style={fontFamilyStyle}
                                animate={{
                                    x: [-5, 5, -2, 8, -5].map(v => v * (1 + glitchIntensity * 5)), // Exaggerate movement 
                                    opacity: [0.8, 0.4, 0.8]
                                }}
                                transition={{ duration: 0.2 - (glitchIntensity * 0.1), repeat: Infinity, ease: "linear" }}
                            >
                                404
                            </motion.h1>
                            <motion.h1
                                className={`absolute inset-0 ${fontStyles} text-[#00fff9] z-0 mix-blend-screen select-none`}
                                style={fontFamilyStyle}
                                animate={{
                                    x: [5, -5, 2, -8, 5].map(v => v * (1 + glitchIntensity * 5)),
                                    opacity: [0.8, 0.4, 0.8]
                                }}
                                transition={{ duration: 0.2 - (glitchIntensity * 0.1), repeat: Infinity, ease: "linear" }}
                            >
                                404
                            </motion.h1>

                            {/* Base White Text */}
                            <h1
                                className={`absolute inset-0 ${fontStyles} text-white z-20 select-none drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]`}
                                style={fontFamilyStyle}
                            >
                                404
                            </h1>

                            {/* Detailed Horizontal Slices */}
                            {slices.map((i) => {
                                const top = Math.random() * 100;
                                const height = Math.random() * 3 + 1;
                                const duration = Math.random() * 0.15 + 0.05;
                                const offset = Math.random() * 20 - 10;

                                const isColored = Math.random() > 0.8;
                                const sliceColor = isColored
                                    ? ["#ff00c1", "#00fff9", "#ffff00", "#ff0000"][Math.floor(Math.random() * 4)]
                                    : "#ffffff";

                                return (
                                    <motion.h1
                                        key={`slice-${i}`}
                                        className={`absolute inset-0 ${fontStyles} z-30 select-none`}
                                        style={{
                                            ...fontFamilyStyle,
                                            color: sliceColor,
                                            clipPath: `inset(${top}% 0 ${100 - (top + height)}% 0)`
                                        }}
                                        animate={{
                                            // Intensity multiplier for offset
                                            x: [0, offset * (1 + glitchIntensity * 8), 0],
                                        }}
                                        transition={{
                                            duration: duration, // Faster jitter when intense
                                            repeat: Infinity,
                                            repeatType: "loop",
                                            ease: "linear",
                                            repeatDelay: Math.random() * 2 * (1 - glitchIntensity * 0.8) // Less delay when intense
                                        }}
                                    >
                                        404
                                    </motion.h1>
                                );
                            })}

                            {/* Foreground Debris */}
                            {debris.map((d) => (
                                <motion.div
                                    key={`debris-fg-${d.id}`}
                                    className="absolute z-40 mix-blend-normal"
                                    style={{
                                        top: `${d.top}%`,
                                        height: `${d.height}%`,
                                        width: `${d.width}%`,
                                        left: `${d.left}%`,
                                        backgroundColor: d.color,
                                        transform: "translateX(-50%)"
                                    }}
                                    animate={{
                                        x: [0, Math.random() > 0.5 ? 20 : -20, 0].map(v => v * (1 + glitchIntensity * 2)),
                                        opacity: [0, 1, 0, 1, 0]
                                    }}
                                    transition={{
                                        duration: d.duration * 2,
                                        repeat: Infinity,
                                        repeatDelay: Math.random() * 3 * (1 - glitchIntensity * 0.5),
                                        ease: "linear"
                                    }}
                                />
                            ))}

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Heavy Noise Overlay - Increases with intensity */}
            <motion.div
                className="absolute inset-0 pointer-events-none z-50 mix-blend-overlay"
                animate={{ opacity: 0.08 + glitchIntensity * 0.15 }}
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}
            />

            {/* Scanline Rolling Bar */}
            <motion.div
                className="absolute inset-x-0 h-[10px] bg-white/10 z-50 pointer-events-none blur-sm"
                animate={{ top: ["-10%", "110%"] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
        </div>
    );
};

export default Retro404;
