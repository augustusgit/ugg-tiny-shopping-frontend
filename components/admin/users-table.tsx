"use client";

import { Spinner } from "@/components/ui/spinner";
import { useAdminUsers } from "@/lib/hooks/use-products";

export function UsersTable() {
  const { data, isLoading, isError, error } = useAdminUsers();

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-danger">
        {(error as Error).message || "Failed to load users"}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-border bg-brand-soft/40 text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Joined</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((user) => (
            <tr key={user.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3 font-medium">{user.name}</td>
              <td className="px-4 py-3 text-muted">{user.email}</td>
              <td className="px-4 py-3">
                <span className="rounded bg-brand-soft px-2 py-1 text-xs capitalize text-brand">
                  {user.role}
                </span>
              </td>
              <td className="px-4 py-3 text-muted">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
