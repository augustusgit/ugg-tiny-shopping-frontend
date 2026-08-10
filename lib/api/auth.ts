import { apiFetch, USE_MOCK } from "@/lib/api/client";
import {
  mockForgotPassword,
  mockLogin,
  mockLogout,
  mockMe,
  mockRegister,
  mockResetPassword,
} from "@/lib/mock/handlers";
import type { AuthResponse, User } from "@/lib/types";

export async function login(email: string, password: string) {
  if (USE_MOCK) return mockLogin(email, password);
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function register(input: {
  name: string;
  email: string;
  password: string;
}) {
  if (USE_MOCK) return mockRegister(input);
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function forgotPassword(email: string) {
  if (USE_MOCK) return mockForgotPassword(email);
  return apiFetch<{ message: string; token?: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, password: string) {
  if (USE_MOCK) return mockResetPassword(token, password);
  return apiFetch<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password, password_confirmation: password }),
  });
}

export async function logout(token?: string | null) {
  if (USE_MOCK) return mockLogout(token);
  return apiFetch<void>("/auth/logout", { method: "POST", token });
}

export async function getMe(token?: string | null) {
  if (USE_MOCK) return mockMe(token);
  return apiFetch<User>("/auth/me", { token });
}
