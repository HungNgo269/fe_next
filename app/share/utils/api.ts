import "client-only";

import type { AxiosRequestConfig } from "axios";
import type { ApiResponse } from "./api-types";
import {
  type ApiRequestConfig,
  getApiClient,
  refreshTokens,
  toApiError,
  toRequestPath,
} from "./api-client";

type ClientRequestOptions = {
  skipAuthRefresh?: boolean;
  config?: AxiosRequestConfig;
};

const withOptions = (options?: ClientRequestOptions): ApiRequestConfig => ({
  ...(options?.config ?? {}),
  skipAuthRefresh: options?.skipAuthRefresh,
});

const runRequest = async <T>(
  request: (requestConfig: ApiRequestConfig) => Promise<T>,
  options?: ClientRequestOptions,
): Promise<ApiResponse<T>> => {
  try {
    return { ok: true, data: await request(withOptions(options)) };
  } catch (error) {
    return { ok: false, error: toApiError(error) };
  }
};

export const clientGetJson = async <T>(
  path: string,
  options?: ClientRequestOptions,
): Promise<ApiResponse<T>> =>
  runRequest(async (requestConfig) => {
    const response = await getApiClient().get<T>(toRequestPath(path), requestConfig);
    return (response.data ?? null) as T;
  }, options);

export { getApiClient as apiClient, refreshTokens };
