import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

import { ContributionList } from "@/components/terminal/ContributionList";
import { ProgressBar } from "@/components/terminal/ProgressBar";
import { Button } from "@/components/ui/Button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useTerminal } from "@/context/TerminalContext";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function GroupPayTerminal() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const {
    session,
    isActive,
    stopSession,
    resetSession,
  } = useTerminal();

  const [showCompletionMessage, setShowCompletionMessage] = useState(false);

  useEffect(() => {
    if (!session || session.mode !== "group") {
      router.replace("/(tabs)/terminal");
      return;
    }

    // Check if goal reached
    if (
      !isActive &&
      !showCompletionMessage &&
      session.goalAmount &&
      session.currentTotal >= session.goalAmount
    ) {
      setShowCompletionMessage(true);
      Alert.alert(
        "Goal Reached!",
        `The goal of $${session.goalAmount.toFixed(2)} has been reached!`,
        [{ text: "OK" }]
      );
    }
  }, [session, isActive, showCompletionMessage, router]);

  if (!session || session.mode !== "group") {
    return null;
  }

  const handleStopSession = () => {
    Alert.alert(
      "Stop Session",
      "Are you sure you want to stop this session?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Stop",
          style: "destructive",
          onPress: () => {
            stopSession();
          },
        },
      ]
    );
  };

  const handleReset = () => {
    Alert.alert(
      "Reset Terminal",
      "This will clear the current session. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            resetSession();
            router.replace("/(tabs)/terminal");
          },
        },
      ]
    );
  };

  const showProgress = session.goalAmount !== undefined;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.statusBadge}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isActive ? "#16A34A" : palette.icon },
            ]}
          />
          <ThemedText type="defaultSemiBold" style={styles.statusText}>
            {isActive ? "Active" : "Stopped"}
          </ThemedText>
        </View>

        <ThemedText type="title" style={styles.title}>
          Group Pay
        </ThemedText>

        {session.label && (
          <ThemedText style={styles.label}>{session.label}</ThemedText>
        )}

        {showProgress && (
          <View style={styles.progressSection}>
            <ProgressBar
              current={session.currentTotal}
              goal={session.goalAmount!}
            />
          </View>
        )}

        {!showProgress && (
          <View style={styles.totalBox}>
            <ThemedText type="default" style={styles.totalLabel}>
              Total Collected
            </ThemedText>
            <ThemedText type="subtitle" style={styles.totalAmount}>
              ${session.currentTotal.toFixed(2)}
            </ThemedText>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            💸 Contributors
          </ThemedText>
          <View style={[styles.countBadge, { backgroundColor: palette.tint + "15" }]}>
            <ThemedText
              type="defaultSemiBold"
              style={[styles.countText, { color: palette.tint }]}
            >
              {session.contributions.length}
            </ThemedText>
          </View>
        </View>
        <ContributionList contributions={session.contributions} />
      </View>

      <View style={styles.actions}>
        <View style={styles.secondaryActions}>
          {isActive && (
            <Button
              title="Stop Session"
              variant="danger"
              onPress={handleStopSession}
              style={styles.secondaryButton}
            />
          )}
          <Button
            title="Reset"
            variant="secondary"
            onPress={handleReset}
            style={styles.secondaryButton}
          />
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 60,
    gap: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
  },
  title: {
    marginTop: 8,
  },
  label: {
    fontSize: 16,
    opacity: 0.7,
  },
  progressSection: {
    marginTop: 8,
  },
  totalBox: {
    marginTop: 8,
    padding: 16,
    backgroundColor: "rgba(128, 128, 128, 0.1)",
    borderRadius: 12,
    alignItems: "center",
    gap: 4,
  },
  totalLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  totalAmount: {
    fontSize: 28,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
  },
  countBadge: {
    minWidth: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  countText: {
    fontSize: 15,
    fontWeight: "700",
  },
  actions: {
    padding: 24,
    paddingTop: 16,
    gap: 12,
  },
  secondaryActions: {
    flexDirection: "row",
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
  },
});
