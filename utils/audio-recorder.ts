/**
 * Audio recording utility for XP
 * Handles web (MediaRecorder API) primarily since the app previews in web.
 * Returns an audio URI (blob URL on web) suitable for transcription.
 */
import { Platform } from "react-native";

interface RecorderHandle {
  stop: () => Promise<string | null>;
}

let currentRecorder: RecorderHandle | null = null;
let isRecording = false;

/**
 * Start recording audio from the microphone.
 * Returns true if recording started successfully.
 */
export async function startAudioRecording(): Promise<boolean> {
  try {
    if (isRecording) return true;

    if (Platform.OS === "web") {
      return await startWebRecording();
    } else {
      return await startNativeRecording();
    }
  } catch (err) {
    console.error("Failed to start recording:", err);
    return false;
  }
}

/**
 * Stop recording and return the audio URI.
 * Returns null if no recording was in progress or an error occurred.
 */
export async function stopAudioRecording(): Promise<string | null> {
  try {
    if (!currentRecorder || !isRecording) return null;
    isRecording = false;
    const uri = await currentRecorder.stop();
    currentRecorder = null;
    return uri;
  } catch (err) {
    console.error("Failed to stop recording:", err);
    currentRecorder = null;
    isRecording = false;
    return null;
  }
}

/**
 * Check if currently recording.
 */
export function isCurrentlyRecording(): boolean {
  return isRecording;
}

// --- Web implementation using MediaRecorder API ---
async function startWebRecording(): Promise<boolean> {
  try {
    // Check if mediaDevices is available
    if (typeof navigator === "undefined" || !navigator.mediaDevices) {
      console.error("MediaDevices API not available");
      return false;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
      },
    });

    const mimeType = getSupportedMimeType();
    const mediaRecorder = new MediaRecorder(stream, { mimeType });
    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    // Start recording with timeslice to get data periodically
    mediaRecorder.start(250);
    isRecording = true;

    currentRecorder = {
      stop: () =>
        new Promise<string | null>((resolve) => {
          mediaRecorder.onstop = () => {
            // Stop all tracks to release the microphone
            for (const track of stream.getTracks()) {
              track.stop();
            }

            if (chunks.length === 0) {
              resolve(null);
              return;
            }

            const blob = new Blob(chunks, { type: mimeType });
            const url = URL.createObjectURL(blob);
            resolve(url);
          };

          if (mediaRecorder.state === "recording" || mediaRecorder.state === "paused") {
            mediaRecorder.stop();
          } else {
            for (const track of stream.getTracks()) {
              track.stop();
            }
            resolve(null);
          }
        }),
    };

    return true;
  } catch (err) {
    console.error("Web recording failed:", err);
    isRecording = false;
    return false;
  }
}

function getSupportedMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "audio/webm";

  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/mp4",
  ];

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return "audio/webm";
}

// --- Native implementation using expo-audio ---
async function startNativeRecording(): Promise<boolean> {
  try {
    const ExpoAudio = await import("expo-audio");

    // Request permission
    const status = await ExpoAudio.requestRecordingPermissionsAsync();
    if (!status.granted) {
      return false;
    }

    // Set audio mode for recording
    await ExpoAudio.setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: true,
    });

    // Create recorder with HIGH_QUALITY preset
    const recorder = new ExpoAudio.AudioModule.AudioRecorder(
      ExpoAudio.RecordingPresets.HIGH_QUALITY
    );
    await recorder.prepareToRecordAsync();
    recorder.record();
    isRecording = true;

    currentRecorder = {
      stop: async () => {
        await recorder.stop();
        return recorder.uri;
      },
    };

    return true;
  } catch (err) {
    console.error("Native recording failed:", err);
    isRecording = false;
    return false;
  }
}
