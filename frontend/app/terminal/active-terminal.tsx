import { useRouter } from "expo-router";
import React, { useEffect } from "react";

import { useTerminal } from "@/context/TerminalContext";
import IndividualPayTerminal from "./individual-pay-terminal";
import GroupPayTerminal from "./group-pay-terminal";

export default function ActiveTerminal() {
  const router = useRouter();
  const { session } = useTerminal();

  useEffect(() => {
    if (!session) {
      router.replace("/(tabs)/terminal");
    }
  }, [session, router]);

  if (!session) {
    return null;
  }

  // Route to the appropriate terminal based on session mode
  if (session.mode === "individual") {
    return <IndividualPayTerminal />;
  }

  return <GroupPayTerminal />;
}
