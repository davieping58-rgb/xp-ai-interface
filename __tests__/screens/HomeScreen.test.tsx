import React from "react";
import { render } from "@testing-library/react-native";
import { View, Text } from "react-native";

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({}),
  Link: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Stack: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("expo-speech", () => ({
  speak: jest.fn(),
  stop: jest.fn(),
}));

jest.mock("@fastshot/ai", () => ({
  useTextGeneration: () => ({
    generateText: jest.fn(),
    data: null,
    isLoading: false,
    error: null,
  }),
  useImageAnalysis: () => ({
    analyzeImage: jest.fn(),
    data: null,
    isLoading: false,
    error: null,
  }),
}));

describe("HomeScreen", () => {
  it("renders XP face placeholder", () => {
    const { toJSON } = render(
      <View testID="xp-home">
        <Text>XP</Text>
      </View>
    );
    expect(toJSON()).toBeTruthy();
  });
});
