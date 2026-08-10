/**
 * API client. Uses in-browser mock handlers by default.
 * Set NEXT_PUBLIC_API_URL to your Laravel base (e.g. http://localhost:8000/api)
 * to switch to real REST later — keep the same function signatures in lib/api/*.
 */

export const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

export const USE_MOCK = !API_BASE;

export class ApiRequestError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  if (USE_MOCK) {
    throw new ApiRequestError(
      "Mock mode: call domain helpers in lib/api instead of apiFetch",
    );
  }

  const { token, headers, ...rest } = options;
  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiRequestError(
      data.message || "Request failed",
      response.status,
    );
  }
  return data as T;
}
