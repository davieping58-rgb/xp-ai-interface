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
import { speakWithScottishVoice } from "@/utils/speech";

const MOTHERSHIP = "https://mothership.tailaa7a43.ts.net";
const MOTHERSHIP_TIMEOUT_MS = 10000;

interface TextInputPanelProps {
  onBack: () => void;
}

export function TextInputPanel({ onBack }: TextInputPanelProps) {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const conversations = useAppStore((s) => s.conversations);
  const addMessage = useAppStore((s) => s.addMessage);
  const addMemory = useAppStore((s) => s.addMemory);
  const settings = useAppStore((s) => s.settings);
  const setAnimation = useAppStore((s) => s.setAnimation);

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;

    setInputText("");
    addMessage("user", text);

    const rememberMatch = text.match(/^(?:remember|note|save)[:\s]+(.+)/i);
    if (rememberMatch?.[1] && settings.memoryEnabled) {
      addMemory("fact", rememberMatch[1].trim());
    }

    setIsLoading(true);
    setAnimation("thinking");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), MOTHERSHIP_TIMEOUT_MS);

    try {
      const response = await fetch(`${MOTHERSHIP}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Mothership returned ${response.status}`);
      }

      const data = await response.json();
      const xpResponse = data?.reply || data?.response || data?.message;
      if (!xpResponse || typeof xpResponse !== "string") {
        throw new Error("Mothership response did not contain a reply");
      }

      addMessage("xp", xpResponse);
      setAnimation("speaking");

      if (settings.voiceEnabled) {
        speakWithScottishVoice(xpResponse, {
          rate: settings.voiceSpeed,
          onDone: () => setAnimation("idle"),
          onError: () => setAnimation("idle"),
        });
      } else {
        setAnimation("idle");
      }
    } catch {
      addMessage("xp", "I can't reach the Mothership right now.");
      setAnimation("idle");
    } finally {
      clearTimeout(timeout);
      setIsLoading(false);
    }

    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [inputText, isLoading, addMessage, addMemory, settings, setAnimation]);

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: Colors.background }} behavior="padding">
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
            Talk to XP
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 8 }}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {conversations.slice(-40).map((msg) => (
          <View
            key={msg.id}
            style={{
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "84%",
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 14,
              borderCurve: "continuous",
              backgroundColor: msg.role === "user" ? "rgba(0, 229, 255, 0.12)" : Colors.tileBg,
              borderWidth: 1,
              borderColor: msg.role === "user" ? "rgba(0, 229, 255, 0.3)" : Colors.panelBorder,
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
            minHeight: 44,
            maxHeight: 110,
            borderRadius: 12,
            backgroundColor: "rgba(0, 20, 50, 0.8)",
            borderWidth: 1,
            borderColor: Colors.panelBorder,
            paddingHorizontal: 14,
            paddingVertical: 10,
            fontFamily: Fonts.regular,
            fontSize: 14,
            color: Colors.text,
          }}
          placeholder="Message XP..."
          placeholderTextColor={Colors.textDim}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          editable={!isLoading}
          multiline
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
            borderColor: !inputText.trim() || isLoading ? Colors.panelBorder : Colors.primaryGlow,
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
