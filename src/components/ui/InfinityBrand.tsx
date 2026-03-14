"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture, Environment, Float } from "@react-three/drei";
import * as THREE from "three";

export interface InfinityBrandProps {
    images?: string[];
    speed?: number;
    rotationSpeed?: number;
    scaleVar?: number; // How much size varies
    radius?: number; // Size of the whole loop
}

const defaultImages = [
    "/desktop/chainsaw-man-the-5120x2880-23013.jpg",
    "/desktop/dandadan-evil-eye-5120x2880-22717.jpg",
    "/desktop/demon-slayer-3840x2160-23615.jpg",
    "/desktop/gachiakuta-3840x2160-22842.jpg",
    "/desktop/jujutsu-kaisen-3840x2160-19746.jpg",
    "/desktop/kaiju-no-8-mission-7680x4320-21963.jpg",
    "/desktop/one-piece-season-15-3840x2160-22064.jpg",
    "/desktop/sakamoto-days-5120x2880-23913.jpg",
    "/desktop/solo-leveling-3840x2160-20374.png",
    "/desktop/spy-x-family-season-5120x2880-24443.png",
    "/desktop/to-be-hero-x-anime-3840x2160-22645.jpg",
    "/desktop/chainsaw-man-the-5120x2880-23013.jpg",
    "/desktop/dandadan-evil-eye-5120x2880-22717.jpg",
    "/desktop/demon-slayer-3840x2160-23615.jpg",
    "/desktop/gachiakuta-3840x2160-22842.jpg",
    "/desktop/jujutsu-kaisen-3840x2160-19746.jpg",
];

// The Curve Definition (A Lemniscate-like Figure 8 with depth)
class InfinityCurve extends THREE.Curve<THREE.Vector3> {
    scale: number;
    constructor(scale = 1) {
        super();
        this.scale = scale;
    }

    getPoint(t: number, optionalTarget = new THREE.Vector3()) {
        const a = this.scale;
        // Parameter t goes from 0 to 1
        const tx = t * Math.PI * 2;
        
        // Lemniscate of Bernoulli (modified for 3D)
        // x = (a * cos(t)) / (1 + sin^2(t))
        // y = (a * sin(t) * cos(t)) / (1 + sin^2(t))
        // We add a Z twist
        
        const sinT = Math.sin(tx);
        const cosT = Math.cos(tx);
        const denom = 1 + sinT * sinT;
        
        const x = (a * cosT) / denom;
        const z = (a * sinT * cosT) / denom;
        const y = (a * 0.5 * sinT); // Height variation

        return optionalTarget.set(x, y, z);
    }
}

function Card({ url, index, total, scrollOffset, curve, scaleVar }: { url: string, index: number, total: number, scrollOffset: React.MutableRefObject<number>, curve: InfinityCurve, scaleVar: number }) {
    const mesh = useRef<THREE.Mesh>(null);
    const texture = useTexture(url);
    
    // Optimize texture
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

    useFrame((state) => {
        if (!mesh.current) return;

        // Calculate position on curve based on scroll offset + index
        // The scrollOffset increases indefinitely, so we wrap it
        const spacing = 1 / total;
        // t is the position 0..1 along the curve for this specific card
        // We add the scrollOffset (which is effectively 'time' or 'distance')
        let t = (index * spacing + scrollOffset.current) % 1;
        if (t < 0) t += 1;

        // Get position and tangent at t
        const pos = curve.getPoint(t);
        const tangent = curve.getTangent(t);
        
        mesh.current.position.copy(pos);
        
        // Orientation: Look along the tangent
        // We want the card to face "outward" or "upward" relative to the curve
        // Standard lookAt aligns the +Z axis. 
        // We look at (pos + tangent) to align Z with path
        const lookAtTarget = pos.clone().add(tangent);
        mesh.current.lookAt(lookAtTarget);
        
        // Add a slight rotation so they fan out properly on curves
        // mesh.current.rotateY(Math.PI / 2); // Align plane with path (ribbon style) or perpendicular (domino style)
        // Let's try ribbon style first (flat against the curve direction?)
        // Actually, if we lookAt the tangent, the plane is perpendicular to the Path (like a tunnel cross section).
        // If we want it like a ribbon, we need to rotate 90 deg.
        mesh.current.rotateY(Math.PI / 2); 

        // Size Variation logic
        // Let's make them pulsate based on position in loop or just sin wave
        // t goes 0..1
        // Make cards larger when y is higher (closer to top of loop?) or just random wave
        const scalePhase = t * Math.PI * 4; // 2 peaks
        const baseScale = 1.2; // Base size
        const variation = Math.sin(scalePhase) * scaleVar; 
        const renderScale = baseScale + variation;
        
        mesh.current.scale.set(renderScale * 1.6, renderScale, 1); // 1.6 Aspect ratio approx
    });

    return (
        <mesh ref={mesh}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial map={texture} side={THREE.DoubleSide} transparent opacity={0.9} />
        </mesh>
    );
}

function Rig({ speed, scrollOffset }: { speed: number, scrollOffset: React.MutableRefObject<number> }) {
    // Add velocity handling for smoothness 'AF'
    const velocity = useRef(speed);
    const lastScroll = useRef(0);
    
    // We hook into the wheel event to add to velocity
    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            // e.deltaY is usually +/- 100
             // Add momentum
            velocity.current += e.deltaY * 0.0002;
        };
        
        window.addEventListener('wheel', handleWheel);
        return () => window.removeEventListener('wheel', handleWheel);
    }, []);

    useFrame((state, delta) => {
        // Decay velocity back to base speed
        // Lerp velocity to base speed
        velocity.current = THREE.MathUtils.lerp(velocity.current, speed * 0.1, 0.05); // 0.1 is base auto speed multiplier? No, wait.
        
        // Auto scroll base: 
        const autoSpeed = speed * delta * 0.1;
        
        // If velocity is high, it overrides auto speed mostly
        // Actually, let's treat velocity as "extra" speed
        // But we want it to settle to 'speed'
        
        // Let's simplify:
        // desiredVelocity is 'speed'.
        // currentVelocity is pushed by user.
        // It decays to desiredVelocity.
        
        // Apply friction to user push
        // Base movement
        scrollOffset.current += velocity.current * delta; // velocity is units per second
        
    });
    
    return null;
}

export function InfinityBrand({ 
    images = defaultImages, 
    speed = 0.2, // Base auto-scroll speed
    scaleVar = 0.3, 
    radius = 4 
}: InfinityBrandProps) {
    const scrollOffset = useRef(0);
    const curve = useMemo(() => new InfinityCurve(radius), [radius]);

    return (
        <div className="w-full h-screen relative bg-zinc-950 overflow-hidden">
            <Canvas camera={{ position: [0, 0, 12], fov: 35 }}>
                <color attach="background" args={['#09090b']} />
                <fog attach="fog" args={['#09090b', 8, 20]} />
                
                {/* Lighting to give some depth if we used StandardMaterial, but BasicMaterial is brighter for showcases */}
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                
                <group position={[0,0,0]}>
                   {images.map((img, i) => (
                       <Card 
                          key={i} 
                          url={img} 
                          index={i} 
                          total={images.length} 
                          scrollOffset={scrollOffset} 
                          curve={curve}
                          scaleVar={scaleVar}
                       />
                   ))}
                </group>

                {/* Draw the line for visual debugging or style */}
                <mesh>
                    <tubeGeometry args={[curve, 100, 0.05, 8, true]} />
                    <meshBasicMaterial color="#ffffff" transparent opacity={0.1} wireframe />
                </mesh>

                <Rig speed={speed} scrollOffset={scrollOffset} />
            </Canvas>
            
            <div className="absolute bottom-8 left-8 text-white/50 font-mono text-xs pointer-events-none">
                SCROLL TO ACCELERATE
            </div>
        </div>
    );
}
