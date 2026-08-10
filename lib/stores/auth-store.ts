"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/lib/types";
import * as authApi from "@/lib/api/auth";

interface AuthState {
  user: User | null;
  token: string | null;
  hydrated: boolean;
  setHydrated: (value: boolean) => void;
  login: (email: string, password: string) => Promise<User>;
  register: (input: {
    name: string;
    email: string;
    password: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
  setSession: (user: User, token: string) => void;
  updateUser: (user: User) => void;
}

const AUTH_COOKIE = "tinystore_auth";

function syncAuthCookie(user: User | null, token: string | null) {
  if (typeof document === "undefined") return;
  if (user && token) {
    const payload = encodeURIComponent(
      JSON.stringify({ role: user.role, token }),
    );
    document.cookie = `${AUTH_COOKIE}=${payload}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
  } else {
    document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; samesite=lax`;
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      hydrated: false,
      setHydrated: (value) => set({ hydrated: value }),
      setSession: (user, token) => {
        syncAuthCookie(user, token);
        set({ user, token });
      },
      updateUser: (user) => {
        const token = get().token;
        syncAuthCookie(user, token);
        set({ user });
      },
      login: async (email, password) => {
        const { user, token } = await authApi.login(email, password);
        get().setSession(user, token);
        return user;
      },
      register: async (input) => {
        const { user, token } = await authApi.register(input);
        get().setSession(user, token);
        return user;
      },
      logout: async () => {
        const token = get().token;
        try {
          await authApi.logout(token);
        } finally {
          syncAuthCookie(null, null);
          set({ user: null, token: null });
        }
      },
    }),
    {
      name: "tinystore_auth",
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
        if (state?.user && state.token) {
          syncAuthCookie(state.user, state.token);
        }
      },
    },
  ),
);
