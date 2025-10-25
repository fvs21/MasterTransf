import { useState } from 'react';
import { TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useBanking } from '@/context/BankingContext';
import { Button } from '@/components/ui/Button';

import { SectionCard } from './SectionCard';
import { formStyles } from './styles';
import { parseMonetary } from './utils';

type Feedback =
  | {
      type: 'success' | 'error';
      message: string;
    }
  | null;

export function CreateAccountSection({
  isOpen,
  onToggle,
}: {
  isOpen: boolean;
  onToggle: () => void;
}) {
  const { createAccount } = useBanking();
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  const [alias, setAlias] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [feedback, setFeedback] = useState<Feedback>(null);

  const handleCreateAccount = () => {
    setFeedback(null);
    const amount = parseMonetary(initialBalance);

    // TODO: Replace with API mutation integration once backend is available.
    const result = createAccount({ alias, initialBalance: amount });

    if (result.success) {
      setAlias('');
      setInitialBalance('');
      setFeedback({
        type: 'success',
        message: result.message ?? 'Cuenta creada correctamente.',
      });
    } else {
      setFeedback({ type: 'error', message: result.message });
    }
  };

  return (
    <SectionCard
      tone="create-account"
      title="Crear nueva cuenta"
      description="Configura un alias y, si lo necesitas, establece un saldo inicial."
      isOpen={isOpen}
      onToggle={onToggle}>
      <ThemedText type="defaultSemiBold">Alias de la cuenta</ThemedText>
      <TextInput
        placeholder="Ej. Ahorro viajes"
        placeholderTextColor="rgba(148, 163, 184, 0.7)"
        value={alias}
        onChangeText={setAlias}
        style={[
          formStyles.input,
          {
            borderColor: palette.icon,
            backgroundColor: colorScheme === 'light' ? '#F8FAFC' : '#1E293B',
            color: colorScheme === 'light' ? '#0F172A' : '#E2E8F0',
          },
        ]}
      />

      <ThemedText type="defaultSemiBold">Saldo inicial (opcional)</ThemedText>
      <TextInput
        placeholder="0.00"
        placeholderTextColor="rgba(148, 163, 184, 0.7)"
        keyboardType="decimal-pad"
        value={initialBalance}
        onChangeText={setInitialBalance}
        style={[
          formStyles.input,
          {
            borderColor: palette.icon,
            backgroundColor: colorScheme === 'light' ? '#F8FAFC' : '#1E293B',
            color: colorScheme === 'light' ? '#0F172A' : '#E2E8F0',
          },
        ]}
      />

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
        title="Crear cuenta"
        onPress={handleCreateAccount}
        variant="primary"
        fullWidth
        style={{ marginTop: 12 }}
      />
    </SectionCard>
  );
}
