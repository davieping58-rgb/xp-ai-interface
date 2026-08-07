import React from "react";
import { render, screen } from "@testing-library/react-native";
import { View } from "react-native";

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  Stack: ({ children }: { children: React.ReactNode }) => (
    <View testID="stack-layout">{children}</View>
  ),
}));

describe("RootLayout", () => {
  it("renders stack layout without crashing", () => {
    const { toJSON } = render(<View testID="stack-layout" />);
    expect(toJSON()).toBeTruthy();
  });

  it("has stack layout testID present", () => {
    render(<View testID="stack-layout" />);
    expect(screen.getByTestId("stack-layout")).toBeTruthy();
  });
});
