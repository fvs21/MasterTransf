import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTerminal } from "@/context/TerminalContext";

export default function TerminalHome() {
  const router = useRouter();
  const { session, isActive } = useTerminal();

  const handleStartIndividual = () => {
    router.push("/terminal/individual-setup");
  };

  const handleStartGroup = () => {
    router.push("/terminal/group-setup");
  };

  const handleResumeSession = () => {
    router.push("/terminal/active-terminal");
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Terminal</ThemedText>
        <ThemedText style={styles.subtitle}>
          Turn your device into a payment receiver
        </ThemedText>
      </View>

      <View style={styles.content}>
        {isActive ? (
          <View style={styles.activeSession}>
            <View style={styles.badge}>
              <ThemedText type="defaultSemiBold" style={styles.badgeText}>
                Active Session
              </ThemedText>
            </View>
            <ThemedText type="subtitle" style={styles.sessionMode}>
              {session?.mode === "individual"
                ? "Individual Pay"
                : "Group Pay"}
            </ThemedText>
            {session?.label && (
              <ThemedText style={styles.sessionLabel}>
                {session.label}
              </ThemedText>
            )}
            <Button
              title="Resume Session"
              variant="success"
              fullWidth
              onPress={handleResumeSession}
              style={styles.resumeButton}
            />
          </View>
        ) : (
          <View style={styles.actions}>
            <View style={styles.card}>
              <ThemedText type="subtitle">Individual Pay</ThemedText>
              <ThemedText style={styles.cardDescription}>
                Set a fixed amount for a single payment
              </ThemedText>
              <Button
                title="Start"
                variant="primary"
                fullWidth
                onPress={handleStartIndividual}
              />
            </View>

            <View style={styles.card}>
              <ThemedText type="subtitle">Group Pay</ThemedText>
              <ThemedText style={styles.cardDescription}>
                Collect multiple payments until a goal is reached
              </ThemedText>
              <Button
                title="Start"
                variant="info"
                fullWidth
                onPress={handleStartGroup}
              />
            </View>
          </View>
        )}
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
    gap: 8,
  },
  subtitle: {
    opacity: 0.7,
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  activeSession: {
    alignItems: "center",
    gap: 16,
    paddingTop: 40,
  },
  badge: {
    backgroundColor: "#16A34A",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  sessionMode: {
    marginTop: 8,
  },
  sessionLabel: {
    opacity: 0.7,
    fontSize: 16,
  },
  resumeButton: {
    marginTop: 16,
    minWidth: 200,
  },
  actions: {
    gap: 20,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    gap: 12,
    backgroundColor: "rgba(128, 128, 128, 0.1)",
  },
  cardDescription: {
    opacity: 0.7,
    fontSize: 14,
  },
});
