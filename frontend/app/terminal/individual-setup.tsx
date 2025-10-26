import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { Button } from "@/components/ui/Button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useTerminal } from "@/context/TerminalContext";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function IndividualSetup() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const { startIndividualSession } = useTerminal();

  const [amount, setAmount] = useState("");
  const [label, setLabel] = useState("");

  const handleStart = () => {
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    startIndividualSession(numAmount, label.trim() || undefined);
    router.replace("/terminal/active-terminal");
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={styles.info}>
              <ThemedText type="subtitle">Individual Pay</ThemedText>
              <ThemedText style={styles.description}>
                Set a fixed amount that one person will pay. The terminal will
                automatically stop after receiving the payment.
              </ThemedText>
            </View>

            <View style={styles.form}>
              <View style={styles.field}>
                <ThemedText type="defaultSemiBold" style={styles.label}>
                  Amount *
                </ThemedText>
                <View style={styles.inputContainer}>
                  <ThemedText type="defaultSemiBold" style={styles.currency}>
                    $
                  </ThemedText>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: palette.icon + "10",
                        color: palette.text,
                        borderColor: palette.icon + "30",
                      },
                    ]}
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0.00"
                    placeholderTextColor={palette.icon}
                    keyboardType="decimal-pad"
                    autoFocus
                  />
                </View>
              </View>

              <View style={styles.field}>
                <ThemedText type="defaultSemiBold" style={styles.label}>
                  Label (Optional)
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: palette.icon + "10",
                      color: palette.text,
                      borderColor: palette.icon + "30",
                    },
                  ]}
                  value={label}
                  onChangeText={setLabel}
                  placeholder="e.g., Lunch, Concert ticket"
                  placeholderTextColor={palette.icon}
                />
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            <Button
              title="Start Terminal"
              variant="success"
              fullWidth
              onPress={handleStart}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    gap: 24,
  },
  info: {
    gap: 8,
  },
  description: {
    opacity: 0.7,
    fontSize: 14,
    lineHeight: 20,
  },
  form: {
    gap: 20,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  currency: {
    fontSize: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  actions: {
    padding: 24,
    paddingTop: 16,
  },
});
