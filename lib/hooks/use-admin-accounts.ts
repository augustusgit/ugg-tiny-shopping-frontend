"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api/admin-accounts";
import { useAuthStore } from "@/lib/stores/auth-store";
import type {
  AdminListFilters,
  StoreAdminInput,
  UpdateAdminInput,
} from "@/lib/types/accounts";

const ADMIN_ACCOUNTS_ROOT = ["admin", "admins"] as const;

export const adminAccountKeys = {
  all: ADMIN_ACCOUNTS_ROOT,
  list: (filters: AdminListFilters) =>
    [...ADMIN_ACCOUNTS_ROOT, "list", filters] as const,
  detail: (id: number) => [...ADMIN_ACCOUNTS_ROOT, "detail", id] as const,
  stats: [...ADMIN_ACCOUNTS_ROOT, "stats"] as const,
};

export function useAdminAccounts(filters: AdminListFilters) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: adminAccountKeys.list(filters),
    queryFn: () => api.listAdmins(token, filters),
    enabled: Boolean(token),
  });
}

export function useAdminAccount(id: number) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: adminAccountKeys.detail(id),
    queryFn: () => api.getAdmin(token, id),
    enabled: Boolean(token && id),
  });
}

export function useAdminAccountStats() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: adminAccountKeys.stats,
    queryFn: () => api.getAdminStats(token),
    enabled: Boolean(token),
  });
}

function useInvalidateAdmins() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: adminAccountKeys.all });
  };
}

export function useCreateAdmin() {
  const token = useAuthStore((s) => s.token);
  const invalidate = useInvalidateAdmins();
  return useMutation({
    mutationFn: (input: StoreAdminInput) => api.createAdmin(token, input),
    onSuccess: invalidate,
  });
}

export function useUpdateAdmin(id: number) {
  const token = useAuthStore((s) => s.token);
  const invalidate = useInvalidateAdmins();
  return useMutation({
    mutationFn: (input: UpdateAdminInput) => api.updateAdmin(token, id, input),
    onSuccess: invalidate,
  });
}

export function useAdminAccountActions() {
  const token = useAuthStore((s) => s.token);
  const invalidate = useInvalidateAdmins();
  const qc = useQueryClient();

  return {
    deleteAdmin: useMutation({
      mutationFn: (id: number) => api.deleteAdmin(token, id),
      onSuccess: invalidate,
    }),
    restoreAdmin: useMutation({
      mutationFn: (id: number) => api.restoreAdmin(token, id),
      onSuccess: invalidate,
    }),
    forceDeleteAdmin: useMutation({
      mutationFn: (id: number) => api.forceDeleteAdmin(token, id),
      onSuccess: invalidate,
    }),
    verifyEmail: useMutation({
      mutationFn: (id: number) => api.verifyAdminEmail(token, id),
      onSuccess: (admin) => {
        invalidate();
        qc.setQueryData(adminAccountKeys.detail(admin.id), admin);
      },
    }),
    verifyPhone: useMutation({
      mutationFn: (id: number) => api.verifyAdminPhone(token, id),
      onSuccess: (admin) => {
        invalidate();
        qc.setQueryData(adminAccountKeys.detail(admin.id), admin);
      },
    }),
    resetPassword: useMutation({
      mutationFn: ({
        id,
        password,
        password_confirmation,
      }: {
        id: number;
        password: string;
        password_confirmation: string;
      }) => api.resetAdminPassword(token, id, password, password_confirmation),
      onSuccess: invalidate,
    }),
    syncRoles: useMutation({
      mutationFn: ({ id, roles }: { id: number; roles: string[] }) =>
        api.syncAdminRoles(token, id, roles),
      onSuccess: (admin) => {
        invalidate();
        qc.setQueryData(adminAccountKeys.detail(admin.id), admin);
      },
    }),
  };
}
