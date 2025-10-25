import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type User = {
  nickname: string;
  firstName?: string;
  lastName?: string;
};

type AuthState = {
  user: User | null;
  login: (nickname: string, password: string) => Promise<AuthResult>;
  logout: () => void;
};

type AuthResult =
  | { success: true }
  | {
      success: false;
      message: string;
    };

const AuthContext = createContext<AuthState | undefined>(undefined);

const LOGIN_URL = "http://localhost/api/auth/login";

export const AuthProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(
    async (nickname: string, password: string): Promise<AuthResult> => {
      const trimmedNickname = nickname.trim();
      const trimmedPassword = password.trim();

      if (!trimmedNickname || !trimmedPassword) {
        return {
          success: false,
          message: "Ingresa tu nickname y contraseña.",
        };
      }

      try {
        const response = await fetch(LOGIN_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nickname: trimmedNickname, password }),
        });

        if (!response.ok) {
          let message = "No se pudo iniciar sesión.";
          try {
            const errorPayload = await response.json();
            if (typeof errorPayload?.message === "string") {
              message = errorPayload.message;
            }
          } catch {
            // Ignorar: respuesta no tiene JSON válido
          }
          return { success: false, message };
        }

        const payload = await response.json();
        const userPayload = payload?.user ?? payload;

        const nextUser: User = {
          nickname: userPayload?.nickname ?? trimmedNickname,
          firstName: userPayload?.firstName,
          lastName: userPayload?.lastName,
        };

        setUser(nextUser);
        return { success: true };
      } catch {
        return {
          success: false,
          message: "Error de red. Intenta de nuevo.",
        };
      }
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
    }),
    [user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }

  return context;
};
