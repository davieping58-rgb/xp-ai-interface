import { useEffect, useRef } from "react";
import { View, Animated, Easing, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { useAppStore } from "@/store/useAppStore";
import { ModeColors } from "@/constants/Colors";
import type { ModeType } from "@/store/types";

const AnimatedView = Animated.View;

/**
 * XP's holographic face — the actual image asset with animated overlays.
 * Fills the entire provided area; parent should be position:absolute / full-screen.
 */
export function XPFace() {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const currentAnimation = useAppStore((s) => s.currentAnimation);
  const currentMode = useAppStore((s) => s.currentMode);

  // Animation values
  const breathAnim = useRef(new Animated.Value(0)).current;
  const modeOverlay = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const speakAnim = useRef(new Animated.Value(0)).current;
  const electricAnim = useRef(new Animated.Value(0)).current;

  // Breathing glow animation (always running — 4s cycle)
  useEffect(() => {
    const breathing = Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breathAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    breathing.start();
    return () => breathing.stop();
  }, [breathAnim]);

  // Mode overlay pulse — speed varies by mode
  useEffect(() => {
    const getDuration = (mode: ModeType): number => {
      switch (mode) {
        case "alert": return 500;
        case "thinking": return 1000;
        case "engineering": return 1500;
        default: return 2000;
      }
    };

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(modeOverlay, {
          toValue: 1,
          duration: getDuration(currentMode),
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(modeOverlay, {
          toValue: 0,
          duration: getDuration(currentMode),
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [currentMode, modeOverlay]);

  // Speaking animation
  useEffect(() => {
    if (currentAnimation === "speaking") {
      const speak = Animated.loop(
        Animated.sequence([
          Animated.timing(speakAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(speakAnim, {
            toValue: 0.3,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      );
      speak.start();
      return () => speak.stop();
    }
    Animated.timing(speakAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [currentAnimation, speakAnim]);

  // Listening pulse rings
  useEffect(() => {
    if (currentAnimation === "listening") {
      const pulse = Animated.loop(
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        })
      );
      pulse.start();
      return () => pulse.stop();
    }
    pulseAnim.setValue(0);
  }, [currentAnimation, pulseAnim]);

  // Electrical pulse streaks — random timing
  useEffect(() => {
    const runPulse = () => {
      const delay = 2000 + Math.random() * 4000;
      const timer = setTimeout(() => {
        Animated.sequence([
          Animated.timing(electricAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(electricAnim, {
            toValue: 0,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start();
        runPulse();
      }, delay);
      return timer;
    };
    const timer = runPulse();
    return () => clearTimeout(timer);
  }, [electricAnim]);

  const modeColor = ModeColors[currentMode] ?? ModeColors.idle;

  // Interpolations
  const breathScale = breathAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1.0, 1.015],
  });

  const breathGlowOpacity = breathAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.0, 0.12],
  });

  const modeGlowOpacity = modeOverlay.interpolate({
    inputRange: [0, 1],
    outputRange: [0.0, 0.18],
  });

  const listeningScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1.8],
  });

  const listeningOpacity = pulseAnim.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0.5, 0.15, 0],
  });

  const speakGlowOpacity = speakAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.2],
  });

  return (
    <View style={{ width: screenWidth, height: screenHeight, position: "relative" }}>
      {/* Base face image — fills the entire screen */}
      <AnimatedView
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          transform: [{ scale: breathScale }],
        }}
      >
        <Image
          source={require("../assets/xp_face.png")}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          contentPosition="center"
        />
      </AnimatedView>

      {/* Breathing glow overlay — soft cyan pulse over the image */}
      <AnimatedView
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "#00E5FF",
          opacity: breathGlowOpacity,
        }}
      />

      {/* Mode colour tint overlay — semi-transparent, changes by mode */}
      <AnimatedView
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: modeColor,
          opacity: modeGlowOpacity,
        }}
      />

      {/* Electrical pulse flash overlay */}
      <AnimatedView
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "#00E5FF",
          opacity: electricAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.06],
          }),
        }}
      />

      {/* Speaking glow — brightens bottom mouth area */}
      {currentAnimation === "speaking" && (
        <AnimatedView
          style={{
            position: "absolute",
            bottom: screenHeight * 0.28,
            left: screenWidth * 0.3,
            right: screenWidth * 0.3,
            height: screenHeight * 0.08,
            borderRadius: 40,
            backgroundColor: "#00E5FF",
            opacity: speakGlowOpacity,
          }}
        />
      )}

      {/* Listening pulse ring — expands from center */}
      {currentAnimation === "listening" && (
        <AnimatedView
          style={{
            position: "absolute",
            top: screenHeight * 0.3,
            left: screenWidth * 0.2,
            right: screenWidth * 0.2,
            height: screenWidth * 0.6,
            borderRadius: screenWidth * 0.3,
            borderWidth: 2,
            borderColor: "#00E5FF",
            opacity: listeningOpacity,
            transform: [{ scale: listeningScale }],
          }}
        />
      )}

      {/* Particle field — subtle floating dots */}
      <ParticleField width={screenWidth} height={screenHeight} color={modeColor} />
    </View>
  );
}

// Animated particle field layered over the face
function ParticleField({ width, height, color }: { width: number; height: number; color: string }) {
  const particles = useRef(
    Array.from({ length: 16 }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: height * 0.15 + Math.random() * height * 0.6,
      anim: new Animated.Value(0),
      delay: Math.random() * 3000,
      duration: 3000 + Math.random() * 2000,
    }))
  ).current;

  useEffect(() => {
    const animations = particles.map((p) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(p.delay),
          Animated.timing(p.anim, {
            toValue: 1,
            duration: p.duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(p.anim, {
            toValue: 0,
            duration: p.duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      )
    );
    for (const a of animations) a.start();
    return () => { for (const a of animations) a.stop(); };
  }, [particles]);

  return (
    <View style={{ position: "absolute", top: 0, left: 0, width, height, pointerEvents: "none" }}>
      {particles.map((p) => (
        <AnimatedView
          key={p.id}
          style={{
            position: "absolute",
            left: p.x,
            top: p.y,
            width: 2,
            height: 2,
            borderRadius: 1,
            backgroundColor: color,
            opacity: p.anim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, 0.6, 0],
            }),
            transform: [
              {
                translateY: p.anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -25],
                }),
              },
            ],
          }}
        />
      ))}
    </View>
  );
}
