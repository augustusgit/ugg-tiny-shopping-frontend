"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api/admin-customers";
import { useAuthStore } from "@/lib/stores/auth-store";
import type {
  CustomerListFilters,
  StoreCustomerInput,
  UpdateCustomerInput,
} from "@/lib/types/accounts";

const CUSTOMER_ACCOUNTS_ROOT = ["admin", "customers"] as const;

export const customerAccountKeys = {
  all: CUSTOMER_ACCOUNTS_ROOT,
  list: (filters: CustomerListFilters) =>
    [...CUSTOMER_ACCOUNTS_ROOT, "list", filters] as const,
  detail: (id: number) => [...CUSTOMER_ACCOUNTS_ROOT, "detail", id] as const,
  stats: [...CUSTOMER_ACCOUNTS_ROOT, "stats"] as const,
};

export function useAdminCustomers(filters: CustomerListFilters) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: customerAccountKeys.list(filters),
    queryFn: () => api.listCustomers(token, filters),
    enabled: Boolean(token),
  });
}

export function useAdminCustomer(id: number) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: customerAccountKeys.detail(id),
    queryFn: () => api.getCustomer(token, id),
    enabled: Boolean(token && id),
  });
}

export function useAdminCustomerStats() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: customerAccountKeys.stats,
    queryFn: () => api.getCustomerStats(token),
    enabled: Boolean(token),
  });
}

function useInvalidateCustomers() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: customerAccountKeys.all });
  };
}

export function useCreateCustomer() {
  const token = useAuthStore((s) => s.token);
  const invalidate = useInvalidateCustomers();
  return useMutation({
    mutationFn: (input: StoreCustomerInput) => api.createCustomer(token, input),
    onSuccess: invalidate,
  });
}

export function useUpdateCustomer(id: number) {
  const token = useAuthStore((s) => s.token);
  const invalidate = useInvalidateCustomers();
  return useMutation({
    mutationFn: (input: UpdateCustomerInput) =>
      api.updateCustomer(token, id, input),
    onSuccess: invalidate,
  });
}

export function useCustomerAccountActions() {
  const token = useAuthStore((s) => s.token);
  const invalidate = useInvalidateCustomers();
  const qc = useQueryClient();

  return {
    deleteCustomer: useMutation({
      mutationFn: (id: number) => api.deleteCustomer(token, id),
      onSuccess: invalidate,
    }),
    restoreCustomer: useMutation({
      mutationFn: (id: number) => api.restoreCustomer(token, id),
      onSuccess: invalidate,
    }),
    forceDeleteCustomer: useMutation({
      mutationFn: (id: number) => api.forceDeleteCustomer(token, id),
      onSuccess: invalidate,
    }),
    toggleStatus: useMutation({
      mutationFn: ({ id, ban_reason }: { id: number; ban_reason?: string }) =>
        api.toggleCustomerStatus(token, id, ban_reason),
      onSuccess: (user) => {
        invalidate();
        qc.setQueryData(customerAccountKeys.detail(user.id), user);
      },
    }),
    ban: useMutation({
      mutationFn: ({ id, ban_reason }: { id: number; ban_reason: string }) =>
        api.banCustomer(token, id, ban_reason),
      onSuccess: (user) => {
        invalidate();
        qc.setQueryData(customerAccountKeys.detail(user.id), user);
      },
    }),
    unban: useMutation({
      mutationFn: (id: number) => api.unbanCustomer(token, id),
      onSuccess: (user) => {
        invalidate();
        qc.setQueryData(customerAccountKeys.detail(user.id), user);
      },
    }),
    verifyEmail: useMutation({
      mutationFn: (id: number) => api.verifyCustomerEmail(token, id),
      onSuccess: (user) => {
        invalidate();
        qc.setQueryData(customerAccountKeys.detail(user.id), user);
      },
    }),
    verifyPhone: useMutation({
      mutationFn: (id: number) => api.verifyCustomerPhone(token, id),
      onSuccess: (user) => {
        invalidate();
        qc.setQueryData(customerAccountKeys.detail(user.id), user);
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
      }) =>
        api.resetCustomerPassword(token, id, password, password_confirmation),
      onSuccess: invalidate,
    }),
    syncRoles: useMutation({
      mutationFn: ({ id, roles }: { id: number; roles: string[] }) =>
        api.syncCustomerRoles(token, id, roles),
      onSuccess: (user) => {
        invalidate();
        qc.setQueryData(customerAccountKeys.detail(user.id), user);
      },
    }),
  };
}
