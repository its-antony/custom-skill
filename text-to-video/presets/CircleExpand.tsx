import React, { useRef } from "react";
import { useGsapTimeline } from "../hooks/useGsapTimeline";

interface CircleExpandProps {
  mode?: "cover" | "reveal";
  color?: string;
  duration?: number;
  originX?: number; // 百分比 0-100，默认 50
  originY?: number; // 百分比 0-100，默认 50
  children?: React.ReactNode;
}

/**
 * 圆形扩展转场
 * cover: 圆从 0 扩大到覆盖全屏（遮挡旧内容）
 * reveal: 圆从全覆盖缩小到 0（揭示新内容）
 */
export const CircleExpand: React.FC<CircleExpandProps> = ({
  mode = "cover",
  color = "var(--color-accent)",
  duration = 0.8,
  originX = 50,
  originY = 50,
  children,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  // 半径需要足够大以覆盖屏幕对角线（约 150%）
  const maxRadius = 150;

  useGsapTimeline(
    (tl) => {
      if (!overlayRef.current) return;

      if (mode === "cover") {
        // 圆从 0 扩大到全覆盖
        tl.fromTo(
          overlayRef.current,
          {
            clipPath: `circle(0% at ${originX}% ${originY}%)`,
          },
          {
            clipPath: `circle(${maxRadius}% at ${originX}% ${originY}%)`,
            duration,
            ease: "power2.inOut",
          }
        );
      } else {
        // reveal: 圆从全覆盖缩小到 0（揭示 children）
        tl.fromTo(
          overlayRef.current,
          {
            clipPath: `circle(${maxRadius}% at ${originX}% ${originY}%)`,
          },
          {
            clipPath: `circle(0% at ${originX}% ${originY}%)`,
            duration,
            ease: "power2.inOut",
          }
        );
      }
    },
    [mode, originX, originY, duration]
  );

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* 内容层 */}
      {children && <div style={{ position: "relative", zIndex: 0 }}>{children}</div>}

      {/* 圆形遮罩层 */}
      <div
        ref={overlayRef}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: color,
          zIndex: 10,
        }}
      />
    </div>
  );
};
