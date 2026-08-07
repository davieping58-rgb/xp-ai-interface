import { useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Animated,
  Easing,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Typography";

interface ControlPanelProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (screen: string) => void;
}

interface TileData {
  id: string;
  label: string;
  icon: string;
  iconFamily: "ionicons" | "material";
}

const TILES: TileData[] = [
  { id: "modes", label: "Modes", icon: "nuclear-outline", iconFamily: "ionicons" },
  { id: "memory", label: "Memory", icon: "brain", iconFamily: "material" },
  { id: "history", label: "History", icon: "time-outline", iconFamily: "ionicons" },
  { id: "settings", label: "Settings", icon: "settings-outline", iconFamily: "ionicons" },
  { id: "voice", label: "Voice", icon: "mic-outline", iconFamily: "ionicons" },
  { id: "camera", label: "Camera", icon: "camera-outline", iconFamily: "ionicons" },
  { id: "text", label: "Text Input", icon: "chatbox-outline", iconFamily: "ionicons" },
  { id: "privacy", label: "Privacy", icon: "shield-checkmark-outline", iconFamily: "ionicons" },
];

export function ControlPanel({ visible, onClose, onNavigate }: ControlPanelProps) {
  const { height: screenHeight } = useWindowDimensions();
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          speed: 14,
          bounciness: 4,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 250,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, backdropOpacity, screenHeight]);

  const handleTilePress = useCallback(
    (id: string) => {
      onNavigate(id);
    },
    [onNavigate]
  );

  if (!visible) return null;

  return (
    <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }}>
      {/* Backdrop */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 4, 10, 0.5)",
          opacity: backdropOpacity,
        }}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      {/* Panel */}
      <Animated.View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          maxHeight: screenHeight * 0.6,
          backgroundColor: Colors.panelGlass,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderWidth: 1,
          borderBottomWidth: 0,
          borderColor: Colors.panelBorder,
          transform: [{ translateY: slideAnim }],
          paddingBottom: 40,
        }}
      >
        {/* Close handle */}
        <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 8 }}>
          <View
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              backgroundColor: "rgba(0, 229, 255, 0.3)",
            }}
          />
        </View>

        {/* Close button */}
        <Pressable
          onPress={onClose}
          style={{
            position: "absolute",
            top: 14,
            right: 16,
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: "rgba(0, 229, 255, 0.1)",
            borderWidth: 1,
            borderColor: Colors.panelBorder,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="close" size={18} color={Colors.primaryGlow} />
        </Pressable>

        {/* Title */}
        <View style={{ alignItems: "center", paddingBottom: 8 }}>
          <Text
            style={{
              fontFamily: Fonts.bold,
              fontSize: 20,
              color: Colors.primaryGlow,
              letterSpacing: 1,
            }}
          >
            XP Control
          </Text>
          <Text
            style={{
              fontFamily: Fonts.light,
              fontSize: 12,
              color: Colors.textDim,
              marginTop: 4,
            }}
          >
            You ask. I listen. We build.
          </Text>
        </View>

        <ScrollView
          style={{ flexGrow: 0 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Tile grid */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 12,
              justifyContent: "center",
            }}
          >
            {TILES.map((tile) => (
              <Pressable
                key={tile.id}
                onPress={() => handleTilePress(tile.id)}
                style={({ pressed }) => ({
                  width: 72,
                  height: 72,
                  borderRadius: 14,
                  borderCurve: "continuous",
                  backgroundColor: pressed ? "rgba(0, 229, 255, 0.15)" : Colors.tileBg,
                  borderWidth: 1,
                  borderColor: pressed ? Colors.panelBorderActive : Colors.panelBorder,
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                })}
              >
                {tile.iconFamily === "ionicons" ? (
                  <Ionicons
                    name={tile.icon as keyof typeof Ionicons.glyphMap}
                    size={22}
                    color={Colors.primaryGlow}
                  />
                ) : (
                  <MaterialCommunityIcons
                    name={tile.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                    size={22}
                    color={Colors.primaryGlow}
                  />
                )}
                <Text
                  style={{
                    fontFamily: Fonts.regular,
                    fontSize: 10,
                    color: Colors.text,
                    textAlign: "center",
                  }}
                >
                  {tile.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* About XP tile */}
          <Pressable
            onPress={() => handleTilePress("about")}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              marginTop: 16,
              paddingVertical: 14,
              paddingHorizontal: 16,
              borderRadius: 14,
              borderCurve: "continuous",
              backgroundColor: pressed ? "rgba(0, 229, 255, 0.15)" : Colors.tileBg,
              borderWidth: 1,
              borderColor: pressed ? Colors.panelBorderActive : Colors.panelBorder,
            })}
          >
            <Ionicons name="person-circle-outline" size={24} color={Colors.primaryGlow} />
            <Text
              style={{
                fontFamily: Fonts.medium,
                fontSize: 14,
                color: Colors.text,
              }}
            >
              About XP
            </Text>
          </Pressable>
        </ScrollView>
      </Animated.View>
    </View>
  );
}
