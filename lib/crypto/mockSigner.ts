/**
 * Mock off-chain signer for the hybrid module demo.
 * Mirrors Laravel OffChainApprovalService (HMAC-SHA256 over canonical JSON).
 */

export type ApprovalPayload = {
  action: "publish";
  actorAdminId: number;
  chainId: number;
  expiresAt: string;
  nonce: string;
  resourceId: number;
  resourceType: "product";
};

const MOCK_SECRET =
  process.env.NEXT_PUBLIC_MOCK_SIGNING_SECRET ??
  "tinystore-mock-signer-dev-only";

const MOCK_CHAIN_ID = Number(process.env.NEXT_PUBLIC_MOCK_CHAIN_ID ?? 31337);

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256Hex(message: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(message),
  );
  return toHex(digest);
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message),
  );
  return toHex(signature);
}

/** Match PHP OffChainApprovalService::normalizePayload + ksort + json_encode. */
export function canonicalizePayload(payload: ApprovalPayload): string {
  const normalized: ApprovalPayload = {
    action: payload.action,
    actorAdminId: Number(payload.actorAdminId),
    chainId: Number(payload.chainId),
    expiresAt: String(payload.expiresAt),
    nonce: String(payload.nonce),
    resourceId: Number(payload.resourceId),
    resourceType: payload.resourceType,
  };

  const keys = Object.keys(normalized).sort() as (keyof ApprovalPayload)[];
  const ordered: Record<string, string | number> = {};
  for (const key of keys) {
    ordered[key] = normalized[key];
  }

  return JSON.stringify(ordered);
}

export async function mockSignPayload(
  payload: ApprovalPayload,
  secret: string = MOCK_SECRET,
): Promise<string> {
  const canonical = canonicalizePayload(payload);
  const digest = await sha256Hex(canonical);
  const message = `TINYSTORE_V1:${digest}`;
  return hmacSha256Hex(secret, message);
}

export function buildPublishPayload(input: {
  productId: number;
  actorAdminId: number;
  nonce: string;
  ttlSeconds?: number;
  chainId?: number;
}): ApprovalPayload {
  const ttl = input.ttlSeconds ?? 600;
  return {
    action: "publish",
    actorAdminId: input.actorAdminId,
    chainId: input.chainId ?? MOCK_CHAIN_ID,
    expiresAt: new Date(Date.now() + ttl * 1000).toISOString(),
    nonce: input.nonce,
    resourceId: input.productId,
    resourceType: "product",
  };
}

export { MOCK_CHAIN_ID, MOCK_SECRET };
