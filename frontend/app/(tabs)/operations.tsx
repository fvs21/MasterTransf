import { useState } from "react";
import { StyleSheet, View } from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";

import { CreateAccountSection } from "@/components/operations/CreateAccountSection";
import { DepositSection } from "@/components/operations/DepositSection";
import { TransferSection } from "@/components/operations/TransferSection";
import { TransferenciaSection } from "@/components/operations/TransferenciaSection";

export default function OperationsScreen() {
  const [openSection, setOpenSection] = useState<
    "create" | "deposit" | "transfer" | "transferencia" | null
  >(null);

  const toggleSection = (
    section: "create" | "deposit" | "transfer" | "transferencia"
  ) => {
    setOpenSection((current) => (current === section ? null : section));
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#0F172A", dark: "#060B17" }}
      headerImage={
        <IconSymbol
          name="sparkles"
          size={260}
          color="rgba(59,130,246,0.35)"
          style={styles.operationsHeaderIcon}
        />
      }
    >
      <View style={styles.container}>
        <ThemedView style={styles.intro}>
          <ThemedText type="title">Operaciones</ThemedText>
          <ThemedText style={styles.introCopy}>
            Simula las gestiones basicas de tu banca. Completa los formularios y
            registra los movimientos en segundos.
          </ThemedText>
        </ThemedView>

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
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
    paddingBottom: 64,
  },
  intro: {
    gap: 8,
    marginBottom: 8,
  },
  introCopy: {
    opacity: 0.75,
    lineHeight: 20,
  },
  operationsHeaderIcon: {
    position: "absolute",
    bottom: -60,
    left: -30,
  },
});
