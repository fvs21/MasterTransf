import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Account } from '@/context/BankingContext';

import { formatCurrency } from './utils';

type AccountSelectorProps = {
  accounts: Account[];
  selectedId: string;
  onSelect: (accountId: string) => void;
  emptyMessage?: string;
};

export function AccountSelector({
  accounts,
  selectedId,
  onSelect,
  emptyMessage,
}: AccountSelectorProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  if (accounts.length === 0) {
    return (
      <ThemedText style={styles.helperText}>
        {emptyMessage ?? 'Crea una cuenta para comenzar.'}
      </ThemedText>
    );
  }

  return (
    <View style={styles.container}>
      {accounts.map((account) => {
        const isSelected = account.id === selectedId;
        return (
          <Pressable
            key={account.id}
            onPress={() => onSelect(account.id)}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            style={({ pressed }) => [
              styles.option,
              {
                borderColor: isSelected ? palette.tint : palette.icon,
                backgroundColor:
                  colorScheme === 'light'
                    ? isSelected
                      ? '#EFF6FF'
                      : '#F8FAFC'
                    : isSelected
                      ? '#1E3A8A'
                      : '#1E293B',
                opacity: pressed ? 0.85 : 1,
              },
            ]}>
            <ThemedText type="defaultSemiBold">{account.alias}</ThemedText>
            <ThemedText style={styles.detail}>{account.number}</ThemedText>
            <ThemedText style={styles.detail}>
              {formatCurrency(account.balance, account.currency)}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  option: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 4,
  },
  detail: {
    fontSize: 12,
    opacity: 0.7,
  },
  helperText: {
    fontSize: 12,
    opacity: 0.7,
  },
});
