import { useCallback, useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Typography";
import { useAppStore } from "@/store/useAppStore";
import * as Speech from "expo-speech";

interface VoicePanelProps {
  onBack: () => void;
}

export function VoicePanel({ onBack }: VoicePanelProps) {
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const [isTesting, setIsTesting] = useState(false);

  const handleVoiceTest = useCallback(async () => {
    try {
      setIsTesting(true);
      await Speech.speak("Hey, it's XP. Sounds like we're all good here.", {
        rate: settings.voiceSpeed,
        pitch: 1.0,
        language: "en-GB",
        onDone: () => setIsTesting(false),
        onError: () => setIsTesting(false),
      });
    } catch {
      setIsTesting(false);
    }
  }, [settings.voiceSpeed]);

  const handleStopTest = useCallback(() => {
    Speech.stop();
    setIsTesting(false);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingTop: 56,
          paddingBottom: 12,
        }}
      >
        <Pressable
          onPress={onBack}
          style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" }}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.primaryGlow} />
        </Pressable>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text
            style={{
              fontFamily: Fonts.bold,
              fontSize: 20,
              color: Colors.primaryGlow,
              letterSpacing: 1,
            }}
          >
            Voice
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 16 }}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        {/* Voice test */}
        <View
          style={{
            padding: 20,
            borderRadius: 16,
            borderCurve: "continuous",
            backgroundColor: Colors.tileBg,
            borderWidth: 1,
            borderColor: Colors.panelBorder,
            alignItems: "center",
            gap: 16,
          }}
        >
          <Ionicons name="mic" size={40} color={Colors.primaryGlow} />
          <Text
            style={{
              fontFamily: Fonts.medium,
              fontSize: 15,
              color: Colors.text,
              textAlign: "center",
            }}
          >
            {"Test XP's Voice"}
          </Text>
          <Text
            style={{
              fontFamily: Fonts.regular,
              fontSize: 12,
              color: Colors.textDim,
              textAlign: "center",
            }}
          >
            Hear how XP sounds with current settings
          </Text>

          <Pressable
            onPress={isTesting ? handleStopTest : handleVoiceTest}
            disabled={false}
            style={({ pressed }) => ({
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 10,
              backgroundColor: pressed
                ? "rgba(0, 229, 255, 0.25)"
                : isTesting
                ? "rgba(255, 23, 68, 0.15)"
                : "rgba(0, 229, 255, 0.15)",
              borderWidth: 1,
              borderColor: isTesting ? Colors.alert : Colors.primaryGlow,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            })}
          >
            {isTesting ? (
              <>
                <ActivityIndicator size="small" color={Colors.alert} />
                <Text style={{ fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.alert }}>
                  Stop
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="volume-high" size={18} color={Colors.primaryGlow} />
                <Text style={{ fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.primaryGlow }}>
                  Play Test
                </Text>
              </>
            )}
          </Pressable>
        </View>

        {/* Speed control */}
        <View
          style={{
            padding: 16,
            borderRadius: 12,
            backgroundColor: Colors.tileBg,
            borderWidth: 1,
            borderColor: Colors.panelBorder,
          }}
        >
          <Text style={{ fontFamily: Fonts.medium, fontSize: 14, color: Colors.text, marginBottom: 12 }}>
            Speech Rate
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((speed) => (
              <Pressable
                key={speed}
                onPress={() => updateSettings({ voiceSpeed: speed })}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 8,
                  backgroundColor:
                    settings.voiceSpeed === speed ? "rgba(0, 229, 255, 0.15)" : "transparent",
                  borderWidth: 1,
                  borderColor:
                    settings.voiceSpeed === speed ? Colors.primaryGlow : Colors.panelBorder,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: settings.voiceSpeed === speed ? Fonts.semiBold : Fonts.regular,
                    fontSize: 11,
                    color: settings.voiceSpeed === speed ? Colors.primaryGlow : Colors.textDim,
                  }}
                >
                  {speed}x
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Listening mode */}
        <View
          style={{
            padding: 16,
            borderRadius: 12,
            backgroundColor: Colors.tileBg,
            borderWidth: 1,
            borderColor: Colors.panelBorder,
            gap: 12,
          }}
        >
          <Text style={{ fontFamily: Fonts.medium, fontSize: 14, color: Colors.text }}>
            Microphone Mode
          </Text>
          <View style={{ gap: 8 }}>
            {(["push-to-talk", "always-on"] as const).map((mode) => (
              <Pressable
                key={mode}
                onPress={() => updateSettings({ listeningMode: mode })}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  borderRadius: 10,
                  backgroundColor:
                    settings.listeningMode === mode ? "rgba(0, 229, 255, 0.1)" : "transparent",
                  borderWidth: 1,
                  borderColor:
                    settings.listeningMode === mode ? Colors.primaryGlow : Colors.panelBorder,
                  gap: 12,
                }}
              >
                <Ionicons
                  name={settings.listeningMode === mode ? "radio-button-on" : "radio-button-off"}
                  size={18}
                  color={settings.listeningMode === mode ? Colors.primaryGlow : Colors.textDim}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: Fonts.medium,
                      fontSize: 13,
                      color: settings.listeningMode === mode ? Colors.primaryGlow : Colors.text,
                    }}
                  >
                    {mode === "push-to-talk" ? "Push to Talk" : "Always Listening"}
                  </Text>
                  <Text
                    style={{ fontFamily: Fonts.regular, fontSize: 11, color: Colors.textDim, marginTop: 2 }}
                  >
                    {mode === "push-to-talk"
                      ? "Tap and hold to speak"
                      : "XP listens continuously (uses more battery)"}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
