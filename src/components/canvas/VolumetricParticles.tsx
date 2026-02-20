"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const vertexShader = `
uniform float uTime;
varying vec3 vColor;

void main() {
    // Subtle floaty movement
    vec3 pos = position;
    pos.x += sin(uTime * 0.2 + position.z) * 10.0;
    pos.y += cos(uTime * 0.15 + position.x) * 10.0;
    
    // Closer particles are slightly brighter white/gold
    float depth = (pos.z + 1000.0) / 2000.0;
    vColor = mix(vec3(0.5, 0.45, 0.3), vec3(1.0, 1.0, 1.0), depth);
    
    // Point size depends on depth
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = (400.0 / -mvPosition.z) * (1.0 + sin(uTime + position.x)*0.3); // Twinkle
    gl_Position = projectionMatrix * mvPosition;
}
`;

const fragmentShader = `
varying vec3 vColor;

void main() {
    // Soft circular particle
    vec2 pos = gl_PointCoord - vec2(0.5);
    float dist = length(pos);
    if (dist > 0.5) discard;
    
    // Soft edge
    float alpha = (1.0 - (dist * 2.0)) * 0.4; // max 40% opacity
    
    gl_FragColor = vec4(vColor, alpha);
}
`;

export default function VolumetricParticles({ count = 2000, radius = 1000 }) {
    const pointsRef = useRef<THREE.Points>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    const particles = useMemo(() => {
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            // Spherical distribution
            const u = Math.random();
            const v = Math.random();
            const theta = u * 2.0 * Math.PI;
            const phi = Math.acos(2.0 * v - 1.0);
            const r = Math.cbrt(Math.random()) * radius;

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta); // x
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta); // y
            positions[i * 3 + 2] = r * Math.cos(phi); // z
        }

        return positions;
    }, [count, radius]);

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
    }), []);

    useFrame((state, delta) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value += delta;
        }
        if (pointsRef.current) {
            // Whole field rotates very slowly
            pointsRef.current.rotation.y += delta * 0.02;
            pointsRef.current.rotation.x += delta * 0.01;
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particles.length / 3}
                    array={particles}
                    itemSize={3}
                />
            </bufferGeometry>
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}
