import { useState, useCallback, useEffect } from "react";
import { View, Text, Pressable, ScrollView, Platform, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Typography";

interface PermissionsPanelProps {
  onBack: () => void;
}

type PermissionStatus = "granted" | "denied" | "undetermined" | "loading";

interface PermissionState {
  microphone: PermissionStatus;
  camera: PermissionStatus;
  mediaLibrary: PermissionStatus;
}

const STATUS_CONFIG: Record<
  Exclude<PermissionStatus, "loading">,
  { label: string; color: string; bgColor: string; borderColor: string }
> = {
  granted: {
    label: "Granted",
    color: "#00E676",
    bgColor: "rgba(0, 230, 118, 0.1)",
    borderColor: "rgba(0, 230, 118, 0.3)",
  },
  denied: {
    label: "Denied",
    color: "#FF1744",
    bgColor: "rgba(255, 23, 68, 0.1)",
    borderColor: "rgba(255, 23, 68, 0.3)",
  },
  undetermined: {
    label: "Not Asked",
    color: Colors.textDim,
    bgColor: "rgba(224, 247, 250, 0.05)",
    borderColor: "rgba(224, 247, 250, 0.2)",
  },
};

const DENIED_MESSAGES: Record<string, string> = {
  microphone:
    "I need your mic to hear you. You can change this in your device settings.",
  camera:
    "I need camera access to see what you see. You can change this in your device settings.",
  mediaLibrary:
    "I need storage access to save or load photos. You can change this in your device settings.",
};

/** Helpers extracted to reduce cognitive complexity of the main hook callbacks */

async function checkImagePickerPermissions(): Promise<{
  camera: PermissionStatus;
  mediaLibrary: PermissionStatus;
}> {
  try {
    const ImagePicker = await import("expo-image-picker");
    const cameraResult = await ImagePicker.getCameraPermissionsAsync();
    const mediaResult = await ImagePicker.getMediaLibraryPermissionsAsync();
    return {
      camera: cameraResult.granted
        ? "granted"
        : cameraResult.canAskAgain === false
          ? "denied"
          : "undetermined",
      mediaLibrary: mediaResult.granted
        ? "granted"
        : mediaResult.canAskAgain === false
          ? "denied"
          : "undetermined",
    };
  } catch {
    return { camera: "undetermined", mediaLibrary: "undetermined" };
  }
}

async function checkMicrophonePermission(): Promise<PermissionStatus> {
  if (Platform.OS === "web") {
    try {
      const result = await navigator.permissions.query({
        name: "microphone" as PermissionName,
      });
      if (result.state === "granted") return "granted";
      if (result.state === "denied") return "denied";
      return "undetermined";
    } catch {
      return "undetermined";
    }
  }
  try {
    const ExpoAudio = await import("expo-audio");
    const audioResult = await ExpoAudio.getRecordingPermissionsAsync();
    return audioResult.granted
      ? "granted"
      : audioResult.canAskAgain === false
        ? "denied"
        : "undetermined";
  } catch {
    return "undetermined";
  }
}

async function requestMicPermission(): Promise<PermissionStatus> {
  if (Platform.OS === "web") {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      for (const track of stream.getTracks()) {
        track.stop();
      }
      return "granted";
    } catch {
      return "denied";
    }
  }
  try {
    const ExpoAudio = await import("expo-audio");
    const result = await ExpoAudio.requestRecordingPermissionsAsync();
    return result.granted ? "granted" : "denied";
  } catch {
    return "denied";
  }
}

export function PermissionsPanel({ onBack }: PermissionsPanelProps) {
  const [permissions, setPermissions] = useState<PermissionState>({
    microphone: "loading",
    camera: "loading",
    mediaLibrary: "loading",
  });
  const [error, setError] = useState<string | null>(null);

  const checkPermissions = useCallback(async () => {
    try {
      setError(null);
      const [micStatus, { camera, mediaLibrary }] = await Promise.all([
        checkMicrophonePermission(),
        checkImagePickerPermissions(),
      ]);
      setPermissions({ microphone: micStatus, camera, mediaLibrary });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to check permissions";
      setError(message);
    }
  }, []);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  const requestMicrophonePermission = useCallback(async () => {
    setPermissions((prev) => ({ ...prev, microphone: "loading" }));
    const status = await requestMicPermission();
    setPermissions((prev) => ({ ...prev, microphone: status }));
  }, []);

  const requestCameraPermission = useCallback(async () => {
    try {
      setPermissions((prev) => ({ ...prev, camera: "loading" }));
      const ImagePicker = await import("expo-image-picker");
      const result = await ImagePicker.requestCameraPermissionsAsync();
      setPermissions((prev) => ({
        ...prev,
        camera: result.granted ? "granted" : "denied",
      }));
    } catch {
      setPermissions((prev) => ({ ...prev, camera: "denied" }));
    }
  }, []);

  const requestMediaLibraryPermission = useCallback(async () => {
    try {
      setPermissions((prev) => ({ ...prev, mediaLibrary: "loading" }));
      const ImagePicker = await import("expo-image-picker");
      const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setPermissions((prev) => ({
        ...prev,
        mediaLibrary: result.granted ? "granted" : "denied",
      }));
    } catch {
      setPermissions((prev) => ({ ...prev, mediaLibrary: "denied" }));
    }
  }, []);

  const isLoading =
    permissions.microphone === "loading" ||
    permissions.camera === "loading" ||
    permissions.mediaLibrary === "loading";

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
            Permissions
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {error ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 32,
          }}
        >
          <Ionicons name="warning-outline" size={40} color={Colors.alert} />
          <Text
            style={{
              fontFamily: Fonts.medium,
              fontSize: 14,
              color: Colors.text,
              textAlign: "center",
              marginTop: 12,
            }}
          >
            {error}
          </Text>
          <Pressable
            onPress={checkPermissions}
            style={{
              marginTop: 16,
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: Colors.primaryGlow,
              backgroundColor: "rgba(0, 229, 255, 0.1)",
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.semiBold,
                fontSize: 13,
                color: Colors.primaryGlow,
              }}
            >
              Retry
            </Text>
          </Pressable>
        </View>
      ) : isLoading && permissions.microphone === "loading" && permissions.camera === "loading" ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={Colors.primaryGlow} />
          <Text
            style={{
              fontFamily: Fonts.regular,
              fontSize: 13,
              color: Colors.textDim,
              marginTop: 12,
            }}
          >
            Checking permissions...
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 16 }}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
        >
          {/* Section header */}
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
            Device Permissions
          </Text>

          {/* Microphone */}
          <PermissionRow
            icon="mic-outline"
            label="Microphone"
            description="Voice input and wake phrase detection"
            status={permissions.microphone}
            onRequest={requestMicrophonePermission}
            deniedMessage={DENIED_MESSAGES.microphone}
          />

          {/* Camera */}
          <PermissionRow
            icon="camera-outline"
            label="Camera"
            description="Visual analysis when you ask XP to look"
            status={permissions.camera}
            onRequest={requestCameraPermission}
            deniedMessage={DENIED_MESSAGES.camera}
          />

          {/* Media Library / Storage */}
          <PermissionRow
            icon="images-outline"
            label="Photo Library"
            description="Save captures and load images for analysis"
            status={permissions.mediaLibrary}
            onRequest={requestMediaLibraryPermission}
            deniedMessage={DENIED_MESSAGES.mediaLibrary}
          />

          {/* Info section */}
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
            About Permissions
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
              icon="shield-checkmark-outline"
              text="Permissions are only used when you actively request a feature. XP never records or captures in the background."
            />
            <InfoRow
              icon="settings-outline"
              text="If you deny a permission, you can always re-enable it later in your device settings."
            />
            <InfoRow
              icon="refresh-outline"
              text="After changing permissions in settings, return here to refresh the status."
            />
          </View>

          {/* Refresh button */}
          <Pressable
            onPress={checkPermissions}
            style={({ pressed }) => ({
              paddingVertical: 14,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: pressed ? Colors.primaryGlow : Colors.panelBorder,
              backgroundColor: pressed ? "rgba(0, 229, 255, 0.1)" : "transparent",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            })}
          >
            <Ionicons name="refresh-outline" size={18} color={Colors.primaryGlow} />
            <Text
              style={{
                fontFamily: Fonts.semiBold,
                fontSize: 13,
                color: Colors.primaryGlow,
              }}
            >
              Refresh All Statuses
            </Text>
          </Pressable>
        </ScrollView>
      )}
    </View>
  );
}

function PermissionRow({
  icon,
  label,
  description,
  status,
  onRequest,
  deniedMessage,
}: {
  icon: string;
  label: string;
  description: string;
  status: PermissionStatus;
  onRequest: () => void;
  deniedMessage: string;
}) {
  const statusConfig =
    status === "loading" ? null : STATUS_CONFIG[status];

  return (
    <View
      style={{
        padding: 14,
        borderRadius: 12,
        backgroundColor: Colors.tileBg,
        borderWidth: 1,
        borderColor: Colors.panelBorder,
        gap: 12,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        {/* Icon */}
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
          <Ionicons
            name={icon as keyof typeof Ionicons.glyphMap}
            size={18}
            color={Colors.primaryGlow}
          />
        </View>

        {/* Label & description */}
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: Fonts.medium, fontSize: 14, color: Colors.text }}>
            {label}
          </Text>
          <Text
            style={{
              fontFamily: Fonts.regular,
              fontSize: 11,
              color: Colors.textDim,
              marginTop: 2,
            }}
          >
            {description}
          </Text>
        </View>

        {/* Status badge */}
        {status === "loading" ? (
          <ActivityIndicator size="small" color={Colors.primaryGlow} />
        ) : (
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
              backgroundColor: statusConfig?.bgColor,
              borderWidth: 1,
              borderColor: statusConfig?.borderColor,
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.regular,
                fontSize: 9,
                color: statusConfig?.color,
              }}
            >
              {statusConfig?.label}
            </Text>
          </View>
        )}
      </View>

      {/* Request button for undetermined */}
      {status === "undetermined" && (
        <Pressable
          onPress={onRequest}
          style={({ pressed }) => ({
            paddingVertical: 10,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: pressed ? Colors.primaryGlow : Colors.panelBorder,
            backgroundColor: pressed
              ? "rgba(0, 229, 255, 0.15)"
              : "rgba(0, 229, 255, 0.05)",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: 6,
          })}
        >
          <Ionicons name="lock-open-outline" size={14} color={Colors.primaryGlow} />
          <Text
            style={{
              fontFamily: Fonts.semiBold,
              fontSize: 12,
              color: Colors.primaryGlow,
            }}
          >
            Request Permission
          </Text>
        </Pressable>
      )}

      {/* Denied explanation from XP */}
      {status === "denied" && (
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            paddingTop: 4,
            paddingHorizontal: 4,
            alignItems: "flex-start",
          }}
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={14}
            color={Colors.textDim}
            style={{ marginTop: 1 }}
          />
          <Text
            style={{
              flex: 1,
              fontFamily: Fonts.light,
              fontSize: 11,
              color: Colors.textDim,
              fontStyle: "italic",
              lineHeight: 16,
            }}
          >
            {deniedMessage}
          </Text>
        </View>
      )}
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
