"use client";

import { use } from "react";
import { AdminDetail } from "@/components/admin/accounts/admin-detail";

export default function AdminDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <div className="animate-fade-up">
      <AdminDetail id={Number(id)} />
    </div>
  );
}
