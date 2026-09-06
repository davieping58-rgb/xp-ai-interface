import { useState, useCallback } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Typography";
import { useImageAnalysis } from "@fastshot/ai";
import { useAppStore } from "@/store/useAppStore";
import { speakWithScottishVoice } from "@/utils/speech";

interface CameraPanelProps {
  onBack: () => void;
}

type CameraSource = "auto" | "phone" | "rasbot" | "off";

const CAMERA_OPTIONS: { id: CameraSource; label: string; icon: keyof typeof Ionicons.glyphMap; detail: string }[] = [
  { id: "auto", label: "Auto", icon: "sparkles-outline", detail: "XP chooses the available camera" },
  { id: "phone", label: "Phone", icon: "phone-portrait-outline", detail: "Use this phone camera and gallery" },
  { id: "rasbot", label: "Rasbot", icon: "hardware-chip-outline", detail: "Use XP's Rasbot eyes when connected" },
  { id: "off", label: "Off", icon: "eye-off-outline", detail: "Camera disabled" },
];

export function CameraPanel({ onBack }: CameraPanelProps) {
  const [cameraSource, setCameraSource] = useState<CameraSource>("auto");
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const addMessage = useAppStore((s) => s.addMessage);
  const settings = useAppStore((s) => s.settings);
  const setAnimation = useAppStore((s) => s.setAnimation);

  const { analyzeImage, isLoading, error } = useImageAnalysis();
  const phoneCameraEnabled = cameraSource === "auto" || cameraSource === "phone";

  const chooseSource = useCallback((source: CameraSource) => {
    setCameraSource(source);
    setCapturedUri(null);
    setAnalysisResult(
      source === "rasbot"
        ? "Rasbot camera selected. XP will use the robot eyes when the Rasbot link is available."
        : source === "off"
        ? "Camera is off."
        : null
    );
  }, []);

  const handlePickImage = useCallback(async () => {
    if (!phoneCameraEnabled) return;
    try {
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
        setCapturedUri(result.assets[0].uri);
        setAnalysisResult(null);
      }
    } catch {
      setAnalysisResult("Couldn't access the image picker. Try again.");
    }
  }, [phoneCameraEnabled]);

  const handleTakePhoto = useCallback(async () => {
    if (!phoneCameraEnabled) return;
    try {
      const ImagePicker = await import("expo-image-picker");
      const permResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permResult.granted) {
        setAnalysisResult("I need camera access to see what you're showing me. Grant permission in settings.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedUri(result.assets[0].uri);
        setAnalysisResult(null);
      }
    } catch {
      setAnalysisResult("Camera not available on this device. Try picking an image instead.");
    }
  }, [phoneCameraEnabled]);

  const handleAnalyze = useCallback(async () => {
    if (!capturedUri) return;

    try {
      setAnimation("thinking");
      const result = await analyzeImage({
        imageUrl: capturedUri,
        prompt: "Describe what you see in this image naturally and clearly for Davie.",
      });

      if (result) {
        const text = typeof result === "string" ? result : String(result);
        setAnalysisResult(text);
        addMessage("user", "[Shared an image with XP]");
        addMessage("xp", text);
        setAnimation("speaking");

        if (settings.voiceEnabled) {
          speakWithScottishVoice(text, {
            rate: settings.voiceSpeed,
            onDone: () => setAnimation("idle"),
            onError: () => setAnimation("idle"),
          });
        } else {
          setAnimation("idle");
        }
      }
    } catch {
      setAnalysisResult("I couldn't get a clear read on that. Mind trying another image?");
      setAnimation("idle");
    }
  }, [capturedUri, analyzeImage, addMessage, settings, setAnimation]);

  const handleReset = useCallback(() => {
    setCapturedUri(null);
    setAnalysisResult(null);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12 }}>
        <Pressable onPress={onBack} style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="chevron-back" size={24} color={Colors.primaryGlow} />
        </Pressable>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={{ fontFamily: Fonts.bold, fontSize: 20, color: Colors.primaryGlow, letterSpacing: 1 }}>
            Camera
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 16 }} showsVerticalScrollIndicator={false}>
        <Text style={{ fontFamily: Fonts.semiBold, fontSize: 12, color: Colors.textDim, letterSpacing: 1 }}>
          CAMERA SOURCE
        </Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {CAMERA_OPTIONS.map((option) => {
            const selected = cameraSource === option.id;
            return (
              <Pressable
                key={option.id}
                onPress={() => chooseSource(option.id)}
                style={({ pressed }) => ({
                  width: "48%",
                  minHeight: 92,
                  padding: 12,
                  borderRadius: 14,
                  borderWidth: selected ? 2 : 1,
                  borderColor: selected ? Colors.primaryGlow : Colors.panelBorder,
                  backgroundColor: selected || pressed ? "rgba(0, 229, 255, 0.1)" : Colors.tileBg,
                  gap: 7,
                })}
              >
                <Ionicons name={option.icon} size={22} color={selected ? Colors.primaryGlow : Colors.textDim} />
                <Text style={{ fontFamily: Fonts.semiBold, fontSize: 14, color: selected ? Colors.primaryGlow : Colors.text }}>
                  {option.label}
                </Text>
                <Text style={{ fontFamily: Fonts.regular, fontSize: 11, lineHeight: 15, color: Colors.textDim }}>
                  {option.detail}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {phoneCameraEnabled && !capturedUri && (
          <View style={{ gap: 12 }}>
            <Pressable
              onPress={handleTakePhoto}
              style={({ pressed }) => ({
                paddingVertical: 32,
                borderRadius: 16,
                borderWidth: 2,
                borderColor: pressed ? Colors.primaryGlow : Colors.panelBorder,
                backgroundColor: pressed ? "rgba(0, 229, 255, 0.05)" : "transparent",
                alignItems: "center",
                gap: 10,
              })}
            >
              <Ionicons name="camera-outline" size={42} color={Colors.primaryGlow} />
              <Text style={{ fontFamily: Fonts.medium, fontSize: 14, color: Colors.text }}>Take a Photo</Text>
            </Pressable>

            <Pressable
              onPress={handlePickImage}
              style={({ pressed }) => ({
                paddingVertical: 22,
                borderRadius: 16,
                borderWidth: 1,
                borderStyle: "dashed",
                borderColor: pressed ? Colors.primaryGlow : Colors.panelBorder,
                alignItems: "center",
                gap: 8,
              })}
            >
              <Ionicons name="images-outline" size={28} color={Colors.textDim} />
              <Text style={{ fontFamily: Fonts.medium, fontSize: 13, color: Colors.textDim }}>Share a picture with XP</Text>
            </Pressable>
          </View>
        )}

        {capturedUri && (
          <>
            <View style={{ width: "100%", aspectRatio: 1, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: Colors.panelBorder }}>
              <Image source={{ uri: capturedUri }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
            </View>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <Pressable onPress={handleReset} style={{ flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: Colors.panelBorder, alignItems: "center" }}>
                <Text style={{ fontFamily: Fonts.medium, fontSize: 14, color: Colors.textDim }}>Another</Text>
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
                {isLoading ? <ActivityIndicator size="small" color={Colors.primaryGlow} /> : <Ionicons name="eye-outline" size={18} color={Colors.primaryGlow} />}
                <Text style={{ fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.primaryGlow }}>
                  {isLoading ? "Looking..." : "Show XP"}
                </Text>
              </Pressable>
            </View>
          </>
        )}

        {analysisResult && (
          <View style={{ padding: 16, borderRadius: 14, backgroundColor: Colors.tileBg, borderWidth: 1, borderColor: Colors.panelBorder }}>
            <Text style={{ fontFamily: Fonts.regular, fontSize: 14, color: Colors.text, lineHeight: 21 }} selectable>
              {analysisResult}
            </Text>
          </View>
        )}

        {error && !analysisResult && (
          <View style={{ padding: 14, borderRadius: 12, backgroundColor: "rgba(255, 23, 68, 0.1)", borderWidth: 1, borderColor: "rgba(255, 23, 68, 0.3)" }}>
            <Text style={{ fontFamily: Fonts.regular, fontSize: 13, color: Colors.alert }}>
              {error.message ?? "Something went wrong. Give it another shot."}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
