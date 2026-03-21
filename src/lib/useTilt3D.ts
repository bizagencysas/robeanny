"use client";

import { RefObject, useEffect } from "react";

type TiltOptions = {
  maxRotateX?: number;
  maxRotateY?: number;
  scale?: number;
  idleDrift?: boolean;
  mobileDrift?: boolean;
};

export function useTilt3D(
  ref: RefObject<HTMLElement>,
  {
    maxRotateX = 5,
    maxRotateY = 6,
    scale = 1.008,
    idleDrift = true,
    mobileDrift = true,
  }: TiltOptions = {}
) {
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const isCoarsePointer = window.matchMedia("(hover: none), (pointer: coarse)").matches;

    let raf = 0;
    let driftRaf = 0;
    let driftTime = 0;
    let interacting = false;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const render = () => {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;

      element.style.setProperty("--tilt-rx", `${currentX.toFixed(2)}deg`);
      element.style.setProperty("--tilt-ry", `${currentY.toFixed(2)}deg`);
      element.style.setProperty("--tilt-scale", `${scale}`);

      if (Math.abs(targetX - currentX) > 0.01 || Math.abs(targetY - currentY) > 0.01) {
        raf = window.requestAnimationFrame(render);
      } else {
        raf = 0;
      }
    };

    const queueRender = () => {
      if (!raf) raf = window.requestAnimationFrame(render);
    };

    const setTiltFromPoint = (clientX: number, clientY: number) => {
      const bounds = element.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;

      const normalizedX = ((clientX - bounds.left) / bounds.width) * 2 - 1;
      const normalizedY = ((clientY - bounds.top) / bounds.height) * 2 - 1;

      targetX = normalizedY * -maxRotateX;
      targetY = normalizedX * maxRotateY;
      queueRender();
    };

    const handlePointerMove = (event: PointerEvent) => {
      interacting = true;
      setTiltFromPoint(event.clientX, event.clientY);
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!event.touches.length) return;
      interacting = true;
      setTiltFromPoint(event.touches[0].clientX, event.touches[0].clientY);
    };

    const resetTilt = () => {
      interacting = false;
      targetX = 0;
      targetY = 0;
      queueRender();
    };

    const startDrift = () => {
      const shouldDrift = idleDrift ?? mobileDrift;
      if (!shouldDrift) return;

      const driftFactor = isCoarsePointer ? 0.72 : 0.56;

      const animateDrift = (time: number) => {
        if (!interacting) {
          driftTime = time;
          targetX = Math.sin(driftTime / 1450) * (maxRotateX * driftFactor);
          targetY = Math.cos(driftTime / 1950) * (maxRotateY * driftFactor);
          queueRender();
        }
        driftRaf = window.requestAnimationFrame(animateDrift);
      };

      driftRaf = window.requestAnimationFrame(animateDrift);
    };

    startDrift();
    element.addEventListener("pointermove", handlePointerMove);
    element.addEventListener("pointerleave", resetTilt);
    element.addEventListener("touchmove", handleTouchMove, { passive: true });
    element.addEventListener("touchend", resetTilt, { passive: true });
    element.addEventListener("touchcancel", resetTilt, { passive: true });

    return () => {
      element.removeEventListener("pointermove", handlePointerMove);
      element.removeEventListener("pointerleave", resetTilt);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", resetTilt);
      element.removeEventListener("touchcancel", resetTilt);
      if (raf) window.cancelAnimationFrame(raf);
      if (driftRaf) window.cancelAnimationFrame(driftRaf);
    };
  }, [ref, maxRotateX, maxRotateY, scale, idleDrift, mobileDrift]);
}
