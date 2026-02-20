"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform float uHover;
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    
    // Liquid distortion effect
    float waves = sin(uv.y * 10.0 + uTime * 2.0) * 0.05 * uHover;
    uv.x += waves;
    
    vec4 color = texture2D(uTexture, uv);
    gl_FragColor = color;
  }
`;

export default function LiquidImage({ imageUrl, isHovering }: { imageUrl: string; isHovering: boolean }) {
    const mesh = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const texture = useTexture(imageUrl);

    const uniforms = useMemo(
        () => ({
            uTexture: { value: texture },
            uHover: { value: 0 },
            uTime: { value: 0 },
        }),
        [texture]
    );

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
            // Smooth interpolation for hover state
            materialRef.current.uniforms.uHover.value = THREE.MathUtils.lerp(
                materialRef.current.uniforms.uHover.value,
                isHovering ? 1 : 0,
                0.05
            );
        }
    });

    return (
        <mesh ref={mesh}>
            <planeGeometry args={[1, 1.5, 32, 32]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent
            />
        </mesh>
    );
}
