/**
 * XP AI Companion — Data model types
 */

export type ModeType =
  | "engineering"
  | "boat"
  | "camping"
  | "exploration"
  | "thinking"
  | "listening"
  | "alert"
  | "idle";

export type AnimationState =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking"
  | "alert";

export type MemoryType = "fact" | "preference" | "routine" | "project";

export type ListeningMode = "push-to-talk" | "always-on";

export interface XPMemory {
  id: string;
  type: MemoryType;
  content: string;
  timestamp: number;
  approved: boolean;
}

export interface ConversationMessage {
  id: string;
  role: "user" | "xp";
  content: string;
  timestamp: number;
  mode: ModeType;
}

export interface XPSettings {
  activeMode: ModeType;
  voiceEnabled: boolean;
  memoryEnabled: boolean;
  listeningMode: ListeningMode;
  wakePhraseEnabled: boolean;
  voiceSpeed: number;
}

export interface Preferences {}
