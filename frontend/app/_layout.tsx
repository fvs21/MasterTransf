// app/_layout.tsx
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, useRootNavigationState } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import "react-native-reanimated";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { BankingProvider } from "@/context/BankingContext";
import { TerminalProvider } from "@/context/TerminalContext";

export const unstable_settings = { anchor: "(tabs)" };

SplashScreen.preventAutoHideAsync(); // mantiene el splash hasta que pintemos con el tema correcto

export default function RootLayout() {
  // Tema fijo en modo claro
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    // Si tuvieras que cargar preferencias de tema/usuario, hazlo aquí antes de setear listo
    setAppIsReady(true);
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // Oculta el splash cuando el primer layout ya tiene el tema correcto
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  // IMPORTANTE: siempre renderizar un navegador desde el primer render
  return (
    <View
      onLayout={onLayoutRootView}
      style={{
        flex: 1,
        // Fondo acorde al tema para que no se note cualquier cambio del ThemeProvider
        backgroundColor: "#fff",
      }}
    >
      <ThemeProvider value={DefaultTheme}>
        <AuthProvider>
          <BankingProvider>
            <TerminalProvider>
              <RootNavigator />
            </TerminalProvider>
          </BankingProvider>
        </AuthProvider>
      </ThemeProvider>

      <StatusBar style="dark" />
    </View>
  );
}

function RootNavigator() {
  const { user } = useAuth();
  const navigationState = useRootNavigationState();

  if (!navigationState?.key) {
    return null;
  }

  return (
    <Stack>
      {/**
       * <Stack.Screen
        name="login"
        options={{ headerShown: false }}
        redirect={Boolean(user)}
      />
       */}
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false }}
        //redirect={!user}
      />
      <Stack.Screen
        name="terminal"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="modal"
        options={{ presentation: "modal", title: "Modal" }}
      />
    </Stack>
  );
}
