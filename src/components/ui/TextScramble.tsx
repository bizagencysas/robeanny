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
 * Text that starts as random characters and "decodes" into the final text.
 * Like a hacker/cipher effect.
 */
export default function TextScramble({
  text,
  className = "",
  delay = 1200,
  speed = 40,
}: TextScrambleProps) {
  const [displayText, setDisplayText] = useState("");
  const [started, setStarted] = useState(false);
  const resolvedRef = useRef(new Set<number>());

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!started) {
      // Show scrambled text before start
      setDisplayText(
        text
          .split("")
          .map((c) => (c === " " ? " " : CHARS[Math.floor(Math.random() * CHARS.length)]))
          .join("")
      );
      return;
    }

    resolvedRef.current = new Set<number>();
    let frame = 0;

    const interval = setInterval(() => {
      frame++;

      // Resolve ~1-2 characters per frame
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
  }, [started, text, speed]);

  return <span className={className}>{displayText}</span>;
}
