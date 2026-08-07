/**
 * XP Speech Utility — Scottish/British male voice selection for TTS
 * Uses expo-speech with voice preference for warm Scottish male voice.
 */
import * as Speech from "expo-speech";

interface SpeakOptions {
  rate?: number;
  onDone?: () => void;
  onError?: () => void;
  onStart?: () => void;
}

// Cache the selected voice identifier
let cachedVoiceId: string | null = null;
let voiceSearchDone = false;

/**
 * Find the best Scottish/British male voice available on the device.
 * Priority:
 * 1. Scottish English male voice (en-GB-SCT / en-SCT)
 * 2. British English male voice (en-GB)
 * 3. Any English male voice
 * 4. Any British English voice
 * 5. Default English voice
 */
async function findBestVoice(): Promise<string | undefined> {
  if (voiceSearchDone && cachedVoiceId !== null) {
    return cachedVoiceId || undefined;
  }

  try {
    const voices = await Speech.getAvailableVoicesAsync();

    if (!voices || voices.length === 0) {
      voiceSearchDone = true;
      cachedVoiceId = "";
      return undefined;
    }

    // Priority 1: Scottish voice (look for "Scottish" in name or "en-GB" identifier with Scottish hints)
    const scottishVoice = voices.find((v) => {
      const name = v.name.toLowerCase();
      const id = v.identifier.toLowerCase();
      return (
        (name.includes("scottish") || name.includes("scot") || id.includes("sct")) &&
        v.language.startsWith("en")
      );
    });
    if (scottishVoice) {
      cachedVoiceId = scottishVoice.identifier;
      voiceSearchDone = true;
      return cachedVoiceId;
    }

    // Priority 2: British English male voice (look for male indicators in name)
    const britishMaleVoice = voices.find((v) => {
      const name = v.name.toLowerCase();
      const lang = v.language.toLowerCase();
      const isBritish = lang.includes("en-gb") || lang.includes("en_gb");
      const isMale =
        name.includes("daniel") ||
        name.includes("oliver") ||
        name.includes("james") ||
        name.includes("arthur") ||
        name.includes("george") ||
        name.includes("harry") ||
        name.includes("thomas") ||
        name.includes("male") ||
        name.includes("man");
      return isBritish && isMale;
    });
    if (britishMaleVoice) {
      cachedVoiceId = britishMaleVoice.identifier;
      voiceSearchDone = true;
      return cachedVoiceId;
    }

    // Priority 3: Any British English voice (prefer enhanced quality)
    const britishEnhanced = voices.find((v) => {
      const lang = v.language.toLowerCase();
      const isBritish = lang.includes("en-gb") || lang.includes("en_gb");
      return isBritish && v.quality === "Enhanced";
    });
    if (britishEnhanced) {
      cachedVoiceId = britishEnhanced.identifier;
      voiceSearchDone = true;
      return cachedVoiceId;
    }

    // Priority 4: Any British English voice
    const britishVoice = voices.find((v) => {
      const lang = v.language.toLowerCase();
      return lang.includes("en-gb") || lang.includes("en_gb");
    });
    if (britishVoice) {
      cachedVoiceId = britishVoice.identifier;
      voiceSearchDone = true;
      return cachedVoiceId;
    }

    // Priority 5: Any male-sounding English voice
    const englishMale = voices.find((v) => {
      const name = v.name.toLowerCase();
      const lang = v.language.toLowerCase();
      const isEnglish = lang.startsWith("en");
      const isMale =
        name.includes("daniel") ||
        name.includes("james") ||
        name.includes("david") ||
        name.includes("mark") ||
        name.includes("male") ||
        name.includes("google uk english male");
      return isEnglish && isMale;
    });
    if (englishMale) {
      cachedVoiceId = englishMale.identifier;
      voiceSearchDone = true;
      return cachedVoiceId;
    }

    // Priority 6: Any English enhanced voice
    const enhancedEnglish = voices.find((v) => {
      return v.language.startsWith("en") && v.quality === "Enhanced";
    });
    if (enhancedEnglish) {
      cachedVoiceId = enhancedEnglish.identifier;
      voiceSearchDone = true;
      return cachedVoiceId;
    }

    // Fallback: no specific voice - let the system decide with en-GB locale
    voiceSearchDone = true;
    cachedVoiceId = "";
    return undefined;
  } catch {
    voiceSearchDone = true;
    cachedVoiceId = "";
    return undefined;
  }
}

/**
 * Speak text using the best available Scottish/British male voice.
 * Falls back gracefully if no suitable voice is found.
 */
export async function speakWithScottishVoice(
  text: string,
  options: SpeakOptions = {}
): Promise<void> {
  const voiceId = await findBestVoice();

  const speechOptions: Speech.SpeechOptions = {
    language: "en-GB",
    pitch: 0.95, // Slightly lower pitch for warm male voice
    rate: options.rate ?? 0.95,
    voice: voiceId || undefined,
    onDone: options.onDone,
    onError: options.onError ? () => options.onError?.() : undefined,
    onStart: options.onStart,
  };

  Speech.speak(text, speechOptions);
}

/**
 * Stop any current speech output.
 */
export function stopSpeaking(): void {
  Speech.stop();
}

/**
 * Check if the system is currently speaking.
 */
export async function checkIsSpeaking(): Promise<boolean> {
  return Speech.isSpeakingAsync();
}
