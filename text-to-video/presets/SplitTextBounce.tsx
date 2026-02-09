import React, { useRef, useMemo } from "react";
import { useGsapTimeline } from "../hooks/useGsapTimeline";

interface SplitTextBounceProps {
  text: string;
  fontSize?: number;
  color?: string;
  staggerDelay?: number;
  duration?: number;
  splitBy?: "char" | "word";
}

/**
 * 逐字/逐词弹入效果
 * 将文字拆分为独立 span，通过 GSAP stagger 实现弹性弹入。
 */
export const SplitTextBounce: React.FC<SplitTextBounceProps> = ({
  text,
  fontSize = 48,
  color = "var(--color-primary)",
  staggerDelay = 0.05,
  duration = 0.6,
  splitBy = "char",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const segments = useMemo(() => {
    if (splitBy === "word") {
      return text.split(/(\s+)/).filter((s) => s.length > 0);
    }
    return text.split("");
  }, [text, splitBy]);

  useGsapTimeline((tl) => {
    if (!containerRef.current) return;
    const spans = containerRef.current.querySelectorAll(".stb-segment");
    tl.from(spans, {
      y: 40,
      opacity: 0,
      scale: 0.8,
      duration,
      ease: "back.out(1.7)",
      stagger: staggerDelay,
    });
  }, [text, splitBy]);

  return (
    <div
      ref={containerRef}
      style={{
        fontSize,
        fontWeight: 600,
        color,
        fontFamily: "var(--font-heading)",
        lineHeight: 1.4,
        display: "flex",
        flexWrap: "wrap",
      }}
    >
      {segments.map((seg, i) => {
        const isSpace = /^\s+$/.test(seg);
        return (
          <span
            key={i}
            className={isSpace ? undefined : "stb-segment"}
            style={{
              display: "inline-block",
              whiteSpace: isSpace ? "pre" : undefined,
            }}
          >
            {seg}
          </span>
        );
      })}
    </div>
  );
};
