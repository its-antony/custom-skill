import React, { useRef } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { useGsapTimeline } from "../hooks/useGsapTimeline";

interface BackgroundLayerProps {
  variant?: "gradient" | "grid" | "dots";
  baseColor?: string;
  accentColor?: string;
}

/**
 * 背景层：提供微妙的视觉氛围
 * - gradient: 缓慢偏移的光晕
 * - grid: 倾斜 + 持续滚动的网格线
 * - dots: 点阵纹理
 */
export const BackgroundLayer: React.FC<BackgroundLayerProps> = ({
  variant = "gradient",
  baseColor = "#0a0a0f",
  accentColor = "#4a9eff",
}) => {
  const glowRef = useRef<HTMLDivElement>(null);
  const glow2Ref = useRef<HTMLDivElement>(null);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 网格持续滚动：每帧偏移
  const gridOffset = (frame / fps) * 20; // 每秒移动 20px

  useGsapTimeline((tl) => {
    if (variant === "gradient") {
      if (glowRef.current) {
        tl.fromTo(
          glowRef.current,
          { x: "-20%", y: "-10%", opacity: 0 },
          { x: "10%", y: "5%", opacity: 0.6, duration: 8, ease: "sine.inOut" }
        );
      }
      if (glow2Ref.current) {
        tl.fromTo(
          glow2Ref.current,
          { x: "20%", y: "10%", opacity: 0 },
          { x: "-5%", y: "-5%", opacity: 0.4, duration: 8, ease: "sine.inOut" },
          0
        );
      }
    }
  }, [variant]);

  return (
    <AbsoluteFill style={{ backgroundColor: baseColor, overflow: "hidden" }}>
      {/* 渐变光晕 */}
      {variant === "gradient" && (
        <>
          <div
            ref={glowRef}
            style={{
              position: "absolute",
              width: "60%",
              height: "60%",
              top: "20%",
              left: "20%",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${accentColor}15 0%, transparent 70%)`,
              filter: "blur(80px)",
              opacity: 0,
            }}
          />
          <div
            ref={glow2Ref}
            style={{
              position: "absolute",
              width: "40%",
              height: "40%",
              bottom: "10%",
              right: "10%",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${accentColor}10 0%, transparent 70%)`,
              filter: "blur(60px)",
              opacity: 0,
            }}
          />
        </>
      )}

      {/* 倾斜滚动网格 */}
      {variant === "grid" && (
        <div
          style={{
            position: "absolute",
            // 放大并偏移，让倾斜后不露出边缘
            top: "-50%",
            left: "-50%",
            width: "200%",
            height: "200%",
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
            backgroundPosition: `${gridOffset}px ${gridOffset}px`,
            transform: "rotate(-15deg)",
          }}
        />
      )}

      {/* 点阵 — 也加微弱的漂浮感 */}
      {variant === "dots" && (
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: "-20%",
            width: "140%",
            height: "140%",
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
            backgroundPosition: `${gridOffset * 0.5}px ${gridOffset * 0.3}px`,
          }}
        />
      )}

      {/* 上下渐隐遮罩 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "25%",
          background: `linear-gradient(to bottom, ${baseColor}, transparent)`,
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "25%",
          background: `linear-gradient(to top, ${baseColor}, transparent)`,
          zIndex: 1,
        }}
      />
    </AbsoluteFill>
  );
};
