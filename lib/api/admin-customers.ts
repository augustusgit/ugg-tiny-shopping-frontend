import { apiFetch, apiList, apiMessage, toQueryString } from "@/lib/api/client";
import type {
  CustomerAccount,
  CustomerListFilters,
  CustomerStats,
  StoreCustomerInput,
  UpdateCustomerInput,
} from "@/lib/types/accounts";

function auth(token?: string | null) {
  return { token };
}

export async function listCustomers(
  token: string | null | undefined,
  filters: CustomerListFilters = {},
) {
  const qs = toQueryString({ ...filters });
  return apiList<CustomerAccount>(`/admin/users${qs}`, {
    method: "GET",
    ...auth(token),
  });
}

export async function getCustomerStats(token?: string | null) {
  return apiFetch<CustomerStats>("/admin/users/stats", {
    method: "GET",
    ...auth(token),
  });
}

export async function getCustomer(token: string | null | undefined, id: number) {
  const data = await apiFetch<{ user: CustomerAccount }>(`/admin/users/${id}`, {
    method: "GET",
    ...auth(token),
  });
  return data.user;
}

export async function createCustomer(
  token: string | null | undefined,
  input: StoreCustomerInput,
) {
  const data = await apiFetch<{ user: CustomerAccount }>("/admin/users", {
    method: "POST",
    ...auth(token),
    body: JSON.stringify(input),
  });
  return data.user;
}

export async function updateCustomer(
  token: string | null | undefined,
  id: number,
  input: UpdateCustomerInput,
) {
  const data = await apiFetch<{ user: CustomerAccount }>(`/admin/users/${id}`, {
    method: "PUT",
    ...auth(token),
    body: JSON.stringify(input),
  });
  return data.user;
}

export async function deleteCustomer(
  token: string | null | undefined,
  id: number,
) {
  return apiMessage(`/admin/users/${id}`, {
    method: "DELETE",
    ...auth(token),
  });
}

export async function restoreCustomer(
  token: string | null | undefined,
  id: number,
) {
  const data = await apiFetch<{ user: CustomerAccount }>(
    `/admin/users/${id}/restore`,
    { method: "POST", ...auth(token) },
  );
  return data.user;
}

export async function forceDeleteCustomer(
  token: string | null | undefined,
  id: number,
) {
  return apiMessage(`/admin/users/${id}/force`, {
    method: "DELETE",
    ...auth(token),
  });
}

export async function toggleCustomerStatus(
  token: string | null | undefined,
  id: number,
  ban_reason?: string,
) {
  const data = await apiFetch<{ user: CustomerAccount }>(
    `/admin/users/${id}/toggle-status`,
    {
      method: "POST",
      ...auth(token),
      body: JSON.stringify({ ban_reason: ban_reason || null }),
    },
  );
  return data.user;
}

export async function banCustomer(
  token: string | null | undefined,
  id: number,
  ban_reason: string,
) {
  const data = await apiFetch<{ user: CustomerAccount }>(
    `/admin/users/${id}/ban`,
    {
      method: "POST",
      ...auth(token),
      body: JSON.stringify({ ban_reason }),
    },
  );
  return data.user;
}

export async function unbanCustomer(
  token: string | null | undefined,
  id: number,
) {
  const data = await apiFetch<{ user: CustomerAccount }>(
    `/admin/users/${id}/unban`,
    { method: "POST", ...auth(token) },
  );
  return data.user;
}

export async function resetCustomerPassword(
  token: string | null | undefined,
  id: number,
  password: string,
  password_confirmation: string,
) {
  const data = await apiFetch<{ user: CustomerAccount }>(
    `/admin/users/${id}/reset-password`,
    {
      method: "POST",
      ...auth(token),
      body: JSON.stringify({ password, password_confirmation }),
    },
  );
  return data.user;
}

export async function verifyCustomerEmail(
  token: string | null | undefined,
  id: number,
) {
  const data = await apiFetch<{ user: CustomerAccount }>(
    `/admin/users/${id}/verify-email`,
    { method: "POST", ...auth(token) },
  );
  return data.user;
}

export async function verifyCustomerPhone(
  token: string | null | undefined,
  id: number,
) {
  const data = await apiFetch<{ user: CustomerAccount }>(
    `/admin/users/${id}/verify-phone`,
    { method: "POST", ...auth(token) },
  );
  return data.user;
}

export async function syncCustomerRoles(
  token: string | null | undefined,
  id: number,
  roles: string[],
) {
  const data = await apiFetch<{ user: CustomerAccount }>(
    `/admin/users/${id}/roles`,
    {
      method: "POST",
      ...auth(token),
      body: JSON.stringify({ roles }),
    },
  );
  return data.user;
}
