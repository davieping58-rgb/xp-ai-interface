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
import { XP_SYSTEM_PROMPT, XP_INTRO_LINES } from "@/constants/XPPersonality";
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
import { AboutPanel } from "@/components/about-panel";
import { useAppStore } from "@/store/useAppStore";
import { useTextGeneration, useAudioTranscription } from "@fastshot/ai";
import { speakWithScottishVoice, stopSpeaking } from "@/utils/speech";
import { startAudioRecording, stopAudioRecording } from "@/utils/audio-recorder";

type ActiveScreen =
  | "home"
  | "modes"
  | "memory"
  | "history"
  | "settings"
  | "voice"
  | "camera"
  | "text"
  | "privacy"
  | "about";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [showPanel, setShowPanel] = useState(false);
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>("home");
  const [introIndex] = useState(() => Math.floor(Math.random() * XP_INTRO_LINES.length));

  // Store state
  const subtitleText = useAppStore((s) => s.subtitleText);
  const setSubtitle = useAppStore((s) => s.setSubtitle);
  const isSpeaking = useAppStore((s) => s.isSpeaking);
  const setIsSpeaking = useAppStore((s) => s.setIsSpeaking);
  const isListening = useAppStore((s) => s.isListening);
  const setIsListening = useAppStore((s) => s.setIsListening);
  const setAnimation = useAppStore((s) => s.setAnimation);
  const addMessage = useAppStore((s) => s.addMessage);
  const settings = useAppStore((s) => s.settings);
  const memories = useAppStore((s) => s.memories);
  const conversations = useAppStore((s) => s.conversations);
  const currentMode = useAppStore((s) => s.currentMode);

  const { generateText, isLoading: isThinking } = useTextGeneration();
  const { transcribeAudio, isLoading: isTranscribing } = useAudioTranscription();

  // Audio wave animation for mic
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

  // Set intro subtitle on mount
  useEffect(() => {
    setSubtitle(XP_INTRO_LINES[introIndex]);
  }, [introIndex, setSubtitle]);

  // Shared: build prompt context from store state
  const buildPromptContext = useCallback(() => {
    const memoryContext =
      memories.length > 0
        ? `\n\nUser memories: ${memories.map((m) => m.content).join("; ")}`
        : "";
    const recentMessages = conversations
      .slice(-6)
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n");
    return { memoryContext, recentMessages };
  }, [memories, conversations]);

  // Shared: speak XP response and update state
  const speakXpResponse = useCallback(
    (xpText: string) => {
      addMessage("xp", xpText);
      setSubtitle(xpText);
      setAnimation("speaking");
      setIsSpeaking(true);
      if (settings.voiceEnabled) {
        speakWithScottishVoice(xpText, {
          rate: settings.voiceSpeed,
          onDone: () => { setIsSpeaking(false); setAnimation("idle"); },
          onError: () => { setIsSpeaking(false); setAnimation("idle"); },
        });
      } else {
        setTimeout(() => { setIsSpeaking(false); setAnimation("idle"); }, 2000);
      }
    },
    [addMessage, setSubtitle, setAnimation, setIsSpeaking, settings]
  );

  // Process transcribed text through AI and respond
  const processUserMessage = useCallback(async (userText: string) => {
    try {
      addMessage("user", userText);
      setAnimation("thinking");
      setSubtitle("Thinking...");

      const { memoryContext, recentMessages } = buildPromptContext();
      const prompt = `${XP_SYSTEM_PROMPT}${memoryContext}\n\nCurrent mode: ${currentMode}\n\nRecent conversation:\n${recentMessages}\n\nuser: ${userText}\nxp:`;
      const response = await generateText(prompt);
      if (response) {
        speakXpResponse(typeof response === "string" ? response : String(response));
      } else {
        setSubtitle("Hmm, I lost my train of thought. Try again?");
        setAnimation("idle");
      }
    } catch {
      setSubtitle("Something went wrong. Give it another go.");
      setAnimation("idle");
    }
  }, [addMessage, buildPromptContext, currentMode, generateText, speakXpResponse, setSubtitle, setAnimation]);

  // Handle fallback when transcription fails or returns empty
  const handleFallbackResponse = useCallback(async () => {
    setAnimation("thinking");
    setSubtitle("Thinking...");
    const { memoryContext, recentMessages } = buildPromptContext();
    const prompt = `${XP_SYSTEM_PROMPT}${memoryContext}\n\nCurrent mode: ${currentMode}\n\nRecent conversation:\n${recentMessages}\n\nThe user just spoke to you. Respond naturally and briefly, acknowledging them.`;
    try {
      const response = await generateText(prompt);
      if (response) speakXpResponse(typeof response === "string" ? response : String(response));
      else {
        setSubtitle("Ready when you are.");
        setAnimation("idle");
      }
    } catch {
      setSubtitle("Something went wrong. Give it another go.");
      setAnimation("idle");
    }
  }, [buildPromptContext, currentMode, generateText, speakXpResponse, setSubtitle, setAnimation]);

  // Mic press handler — start/stop recording
  const handleMicPress = useCallback(async () => {
    // If XP is speaking, stop him
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      setAnimation("idle");
      return;
    }

    // If currently listening, stop and process
    if (isListening) {
      setIsListening(false);
      setAnimation("thinking");
      setSubtitle("Processing your voice...");

      try {
        const audioUri = await stopAudioRecording();

        if (audioUri) {
          // Transcribe the audio
          const transcription = await transcribeAudio({ audioUri, language: "en" });

          if (transcription && typeof transcription === "string" && transcription.trim().length > 0) {
            // Successfully transcribed — process the message
            await processUserMessage(transcription.trim());
          } else {
            // Transcription empty — respond naturally
            await handleFallbackResponse();
          }
        } else {
          // No audio URI returned — respond with fallback
          await handleFallbackResponse();
        }
      } catch {
        // Transcription failed — respond naturally
        await handleFallbackResponse();
      }
    } else {
      // Start recording
      const started = await startAudioRecording();
      if (started) {
        setIsListening(true);
        setAnimation("listening");
        setSubtitle("I'm listening...");
      } else {
        setSubtitle("Mic not available. Try text input instead.");
        setAnimation("idle");
      }
    }
  }, [
    isSpeaking, isListening,
    setIsSpeaking, setIsListening, setAnimation, setSubtitle,
    transcribeAudio, processUserMessage, handleFallbackResponse,
  ]);

  const handleStopSpeaking = useCallback(() => {
    stopSpeaking();
    setIsSpeaking(false);
    setAnimation("idle");
    setSubtitle("");
  }, [setIsSpeaking, setAnimation, setSubtitle]);

  const handleOpenPanel = useCallback(() => {
    setShowPanel(true);
  }, []);

  const handleClosePanel = useCallback(() => {
    setShowPanel(false);
  }, []);

  const handleNavigate = useCallback((screen: string) => {
    setShowPanel(false);
    setActiveScreen(screen as ActiveScreen);
  }, []);

  const handleBack = useCallback(() => {
    setActiveScreen("home");
  }, []);

  // Render active sub-screen
  if (activeScreen !== "home") {
    switch (activeScreen) {
      case "modes":
        return <ModesPanel onBack={handleBack} />;
      case "memory":
        return <MemoryPanel onBack={handleBack} />;
      case "history":
        return <HistoryPanel onBack={handleBack} />;
      case "settings":
        return <SettingsPanel onBack={handleBack} />;
      case "voice":
        return <VoicePanel onBack={handleBack} />;
      case "camera":
        return <CameraPanel onBack={handleBack} />;
      case "text":
        return <TextInputPanel onBack={handleBack} />;
      case "privacy":
        return <PrivacyPanel onBack={handleBack} />;
      case "about":
        return <AboutPanel onBack={handleBack} />;
      default:
        return null;
    }
  }

  const micScale = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });

  const isProcessing = isThinking || isTranscribing;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Options button - top right */}
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

      {/* XP Face — full-screen background layer */}
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
        <XPFace />
      </View>

      {/* Bottom section - subtitle + controls */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingBottom: insets.bottom + 20,
          alignItems: "center",
          gap: 16,
        }}
      >
        {/* Audio wave visualization when listening */}
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
                  transform: [
                    {
                      scaleY: waveAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [
                          0.3 + Math.sin(i * 0.9) * 0.3,
                          0.7 + Math.cos(i * 0.7) * 0.5,
                        ],
                      }),
                    },
                  ],
                }}
              />
            ))}
          </View>
        )}

        {/* Subtitle text */}
        <View style={{ paddingHorizontal: 40, minHeight: 40 }}>
          <Text
            style={{
              fontFamily: Fonts.medium,
              fontSize: 16,
              color: Colors.text,
              textAlign: "center",
              lineHeight: 22,
            }}
          >
            {subtitleText.split("\n")[0]}
          </Text>
          {subtitleText.split("\n")[1] && (
            <Text
              style={{
                fontFamily: Fonts.light,
                fontSize: 13,
                color: Colors.textDim,
                textAlign: "center",
                marginTop: 2,
              }}
            >
              {subtitleText.split("\n")[1]}
            </Text>
          )}
        </View>

        {/* Control buttons */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
          {/* Mic button */}
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
                <Ionicons
                  name={isListening ? "mic" : "mic-outline"}
                  size={28}
                  color={Colors.primaryGlow}
                />
              )}
            </Pressable>
          </Animated.View>

          {/* Stop button - only when speaking */}
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

      {/* Holographic Control Panel overlay */}
      <ControlPanel visible={showPanel} onClose={handleClosePanel} onNavigate={handleNavigate} />
    </View>
  );
}
