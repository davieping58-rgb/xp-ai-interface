/**
 * XP Holographic AI Companion — Color palette
 */

export const Colors = {
  background: "#000814",
  primaryGlow: "#00E5FF",
  secondaryGlow: "#0077B6",
  accent: "#7B2FBE",
  alert: "#FF1744",
  exploration: "#FF6D00",
  camping: "#FFB300",
  engineering: "#00E676",
  text: "#E0F7FA",
  textDim: "rgba(224, 247, 250, 0.6)",
  panelGlass: "rgba(0, 20, 50, 0.75)",
  panelBorder: "rgba(0, 229, 255, 0.3)",
  panelBorderActive: "rgba(0, 229, 255, 0.6)",
  tileBg: "rgba(0, 30, 60, 0.6)",
  subtitleBg: "rgba(0, 10, 30, 0.8)",
} as const;

// Mode colors for face overlay animations
export const ModeColors: Record<string, string> = {
  engineering: "#00E676",
  boat: "#0077B6",
  camping: "#FFB300",
  exploration: "#FF6D00",
  thinking: "#7B2FBE",
  listening: "#00E5FF",
  alert: "#FF1744",
  idle: "#00E5FF",
} as const;
