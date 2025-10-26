import { useEffect, useMemo, useState } from "react";
import { TextInput } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useBanking } from "@/context/BankingContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Button } from "@/components/ui/Button";

import { AccountSelector } from "./AccountSelector";
import { SectionCard } from "./SectionCard";
import { formStyles } from "./styles";
import { formatCurrency, parseMonetary } from "./utils";

type Feedback = {
  type: "success" | "error";
  message: string;
} | null;

export function TransferSection({
  isOpen,
  onToggle,
}: {
  isOpen: boolean;
  onToggle: () => void;
}) {
  const { accounts, transfer } = useBanking();
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];

  const firstAccountId = accounts[0]?.id ?? "";
  const secondAccountId = accounts.length > 1 ? accounts[1].id : firstAccountId;

  const [fromAccountId, setFromAccountId] = useState<string>(firstAccountId);
  const [toAccountId, setToAccountId] = useState<string>(secondAccountId);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    if (accounts.length === 0) {
      setFromAccountId("");
      setToAccountId("");
      return;
    }

    if (!accounts.find((account) => account.id === fromAccountId)) {
      setFromAccountId(accounts[0].id);
    }
  }, [accounts, fromAccountId]);

  useEffect(() => {
    if (accounts.length === 0) {
      setToAccountId("");
      return;
    }

    setToAccountId((current) => {
      if (!current || current === fromAccountId) {
        const candidate = accounts.find(
          (account) => account.id !== fromAccountId
        );
        return candidate ? candidate.id : accounts[0].id;
      }
      if (!accounts.find((account) => account.id === current)) {
        const candidate = accounts.find(
          (account) => account.id !== fromAccountId
        );
        return candidate ? candidate.id : accounts[0].id;
      }
      return current;
    });
  }, [accounts, fromAccountId]);

  const destinationCandidates = useMemo(
    () => accounts.filter((account) => account.id !== fromAccountId),
    [accounts, fromAccountId]
  );

  const sourceAccount = useMemo(
    () => accounts.find((account) => account.id === fromAccountId),
    [accounts, fromAccountId]
  );

  const handleTransfer = () => {
    setFeedback(null);
    const parsedAmount = parseMonetary(amount);

    // TODO: Replace with API mutation integration once backend is available.
    const result = transfer({
      fromAccountId,
      toAccountId,
      amount: parsedAmount,
      description,
    });

    if (result.success) {
      setAmount("");
      setDescription("");
      setFeedback({
        type: "success",
        message: result.message ?? "Transfer completed.",
      });
    } else {
      setFeedback({ type: "error", message: result.message });
    }
  };

  return (
    <SectionCard
      tone="transfer"
      title="Transfer between accounts"
      description="Move balance between your accounts. Verify that the source has sufficient funds."
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <ThemedText type="defaultSemiBold">Source account</ThemedText>
      <AccountSelector
        accounts={accounts}
        selectedId={fromAccountId}
        onSelect={setFromAccountId}
      />

      <ThemedText type="defaultSemiBold">Destination account</ThemedText>
      <AccountSelector
        accounts={destinationCandidates}
        selectedId={toAccountId}
        onSelect={setToAccountId}
        emptyMessage="Add another account to transfer funds."
      />

      <ThemedText type="defaultSemiBold">Amount</ThemedText>
      <TextInput
        placeholder="0.00"
        placeholderTextColor="rgba(148, 163, 184, 0.7)"
        keyboardType="decimal-pad"
        value={amount}
        onChangeText={setAmount}
        style={[
          formStyles.input,
          {
            borderColor: palette.icon,
            backgroundColor: colorScheme === "light" ? "#F8FAFC" : "#1E293B",
            color: colorScheme === "light" ? "#0F172A" : "#E2E8F0",
          },
        ]}
      />

      <ThemedText type="defaultSemiBold">Description</ThemedText>
      <TextInput
        placeholder="e.g. Monthly savings"
        placeholderTextColor="rgba(148, 163, 184, 0.7)"
        value={description}
        onChangeText={setDescription}
        style={[
          formStyles.input,
          formStyles.multiline,
          {
            borderColor: palette.icon,
            backgroundColor: colorScheme === "light" ? "#F8FAFC" : "#1E293B",
            color: colorScheme === "light" ? "#0F172A" : "#E2E8F0",
          },
        ]}
        multiline
      />

      {sourceAccount && (
        <ThemedText style={formStyles.helperText}>
          Available balance:{" "}
          {formatCurrency(sourceAccount.balance, sourceAccount.currency)}
        </ThemedText>
      )}

      {feedback && (
        <ThemedText
          style={[
            formStyles.feedback,
            feedback.type === "success" ? formStyles.success : formStyles.error,
          ]}
        >
          {feedback.message}
        </ThemedText>
      )}

      <Button
        title="Transfer"
        onPress={handleTransfer}
        variant="info"
        fullWidth
        style={{ marginTop: 12 }}
      />
    </SectionCard>
  );
}
