import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { Button } from "@/components/ui/Button";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

type AddContributionModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string, amount: number) => void;
  fixedAmount?: number;
  mode: "individual" | "group";
};

export function AddContributionModal({
  visible,
  onClose,
  onSubmit,
  fixedAmount,
  mode,
}: AddContributionModalProps) {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];

  const [name, setName] = useState("");
  const [amount, setAmount] = useState(
    fixedAmount ? fixedAmount.toString() : ""
  );

  const isAmountFixed = fixedAmount !== undefined;

  const handleSubmit = () => {
    const trimmedName = name.trim();
    const numAmount = parseFloat(amount);

    if (!trimmedName) {
      alert("Please enter a name");
      return;
    }

    if (isNaN(numAmount) || numAmount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    onSubmit(trimmedName, numAmount);
    setName("");
    setAmount(fixedAmount ? fixedAmount.toString() : "");
    onClose();
  };

  const handleClose = () => {
    setName("");
    setAmount(fixedAmount ? fixedAmount.toString() : "");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.centered}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View
              style={[
                styles.modal,
                {
                  backgroundColor: palette.background,
                  borderColor: palette.icon + "20",
                },
              ]}
            >
              <ThemedText type="subtitle" style={styles.title}>
                Add Contribution
              </ThemedText>

              <View style={styles.form}>
                <View style={styles.field}>
                  <ThemedText type="defaultSemiBold" style={styles.label}>
                    Name
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
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter name"
                    placeholderTextColor={palette.icon}
                    autoFocus
                  />
                </View>

                <View style={styles.field}>
                  <ThemedText type="defaultSemiBold" style={styles.label}>
                    Amount
                  </ThemedText>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: palette.icon + "10",
                        color: palette.text,
                        borderColor: palette.icon + "30",
                      },
                      isAmountFixed && styles.inputDisabled,
                    ]}
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0.00"
                    placeholderTextColor={palette.icon}
                    keyboardType="decimal-pad"
                    editable={!isAmountFixed}
                  />
                  {isAmountFixed && (
                    <ThemedText style={styles.hint}>
                      {mode === "individual"
                        ? "Fixed amount for this payment"
                        : "Fixed amount per person"}
                    </ThemedText>
                  )}
                </View>
              </View>

              <View style={styles.actions}>
                <Button
                  title="Cancel"
                  variant="secondary"
                  onPress={handleClose}
                  style={styles.button}
                />
                <Button
                  title="Add"
                  variant="success"
                  onPress={handleSubmit}
                  style={styles.button}
                />
              </View>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "85%",
    maxWidth: 400,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    gap: 20,
  },
  title: {
    textAlign: "center",
  },
  form: {
    gap: 16,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  hint: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
  },
});
