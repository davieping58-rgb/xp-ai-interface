import { useState, useCallback } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Typography";
import { useImageAnalysis } from "@fastshot/ai";
import { useAppStore } from "@/store/useAppStore";

interface CameraPanelProps {
  onBack: () => void;
}

export function CameraPanel({ onBack }: CameraPanelProps) {
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const addMessage = useAppStore((s) => s.addMessage);

  const { analyzeImage, isLoading, error } = useImageAnalysis();

  const handlePickImage = useCallback(async () => {
    try {
      // Dynamic import to handle platforms that don't support it
      const ImagePicker = await import("expo-image-picker");
      const permResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permResult.granted) {
        setAnalysisResult("I need access to your photos to see what you want to show me. Check your permissions.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setCapturedUri(uri);
        setAnalysisResult(null);
      }
    } catch {
      setAnalysisResult("Couldn't access the image picker. Try again.");
    }
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!capturedUri) return;

    try {
      const result = await analyzeImage({
        imageUrl: capturedUri,
        prompt: "Describe what you see in this image in detail. Be conversational and insightful, like a smart friend commenting on what they notice.",
      });

      if (result) {
        const text = typeof result === "string" ? result : String(result);
        setAnalysisResult(text);
        addMessage("user", "[Shared an image for analysis]");
        addMessage("xp", text);
      }
    } catch {
      setAnalysisResult("I couldn't get a clear read on that. Mind trying another image?");
    }
  }, [capturedUri, analyzeImage, addMessage]);

  const handleReset = useCallback(() => {
    setCapturedUri(null);
    setAnalysisResult(null);
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
            Camera
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 16, alignItems: "center" }}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        <Text
          style={{
            fontFamily: Fonts.light,
            fontSize: 13,
            color: Colors.textDim,
            textAlign: "center",
          }}
        >
          {"Show me something. I'll tell you what I see."}
        </Text>

        {/* Image preview */}
        {capturedUri ? (
          <View
            style={{
              width: "100%",
              aspectRatio: 1,
              borderRadius: 16,
              borderCurve: "continuous",
              overflow: "hidden",
              borderWidth: 1,
              borderColor: Colors.panelBorder,
            }}
          >
            <Image
              source={{ uri: capturedUri }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
          </View>
        ) : (
          <Pressable
            onPress={handlePickImage}
            style={({ pressed }) => ({
              width: "100%",
              aspectRatio: 1.2,
              borderRadius: 16,
              borderCurve: "continuous",
              borderWidth: 2,
              borderStyle: "dashed",
              borderColor: pressed ? Colors.primaryGlow : Colors.panelBorder,
              backgroundColor: pressed ? "rgba(0, 229, 255, 0.05)" : "transparent",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
            })}
          >
            <Ionicons name="image-outline" size={48} color={Colors.textDim} />
            <Text style={{ fontFamily: Fonts.medium, fontSize: 14, color: Colors.text }}>
              Tap to pick an image
            </Text>
            <Text style={{ fontFamily: Fonts.regular, fontSize: 12, color: Colors.textDim }}>
              {"I'll analyze whatever you show me"}
            </Text>
          </Pressable>
        )}

        {/* Action buttons */}
        {capturedUri && (
          <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
            <Pressable
              onPress={handleReset}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: Colors.panelBorder,
                alignItems: "center",
              }}
            >
              <Text style={{ fontFamily: Fonts.medium, fontSize: 14, color: Colors.textDim }}>
                Pick Another
              </Text>
            </Pressable>
            <Pressable
              onPress={handleAnalyze}
              disabled={isLoading}
              style={({ pressed }) => ({
                flex: 2,
                paddingVertical: 14,
                borderRadius: 12,
                backgroundColor: pressed ? "rgba(0, 229, 255, 0.25)" : "rgba(0, 229, 255, 0.15)",
                borderWidth: 1,
                borderColor: Colors.primaryGlow,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 8,
              })}
            >
              {isLoading ? (
                <>
                  <ActivityIndicator size="small" color={Colors.primaryGlow} />
                  <Text style={{ fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.primaryGlow }}>
                    Analyzing...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="eye-outline" size={18} color={Colors.primaryGlow} />
                  <Text style={{ fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.primaryGlow }}>
                    What do you see?
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        )}

        {/* Analysis result */}
        {analysisResult && (
          <View
            style={{
              width: "100%",
              padding: 16,
              borderRadius: 14,
              borderCurve: "continuous",
              backgroundColor: Colors.tileBg,
              borderWidth: 1,
              borderColor: Colors.panelBorder,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Ionicons name="eye" size={16} color={Colors.primaryGlow} />
              <Text style={{ fontFamily: Fonts.semiBold, fontSize: 12, color: Colors.primaryGlow }}>
                XP SEES
              </Text>
            </View>
            <Text
              style={{
                fontFamily: Fonts.regular,
                fontSize: 14,
                color: Colors.text,
                lineHeight: 21,
              }}
              selectable
            >
              {analysisResult}
            </Text>
          </View>
        )}

        {/* Error */}
        {error && !analysisResult && (
          <View
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 12,
              backgroundColor: "rgba(255, 23, 68, 0.1)",
              borderWidth: 1,
              borderColor: "rgba(255, 23, 68, 0.3)",
            }}
          >
            <Text style={{ fontFamily: Fonts.regular, fontSize: 13, color: Colors.alert }}>
              {error.message ?? "Something went wrong. Give it another shot."}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
