import { envConfig } from "@/config/env.config";
import { ApiError, type ApiErrorBody } from "./api-error";
import { getClientId } from "./client-id";
import { parseJson, toJson } from "./time-codec";

type Query = Record<string, string | number | boolean | null | undefined>;

type RequestOptions = Omit<RequestInit, "body"> & {
  baseUrl?: string;
  body?: unknown;
  query?: Query;
};

type Envelope<T> = {
  success: boolean;
  message: string;
  data: T;
  error?: ApiErrorBody;
};

let languageProvider: () => string = () => "id";

/** Lets the preferences module tell the API which language to answer in. */
export function setApiLanguageProvider(provider: () => string) {
  languageProvider = provider;
}

function buildUrl(baseUrl: string, path: string, query?: Query) {
  const url = `${baseUrl}${path}`;
  if (!query) return url;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  const search = params.toString();
  return search ? `${url}?${search}` : url;
}

async function send(url: string, init: RequestInit) {
  try {
    return await fetch(url, init);
  } catch (cause) {
    throw new ApiError(0, { code: "network_error", message: String(cause) });
  }
}

/**
 * Single API boundary: adds base URL, language, client id, JSON encoding,
 * unwraps the `{success, data, error}` envelope and turns UTC strings into Dates.
 * GET requests retry once on a network failure.
 */
export async function apiClient<TResponse>(path: string, options: RequestOptions = {}): Promise<TResponse> {
  const { baseUrl = envConfig.apiGatewayUrl, body, query, headers, ...requestOptions } = options;
  const method = (requestOptions.method ?? "GET").toUpperCase();
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;

  const init: RequestInit = {
    credentials: "include",
    ...requestOptions,
    method,
    headers: {
      Accept: "application/json",
      "Accept-Language": languageProvider(),
      ...(method !== "GET" ? { "X-Client-Id": getClientId() } : {}),
      ...(body !== undefined && !isForm ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : isForm ? (body as FormData) : toJson(body),
  };

  const url = buildUrl(baseUrl, path, query);
  let response: Response;
  try {
    response = await send(url, init);
  } catch (error) {
    if (method !== "GET") throw error;
    response = await send(url, init);
  }

  const text = await response.text();
  let envelope: Envelope<TResponse> | null = null;
  if (text) {
    try {
      envelope = parseJson<Envelope<TResponse>>(text);
    } catch {
      envelope = null;
    }
  }

  if (!response.ok || (envelope && envelope.success === false)) {
    const retryAfter = Number(response.headers.get("Retry-After")) || null;
    throw new ApiError(response.status, envelope?.error ?? { message: envelope?.message }, retryAfter);
  }

  return (envelope?.data ?? null) as TResponse;
}

/** Upload with progress; fetch has no upload progress, so this uses XHR. */
export function uploadWithProgress<TResponse>(
  path: string,
  form: FormData,
  onProgress?: (fraction: number) => void,
  signal?: AbortSignal,
): Promise<TResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${envConfig.apiGatewayUrl}${path}`);
    xhr.withCredentials = true;
    xhr.setRequestHeader("Accept-Language", languageProvider());
    xhr.setRequestHeader("X-Client-Id", getClientId());

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(event.loaded / event.total);
    };
    xhr.onerror = () => reject(new ApiError(0, { code: "network_error" }));
    xhr.onabort = () => reject(new ApiError(0, { code: "aborted" }));
    xhr.onload = () => {
      let envelope: Envelope<TResponse> | null = null;
      try {
        envelope = parseJson<Envelope<TResponse>>(xhr.responseText);
      } catch {
        envelope = null;
      }
      if (xhr.status >= 200 && xhr.status < 300 && envelope?.success !== false) {
        resolve(envelope?.data as TResponse);
        return;
      }
      reject(new ApiError(xhr.status, envelope?.error ?? {}));
    };

    signal?.addEventListener("abort", () => xhr.abort());
    xhr.send(form);
  });
}
