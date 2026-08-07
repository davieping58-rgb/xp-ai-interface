import { View, Text, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Typography";

interface AboutPanelProps {
  onBack: () => void;
}

export function AboutPanel({ onBack }: AboutPanelProps) {
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
            About XP
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 20 }}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        {/* Identity card */}
        <View
          style={{
            padding: 24,
            borderRadius: 20,
            borderCurve: "continuous",
            backgroundColor: Colors.tileBg,
            borderWidth: 1,
            borderColor: Colors.panelBorder,
            alignItems: "center",
            gap: 16,
          }}
        >
          {/* XP icon */}
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: "rgba(0, 229, 255, 0.1)",
              borderWidth: 2,
              borderColor: Colors.primaryGlow,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.bold,
                fontSize: 28,
                color: Colors.primaryGlow,
                letterSpacing: 2,
              }}
            >
              XP
            </Text>
          </View>

          <Text
            style={{
              fontFamily: Fonts.bold,
              fontSize: 24,
              color: Colors.text,
              letterSpacing: 2,
            }}
          >
            XP
          </Text>

          <Text
            style={{
              fontFamily: Fonts.light,
              fontSize: 14,
              color: Colors.primaryGlow,
              textAlign: "center",
              letterSpacing: 0.5,
            }}
          >
            Holographic AI Companion
          </Text>

          <View
            style={{
              width: "100%",
              height: 1,
              backgroundColor: Colors.panelBorder,
              marginVertical: 4,
            }}
          />

          <Text
            style={{
              fontFamily: Fonts.regular,
              fontSize: 14,
              color: Colors.text,
              textAlign: "center",
              lineHeight: 22,
              paddingHorizontal: 8,
            }}
          >
            XP is your AI teammate. Not a chatbot. Not an assistant. A companion.
          </Text>
        </View>

        {/* Details */}
        <View
          style={{
            padding: 16,
            borderRadius: 14,
            backgroundColor: Colors.tileBg,
            borderWidth: 1,
            borderColor: Colors.panelBorder,
            gap: 14,
          }}
        >
          <DetailRow label="Version" value="1.0.0" />
          <DetailRow label="Personality" value="Warm, intelligent, cheeky" />
          <DetailRow label="Voice" value="Scottish male, warm and intelligent" />
          <DetailRow label="Architecture" value="Local-first, AI-powered" />
          <DetailRow label="Memory" value="On-device, user-controlled" />
        </View>

        {/* Origin story */}
        <View
          style={{
            padding: 20,
            borderRadius: 14,
            backgroundColor: Colors.tileBg,
            borderWidth: 1,
            borderColor: Colors.panelBorder,
            gap: 10,
          }}
        >
          <Text
            style={{
              fontFamily: Fonts.semiBold,
              fontSize: 13,
              color: Colors.primaryGlow,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            Origin
          </Text>
          <Text
            style={{
              fontFamily: Fonts.regular,
              fontSize: 13,
              color: Colors.textDim,
              lineHeight: 20,
            }}
          >
            XP was designed to be something different. Not another chatbot in a text box. Not
            another assistant waiting to be told what to do. XP is a presence — an intelligence
            that lives in your device, learns who you are, and stands beside you.
          </Text>
          <Text
            style={{
              fontFamily: Fonts.regular,
              fontSize: 13,
              color: Colors.textDim,
              lineHeight: 20,
            }}
          >
            Built with the philosophy that AI should feel like a teammate, not a tool. XP adapts
            to your mission, remembers your world, and speaks with his own voice.
          </Text>
        </View>

        {/* Capabilities */}
        <View
          style={{
            padding: 20,
            borderRadius: 14,
            backgroundColor: Colors.tileBg,
            borderWidth: 1,
            borderColor: Colors.panelBorder,
            gap: 10,
          }}
        >
          <Text
            style={{
              fontFamily: Fonts.semiBold,
              fontSize: 13,
              color: Colors.primaryGlow,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            Capabilities
          </Text>
          <CapabilityRow icon="chatbubbles-outline" text="Natural conversation with memory" />
          <CapabilityRow icon="eye-outline" text="Camera vision and image analysis" />
          <CapabilityRow icon="mic-outline" text="Voice interaction" />
          <CapabilityRow icon="bulb-outline" text="8 adaptive modes" />
          <CapabilityRow icon="shield-checkmark-outline" text="Privacy-first local storage" />
        </View>
      </ScrollView>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
      <Text style={{ fontFamily: Fonts.regular, fontSize: 13, color: Colors.textDim }}>{label}</Text>
      <Text style={{ fontFamily: Fonts.medium, fontSize: 13, color: Colors.text }}>{value}</Text>
    </View>
  );
}

function CapabilityRow({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 }}>
      <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={16} color={Colors.primaryGlow} />
      <Text style={{ fontFamily: Fonts.regular, fontSize: 13, color: Colors.text }}>{text}</Text>
    </View>
  );
}
