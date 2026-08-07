import { useAppStore } from "../../store/useAppStore";

describe("useAppStore", () => {
  beforeEach(() => {
    useAppStore.setState({
      currentAnimation: "idle",
      currentMode: "idle",
      subtitleText: "",
      isSpeaking: false,
      isListening: false,
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
      memories: [],
      conversations: [],
    });
  });

  it("should set mode correctly", () => {
    const { setMode } = useAppStore.getState();
    setMode("engineering");
    expect(useAppStore.getState().currentMode).toBe("engineering");
    expect(useAppStore.getState().settings.activeMode).toBe("engineering");
  });

  it("should add and remove memory", () => {
    const { addMemory } = useAppStore.getState();
    addMemory("fact", "User loves coding");
    expect(useAppStore.getState().memories).toHaveLength(1);
    expect(useAppStore.getState().memories[0].content).toBe("User loves coding");
    expect(useAppStore.getState().memories[0].type).toBe("fact");

    const memoryId = useAppStore.getState().memories[0].id;
    useAppStore.getState().removeMemory(memoryId);
    expect(useAppStore.getState().memories).toHaveLength(0);
  });

  it("should clear all memories", () => {
    const { addMemory, clearAllMemories } = useAppStore.getState();
    addMemory("fact", "Test 1");
    addMemory("preference", "Test 2");
    expect(useAppStore.getState().memories).toHaveLength(2);
    clearAllMemories();
    expect(useAppStore.getState().memories).toHaveLength(0);
  });

  it("should add conversation messages", () => {
    const { addMessage } = useAppStore.getState();
    addMessage("user", "Hello XP");
    addMessage("xp", "Hey there!");
    expect(useAppStore.getState().conversations).toHaveLength(2);
    expect(useAppStore.getState().conversations[0].role).toBe("user");
    expect(useAppStore.getState().conversations[1].role).toBe("xp");
  });

  it("should update settings", () => {
    const { updateSettings } = useAppStore.getState();
    updateSettings({ voiceEnabled: false, voiceSpeed: 1.5 });
    expect(useAppStore.getState().settings.voiceEnabled).toBe(false);
    expect(useAppStore.getState().settings.voiceSpeed).toBe(1.5);
  });

  it("should set animation state", () => {
    const { setAnimation } = useAppStore.getState();
    setAnimation("thinking");
    expect(useAppStore.getState().currentAnimation).toBe("thinking");
  });
});
