import React, { useRef } from "react";
import { useGsapTimeline } from "../hooks/useGsapTimeline";

interface TextHighlightProps {
  text: string;
  fontSize?: number;
  color?: string;
  highlightColor?: string;
  duration?: number;
  delay?: number;
}

/**
 * 荧光笔高亮标记效果
 * 文字正常显示，背后色块从左到右展开，模拟荧光笔标记。
 * 色块高度约文字的 40%，定位在底部。
 */
export const TextHighlight: React.FC<TextHighlightProps> = ({
  text,
  fontSize = 48,
  color = "var(--color-primary)",
  highlightColor = "rgba(74, 158, 255, 0.25)",
  duration = 0.6,
  delay = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGsapTimeline((tl) => {
    if (!containerRef.current) return;
    const highlight = containerRef.current.querySelector(".th-highlight");
    if (!highlight) return;

    // 文字先淡入
    tl.from(
      containerRef.current,
      {
        opacity: 0,
        duration: 0.3,
        ease: "power2.out",
      },
      delay
    );

    // 荧光笔色块展开
    tl.from(
      highlight,
      {
        scaleX: 0,
        duration,
        ease: "power2.out",
      },
      delay + 0.15
    );
  }, [text]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        display: "inline-block",
      }}
    >
      {/* 荧光笔色块 */}
      <div
        className="th-highlight"
        style={{
          position: "absolute",
          left: -4,
          right: -4,
          bottom: "0.1em",
          height: "40%",
          backgroundColor: highlightColor,
          borderRadius: 2,
          transformOrigin: "left center",
        }}
      />

      {/* 文字层 */}
      <span
        style={{
          position: "relative",
          fontSize,
          fontWeight: 600,
          color,
          fontFamily: "var(--font-heading)",
          lineHeight: 1.4,
        }}
      >
        {text}
      </span>
    </div>
  );
};
