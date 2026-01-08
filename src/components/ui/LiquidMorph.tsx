"use client";

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, Environment, Float, Center } from '@react-three/drei';
import * as THREE from 'three';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface LiquidMorphConfig {
    color: string;
    radius: number;
    distort: number;
    speed: number;
    metalness: number;
    roughness: number;
    intensity: number;
}

export interface LiquidMorphProps {
    config?: Partial<LiquidMorphConfig>;
    className?: string;
    autoRotate?: boolean; // If true, adds subtle rotation
    static?: boolean; // If true, disables all animations for preview mode
    isFullScreen?: boolean; // If true, adapts to fill the fullscreen viewport
}

// ============================================
// DEFAULT CONFIG
// ============================================

const defaultConfig: LiquidMorphConfig = {
    color: "#ffffff",
    radius: 1,
    distort: 0.5,
    speed: 2,
    metalness: 0.9,
    roughness: 0.1,
    intensity: 1,
};

// ============================================
// BLOB COMPONENT
// ============================================

// ============================================
// TEXTURE HOOK
// ============================================

function useStripedPattern() {
    return useMemo(() => {
        if (typeof document === 'undefined') return null;

        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        // Dark background for contrast
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, 1024, 1024);

        // Glowing Pattern
        // We create a gradient for the glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ffffff';
        ctx.fillStyle = '#ffffff';

        // Horizontal lines only
        const lineCount = 60;
        const spacing = 1024 / lineCount;

        for (let i = 0; i < lineCount; i++) {
            const y = i * spacing + spacing / 2;
            // Draw thin bright line
            ctx.fillRect(0, y, 1024, 1);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);

        return texture;
    }, []);
}

function Blob({ config, autoRotate, isStatic, isFullScreen }: { config: LiquidMorphConfig; autoRotate: boolean; isStatic: boolean; isFullScreen: boolean }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<any>(null);
    const texture = useStripedPattern();

    useFrame((state) => {
        if (!meshRef.current || !materialRef.current || isStatic) return;

        // Subtle rotation if autoRotate is true or always to make it look alive
        if (autoRotate) {
            meshRef.current.rotation.y += 0.005;
            meshRef.current.rotation.x += 0.002;
        }
    });

    // Keep sphere scale consistent - camera adjustment handles fullscreen sizing
    const sphereScale = 1.5;

    const sphereContent = (
        <Sphere args={[config.radius, 64, 64]} ref={meshRef} scale={sphereScale}>
            <MeshDistortMaterial
                ref={materialRef}
                map={texture}
                color={config.color}
                envMapIntensity={0}
                clearcoat={0}
                clearcoatRoughness={0.1}
                metalness={0.2}
                roughness={0.2}
                distort={isStatic ? config.distort : config.distort}
                speed={isStatic ? 0 : config.speed}
            />
        </Sphere>
    );

    // If static mode, skip Float animation wrapper
    if (isStatic) {
        return sphereContent;
    }

    return (
        <Float
            speed={2} // Animation speed
            rotationIntensity={1} // XYZ rotation intensity
            floatIntensity={2} // Up/down float intensity
        >
            {sphereContent}
        </Float>
    );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function LiquidMorph({
    config: userConfig,
    className = "",
    autoRotate = true,
    static: isStatic = false,
    isFullScreen = false
}: LiquidMorphProps) {
    const config = useMemo(() => ({ ...defaultConfig, ...userConfig }), [userConfig]);

    // Camera position: closer in fullscreen mode for better viewport fill
    const cameraZ = isFullScreen ? 3.2 : 4;

    return (
        <div className={`w-full h-full relative ${className}`} style={{ minHeight: '100%' }}>
            <Canvas
                key={`canvas-${isFullScreen}`}
                camera={{ position: [0, 0, cameraZ], fov: 45 }}
                dpr={[1, 2]}
                gl={{ antialias: true, alpha: true }}
                frameloop={isStatic ? 'demand' : 'always'}
                style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
            >
                <ambientLight intensity={3} />

                <Center>
                    <Blob config={config} autoRotate={autoRotate} isStatic={isStatic} isFullScreen={isFullScreen} />
                </Center>

                {/* Environment for reflections - iridescence from colorful environment */}

            </Canvas>
        </div>
    );
}

// ============================================
// PREVIEW COMPONENT
// ============================================

export function LiquidMorphPreview() {
    // Real 3D component but with animations disabled for performance
    return (
        <LiquidMorph
            config={{
                distort: 0.6,
                speed: 0, // No distortion animation
                color: "#e2e8f0", // silvery white
                radius: 1,
            }}
            className="w-full h-full"
            autoRotate={false}
            static={true}
        />
    );
}

export default LiquidMorph;
