import React, { useRef } from "react";
import { useGsapTimeline } from "../hooks/useGsapTimeline";

interface BulletPointListProps {
  items: string[];
  title?: string;
  fontSize?: number;
  bulletColor?: string;
  staggerDelay?: number;
}

/**
 * 简洁圆点列表：图标/圆点 + 文字配对出现
 *
 * 动画序列：
 * 1. 标题 y偏移 + overflow hidden 揭示
 * 2. 每项：圆点 scale 0→1 弹入 → 文字 x:20 滑入
 */
export const BulletPointList: React.FC<BulletPointListProps> = ({
  items,
  title,
  fontSize = 32,
  bulletColor = "var(--color-accent)",
  staggerDelay = 0.2,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGsapTimeline((tl) => {
    if (!containerRef.current) return;

    // 标题揭示（TextReveal 风格）
    const titleInner = containerRef.current.querySelector(".bpl-title-inner");
    if (titleInner) {
      tl.from(titleInner, {
        y: "110%",
        opacity: 0,
        duration: 0.5,
        ease: "power3.out",
      });
    }

    // 每项的圆点 + 文字
    const rows = containerRef.current.querySelectorAll(".bpl-row");
    rows.forEach((row, i) => {
      const bullet = row.querySelector(".bpl-bullet");
      const text = row.querySelector(".bpl-text");

      const offset = i === 0 ? "-=0.1" : `+=${staggerDelay - 0.35}`;

      if (bullet) {
        tl.from(bullet, {
          scale: 0,
          opacity: 0,
          duration: 0.3,
          ease: "back.out(3)",
        }, offset);
      }

      if (text) {
        tl.from(text, {
          x: 20,
          opacity: 0,
          duration: 0.4,
          ease: "power2.out",
        }, "-=0.15");
      }
    });
  }, [items, title]);

  return (
    <div ref={containerRef} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {title && (
        <div style={{ overflow: "hidden", marginBottom: 36 }}>
          <div
            className="bpl-title-inner"
            style={{
              fontSize: fontSize * 1.4,
              fontWeight: 700,
              color: "var(--color-primary)",
              fontFamily: "var(--font-heading)",
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {items.map((item, i) => (
          <div
            key={i}
            className="bpl-row"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              className="bpl-bullet"
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: bulletColor,
                flexShrink: 0,
              }}
            />
            <span
              className="bpl-text"
              style={{
                fontSize,
                color: "var(--color-primary)",
                fontFamily: "var(--font-body)",
                lineHeight: 1.5,
              }}
            >
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
