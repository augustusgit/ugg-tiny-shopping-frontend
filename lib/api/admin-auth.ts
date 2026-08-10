import { apiFetch, apiMessage, USE_MOCK } from "@/lib/api/client";
import type { AdminAuthData } from "@/lib/types/api";

export async function adminVerifyLogin(input: {
  username: string;
  password: string;
}) {
  if (USE_MOCK) {
    throw new Error("Set NEXT_PUBLIC_API_URL to use admin authentication.");
  }
  return apiFetch<{ email: string }>("/admin/login/verify", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function adminLogin(input: {
  username: string;
  password: string;
  code: string;
}) {
  if (USE_MOCK) {
    throw new Error("Set NEXT_PUBLIC_API_URL to use admin authentication.");
  }
  return apiFetch<AdminAuthData>("/admin/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function adminLogout(token?: string | null) {
  if (USE_MOCK || !token) return "Logged out";
  return apiMessage("/admin/logout", { method: "POST", token });
}

export async function adminSendResetCode(value: string) {
  if (USE_MOCK) {
    throw new Error("Set NEXT_PUBLIC_API_URL to use admin authentication.");
  }
  return apiFetch<{ email: string | null }>("/admin/password/email", {
    method: "POST",
    body: JSON.stringify({ value }),
  });
}

export async function adminVerifyResetCode(input: {
  email: string;
  code: string;
}) {
  if (USE_MOCK) {
    throw new Error("Set NEXT_PUBLIC_API_URL to use admin authentication.");
  }
  return apiMessage("/admin/password/verify-code", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function adminResetPassword(input: {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}) {
  if (USE_MOCK) {
    throw new Error("Set NEXT_PUBLIC_API_URL to use admin authentication.");
  }
  return apiMessage("/admin/password/reset", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
