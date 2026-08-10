import { mockChangePassword, mockUpdateProfile } from "@/lib/mock/handlers";
import type { User } from "@/lib/types";

/** Profile endpoints stay on mock until Laravel customer profile APIs are wired. */
export async function updateProfile(
  token: string | null | undefined,
  input: { name: string; email: string },
): Promise<User> {
  return mockUpdateProfile(token, input);
}

export async function changePassword(
  token: string | null | undefined,
  input: { currentPassword: string; password: string },
) {
  return mockChangePassword(token, input);
}
