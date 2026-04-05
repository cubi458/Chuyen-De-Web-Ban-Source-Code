import React from "react";
import {
  User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendEmailVerification,
  getIdTokenResult,
  browserLocalPersistence,
  setPersistence,
} from "firebase/auth";
import type { IdTokenResult } from "firebase/auth";
import { auth } from "lib/firebase";
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

type AuthContextValue = {
  user: User | null;
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

type AuthClaims = IdTokenResult["claims"] & {
  role?: string;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [claims, setClaims] = React.useState<AuthClaims | null>(null);

  React.useEffect(() => {
    const initializeSession = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch (error) {
        console.warn("Không thể thiết lập persistence", error);
      }

      if (typeof window === "undefined" || !window.localStorage) {
        return;
      }

      const flagKey = "source-market:last-build-id";
      const lastBuildId = window.localStorage.getItem(flagKey);
      if (lastBuildId !== BUILD_ID && auth.currentUser) {
        await signOut(auth);
      }
      window.localStorage.setItem(flagKey, BUILD_ID);
    };

    initializeSession();
  }, []);

  React.useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      if (!isMounted) {
        return;
      }

      if (!nextUser) {
        setUser(null);
        setClaims(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const tokenResult = await getIdTokenResult(nextUser);
        if (!isMounted) {
          return;
        }
        setUser(nextUser);
        setClaims(tokenResult.claims as AuthClaims);
      } catch (error) {
        if (isMounted) {
          setUser(nextUser);
          setClaims(null);
        }
        console.error("Không thể lấy token claims:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const buildActionCodeSettings = React.useCallback(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    return {
      url: `${window.location.origin}/#/store/auth`,
      handleCodeInApp: true,
    };
  }, []);

  const register = React.useCallback(
    async ({ email, password, displayName }: RegisterPayload) => {
      const credential = await createUserWithEmailAndPassword(auth, email, password);

      if (displayName) {
        await updateProfile(credential.user, { displayName });
      }

      const actionCodeSettings = buildActionCodeSettings();
      if (actionCodeSettings) {
        await sendEmailVerification(credential.user, actionCodeSettings);
      } else {
        await sendEmailVerification(credential.user);
      }

      await signOut(auth);
    },
    [buildActionCodeSettings]
  );

  const login = React.useCallback(async ({ email, password }: LoginPayload) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    if (!credential.user.emailVerified) {
      await signOut(auth);
      throw new Error("Email chưa được xác thực. Vui lòng kiểm tra hộp thư và xác nhận tài khoản.");
    }
    await getIdTokenResult(credential.user, true);
  }, []);

  const logout = React.useCallback(async () => {
    await signOut(auth);
    setClaims(null);
    setUser(null);
  }, []);

  const sendVerificationEmail = React.useCallback(async () => {
    if (!auth.currentUser) {
      throw new Error("Chưa có người dùng đăng nhập");
    }
    const actionCodeSettings = buildActionCodeSettings();

    if (actionCodeSettings) {
      await sendEmailVerification(auth.currentUser, actionCodeSettings);
    } else {
      await sendEmailVerification(auth.currentUser);
    }
  }, [buildActionCodeSettings]);

  const refreshClaims = React.useCallback(async () => {
    if (!auth.currentUser) {
      return;
    }

    const tokenResult = await getIdTokenResult(auth.currentUser, true);
    setClaims(tokenResult.claims as AuthClaims);
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
