import { useCallback } from "react";
import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Typography";
import { useAppStore } from "@/store/useAppStore";

interface PrivacyPanelProps {
  onBack: () => void;
}

export function PrivacyPanel({ onBack }: PrivacyPanelProps) {
  const clearAllMemories = useAppStore((s) => s.clearAllMemories);
  const clearConversations = useAppStore((s) => s.clearConversations);

  const handleClearAll = useCallback(() => {
    Alert.alert(
      "Wipe All Data",
      "This will permanently delete all memories, conversations, and preferences. XP starts fresh.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Wipe Everything",
          style: "destructive",
          onPress: () => {
            clearAllMemories();
            clearConversations();
          },
        },
      ]
    );
  }, [clearAllMemories, clearConversations]);

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
            Privacy
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 16 }}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        {/* Permissions status */}
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
          Permissions
        </Text>

        <PermissionRow
          icon="mic-outline"
          label="Microphone"
          description="Used for voice input and wake phrase"
          status="requested-on-use"
        />
        <PermissionRow
          icon="camera-outline"
          label="Camera"
          description="Used for visual analysis when you ask XP to look"
          status="requested-on-use"
        />

        {/* Data handling */}
        <Text
          style={{
            fontFamily: Fonts.semiBold,
            fontSize: 11,
            color: Colors.textDim,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            marginTop: 16,
          }}
        >
          Data Handling
        </Text>

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
          <InfoRow
            icon="phone-portrait-outline"
            text="All memories and conversations are stored locally on your device."
          />
          <InfoRow
            icon="cloud-offline-outline"
            text="No personal data is sent to external servers without your explicit action."
          />
          <InfoRow
            icon="shield-checkmark-outline"
            text="AI processing uses secure, authenticated endpoints with no data retention."
          />
          <InfoRow
            icon="trash-outline"
            text="You can wipe all data at any time — XP forgets everything instantly."
          />
        </View>

        {/* Clear data */}
        <Text
          style={{
            fontFamily: Fonts.semiBold,
            fontSize: 11,
            color: Colors.textDim,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            marginTop: 16,
          }}
        >
          Data Management
        </Text>

        <Pressable
          onPress={handleClearAll}
          style={({ pressed }) => ({
            paddingVertical: 16,
            borderRadius: 14,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: pressed ? Colors.alert : "rgba(255, 23, 68, 0.4)",
            backgroundColor: pressed ? "rgba(255, 23, 68, 0.15)" : "transparent",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          })}
        >
          <Ionicons name="nuclear-outline" size={20} color={Colors.alert} />
          <Text
            style={{
              fontFamily: Fonts.semiBold,
              fontSize: 14,
              color: Colors.alert,
            }}
          >
            Wipe All Data
          </Text>
        </Pressable>

        <Text
          style={{
            fontFamily: Fonts.regular,
            fontSize: 11,
            color: Colors.textDim,
            textAlign: "center",
            marginTop: 4,
          }}
        >
          Permanently deletes all memories, conversations, and preferences.
        </Text>
      </ScrollView>
    </View>
  );
}

function PermissionRow({
  icon,
  label,
  description,
  status,
}: {
  icon: string;
  label: string;
  description: string;
  status: string;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        borderRadius: 12,
        backgroundColor: Colors.tileBg,
        borderWidth: 1,
        borderColor: Colors.panelBorder,
        gap: 12,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: "rgba(0, 229, 255, 0.1)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={18} color={Colors.primaryGlow} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: Fonts.medium, fontSize: 14, color: Colors.text }}>{label}</Text>
        <Text style={{ fontFamily: Fonts.regular, fontSize: 11, color: Colors.textDim, marginTop: 2 }}>
          {description}
        </Text>
      </View>
      <View
        style={{
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 6,
          backgroundColor: "rgba(0, 230, 118, 0.1)",
          borderWidth: 1,
          borderColor: "rgba(0, 230, 118, 0.3)",
        }}
      >
        <Text style={{ fontFamily: Fonts.regular, fontSize: 9, color: "#00E676" }}>On Use</Text>
      </View>
    </View>
  );
}

function InfoRow({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
      <Ionicons
        name={icon as keyof typeof Ionicons.glyphMap}
        size={16}
        color={Colors.primaryGlow}
        style={{ marginTop: 2 }}
      />
      <Text
        style={{
          flex: 1,
          fontFamily: Fonts.regular,
          fontSize: 12,
          color: Colors.textDim,
          lineHeight: 17,
        }}
      >
        {text}
      </Text>
    </View>
  );
}
