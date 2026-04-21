const API_BASE_URL =
  ((globalThis as { REACT_APP_API_BASE_URL?: string }).REACT_APP_API_BASE_URL as string | undefined) ||
  "http://localhost:8080/api";
const TOKEN_KEY = "source-market-token";

export const getToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string | null) => {
  if (typeof window === "undefined") {
    return;
  }
  if (!token) {
    window.localStorage.removeItem(TOKEN_KEY);
    return;
  }
  window.localStorage.setItem(TOKEN_KEY, token);
};

export const apiRequest = async <T>(
  path: string,
  options: RequestInit = {},
  requireAuth = false
): Promise<T> => {
  const token = getToken();
  const body = options.body;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (requireAuth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload?.message || payload?.error || "Yeu cau that bai";
    throw new Error(message);
  }

  return payload as T;
};
