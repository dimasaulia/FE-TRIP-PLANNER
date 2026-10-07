import { envConfig } from "@/config/env.config";

type RequestOptions = RequestInit & {
  baseUrl?: string;
};

export async function apiClient<TResponse>(
  path: string,
  options: RequestOptions = {},
): Promise<TResponse> {
  const { baseUrl = envConfig.apiGatewayUrl, ...requestOptions } = options;
  const response = await fetch(`${baseUrl}${path}`, requestOptions);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<TResponse>;
}
