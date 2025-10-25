import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
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
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#082F49', dark: '#02131F' }}
      headerImage={
        <IconSymbol
          name="list.bullet.rectangle"
          size={280}
          color="rgba(148, 163, 184, 0.35)"
          style={styles.activityHeaderIcon}
        />
      }>
      <ThemedView style={styles.screen}>
        <ThemedView style={styles.headerBlock}>
          <ThemedText type="title">Actividad</ThemedText>
          <ThemedText style={styles.headerDescription}>
            Revisa tus movimientos recientes y filtra por cuenta para validar entradas y salidas de
            dinero.
          </ThemedText>
        </ThemedView>

        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: colorScheme === 'light' ? '#F8FAFC' : '#0B1623',
              borderColor: colorScheme === 'light' ? '#E2E8F0' : '#1F2A37',
            },
          ]}>
          <View style={styles.summaryRow}>
            <ThemedText type="defaultSemiBold">Entradas</ThemedText>
            <ThemedText style={styles.summaryPositive}>
              {formatCurrency(totals.incoming, resolveCurrency(accounts, activeFilter))}
            </ThemedText>
          </View>
          <View style={styles.summaryRow}>
            <ThemedText type="defaultSemiBold">Salidas</ThemedText>
            <ThemedText style={styles.summaryNegative}>
              -{formatCurrency(totals.outgoing, resolveCurrency(accounts, activeFilter))}
            </ThemedText>
          </View>
        </View>

        <ThemedView style={styles.filterSection}>
          <ThemedText type="subtitle">Filtrar por cuenta</ThemedText>
          <View style={styles.filterRow}>
            <FilterChip
              label="Todas"
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
        </ThemedView>

        <View style={styles.timeline}>
          {filteredTransactions.length === 0 ? (
            <ThemedText style={styles.emptyState}>
              No encontramos movimientos para este filtro. Realiza una operacion desde la pestana
              Operaciones.
            </ThemedText>
          ) : (
            filteredTransactions.map((transaction) => {
              const direction = resolveDirection(transaction, activeFilter);
              const accent = resolveAccent(direction);
              const title = resolveTitle(transaction.type, direction);
              const supporting = buildSupportingText(transaction, accounts);

              return (
                <View key={transaction.id} style={styles.timelineRow}>
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
      </ThemedView>
    </ParallaxScrollView>
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
    return 'Saldo inicial';
  }
  if (type === 'deposit') {
    return 'Deposito';
  }
  if (direction === 'out') {
    return 'Transferencia enviada';
  }
  if (direction === 'in') {
    return 'Transferencia recibida';
  }
  return 'Transferencia interna';
};

const buildSupportingText = (transaction: Transaction, accounts: Account[]) => {
  const fromAlias =
    accounts.find((account) => account.id === transaction.fromAccountId)?.alias ?? 'Origen externo';
  const toAlias =
    accounts.find((account) => account.id === transaction.toAccountId)?.alias ?? 'Destino externo';

  if (transaction.type === 'deposit' || transaction.type === 'create-account') {
    return transaction.description ?? 'Movimiento registrado';
  }

  return `${fromAlias} -> ${toAlias}${
    transaction.description ? ` - ${transaction.description}` : ''
  }`;
};

const styles = StyleSheet.create({
  screen: {
    gap: 24,
    paddingBottom: 56,
  },
  headerBlock: {
    gap: 10,
  },
  headerDescription: {
    opacity: 0.75,
    lineHeight: 20,
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    gap: 12,
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
    gap: 16,
  },
  emptyState: {
    opacity: 0.7,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.35)',
    borderRadius: 14,
    padding: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.02)',
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
  activityHeaderIcon: {
    position: 'absolute',
    bottom: -40,
    right: -40,
  },
});
