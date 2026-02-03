"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Matter from "matter-js";

// ============================================
// TYPES
// ============================================

export interface GravityItem {
    id: string;
    content: React.ReactNode;
    width: number;
    height: number;
}

export interface GravityConfig {
    gravityStrength: number;
    gravityX: number;
    gravityY: number;
    wallBounciness: number;
    itemBounciness: number;
    friction: number;
    frictionAir: number;
    minFontSize: number; // For mobile/small screens
    maxFontSize: number; // For desktop
}

export interface GravityProps {
    text?: string;
    config?: Partial<GravityConfig>;
    className?: string;
}

// ============================================
// FONT LIST - Diverse typographic styles
// ============================================

// ============================================
// FONT LIST - Wild & Unique
// ============================================

const fontFamilies = [
    "'Robota', sans-serif",                   // Geometric
    "'Abril Fatface', cursive",               // Heavy Didone
    "'Rubik Glitch', system-ui",             // Chaos/Glitch
    "'Monoton', system-ui",                  // Retro Lines
    "'Bangers', system-ui",                  // Comic Loud
    "'Creepster', system-ui",                // Horror Melt
    "'Permanent Marker', cursive",           // Sharpie
    "'Black Ops One', system-ui",            // Stencil Military
    "'Rye', serif",                          // Western
    "'UnifrakturMaguntia', cursive",         // Gothic Blackletter
    "'Bungee Shade', system-ui",             // 3D Block
    "'Audiowide', system-ui",                // Sci-Fi
    "'Press Start 2P', system-ui",           // 8-bit
];

// Google Fonts URL for the above fonts
const googleFontsUrl = "https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Audiowide&family=Bangers&family=Black+Ops+One&family=Bungee+Shade&family=Creepster&family=Monoton&family=Permanent+Marker&family=Press+Start+2P&family=Righteous&family=Rubik+Glitch&family=Rye&family=UnifrakturMaguntia&display=swap";

// ============================================
// LETTER COMPONENT
// ============================================

const Letter = ({ letter, fontSize }: { letter: string; fontSize: number }) => {
    return (
        <span
            className="font-black pointer-events-none select-none relative block text-foreground transition-colors duration-300"
            style={{
                fontSize: `${fontSize}px`,
                lineHeight: 1,
                // Initial font - will be overridden by physics loop
                fontFamily: fontFamilies[0],
                letterSpacing: '-0.02em',
                textShadow: `
                    1px 1px 0px rgba(100,100,100,0.4),
                    2px 2px 0px rgba(100,100,100,0.35),
                    3px 3px 0px rgba(100,100,100,0.3),
                    4px 4px 0px rgba(100,100,100,0.25),
                    5px 5px 0px rgba(100,100,100,0.2),
                    6px 6px 0px rgba(100,100,100,0.15),
                    0px 0px 10px rgba(0,0,0,0.2)
                `,
                // Use a mix-blend-mode for better depth integration if background allows
                transformOrigin: 'center center',
            }}
        >
            {letter.toUpperCase()}
        </span>
    );
};

// ============================================
// DEFAULT CONFIG
// ============================================

const defaultConfig: GravityConfig = {
    gravityStrength: 1,
    gravityX: 0,
    gravityY: 1,
    wallBounciness: 0.7,
    itemBounciness: 0.5,
    friction: 0.05,
    frictionAir: 0.01,
    minFontSize: 60, // Reduced to 60px for mobile to fit 7 letters
    maxFontSize: 240, // ~15rem approx for desktop
};

// ============================================
// SPRING PHYSICS UTILS
// ============================================

interface DistortionState {
    scaleX: number;
    scaleY: number;
    skewX: number;
    skewY: number;
}

interface SpringVelocity {
    scaleX: number;
    scaleY: number;
    skewX: number;
    skewY: number;
}

// ============================================
// GRAVITY COMPONENT
// ============================================

export function Gravity({
    text = "MORPHYS",
    config: userConfig,
    className = "",
}: GravityProps) {
    const config = { ...defaultConfig, ...userConfig };

    const containerRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<Matter.Engine | null>(null);
    const runnerRef = useRef<Matter.Runner | null>(null);
    const bodiesMapRef = useRef<Map<string, Matter.Body>>(new Map());
    const elementsRef = useRef<Map<string, HTMLDivElement>>(new Map());
    const requestRef = useRef<number | null>(null);

    // Spring Physics State
    const distortionMapRef = useRef<Map<string, DistortionState>>(new Map());
    const velocityMapRef = useRef<Map<string, SpringVelocity>>(new Map());

    // Font State
    const fontMapRef = useRef<Map<string, number>>(new Map());
    const lastCollisionRef = useRef<Map<string, number>>(new Map()); // Debounce font changes

    const [isReady, setIsReady] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Check for mobile
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Determined font size
    const currentFontSize = isMobile ? config.minFontSize : config.maxFontSize;

    // Letter dimensions - Derived from font size for consistency
    const letterWidth = currentFontSize * 0.8;
    const letterHeight = currentFontSize * 0.9;

    // Generate items from text
    const letters = text.split('');
    const items: GravityItem[] = letters.map((letter, index) => ({
        id: `letter-${index}-${letter}`,
        content: <Letter letter={letter} fontSize={currentFontSize} />,
        width: letterWidth,
        height: letterHeight,
    }));

    // Store element ref
    const setElementRef = useCallback((el: HTMLDivElement | null, id: string) => {
        if (el) elementsRef.current.set(id, el);
    }, []);

    // Initialize after first render & Load Fonts
    useEffect(() => {
        const timer = setTimeout(() => setIsReady(true), 100);

        // Load Google Fonts
        const link = document.createElement('link');
        link.href = googleFontsUrl;
        link.rel = 'stylesheet';
        document.head.appendChild(link);

        return () => {
            clearTimeout(timer);
            // Optional: remove font link on cleanup? Usually better to keep it cached.
            document.head.removeChild(link);
        };
    }, []);

    // Physics initialization
    useEffect(() => {
        if (!isReady || !containerRef.current) return;

        const { Engine, Runner, World, Bodies, Mouse, MouseConstraint, Events } = Matter;

        const engine = Engine.create({ enableSleeping: false });
        engineRef.current = engine;

        engine.world.gravity.y = config.gravityY * config.gravityStrength;
        engine.world.gravity.x = config.gravityX * config.gravityStrength;

        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;

        // Walls
        const wallThickness = 100;
        World.add(engine.world, [
            Bodies.rectangle(containerWidth / 2, containerHeight + wallThickness / 2, containerWidth + 200, wallThickness, { isStatic: true, friction: 0.1, restitution: config.wallBounciness, label: 'Wall' }), // Bottom
            Bodies.rectangle(-wallThickness / 2, containerHeight / 2, wallThickness, containerHeight * 2, { isStatic: true, friction: 0.1, restitution: config.wallBounciness, label: 'Wall' }), // Left
            Bodies.rectangle(containerWidth + wallThickness / 2, containerHeight / 2, wallThickness, containerHeight * 2, { isStatic: true, friction: 0.1, restitution: config.wallBounciness, label: 'Wall' }), // Right
            Bodies.rectangle(containerWidth / 2, -wallThickness / 2, containerWidth + 200, wallThickness, { isStatic: true, restitution: config.wallBounciness, label: 'Wall' }), // Top
        ]);

        // Bodies
        items.forEach((item, index) => {
            const spacing = containerWidth / (items.length + 1);
            const x = spacing * (index + 1);

            // Safer spawn logic to prevent floor clipping
            const verticalStrut = isMobile ? 40 : 80;
            const startY = isMobile ? 50 : 100;
            const calculatedY = startY + (index * verticalStrut);
            // Clamp to be inside container
            const maxY = containerHeight - item.height - 20;
            const y = Math.max(20, Math.min(calculatedY, maxY));

            const body = Bodies.rectangle(x, y, item.width, item.height, {
                angle: (Math.random() - 0.5) * 0.5,
                restitution: config.itemBounciness,
                friction: config.friction,
                frictionAir: config.frictionAir,
                label: item.id,
            });

            World.add(engine.world, body);
            bodiesMapRef.current.set(item.id, body);

            // Initialize states
            distortionMapRef.current.set(item.id, { scaleX: 1, scaleY: 1, skewX: 0, skewY: 0 });
            velocityMapRef.current.set(item.id, { scaleX: 0, scaleY: 0, skewX: 0, skewY: 0 });

            // Random initial font
            fontMapRef.current.set(item.id, Math.floor(Math.random() * fontFamilies.length));
        });

        // Runner
        const runner = Runner.create();
        runnerRef.current = runner;
        Runner.run(runner, engine);

        // Mouse
        const mouse = Mouse.create(containerRef.current);
        const mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: { stiffness: 0.2, render: { visible: false } }
        });
        World.add(engine.world, mouseConstraint);
        if (mouse.element) mouse.element.removeEventListener("wheel", (mouse as any).mousewheel);

        // Collision Event - JELLY & FONT SWAP
        Events.on(engine, "collisionStart", (event) => {
            event.pairs.forEach((pair) => {
                const bodyA = pair.bodyA;
                const bodyB = pair.bodyB;

                const speed = Matter.Vector.magnitude(
                    Matter.Vector.sub(bodyA.velocity, bodyB.velocity)
                );

                if (speed > 1.5) {
                    const impulse = Math.min(speed * 0.015, 0.2);
                    const now = Date.now();

                    // Apply JELLY Impulse & Change Font
                    [bodyA, bodyB].forEach(body => {
                        if (body.isStatic) return;

                        // Jelly Physics
                        const vel = velocityMapRef.current.get(body.label);
                        if (vel) {
                            velocityMapRef.current.set(body.label, {
                                scaleX: vel.scaleX + (Math.random() > 0.5 ? impulse : -impulse),
                                scaleY: vel.scaleY + (Math.random() > 0.5 ? impulse : -impulse),
                                skewX: vel.skewX + (Math.random() - 0.5) * impulse * 15,
                                skewY: vel.skewY + (Math.random() - 0.5) * impulse * 15,
                            });
                        }

                        // Change Font (Debounced 100ms)
                        const lastChange = lastCollisionRef.current.get(body.label) || 0;
                        if (now - lastChange > 100) {
                            const currentFont = fontMapRef.current.get(body.label) || 0;
                            // Pick random new font different from current
                            let newFont;
                            do {
                                newFont = Math.floor(Math.random() * fontFamilies.length);
                            } while (newFont === currentFont);

                            fontMapRef.current.set(body.label, newFont);
                            lastCollisionRef.current.set(body.label, now);
                        }
                    });
                }
            });
        });

        // Animation Loop
        const loop = () => {
            const stiffness = 0.1;
            const damping = 0.12;

            bodiesMapRef.current.forEach((body, id) => {
                const element = elementsRef.current.get(id);
                const item = items.find(i => i.id === id);

                if (element && item) {
                    const { x, y } = body.position;
                    const rotation = body.angle;

                    // Spring Physics Solver
                    const dist = distortionMapRef.current.get(id) || { scaleX: 1, scaleY: 1, skewX: 0, skewY: 0 };
                    const vel = velocityMapRef.current.get(id) || { scaleX: 0, scaleY: 0, skewX: 0, skewY: 0 };

                    const currentFontIndex = fontMapRef.current.get(id) || 0;

                    // Helper to solve spring dimension
                    const solve = (pos: number, target: number, vel: number) => {
                        const force = -stiffness * (pos - target);
                        const newVel = (vel + force) * (1 - damping);
                        return { pos: pos + newVel, vel: newVel };
                    };

                    const sX = solve(dist.scaleX, 1, vel.scaleX);
                    const sY = solve(dist.scaleY, 1, vel.scaleY);
                    const skX = solve(dist.skewX, 0, vel.skewX);
                    const skY = solve(dist.skewY, 0, vel.skewY);

                    // Update Refs
                    distortionMapRef.current.set(id, { scaleX: sX.pos, scaleY: sY.pos, skewX: skX.pos, skewY: skY.pos });
                    velocityMapRef.current.set(id, { scaleX: sX.vel, scaleY: sY.vel, skewX: skX.vel, skewY: skY.vel });

                    // Apply Transform & Font
                    // We target the span inside the div (first child) for font change to respect 'text-foreground'
                    const span = element.firstElementChild as HTMLElement;
                    if (span) {
                        span.style.fontFamily = fontFamilies[currentFontIndex];
                    }

                    element.style.transform = `
                        translate3d(${x - item.width / 2}px, ${y - item.height / 2}px, 0) 
                        rotate(${rotation}rad)
                        scale(${sX.pos}, ${sY.pos})
                        skew(${skX.pos}deg, ${skY.pos}deg)
                    `;
                    element.style.opacity = '1';
                }
            });
            requestRef.current = requestAnimationFrame(loop);
        };

        requestRef.current = requestAnimationFrame(loop);

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            if (runnerRef.current) Runner.stop(runnerRef.current);
            if (engineRef.current) Engine.clear(engineRef.current);
            bodiesMapRef.current.clear();
            distortionMapRef.current.clear();
            velocityMapRef.current.clear();
            fontMapRef.current.clear();
            engineRef.current = null;
            runnerRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReady, isMobile, text]);

    // Handle resize
    useEffect(() => {
        if (!isReady) return;

        const handleResize = () => {
            if (!containerRef.current || !engineRef.current) return;
            const { World, Bodies, Composite } = Matter;
            const width = containerRef.current.clientWidth;
            const height = containerRef.current.clientHeight;

            Composite.allBodies(engineRef.current.world).forEach(b => {
                if (b.label === 'Wall') World.remove(engineRef.current!.world, b);
            });

            const wallThickness = 100;
            World.add(engineRef.current.world, [
                Bodies.rectangle(width / 2, height + wallThickness / 2, width + 200, wallThickness, { isStatic: true, restitution: config.wallBounciness, label: 'Wall' }),
                Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height * 2, { isStatic: true, restitution: config.wallBounciness, label: 'Wall' }),
                Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height * 2, { isStatic: true, restitution: config.wallBounciness, label: 'Wall' }),
                Bodies.rectangle(width / 2, -wallThickness / 2, width + 200, wallThickness, { isStatic: true, restitution: config.wallBounciness, label: 'Wall' }),
            ]);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isReady, config.wallBounciness]);

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-full overflow-hidden bg-transparent ${className}`}
            style={{ touchAction: 'none' }}
        >
            {/* Letter Items */}
            {items.map((item) => (
                <div
                    key={item.id}
                    ref={(el) => setElementRef(el, item.id)}
                    className="absolute top-0 left-0 cursor-grab active:cursor-grabbing flex items-center justify-center p-4 md:p-8"
                    style={{
                        width: item.width,
                        height: item.height,
                        opacity: 0,
                        willChange: 'transform',
                        userSelect: 'none',
                    }}
                >
                    {item.content}
                </div>
            ))}

            {/* Helper Text */}
            <div className="absolute bottom-4 md:bottom-6 left-0 w-full text-center pointer-events-none">
                <p className="text-xs md:text-sm font-medium font-mono text-foreground/30 tracking-wider">GRAB & THROW</p>
            </div>
        </div>
    );
}

export default Gravity;
