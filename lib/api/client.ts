import { ApiError, type ApiEnvelope } from "@/lib/types/api";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

export const USE_MOCK = !API_BASE;

export const APP_ACCESS_KEY =
  process.env.NEXT_PUBLIC_APP_ACCESS_KEY ?? "73647874537947434";

function parseRetryAfter(response: Response, body: ApiEnvelope): number | null {
  const header = response.headers.get("Retry-After");
  if (header && !Number.isNaN(Number(header))) return Number(header);
  const match = body.message?.match(/(\d+)\s*second/i);
  if (match) return Number(match[1]);
  return null;
}

function normalizeErrors(data: ApiEnvelope["data"]): string[] {
  if (!data) return [];
  if (Array.isArray(data)) return data.map(String);
  if (typeof data === "object") {
    return Object.values(data)
      .flatMap((value) => (Array.isArray(value) ? value : [value]))
      .map(String);
  }
  return [];
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token, headers, ...rest } = options;
  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-access-key": APP_ACCESS_KEY,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const body = (await response.json().catch(() => ({
    status: 0,
    message: "Unexpected server response",
  }))) as ApiEnvelope<T>;

  if (response.status === 429) {
    throw new ApiError(body.message || "Too many attempts. Please try again later.", {
      status: 429,
      retryAfter: parseRetryAfter(response, body),
    });
  }

  if (!response.ok) {
    throw new ApiError(body.message || "Request failed", {
      status: response.status,
      errors: normalizeErrors(body.data),
      retryAfter: parseRetryAfter(response, body),
    });
  }

  // Laravel CommonHelper often returns HTTP 200 with status: 0 for business errors.
  if (body.status === 0) {
    throw new ApiError(body.message || "Request failed", {
      status: response.status,
      errors: normalizeErrors(body.data),
      retryAfter: parseRetryAfter(response, body),
    });
  }

  return (body.data ?? body) as T;
}

export async function apiMessage(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<string> {
  const { token, headers, ...rest } = options;
  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-access-key": APP_ACCESS_KEY,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const body = (await response.json().catch(() => ({
    status: 0,
    message: "Unexpected server response",
  }))) as ApiEnvelope;

  if (response.status === 429) {
    throw new ApiError(body.message || "Too many attempts. Please try again later.", {
      status: 429,
      retryAfter: parseRetryAfter(response, body),
    });
  }

  if (!response.ok || body.status === 0) {
    throw new ApiError(body.message || "Request failed", {
      status: response.status,
      errors: normalizeErrors(body.data),
      retryAfter: parseRetryAfter(response, body),
    });
  }

  return body.message || "Success";
}

export interface ApiListResult<T> {
  items: T[];
  total: number;
  message: string;
}

function unwrapListData<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (
    data &&
    typeof data === "object" &&
    Array.isArray((data as { data?: unknown }).data)
  ) {
    return (data as { data: T[] }).data;
  }
  return [];
}

/** List endpoints that return `{ status, message, total, data }`. */
export async function apiList<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<ApiListResult<T>> {
  const { token, headers, ...rest } = options;
  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-access-key": APP_ACCESS_KEY,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const body = (await response.json().catch(() => ({
    status: 0,
    message: "Unexpected server response",
  }))) as ApiEnvelope;

  if (response.status === 429) {
    throw new ApiError(body.message || "Too many attempts. Please try again later.", {
      status: 429,
      retryAfter: parseRetryAfter(response, body),
    });
  }

  if (!response.ok || body.status === 0) {
    throw new ApiError(body.message || "Request failed", {
      status: response.status,
      errors: normalizeErrors(body.data),
      retryAfter: parseRetryAfter(response, body),
    });
  }

  const items = unwrapListData<T>(body.data);
  return {
    items,
    total: typeof body.total === "number" ? body.total : items.length,
    message: body.message || "success",
  };
}

export function toQueryString(
  params: Record<string, string | number | boolean | null | undefined>,
) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}
