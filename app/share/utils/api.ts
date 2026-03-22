import "client-only";

import type { AxiosRequestConfig } from "axios";
import type { ApiResponse } from "./api-types";
import {
  type ApiRequestConfig,
  getApiClient,
  refreshTokens,
  toApiError,
  toRequestPath,
  withFormDataHeaders,
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

export const clientPostJson = async <T>(
  path: string,
  body: unknown,
  options?: ClientRequestOptions,
): Promise<ApiResponse<T>> =>
  runRequest(async (requestConfig) => {
    const response = await getApiClient().post<T>(toRequestPath(path), body, requestConfig);
    return response.data as T;
  }, options);

export const clientPostForm = async <T>(
  path: string,
  body: FormData,
  options?: ClientRequestOptions,
): Promise<ApiResponse<T>> =>
  runRequest(async (requestConfig) => {
    const response = await getApiClient().post<T>(
      toRequestPath(path),
      body,
      withFormDataHeaders(requestConfig),
    );
    return response.data as T;
  }, options);

export const clientGetJson = async <T>(
  path: string,
  options?: ClientRequestOptions,
): Promise<ApiResponse<T>> =>
  runRequest(async (requestConfig) => {
    const response = await getApiClient().get<T>(toRequestPath(path), requestConfig);
    return response.data as T;
  }, options);

export const clientPatchJson = async <T>(
  path: string,
  body: unknown,
  options?: ClientRequestOptions,
): Promise<ApiResponse<T>> =>
  runRequest(async (requestConfig) => {
    const response = await getApiClient().patch<T>(toRequestPath(path), body, requestConfig);
    return response.data as T;
  }, options);

export const clientPutJson = async <T>(
  path: string,
  body: unknown,
  options?: ClientRequestOptions,
): Promise<ApiResponse<T>> =>
  runRequest(async (requestConfig) => {
    const response = await getApiClient().put<T>(toRequestPath(path), body, requestConfig);
    return response.data as T;
  }, options);

export const clientDeleteJson = async <T = null>(
  path: string,
  options?: ClientRequestOptions,
): Promise<ApiResponse<T>> =>
  runRequest(async (requestConfig) => {
    const response = await getApiClient().delete<T>(toRequestPath(path), requestConfig);
    return (response.data ?? null) as T;
  }, options);

export { getApiClient as apiClient, refreshTokens };
