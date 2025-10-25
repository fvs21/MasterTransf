import { useEffect, useMemo, useState } from 'react';
import { TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useBanking } from '@/context/BankingContext';
import { Button } from '@/components/ui/Button';

import { AccountSelector } from './AccountSelector';
import { SectionCard } from './SectionCard';
import { formStyles } from './styles';
import { formatCurrency, parseMonetary } from './utils';

type Feedback =
  | {
      type: 'success' | 'error';
      message: string;
    }
  | null;

export function DepositSection({
  isOpen,
  onToggle,
}: {
  isOpen: boolean;
  onToggle: () => void;
}) {
  const { accounts, deposit } = useBanking();
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  const defaultAccountId = accounts[0]?.id ?? '';
  const [selectedAccountId, setSelectedAccountId] = useState<string>(defaultAccountId);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [feedback, setFeedback] = useState<Feedback>(null);

  const currentAccount = useMemo(
    () => accounts.find((account) => account.id === selectedAccountId),
    [accounts, selectedAccountId],
  );

  useEffect(() => {
    if (accounts.length === 0) {
      setSelectedAccountId('');
      return;
    }

    if (!accounts.find((account) => account.id === selectedAccountId)) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts, selectedAccountId]);

  const handleDeposit = () => {
    setFeedback(null);
    const parsedAmount = parseMonetary(amount);

    // TODO: Replace with API mutation integration once backend is available.
    const result = deposit({
      accountId: selectedAccountId,
      amount: parsedAmount,
      description,
    });

    if (result.success) {
      setAmount('');
      setDescription('');
      setFeedback({
        type: 'success',
        message: result.message ?? 'Deposito registrado.',
      });
    } else {
      setFeedback({ type: 'error', message: result.message });
    }
  };

  return (
    <SectionCard
      tone="deposit"
      title="Anadir saldo"
      description="Selecciona una cuenta destino y registra un nuevo deposito."
      isOpen={isOpen}
      onToggle={onToggle}>
      <ThemedText type="defaultSemiBold">Cuenta destino</ThemedText>
      <AccountSelector
        accounts={accounts}
        selectedId={selectedAccountId}
        onSelect={setSelectedAccountId}
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
            backgroundColor: colorScheme === 'light' ? '#F8FAFC' : '#1E293B',
            color: colorScheme === 'light' ? '#0F172A' : '#E2E8F0',
          },
        ]}
      />

      <ThemedText type="defaultSemiBold">Concepto</ThemedText>
      <TextInput
        placeholder="Ej. Pago de nomina"
        placeholderTextColor="rgba(148, 163, 184, 0.7)"
        value={description}
        onChangeText={setDescription}
        style={[
          formStyles.input,
          formStyles.multiline,
          {
            borderColor: palette.icon,
            backgroundColor: colorScheme === 'light' ? '#F8FAFC' : '#1E293B',
            color: colorScheme === 'light' ? '#0F172A' : '#E2E8F0',
          },
        ]}
        multiline
      />

      {currentAccount && (
        <ThemedText style={formStyles.helperText}>
          Saldo actual: {formatCurrency(currentAccount.balance, currentAccount.currency)}
        </ThemedText>
      )}

      {feedback && (
        <ThemedText
          style={[
            formStyles.feedback,
            feedback.type === 'success' ? formStyles.success : formStyles.error,
          ]}>
          {feedback.message}
        </ThemedText>
      )}

      <Button
        title="Registrar deposito"
        onPress={handleDeposit}
        variant="success"
        fullWidth
        style={{ marginTop: 12 }}
      />
    </SectionCard>
  );
}
