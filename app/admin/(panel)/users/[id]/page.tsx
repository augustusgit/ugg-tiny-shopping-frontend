"use client";

import { use } from "react";
import { CustomerDetail } from "@/components/admin/accounts/customer-detail";

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <div className="animate-fade-up">
      <CustomerDetail id={Number(id)} />
    </div>
  );
}
