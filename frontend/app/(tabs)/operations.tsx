import { useState } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

import { CreateAccountSection } from "@/components/operations/CreateAccountSection";
import { DepositSection } from "@/components/operations/DepositSection";
import { TransferSection } from "@/components/operations/TransferSection";
import { TransferenciaSection } from "@/components/operations/TransferenciaSection";
import { TapToPaySection } from "@/components/operations/TapToPaySection";

export default function OperationsScreen() {
  const [openSection, setOpenSection] = useState<
    "create" | "deposit" | "transfer" | "transferencia" | "tapToPay" | null
  >(null);

  const toggleSection = (
    section: "create" | "deposit" | "transfer" | "transferencia" | "tapToPay"
  ) => {
    setOpenSection((current) => (current === section ? null : section));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>Operations</ThemedText>
          <ThemedText style={styles.subtitle}>
            Manage your accounts and perform transactions
          </ThemedText>
        </View>

        <View style={styles.container}>

        <CreateAccountSection
          isOpen={openSection === "create"}
          onToggle={() => toggleSection("create")}
        />
        <DepositSection
          isOpen={openSection === "deposit"}
          onToggle={() => toggleSection("deposit")}
        />
        <TransferSection
          isOpen={openSection === "transfer"}
          onToggle={() => toggleSection("transfer")}
        />
        <TransferenciaSection
          isOpen={openSection === "transferencia"}
          onToggle={() => toggleSection("transferencia")}
        />
        <TapToPaySection
          isOpen={openSection === "tapToPay"}
          onToggle={() => toggleSection("tapToPay")}
        />
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
    fontWeight: "700",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.6,
  },
  container: {
    gap: 16,
  },
});
