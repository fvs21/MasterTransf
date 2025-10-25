import React from "react";
import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

type ButtonVariant = "primary" | "secondary" | "success" | "info" | "danger";

type ButtonProps = Omit<PressableProps, "style"> & {
  title: string;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

const SUCCESS_COLOR = "#16A34A";
const INFO_COLOR = "#2563EB";
const DANGER_COLOR = "#DC2626";

export function Button({
  title,
  variant = "primary",
  fullWidth,
  style,
  disabled,
  ...rest
}: ButtonProps) {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];

  const isSecondary = variant === "secondary";

  const backgroundColor = getBackgroundColor(variant, palette.tint);
  const borderColor = isSecondary ? palette.icon : backgroundColor;
  const textColor = isSecondary ? palette.tint : "#FFFFFF";

  return (
    <Pressable
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: isSecondary ? "transparent" : backgroundColor,
          borderColor,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          width: fullWidth ? "100%" : undefined,
        },
        isSecondary && styles.secondary,
        style,
      ]}
      {...rest}
    >
      <ThemedText
        type="defaultSemiBold"
        style={[styles.label, { color: textColor }]}
      >
        {title}
      </ThemedText>
    </Pressable>
  );
}

const getBackgroundColor = (
  variant: ButtonVariant,
  fallback: string
): string => {
  switch (variant) {
    case "success":
      return SUCCESS_COLOR;
    case "info":
      return INFO_COLOR;
    case "danger":
      return DANGER_COLOR;
    case "primary":
      return fallback;
    case "secondary":
    default:
      return "transparent";
  }
};

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  secondary: {
    paddingVertical: 12,
  },
  label: {
    fontSize: 15,
  },
});
