import React from "react";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

type ProgressBarProps = {
  current: number;
  goal: number;
};

export function ProgressBar({ current, goal }: ProgressBarProps) {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];

  const percentage = Math.min((current / goal) * 100, 100);
  const isComplete = current >= goal;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="defaultSemiBold">
          ${current.toFixed(2)} / ${goal.toFixed(2)}
        </ThemedText>
        <ThemedText type="default" style={styles.percentage}>
          {percentage.toFixed(0)}%
        </ThemedText>
      </View>
      <View
        style={[
          styles.track,
          { backgroundColor: palette.icon + "30" },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              width: `${percentage}%`,
              backgroundColor: isComplete ? "#16A34A" : palette.tint,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  percentage: {
    fontSize: 14,
    opacity: 0.7,
  },
  track: {
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 6,
  },
});
