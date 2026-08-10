export interface ApiSuccess<T = unknown> {
  status: 1;
  message: string;
  data?: T;
  total?: number;
}

export interface ApiFailure {
  status: 0;
  message: string;
  data?: string[] | Record<string, unknown> | null;
}

export type ApiEnvelope<T = unknown> = ApiSuccess<T> | ApiFailure;

export class ApiError extends Error {
  status: number;
  retryAfter: number | null;
  errors: string[];

  constructor(
    message: string,
    options: {
      status?: number;
      retryAfter?: number | null;
      errors?: string[];
    } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = options.status ?? 400;
    this.retryAfter = options.retryAfter ?? null;
    this.errors = options.errors ?? [];
  }
}

export interface AdminAuthData {
  admin: {
    id: number;
    email: string;
    username?: string | null;
    name?: string | null;
    [key: string]: unknown;
  };
  access_token: string;
  token_type: string;
}

export interface CustomerAuthData {
  user?: {
    id: number;
    email: string;
    username?: string | null;
    firstname?: string | null;
    lastname?: string | null;
    mobile?: string | null;
    active?: number | boolean;
    [key: string]: unknown;
  };
  customer?: {
    id: number;
    email: string;
    username?: string | null;
    firstname?: string | null;
    lastname?: string | null;
    mobile?: string | null;
    active?: number | boolean;
    [key: string]: unknown;
  };
  access_token: string;
  token_type: string;
}
