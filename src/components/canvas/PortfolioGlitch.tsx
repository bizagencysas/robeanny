"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Focuses on a chromatic aberration / elegant glass prism glitch effect
const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform sampler2D tDiffuse;
uniform float uHover;
uniform float uTime;
varying vec2 vUv;

// Pseudo-random generator for glitch
float rand(vec2 n) { 
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

void main() {
    vec2 uv = vUv;
    
    // Only apply effect if hovered (uHover interpolates 0 to 1)
    if (uHover > 0.0) {
        // Create vertical displacement blocks
        float blockY = floor(uv.y * 15.0);
        float offset = rand(vec2(blockY, uTime * 0.1)) * 0.04 * uHover;
        
        // Randomly shift left or right
        uv.x += (rand(vec2(blockY, 1.0)) > 0.5 ? offset : -offset);
        
        // Chromatic aberration (RGB splitting)
        float splitAmount = 0.02 * uHover;
        
        vec4 colorR = texture2D(tDiffuse, vec2(uv.x + splitAmount, uv.y));
        vec4 colorG = texture2D(tDiffuse, uv);
        vec4 colorB = texture2D(tDiffuse, vec2(uv.x - splitAmount, uv.y));
        
        // Desaturate slightly on hover for elegance
        vec3 color = vec3(colorR.r, colorG.g, colorB.b);
        float luminance = dot(color, vec3(0.299, 0.587, 0.114));
        vec3 desaturated = mix(color, vec3(luminance), 0.3);
        
        gl_FragColor = vec4(desaturated, 1.0);
    } else {
        // Default grayscale treatment for unhovered (matching V1 style but in shader)
        vec4 texColor = texture2D(tDiffuse, uv);
        float luminance = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
        // 70% grayscale
        vec3 finalColor = mix(texColor.rgb, vec3(luminance), 0.7);
        gl_FragColor = vec4(finalColor, 1.0);
    }
}
`;

interface PortfolioGlitchMaterialProps {
    textureUrl: string;
    isHovered: boolean;
}

export default function PortfolioGlitchMaterial({ textureUrl, isHovered }: PortfolioGlitchMaterialProps) {
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const [texture, setTexture] = useState<THREE.Texture | null>(null);

    useEffect(() => {
        const loader = new THREE.TextureLoader();
        loader.load(textureUrl, (tex) => {
            tex.minFilter = THREE.LinearFilter;
            tex.generateMipmaps = false;
            setTexture(tex);
        });

        return () => {
            if (texture) texture.dispose();
        }
    }, [textureUrl]);

    const uniforms = useMemo(() => ({
        tDiffuse: { value: null },
        uHover: { value: 0 },
        uTime: { value: 0 },
    }), []);

    useFrame((state, delta) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value += delta;

            // Smoothly animate the hover uniform
            const targetHover = isHovered ? 1.0 : 0.0;
            materialRef.current.uniforms.uHover.value += (targetHover - materialRef.current.uniforms.uHover.value) * 0.1;

            if (texture) {
                materialRef.current.uniforms.tDiffuse.value = texture;
            }
        }
    });

    if (!texture) return null;

    return (
        <shaderMaterial
            ref={materialRef}
            fragmentShader={fragmentShader}
            vertexShader={vertexShader}
            uniforms={uniforms}
            transparent={true}
        />
    );
}
