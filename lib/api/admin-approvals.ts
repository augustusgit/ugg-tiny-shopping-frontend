import { apiFetch } from "@/lib/api/client";
import type { ApprovalPayload } from "@/lib/crypto/mockSigner";

function auth(token?: string | null) {
  return { token };
}

export type ApprovalNonceResponse = {
  nonce: string;
  actor_address: string;
  chain_id: number;
  ttl_seconds: number;
  expires_hint: string;
  signing_secret_hint?: string;
};

export type HybridDecision = {
  off_chain: {
    valid: boolean;
    payload_hash: string;
    signature: string;
    nonce: string;
  };
  on_chain: {
    driver: string;
    resource_hash: string;
    actor_address: string;
    allowed: boolean;
  };
  hybrid_allowed: boolean;
  decided_at: string;
};

export type VerifyAndDecideResponse = {
  approval_request_id: number;
  approval: Record<string, unknown>;
  decision: HybridDecision;
};

export type PermissionStatus = {
  allowed: boolean;
  resource_hash: string;
  actor_address: string;
  driver: string;
  resource_type: string;
  resource_id: number;
  actor_admin_id: number;
  tx_hash?: string | null;
};

export async function issueApprovalNonce(token?: string | null) {
  return apiFetch<ApprovalNonceResponse>("/admin/approvals/nonce", {
    method: "POST",
    ...auth(token),
  });
}

export async function verifyAndDecide(
  token: string | null | undefined,
  payload: ApprovalPayload,
  signature: string,
) {
  return apiFetch<VerifyAndDecideResponse>("/admin/approvals/verify-and-decide", {
    method: "POST",
    ...auth(token),
    body: JSON.stringify({ payload, signature }),
  });
}

export async function grantPermission(
  token: string | null | undefined,
  resourceType: "product",
  resourceId: number,
  forAdminId?: number,
) {
  return apiFetch<PermissionStatus>("/admin/approvals/grant", {
    method: "POST",
    ...auth(token),
    body: JSON.stringify({
      resource_type: resourceType,
      resource_id: resourceId,
      ...(forAdminId ? { for_admin_id: forAdminId } : {}),
    }),
  });
}

export async function checkPermission(
  token: string | null | undefined,
  resourceType: "product",
  resourceId: number,
  forAdminId?: number,
) {
  const qs = new URLSearchParams({
    resource_type: resourceType,
    resource_id: String(resourceId),
  });
  if (forAdminId) qs.set("for_admin_id", String(forAdminId));

  return apiFetch<PermissionStatus>(`/admin/approvals/check?${qs}`, {
    method: "GET",
    ...auth(token),
  });
}
