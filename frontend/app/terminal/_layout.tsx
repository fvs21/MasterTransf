import { Stack } from "expo-router";

export default function TerminalLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: "Back",
      }}
    >
      <Stack.Screen
        name="individual-setup"
        options={{
          title: "Individual Pay Setup",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="group-setup"
        options={{
          title: "Group Pay Setup",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="active-terminal"
        options={{
          title: "Active Terminal",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
