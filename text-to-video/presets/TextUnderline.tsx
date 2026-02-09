import React, { useRef } from "react";
import { useGsapTimeline } from "../hooks/useGsapTimeline";

interface TextUnderlineProps {
  text: string;
  fontSize?: number;
  color?: string;
  lineColor?: string;
  lineWidth?: number;
  duration?: number;
  delay?: number;
}

/**
 * 下划线绘制效果
 * 文字正常显示，底部下划线从左到右绘制展开。
 */
export const TextUnderline: React.FC<TextUnderlineProps> = ({
  text,
  fontSize = 48,
  color = "var(--color-primary)",
  lineColor = "var(--color-accent)",
  lineWidth = 3,
  duration = 0.5,
  delay = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGsapTimeline((tl) => {
    if (!containerRef.current) return;
    const line = containerRef.current.querySelector(".tu-line");
    if (!line) return;

    // 文字先淡入
    tl.from(
      containerRef.current,
      {
        opacity: 0,
        y: 10,
        duration: 0.4,
        ease: "power2.out",
      },
      delay
    );

    // 下划线从左到右展开
    tl.from(
      line,
      {
        scaleX: 0,
        duration,
        ease: "power3.out",
      },
      delay + 0.2
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
      {/* 文字 */}
      <span
        style={{
          fontSize,
          fontWeight: 600,
          color,
          fontFamily: "var(--font-heading)",
          lineHeight: 1.4,
        }}
      >
        {text}
      </span>

      {/* 下划线 */}
      <div
        className="tu-line"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: -2,
          height: lineWidth,
          backgroundColor: lineColor,
          borderRadius: lineWidth / 2,
          transformOrigin: "left center",
        }}
      />
    </div>
  );
};
