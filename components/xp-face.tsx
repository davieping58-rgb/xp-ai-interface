import { useEffect, useRef } from "react";
import { View, Animated, Easing, useWindowDimensions } from "react-native";
import Svg, { Ellipse, Path, Line, Defs, RadialGradient, Stop } from "react-native-svg";
import { useAppStore } from "@/store/useAppStore";
import { ModeColors } from "@/constants/Colors";
import type { ModeType } from "@/store/types";

const AnimatedView = Animated.View;

interface XPFaceProps {
  size?: number;
}

export function XPFace({ size: propSize }: XPFaceProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const size = propSize ?? Math.min(screenWidth * 0.85, screenHeight * 0.55);

  const currentAnimation = useAppStore((s) => s.currentAnimation);
  const currentMode = useAppStore((s) => s.currentMode);

  // Animation values
  const breathAnim = useRef(new Animated.Value(0)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const eyeX = useRef(new Animated.Value(0)).current;
  const eyeY = useRef(new Animated.Value(0)).current;
  const modeOverlay = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const speakAnim = useRef(new Animated.Value(0)).current;

  // Breathing glow animation (always running)
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

  // Blink animation
  useEffect(() => {
    const scheduleBlink = () => {
      const delay = 3000 + Math.random() * 4000;
      const timer = setTimeout(() => {
        Animated.sequence([
          Animated.timing(blinkAnim, {
            toValue: 0.1,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.timing(blinkAnim, {
            toValue: 1,
            duration: 120,
            useNativeDriver: true,
          }),
        ]).start();
        scheduleBlink();
      }, delay);
      return timer;
    };
    const timer = scheduleBlink();
    return () => clearTimeout(timer);
  }, [blinkAnim]);

  // Micro eye movements
  useEffect(() => {
    const moveEyes = () => {
      const delay = 2000 + Math.random() * 3000;
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.spring(eyeX, {
            toValue: (Math.random() - 0.5) * 4,
            useNativeDriver: true,
            speed: 20,
            bounciness: 0,
          }),
          Animated.spring(eyeY, {
            toValue: (Math.random() - 0.5) * 2,
            useNativeDriver: true,
            speed: 20,
            bounciness: 0,
          }),
        ]).start();
        moveEyes();
      }, delay);
      return timer;
    };
    const timer = moveEyes();
    return () => clearTimeout(timer);
  }, [eyeX, eyeY]);

  // Mode overlay pulse
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

  const modeColor = ModeColors[currentMode] ?? ModeColors.idle;

  const breathScale = breathAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.98, 1.02],
  });

  const breathOpacity = breathAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  const modeGlowOpacity = modeOverlay.interpolate({
    inputRange: [0, 1],
    outputRange: [0.15, 0.4],
  });

  const listeningScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.5],
  });

  const listeningOpacity = pulseAnim.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0.6, 0.2, 0],
  });

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      {/* Mode color overlay background glow */}
      <AnimatedView
        style={{
          position: "absolute",
          width: size * 0.8,
          height: size * 0.8,
          borderRadius: size * 0.4,
          backgroundColor: modeColor,
          opacity: modeGlowOpacity,
          transform: [{ scale: breathScale }],
        }}
      />

      {/* Listening pulse rings */}
      {currentAnimation === "listening" && (
        <AnimatedView
          style={{
            position: "absolute",
            width: size * 0.4,
            height: size * 0.4,
            borderRadius: size * 0.2,
            borderWidth: 2,
            borderColor: "#00E5FF",
            opacity: listeningOpacity,
            transform: [{ scale: listeningScale }],
          }}
        />
      )}

      {/* Main face container with breathing */}
      <AnimatedView
        style={{
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "center",
          transform: [{ scale: breathScale }],
          opacity: breathOpacity,
        }}
      >
        {/* Holographic face SVG */}
        <Svg width={size * 0.9} height={size * 0.9} viewBox="0 0 300 360">
          <Defs>
            <RadialGradient id="faceGlow" cx="50%" cy="40%" r="50%">
              <Stop offset="0%" stopColor={modeColor} stopOpacity="0.3" />
              <Stop offset="70%" stopColor={modeColor} stopOpacity="0.1" />
              <Stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#00E5FF" stopOpacity="1" />
              <Stop offset="60%" stopColor="#00E5FF" stopOpacity="0.6" />
              <Stop offset="100%" stopColor="#0077B6" stopOpacity="0" />
            </RadialGradient>
          </Defs>

          {/* Face outline - holographic wireframe */}
          <Ellipse cx="150" cy="160" rx="100" ry="130" fill="url(#faceGlow)" stroke={modeColor} strokeWidth="0.8" strokeOpacity="0.5" />

          {/* Forehead lines */}
          <Path d="M80 100 Q150 70 220 100" fill="none" stroke="#00E5FF" strokeWidth="0.5" strokeOpacity="0.4" />
          <Path d="M90 115 Q150 90 210 115" fill="none" stroke="#00E5FF" strokeWidth="0.4" strokeOpacity="0.3" />

          {/* Cheekbone structures */}
          <Path d="M60 170 Q80 150 100 160" fill="none" stroke="#00E5FF" strokeWidth="0.6" strokeOpacity="0.4" />
          <Path d="M240 170 Q220 150 200 160" fill="none" stroke="#00E5FF" strokeWidth="0.6" strokeOpacity="0.4" />

          {/* Jawline */}
          <Path d="M70 200 Q80 260 150 290 Q220 260 230 200" fill="none" stroke="#00E5FF" strokeWidth="0.7" strokeOpacity="0.5" />

          {/* Nose bridge */}
          <Line x1="150" y1="140" x2="150" y2="200" stroke="#00E5FF" strokeWidth="0.5" strokeOpacity="0.3" />
          <Path d="M140 200 Q150 210 160 200" fill="none" stroke="#00E5FF" strokeWidth="0.6" strokeOpacity="0.4" />

          {/* Grid/wireframe lines across face */}
          <Path d="M60 140 Q150 130 240 140" fill="none" stroke="#0077B6" strokeWidth="0.3" strokeOpacity="0.25" />
          <Path d="M55 180 Q150 170 245 180" fill="none" stroke="#0077B6" strokeWidth="0.3" strokeOpacity="0.25" />
          <Path d="M65 220 Q150 210 235 220" fill="none" stroke="#0077B6" strokeWidth="0.3" strokeOpacity="0.25" />
          <Path d="M80 250 Q150 245 220 250" fill="none" stroke="#0077B6" strokeWidth="0.3" strokeOpacity="0.25" />

          {/* Vertical grid lines */}
          <Path d="M110 80 Q105 180 115 290" fill="none" stroke="#0077B6" strokeWidth="0.3" strokeOpacity="0.2" />
          <Path d="M190 80 Q195 180 185 290" fill="none" stroke="#0077B6" strokeWidth="0.3" strokeOpacity="0.2" />
        </Svg>

        {/* Eyes layer - animated separately for blink + movement */}
        <AnimatedView
          style={{
            position: "absolute",
            top: size * 0.35,
            flexDirection: "row",
            gap: size * 0.12,
            opacity: blinkAnim,
            transform: [{ translateX: eyeX }, { translateY: eyeY }],
          }}
        >
          {/* Left eye */}
          <View style={{ width: size * 0.1, height: size * 0.05, alignItems: "center", justifyContent: "center" }}>
            <Svg width={size * 0.1} height={size * 0.06} viewBox="0 0 40 20">
              <Defs>
                <RadialGradient id="leftEyeG" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                  <Stop offset="40%" stopColor="#00E5FF" stopOpacity="1" />
                  <Stop offset="100%" stopColor="#0077B6" stopOpacity="0.3" />
                </RadialGradient>
              </Defs>
              <Ellipse cx="20" cy="10" rx="12" ry="7" fill="url(#leftEyeG)" />
              <Ellipse cx="20" cy="10" rx="4" ry="4" fill="#FFFFFF" />
            </Svg>
          </View>

          {/* Right eye */}
          <View style={{ width: size * 0.1, height: size * 0.05, alignItems: "center", justifyContent: "center" }}>
            <Svg width={size * 0.1} height={size * 0.06} viewBox="0 0 40 20">
              <Defs>
                <RadialGradient id="rightEyeG" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                  <Stop offset="40%" stopColor="#00E5FF" stopOpacity="1" />
                  <Stop offset="100%" stopColor="#0077B6" stopOpacity="0.3" />
                </RadialGradient>
              </Defs>
              <Ellipse cx="20" cy="10" rx="12" ry="7" fill="url(#rightEyeG)" />
              <Ellipse cx="20" cy="10" rx="4" ry="4" fill="#FFFFFF" />
            </Svg>
          </View>
        </AnimatedView>

        {/* Mouth - speaking glow */}
        <AnimatedView
          style={{
            position: "absolute",
            top: size * 0.58,
            width: size * 0.15,
            height: size * 0.03,
            borderRadius: size * 0.02,
            backgroundColor: "#00E5FF",
            opacity: currentAnimation === "speaking" ? speakAnim : new Animated.Value(0.2),
            transform: [
              {
                scaleX: currentAnimation === "speaking"
                  ? speakAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.2] })
                  : 1,
              },
            ],
          }}
        />
      </AnimatedView>

      {/* Particle field - subtle floating dots */}
      <ParticleField size={size} color={modeColor} />
    </View>
  );
}

// Animated particle field
function ParticleField({ size, color }: { size: number; color: string }) {
  const particles = useRef(
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * size,
      y: Math.random() * size,
      anim: new Animated.Value(0),
      delay: Math.random() * 3000,
      duration: 3000 + Math.random() * 2000,
    }))
  ).current;

  useEffect(() => {
    const animations = particles.map((p) => {
      return Animated.loop(
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
      );
    });
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, [particles]);

  return (
    <View style={{ position: "absolute", width: size, height: size, pointerEvents: "none" }}>
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
              outputRange: [0, 0.7, 0],
            }),
            transform: [
              {
                translateY: p.anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -20],
                }),
              },
            ],
          }}
        />
      ))}
    </View>
  );
}
