import React, { useRef } from "react";
import { useGsapTimeline } from "../hooks/useGsapTimeline";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  number?: string; // 如 "01", "Part 1"
  enterDuration?: number;
  holdDuration?: number;
  exitDuration?: number;
}

/**
 * 章节标题卡
 * 入场（编号弹入 → 标题滑入 → 副标题淡入 → 横线展开） → 停留 → 出场
 */
export const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  subtitle,
  number,
  enterDuration = 0.8,
  holdDuration = 1.5,
  exitDuration = 0.5,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // 将入场总时间分配给各元素
  const enterSteps = [number, true, subtitle, true].filter(Boolean).length;
  const stepDur = enterDuration / Math.max(enterSteps, 1);

  useGsapTimeline(
    (tl) => {
      if (!containerRef.current) return;

      const numberEl = containerRef.current.querySelector(".st-number");
      const titleEl = containerRef.current.querySelector(".st-title");
      const subtitleEl = containerRef.current.querySelector(".st-subtitle");
      const lineEl = containerRef.current.querySelector(".st-line");

      // 入场序列
      if (numberEl) {
        tl.from(numberEl, {
          scale: 0,
          opacity: 0,
          duration: stepDur,
          ease: "back.out(1.7)",
        });
      }

      if (titleEl) {
        tl.from(
          titleEl,
          {
            y: 40,
            opacity: 0,
            duration: stepDur,
            ease: "power3.out",
          },
          numberEl ? "-=0.15" : "+=0"
        );
      }

      if (subtitleEl) {
        tl.from(
          subtitleEl,
          {
            opacity: 0,
            duration: stepDur * 0.8,
            ease: "power2.out",
          },
          "-=0.1"
        );
      }

      if (lineEl) {
        tl.from(
          lineEl,
          {
            scaleX: 0,
            duration: stepDur,
            ease: "power2.inOut",
          },
          "-=0.15"
        );
      }

      // 停留
      tl.to(containerRef.current, {
        duration: holdDuration,
      });

      // 出场：整体上移 + 淡出
      tl.to(containerRef.current, {
        y: -30,
        opacity: 0,
        duration: exitDuration,
        ease: "power2.in",
      });
    },
    [title, subtitle, number, enterDuration, holdDuration, exitDuration]
  );

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        textAlign: "center",
      }}
    >
      {/* 编号 */}
      {number && (
        <div
          className="st-number"
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "var(--color-accent)",
            fontFamily: "var(--font-code)",
            letterSpacing: "0.1em",
            marginBottom: 8,
          }}
        >
          {number}
        </div>
      )}

      {/* 标题 */}
      <div
        className="st-title"
        style={{
          fontSize: 56,
          fontWeight: 800,
          color: "var(--color-primary)",
          fontFamily: "var(--font-heading)",
          letterSpacing: "-0.02em",
          lineHeight: 1.2,
        }}
      >
        {title}
      </div>

      {/* 装饰横线 */}
      <div
        className="st-line"
        style={{
          width: 80,
          height: 3,
          backgroundColor: "var(--color-accent)",
          borderRadius: 2,
          transformOrigin: "center center",
          margin: "8px 0",
          opacity: 0.6,
        }}
      />

      {/* 副标题 */}
      {subtitle && (
        <div
          className="st-subtitle"
          style={{
            fontSize: 22,
            color: "var(--color-muted)",
            fontFamily: "var(--font-body)",
            fontWeight: 400,
            lineHeight: 1.5,
            maxWidth: 600,
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
};
