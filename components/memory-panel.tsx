import { useCallback, useState, useMemo } from "react";
import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Typography";
import { useAppStore } from "@/store/useAppStore";
import type { MemoryType, XPMemory } from "@/store/types";

interface MemoryPanelProps {
  onBack: () => void;
}

type FilterType = "all" | MemoryType;

const FILTERS: { id: FilterType; label: string }[] = [
  { id: "all", label: "All" },
  { id: "fact", label: "Facts" },
  { id: "preference", label: "Preferences" },
  { id: "project", label: "Projects" },
  { id: "routine", label: "Routines" },
];

const TYPE_COLORS: Record<MemoryType, string> = {
  fact: "#00E5FF",
  preference: "#7B2FBE",
  routine: "#FFB300",
  project: "#FF6D00",
};

const TYPE_ICONS: Record<MemoryType, { name: string; family: "ionicons" | "material" }> = {
  fact: { name: "bulb-outline", family: "ionicons" },
  preference: { name: "person-outline", family: "ionicons" },
  routine: { name: "alarm-outline", family: "ionicons" },
  project: { name: "rocket-outline", family: "ionicons" },
};

export function MemoryPanel({ onBack }: MemoryPanelProps) {
  const memories = useAppStore((s) => s.memories);
  const removeMemory = useAppStore((s) => s.removeMemory);
  const clearAllMemories = useAppStore((s) => s.clearAllMemories);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const filteredMemories = useMemo(() => {
    if (activeFilter === "all") return memories;
    return memories.filter((m) => m.type === activeFilter);
  }, [memories, activeFilter]);

  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert(
        "Remove Memory",
        "XP will forget this. Are you sure?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Forget", style: "destructive", onPress: () => removeMemory(id) },
        ]
      );
    },
    [removeMemory]
  );

  const handleClearAll = useCallback(() => {
    Alert.alert(
      "Clear All Memory",
      "XP will forget everything about you. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear All", style: "destructive", onPress: clearAllMemories },
      ]
    );
  }, [clearAllMemories]);

  const formatDate = useCallback((timestamp: number): string => {
    const date = new Date(timestamp);
    const day = date.getDate();
    const month = date.toLocaleString("en", { month: "short" });
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${day} ${month} ${year}, ${hours}:${minutes}`;
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
          paddingBottom: 8,
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
            Memory
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
          marginBottom: 16,
          paddingHorizontal: 40,
        }}
      >
        {"Here's what I remember about you."}{"\n"}{"I learn so we can do more together."}
      </Text>

      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, marginBottom: 12 }}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
      >
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter.id;
          return (
            <Pressable
              key={filter.id}
              onPress={() => setActiveFilter(filter.id)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 12,
                backgroundColor: isActive ? "rgba(0, 229, 255, 0.15)" : "transparent",
                borderWidth: 1,
                borderColor: isActive ? Colors.primaryGlow : "transparent",
              }}
            >
              <Text
                style={{
                  fontFamily: isActive ? Fonts.semiBold : Fonts.regular,
                  fontSize: 12,
                  color: isActive ? Colors.primaryGlow : Colors.textDim,
                }}
              >
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Memory list */}
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, gap: 10 }}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        {filteredMemories.length === 0 ? (
          <View style={{ alignItems: "center", paddingTop: 60 }}>
            <MaterialCommunityIcons name="brain" size={48} color="rgba(0, 229, 255, 0.2)" />
            <Text
              style={{
                fontFamily: Fonts.regular,
                fontSize: 14,
                color: Colors.textDim,
                marginTop: 16,
                textAlign: "center",
              }}
            >
              {"No memories yet."}{"\n"}{"Talk to XP and I'll remember what matters."}
            </Text>
          </View>
        ) : (
          filteredMemories.map((memory) => (
            <MemoryCard
              key={memory.id}
              memory={memory}
              onDelete={handleDelete}
              formatDate={formatDate}
            />
          ))
        )}

        {/* Clear all button */}
        {memories.length > 0 && (
          <Pressable
            onPress={handleClearAll}
            style={({ pressed }) => ({
              marginTop: 20,
              paddingVertical: 14,
              borderRadius: 14,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: pressed ? Colors.alert : "rgba(255, 23, 68, 0.4)",
              backgroundColor: pressed ? "rgba(255, 23, 68, 0.15)" : "transparent",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            })}
          >
            <Ionicons name="trash-outline" size={18} color={Colors.alert} />
            <Text
              style={{
                fontFamily: Fonts.semiBold,
                fontSize: 14,
                color: Colors.alert,
              }}
            >
              Clear All Memory
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

function MemoryCard({
  memory,
  onDelete,
  formatDate,
}: {
  memory: XPMemory;
  onDelete: (id: string) => void;
  formatDate: (ts: number) => string;
}) {
  const typeColor = TYPE_COLORS[memory.type];
  const typeIcon = TYPE_ICONS[memory.type];

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        borderRadius: 12,
        borderCurve: "continuous",
        backgroundColor: Colors.tileBg,
        borderWidth: 1,
        borderColor: Colors.panelBorder,
        gap: 12,
      }}
    >
      {/* Icon */}
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: `${typeColor}20`,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons
          name={typeIcon.name as keyof typeof Ionicons.glyphMap}
          size={18}
          color={typeColor}
        />
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: Fonts.regular,
            fontSize: 13,
            color: Colors.text,
            lineHeight: 18,
          }}
          numberOfLines={2}
        >
          {memory.content}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 }}>
          <Text
            style={{
              fontFamily: Fonts.semiBold,
              fontSize: 10,
              color: typeColor,
              textTransform: "lowercase",
            }}
          >
            {memory.type}
          </Text>
          <Text
            style={{
              fontFamily: Fonts.regular,
              fontSize: 10,
              color: Colors.textDim,
            }}
          >
            {formatDate(memory.timestamp)}
          </Text>
        </View>
      </View>

      {/* Delete */}
      <Pressable
        onPress={() => onDelete(memory.id)}
        style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }}
      >
        <Ionicons name="trash-outline" size={18} color="rgba(255, 23, 68, 0.6)" />
      </Pressable>
    </View>
  );
}
