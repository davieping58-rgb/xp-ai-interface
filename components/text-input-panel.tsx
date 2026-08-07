import { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Typography";
import { useAppStore } from "@/store/useAppStore";
import { useTextGeneration } from "@fastshot/ai";
import { XP_SYSTEM_PROMPT } from "@/constants/XPPersonality";
import { speakWithScottishVoice } from "@/utils/speech";

interface TextInputPanelProps {
  onBack: () => void;
}

export function TextInputPanel({ onBack }: TextInputPanelProps) {
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<ScrollView>(null);
  const conversations = useAppStore((s) => s.conversations);
  const addMessage = useAppStore((s) => s.addMessage);
  const addMemory = useAppStore((s) => s.addMemory);
  const settings = useAppStore((s) => s.settings);
  const memories = useAppStore((s) => s.memories);
  const currentMode = useAppStore((s) => s.currentMode);
  const setAnimation = useAppStore((s) => s.setAnimation);

  const { generateText, isLoading } = useTextGeneration();

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;

    setInputText("");
    addMessage("user", text);

    // Auto-save explicit "remember" requests as facts
    const rememberMatch = text.match(/^(?:remember|note|save)[:\s]+(.+)/i);
    if (rememberMatch?.[1] && settings.memoryEnabled) {
      addMemory("fact", rememberMatch[1].trim());
    }

    try {
      setAnimation("thinking");

      // Build context with memories
      const memoryContext = memories.length > 0
        ? `\n\nUser memories: ${memories.map((m) => m.content).join("; ")}`
        : "";

      const recentMessages = conversations.slice(-10).map((m) => `${m.role}: ${m.content}`).join("\n");

      const fullPrompt = `${XP_SYSTEM_PROMPT}${memoryContext}\n\nCurrent mode: ${currentMode}\n\nRecent conversation:\n${recentMessages}\n\nuser: ${text}\nxp:`;

      const response = await generateText(fullPrompt);

      if (response) {
        const xpResponse = typeof response === "string" ? response : String(response);
        addMessage("xp", xpResponse);
        setAnimation("speaking");

        if (settings.voiceEnabled) {
          speakWithScottishVoice(xpResponse, {
            rate: settings.voiceSpeed,
            onDone: () => setAnimation("idle"),
            onError: () => setAnimation("idle"),
          });
        } else {
          setTimeout(() => setAnimation("idle"), 1500);
        }
      }
    } catch {
      const errMsg = "Something went sideways. Give it another shot.";
      addMessage("xp", errMsg);
      setAnimation("idle");
    }

    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [inputText, isLoading, addMessage, addMemory, generateText, memories, conversations, currentMode, settings, setAnimation]);

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: Colors.background }} behavior="padding">
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
            Text Input
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 8 }}
        showsVerticalScrollIndicator={false}
      >
        {conversations.slice(-20).map((msg) => (
          <View
            key={msg.id}
            style={{
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "80%",
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 14,
              borderCurve: "continuous",
              backgroundColor:
                msg.role === "user" ? "rgba(0, 229, 255, 0.12)" : Colors.tileBg,
              borderWidth: 1,
              borderColor:
                msg.role === "user" ? "rgba(0, 229, 255, 0.3)" : Colors.panelBorder,
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.regular,
                fontSize: 14,
                color: msg.role === "xp" ? Colors.primaryGlow : Colors.text,
                lineHeight: 20,
              }}
              selectable
            >
              {msg.content}
            </Text>
          </View>
        ))}
        {isLoading && (
          <View
            style={{
              alignSelf: "flex-start",
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 14,
              backgroundColor: Colors.tileBg,
              borderWidth: 1,
              borderColor: Colors.panelBorder,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <ActivityIndicator size="small" color={Colors.primaryGlow} />
            <Text style={{ fontFamily: Fonts.regular, fontSize: 13, color: Colors.textDim }}>
              XP is thinking...
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Input bar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 12,
          paddingVertical: 12,
          paddingBottom: 32,
          borderTopWidth: 1,
          borderTopColor: Colors.panelBorder,
          backgroundColor: Colors.panelGlass,
          gap: 8,
        }}
      >
        <TextInput
          style={{
            flex: 1,
            height: 44,
            borderRadius: 12,
            backgroundColor: "rgba(0, 20, 50, 0.8)",
            borderWidth: 1,
            borderColor: Colors.panelBorder,
            paddingHorizontal: 14,
            fontFamily: Fonts.regular,
            fontSize: 14,
            color: Colors.text,
          }}
          placeholder="Type something to XP..."
          placeholderTextColor={Colors.textDim}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          editable={!isLoading}
        />
        <Pressable
          onPress={handleSend}
          disabled={!inputText.trim() || isLoading}
          style={({ pressed }) => ({
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor:
              !inputText.trim() || isLoading
                ? "rgba(0, 229, 255, 0.05)"
                : pressed
                ? "rgba(0, 229, 255, 0.3)"
                : "rgba(0, 229, 255, 0.15)",
            borderWidth: 1,
            borderColor:
              !inputText.trim() || isLoading ? Colors.panelBorder : Colors.primaryGlow,
            alignItems: "center",
            justifyContent: "center",
          })}
        >
          <Ionicons
            name="send"
            size={18}
            color={!inputText.trim() || isLoading ? Colors.textDim : Colors.primaryGlow}
          />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
