import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Account, Transaction, useBanking } from '@/context/BankingContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type FilterOption = 'all' | string;

const formatCurrency = (value: number, currency: string) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);

const formatDateTime = (isoDate: string) =>
  new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoDate));

export default function ActivityScreen() {
  const { accounts, transactions } = useBanking();
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');

  const filteredTransactions = useMemo(() => {
    if (activeFilter === 'all') return transactions;

    return transactions.filter(
      (transaction) =>
        transaction.fromAccountId === activeFilter || transaction.toAccountId === activeFilter,
    );
  }, [transactions, activeFilter]);

  const totals = useMemo(() => {
    return filteredTransactions.reduce(
      (acc, transaction) => {
        const direction = resolveDirection(transaction, activeFilter);

        if (direction === 'in') {
          acc.incoming += transaction.amount;
        } else if (direction === 'out') {
          acc.outgoing += transaction.amount;
        }

        return acc;
      },
      { incoming: 0, outgoing: 0 },
    );
  }, [filteredTransactions, activeFilter]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>Activity</ThemedText>
          <ThemedText style={styles.subtitle}>
            Review your transactions and filter by account
          </ThemedText>
        </View>

        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: colorScheme === 'light' ? '#F8FAFC' : '#0B1623',
              borderColor: colorScheme === 'light' ? '#E2E8F0' : '#1F2A37',
            },
          ]}>
          <View style={styles.summaryRow}>
            <ThemedText type="defaultSemiBold">Incoming</ThemedText>
            <ThemedText style={styles.summaryPositive}>
              {formatCurrency(totals.incoming, resolveCurrency(accounts, activeFilter))}
            </ThemedText>
          </View>
          <View style={styles.summaryRow}>
            <ThemedText type="defaultSemiBold">Outgoing</ThemedText>
            <ThemedText style={styles.summaryNegative}>
              -{formatCurrency(totals.outgoing, resolveCurrency(accounts, activeFilter))}
            </ThemedText>
          </View>
        </View>

        <View style={styles.filterSection}>
          <ThemedText type="subtitle">Filter by account</ThemedText>
          <View style={styles.filterRow}>
            <FilterChip
              label="All"
              isActive={activeFilter === 'all'}
              onPress={() => setActiveFilter('all')}
              palette={palette}
              colorScheme={colorScheme}
            />
            {accounts.map((account) => (
              <FilterChip
                key={account.id}
                label={account.alias}
                isActive={activeFilter === account.id}
                onPress={() => setActiveFilter(account.id)}
                palette={palette}
                colorScheme={colorScheme}
              />
            ))}
          </View>
        </View>

        <View style={styles.timeline}>
          {filteredTransactions.length === 0 ? (
            <ThemedText style={styles.emptyState}>
              No transactions found for this filter. Perform an operation from the Operations tab.
            </ThemedText>
          ) : (
            filteredTransactions.map((transaction) => {
              const direction = resolveDirection(transaction, activeFilter);
              const accent = resolveAccent(direction);
              const title = resolveTitle(transaction.type, direction);
              const supporting = buildSupportingText(transaction, accounts);

              return (
                <View 
                  key={transaction.id} 
                  style={[
                    styles.timelineRow,
                    {
                      backgroundColor: colorScheme === 'light' ? '#FFFFFF' : '#1F2937',
                      borderColor: colorScheme === 'light' ? '#E5E7EB' : '#374151',
                    }
                  ]}
                >
                  <View
                    style={[
                      styles.timelineMarker,
                      {
                        borderColor: accent,
                      },
                    ]}
                  />
                  <View style={styles.timelineContent}>
                    <ThemedText type="defaultSemiBold" style={styles.timelineTitle}>
                      {title}
                    </ThemedText>
                    <ThemedText style={styles.timelineSupporting}>{supporting}</ThemedText>
                    <ThemedText style={styles.timelineDate}>
                      {formatDateTime(transaction.timestamp)}
                    </ThemedText>
                  </View>
                  <ThemedText
                    type="defaultSemiBold"
                    style={[
                      styles.timelineAmount,
                      {
                        color: accent,
                      },
                    ]}>
                    {formatAmountPrefix(direction)}
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </ThemedText>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const FilterChip = ({
  label,
  isActive,
  onPress,
  palette,
  colorScheme,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
  palette: (typeof Colors)['light'];
  colorScheme: 'light' | 'dark';
}) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityState={{ selected: isActive }}
    style={({ pressed }) => [
      styles.chip,
      {
        backgroundColor: isActive
          ? palette.tint
          : colorScheme === 'light'
            ? '#E2E8F0'
            : '#1F2937',
        opacity: pressed ? 0.85 : 1,
      },
    ]}>
    <ThemedText
      type="defaultSemiBold"
      style={[
        styles.chipLabel,
        {
          color: isActive ? '#FFFFFF' : colorScheme === 'light' ? '#1F2937' : '#E2E8F0',
        },
      ]}>
      {label}
    </ThemedText>
  </Pressable>
);

const resolveCurrency = (accounts: Account[], filter: FilterOption) => {
  if (filter === 'all') return 'MXN';
  return accounts.find((account) => account.id === filter)?.currency ?? 'MXN';
};

const resolveDirection = (transaction: Transaction, filter: FilterOption) => {
  if (filter === 'all') {
    if (transaction.type === 'transfer') return 'internal';
    return 'in';
  }

  if (transaction.toAccountId === filter && transaction.fromAccountId === filter) {
    return 'internal';
  }

  if (transaction.toAccountId === filter) {
    return 'in';
  }

  if (transaction.fromAccountId === filter) {
    return 'out';
  }

  return 'other';
};

const resolveAccent = (direction: ReturnType<typeof resolveDirection>) => {
  switch (direction) {
    case 'in':
      return '#16A34A';
    case 'out':
      return '#DC2626';
    case 'internal':
      return '#2563EB';
    default:
      return '#6B7280';
  }
};

const formatAmountPrefix = (direction: ReturnType<typeof resolveDirection>) => {
  switch (direction) {
    case 'in':
      return '+';
    case 'out':
      return '-';
    case 'internal':
      return '<> ';
    default:
      return '';
  }
};

const resolveTitle = (
  type: Transaction['type'],
  direction: ReturnType<typeof resolveDirection>,
) => {
  if (type === 'create-account') {
    return 'Initial balance';
  }
  if (type === 'deposit') {
    return 'Deposit';
  }
  if (direction === 'out') {
    return 'Transfer sent';
  }
  if (direction === 'in') {
    return 'Transfer received';
  }
  return 'Internal transfer';
};

const buildSupportingText = (transaction: Transaction, accounts: Account[]) => {
  const fromAlias =
    accounts.find((account) => account.id === transaction.fromAccountId)?.alias ?? 'External source';
  const toAlias =
    accounts.find((account) => account.id === transaction.toAccountId)?.alias ?? 'External destination';

  if (transaction.type === 'deposit' || transaction.type === 'create-account') {
    return transaction.description ?? 'Registered transaction';
  }

  return `${fromAlias} -> ${toAlias}${
    transaction.description ? ` - ${transaction.description}` : ''
  }`;
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.6,
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    gap: 12,
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryPositive: {
    color: '#16A34A',
    fontSize: 16,
  },
  summaryNegative: {
    color: '#DC2626',
    fontSize: 16,
  },
  filterSection: {
    gap: 12,
    marginTop: 24,
    marginBottom: 24,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  chipLabel: {
    fontSize: 12,
  },
  timeline: {
    gap: 12,
  },
  emptyState: {
    opacity: 0.7,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  timelineMarker: {
    width: 10,
    height: 10,
    borderRadius: 6,
    borderWidth: 3,
    borderColor: '#2563EB',
  },
  timelineContent: {
    flex: 1,
    gap: 4,
  },
  timelineTitle: {
    fontSize: 15,
  },
  timelineSupporting: {
    fontSize: 12,
    opacity: 0.7,
  },
  timelineDate: {
    fontSize: 11,
    opacity: 0.6,
  },
  timelineAmount: {
    fontSize: 15,
  },
});
