import {
  Exo2_300Light,
  Exo2_400Regular,
  Exo2_500Medium,
  Exo2_600SemiBold,
  Exo2_700Bold,
} from "@expo-google-fonts/exo-2";

// Font map passed to useFonts() in _layout.tsx
export const FontMap = {
  Exo2_300Light,
  Exo2_400Regular,
  Exo2_500Medium,
  Exo2_600SemiBold,
  Exo2_700Bold,
};

// Semantic aliases used in styles throughout the app
export const Fonts = {
  light: "Exo2_300Light",
  regular: "Exo2_400Regular",
  medium: "Exo2_500Medium",
  semiBold: "Exo2_600SemiBold",
  bold: "Exo2_700Bold",
} as const;

export type FontWeight = keyof typeof Fonts;
