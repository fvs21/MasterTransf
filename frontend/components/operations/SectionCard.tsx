import { PropsWithChildren } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { TransactionType } from "@/context/BankingContext";
import { useColorScheme } from "@/hooks/use-color-scheme";

type SectionCardProps = PropsWithChildren<{
  title: string;
  description: string;
  tone: TransactionType;
  isOpen: boolean;
  onToggle: () => void;
}>;

export function SectionCard({
  title,
  description,
  tone,
  children,
  isOpen,
  onToggle,
}: SectionCardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];

  const accent =
    tone === "transfer"
      ? "#2563EB"
      : tone === "deposit"
      ? "#16A34A"
      : palette.tint;

  return (
    <ThemedView
      style={[
        styles.card,
        {
          borderColor: colorScheme === "light" ? "#E2E8F0" : "#1F2937",
          backgroundColor: colorScheme === "light" ? "#FFFFFF" : "#0F172A",
        },
      ]}
    >
      <Pressable
        style={styles.header}
        onPress={onToggle}
        accessibilityRole="button"
      >
        {/* Columna de texto con ancho flexible */}
        <View style={styles.textCol}>
          <ThemedText type="subtitle" style={styles.title}>
            {title}
          </ThemedText>
          <ThemedText style={styles.description}>{description}</ThemedText>
        </View>

        <View
          style={[
            styles.badge,
            {
              backgroundColor: accent,
              transform: [{ rotate: isOpen ? "90deg" : "0deg" }],
            },
          ]}
        />
      </Pressable>

      {isOpen && children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 20,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    // opcional: separar un poco el badge sin forzar quiebres raros
    columnGap: 12,
  },
  // 🔑 Hace que el texto tenga un ancho real y pueda envolver
  textCol: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 18,
    // opcional pero recomendable para títulos: una altura de línea clara
    lineHeight: 22,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.75,
    marginTop: 4,
  },
  badge: {
    width: 12,
    height: 12,
    borderRadius: 6,
    opacity: 0.8,
    alignSelf: "center",
  },
});
