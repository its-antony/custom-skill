import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";

type SafeAreaPreset = "action" | "title" | "portrait-content";

type SafeAreaProps = {
  preset?: SafeAreaPreset;
  padding?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  showGuides?: boolean;
  children: React.ReactNode;
};

function getPresetPadding(
  preset: SafeAreaPreset,
  width: number,
  height: number,
) {
  const isPortrait = height > width;

  switch (preset) {
    case "action":
      return {
        top: height * 0.05,
        right: width * 0.05,
        bottom: height * 0.05,
        left: width * 0.05,
      };
    case "title":
      if (isPortrait) {
        return {
          top: height * 0.15,
          right: width * 0.1,
          bottom: height * 0.12,
          left: width * 0.05,
        };
      }
      return {
        top: height * 0.1,
        right: width * 0.1,
        bottom: height * 0.1,
        left: width * 0.1,
      };
    case "portrait-content":
      return {
        top: height * 0.15,
        right: width * 0.1,
        bottom: height * 0.12,
        left: width * 0.05,
      };
    default:
      return { top: 0, right: 0, bottom: 0, left: 0 };
  }
}

export const SafeArea: React.FC<SafeAreaProps> = ({
  preset = "title",
  padding: customPadding,
  showGuides = false,
  children,
}) => {
  const { width, height } = useVideoConfig();

  const pad = customPadding
    ? {
        top: customPadding.top ?? 0,
        right: customPadding.right ?? 0,
        bottom: customPadding.bottom ?? 0,
        left: customPadding.left ?? 0,
      }
    : getPresetPadding(preset, width, height);

  const contentWidth = width - pad.left - pad.right;
  const contentHeight = height - pad.top - pad.bottom;

  return (
    <>
      {showGuides && (
        <AbsoluteFill style={{ zIndex: 9999, pointerEvents: "none" }}>
          <div
            style={{
              position: "absolute",
              top: height * 0.05,
              left: width * 0.05,
              width: width * 0.9,
              height: height * 0.9,
              border: "1px dashed rgba(255,0,0,0.3)",
              boxSizing: "border-box",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: pad.top,
              left: pad.left,
              width: contentWidth,
              height: contentHeight,
              border: "1px dashed rgba(0,150,255,0.5)",
              boxSizing: "border-box",
            }}
          />
        </AbsoluteFill>
      )}

      <AbsoluteFill
        style={{
          padding: `${pad.top}px ${pad.right}px ${pad.bottom}px ${pad.left}px`,
        }}
      >
        <div
          style={{
            width: contentWidth,
            height: contentHeight,
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {children}
        </div>
      </AbsoluteFill>
    </>
  );
};

export function useSafeArea(preset: SafeAreaPreset = "title") {
  const { width, height } = useVideoConfig();
  const pad = getPresetPadding(preset, width, height);

  return {
    x: pad.left,
    y: pad.top,
    width: width - pad.left - pad.right,
    height: height - pad.top - pad.bottom,
    centerX: width / 2,
    centerY: height / 2,
    pad,
    frameWidth: width,
    frameHeight: height,
  };
}
