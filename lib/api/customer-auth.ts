import { apiFetch, apiMessage, USE_MOCK } from "@/lib/api/client";
import type { CustomerAuthData } from "@/lib/types/api";

export async function customerLogin(input: {
  username: string;
  password: string;
}) {
  if (USE_MOCK) {
    throw new Error("Set NEXT_PUBLIC_API_URL to use customer authentication.");
  }
  return apiFetch<CustomerAuthData>("/customer/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function customerLogout(token?: string | null) {
  if (USE_MOCK || !token) return "Logged out";
  return apiMessage("/customer/logout", { method: "POST", token });
}

export async function customerRegister(input: {
  email: string;
  mobile: string;
  password: string;
  password_confirmation: string;
  currency_code: string;
  country_code: string;
  country: string;
  firstname?: string;
  lastname?: string;
  agree?: boolean | number | string;
}) {
  if (USE_MOCK) {
    throw new Error("Set NEXT_PUBLIC_API_URL to use customer authentication.");
  }
  return apiFetch<CustomerAuthData>("/customer/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function customerVerifyRegistration(input: {
  email: string;
  code: string;
  mobile_code: string;
}) {
  if (USE_MOCK) {
    throw new Error("Set NEXT_PUBLIC_API_URL to use customer authentication.");
  }
  return apiMessage("/customer/register/verify", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function customerResendVerification(input: {
  email: string;
  mobile?: string;
}) {
  if (USE_MOCK) {
    throw new Error("Set NEXT_PUBLIC_API_URL to use customer authentication.");
  }
  return apiFetch<{ email: string }>("/customer/register/resend-code", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function customerSendResetCode(value: string) {
  if (USE_MOCK) {
    throw new Error("Set NEXT_PUBLIC_API_URL to use customer authentication.");
  }
  return apiFetch<{ email: string | null }>("/customer/password/email", {
    method: "POST",
    body: JSON.stringify({ value }),
  });
}

export async function customerVerifyResetCode(input: {
  email: string;
  code: string;
}) {
  if (USE_MOCK) {
    throw new Error("Set NEXT_PUBLIC_API_URL to use customer authentication.");
  }
  return apiMessage("/customer/password/verify-code", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function customerResetPassword(input: {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}) {
  if (USE_MOCK) {
    throw new Error("Set NEXT_PUBLIC_API_URL to use customer authentication.");
  }
  return apiMessage("/customer/password/reset", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
