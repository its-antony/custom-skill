import React, { useRef } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

interface TypewriterProps {
  text: string;
  fontSize?: number;
  typingSpeed?: number; // 每秒打多少个字符
  cursorColor?: string;
  showCursor?: boolean;
}

/**
 * 预设3：打字机效果
 * 逐字显示文本 + 闪烁光标。
 * 这个预设不用 GSAP，直接基于 Remotion 帧计算，因为逐字显示更适合帧级控制。
 */
export const Typewriter: React.FC<TypewriterProps> = ({
  text,
  fontSize = 28,
  typingSpeed = 20,
  cursorColor = "var(--color-accent)",
  showCursor = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timeInSeconds = frame / fps;

  // 计算当前应该显示多少个字符
  const charsToShow = Math.min(
    Math.floor(timeInSeconds * typingSpeed),
    text.length
  );

  const displayedText = text.slice(0, charsToShow);
  const isTypingDone = charsToShow >= text.length;

  // 光标闪烁：每 0.5 秒切换一次
  const cursorVisible = isTypingDone
    ? Math.floor(timeInSeconds * 2) % 2 === 0
    : true;

  return (
    <div
      style={{
        fontFamily: "var(--font-code)",
        fontSize,
        color: "var(--color-primary)",
        backgroundColor: "var(--color-surface)",
        padding: "32px 40px",
        borderRadius: "var(--border-radius)",
        border: "1px solid rgba(255,255,255,0.08)",
        lineHeight: 1.6,
        whiteSpace: "pre-wrap",
        minHeight: fontSize * 3,
      }}
    >
      {displayedText}
      {showCursor && (
        <span
          style={{
            display: "inline-block",
            width: 2,
            height: fontSize * 1.2,
            backgroundColor: cursorVisible ? cursorColor : "transparent",
            marginLeft: 2,
            verticalAlign: "text-bottom",
          }}
        />
      )}
    </div>
  );
};
