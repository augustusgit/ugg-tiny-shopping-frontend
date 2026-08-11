import { apiFetch, apiList, apiMessage, toQueryString } from "@/lib/api/client";
import type {
  AdminAccount,
  AdminListFilters,
  AdminStats,
  StoreAdminInput,
  UpdateAdminInput,
} from "@/lib/types/accounts";

function auth(token?: string | null) {
  return { token };
}

export async function listAdmins(
  token: string | null | undefined,
  filters: AdminListFilters = {},
) {
  const qs = toQueryString({ ...filters });
  return apiList<AdminAccount>(`/admin/admins${qs}`, {
    method: "GET",
    ...auth(token),
  });
}

export async function getAdminStats(token?: string | null) {
  return apiFetch<AdminStats>("/admin/admins/stats", {
    method: "GET",
    ...auth(token),
  });
}

export async function getAdmin(token: string | null | undefined, id: number) {
  const data = await apiFetch<{ admin: AdminAccount }>(`/admin/admins/${id}`, {
    method: "GET",
    ...auth(token),
  });
  return data.admin;
}

export async function createAdmin(
  token: string | null | undefined,
  input: StoreAdminInput,
) {
  const data = await apiFetch<{ admin: AdminAccount }>("/admin/admins", {
    method: "POST",
    ...auth(token),
    body: JSON.stringify(input),
  });
  return data.admin;
}

export async function updateAdmin(
  token: string | null | undefined,
  id: number,
  input: UpdateAdminInput,
) {
  const data = await apiFetch<{ admin: AdminAccount }>(`/admin/admins/${id}`, {
    method: "PUT",
    ...auth(token),
    body: JSON.stringify(input),
  });
  return data.admin;
}

export async function deleteAdmin(token: string | null | undefined, id: number) {
  return apiMessage(`/admin/admins/${id}`, {
    method: "DELETE",
    ...auth(token),
  });
}

export async function restoreAdmin(
  token: string | null | undefined,
  id: number,
) {
  const data = await apiFetch<{ admin: AdminAccount }>(
    `/admin/admins/${id}/restore`,
    { method: "POST", ...auth(token) },
  );
  return data.admin;
}

export async function forceDeleteAdmin(
  token: string | null | undefined,
  id: number,
) {
  return apiMessage(`/admin/admins/${id}/force`, {
    method: "DELETE",
    ...auth(token),
  });
}

export async function resetAdminPassword(
  token: string | null | undefined,
  id: number,
  password: string,
  password_confirmation: string,
) {
  const data = await apiFetch<{ admin: AdminAccount }>(
    `/admin/admins/${id}/reset-password`,
    {
      method: "POST",
      ...auth(token),
      body: JSON.stringify({ password, password_confirmation }),
    },
  );
  return data.admin;
}

export async function verifyAdminEmail(
  token: string | null | undefined,
  id: number,
) {
  const data = await apiFetch<{ admin: AdminAccount }>(
    `/admin/admins/${id}/verify-email`,
    { method: "POST", ...auth(token) },
  );
  return data.admin;
}

export async function verifyAdminPhone(
  token: string | null | undefined,
  id: number,
) {
  const data = await apiFetch<{ admin: AdminAccount }>(
    `/admin/admins/${id}/verify-phone`,
    { method: "POST", ...auth(token) },
  );
  return data.admin;
}

export async function syncAdminRoles(
  token: string | null | undefined,
  id: number,
  roles: string[],
) {
  const data = await apiFetch<{ admin: AdminAccount }>(
    `/admin/admins/${id}/roles`,
    {
      method: "POST",
      ...auth(token),
      body: JSON.stringify({ roles }),
    },
  );
  return data.admin;
}
