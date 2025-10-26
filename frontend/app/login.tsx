import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/Button";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];

  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleSignIn = async () => {
    if (isAuthenticating) {
      return;
    }
    setError(null);
    setIsAuthenticating(true);

    try {
      const result = await login(nickname, password);

      if (result.success) {
        router.replace("/(tabs)");
      } else {
        setError(result.message);
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleGoToRegister = () => {
    router.push("/register");
  };

  return (
    <ThemedView style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <ThemedText type="title">Welcome</ThemedText>
              <ThemedText style={styles.subtitle}>
                Enter your nickname and password to access your banking.
              </ThemedText>
            </View>

            <View style={styles.form}>
              <ThemedText type="defaultSemiBold">Nickname</ThemedText>
              <TextInput
                value={nickname}
                onChangeText={setNickname}
                placeholder="e.g. jsmith"
                placeholderTextColor="rgba(148,163,184,0.7)"
                autoCapitalize="none"
                style={[
                  styles.input,
                  {
                    borderColor: palette.icon,
                    backgroundColor:
                      colorScheme === "light" ? "#F8FAFC" : "#1E293B",
                    color: colorScheme === "light" ? "#0F172A" : "#E2E8F0",
                  },
                ]}
              />

              <ThemedText type="defaultSemiBold">Password</ThemedText>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="rgba(148,163,184,0.7)"
                secureTextEntry
                style={[
                  styles.input,
                  {
                    borderColor: palette.icon,
                    backgroundColor:
                      colorScheme === "light" ? "#F8FAFC" : "#1E293B",
                    color: colorScheme === "light" ? "#0F172A" : "#E2E8F0",
                  },
                ]}
              />

              {error && (
                <ThemedText style={[styles.errorLabel, { color: "#DC2626" }]}>
                  {error}
                </ThemedText>
              )}

              <Button
                title={isAuthenticating ? "Signing in..." : "Sign in"}
                onPress={handleSignIn}
                variant="primary"
                fullWidth
                style={styles.buttonSpacing}
                disabled={isAuthenticating}
              />

            </View>

            <View style={styles.divider}>
              <View style={[styles.line, { backgroundColor: palette.icon }]} />
              <ThemedText type="defaultSemiBold" style={styles.dividerLabel}>
                o
              </ThemedText>
              <View style={[styles.line, { backgroundColor: palette.icon }]} />
            </View>

            <Button
              title="Create new account"
              onPress={handleGoToRegister}
              variant="secondary"
              fullWidth
              style={styles.buttonSpacing}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    gap: 28,
  },
  header: {
    gap: 8,
  },
  subtitle: {
    opacity: 0.75,
    lineHeight: 20,
  },
  form: {
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  buttonSpacing: {
    marginTop: 12,
  },
  errorLabel: {
    fontSize: 13,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    opacity: 0.4,
  },
  dividerLabel: {
    opacity: 0.6,
    textTransform: "uppercase",
    fontSize: 11,
  },
});
