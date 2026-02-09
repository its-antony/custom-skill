import React, { useRef } from "react";
import { useGsapTimeline } from "../hooks/useGsapTimeline";

interface TextRevealProps {
  lines: string[];
  fontSize?: number;
  lineHeight?: number;
  color?: string;
  staggerDelay?: number;
  duration?: number;
}

/**
 * 预设1：逐行揭示
 * 文字按行从下方滑入，带 overflow hidden 遮罩裁切效果。
 */
export const TextReveal: React.FC<TextRevealProps> = ({
  lines,
  fontSize = 48,
  lineHeight = 1.4,
  color = "var(--color-primary)",
  staggerDelay = 0.15,
  duration = 0.6,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGsapTimeline((tl) => {
    if (!containerRef.current) return;
    const lineEls = containerRef.current.querySelectorAll(".reveal-line-inner");
    tl.from(lineEls, {
      y: "110%",
      opacity: 0,
      duration,
      ease: "power3.out",
      stagger: staggerDelay,
    });
  }, [lines]);

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}
    >
      {lines.map((line, i) => (
        <div
          key={i}
          style={{
            overflow: "hidden",
            lineHeight,
          }}
        >
          <div
            className="reveal-line-inner"
            style={{
              fontSize,
              fontWeight: 600,
              color,
              fontFamily: "var(--font-heading)",
              whiteSpace: "nowrap",
            }}
          >
            {line}
          </div>
        </div>
      ))}
    </div>
  );
};
