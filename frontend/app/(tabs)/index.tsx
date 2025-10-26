import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useBanking } from "@/context/BankingContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { StyleSheet, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const formatCurrency = (value: number, currency: string) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);

export default function DashboardScreen() {
  const { accounts, totalBalance, transactions } = useBanking();
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const { user } = useAuth();

  const latestTransactions = transactions.slice(0, 4);
  const greetingName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.nickname ||
    "Cliente";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.greeting}>Hello, {greetingName}</ThemedText>
          <ThemedText type="title" style={styles.title}>Dashboard</ThemedText>
        </View>

        {/* Balance Card */}
        <View
          style={[
            styles.balanceCard,
            {
              backgroundColor: colorScheme === "light" ? "#3B82F6" : "#1E40AF",
            },
          ]}
        >
          <ThemedText style={styles.balanceLabel}>Total Balance</ThemedText>
          <ThemedText style={styles.balanceValue}>
            {formatCurrency(totalBalance, "MXN")}
          </ThemedText>
          <ThemedText style={styles.balanceHint}>
            {accounts.length} {accounts.length === 1 ? "account" : "accounts"}
          </ThemedText>
        </View>

        {/* Accounts Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Accounts
          </ThemedText>
          <View style={styles.accountsGrid}>
            {accounts.map((account) => (
              <View
                key={account.id}
                style={[
                  styles.accountCard,
                  {
                    backgroundColor: colorScheme === "light" ? "#FFFFFF" : "#1F2937",
                  },
                ]}
              >
                <ThemedText style={styles.accountAlias}>
                  {account.alias}
                </ThemedText>
                <ThemedText style={styles.accountNumber}>
                  {account.number}
                </ThemedText>
                <ThemedText type="defaultSemiBold" style={styles.accountBalance}>
                  {formatCurrency(account.balance, account.currency)}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Recent
          </ThemedText>
          {latestTransactions.length === 0 ? (
            <ThemedText style={styles.emptyState}>
              No recent transactions
            </ThemedText>
          ) : (
            <View style={styles.transactionsList}>
              {latestTransactions.map((transaction) => {
                const sign = transaction.type === "transfer" ? "-" : "+";
                const detail =
                  transaction.type === "transfer"
                    ? `${resolveAccountName(
                        accounts,
                        transaction.fromAccountId
                      )} → ${resolveAccountName(
                        accounts,
                        transaction.toAccountId
                      )}`
                    : transaction.description ?? "Movimiento";

                return (
                  <View
                    key={transaction.id}
                    style={[
                      styles.transactionRow,
                      {
                        backgroundColor: colorScheme === "light" ? "#F9FAFB" : "#1F2937",
                      },
                    ]}
                  >
                    <View style={styles.transactionInfo}>
                      <ThemedText type="defaultSemiBold" style={styles.transactionTitle}>
                        {describeTransaction(transaction.type)}
                      </ThemedText>
                      <ThemedText style={styles.transactionDetail}>
                        {detail}
                      </ThemedText>
                      <ThemedText style={styles.transactionDate}>
                        {formatDate(transaction.timestamp)}
                      </ThemedText>
                    </View>
                    <ThemedText
                      type="defaultSemiBold"
                      style={[
                        styles.transactionAmount,
                        { color: sign === "+" ? "#10B981" : "#EF4444" },
                      ]}
                    >
                      {sign}{formatCurrency(transaction.amount, transaction.currency)}
                    </ThemedText>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const describeTransaction = (
  type: import("@/context/BankingContext").TransactionType
) => {
  switch (type) {
    case "create-account":
      return "Account opening";
    case "deposit":
      return "Deposit received";
    case "transfer":
      return "Transfer sent";
    default:
      return "Transaction";
  }
};

const resolveAccountName = (
  accounts: import("@/context/BankingContext").Account[],
  id?: string
) => accounts.find((account) => account.id === id)?.alias ?? "External account";

const formatDate = (isoDate: string) =>
  new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate));

const styles = StyleSheet.create({
  container: {
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
  greeting: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  balanceCard: {
    borderRadius: 20,
    padding: 28,
    paddingVertical: 32,
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    minHeight: 140,
  },
  balanceLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 10,
    fontWeight: "500",
  },
  balanceValue: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 6,
    lineHeight: 38,
  },
  balanceHint: {
    color: "#FFFFFF",
    fontSize: 13,
    opacity: 0.85,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  accountsGrid: {
    gap: 12,
  },
  accountCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  accountAlias: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 12,
    opacity: 0.5,
    marginBottom: 12,
  },
  accountBalance: {
    fontSize: 22,
    fontWeight: "700",
  },
  transactionsList: {
    gap: 10,
  },
  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    padding: 16,
  },
  transactionInfo: {
    flex: 1,
    marginRight: 12,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  transactionDetail: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 11,
    opacity: 0.5,
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: "600",
  },
  emptyState: {
    fontSize: 14,
    opacity: 0.5,
    textAlign: "center",
    paddingVertical: 32,
  },
});
