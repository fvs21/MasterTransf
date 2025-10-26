import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

import { ContributionList } from "@/components/terminal/ContributionList";
import { Button } from "@/components/ui/Button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useTerminal } from "@/context/TerminalContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import usePeripheral, { Transaction } from "@/hooks/usePeripheral";

export default function IndividualPayTerminal() {
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

  const { startAdvertising, stopAdvertising } = usePeripheral();

  useEffect(() => {
    if (!session) return;

    const transaction: Transaction = {
        payeeId: "nek21njkl",
        receiver: "Alex Fitzmaurice",
        amount: session.fixedAmount!,
        secureToken: "abc123xyz",
        concept: session.concept || ""
    }

    startAdvertising(transaction);

    return () => {
      stopAdvertising();
    };
  }, []);

  useEffect(() => {
    if (!session || session.mode !== "individual") {
      router.replace("/(tabs)/terminal");
      return;
    }

    // Check if payment received
    if (!isActive && !showCompletionMessage && session.contributions.length === 1) {
      setShowCompletionMessage(true);
      Alert.alert(
        "Payment Received!",
        "The payment has been successfully received.",
        [{ text: "OK" }]
      );
    }
  }, [session, isActive, showCompletionMessage, router]);

  if (!session || session.mode !== "individual") {
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
          Individual Pay
        </ThemedText>

        {session.concept && (
          <ThemedText style={styles.label}>{session.concept}</ThemedText>
        )}

        {session.fixedAmount && (
          <View style={styles.amountBox}>
            <ThemedText type="subtitle" style={styles.amount}>
              ${session.fixedAmount.toFixed(2)}
            </ThemedText>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            💳 Payment Details
          </ThemedText>
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
  amountBox: {
    marginTop: 8,
    padding: 16,
    backgroundColor: "rgba(22, 163, 74, 0.1)",
    borderRadius: 12,
    alignItems: "center",
  },
  amount: {
    color: "#16A34A",
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
