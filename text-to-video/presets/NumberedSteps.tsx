import React, { useRef } from "react";
import { useGsapTimeline } from "../hooks/useGsapTimeline";

interface Step {
  title: string;
  description?: string;
}

interface NumberedStepsProps {
  steps: Step[];
  fontSize?: number;
  staggerDelay?: number;
}

/**
 * 带大编号的步骤展示
 *
 * 动画序列（每步）：
 * 1. 编号 scale 缩放入场
 * 2. 标题从右滑入
 * 3. 描述淡入
 * 4. 连接线 scaleY: 0→1 绘制
 */
export const NumberedSteps: React.FC<NumberedStepsProps> = ({
  steps,
  fontSize = 28,
  staggerDelay = 0.15,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGsapTimeline((tl) => {
    if (!containerRef.current) return;

    const stepEls = containerRef.current.querySelectorAll(".ns-step");
    stepEls.forEach((step, i) => {
      const number = step.querySelector(".ns-number");
      const title = step.querySelector(".ns-title");
      const desc = step.querySelector(".ns-desc");
      const line = step.querySelector(".ns-line");

      const offset = i === 0 ? "0" : `+=${staggerDelay - 0.3}`;

      // 编号缩放入场
      if (number) {
        tl.from(number, {
          scale: 0,
          opacity: 0,
          duration: 0.4,
          ease: "back.out(2)",
        }, offset);
      }

      // 标题从右滑入
      if (title) {
        tl.from(title, {
          x: 30,
          opacity: 0,
          duration: 0.4,
          ease: "power2.out",
        }, "-=0.2");
      }

      // 描述淡入
      if (desc) {
        tl.from(desc, {
          opacity: 0,
          y: 8,
          duration: 0.35,
          ease: "power2.out",
        }, "-=0.15");
      }

      // 连接线绘制
      if (line) {
        tl.from(line, {
          scaleY: 0,
          duration: 0.3,
          ease: "power2.inOut",
        }, "-=0.15");
      }
    });
  }, [steps]);

  return (
    <div
      ref={containerRef}
      style={{ display: "flex", flexDirection: "column", gap: 0 }}
    >
      {steps.map((step, i) => (
        <div key={i} className="ns-step" style={{ display: "flex", gap: 24 }}>
          {/* 左列：编号 + 连接线 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              flexShrink: 0,
              width: fontSize * 1.8,
            }}
          >
            <div
              className="ns-number"
              style={{
                fontSize: fontSize * 1.5,
                fontWeight: 700,
                color: "rgba(74, 158, 255, 0.3)",
                fontFamily: "var(--font-code)",
                lineHeight: 1,
                paddingBottom: 8,
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </div>
            {i < steps.length - 1 && (
              <div
                className="ns-line"
                style={{
                  width: 1,
                  flex: 1,
                  backgroundColor: "rgba(255,255,255,0.1)",
                  transformOrigin: "top center",
                  minHeight: 24,
                }}
              />
            )}
          </div>

          {/* 右列：标题 + 描述 */}
          <div style={{ paddingBottom: 32 }}>
            <div
              className="ns-title"
              style={{
                fontSize,
                fontWeight: 600,
                color: "var(--color-primary)",
                fontFamily: "var(--font-heading)",
                lineHeight: 1.3,
              }}
            >
              {step.title}
            </div>
            {step.description && (
              <div
                className="ns-desc"
                style={{
                  fontSize: fontSize * 0.75,
                  color: "var(--color-muted)",
                  fontFamily: "var(--font-body)",
                  lineHeight: 1.5,
                  marginTop: 8,
                }}
              >
                {step.description}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
