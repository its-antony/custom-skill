import React, { useRef } from "react";
import { useGsapTimeline } from "../hooks/useGsapTimeline";

interface CodeBlockProps {
  code: string;
  filename?: string;
  fontSize?: number;
  lineDelay?: number;
  duration?: number;
  showLineNumbers?: boolean;
}

/**
 * 终端风格代码块
 * 标题栏淡入 → 每行代码 stagger 从左滑入
 */
export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  filename = "index.ts",
  fontSize = 18,
  lineDelay = 0.12,
  duration = 0.4,
  showLineNumbers = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const lines = code.split("\n");

  useGsapTimeline(
    (tl) => {
      if (!containerRef.current) return;

      // 标题栏淡入
      const header = containerRef.current.querySelector(".cb-header");
      if (header) {
        tl.from(header, {
          opacity: 0,
          y: -10,
          duration: 0.3,
          ease: "power2.out",
        });
      }

      // 代码区域背景淡入
      const codeArea = containerRef.current.querySelector(".cb-code-area");
      if (codeArea) {
        tl.from(
          codeArea,
          {
            opacity: 0,
            duration: 0.2,
            ease: "power2.out",
          },
          "-=0.1"
        );
      }

      // 每行代码 stagger 滑入
      const lineEls = containerRef.current.querySelectorAll(".cb-line");
      if (lineEls.length > 0) {
        tl.from(
          lineEls,
          {
            x: -20,
            opacity: 0,
            duration,
            ease: "power2.out",
            stagger: lineDelay,
          },
          "-=0.1"
        );
      }
    },
    [code]
  );

  return (
    <div
      ref={containerRef}
      style={{
        borderRadius: 10,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.08)",
        fontFamily: "var(--font-code)",
      }}
    >
      {/* 标题栏 */}
      <div
        className="cb-header"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "12px 16px",
          backgroundColor: "rgba(255,255,255,0.06)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* 三个彩色圆点 */}
        <div style={{ display: "flex", gap: 6 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "#ff5f57",
            }}
          />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "#febc2e",
            }}
          />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "#28c840",
            }}
          />
        </div>
        {/* 文件名 */}
        <span
          style={{
            fontSize: fontSize * 0.75,
            color: "var(--color-muted)",
            marginLeft: 8,
          }}
        >
          {filename}
        </span>
      </div>

      {/* 代码区域 */}
      <div
        className="cb-code-area"
        style={{
          backgroundColor: "rgba(255,255,255,0.04)",
          padding: "20px 0",
        }}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            className="cb-line"
            style={{
              display: "flex",
              padding: "2px 20px",
              lineHeight: 1.7,
              fontSize,
            }}
          >
            {showLineNumbers && (
              <span
                style={{
                  color: "rgba(255,255,255,0.2)",
                  width: 40,
                  textAlign: "right",
                  marginRight: 20,
                  flexShrink: 0,
                  userSelect: "none",
                }}
              >
                {i + 1}
              </span>
            )}
            <span
              style={{
                color: "var(--color-primary)",
                whiteSpace: "pre",
              }}
            >
              {line}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
