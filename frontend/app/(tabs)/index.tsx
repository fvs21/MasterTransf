import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useBanking } from "@/context/BankingContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { StyleSheet, View } from "react-native";

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
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#143C66", dark: "#0A1D2E" }}
      headerImage={
        <IconSymbol
          name="building.columns"
          size={320}
          color="rgba(255,255,255,0.12)"
          style={styles.headerIcon}
        />
      }
    >
      <ThemedView style={styles.hero}>
        <ThemedText type="subtitle" style={styles.greeting}>
          Hola, {greetingName}
        </ThemedText>
        <ThemedText type="title" style={styles.heroTitle}>
          Tu banca digital
        </ThemedText>
        <ThemedText style={styles.heroCopy}>
          Consulta tus cuentas, revisa movimientos y realiza operaciones sin
          salir de la app.
        </ThemedText>
      </ThemedView>

      <ThemedView
        style={[
          styles.balanceCard,
          {
            backgroundColor: colorScheme === "light" ? "#FFFFFF" : "#0E1A28",
            borderColor: palette.icon,
          },
        ]}
      >
        <ThemedText style={styles.balanceLabel}>
          Saldo total disponible
        </ThemedText>
        <ThemedText type="title" style={styles.balanceValue}>
          {formatCurrency(totalBalance, "MXN")}
        </ThemedText>
        <ThemedText style={styles.balanceHint}>
          Incluye {accounts.length}{" "}
          {accounts.length === 1 ? "cuenta" : "cuentas"} activas
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Tus cuentas</ThemedText>
        {accounts.map((account) => (
          <ThemedView
            key={account.id}
            style={[
              styles.accountCard,
              {
                borderColor: colorScheme === "light" ? "#E2E8F0" : "#233044",
                backgroundColor:
                  colorScheme === "light" ? "#FFFFFF" : "#101C2B",
              },
            ]}
          >
            <View style={styles.accountHeader}>
              <ThemedText type="defaultSemiBold" style={styles.accountAlias}>
                {account.alias}
              </ThemedText>
              <ThemedText style={styles.accountNumber}>
                {account.number}
              </ThemedText>
            </View>
            <ThemedText style={styles.accountBalance}>
              {formatCurrency(account.balance, account.currency)}
            </ThemedText>
            {account.iban && (
              <ThemedText style={styles.accountIban}>
                CLABE: {account.iban}
              </ThemedText>
            )}
          </ThemedView>
        ))}
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Movimientos recientes</ThemedText>
        {latestTransactions.length === 0 ? (
          <ThemedText style={styles.emptyState}>
            Aun no registras movimientos. Realiza tu primera operacion.
          </ThemedText>
        ) : (
          latestTransactions.map((transaction) => {
            const sign = transaction.type === "transfer" ? "-" : "+";
            const detail =
              transaction.type === "transfer"
                ? `${resolveAccountName(
                    accounts,
                    transaction.fromAccountId
                  )} -> ${resolveAccountName(
                    accounts,
                    transaction.toAccountId
                  )}`
                : transaction.description ?? "Movimiento";

            return (
              <ThemedView key={transaction.id} style={styles.transactionRow}>
                <View>
                  <ThemedText
                    type="defaultSemiBold"
                    style={styles.transactionTitle}
                  >
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
                    { color: sign === "+" ? "#16A34A" : "#DC2626" },
                  ]}
                >
                  {sign}
                  {formatCurrency(transaction.amount, transaction.currency)}
                </ThemedText>
              </ThemedView>
            );
          })
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const describeTransaction = (
  type: import("@/context/BankingContext").TransactionType
) => {
  switch (type) {
    case "create-account":
      return "Apertura de cuenta";
    case "deposit":
      return "Deposito recibido";
    case "transfer":
      return "Transferencia enviada";
    default:
      return "Movimiento";
  }
};

const resolveAccountName = (
  accounts: import("@/context/BankingContext").Account[],
  id?: string
) => accounts.find((account) => account.id === id)?.alias ?? "Cuenta externa";

const formatDate = (isoDate: string) =>
  new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate));

const styles = StyleSheet.create({
  hero: {
    gap: 8,
    marginBottom: 24,
  },
  greeting: {
    opacity: 0.9,
  },
  heroTitle: {
    fontSize: 28,
  },
  heroCopy: {
    opacity: 0.75,
    lineHeight: 20,
  },
  headerIcon: {
    position: "absolute",
    bottom: -60,
    right: -40,
    opacity: 0.6,
  },
  balanceCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    gap: 4,
  },
  balanceLabel: {
    opacity: 0.7,
    fontSize: 14,
  },
  balanceValue: {
    fontSize: 30,
  },
  balanceHint: {
    opacity: 0.7,
    marginTop: 4,
  },
  section: {
    gap: 12,
    marginBottom: 24,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    alignItems: "center",
    gap: 8,
  },
  actionLabel: {
    textAlign: "center",
    fontSize: 13,
  },
  accountCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    gap: 8,
  },
  accountHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  accountAlias: {
    fontSize: 16,
  },
  accountNumber: {
    fontSize: 12,
    opacity: 0.6,
  },
  accountBalance: {
    fontSize: 20,
  },
  accountIban: {
    fontSize: 12,
    opacity: 0.6,
  },
  emptyState: {
    opacity: 0.7,
  },
  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.35)",
    padding: 16,
    marginBottom: 12,
    backgroundColor: "rgba(15, 23, 42, 0.02)",
  },
  transactionTitle: {
    fontSize: 15,
  },
  transactionDetail: {
    fontSize: 12,
    opacity: 0.7,
  },
  transactionDate: {
    fontSize: 11,
    marginTop: 6,
    opacity: 0.6,
  },
  transactionAmount: {
    fontSize: 16,
  },
});
