"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform sampler2D tDiffuse;
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform float uHover;

varying vec2 vUv;

void main() {
    vec2 p = vUv;
    
    // Calculate distance to mouse
    vec2 mouseUv = uMouse;
    
    // Aspect ratio correction for the ripple
    float aspect = uResolution.x / uResolution.y;
    vec2 pAspect = vec2(p.x * aspect, p.y);
    vec2 mAspect = vec2(mouseUv.x * aspect, mouseUv.y);
    
    float dist = distance(pAspect, mAspect);
    
    // Very subtle liquid displacement
    // The force diminishes as it moves away from the mouse
    float force = max(0.0, 1.0 - dist * 2.0);
    
    // The wave calculation
    float wave = sin(dist * 10.0 - uTime * 2.0) * force * 0.015 * uHover;
    
    // Global underlying slow breathing wave
    vec2 globalWave = vec2(
        sin(p.y * 5.0 + uTime * 0.5) * 0.005,
        cos(p.x * 5.0 + uTime * 0.5) * 0.005
    );
    
    // Final distorted UV
    vec2 finalUv = p + (p - mouseUv) * wave + globalWave;
    
    // Clamp to avoid edges repeating if they distort too far
    finalUv = clamp(finalUv, 0.0, 1.0);
    
    vec4 color = texture2D(tDiffuse, finalUv);
    
    gl_FragColor = color;
}
`;

interface HeroShaderProps {
    videoUrl?: string;
    fallbackImage: string;
}

export default function HeroShader({ videoUrl, fallbackImage }: HeroShaderProps) {
    const { size, viewport } = useThree();
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    const [texture, setTexture] = useState<THREE.Texture | null>(null);
    const [isHovering, setIsHovering] = useState(false);

    // Mouse coordinates in normalized 0 to 1 UV space
    const targetMouse = useRef(new THREE.Vector2(0.5, 0.5));
    const currentMouse = useRef(new THREE.Vector2(0.5, 0.5));

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            targetMouse.current.set(
                e.clientX / window.innerWidth,
                1.0 - (e.clientY / window.innerHeight) // WebGL Y is flipped
            );
        };
        const handleMouseEnter = () => setIsHovering(true);
        const handleMouseLeave = () => setIsHovering(false);

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseenter", handleMouseEnter);
        window.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseenter", handleMouseEnter);
            window.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, []);

    // Load video or fallback texture
    useEffect(() => {
        let activeTexture: THREE.Texture;
        let video: HTMLVideoElement | null = null;

        const loadFallback = () => {
            const loader = new THREE.TextureLoader();
            loader.load(fallbackImage, (tex) => {
                tex.minFilter = THREE.LinearFilter;
                tex.magFilter = THREE.LinearFilter;
                tex.generateMipmaps = false;
                // Basic cover logic scaling in shader would be better, but we do simple cover here by aspect adjusting UV
                setTexture(tex);
            });
        };

        if (videoUrl) {
            video = document.createElement('video');
            video.src = videoUrl;
            video.crossOrigin = "anonymous";
            video.loop = true;
            video.muted = true;
            video.playsInline = true;

            video.play().then(() => {
                activeTexture = new THREE.VideoTexture(video!);
                activeTexture.minFilter = THREE.LinearFilter;
                activeTexture.magFilter = THREE.LinearFilter;
                activeTexture.generateMipmaps = false;
                setTexture(activeTexture);
            }).catch(() => {
                // Video failed to play (e.g., low power mode on iOS)
                loadFallback();
            });
        } else {
            loadFallback();
        }

        return () => {
            if (activeTexture) activeTexture.dispose();
            if (video) {
                video.pause();
                video.removeAttribute('src');
                video.load();
            }
        };
    }, [videoUrl, fallbackImage]);

    const uniforms = useMemo(
        () => ({
            tDiffuse: { value: null },
            uTime: { value: 0 },
            uMouse: { value: new THREE.Vector2(0.5, 0.5) },
            uResolution: { value: new THREE.Vector2(size.width, size.height) },
            uHover: { value: 0 },
        }),
        [size]
    );

    useFrame((state, delta) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value += delta;

            // Lerp mouse
            currentMouse.current.lerp(targetMouse.current, 0.05);
            materialRef.current.uniforms.uMouse.value.copy(currentMouse.current);

            // Lerp hover state for smooth transition of the ripple force
            const targetHover = isHovering ? 1.0 : 0.0;
            materialRef.current.uniforms.uHover.value += (targetHover - materialRef.current.uniforms.uHover.value) * 0.1;

            if (texture) {
                materialRef.current.uniforms.tDiffuse.value = texture;
            }
        }
    });

    if (!texture) return null;

    // Fill the screen exactly
    return (
        <mesh ref={meshRef}>
            <planeGeometry args={[viewport.width, viewport.height, 32, 32]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
            />
        </mesh>
    );
}
