import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@shared/models/auth";

interface AuthTokens {
  accessToken: string | null;
  refreshToken: string | null;
}

interface AuthStore extends AuthTokens {
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => void;
  clearTokens: () => void;
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      setTokens: (tokens) => set({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }),
      clearTokens: () => set({ accessToken: null, refreshToken: null }),
    }),
    {
      name: "space-child-auth",
    }
  )
);

async function fetchUser(accessToken: string | null): Promise<User | null> {
  if (!accessToken) {
    return null;
  }

  const response = await fetch("/api/space-child-auth/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }

  return response.json();
}

interface LoginParams {
  email: string;
  password: string;
}

interface RegisterParams {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface RegisterResponse {
  user: User;
  requiresVerification?: boolean;
  message?: string;
  accessToken?: string;
  refreshToken?: string;
}

interface LoginError extends Error {
  requiresVerification?: boolean;
}

async function loginApi(params: LoginParams): Promise<AuthResponse> {
  const response = await fetch("/api/space-child-auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json();
    const error: LoginError = new Error(errorData.error || "Login failed");
    error.requiresVerification = errorData.requiresVerification;
    throw error;
  }

  return response.json();
}

async function registerApi(params: RegisterParams): Promise<RegisterResponse> {
  const response = await fetch("/api/space-child-auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Registration failed");
  }

  return response.json();
}

async function logoutApi(accessToken: string | null): Promise<void> {
  if (!accessToken) return;
  
  await fetch("/api/space-child-auth/logout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

async function refreshTokenApi(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
  const response = await fetch("/api/space-child-auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    throw new Error("Token refresh failed");
  }

  return response.json();
}

export function useAuth() {
  const queryClient = useQueryClient();
  const { accessToken, refreshToken, setTokens, clearTokens } = useAuthStore();

  const { data: user, isLoading, refetch } = useQuery<User | null>({
    queryKey: ["auth-user", accessToken],
    queryFn: () => fetchUser(accessToken),
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const loginMutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
      queryClient.setQueryData(["auth-user", data.accessToken], data.user);
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: registerApi,
    onSuccess: (data) => {
      // Only set tokens if they exist (not when verification is required)
      if (data.accessToken && data.refreshToken) {
        setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
        queryClient.setQueryData(["auth-user", data.accessToken], data.user);
        queryClient.invalidateQueries({ queryKey: ["auth-user"] });
      }
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => logoutApi(accessToken),
    onSuccess: () => {
      clearTokens();
      queryClient.setQueryData(["auth-user", null], null);
    },
  });

  const refreshTokens = async (): Promise<string | null> => {
    if (!refreshToken) return null;
    try {
      const newTokens = await refreshTokenApi(refreshToken);
      setTokens(newTokens);
      return newTokens.accessToken;
    } catch (error) {
      clearTokens();
      return null;
    }
  };

  const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const headers = new Headers(options.headers);
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }

    let response = await fetch(url, { ...options, headers });

    if (response.status === 401 && refreshToken) {
      const newToken = await refreshTokens();
      if (newToken) {
        headers.set("Authorization", `Bearer ${newToken}`);
        response = await fetch(url, { ...options, headers });
      }
    }

    return response;
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !!accessToken,
    accessToken,
    refreshToken,
    login: loginMutation.mutateAsync,
    loginError: loginMutation.error?.message,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutateAsync,
    registerError: registerMutation.error?.message,
    isRegistering: registerMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
    refetch,
    refreshTokens,
    authenticatedFetch,
  };
}

export { useAuthStore };
