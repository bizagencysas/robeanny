"use client";

import { useRef, useState, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Image as DreiImage } from "@react-three/drei";
import * as THREE from "three";
import { cloudinaryPhotos } from "@/lib/data";

interface OrbitGalleryProps {
    isPaused: boolean;
    onPhotoClick: (url: string) => void;
}

export default function OrbitGallery({ isPaused, onPhotoClick }: OrbitGalleryProps) {
    const groupRef = useRef<THREE.Group>(null);
    const { viewport } = useThree();

    // Radius of the cylinder based on screen size
    const radius = Math.max(4, viewport.width / 3);
    const photoCount = cloudinaryPhotos.length;

    const positions = useMemo(() => {
        return cloudinaryPhotos.map((_, i) => {
            const angle = (i / photoCount) * Math.PI * 2;
            const x = Math.sin(angle) * radius;
            const z = Math.cos(angle) * radius;
            // Stagger vertical positions slightly for aesthetic
            const y = (i % 3 === 0) ? 0.5 : (i % 2 === 0) ? -0.5 : 0;
            return { position: new THREE.Vector3(x, y, z), rotation: [0, angle, 0] as const };
        });
    }, [radius, photoCount]);

    useFrame((state, delta) => {
        if (groupRef.current && !isPaused) {
            // Rotate the entire cylinder
            groupRef.current.rotation.y += delta * 0.15;
        }
    });

    return (
        <group ref={groupRef}>
            {cloudinaryPhotos.map((url, i) => (
                <GalleryCard
                    key={i}
                    url={url}
                    position={positions[i].position}
                    rotation={positions[i].rotation}
                    onClick={() => onPhotoClick(url)}
                />
            ))}
        </group>
    );
}

interface GalleryCardProps {
    url: string;
    position: THREE.Vector3;
    rotation: readonly [number, number, number];
    onClick: () => void;
}

function GalleryCard({ url, position, rotation, onClick }: GalleryCardProps) {
    const ref = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    useFrame((state, delta) => {
        if (ref.current) {
            // Move slightly forward/up on hover
            const targetZ = hovered ? 1 : 0;
            const targetScale = hovered ? 1.2 : 1;

            // We animate the local z position slightly forward
            ref.current.position.z = THREE.MathUtils.lerp(ref.current.position.z, position.z + (Math.cos(rotation[1]) * targetZ), 0.1);
            ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, position.x + (Math.sin(rotation[1]) * targetZ), 0.1);

            // Animate scale
            ref.current.scale.setScalar(THREE.MathUtils.lerp(ref.current.scale.x, targetScale, 0.1));
        }
    });

    return (
        <DreiImage
            ref={ref}
            url={url}
            position={position}
            rotation={rotation}
            scale={[1.5, 2.25, 1]} // Portrait ratio
            onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
            onPointerOut={() => { setHovered(false); document.body.style.cursor = "auto"; }}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            transparent
        />
    );
}
