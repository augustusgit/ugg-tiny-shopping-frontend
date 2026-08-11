"use client";

import { useCallback, useEffect, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import * as approvalsApi from "@/lib/api/admin-approvals";
import type { HybridDecision } from "@/lib/api/admin-approvals";
import {
  buildPublishPayload,
  mockSignPayload,
  type ApprovalPayload,
} from "@/lib/crypto/mockSigner";
import { formatApiError } from "@/lib/hooks/use-rate-limit";
import { useAuthStore } from "@/lib/stores/auth-store";

type Props = {
  productId: number;
  enabled: boolean;
  onApproved: (approvalRequestId: number, decision: HybridDecision) => void;
  onCleared?: () => void;
};

export function HybridApprovalPanel({
  productId,
  enabled,
  onApproved,
  onCleared,
}: Props) {
  const token = useAuthStore((s) => s.token);
  const adminId = Number(useAuthStore((s) => s.user?.id) || 0);

  const [permissionAllowed, setPermissionAllowed] = useState<boolean | null>(
    null,
  );
  const [actorAddress, setActorAddress] = useState<string | null>(null);
  const [resourceHash, setResourceHash] = useState<string | null>(null);
  const [driver, setDriver] = useState<string | null>(null);
  const [decision, setDecision] = useState<HybridDecision | null>(null);
  const [approvalRequestId, setApprovalRequestId] = useState<number | null>(
    null,
  );
  const [signedPayload, setSignedPayload] = useState<ApprovalPayload | null>(
    null,
  );
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshPermission = useCallback(async () => {
    if (!token || !productId) return;
    try {
      const status = await approvalsApi.checkPermission(
        token,
        "product",
        productId,
        adminId || undefined,
      );
      setPermissionAllowed(status.allowed);
      setActorAddress(status.actor_address);
      setResourceHash(status.resource_hash);
      setDriver(status.driver);
    } catch (err) {
      setError(formatApiError(err).message);
    }
  }, [token, productId, adminId]);

  useEffect(() => {
    if (enabled) {
      void refreshPermission();
    }
  }, [enabled, refreshPermission]);

  async function handleGrant() {
    if (!token) return;
    setBusy(true);
    setError(null);
    try {
      const result = await approvalsApi.grantPermission(
        token,
        "product",
        productId,
        adminId || undefined,
      );
      setPermissionAllowed(result.allowed);
      setActorAddress(result.actor_address);
      setResourceHash(result.resource_hash);
      setDriver(result.driver);
    } catch (err) {
      setError(formatApiError(err).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleSignAndDecide() {
    if (!token || !adminId) {
      setError("Admin session required to sign approval.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const nonceRes = await approvalsApi.issueApprovalNonce(token);
      const payload = buildPublishPayload({
        productId,
        actorAdminId: adminId,
        nonce: nonceRes.nonce,
        ttlSeconds: nonceRes.ttl_seconds,
        chainId: nonceRes.chain_id,
      });
      const signature = await mockSignPayload(payload);
      setSignedPayload(payload);
      setSignaturePreview(signature.slice(0, 18) + "…" + signature.slice(-8));

      const result = await approvalsApi.verifyAndDecide(
        token,
        payload,
        signature,
      );
      setDecision(result.decision);
      setApprovalRequestId(result.approval_request_id);
      setPermissionAllowed(result.decision.on_chain.allowed);
      onApproved(result.approval_request_id, result.decision);
    } catch (err) {
      setDecision(null);
      setApprovalRequestId(null);
      onCleared?.();
      setError(formatApiError(err).message);
      await refreshPermission();
    } finally {
      setBusy(false);
    }
  }

  if (!enabled) {
    return (
      <Alert
        variant="info"
        title="Hybrid approval not required"
        items={[
          "Publishing is off — product will be submitted for review without an on-chain permission check.",
        ]}
      />
    );
  }

  return (
    <div className="space-y-3 border border-border py-4">
      <div className="space-y-1 px-1">
        <h3 className="text-sm font-semibold tracking-wide">
          Hybrid approval (off-chain + on-chain)
        </h3>
        <p className="text-sm text-muted">
          Publish requires a mock signed intent and an on-chain permission bit
          for this product.
        </p>
      </div>

      <div className="space-y-1 px-1 text-sm text-muted">
        <p>
          On-chain permission:{" "}
          <strong className="text-foreground">
            {permissionAllowed == null
              ? "…"
              : permissionAllowed
                ? "allowed"
                : "missing"}
          </strong>
          {driver ? ` · driver ${driver}` : null}
        </p>
        {actorAddress ? (
          <p className="break-all font-mono text-xs">actor {actorAddress}</p>
        ) : null}
        {resourceHash ? (
          <p className="break-all font-mono text-xs">
            resource {resourceHash}
          </p>
        ) : null}
      </div>

      {error ? <Alert variant="error" title={error} /> : null}

      {decision ? (
        <Alert
          variant={decision.hybrid_allowed ? "success" : "warning"}
          title={
            decision.hybrid_allowed
              ? "Hybrid decision: ALLOW"
              : "Hybrid decision: DENY"
          }
          items={[
            `Off-chain signature: ${decision.off_chain.valid ? "valid" : "invalid"}`,
            `On-chain permission: ${decision.on_chain.allowed ? "allowed" : "denied"} (${decision.on_chain.driver})`,
            approvalRequestId
              ? `Approval request #${approvalRequestId}`
              : "No approval id",
            signaturePreview ? `Signature ${signaturePreview}` : "",
          ].filter(Boolean)}
        />
      ) : null}

      {signedPayload ? (
        <pre className="overflow-x-auto px-1 text-xs text-muted">
          {JSON.stringify(signedPayload, null, 2)}
        </pre>
      ) : null}

      <div className="flex flex-wrap gap-3 px-1">
        <Button
          type="button"
          variant="secondary"
          disabled={busy}
          onClick={() => void handleGrant()}
        >
          {busy ? "Working…" : "Grant on-chain permission"}
        </Button>
        <Button
          type="button"
          disabled={busy || !adminId}
          onClick={() => void handleSignAndDecide()}
        >
          {busy ? "Signing…" : "Sign approval & decide"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={busy}
          onClick={() => void refreshPermission()}
        >
          Refresh permission
        </Button>
      </div>
    </div>
  );
}
