"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as adminAuthApi from "@/lib/api/admin-auth";
import * as customerAuthApi from "@/lib/api/customer-auth";
import type { AdminAuthData, CustomerAuthData } from "@/lib/types/api";
import type { AuthRealm, AuthUser } from "@/lib/types/auth";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  realm: AuthRealm | null;
  hydrated: boolean;
  setHydrated: (value: boolean) => void;
  setSession: (user: AuthUser, token: string, realm: AuthRealm) => void;
  updateUser: (user: AuthUser) => void;
  setAdminSession: (data: AdminAuthData) => AuthUser;
  setCustomerSession: (data: CustomerAuthData) => AuthUser;
  logout: () => Promise<void>;
}

const AUTH_COOKIE = "tinystore_auth";

function syncAuthCookie(
  user: AuthUser | null,
  token: string | null,
  realm: AuthRealm | null,
) {
  if (typeof document === "undefined") return;
  if (user && token && realm) {
    const payload = encodeURIComponent(
      JSON.stringify({ role: user.role, realm, token }),
    );
    document.cookie = `${AUTH_COOKIE}=${payload}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
  } else {
    document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; samesite=lax`;
  }
}

export function mapAdminUser(data: AdminAuthData): AuthUser {
  const admin = data.admin;
  return {
    id: String(admin.id),
    name: admin.name || admin.username || admin.email,
    email: admin.email,
    username: admin.username,
    role: "admin",
  };
}

export function mapCustomerUser(data: CustomerAuthData): AuthUser {
  const customer = data.user || data.customer;
  if (!customer) {
    throw new Error("Customer payload missing user data");
  }
  const name =
    [customer.firstname, customer.lastname].filter(Boolean).join(" ") ||
    customer.username ||
    customer.email;
  return {
    id: String(customer.id),
    name,
    email: customer.email,
    username: customer.username,
    mobile: customer.mobile,
    role: "user",
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      realm: null,
      hydrated: false,
      setHydrated: (value) => set({ hydrated: value }),
      setSession: (user, token, realm) => {
        syncAuthCookie(user, token, realm);
        set({ user, token, realm });
      },
      updateUser: (user) => {
        const { token, realm } = get();
        syncAuthCookie(user, token, realm);
        set({ user });
      },
      setAdminSession: (data) => {
        const user = mapAdminUser(data);
        get().setSession(user, data.access_token, "admin");
        return user;
      },
      setCustomerSession: (data) => {
        const user = mapCustomerUser(data);
        get().setSession(user, data.access_token, "customer");
        return user;
      },
      logout: async () => {
        const { token, realm } = get();
        try {
          if (realm === "admin") await adminAuthApi.adminLogout(token);
          if (realm === "customer") await customerAuthApi.customerLogout(token);
        } finally {
          syncAuthCookie(null, null, null);
          set({ user: null, token: null, realm: null });
        }
      },
    }),
    {
      name: "tinystore_auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        realm: state.realm,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
        if (state?.user && state.token && state.realm) {
          syncAuthCookie(state.user, state.token, state.realm);
        }
      },
    },
  ),
);
