import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  ModeType,
  AnimationState,
  XPMemory,
  ConversationMessage,
  XPSettings,
  MemoryType,
} from "./types";

interface AppState {
  // XP State
  currentAnimation: AnimationState;
  currentMode: ModeType;
  subtitleText: string;
  isSpeaking: boolean;
  isListening: boolean;

  // Settings
  settings: XPSettings;

  // Memory
  memories: XPMemory[];

  // Conversation
  conversations: ConversationMessage[];

  // Actions
  setAnimation: (state: AnimationState) => void;
  setMode: (mode: ModeType) => void;
  setSubtitle: (text: string) => void;
  setIsSpeaking: (speaking: boolean) => void;
  setIsListening: (listening: boolean) => void;
  updateSettings: (settings: Partial<XPSettings>) => void;
  addMemory: (type: MemoryType, content: string) => void;
  removeMemory: (id: string) => void;
  clearAllMemories: () => void;
  addMessage: (role: "user" | "xp", content: string) => void;
  clearConversations: () => void;
}

const generateId = (): string =>
  `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

export const useAppStore = create<AppState>()(
  persist(
    (set, _get) => ({
      // Initial XP state
      currentAnimation: "idle",
      currentMode: "idle",
      subtitleText: "",
      isSpeaking: false,
      isListening: false,

      // Default settings
      settings: {
        activeMode: "idle",
        voiceEnabled: true,
        memoryEnabled: true,
        listeningMode: "push-to-talk",
        wakePhraseEnabled: false,
        voiceSpeed: 1.0,
        displayBrightness: 0.8,
        language: "en-GB",
        micSensitivity: 0.7,
      },

      // Empty initial data
      memories: [],
      conversations: [],

      // Actions
      setAnimation: (animation) => set({ currentAnimation: animation }),
      setMode: (mode) =>
        set((state) => ({
          currentMode: mode,
          settings: { ...state.settings, activeMode: mode },
        })),
      setSubtitle: (text) => set({ subtitleText: text }),
      setIsSpeaking: (speaking) => set({ isSpeaking: speaking }),
      setIsListening: (listening) => set({ isListening: listening }),

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      addMemory: (type, content) =>
        set((state) => ({
          memories: [
            {
              id: generateId(),
              type,
              content,
              timestamp: Date.now(),
              approved: true,
            },
            ...state.memories,
          ],
        })),

      removeMemory: (id) =>
        set((state) => ({
          memories: state.memories.filter((m) => m.id !== id),
        })),

      clearAllMemories: () => set({ memories: [] }),

      addMessage: (role, content) =>
        set((state) => ({
          conversations: [
            ...state.conversations,
            {
              id: generateId(),
              role,
              content,
              timestamp: Date.now(),
              mode: state.currentMode,
            },
          ],
        })),

      clearConversations: () => set({ conversations: [] }),
    }),
    {
      name: "xp-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        settings: state.settings,
        memories: state.memories,
        conversations: state.conversations,
        currentMode: state.currentMode,
      }),
    }
  )
);

export type AppStore = AppState;
