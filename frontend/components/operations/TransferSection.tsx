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
        message: result.message ?? "Transferencia realizada.",
      });
    } else {
      setFeedback({ type: "error", message: result.message });
    }
  };

  return (
    <SectionCard
      tone="transfer"
      title="Transferencia entre cuentas"
      description="Mueve saldo entre tus cuentas. Valida que el origen tenga fondos suficientes."
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <ThemedText type="defaultSemiBold">Cuenta origen</ThemedText>
      <AccountSelector
        accounts={accounts}
        selectedId={fromAccountId}
        onSelect={setFromAccountId}
      />

      <ThemedText type="defaultSemiBold">Cuenta destino</ThemedText>
      <AccountSelector
        accounts={destinationCandidates}
        selectedId={toAccountId}
        onSelect={setToAccountId}
        emptyMessage="Agrega otra cuenta para transferir fondos."
      />

      <ThemedText type="defaultSemiBold">Monto</ThemedText>
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

      <ThemedText type="defaultSemiBold">Concepto</ThemedText>
      <TextInput
        placeholder="Ej. Ahorro mensual"
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
          Saldo disponible:{" "}
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
        title="Transferir"
        onPress={handleTransfer}
        variant="info"
        fullWidth
        style={{ marginTop: 12 }}
      />
    </SectionCard>
  );
}
