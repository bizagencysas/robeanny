"use client";

import { useEffect, useRef } from "react";

export default function Particles() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];

        // Responsive canvas
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener("resize", resize);
        resize();

        class Particle {
            x: number;
            y: number;
            size: number;
            speedY: number;
            opacity: number;

            constructor() {
                this.x = Math.random() * canvas!.width;
                // Start from below the screen or random y initially, to stagger them
                this.y = Math.random() * canvas!.height + canvas!.height * 0.5;
                this.size = Math.random() * 2 + 1; // 1 to 3 px
                this.speedY = Math.random() * 0.5 + 0.1; // slow upward movement
                this.opacity = Math.random() * 0.3 + 0.1;
            }

            update() {
                this.y -= this.speedY;

                // Reset if it goes off top
                if (this.y < -10) {
                    this.y = canvas!.height + 10;
                    this.x = Math.random() * canvas!.width;
                }
            }

            draw() {
                if (!ctx) return;
                ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }
        }

        // Init up to 40 particles
        const init = () => {
            particles = [];
            for (let i = 0; i < 40; i++) {
                particles.push(new Particle());
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        init();
        animate();

        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 w-full h-full pointer-events-none z-0"
        />
    );
}
