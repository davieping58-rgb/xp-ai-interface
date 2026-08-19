import { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  Animated,
  Easing,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Typography";
import { XP_INTRO_LINES } from "@/constants/XPPersonality";
import { XPFace } from "@/components/xp-face";
import { ControlPanel } from "@/components/control-panel";
import { ModesPanel } from "@/components/modes-panel";
import { MemoryPanel } from "@/components/memory-panel";
import { HistoryPanel } from "@/components/history-panel";
import { SettingsPanel } from "@/components/settings-panel";
import { VoicePanel } from "@/components/voice-panel";
import { CameraPanel } from "@/components/camera-panel";
import { TextInputPanel } from "@/components/text-input-panel";
import { PrivacyPanel } from "@/components/privacy-panel";
import { PermissionsPanel } from "@/components/permissions-panel";
import { AboutPanel } from "@/components/about-panel";
import { useAppStore } from "@/store/useAppStore";
import { useAudioTranscription } from "@fastshot/ai";
import { speakWithScottishVoice, stopSpeaking } from "@/utils/speech";
import { startAudioRecording, stopAudioRecording } from "@/utils/audio-recorder";

const MOTHERSHIP = "http://192.168.1.211:8000";
const MOTHERSHIP_TIMEOUT_MS = 2500;

type ActiveScreen =
  | "home"
  | "modes"
  | "memory"
  | "history"
  | "settings"
  | "voice"
  | "camera"
  | "text"
  | "permissions"
  | "privacy"
  | "about";

function localXpFallback(userText: string) {
  const clean = userText.trim();
  const lower = clean.toLowerCase();

  if (/^(hi|hello|hey|awright|alright)\b/.test(lower)) {
    return "Awright, Davie. I'm here. Mothership's not needed for me to talk to you.";
  }
  if (lower.includes("who are you")) {
    return "I'm XP. Same pal, same voice. The Mothership gives me the bigger brain when it's there, but I can still talk when it isn't.";
  }
  if (lower.includes("mothership") || lower.includes("core")) {
    return "The Mothership link isn't available just now, but I'm still here and talking. I'll use the core again automatically when it comes back.";
  }
  if (lower.includes("are you there") || lower.includes("can you hear me")) {
    return "Aye, Davie. I can hear you and I'm here.";
  }
  if (lower.includes("thank")) {
    return "Aye, mate. I'm with you.";
  }

  return `Aye, Davie. I heard you: ${clean}. The Mothership link is down just now, but I'm still here and talking.`;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [showPanel, setShowPanel] = useState(false);
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>("home");
  const [introIndex] = useState(() => Math.floor(Math.random() * XP_INTRO_LINES.length));
  const [isThinking, setIsThinking] = useState(false);

  const subtitleText = useAppStore((s) => s.subtitleText);
  const setSubtitle = useAppStore((s) => s.setSubtitle);
  const isSpeaking = useAppStore((s) => s.isSpeaking);
  const setIsSpeaking = useAppStore((s) => s.setIsSpeaking);
  const isListening = useAppStore((s) => s.isListening);
  const setIsListening = useAppStore((s) => s.setIsListening);
  const setAnimation = useAppStore((s) => s.setAnimation);
  const addMessage = useAppStore((s) => s.addMessage);
  const settings = useAppStore((s) => s.settings);

  const { transcribeAudio, isLoading: isTranscribing } = useAudioTranscription();
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isListening) {
      const wave = Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(waveAnim, {
            toValue: 0,
            duration: 600,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
      wave.start();
      return () => wave.stop();
    }
    waveAnim.setValue(0);
  }, [isListening, waveAnim]);

  useEffect(() => {
    setSubtitle(XP_INTRO_LINES[introIndex]);
  }, [introIndex, setSubtitle]);

  const speakXpResponse = useCallback(
    (xpText: string) => {
      addMessage("xp", xpText);
      setSubtitle(xpText);
      setAnimation("speaking");
      setIsSpeaking(true);
      if (settings.voiceEnabled) {
        speakWithScottishVoice(xpText, {
          rate: settings.voiceSpeed,
          onDone: () => {
            setIsSpeaking(false);
            setAnimation("idle");
          },
          onError: () => {
            setIsSpeaking(false);
            setAnimation("idle");
          },
        });
      } else {
        setTimeout(() => {
          setIsSpeaking(false);
          setAnimation("idle");
        }, 2000);
      }
    },
    [addMessage, setSubtitle, setAnimation, setIsSpeaking, settings]
  );

  const processUserMessage = useCallback(
    async (userText: string) => {
      const clean = userText.trim();
      if (!clean) return;

      addMessage("user", clean);
      setAnimation("thinking");
      setSubtitle("Mothership...");
      setIsThinking(true);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), MOTHERSHIP_TIMEOUT_MS);

      try {
        const response = await fetch(`${MOTHERSHIP}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: clean }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Mothership returned ${response.status}`);
        }

        const data = await response.json();
        const reply = data?.reply || data?.response || data?.message;
        if (!reply || typeof reply !== "string") {
          throw new Error("Mothership response did not contain a reply");
        }

        speakXpResponse(reply);
      } catch {
        speakXpResponse(localXpFallback(clean));
      } finally {
        clearTimeout(timeout);
        setIsThinking(false);
      }
    },
    [addMessage, setAnimation, setSubtitle, speakXpResponse]
  );

  const handleMicPress = useCallback(async () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      setAnimation("idle");
      return;
    }

    if (isListening) {
      setIsListening(false);
      setAnimation("thinking");
      setSubtitle("Processing your voice...");

      try {
        const audioUri = await stopAudioRecording();
        if (!audioUri) {
          setSubtitle("I didn't catch that.");
          setAnimation("idle");
          return;
        }

        const transcription = await transcribeAudio({ audioUri, language: "en" });
        if (typeof transcription === "string" && transcription.trim()) {
          await processUserMessage(transcription.trim());
        } else {
          setSubtitle("I didn't catch that.");
          setAnimation("idle");
        }
      } catch {
        setSubtitle("I couldn't hear that properly.");
        setAnimation("idle");
      }
      return;
    }

    const started = await startAudioRecording();
    if (started) {
      setIsListening(true);
      setAnimation("listening");
      setSubtitle("I'm listening...");
    } else {
      setSubtitle("Mic not available.");
      setAnimation("idle");
    }
  }, [
    isSpeaking,
    isListening,
    setIsSpeaking,
    setIsListening,
    setAnimation,
    setSubtitle,
    transcribeAudio,
    processUserMessage,
  ]);

  const handleStopSpeaking = useCallback(() => {
    stopSpeaking();
    setIsSpeaking(false);
    setAnimation("idle");
    setSubtitle("");
  }, [setIsSpeaking, setAnimation, setSubtitle]);

  const handleOpenPanel = useCallback(() => setShowPanel(true), []);
  const handleClosePanel = useCallback(() => setShowPanel(false), []);
  const handleNavigate = useCallback((screen: string) => {
    setShowPanel(false);
    setActiveScreen(screen as ActiveScreen);
  }, []);
  const handleBack = useCallback(() => setActiveScreen("home"), []);

  if (activeScreen !== "home") {
    switch (activeScreen) {
      case "modes": return <ModesPanel onBack={handleBack} />;
      case "memory": return <MemoryPanel onBack={handleBack} />;
      case "history": return <HistoryPanel onBack={handleBack} />;
      case "settings": return <SettingsPanel onBack={handleBack} />;
      case "voice": return <VoicePanel onBack={handleBack} />;
      case "camera": return <CameraPanel onBack={handleBack} />;
      case "text": return <TextInputPanel onBack={handleBack} />;
      case "permissions": return <PermissionsPanel onBack={handleBack} />;
      case "privacy": return <PrivacyPanel onBack={handleBack} />;
      case "about": return <AboutPanel onBack={handleBack} />;
      default: return null;
    }
  }

  const micScale = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });

  const isProcessing = isThinking || isTranscribing;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Pressable
        onPress={handleOpenPanel}
        style={{
          position: "absolute",
          top: insets.top + 12,
          right: 16,
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: "rgba(0, 229, 255, 0.08)",
          borderWidth: 1,
          borderColor: "rgba(0, 229, 255, 0.2)",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 50,
        }}
      >
        <Ionicons name="ellipsis-vertical" size={16} color={Colors.primaryGlow} />
      </Pressable>

      <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
        <XPFace />
      </View>

      <Pressable
        onPress={handleOpenPanel}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 140, zIndex: 1 }}
      />

      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingBottom: insets.bottom + 20,
          alignItems: "center",
          gap: 16,
          zIndex: 10,
        }}
      >
        {isListening && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 2, height: 20 }}>
            {Array.from({ length: 7 }).map((_, i) => (
              <Animated.View
                key={i}
                style={{
                  width: 3,
                  height: 12,
                  borderRadius: 1.5,
                  backgroundColor: Colors.primaryGlow,
                  opacity: 0.6,
                  transform: [{
                    scaleY: waveAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [
                        0.3 + Math.sin(i * 0.9) * 0.3,
                        0.7 + Math.cos(i * 0.7) * 0.5,
                      ],
                    }),
                  }],
                }}
              />
            ))}
          </View>
        )}

        <View style={{ paddingHorizontal: 40, minHeight: 40 }}>
          <Text style={{ fontFamily: Fonts.medium, fontSize: 16, color: Colors.text, textAlign: "center", lineHeight: 22 }}>
            {subtitleText.split("\n")[0]}
          </Text>
          {subtitleText.split("\n")[1] && (
            <Text style={{ fontFamily: Fonts.light, fontSize: 13, color: Colors.textDim, textAlign: "center", marginTop: 2 }}>
              {subtitleText.split("\n")[1]}
            </Text>
          )}
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
          <Animated.View style={{ transform: [{ scale: isListening ? micScale : 1 }] }}>
            <Pressable
              onPress={handleMicPress}
              disabled={isProcessing}
              style={({ pressed }) => ({
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: isListening
                  ? "rgba(0, 229, 255, 0.25)"
                  : pressed
                  ? "rgba(0, 229, 255, 0.2)"
                  : "rgba(0, 229, 255, 0.1)",
                borderWidth: 2,
                borderColor: isListening ? Colors.primaryGlow : "rgba(0, 229, 255, 0.4)",
                alignItems: "center",
                justifyContent: "center",
              })}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color={Colors.primaryGlow} />
              ) : (
                <Ionicons name={isListening ? "mic" : "mic-outline"} size={28} color={Colors.primaryGlow} />
              )}
            </Pressable>
          </Animated.View>

          {isSpeaking && (
            <Pressable
              onPress={handleStopSpeaking}
              style={({ pressed }) => ({
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: pressed ? "rgba(0, 229, 255, 0.2)" : "rgba(0, 229, 255, 0.08)",
                borderWidth: 1.5,
                borderColor: "rgba(0, 229, 255, 0.4)",
                alignItems: "center",
                justifyContent: "center",
              })}
            >
              <Ionicons name="stop" size={20} color={Colors.primaryGlow} />
            </Pressable>
          )}
        </View>
      </View>

      <ControlPanel visible={showPanel} onClose={handleClosePanel} onNavigate={handleNavigate} />
    </View>
  );
}
