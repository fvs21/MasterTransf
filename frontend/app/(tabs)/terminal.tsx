import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTerminal } from "@/context/TerminalContext";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TerminalHome() {
  const router = useRouter();
  const { session, isActive } = useTerminal();
  const colorScheme = useColorScheme() ?? "light";

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
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>Terminal</ThemedText>
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
                ? "Individual Payment"
                : "Group Payment"}
            </ThemedText>
            {session?.concept && (
              <ThemedText style={styles.sessionLabel}>
                {session.concept}
              </ThemedText>
            )}
            <Button
              title="Continue Session"
              variant="success"
              fullWidth
              onPress={handleResumeSession}
              style={styles.resumeButton}
            />
          </View>
        ) : (
          <View style={styles.actions}>
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colorScheme === "light" ? "#FFFFFF" : "#1F2937",
                },
              ]}
            >
              <ThemedText type="subtitle" style={styles.cardTitle}>
                Individual Payment
              </ThemedText>
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

            <View
              style={[
                styles.card,
                {
                  backgroundColor: colorScheme === "light" ? "#FFFFFF" : "#1F2937",
                },
              ]}
            >
              <ThemedText type="subtitle" style={styles.cardTitle}>
                Group Payment
              </ThemedText>
              <ThemedText style={styles.cardDescription}>
                Collect multiple payments until reaching a goal
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.6,
  },
  content: {
    flex: 1,
  },
  activeSession: {
    alignItems: "center",
    gap: 20,
    paddingTop: 40,
  },
  badge: {
    backgroundColor: "#10B981",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  sessionMode: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: "600",
  },
  sessionLabel: {
    opacity: 0.6,
    fontSize: 15,
  },
  resumeButton: {
    marginTop: 24,
    minWidth: 200,
  },
  actions: {
    gap: 16,
  },
  card: {
    padding: 24,
    borderRadius: 20,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  cardDescription: {
    opacity: 0.6,
    fontSize: 14,
    lineHeight: 20,
  },
});
