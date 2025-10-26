import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as authApi from "@/api/auth";

type User = {
  nickname: string;
  firstName?: string;
  lastName?: string;
  customerId?: string;
};

type AuthState = {
  user: User | null;
  isLoading: boolean;
  login: (nickname: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
};

type AuthResult =
  | { success: true }
  | {
      success: false;
      message: string;
    };

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load stored user on mount
  useEffect(() => {
    const loadStoredUser = async () => {
      try {
        const storedUser = await authApi.getStoredUser();
        const storedToken = await authApi.getStoredToken();
        
        if (storedUser && storedToken) {
          setUser(storedUser);
        }
      } catch (error) {
        console.error("Error loading stored user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredUser();
  }, []);

  const login = useCallback(
    async (nickname: string, password: string): Promise<AuthResult> => {
      const trimmedNickname = nickname.trim();
      const trimmedPassword = password.trim();

      if (!trimmedNickname || !trimmedPassword) {
        return {
          success: false,
          message: "Please enter your nickname and password.",
        };
      }

      try {
        const response = await authApi.login(trimmedNickname, trimmedPassword);

        if (response.success && response.user) {
          setUser(response.user);
          return { success: true };
        }

        return {
          success: false,
          message: response.message || "Could not log in.",
        };
      } catch (error) {
        console.error("Login error:", error);
        return {
          success: false,
          message: "Network error. Please try again.",
        };
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear user state even if storage clear fails
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      logout,
    }),
    [user, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
