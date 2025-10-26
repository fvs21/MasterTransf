import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from "react-native";

import { Button } from "@/components/ui/Button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useTerminal } from "@/context/TerminalContext";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function GroupSetup() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const { startGroupSession } = useTerminal();

  const [goalAmount, setGoalAmount] = useState("");
  const [fixedPerPerson, setFixedPerPerson] = useState(false);
  const [perPersonAmount, setPerPersonAmount] = useState("");
  const [label, setLabel] = useState("");

  const handleStart = () => {
    const numGoal = parseFloat(goalAmount);

    if (isNaN(numGoal) || numGoal <= 0) {
      alert("Please enter a valid goal amount");
      return;
    }

    let numPerPerson: number | undefined;
    if (fixedPerPerson) {
      numPerPerson = parseFloat(perPersonAmount);
      if (isNaN(numPerPerson) || numPerPerson <= 0) {
        alert("Please enter a valid per-person amount");
        return;
      }
    }

    startGroupSession(
      numGoal,
      fixedPerPerson,
      numPerPerson,
      label.trim() || undefined
    );
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
              <ThemedText type="subtitle">Group Pay</ThemedText>
              <ThemedText style={styles.description}>
                Set a goal amount and accept multiple contributions until it's
                reached. The terminal will automatically stop when the goal is
                met.
              </ThemedText>
            </View>

            <View style={styles.form}>
              <View style={styles.field}>
                <ThemedText type="defaultSemiBold" style={styles.label}>
                  Goal Amount *
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
                    value={goalAmount}
                    onChangeText={setGoalAmount}
                    placeholder="0.00"
                    placeholderTextColor={palette.icon}
                    keyboardType="decimal-pad"
                    autoFocus
                  />
                </View>
              </View>

              <View style={styles.toggleField}>
                <View style={styles.toggleHeader}>
                  <View style={styles.toggleInfo}>
                    <ThemedText type="defaultSemiBold">
                      Fixed per-person amount
                    </ThemedText>
                    <ThemedText style={styles.toggleDescription}>
                      {fixedPerPerson
                        ? "Each contribution will be a fixed amount"
                        : "Contributors can choose their amount"}
                    </ThemedText>
                  </View>
                  <Switch
                    value={fixedPerPerson}
                    onValueChange={setFixedPerPerson}
                    trackColor={{
                      false: palette.icon + "30",
                      true: palette.tint,
                    }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                {fixedPerPerson && (
                  <View style={styles.field}>
                    <ThemedText type="defaultSemiBold" style={styles.label}>
                      Amount per person *
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
                        value={perPersonAmount}
                        onChangeText={setPerPersonAmount}
                        placeholder="0.00"
                        placeholderTextColor={palette.icon}
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </View>
                )}
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
                  placeholder="e.g., Team lunch, Group gift"
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
  toggleField: {
    gap: 16,
  },
  toggleHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  toggleInfo: {
    flex: 1,
    gap: 4,
  },
  toggleDescription: {
    fontSize: 13,
    opacity: 0.6,
  },
  actions: {
    padding: 24,
    paddingTop: 16,
  },
});
