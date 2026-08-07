import { useCallback } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors, ModeColors } from "@/constants/Colors";
import { Fonts } from "@/constants/Typography";
import { MODE_DESCRIPTIONS } from "@/constants/XPPersonality";
import { useAppStore } from "@/store/useAppStore";
import type { ModeType } from "@/store/types";

interface ModesPanelProps {
  onBack: () => void;
}

interface ModeItem {
  id: ModeType;
  label: string;
  icon: string;
  iconFamily: "ionicons" | "material";
  color: string;
}

const MODES: ModeItem[] = [
  { id: "engineering", label: "Engineering", icon: "hardware-chip-outline", iconFamily: "ionicons", color: ModeColors.engineering },
  { id: "boat", label: "Boat", icon: "boat-outline", iconFamily: "ionicons", color: ModeColors.boat },
  { id: "camping", label: "Camping", icon: "bonfire-outline", iconFamily: "ionicons", color: ModeColors.camping },
  { id: "exploration", label: "Exploration", icon: "compass-outline", iconFamily: "ionicons", color: ModeColors.exploration },
  { id: "thinking", label: "Thinking", icon: "brain", iconFamily: "material", color: ModeColors.thinking },
  { id: "listening", label: "Listening", icon: "ear-outline", iconFamily: "ionicons", color: ModeColors.listening },
  { id: "alert", label: "Alert", icon: "warning-outline", iconFamily: "ionicons", color: ModeColors.alert },
  { id: "idle", label: "Idle", icon: "radio-button-on-outline", iconFamily: "ionicons", color: ModeColors.idle },
];

export function ModesPanel({ onBack }: ModesPanelProps) {
  const currentMode = useAppStore((s) => s.currentMode);
  const setMode = useAppStore((s) => s.setMode);

  const handleModeSelect = useCallback(
    (mode: ModeType) => {
      setMode(mode);
    },
    [setMode]
  );

  const activeDescription = MODE_DESCRIPTIONS[currentMode];

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
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
          }}
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
            Modes
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <Text
        style={{
          fontFamily: Fonts.light,
          fontSize: 13,
          color: Colors.textDim,
          textAlign: "center",
          marginBottom: 20,
        }}
      >
        XP adapts to the mission.{"\n"}Tap a mode to activate.
      </Text>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Mode grid */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 12,
            justifyContent: "center",
          }}
        >
          {MODES.map((mode) => {
            const isActive = currentMode === mode.id;
            return (
              <Pressable
                key={mode.id}
                onPress={() => handleModeSelect(mode.id)}
                style={({ pressed }) => ({
                  width: 100,
                  height: 100,
                  borderRadius: 16,
                  borderCurve: "continuous",
                  backgroundColor: isActive
                    ? `${mode.color}15`
                    : pressed
                    ? "rgba(0, 229, 255, 0.08)"
                    : Colors.tileBg,
                  borderWidth: 1.5,
                  borderColor: isActive ? mode.color : Colors.panelBorder,
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                })}
              >
                {mode.iconFamily === "ionicons" ? (
                  <Ionicons
                    name={mode.icon as keyof typeof Ionicons.glyphMap}
                    size={28}
                    color={mode.color}
                  />
                ) : (
                  <MaterialCommunityIcons
                    name={mode.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                    size={28}
                    color={mode.color}
                  />
                )}
                <Text
                  style={{
                    fontFamily: Fonts.medium,
                    fontSize: 11,
                    color: Colors.text,
                    textAlign: "center",
                  }}
                >
                  {mode.label}
                </Text>
                {/* Active indicator dot */}
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: isActive ? mode.color : "rgba(255,255,255,0.2)",
                    position: "absolute",
                    bottom: 8,
                  }}
                />
              </Pressable>
            );
          })}
        </View>

        {/* Active mode info */}
        {activeDescription && (
          <View
            style={{
              marginTop: 24,
              padding: 16,
              borderRadius: 14,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: ModeColors[currentMode],
              backgroundColor: `${ModeColors[currentMode]}10`,
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.semiBold,
                fontSize: 15,
                color: ModeColors[currentMode],
                marginBottom: 4,
              }}
            >
              {activeDescription.name}
            </Text>
            <Text
              style={{
                fontFamily: Fonts.regular,
                fontSize: 13,
                color: Colors.textDim,
                lineHeight: 18,
              }}
            >
              {activeDescription.description}
            </Text>
            <View
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: ModeColors[currentMode],
              }}
            >
              <Text
                style={{
                  fontFamily: Fonts.semiBold,
                  fontSize: 10,
                  color: ModeColors[currentMode],
                  letterSpacing: 1,
                }}
              >
                ACTIVE
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
