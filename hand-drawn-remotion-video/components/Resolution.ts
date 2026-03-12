export const RESOLUTIONS = {
  landscape_hd: { width: 1280, height: 720, fps: 30 },
  landscape_fhd: { width: 1920, height: 1080, fps: 30 },
  portrait_hd: { width: 1080, height: 1920, fps: 30 },
} as const;

export type ResolutionKey = keyof typeof RESOLUTIONS;
export type Resolution = (typeof RESOLUTIONS)[ResolutionKey];

/**
 * Get font size scaled for a given resolution relative to the 1280x720 baseline.
 * Example: scaleFontSize(32, "landscape_fhd") → 48
 */
export function scaleFontSize(
  baseFontSize: number,
  resolution: ResolutionKey,
): number {
  const base = RESOLUTIONS.landscape_hd;
  const target = RESOLUTIONS[resolution];
  const scale = Math.min(target.width / base.width, target.height / base.height);
  return Math.round(baseFontSize * scale);
}
