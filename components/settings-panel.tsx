import { useCallback } from "react";
import { View, Text, Pressable, ScrollView, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Typography";
import { useAppStore } from "@/store/useAppStore";

interface SettingsPanelProps {
  onBack: () => void;
}

export function SettingsPanel({ onBack }: SettingsPanelProps) {
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);

  const handleVoiceToggle = useCallback(
    (value: boolean) => {
      updateSettings({ voiceEnabled: value });
    },
    [updateSettings]
  );

  const handleMemoryToggle = useCallback(
    (value: boolean) => {
      updateSettings({ memoryEnabled: value });
    },
    [updateSettings]
  );

  const handleWakeToggle = useCallback(
    (value: boolean) => {
      updateSettings({ wakePhraseEnabled: value });
    },
    [updateSettings]
  );

  const handleSpeedChange = useCallback(
    (speed: number) => {
      updateSettings({ voiceSpeed: speed });
    },
    [updateSettings]
  );

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
            Settings
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 16 }}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        {/* Voice section */}
        <SectionHeader title="Voice" />
        <SettingRow
          label="Voice Output"
          description="XP speaks responses aloud"
          value={settings.voiceEnabled}
          onToggle={handleVoiceToggle}
        />
        <SettingRow
          label="Wake Phrase"
          description="Say 'XP, options' to open control panel"
          value={settings.wakePhraseEnabled}
          onToggle={handleWakeToggle}
        />

        {/* Voice speed */}
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
            Voice Speed
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {[0.75, 1.0, 1.25, 1.5].map((speed) => (
              <Pressable
                key={speed}
                onPress={() => handleSpeedChange(speed)}
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
                    fontSize: 13,
                    color: settings.voiceSpeed === speed ? Colors.primaryGlow : Colors.textDim,
                  }}
                >
                  {speed}x
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Memory section */}
        <SectionHeader title="Memory" />
        <SettingRow
          label="Persistent Memory"
          description="XP remembers facts, preferences, and routines"
          value={settings.memoryEnabled}
          onToggle={handleMemoryToggle}
        />

        {/* Input section */}
        <SectionHeader title="Input Mode" />
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
            Listening Mode
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {(["push-to-talk", "always-on"] as const).map((mode) => (
              <Pressable
                key={mode}
                onPress={() => updateSettings({ listeningMode: mode })}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor:
                    settings.listeningMode === mode ? "rgba(0, 229, 255, 0.15)" : "transparent",
                  borderWidth: 1,
                  borderColor:
                    settings.listeningMode === mode ? Colors.primaryGlow : Colors.panelBorder,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: settings.listeningMode === mode ? Fonts.semiBold : Fonts.regular,
                    fontSize: 12,
                    color: settings.listeningMode === mode ? Colors.primaryGlow : Colors.textDim,
                  }}
                >
                  {mode === "push-to-talk" ? "Push to Talk" : "Always On"}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <Text
      style={{
        fontFamily: Fonts.semiBold,
        fontSize: 11,
        color: Colors.textDim,
        letterSpacing: 1.5,
        textTransform: "uppercase",
        marginTop: 8,
      }}
    >
      {title}
    </Text>
  );
}

function SettingRow({
  label,
  description,
  value,
  onToggle,
}: {
  label: string;
  description: string;
  value: boolean;
  onToggle: (val: boolean) => void;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 12,
        backgroundColor: Colors.tileBg,
        borderWidth: 1,
        borderColor: Colors.panelBorder,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: Fonts.medium, fontSize: 14, color: Colors.text }}>
          {label}
        </Text>
        <Text style={{ fontFamily: Fonts.regular, fontSize: 11, color: Colors.textDim, marginTop: 2 }}>
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: "rgba(255,255,255,0.1)", true: "rgba(0, 229, 255, 0.3)" }}
        thumbColor={value ? Colors.primaryGlow : "#555"}
      />
    </View>
  );
}
