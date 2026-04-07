import React from "react";
import { apiRequest, setToken, getToken } from "lib/api";
import { BUILD_ID } from "buildId";

type RegisterPayload = {
  email: string;
  password: string;
  displayName?: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

type AuthUser = {
  uid: string;
  email: string;
  displayName?: string;
  emailVerified: boolean;
  role?: string;
  metadata?: {
    creationTime?: string;
  };
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  claims: AuthClaims | null;
  isAdmin: boolean;
  register: (payload: RegisterPayload) => Promise<void>;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  refreshClaims: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

type AuthClaims = {
  role?: string;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [claims, setClaims] = React.useState<AuthClaims | null>(null);

  React.useEffect(() => {
    const initializeSession = async () => {
      if (typeof window === "undefined" || !window.localStorage) {
        setLoading(false);
        return;
      }

      const flagKey = "source-market:last-build-id";
      const lastBuildId = window.localStorage.getItem(flagKey);
      if (lastBuildId !== BUILD_ID) {
        setToken(null);
      }
      window.localStorage.setItem(flagKey, BUILD_ID);

      if (!getToken()) {
        setLoading(false);
        return;
      }

      try {
        const result = await apiRequest<{ user: AuthUser }>("/auth/me", { method: "GET" }, true);
        setUser(result.user);
        setClaims({ role: result.user.role });
      } catch (error) {
        console.warn("Khong the khoi phuc phien dang nhap", error);
        setToken(null);
        setUser(null);
        setClaims(null);
      } finally {
        setLoading(false);
      }
    };

    initializeSession();
  }, []);

  const register = React.useCallback(
    async ({ email, password, displayName }: RegisterPayload) => {
      await apiRequest(
        "/auth/register",
        {
          method: "POST",
          body: JSON.stringify({ email, password, displayName }),
        },
        false
      );
    },
    []
  );

  const login = React.useCallback(async ({ email, password }: LoginPayload) => {
    const result = await apiRequest<{ token: string; user: AuthUser }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
      false
    );

    setToken(result.token);
    setUser(result.user);
    setClaims({ role: result.user.role });
  }, []);

  const logout = React.useCallback(async () => {
    const token = getToken();
    if (token) {
      await apiRequest("/auth/logout", { method: "POST" }, true).catch(() => undefined);
    }
    setToken(null);
    setClaims(null);
    setUser(null);
  }, []);

  const sendVerificationEmail = React.useCallback(async () => {
    if (!user?.email) {
      throw new Error("Chua co email de gui xac thuc");
    }
    await apiRequest(
      "/auth/resend-verification",
      { method: "POST", body: JSON.stringify({ email: user.email }) },
      false
    );
  }, [user]);

  const refreshClaims = React.useCallback(async () => {
    if (!getToken()) {
      return;
    }
    const result = await apiRequest<{ user: AuthUser }>("/auth/me", { method: "GET" }, true);
    setUser(result.user);
    setClaims({ role: result.user.role });
  }, []);

  const isAdmin = React.useMemo(() => claims?.role === "admin", [claims]);

  const value = React.useMemo(
    () => ({
      user,
      loading,
      claims,
      isAdmin,
      register,
      login,
      logout,
      sendVerificationEmail,
      refreshClaims,
    }),
    [user, loading, claims, isAdmin, register, login, logout, sendVerificationEmail, refreshClaims]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth phải được dùng trong AuthProvider");
  }
  return context;
};
