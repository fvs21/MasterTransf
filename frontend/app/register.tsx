import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/Button";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/context/AuthContext";
import * as authApi from "@/api/auth";

export default function RegisterScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];

  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [streetNumber, setStreetNumber] = useState("");
  const [streetName, setStreetName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");

  const handleRegister = async () => {
    if (isRegistering) {
      return;
    }

    setError(null);

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !password.trim() ||
      !streetNumber.trim() ||
      !streetName.trim() ||
      !city.trim() ||
      !state.trim() ||
      !zip.trim()
    ) {
      setError("Please complete all fields to create an account.");
      return;
    }

    setIsRegistering(true);
    try {
      const response = await authApi.register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password: password.trim(),
        streetNumber: streetNumber.trim(),
        streetName: streetName.trim(),
        city: city.trim(),
        state: state.trim(),
        zip: zip.trim(),
      });

      if (!response.success) {
        setError(response.message || "Could not register user.");
        return;
      }

      // Registration successful - auto login and navigate
      if (response.user?.nickname) {
        const loginResult = await login(response.user.nickname, password.trim());
        
        if (loginResult.success) {
          router.replace("/(tabs)");
        } else {
          setError("User created but could not auto-login.");
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("Network error. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardContainer}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <ThemedText type="title">Create Account</ThemedText>
              <ThemedText style={styles.subtitle}>
                Complete your details to register
              </ThemedText>
            </View>

            <View style={styles.form}>
              <View style={styles.inlineFields}>
                <View style={styles.inlineField}>
                  <ThemedText type="defaultSemiBold">First Name</ThemedText>
                  <TextInput
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="e.g. John"
                    placeholderTextColor="rgba(148,163,184,0.7)"
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
                </View>
                <View style={styles.inlineField}>
                  <ThemedText type="defaultSemiBold">Last Name</ThemedText>
                  <TextInput
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="e.g. Smith"
                    placeholderTextColor="rgba(148,163,184,0.7)"
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
                </View>
              </View>

              <ThemedText type="defaultSemiBold">Password</ThemedText>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Create a password"
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

              <View style={styles.inlineFields}>
                <View style={[styles.inlineField, styles.inlineFieldSmall]}>
                  <ThemedText type="defaultSemiBold">No.</ThemedText>
                  <TextInput
                    value={streetNumber}
                    onChangeText={setStreetNumber}
                    placeholder="123"
                    placeholderTextColor="rgba(148,163,184,0.7)"
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
                </View>
                <View style={styles.inlineField}>
                  <ThemedText type="defaultSemiBold">Street</ThemedText>
                  <TextInput
                    value={streetName}
                    onChangeText={setStreetName}
                    placeholder="e.g. Main St"
                    placeholderTextColor="rgba(148,163,184,0.7)"
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
                </View>
              </View>

              <View style={styles.inlineFields}>
                <View style={styles.inlineField}>
                  <ThemedText type="defaultSemiBold">City</ThemedText>
                  <TextInput
                    value={city}
                    onChangeText={setCity}
                    placeholder="e.g. New York"
                    placeholderTextColor="rgba(148,163,184,0.7)"
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
                </View>
                <View style={styles.inlineField}>
                  <ThemedText type="defaultSemiBold">State</ThemedText>
                  <TextInput
                    value={state}
                    onChangeText={setState}
                    placeholder="e.g. NY"
                    placeholderTextColor="rgba(148,163,184,0.7)"
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
                </View>
              </View>

              <View style={styles.inlineFields}>
                <View style={[styles.inlineField, styles.inlineFieldSmall]}>
                  <ThemedText type="defaultSemiBold">ZIP</ThemedText>
                  <TextInput
                    value={zip}
                    onChangeText={setZip}
                    placeholder="64000"
                    placeholderTextColor="rgba(148,163,184,0.7)"
                    keyboardType="numeric"
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
                </View>
              </View>

              {error && (
                <ThemedText style={[styles.errorLabel, { color: "#DC2626" }]}>
                  {error}
                </ThemedText>
              )}

              <Button
                title={isRegistering ? "Registering..." : "Create Account"}
                onPress={handleRegister}
                variant="success"
                fullWidth
                style={styles.buttonSpacing}
                disabled={isRegistering}
              />

              <Button
                title="Back"
                onPress={() => router.back()}
                variant="secondary"
                fullWidth
                style={styles.buttonSpacing}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    flexGrow: 1,
  },
  header: {
    gap: 8,
    marginBottom: 32,
  },
  subtitle: {
    opacity: 0.75,
    lineHeight: 20,
  },
  form: {
    gap: 16,
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
    marginTop: 8,
  },
  inlineFields: {
    flexDirection: "row",
    gap: 12,
  },
  inlineField: {
    flex: 1,
    gap: 8,
  },
  inlineFieldSmall: {
    flex: 0.4,
  },
});
