import { useCallback, useMemo } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Typography";
import { useAppStore } from "@/store/useAppStore";

interface HistoryPanelProps {
  onBack: () => void;
}

export function HistoryPanel({ onBack }: HistoryPanelProps) {
  const conversations = useAppStore((s) => s.conversations);
  const clearConversations = useAppStore((s) => s.clearConversations);

  const groupedMessages = useMemo(() => {
    const groups: { date: string; messages: typeof conversations }[] = [];
    let currentDate = "";

    for (const msg of conversations) {
      const date = new Date(msg.timestamp).toLocaleDateString("en", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
      if (date !== currentDate) {
        currentDate = date;
        groups.push({ date, messages: [] });
      }
      groups[groups.length - 1].messages.push(msg);
    }

    return groups.reverse();
  }, [conversations]);

  const formatTime = useCallback((timestamp: number): string => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
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
            History
          </Text>
        </View>
        {conversations.length > 0 ? (
          <Pressable
            onPress={clearConversations}
            style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" }}
          >
            <Ionicons name="trash-outline" size={20} color="rgba(255, 23, 68, 0.6)" />
          </Pressable>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        {groupedMessages.length === 0 ? (
          <View style={{ alignItems: "center", paddingTop: 60 }}>
            <Ionicons name="chatbubbles-outline" size={48} color="rgba(0, 229, 255, 0.2)" />
            <Text
              style={{
                fontFamily: Fonts.regular,
                fontSize: 14,
                color: Colors.textDim,
                marginTop: 16,
                textAlign: "center",
              }}
            >
              No conversations yet.{"\n"}Start talking to build history.
            </Text>
          </View>
        ) : (
          groupedMessages.map((group) => (
            <View key={group.date} style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontFamily: Fonts.semiBold,
                  fontSize: 11,
                  color: Colors.textDim,
                  letterSpacing: 0.5,
                  marginBottom: 8,
                  textTransform: "uppercase",
                }}
              >
                {group.date}
              </Text>
              <View style={{ gap: 6 }}>
                {group.messages.map((msg) => (
                  <View
                    key={msg.id}
                    style={{
                      flexDirection: "row",
                      gap: 10,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRadius: 10,
                      backgroundColor: Colors.tileBg,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: Fonts.regular,
                        fontSize: 10,
                        color: Colors.textDim,
                        fontVariant: ["tabular-nums"],
                        marginTop: 2,
                      }}
                    >
                      {formatTime(msg.timestamp)}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontFamily: Fonts.regular,
                          fontSize: 13,
                          color: msg.role === "xp" ? Colors.primaryGlow : Colors.text,
                          lineHeight: 18,
                        }}
                        numberOfLines={3}
                      >
                        {msg.role === "xp" ? "XP: " : "You: "}
                        {msg.content}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
