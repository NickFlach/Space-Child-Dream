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

async function loginApi(params: LoginParams): Promise<AuthResponse> {
  const response = await fetch("/api/space-child-auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Login failed");
  }

  return response.json();
}

async function registerApi(params: RegisterParams): Promise<AuthResponse> {
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
    },
  });

  const registerMutation = useMutation({
    mutationFn: registerApi,
    onSuccess: (data) => {
      setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
      queryClient.setQueryData(["auth-user", data.accessToken], data.user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => logoutApi(accessToken),
    onSuccess: () => {
      clearTokens();
      queryClient.setQueryData(["auth-user", null], null);
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !!accessToken,
    accessToken,
    login: loginMutation.mutateAsync,
    loginError: loginMutation.error?.message,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutateAsync,
    registerError: registerMutation.error?.message,
    isRegistering: registerMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
    refetch,
  };
}

export { useAuthStore };
