import React, { useRef } from "react";
import { useGsapTimeline } from "../hooks/useGsapTimeline";

interface StaggerListProps {
  items: string[];
  title?: string;
  fontSize?: number;
  staggerDelay?: number;
}

/**
 * 预设2（升级版）：列表逐条出现
 * 每条要点 = 装饰序号 + 强调色条 + 文字滑入，多层动画协同。
 *
 * 动画序列：
 * 1. 标题滑入
 * 2. 左侧竖线绘制（装饰层）
 * 3. 每条：强调色条从左展开 → 序号弹入 → 文字滑入（交错）
 */
export const StaggerList: React.FC<StaggerListProps> = ({
  items,
  title,
  fontSize = 32,
  staggerDelay = 0.25,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGsapTimeline((tl) => {
    if (!containerRef.current) return;

    // 标题入场
    const titleEl = containerRef.current.querySelector(".sl-title");
    if (titleEl) {
      tl.from(titleEl, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        ease: "power3.out",
      });
    }

    // 左侧竖线绘制
    const vertLine = containerRef.current.querySelector(".sl-vert-line");
    if (vertLine) {
      tl.from(vertLine, {
        scaleY: 0,
        duration: 0.6,
        ease: "power2.inOut",
      }, "-=0.2");
    }

    // 每条要点的多层动画
    const rows = containerRef.current.querySelectorAll(".sl-row");
    rows.forEach((row, i) => {
      const accentBar = row.querySelector(".sl-accent-bar");
      const number = row.querySelector(".sl-number");
      const text = row.querySelector(".sl-text");

      const offset = i === 0 ? "-=0.1" : `-=${0.35 - staggerDelay}`;

      // 强调色条展开
      if (accentBar) {
        tl.from(accentBar, {
          scaleX: 0,
          duration: 0.35,
          ease: "power2.out",
        }, offset);
      }

      // 序号弹入
      if (number) {
        tl.from(number, {
          scale: 0,
          opacity: 0,
          duration: 0.3,
          ease: "back.out(2)",
        }, "-=0.2");
      }

      // 文字滑入
      if (text) {
        tl.from(text, {
          x: 30,
          opacity: 0,
          duration: 0.4,
          ease: "power2.out",
        }, "-=0.2");
      }
    });
  }, [items, title]);

  return (
    <div ref={containerRef} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {title && (
        <div
          className="sl-title"
          style={{
            fontSize: fontSize * 1.4,
            fontWeight: 700,
            color: "var(--color-primary)",
            fontFamily: "var(--font-heading)",
            marginBottom: 40,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </div>
      )}

      <div style={{ display: "flex", gap: 0 }}>
        {/* 左侧装饰竖线 */}
        <div
          className="sl-vert-line"
          style={{
            width: 2,
            backgroundColor: "var(--color-accent)",
            borderRadius: 1,
            marginRight: 32,
            transformOrigin: "top center",
            opacity: 0.5,
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {items.map((item, i) => (
            <div
              key={i}
              className="sl-row"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                position: "relative",
              }}
            >
              {/* 强调色条（背景） */}
              <div
                className="sl-accent-bar"
                style={{
                  position: "absolute",
                  left: -16,
                  top: 0,
                  bottom: 0,
                  right: -16,
                  backgroundColor: "rgba(74, 158, 255, 0.06)",
                  borderRadius: 6,
                  transformOrigin: "left center",
                }}
              />

              {/* 序号 */}
              <div
                className="sl-number"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  backgroundColor: "rgba(74, 158, 255, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: fontSize * 0.5,
                  fontWeight: 700,
                  color: "var(--color-accent)",
                  fontFamily: "var(--font-code)",
                  flexShrink: 0,
                  position: "relative",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>

              {/* 文字 */}
              <span
                className="sl-text"
                style={{
                  fontSize,
                  color: "var(--color-primary)",
                  fontFamily: "var(--font-body)",
                  position: "relative",
                  padding: "8px 0",
                }}
              >
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
