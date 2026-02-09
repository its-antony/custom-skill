import React, { useRef } from "react";
import { useGsapTimeline } from "../hooks/useGsapTimeline";

interface TextColorFillProps {
  text: string;
  fontSize?: number;
  fillColor?: string;
  baseColor?: string;
  duration?: number;
}

/**
 * 文字颜色填充
 * 文字先以半透明底色显示，然后从左到右用 clip-path 揭示彩色版本。
 * 两层文字叠加：底层(baseColor) + 上层(fillColor, clip-path 动画)。
 */
export const TextColorFill: React.FC<TextColorFillProps> = ({
  text,
  fontSize = 48,
  fillColor = "var(--color-primary)",
  baseColor = "rgba(255, 255, 255, 0.2)",
  duration = 1.0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGsapTimeline((tl) => {
    if (!containerRef.current) return;
    const fillLayer = containerRef.current.querySelector(".tcf-fill");
    if (!fillLayer) return;
    tl.fromTo(
      fillLayer,
      { clipPath: "inset(0 100% 0 0)" },
      {
        clipPath: "inset(0 0% 0 0)",
        duration,
        ease: "power2.inOut",
      }
    );
  }, [text]);

  const sharedStyle: React.CSSProperties = {
    fontSize,
    fontWeight: 700,
    fontFamily: "var(--font-heading)",
    lineHeight: 1.4,
    whiteSpace: "pre-wrap",
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        display: "inline-block",
      }}
    >
      {/* 底层：半透明基础色文字 */}
      <div style={{ ...sharedStyle, color: baseColor }}>{text}</div>

      {/* 上层：彩色文字，clip-path 从左到右揭示 */}
      <div
        className="tcf-fill"
        style={{
          ...sharedStyle,
          color: fillColor,
          position: "absolute",
          top: 0,
          left: 0,
          clipPath: "inset(0 100% 0 0)",
        }}
      >
        {text}
      </div>
    </div>
  );
};
