"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture, Html } from "@react-three/drei";
import * as THREE from "three";
import { Loader2 } from "lucide-react";

// --- Configuration Interfaces ---

export interface InfinityBrandScrollProps {
    items?: { image: string; alt?: string }[];
    speed?: number; // Base auto-scroll speed
    radius?: number; // Size of the loop
    text?: string;
    interactive?: boolean; // Whether to enable user interaction (scroll, drag, hover)
    weight?: number; // Weight of the scroll (drag resistance & momentum) - default: 3
    impact?: number; // Strength of the impact/jiggle effect - default: 1
}

// --- The 3D Scene ---

// Custom curve definition - Lemniscate of Bernoulli (Infinity Symbol)
class InfinityCurve extends THREE.Curve<THREE.Vector3> {
    scale: number;

    constructor(scale = 1) {
        super();
        this.scale = scale;
    }

    getPoint(t: number, optionalTarget = new THREE.Vector3()) {
        // Parametric equation for a 3D Lemniscate / Twisted Loop
        // t goes from 0 to 1
        const theta = t * Math.PI * 2;

        // X and Y form the figure-8
        const x = (this.scale * Math.cos(theta)) / (1 + Math.sin(theta) * Math.sin(theta));
        const y = (this.scale * Math.sin(theta) * Math.cos(theta)) / (1 + Math.sin(theta) * Math.sin(theta));
        
        // Z adds depth to make it 3D (twists it)
        const z = (this.scale * 0.5) * Math.sin(theta);

        return optionalTarget.set(x, y, z);
    }
}

// --- Reusable Scratch Vectors (Module Scope) to prevent GC ---
const UP_VECTOR = new THREE.Vector3(0, 1, 0);
const FOCUS_POS = new THREE.Vector3(0, 0, 15);
const FOCUS_EULER = new THREE.Euler(0, 0, 0);
const START_CENTER = new THREE.Vector3(0, 0, -50);
const MIN_SCALE = new THREE.Vector3(0.1, 0.1, 0.1);

const Card = ({ 
    url, 
    positionAt, 
    curve, 
    index, 
    total, 
    scrollOffset,
    hovered,
    setHovered,
    selected,
    setSelected,
    interactive = true,
    animProgress,
    expansion
}: { 
    url: string; 
    positionAt: number; 
    curve: InfinityCurve; 
    index: number; 
    total: number;
    scrollOffset: React.MutableRefObject<number>;
    hovered: number | null;
    setHovered: (i: number | null) => void;
    selected: number | null;
    setSelected: (i: number | null) => void;
    interactive?: boolean;
    animProgress: React.MutableRefObject<number>;
    expansion: React.MutableRefObject<number>;
}) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const texture = useTexture(url) as THREE.Texture;
    
    // Fix texture aspect ratio
    const img = texture.image as HTMLImageElement;
    const aspect = (img && img.width) ? img.width / img.height : 1.5;
    
    // Smooth transition state (0 = loop, 1 = focused)
    const transition = useRef(0);
    // Smooth hover state
    const hoverScale = useRef(1);

    // Instance-specific scratch objects to prevent allocation in useFrame
    const scratch = useMemo(() => ({
        point: new THREE.Vector3(),
        tangent: new THREE.Vector3(),
        loopQuaternion: new THREE.Quaternion(),
        mat: new THREE.Matrix4(),
        scaleVec: new THREE.Vector3(),
        startPoint: new THREE.Vector3(),
        startTangent: new THREE.Vector3(),
        startQuaternion: new THREE.Quaternion(),
        focusQuaternion: new THREE.Quaternion().setFromEuler(FOCUS_EULER),
        focusScale: new THREE.Vector3(),
        tempVec: new THREE.Vector3()
    }), []);

    useFrame(() => {
        if (!meshRef.current) return;

        const isSelected = selected === index;
        const targetTransition = isSelected ? 1 : 0;
        
        // Custom damp for smooth transition
        transition.current = THREE.MathUtils.lerp(transition.current, targetTransition, 0.1);

        // Hover scale smooth damp
        const targetHoverScale = (interactive && hovered === index && !isSelected) ? 1.2 : 1;
        hoverScale.current = THREE.MathUtils.lerp(hoverScale.current, targetHoverScale, 0.1);

        // 1. Plot Curve Position
        // Calculate current position on curve (0..1)
        const basePosition = index / total;
        let t = (basePosition + scrollOffset.current) % 1;
        if (t < 0) t += 1;

        // Use scratch vectors
        curve.getPoint(t, scratch.point);
        
        // --- LOCAL EXPANSION LOGIC ---
        // Apply "jiggle" expansion only to items near the front (Z > 0 roughly)
        // This makes the impact local to the user's "holding" area
        const zInfluence = THREE.MathUtils.smoothstep(scratch.point.z, -2, 5); 
        // Normalize expansion relative to curve scale to get a multiplier
        const expansionFactor = 1 + (expansion.current / curve.scale) * zInfluence;
        scratch.point.multiplyScalar(expansionFactor);
        
        // Tangent calculation
        // Note: We use original tangent which is "good enough" and stable
        const tangent = curve.getTangent(t).normalize(); 
        
        // Loop Orientation
        // scratch.mat.lookAt(eye, target, up)
        scratch.tempVec.copy(scratch.point).add(tangent);
        scratch.mat.lookAt(scratch.point, scratch.tempVec, UP_VECTOR);
        scratch.loopQuaternion.setFromRotationMatrix(scratch.mat);

        // Loop Scale
        const zNorm = (scratch.point.z + curve.scale * 0.5) / curve.scale; 
        const scaleBase = 1 + zNorm * 1.5; 
        // Apply smooth hover scale
        const loopTargetScale = scaleBase * hoverScale.current;
        const loopScale = scratch.scaleVec.set(3 * aspect, 3, 1).multiplyScalar(loopTargetScale * 0.25);



        // 2. Plot Focus Position
        // Used module constant FOCUS_POS
        
        // Fit based on viewport
        const maxH = 2.5;
        // scratch.focusScale.set(maxH * aspect, maxH, 1);
        const focusScale = scratch.focusScale.set(maxH * aspect, maxH, 1);

        // --- Arrival Animation Interpolation ---
        const p = animProgress.current; // 0..1
        // Cubic Easing for "Smooth AF" feel
        const ease = 1 - Math.pow(1 - p, 4);

        // Start (Arrival) Position & Orientation
        // Center Depth of the screen (Start far back z=-50)
        // Map t (0..1) to an angle for the start shape
        const startAngle = t * Math.PI * 2;
        
        // Form a smaller, tighter circle/string in the center depth
        scratch.startPoint.set(
            START_CENTER.x + Math.cos(startAngle) * 4, 
            START_CENTER.y + Math.sin(startAngle) * 4,
            START_CENTER.z + Math.sin(startAngle * 3) * 5
        );

        // Calculate Start Tangent for orientation
        scratch.startTangent.set(
            -Math.sin(startAngle), 
            Math.cos(startAngle), 
            Math.cos(startAngle * 3) 
        ).normalize();
        
        scratch.tempVec.copy(scratch.startPoint).add(scratch.startTangent);
        scratch.mat.lookAt(scratch.startPoint, scratch.tempVec, UP_VECTOR);
        scratch.startQuaternion.setFromRotationMatrix(scratch.mat);

        // 3. Interpolate Final Logic
        if (transition.current < 0.001) {
            // Pure Loop (with Arrival Animation)
            
            // Interpolate Position (Arrival -> Loop)
            meshRef.current.position.lerpVectors(scratch.startPoint, scratch.point, ease);
            
            // Interpolate Rotation (Arrival -> Loop)
            meshRef.current.quaternion.slerpQuaternions(scratch.startQuaternion, scratch.loopQuaternion, ease);
            
            // Interpolate Scale (Small in depth -> Normal loop size)
            meshRef.current.scale.lerpVectors(MIN_SCALE, loopScale, ease); // loopScale is scratch.scaleVec

            // Render Order: standard
            meshRef.current.renderOrder = 0;
            if (meshRef.current.material instanceof THREE.Material) {
                meshRef.current.material.depthTest = true;
                meshRef.current.material.depthWrite = true;
            }
        } else {
            // Blending or Focal (Selected State)
            
            // Position (Loop -> Focus)
            meshRef.current.position.lerpVectors(scratch.point, FOCUS_POS, transition.current);
            
            // Rotation (Loop -> Focus)
            meshRef.current.quaternion.slerpQuaternions(scratch.loopQuaternion, scratch.focusQuaternion, transition.current);
            
            // Scale (Loop -> Focus)
            meshRef.current.scale.lerpVectors(loopScale, focusScale, transition.current);

            // Z-Index / Render Order hacks
            if (transition.current > 0.1) {
                meshRef.current.renderOrder = 999;
                if (meshRef.current.material instanceof THREE.Material) {
                   meshRef.current.material.depthTest = false; 
                   meshRef.current.material.depthWrite = false;
                }
            } else {
                 // Reset to standard depth handling when close to the loop position so it sorts correctly
                 meshRef.current.renderOrder = 0;
                 if (meshRef.current.material instanceof THREE.Material) {
                    meshRef.current.material.depthTest = true; 
                    meshRef.current.material.depthWrite = true;
                 }
            }
        }
    });

    return (
        <mesh 
            ref={meshRef}
            onPointerOver={(e) => { 
                if (!interactive) return;
                e.stopPropagation(); 
                setHovered(index); 
                document.body.style.cursor = 'pointer'; 
            }}
            onPointerOut={() => { 
                if (!interactive) return;
                setHovered(null); 
                document.body.style.cursor = 'auto'; 
            }}
            onClick={(e) => {
                if (!interactive) return;
                e.stopPropagation();
                // Toggle selection
                setSelected(selected === index ? null : index);
            }}
        >
            <planeGeometry args={[1, 1, 32, 32]} />
            <meshBasicMaterial 
                map={texture} 
                side={THREE.DoubleSide} 
                transparent 
            />
        </mesh>
    );
};

const Scene = ({ items, baseSpeed, radius, interactive = true, weight = 3, impact = 1 }: { items: { image: string }[], baseSpeed: number, radius: number, interactive?: boolean, weight?: number, impact?: number }) => {
    const curve = useMemo(() => new InfinityCurve(radius), [radius]);
    const scrollOffset = useRef(0);
    const scrollVelocity = useRef(baseSpeed);
    const targetVelocity = useRef(baseSpeed);
    const [hovered, setHovered] = useState<number | null>(null);
    const [selected, setSelected] = useState<number | null>(null);

    // Interaction state
    const isDragging = useRef(false);
    const previousPointer = useRef(0);

    // NEW: Smooth Dragging refs
    const scrollTarget = useRef(0);
    const lastScrollOffset = useRef(0);

    // Friction / Expansion physics
    const expansion = useRef(0); // Current expansion amount
    const expansionVelocity = useRef(0); // For spring physics

    // Arrival animation ref (0 to 1) 
    const animProgress = useRef(0);

    // Precalculate physics properties based on weight
    // Base values (weight=1):
    // Damping: 0.08 (fast)
    // Sensitivity: 0.0015 (fast)
    // Momentum Friction: 0.05 (stops quickly)
    
    // Adjusted for better default feel
    const dragDamping = useMemo(() => 0.08 / Math.max(weight * 0.5, 0.1), [weight]);
    const sensitivity = useMemo(() => 0.0012 / Math.max(weight * 0.5, 0.1), [weight]);
    const friction = useMemo(() => 0.05 / Math.max(weight * 0.8, 0.1), [weight]);

    useFrame((state, delta) => {
        // Prepare for arrival animation - prevent frame skip on first render
        // Cap delta to 0.1s (10FPS) to prevent huge jumps from shader compilation stutter
        const dt = Math.min(delta, 0.1);

        // Animate arrival: Linear increment with eased usage
        if (animProgress.current < 1) {
             // 0.8 speed = ~1.25s duration
             animProgress.current += dt * 0.5; 
             if (animProgress.current > 1) animProgress.current = 1;
        }

        // --- Expansion / Jiggle Physics ---
        // Target expansion is based on current scroll velocity
        // The faster we scroll, the wider the loop gets
        // Multiplied by impact factor
        const speed = Math.abs(scrollVelocity.current);
        const targetExpansion = Math.min(speed * 3 * impact, 5 * impact); 

        // Spring physics for expansion (Hooke's Law with Damping)
        // F = -k*x - c*v
        const k = 80; // Stiffness (higher = snappier jiggle)
        const c = 8; // Damping (lower = more wobble/bouncier stop)
        
        const force = (targetExpansion - expansion.current) * k - expansionVelocity.current * c;
        expansionVelocity.current += force * dt;
        expansion.current += expansionVelocity.current * dt;

        // Apply updated radius to the curve
        // This dynamically changes the loop size based on velocity!
        // curve.scale = radius + expansion.current; // REMOVED GLOBAL SCALING


        if (isDragging.current) {
            // "Weighted" Drag Logic
            // Instead of direct manipulation, we lerp towards the target
            // This gives it a "heavy" feel and smooths out mouse jitter
            scrollOffset.current = THREE.MathUtils.lerp(scrollOffset.current, scrollTarget.current, dragDamping);

            // Calculate velocity based on actual movement for momentum release
            // Original logic used: scrollOffset.current += scrollVelocity.current * dt * 0.1;
            // So Velocity = (Change / dt) * 10
            const change = scrollOffset.current - lastScrollOffset.current;
            if (dt > 0.001) {
                // Smooth velocity calculation to prevent spikes
                const instantVelocity = (change / dt) * 10;
                scrollVelocity.current = THREE.MathUtils.lerp(scrollVelocity.current, instantVelocity, 0.5);
            }
            targetVelocity.current = baseSpeed; // Reset target for when we release
            
        } else {
            // Smoothly interpolate velocity back to baseSpeed (or slowed speed if hovered)
            scrollVelocity.current = THREE.MathUtils.lerp(scrollVelocity.current, targetVelocity.current, friction);
            
            // Apply velocity to offset
            scrollOffset.current += scrollVelocity.current * dt * 0.1;

            // Determine target speed based on hover state (slow down if hovered)
            // If not interactive, always use baseSpeed (no hover slowdown)
            const destinationSpeed = (interactive && hovered !== null) ? baseSpeed * 0.05 : baseSpeed;

            // Reset target velocity if not interacting (simple auto-scroll resume)
            if (Math.abs(targetVelocity.current - destinationSpeed) > 0.001) {
                targetVelocity.current = THREE.MathUtils.lerp(targetVelocity.current, destinationSpeed, 0.02);
            } else {
                targetVelocity.current = destinationSpeed;
            }
        }
        
        lastScrollOffset.current = scrollOffset.current;
    });

    const { gl } = useThree();
    
    // Wheel + Drag handling
    useEffect(() => {
        if (!interactive) return;

        const canvas = gl.domElement;

        const handleWheel = (e: WheelEvent) => {
            // Add momentum
            const speed = e.deltaY * 0.0005;
            scrollVelocity.current += speed;
            targetVelocity.current = baseSpeed + speed * 2; // temporary boost
        };

        const handlePointerDown = (e: PointerEvent) => {
            isDragging.current = true;
            previousPointer.current = e.clientX;
            
            // Sync target so we don't jump
            scrollTarget.current = scrollOffset.current;
        };

        const handlePointerMove = (e: PointerEvent) => {
            if (!isDragging.current) return;
            const deltaX = e.clientX - previousPointer.current;
            previousPointer.current = e.clientX;
            
            // Move TARGET, not offset directly
            // Increased sensitivity slightly to compensate for the lerp feel
            scrollTarget.current -= deltaX * sensitivity; 
        };

        const handlePointerUp = () => {
            isDragging.current = false;
        };

        canvas.addEventListener('wheel', handleWheel, { passive: false });
        canvas.addEventListener('pointerdown', handlePointerDown);
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
        
        return () => {
            canvas.removeEventListener('wheel', handleWheel);
            canvas.removeEventListener('pointerdown', handlePointerDown);
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [gl, baseSpeed, interactive]);

    return (
        <group>
             {/* Visual Guide Line (Optional, cool style) */}
            {/* <mesh>
                <tubeGeometry args={[curve, 100, 0.05, 8, true]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.1} wireframe={false} />
            </mesh> */}

            {items.map((item, i) => (
                <Card 
                    key={i} 
                    url={item.image} 
                    index={i}
                    total={items.length}
                    curve={curve}
                    positionAt={i / items.length}
                    scrollOffset={scrollOffset}
                    hovered={hovered}
                    setHovered={setHovered}
                    selected={selected}
                    setSelected={setSelected}
                    interactive={interactive}
                    animProgress={animProgress}
                    expansion={expansion}
                />
            ))}
        </group>
    );
};

// --- Main Component ---

const defaultImages = [
    { image: "/desktop/chainsaw-man-the-5120x2880-23013.jpg" },
    { image: "/desktop/dandadan-evil-eye-5120x2880-22717.jpg" },
    { image: "/desktop/demon-slayer-3840x2160-23615.jpg" },
    { image: "/desktop/gachiakuta-3840x2160-22842.jpg" },
    { image: "/desktop/jujutsu-kaisen-3840x2160-19746.jpg" },
    { image: "/desktop/kaiju-no-8-mission-7680x4320-21963.jpg" },
    { image: "/desktop/one-piece-season-15-3840x2160-22064.jpg" },
    { image: "/desktop/sakamoto-days-5120x2880-23913.jpg" },
    { image: "/desktop/solo-leveling-3840x2160-20374.png" },
    { image: "/desktop/spy-x-family-season-5120x2880-24443.png" },
    { image: "/desktop/to-be-hero-x-anime-3840x2160-22645.jpg" },
    { image: "/24/chainsaw-man-the-5120x2880-23013.jpg" },
    { image: "/24/demon-slayer-3840x2160-23615.jpg" },
    { image: "/24/jujutsu kaisen.jpg" },
    { image: "/24/onepiece.jpg" },
    // Duplicate set to fill the loop
    { image: "/desktop/chainsaw-man-the-5120x2880-23013.jpg" },
    { image: "/desktop/dandadan-evil-eye-5120x2880-22717.jpg" },
    { image: "/desktop/demon-slayer-3840x2160-23615.jpg" },
    { image: "/desktop/gachiakuta-3840x2160-22842.jpg" },
    { image: "/desktop/jujutsu-kaisen-3840x2160-19746.jpg" },
    { image: "/desktop/kaiju-no-8-mission-7680x4320-21963.jpg" },
    { image: "/desktop/one-piece-season-15-3840x2160-22064.jpg" },
    { image: "/desktop/sakamoto-days-5120x2880-23913.jpg" },
    { image: "/desktop/solo-leveling-3840x2160-20374.png" },
    { image: "/desktop/spy-x-family-season-5120x2880-24443.png" },
    { image: "/desktop/to-be-hero-x-anime-3840x2160-22645.jpg" },
    { image: "/24/chainsaw-man-the-5120x2880-23013.jpg" },
    { image: "/24/demon-slayer-3840x2160-23615.jpg" },
    { image: "/24/jujutsu kaisen.jpg" },
    { image: "/24/onepiece.jpg" },
    // One more set for good measure
    { image: "/desktop/chainsaw-man-the-5120x2880-23013.jpg" },
    { image: "/desktop/dandadan-evil-eye-5120x2880-22717.jpg" },
    { image: "/desktop/demon-slayer-3840x2160-23615.jpg" },
    { image: "/desktop/gachiakuta-3840x2160-22842.jpg" },
    { image: "/desktop/jujutsu-kaisen-3840x2160-19746.jpg" },
    { image: "/desktop/kaiju-no-8-mission-7680x4320-21963.jpg" },
    { image: "/desktop/one-piece-season-15-3840x2160-22064.jpg" },
    { image: "/desktop/sakamoto-days-5120x2880-23913.jpg" },
    { image: "/desktop/solo-leveling-3840x2160-20374.png" },
    { image: "/desktop/spy-x-family-season-5120x2880-24443.png" },
];

function SuspenseLoader() {
    return (
        <Html center>
            <div className="flex flex-col items-center justify-center text-foreground bg-background/80 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-xl animate-in fade-in zoom-in duration-300 pointer-events-none select-none">
                <Loader2 className="w-8 h-8 animate-spin mb-2 text-primary" />
                <span className="text-xs font-mono uppercase tracking-widest opacity-70">Loading Assets...</span>
            </div>
        </Html>
    );
}


export function InfinityBrandScroll({ 
    items = defaultImages, 
    speed = 0.5, 
    radius = 8,
    interactive = true,
    text,
    weight = 5, // Default weight
    impact = 1 // Default impact
}: InfinityBrandScrollProps) {
    return (
        <div className="w-full h-full relative overflow-hidden">
            {/* Background Text Removed */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                 {/* <h1 className="text-[15vw] font-black text-foreground/5 tracking-tighter leading-none">
                    {text}
                 </h1> */}
            </div>

            <Canvas 
                camera={{ position: [0, 0, 22], fov: 35 }}
                gl={{ antialias: true, alpha: true }}
                dpr={[1, 1.5]} // Optimization for varying screens
            >
                {/* <color attach="background" args={["#09090b"]} /> */}
                {/* <fog attach="fog" args={["#09090b", 15, 30]} /> */}
                
                <React.Suspense fallback={<SuspenseLoader />}>
                    <Scene items={items} baseSpeed={speed} radius={radius} interactive={interactive} weight={weight} impact={impact} />
                </React.Suspense>
            </Canvas>

            {/* Overlay UI */}
             {interactive && (
                <div className="absolute bottom-10 left-10 pointer-events-none">
                    <span className="text-xs font-mono text-foreground/40 uppercase tracking-widest">
                        Scroll / Drag to navigate
                    </span>
                </div>
             )}
        </div>
    );
}

export default InfinityBrandScroll;
