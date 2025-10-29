import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, View, Modal, Pressable } from "react-native";

import { ContributionList } from "@/components/terminal/ContributionList";
import { Button } from "@/components/ui/Button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useTerminal } from "@/context/TerminalContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import usePeripheral, { Transaction } from "@/hooks/usePeripheral";
import { BASE_HOST, BASE_URL } from "@/api";
import axios from "axios";

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
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<{
    amount: number;
    concept: string;
    payer: string;
  } | null>(null);

  const { startAdvertising, stopAdvertising } = usePeripheral();
  const ws = useRef<WebSocket | null>(null);

  const mockPayeeId = "nek21njkl";

  useEffect(() => {
    const initialize = async () => {
      if (!session) return;

      const { data } = await axios.post(`${BASE_URL}/api/token`);

      const token = data?.result;

      if(!token) {
        Alert.alert(
          "Error",
          "Error fetching token",
          [{ text: "OK" }]
        );
        return;
      }

      const transaction: Transaction = {
        payeeId: mockPayeeId,
        receiver: "Alex Fitzmaurice",
        amount: session.fixedAmount!,
        secureToken: token,
        concept: session.concept || ""
      }

      const newWs = new WebSocket(`wss://${BASE_HOST}/api/payments/ws/terminal/single/${mockPayeeId}`);

      newWs.onopen = () => {
        console.log("WebSocket connection opened");
      };

      newWs.onmessage = (event) => {
        console.log("WebSocket message received:", event.data);
        try {
          const message = JSON.parse(event.data);
          if (message.type === "transfer-received") {
            setPaymentData(message.data);
            setModalVisible(true);
            stopSession();
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      newWs.onclose = (e) => {
        console.log("WebSocket connection closed", e.reason);
      };

      ws.current = newWs;

      startAdvertising(transaction);
      setIsLoading(false);
    }

    initialize();

    return () => {
      stopAdvertising();
    };
  }, [session]);

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
    <>
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
          <ContributionList contributions={session.contributions} isLoading={isLoading} />
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

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colorScheme === "light" ? "#FFFFFF" : "#1E293B",
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <ThemedText style={styles.modalIcon}>💰</ThemedText>
              </View>
              <ThemedText type="title" style={styles.modalTitle}>
                Payment Received!
              </ThemedText>
              <ThemedText style={styles.modalSubtitle}>
                A new payment has been received
              </ThemedText>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.modalRow}>
                <ThemedText style={styles.modalLabel}>Amount</ThemedText>
                <ThemedText type="defaultSemiBold" style={styles.modalValue}>
                  ${paymentData?.amount.toFixed(2)}
                </ThemedText>
              </View>
              <View style={styles.modalRow}>
                <ThemedText style={styles.modalLabel}>Concept</ThemedText>
                <ThemedText type="defaultSemiBold" style={styles.modalValue}>
                  {paymentData?.concept || "N/A"}
                </ThemedText>
              </View>
              <View style={styles.modalRow}>
                <ThemedText style={styles.modalLabel}>Payer ID</ThemedText>
                <ThemedText type="defaultSemiBold" style={styles.modalValue}>
                  {paymentData?.payer}
                </ThemedText>
              </View>
            </View>

            <Pressable
              style={[
                styles.modalButton,
                { backgroundColor: "#16A34A" },
              ]}
              onPress={() => setModalVisible(false)}
            >
              <ThemedText style={styles.modalButtonText}>Close</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 24,
    gap: 8,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(22, 163, 74, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  modalIcon: {
    fontSize: 32,
  },
  modalTitle: {
    textAlign: "center",
  },
  modalSubtitle: {
    textAlign: "center",
    opacity: 0.7,
    fontSize: 14,
  },
  modalBody: {
    gap: 16,
    marginBottom: 24,
  },
  modalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(148, 163, 184, 0.2)",
  },
  modalLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  modalValue: {
    fontSize: 16,
  },
  modalButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
