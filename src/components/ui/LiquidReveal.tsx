"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

// ============================================
// SHADERS
// ============================================

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float uTime;
uniform float uProgress; // 0.0 (distorted) -> 1.0 (clear)
uniform sampler2D uTexture;
varying vec2 vUv;

void main() {
    vec2 uv = vUv;
    
    // Smooth transition
    float smoothProgress = smoothstep(0.0, 1.0, uProgress);
    float distortion = 1.0 - smoothProgress;
    
    // CURVED 45 DEGREE PATTERN
    // We bend the diagonal lines by adding a low-frequency sine wave
    
    float freq = 60.0;
    float amp = 0.3 * distortion; 
    
    // Calculate 45 degree projection (diagonal)
    // We warp this coordinate to create the "bend"
    // (uv.x + uv.y) is the perpendicular diagonal axis
    float bendWave = sin((uv.x + uv.y) * 2.0 + uTime * 1.0) * 0.3;
    float diagonal = (uv.x - uv.y) + bendWave;
    
    // Main wave oscillation along the bent diagonal
    float wave = sin(diagonal * freq + uTime * 4.0);
    
    // Add harmonic detail for jagged/flame look
    wave += sin(diagonal * freq * 2.1 + uTime * 7.0) * 0.4;
    
    // Displacement Vector
    // We displace along the diagonal direction vector
    vec2 dispDir = vec2(1.0, 1.0); 
    
    vec2 distortedUV = uv + dispDir * wave * amp * 0.5;
    
    // RGB Split (Chromatic Aberration along 45 degrees)
    vec2 rgbShift = dispDir * 0.05 * distortion;
    
    float r = texture2D(uTexture, distortedUV + rgbShift).r;
    float g = texture2D(uTexture, distortedUV).g;
    float b = texture2D(uTexture, distortedUV - rgbShift).b;
    
    vec3 color = vec3(r, g, b);
    
    gl_FragColor = vec4(color, 1.0);
}
`;

// ============================================
// COMPONENT
// ============================================

interface LiquidImageProps {
    imageUrl: string;
    isHovered: boolean;
    enableAnimation?: boolean;
}

const LiquidImage = ({ imageUrl, isHovered, enableAnimation = true }: LiquidImageProps) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const { viewport } = useThree();

    // Load texture
    const texture = useTexture(imageUrl);

    // Calculate scaling to "cover" the viewport
    const resizeValues = useMemo(() => {
        if (!texture || !texture.image) return { width: viewport.width, height: viewport.height };

        const screenAspect = viewport.width / viewport.height;
        const imageAspect = texture.image.width / texture.image.height;

        let scaleX = 1;
        let scaleY = 1;

        if (screenAspect > imageAspect) {
            // Screen is wider than image aspect
            scaleX = viewport.width;
            scaleY = viewport.width / imageAspect;
        } else {
            // Screen is taller than image aspect
            scaleX = viewport.height * imageAspect;
            scaleY = viewport.height;
        }

        return { width: scaleX, height: scaleY };
    }, [texture, viewport.width, viewport.height]);

    // Use LinearSRGBColorSpace to avoid "darkening" or double-gamma correction
    // when using raw shaders
    useEffect(() => {
        if (texture) {
            texture.colorSpace = THREE.LinearSRGBColorSpace;
            texture.needsUpdate = true;
        }
    }, [texture]);

    // Uniforms
    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uProgress: { value: 0 },
            uTexture: { value: texture },
        }),
        [texture]
    );

    // Ref for easy access in loop
    const hoveredRef = useRef(isHovered);
    useEffect(() => {
        hoveredRef.current = isHovered;
    }, [isHovered]);

    useFrame((state, delta) => {
        if (meshRef.current) {
            const material = meshRef.current.material as THREE.ShaderMaterial;

            // Update time
            if (enableAnimation) {
                material.uniforms.uTime.value += delta;
            }

            // Determine target progress
            const target = hoveredRef.current ? 1.0 : 0.0;

            // Smooth interpolation (Lerp)
            // Speed factor 3.0 gives a nice responsive feel
            material.uniforms.uProgress.value = THREE.MathUtils.lerp(
                material.uniforms.uProgress.value,
                target,
                delta * 3.0
            );
        }
    });

    return (
        <mesh ref={meshRef} scale={[1, 1, 1]}>
            <planeGeometry args={[resizeValues.width, resizeValues.height, 32, 32]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent={true}
            />
        </mesh>
    );
};

export const LiquidReveal = ({ config = {}, isFullScreen }: { config?: any, isFullScreen?: boolean }) => {
    const [isHovered, setIsHovered] = useState(false);
    const imageUrl = config.imageUrl || "/harri-p-L8p9qMMiCWs-unsplash.jpg";


    // Use LinearToneMapping to prevent auto-exposure darkening
    return (
        <div
            className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="absolute inset-0 z-0">
                <Canvas
                    camera={{ position: [0, 0, 5], fov: 45 }}
                    gl={{ toneMapping: THREE.NoToneMapping }}
                    dpr={[1, 2]}
                >
                    <React.Suspense fallback={null}>
                        <LiquidImage
                            key={imageUrl}
                            imageUrl={imageUrl}
                            isHovered={isHovered}
                            enableAnimation={config.enableAnimation !== false}
                        />
                    </React.Suspense>
                </Canvas>
            </div>

            <div className={`pointer-events-none relative z-10 text-white text-center px-4 transition-all duration-700 transform ${isHovered ? 'translate-y-8 opacity-0 blur-sm' : 'translate-y-0 opacity-100 blur-0'}`}>
                <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tighter mb-2 md:mb-4 mix-blend-difference drop-shadow-2xl">
                    {config.text || "reveal."}
                </h2>
                <p className="text-white/50 font-light tracking-widest text-[10px] sm:text-xs md:text-sm uppercase drop-shadow-md">
                    Hover to undistort
                </p>
            </div>
        </div>
    );
};

export default LiquidReveal;
