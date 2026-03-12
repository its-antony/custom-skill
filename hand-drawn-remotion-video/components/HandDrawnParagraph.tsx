import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";

type HandDrawnParagraphProps = {
  text: string;
  x: number;
  y: number;
  maxWidth: number;
  lineHeight?: number;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  delay?: number;
  style?: "typewriter" | "fadeIn";
  textAnchor?: "start" | "middle" | "end";
};

function estimateCharWidth(char: string, fontSize: number): number {
  // CJK characters (Chinese, Japanese, Korean) are roughly square
  if (/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/.test(char)) {
    return fontSize * 0.9;
  }
  // Wide punctuation
  if (/[\u3000-\u303f\uff00-\uffef]/.test(char)) {
    return fontSize * 0.9;
  }
  // Latin uppercase
  if (/[A-Z]/.test(char)) {
    return fontSize * 0.6;
  }
  // Latin lowercase, digits, common symbols
  return fontSize * 0.55;
}

function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
  const lines: string[] = [];
  let currentLine = "";
  let currentWidth = 0;

  for (const char of text) {
    if (char === "\n") {
      lines.push(currentLine);
      currentLine = "";
      currentWidth = 0;
      continue;
    }

    const charWidth = estimateCharWidth(char, fontSize);

    if (currentWidth + charWidth > maxWidth && currentLine.length > 0) {
      lines.push(currentLine);
      currentLine = char;
      currentWidth = charWidth;
    } else {
      currentLine += char;
      currentWidth += charWidth;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

export const HandDrawnParagraph: React.FC<HandDrawnParagraphProps> = ({
  text,
  x,
  y,
  maxWidth,
  lineHeight,
  fontSize = 24,
  fontFamily = "'Caveat Brush', 'Segoe Print', cursive",
  fill = "#1e1e1e",
  delay = 0,
  style = "typewriter",
  textAnchor = "start",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const effectiveLineHeight = lineHeight ?? fontSize * 1.4;
  const lines = React.useMemo(
    () => wrapText(text, maxWidth, fontSize),
    [text, maxWidth, fontSize],
  );

  const totalChars = text.replace(/\n/g, "").length;

  if (style === "typewriter") {
    const charsToShow = Math.floor(
      interpolate(
        frame,
        [delay * fps, (delay + totalChars * 0.05) * fps],
        [0, totalChars],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      ),
    );

    let charsRemaining = charsToShow;

    return (
      <text
        x={x}
        y={y}
        fontSize={fontSize}
        fontFamily={fontFamily}
        fill={fill}
        dominantBaseline="middle"
        textAnchor={textAnchor}
      >
        {lines.map((line, i) => {
          if (charsRemaining <= 0) return null;
          const lineText = line.slice(0, charsRemaining);
          charsRemaining -= line.length;

          return (
            <tspan
              key={i}
              x={x}
              dy={i === 0 ? 0 : effectiveLineHeight}
            >
              {lineText}
              {/* Blinking cursor on the active line */}
              {charsRemaining <= 0 &&
                charsRemaining + line.length > 0 &&
                charsToShow < totalChars && (
                  <tspan
                    style={{
                      opacity: frame % (fps / 2) < fps / 4 ? 1 : 0,
                    }}
                  >
                    |
                  </tspan>
                )}
            </tspan>
          );
        })}
      </text>
    );
  }

  // fadeIn — all lines fade in together
  const opacity = interpolate(
    frame,
    [delay * fps, (delay + 0.5) * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <text
      x={x}
      y={y}
      fontSize={fontSize}
      fontFamily={fontFamily}
      fill={fill}
      opacity={opacity}
      dominantBaseline="middle"
      textAnchor={textAnchor}
    >
      {lines.map((line, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : effectiveLineHeight}>
          {line}
        </tspan>
      ))}
    </text>
  );
};
