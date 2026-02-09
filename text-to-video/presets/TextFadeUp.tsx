import React, { useRef } from "react";
import { useGsapTimeline } from "../hooks/useGsapTimeline";

interface TextFadeUpProps {
  text: string;
  fontSize?: number;
  color?: string;
  delay?: number;
  duration?: number;
}

/**
 * 文字淡入上移
 * 最基础的入场动画：从下方淡入并上移到位。
 */
export const TextFadeUp: React.FC<TextFadeUpProps> = ({
  text,
  fontSize = 48,
  color = "var(--color-primary)",
  delay = 0,
  duration = 0.7,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGsapTimeline((tl) => {
    if (!containerRef.current) return;
    tl.from(
      containerRef.current,
      {
        y: 30,
        opacity: 0,
        duration,
        ease: "power2.out",
      },
      delay
    );
  }, [text]);

  return (
    <div
      ref={containerRef}
      style={{
        fontSize,
        fontWeight: 600,
        color,
        fontFamily: "var(--font-heading)",
        lineHeight: 1.4,
      }}
    >
      {text}
    </div>
  );
};
