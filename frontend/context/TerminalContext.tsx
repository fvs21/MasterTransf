import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type TerminalMode = "individual" | "group";

export type Contribution = {
  id: string;
  name: string;
  amount: number;
  timestamp: Date;
};

export type TerminalSession = {
  mode: TerminalMode;
  concept?: string;
  startedAt: Date;
  endedAt?: Date;
  
  // Individual mode
  fixedAmount?: number;
  
  // Group mode
  goalAmount?: number;
  fixedPerPerson?: boolean;
  perPersonAmount?: number;
  
  // Contributions
  contributions: Contribution[];
  currentTotal: number;
};

type TerminalState = {
  session: TerminalSession | null;
  isActive: boolean;
  
  // Actions
  startIndividualSession: (amount: number, concept?: string) => void;
  startGroupSession: (
    goalAmount: number,
    fixedPerPerson: boolean,
    perPersonAmount?: number,
    concept?: string
  ) => void;
  addContribution: (name: string, amount: number) => void;
  stopSession: () => void;
  resetSession: () => void;
};

const TerminalContext = createContext<TerminalState | undefined>(undefined);

export const TerminalProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [session, setSession] = useState<TerminalSession | null>(null);

  const isActive = useMemo(() => {
    return session !== null && session.endedAt === undefined;
  }, [session]);

  const startIndividualSession = useCallback(
    (amount: number, concept?: string) => {
      const newSession: TerminalSession = {
        mode: "individual",
        concept,
        startedAt: new Date(),
        fixedAmount: amount,
        contributions: [],
        currentTotal: 0,
      };
      setSession(newSession);
    },
    []
  );

  const startGroupSession = useCallback(
    (
      goalAmount: number,
      fixedPerPerson: boolean,
      perPersonAmount?: number,
      concept?: string
    ) => {
      const newSession: TerminalSession = {
        mode: "group",
        concept,
        startedAt: new Date(),
        goalAmount,
        fixedPerPerson,
        perPersonAmount,
        contributions: [],
        currentTotal: 0,
      };
      setSession(newSession);
    },
    []
  );

  const addContribution = useCallback((name: string, amount: number) => {
    setSession((prev) => {
      if (!prev || prev.endedAt !== undefined) return prev;

      const newContribution: Contribution = {
        id: `${Date.now()}-${Math.random()}`,
        name: name.trim(),
        amount,
        timestamp: new Date(),
      };

      const contributions = [...prev.contributions, newContribution];
      const currentTotal = contributions.reduce((sum, c) => sum + c.amount, 0);

      const updated: TerminalSession = {
        ...prev,
        contributions,
        currentTotal,
      };

      // Auto-stop conditions
      if (prev.mode === "individual") {
        // Individual mode: stop after first contribution
        updated.endedAt = new Date();
      } else if (prev.mode === "group" && prev.goalAmount) {
        // Group mode: stop when goal is reached
        if (currentTotal >= prev.goalAmount) {
          updated.endedAt = new Date();
        }
      }

      return updated;
    });
  }, []);

  const stopSession = useCallback(() => {
    setSession((prev) => {
      if (!prev || prev.endedAt !== undefined) return prev;
      return {
        ...prev,
        endedAt: new Date(),
      };
    });
  }, []);

  const resetSession = useCallback(() => {
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      isActive,
      startIndividualSession,
      startGroupSession,
      addContribution,
      stopSession,
      resetSession,
    }),
    [
      session,
      isActive,
      startIndividualSession,
      startGroupSession,
      addContribution,
      stopSession,
      resetSession,
    ]
  );

  return (
    <TerminalContext.Provider value={value}>
      {children}
    </TerminalContext.Provider>
  );
};

export const useTerminal = () => {
  const context = useContext(TerminalContext);

  if (!context) {
    throw new Error("useTerminal must be used within a TerminalProvider");
  }

  return context;
};
