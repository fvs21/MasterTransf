import { useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';

import { SectionCard } from './SectionCard';

export function TapToPaySection({
  isOpen,
  onToggle,
}: {
  isOpen: boolean;
  onToggle: () => void;
}) {
  const router = useRouter();

  const handleOpenTapToPay = () => {
    router.push('/terminal/tap-to-pay-simulator');
  };

  return (
    <SectionCard
      tone="create-account"
      title="Tap to Pay"
      description="Paga rápidamente con tu tarjeta usando tecnología NFC contactless."
      isOpen={isOpen}
      onToggle={onToggle}>
      <View style={styles.content}>
        <View style={styles.infoBox}>
          <ThemedText style={styles.infoText}>
            💳 Pagos rápidos y seguros con NFC
          </ThemedText>
          <ThemedText style={styles.infoText}>
            📱 Compatible con terminales contactless
          </ThemedText>
          <ThemedText style={styles.infoText}>
            ✓ Sin necesidad de introducir PIN
          </ThemedText>
        </View>

        <Button
          title="Usar Tap to Pay"
          onPress={handleOpenTapToPay}
          variant="primary"
          fullWidth
          style={{ marginTop: 12 }}
        />
      </View>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
  },
  infoBox: {
    gap: 12,
    paddingVertical: 8,
  },
  infoText: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.8,
  },
});
