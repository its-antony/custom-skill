import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";

interface SafeAreaProps {
  children: React.ReactNode;
  /** 内容在安全区内的对齐方式 */
  align?: "center" | "top-left" | "top-center" | "center-left";
  /** 是否显示安全区边框（调试用） */
  debug?: boolean;
}

/**
 * 安全区组件：根据视频比例自动计算安全边距
 *
 * 横屏 16:9 (1920x1080):
 *   - 水平安全边距: 10% = 192px
 *   - 垂直安全边距: 12% = 130px
 *
 * 竖屏 9:16 (1080x1920):
 *   - 水平安全边距: 8% = 86px
 *   - 垂直安全边距: 15% = 288px (上方留更多空间给平台 UI)
 *
 * 所有内容必须在安全区内，默认垂直水平居中。
 */
export const SafeArea: React.FC<SafeAreaProps> = ({
  children,
  align = "center",
  debug = false,
}) => {
  const { width, height } = useVideoConfig();
  const isPortrait = height > width;

  // 根据比例计算安全边距
  const margin = isPortrait
    ? {
        top: Math.round(height * 0.15),
        bottom: Math.round(height * 0.12),
        left: Math.round(width * 0.08),
        right: Math.round(width * 0.08),
      }
    : {
        top: Math.round(height * 0.12),
        bottom: Math.round(height * 0.12),
        left: Math.round(width * 0.10),
        right: Math.round(width * 0.10),
      };

  // 对齐方式映射
  const alignStyles: Record<string, React.CSSProperties> = {
    center: {
      justifyContent: "center",
      alignItems: "center",
    },
    "top-left": {
      justifyContent: "flex-start",
      alignItems: "flex-start",
    },
    "top-center": {
      justifyContent: "flex-start",
      alignItems: "center",
    },
    "center-left": {
      justifyContent: "center",
      alignItems: "flex-start",
    },
  };

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: margin.top,
          bottom: margin.bottom,
          left: margin.left,
          right: margin.right,
          display: "flex",
          flexDirection: "column",
          ...alignStyles[align],
          ...(debug
            ? {
                border: "1px dashed rgba(255, 0, 0, 0.3)",
                boxShadow: "inset 0 0 0 1px rgba(255, 0, 0, 0.1)",
              }
            : {}),
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};
