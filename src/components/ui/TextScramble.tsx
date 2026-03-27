"use client";

import { useEffect, useRef, useState } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";

interface TextScrambleProps {
  text: string;
  className?: string;
  delay?: number;
  speed?: number;
}

/**
 * Text that starts as the final text (SSR-safe), then scrambles on mount
 * and decodes back. This avoids hydration mismatch by starting with
 * the real text and only scrambling after mount.
 */
export default function TextScramble({
  text,
  className = "",
  delay = 1200,
  speed = 40,
}: TextScrambleProps) {
  // Start with the actual text (SSR-safe, no hydration mismatch)
  const [displayText, setDisplayText] = useState(text);
  const [mounted, setMounted] = useState(false);
  const resolvedRef = useRef(new Set<number>());

  // Mark as mounted after first render (client only)
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Phase 1: After mount, scramble the text
    const scrambled = text
      .split("")
      .map((c) => (c === " " ? " " : CHARS[Math.floor(Math.random() * CHARS.length)]))
      .join("");
    setDisplayText(scrambled);

    // Phase 2: After delay, decode back to real text
    const timer = setTimeout(() => {
      resolvedRef.current = new Set<number>();
      const interval = setInterval(() => {
        const charsToResolve = Math.ceil(text.length / 20);
        for (let i = 0; i < charsToResolve; i++) {
          const unresolvedIndices = text
            .split("")
            .map((_, idx) => idx)
            .filter((idx) => !resolvedRef.current.has(idx) && text[idx] !== " ");

          if (unresolvedIndices.length > 0) {
            const randomIdx =
              unresolvedIndices[Math.floor(Math.random() * unresolvedIndices.length)];
            resolvedRef.current.add(randomIdx);
          }
        }

        const newText = text
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            if (resolvedRef.current.has(i)) return char;
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("");

        setDisplayText(newText);

        if (resolvedRef.current.size >= text.replace(/ /g, "").length) {
          setDisplayText(text);
          clearInterval(interval);
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [mounted, text, speed, delay]);

  return <span className={className}>{displayText}</span>;
}
