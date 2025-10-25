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

const REGISTER_URL = "http://localhost/api/users";

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];

  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isRegisterFormVisible, setIsRegisterFormVisible] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isRegisteringRequest, setIsRegisteringRequest] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [streetNumber, setStreetNumber] = useState("");
  const [streetName, setStreetName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");

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

  const handleToggleRegister = () => {
    setIsRegisterFormVisible((current) => !current);
    setRegisterError(null);
    setRegisterSuccess(null);
  };

  const handleRegister = async () => {
    if (isRegisteringRequest) {
      return;
    }

    setRegisterError(null);
    setRegisterSuccess(null);

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !streetNumber.trim() ||
      !streetName.trim() ||
      !city.trim() ||
      !state.trim() ||
      !zip.trim()
    ) {
      setRegisterError("Completa todos los campos para crear el usuario.");
      return;
    }

    setIsRegisteringRequest(true);
    try {
      const response = await fetch(REGISTER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          streetNumber: streetNumber.trim(),
          streetName: streetName.trim(),
          city: city.trim(),
          state: state.trim(),
          zip: zip.trim(),
        }),
      });

      if (!response.ok) {
        let message = "No se pudo registrar el usuario.";
        try {
          const payload = await response.json();
          if (typeof payload?.message === "string") {
            message = payload.message;
          }
        } catch {
          // Ignorar si la respuesta no es JSON
        }
        setRegisterError(message);
        return;
      }

      setRegisterSuccess(
        "Usuario creado. Ahora puedes iniciar sesion con tu nickname."
      );
      setFirstName("");
      setLastName("");
      setStreetNumber("");
      setStreetName("");
      setCity("");
      setState("");
      setZip("");
    } catch {
      setRegisterError("Error de red. Intenta de nuevo.");
    } finally {
      setIsRegisteringRequest(false);
    }
  };

  const scrollAlignment = isRegisterFormVisible
    ? styles.scrollExpand
    : styles.scrollCenter;

  return (
    <ThemedView style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, scrollAlignment]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <ThemedText type="title">Bienvenido</ThemedText>
              <ThemedText style={styles.subtitle}>
                Ingresa con tu nickname y la contrasena para acceder a tu banca.
              </ThemedText>
            </View>

            <View style={styles.form}>
              <ThemedText type="defaultSemiBold">Nickname</ThemedText>
              <TextInput
                value={nickname}
                onChangeText={setNickname}
                placeholder="Ej. hbarrera"
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

              <ThemedText type="defaultSemiBold">Contrasena</ThemedText>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Contrasena"
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
                title={isAuthenticating ? "Ingresando..." : "Iniciar sesion"}
                onPress={handleSignIn}
                variant="primary"
                fullWidth
                style={styles.buttonSpacing}
                disabled={isAuthenticating}
              />

              <ThemedText style={styles.hint}>
                Tip: la contrasena de demo es {`"123"`}. Puedes cambiarla cuando
                conectes la API real.
              </ThemedText>
            </View>

            <View style={styles.divider}>
              <View style={[styles.line, { backgroundColor: palette.icon }]} />
              <ThemedText type="defaultSemiBold" style={styles.dividerLabel}>
                o
              </ThemedText>
              <View style={[styles.line, { backgroundColor: palette.icon }]} />
            </View>

            <Button
              title={
                isRegisterFormVisible
                  ? "Cerrar registro"
                  : "Crear nuevo usuario"
              }
              onPress={handleToggleRegister}
              variant="secondary"
              fullWidth
              style={styles.buttonSpacing}
            />

            {isRegisterFormVisible && (
              <View style={styles.registerForm}>
                <ThemedText type="subtitle">Registro rapido</ThemedText>
                <ThemedText style={styles.registerCopy}>
                  Completa tus datos personales y direccion. Esta informacion
                  solo se usa para la demo.
                </ThemedText>

                <View style={styles.inlineFields}>
                  <View style={styles.inlineField}>
                    <ThemedText type="defaultSemiBold">Nombre</ThemedText>
                    <TextInput
                      value={firstName}
                      onChangeText={setFirstName}
                      placeholder="Ej. Hector"
                      placeholderTextColor="rgba(148,163,184,0.7)"
                      style={[
                        styles.input,
                        {
                          borderColor: palette.icon,
                          backgroundColor:
                            colorScheme === "light" ? "#F8FAFC" : "#1E293B",
                          color:
                            colorScheme === "light" ? "#0F172A" : "#E2E8F0",
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.inlineField}>
                    <ThemedText type="defaultSemiBold">Apellido</ThemedText>
                    <TextInput
                      value={lastName}
                      onChangeText={setLastName}
                      placeholder="Ej. Barrera"
                      placeholderTextColor="rgba(148,163,184,0.7)"
                      style={[
                        styles.input,
                        {
                          borderColor: palette.icon,
                          backgroundColor:
                            colorScheme === "light" ? "#F8FAFC" : "#1E293B",
                          color:
                            colorScheme === "light" ? "#0F172A" : "#E2E8F0",
                        },
                      ]}
                    />
                  </View>
                </View>

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
                          color:
                            colorScheme === "light" ? "#0F172A" : "#E2E8F0",
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.inlineField}>
                    <ThemedText type="defaultSemiBold">Calle</ThemedText>
                    <TextInput
                      value={streetName}
                      onChangeText={setStreetName}
                      placeholder="Ej. Av. Fundadores"
                      placeholderTextColor="rgba(148,163,184,0.7)"
                      style={[
                        styles.input,
                        {
                          borderColor: palette.icon,
                          backgroundColor:
                            colorScheme === "light" ? "#F8FAFC" : "#1E293B",
                          color:
                            colorScheme === "light" ? "#0F172A" : "#E2E8F0",
                        },
                      ]}
                    />
                  </View>
                </View>

                <View style={styles.inlineFields}>
                  <View style={styles.inlineField}>
                    <ThemedText type="defaultSemiBold">Ciudad</ThemedText>
                    <TextInput
                      value={city}
                      onChangeText={setCity}
                      placeholder="Ej. Monterrey"
                      placeholderTextColor="rgba(148,163,184,0.7)"
                      style={[
                        styles.input,
                        {
                          borderColor: palette.icon,
                          backgroundColor:
                            colorScheme === "light" ? "#F8FAFC" : "#1E293B",
                          color:
                            colorScheme === "light" ? "#0F172A" : "#E2E8F0",
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.inlineField}>
                    <ThemedText type="defaultSemiBold">Estado</ThemedText>
                    <TextInput
                      value={state}
                      onChangeText={setState}
                      placeholder="Ej. Nuevo Leon"
                      placeholderTextColor="rgba(148,163,184,0.7)"
                      style={[
                        styles.input,
                        {
                          borderColor: palette.icon,
                          backgroundColor:
                            colorScheme === "light" ? "#F8FAFC" : "#1E293B",
                          color:
                            colorScheme === "light" ? "#0F172A" : "#E2E8F0",
                        },
                      ]}
                    />
                  </View>
                </View>

                <View style={styles.inlineFields}>
                  <View style={[styles.inlineField, styles.inlineFieldSmall]}>
                    <ThemedText type="defaultSemiBold">CP</ThemedText>
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
                          color:
                            colorScheme === "light" ? "#0F172A" : "#E2E8F0",
                        },
                      ]}
                    />
                  </View>
                </View>

                {registerError && (
                  <ThemedText style={[styles.errorLabel, { color: "#DC2626" }]}>
                    {registerError}
                  </ThemedText>
                )}

                {registerSuccess && (
                  <ThemedText
                    style={[styles.successLabel, { color: "#16A34A" }]}
                  >
                    {registerSuccess}
                  </ThemedText>
                )}

                <Button
                  title={
                    isRegisteringRequest
                      ? "Registrando usuario..."
                      : "Registrar usuario"
                  }
                  onPress={handleRegister}
                  variant="success"
                  fullWidth
                  style={styles.buttonSpacing}
                  disabled={isRegisteringRequest}
                />
              </View>
            )}
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
  },
  scrollCenter: {
    flexGrow: 1,
    justifyContent: "center",
  },
  scrollExpand: {
    flexGrow: 1,
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
  hint: {
    opacity: 0.6,
    fontSize: 12,
    marginTop: 4,
  },
  errorLabel: {
    fontSize: 13,
  },
  successLabel: {
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
  registerForm: {
    marginTop: 20,
    gap: 14,
  },
  registerCopy: {
    opacity: 0.75,
    lineHeight: 18,
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
