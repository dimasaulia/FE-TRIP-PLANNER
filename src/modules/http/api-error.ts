export type ApiErrorBody = {
  code: string;
  message: string;
  details: Record<string, unknown>;
};

/** Uniform failure of an API call; `code` is the backend's stable error code. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: Record<string, unknown>;
  readonly retryAfter: number | null;

  constructor(status: number, body: Partial<ApiErrorBody>, retryAfter: number | null = null) {
    super(body.message || body.code || `Request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.code = body.code ?? (status === 0 ? "network_error" : "unknown");
    this.details = body.details ?? {};
    this.retryAfter = retryAfter;
  }

  get isNetwork() {
    return this.status === 0;
  }
}

export function isApiError(error: unknown, code?: string): error is ApiError {
  return error instanceof ApiError && (code === undefined || error.code === code);
}
