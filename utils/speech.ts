/**
 * XP Speech Utility — Scottish/British male voice selection for TTS
 * Uses expo-speech with voice preference for warm Scottish male voice.
 * IMPORTANT: Always select a MALE voice. Never use female voices.
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

// Known male voice names across platforms (iOS, Android, web)
const MALE_VOICE_NAMES = [
  "daniel", "oliver", "james", "arthur", "george", "harry", "thomas",
  "david", "mark", "alex", "fred", "tom", "ralph", "lee", "rishi",
  "aaron", "albert", "gordon", "bruce", "liam", "aaron", "sean",
  "google uk english male", "microsoft george", "microsoft david",
  "microsoft mark", "microsoft ryan", "microsoft guy",
];

// Known female voice names to EXCLUDE
const FEMALE_VOICE_NAMES = [
  "samantha", "karen", "moira", "tessa", "fiona", "kate", "susan",
  "victoria", "serena", "emily", "allison", "ava", "zoe", "nicky",
  "siri female", "google uk english female", "microsoft hazel",
  "microsoft susan", "microsoft zira", "microsoft catherine",
];

/**
 * Check if a voice name indicates a male voice.
 */
function isMaleVoice(name: string): boolean {
  const lower = name.toLowerCase();
  // Explicitly male
  if (lower.includes("male") && !lower.includes("female")) return true;
  if (MALE_VOICE_NAMES.some((m) => lower.includes(m))) return true;
  return false;
}

/**
 * Check if a voice name indicates a female voice (to exclude).
 */
function isFemaleVoice(name: string): boolean {
  const lower = name.toLowerCase();
  if (lower.includes("female")) return true;
  if (FEMALE_VOICE_NAMES.some((f) => lower.includes(f))) return true;
  return false;
}

/**
 * Find the best Scottish/British male voice available on the device.
 * Priority:
 * 1. Scottish English male voice (en-GB-SCT / en-SCT)
 * 2. British English male voice (en-GB with male name)
 * 3. Irish English male voice (en-IE with male name)
 * 4. Any British English non-female voice
 * 5. Any English male voice
 * 6. Any English non-female enhanced voice
 * 7. Fallback with en-GB locale (system picks)
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

    // Priority 1: Scottish male voice
    const scottishMale = voices.find((v) => {
      const name = v.name.toLowerCase();
      const id = v.identifier.toLowerCase();
      const isScottish =
        name.includes("scottish") || name.includes("scot") || id.includes("sct");
      return isScottish && v.language.startsWith("en") && !isFemaleVoice(v.name);
    });
    if (scottishMale) {
      cachedVoiceId = scottishMale.identifier;
      voiceSearchDone = true;
      return cachedVoiceId;
    }

    // Priority 2: British English explicitly male voice
    const britishMaleVoice = voices.find((v) => {
      const lang = v.language.toLowerCase();
      const isBritish = lang.includes("en-gb") || lang.includes("en_gb");
      return isBritish && isMaleVoice(v.name);
    });
    if (britishMaleVoice) {
      cachedVoiceId = britishMaleVoice.identifier;
      voiceSearchDone = true;
      return cachedVoiceId;
    }

    // Priority 3: Irish English male voice (close to Scottish)
    const irishMaleVoice = voices.find((v) => {
      const lang = v.language.toLowerCase();
      const isIrish = lang.includes("en-ie") || lang.includes("en_ie");
      return isIrish && !isFemaleVoice(v.name);
    });
    if (irishMaleVoice) {
      cachedVoiceId = irishMaleVoice.identifier;
      voiceSearchDone = true;
      return cachedVoiceId;
    }

    // Priority 4: Any British English voice that is NOT female (enhanced preferred)
    const britishNonFemaleEnhanced = voices.find((v) => {
      const lang = v.language.toLowerCase();
      const isBritish = lang.includes("en-gb") || lang.includes("en_gb");
      return isBritish && !isFemaleVoice(v.name) && v.quality === "Enhanced";
    });
    if (britishNonFemaleEnhanced) {
      cachedVoiceId = britishNonFemaleEnhanced.identifier;
      voiceSearchDone = true;
      return cachedVoiceId;
    }

    // Priority 5: Any British English voice that is NOT female
    const britishNonFemale = voices.find((v) => {
      const lang = v.language.toLowerCase();
      const isBritish = lang.includes("en-gb") || lang.includes("en_gb");
      return isBritish && !isFemaleVoice(v.name);
    });
    if (britishNonFemale) {
      cachedVoiceId = britishNonFemale.identifier;
      voiceSearchDone = true;
      return cachedVoiceId;
    }

    // Priority 6: Any English male voice (any dialect)
    const englishMale = voices.find((v) => {
      const lang = v.language.toLowerCase();
      const isEnglish = lang.startsWith("en");
      return isEnglish && isMaleVoice(v.name);
    });
    if (englishMale) {
      cachedVoiceId = englishMale.identifier;
      voiceSearchDone = true;
      return cachedVoiceId;
    }

    // Priority 7: Any English non-female enhanced voice
    const enhancedNonFemale = voices.find((v) => {
      return (
        v.language.startsWith("en") &&
        v.quality === "Enhanced" &&
        !isFemaleVoice(v.name)
      );
    });
    if (enhancedNonFemale) {
      cachedVoiceId = enhancedNonFemale.identifier;
      voiceSearchDone = true;
      return cachedVoiceId;
    }

    // Priority 8: Any English non-female voice
    const anyNonFemale = voices.find((v) => {
      return v.language.startsWith("en") && !isFemaleVoice(v.name);
    });
    if (anyNonFemale) {
      cachedVoiceId = anyNonFemale.identifier;
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
