"use client";

import React, { useRef, useEffect, useState } from 'react';

interface SynthwaveLinesProps {
    className?: string;
    config?: {
        lineCount?: number;
        color?: string;
    };
}

interface Line {
    y: number; // Percentage 0-1
    direction: -1 | 1;
    progress: number; // 0 to 1 (arrival)
    phase: 'arrival' | 'impact' | 'wave' | 'idle';

    // Wave animation params
    waveAmp: number;
    waveFreq: number;
    wavePhase: number;

    // Interaction params
    spring: {
        pos: number;
        vel: number;
        target: number;
    };
    mouseX: number; // X position of the bend
    isHovered: boolean;
}

export function SynthwaveLines({ className = "", config = {} }: SynthwaveLinesProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const linesRef = useRef<Line[]>([]);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const mouseRef = useRef({ x: -1000, y: -1000, vx: 0, vy: 0, lastX: 0, lastY: 0 });

    const [lineColor, setLineColor] = useState(config.color || '');

    useEffect(() => {
        // Function to resolve color from theme or config
        const updateColor = () => {
            if (config.color) {
                setLineColor(config.color);
                return;
            }

            // Resolve from CSS variable for adaptive theme support
            if (typeof window !== 'undefined') {
                const style = getComputedStyle(document.documentElement);
                const fg = style.getPropertyValue('--foreground').trim();
                // Add opacity if it's the default foreground to match original style
                // If it's pure black/white, we might want to soften it slightly like the original 0.8 alpha
                // But for now, let's just use the raw variable or a calculated value
                // The original was rgba(255, 255, 255, 0.8) which is ~#ededed with opacity in dark mode.
                // In light mode #171717 is dark.
                setLineColor(fg || 'rgba(255, 255, 255, 0.8)');
            }
        };

        updateColor();

        // Observe theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && (mutation.attributeName === 'data-theme' || mutation.attributeName === 'class')) {
                    updateColor();
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });

        return () => observer.disconnect();
    }, [config.color]);

    const CONF = {
        lineCount: config.lineCount || 10,
        color: lineColor,
        springStiffness: 0.1,
        springDamping: 0.85,
        hoverThreshold: 30, // px
    };

    // Initialize Lines
    useEffect(() => {
        linesRef.current = Array.from({ length: CONF.lineCount }).map((_, i) => ({
            y: (i + 0.5) / CONF.lineCount,
            direction: Math.random() > 0.5 ? 1 : -1,
            progress: 0,
            phase: 'arrival' as const,
            waveAmp: 0,
            waveFreq: 0.01 + Math.random() * 0.02,
            wavePhase: Math.random() * Math.PI * 2,
            spring: { pos: 0, vel: 0, target: 0 },
            mouseX: 0,
            isHovered: false
        }));
    }, [CONF.lineCount]);

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { clientWidth, clientHeight } = containerRef.current;
                setDimensions({ width: clientWidth, height: clientHeight });
                if (canvasRef.current) {
                    canvasRef.current.width = clientWidth;
                    canvasRef.current.height = clientHeight;
                }
            }
        };

        window.addEventListener('resize', updateDimensions);
        updateDimensions();
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        const lines = linesRef.current;

        const updateMouse = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            mouseRef.current.vx = x - mouseRef.current.lastX;
            mouseRef.current.vy = y - mouseRef.current.lastY;
            mouseRef.current.lastX = x;
            mouseRef.current.lastY = y;
            mouseRef.current.x = x;
            mouseRef.current.y = y;
        };

        const handleMouseLeave = () => {
            mouseRef.current.x = -1000;
            mouseRef.current.y = -1000;
        };

        canvas.addEventListener('mousemove', updateMouse);
        canvas.addEventListener('mouseleave', handleMouseLeave);

        const render = () => {
            const { width, height } = dimensions;
            ctx.clearRect(0, 0, width, height);

            // Update lines
            lines.forEach((line) => {
                const baseY = line.y * height;
                const speed = 0.01 + Math.random() * 0.005;

                // --- PHASE 1: ARRIVAL ---
                if (line.phase === 'arrival') {
                    line.progress += speed;
                    if (line.progress >= 1) {
                        line.progress = 1;
                        line.phase = 'impact';
                    }
                }
                // --- PHASE 2: IMPACT ---
                else if (line.phase === 'impact') {
                    // Quick recoil effect handled by spring or simply transition to wave
                    // Let's set a small initial waveAmp as impact
                    line.waveAmp = 20;
                    line.phase = 'wave';
                }
                // --- PHASE 3: WAVE MORPH ---
                else if (line.phase === 'wave') {
                    // Dampen the initial impact wave
                    line.waveAmp *= 0.95;
                    line.wavePhase += 0.1;

                    // Transition to synth wave
                    // Target is slightly wavy
                    // Then eventually go to idle (straight)
                    if (Math.abs(line.waveAmp) < 0.5) {
                        line.waveAmp = 0;
                        line.phase = 'idle';
                    }
                }
                // --- PHASE 4: IDLE / INTERACTION ---
                else if (line.phase === 'idle') {
                    // Interaction Logic
                    const dy = mouseRef.current.y - baseY;
                    const dx = mouseRef.current.x; // Current mouse X

                    // Check if mouse is interacting
                    // "When the cursor moving in that time the cursor is hovered on top of the line"
                    // We check vertical distance
                    const distCheck = Math.abs(dy);

                    if (distCheck < CONF.hoverThreshold) {
                        line.isHovered = true;
                    }

                    // If hovered, dragging, but break if too far
                    if (line.isHovered) {
                        if (distCheck > CONF.hoverThreshold * 4) {
                            line.isHovered = false; // Snap back if pulled too far
                        } else {
                            line.spring.target = dy;
                            line.mouseX = mouseRef.current.x;
                        }
                    } else {
                        line.spring.target = 0;
                    }
                }

                // Physics update
                const k = CONF.springStiffness;
                const d = CONF.springDamping;
                const ax = (line.spring.target - line.spring.pos) * k;
                line.spring.vel += ax;
                line.spring.vel *= d;
                line.spring.pos += line.spring.vel;

                // Drawing
                ctx.beginPath();
                ctx.strokeStyle = CONF.color;
                ctx.lineWidth = 2; // Thinner, crisper lines
                // Add glow
                ctx.shadowBlur = 4;
                ctx.shadowColor = CONF.color;


                if (line.phase === 'arrival') {
                    const startX = line.direction === 1 ? 0 : width;
                    const endX = line.direction === 1 ? width * line.progress : width * (1 - line.progress);
                    ctx.moveTo(startX, baseY);
                    ctx.lineTo(endX, baseY);
                } else {
                    // Resolution of line points
                    const steps = 100;
                    const stepSize = width / steps;

                    ctx.moveTo(0, baseY); // Start

                    for (let i = 0; i <= steps; i++) {
                        const x = i * stepSize;
                        let y = baseY;

                        // Apply Wave
                        if (line.phase === 'wave') {
                            y += Math.sin(x * line.waveFreq + line.wavePhase) * line.waveAmp;
                        }

                        // Apply Interaction (Gaussian pluck)
                        if (line.phase === 'idle' || line.phase === 'wave') {
                            // Gaussian curve for smooth bend
                            // Peak at line.mouseX
                            const distX = x - line.mouseX;
                            // Width of the pluck
                            const spread = 80;
                            const gaussian = Math.exp(- (distX * distX) / (2 * spread * spread));
                            y += line.spring.pos * gaussian;
                        }

                        ctx.lineTo(x, y);
                    }
                }
                ctx.stroke();
                ctx.shadowBlur = 0;
            });

            animationId = requestAnimationFrame(render);
        };

        render();

        return () => {
            canvas.removeEventListener('mousemove', updateMouse);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(animationId);
        };
    }, [dimensions, CONF.color, CONF.lineCount, CONF.springDamping, CONF.springStiffness, CONF.hoverThreshold]);

    return (
        <div ref={containerRef} className={`relative w-full h-full overflow-hidden bg-transparent ${className}`}>
            <canvas ref={canvasRef} className="block" />
        </div>
    );
}

export default SynthwaveLines;
