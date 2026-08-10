import { apiFetch, USE_MOCK } from "@/lib/api/client";
import { mockChangePassword, mockUpdateProfile } from "@/lib/mock/handlers";
import type { User } from "@/lib/types";

export async function updateProfile(
  token: string | null | undefined,
  input: { name: string; email: string },
) {
  if (USE_MOCK) return mockUpdateProfile(token, input);
  return apiFetch<User>("/user/profile", {
    method: "PATCH",
    token,
    body: JSON.stringify(input),
  });
}

export async function changePassword(
  token: string | null | undefined,
  input: { currentPassword: string; password: string },
) {
  if (USE_MOCK) return mockChangePassword(token, input);
  return apiFetch<{ message: string }>("/user/change-password", {
    method: "POST",
    token,
    body: JSON.stringify({
      current_password: input.currentPassword,
      password: input.password,
      password_confirmation: input.password,
    }),
  });
}
