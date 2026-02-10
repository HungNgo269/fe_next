import "client-only";

import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import type { ApiError, ApiResponse } from "./api-types";
import {
  extractErrorName,
  JSON_HEADERS,
  normalizeBaseUrl,
  normalizeMessages,
} from "./api-helpers";

type ApiRequestConfig = AxiosRequestConfig & {
  _retry?: boolean;
  skipAuthRefresh?: boolean;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api";

const apiClient = axios.create({
  baseURL: normalizeBaseUrl(API_BASE_URL),
  headers: JSON_HEADERS,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: normalizeBaseUrl(API_BASE_URL),
  headers: JSON_HEADERS,
  withCredentials: true,
});

let refreshPromise: Promise<void> | null = null;

const normalizePath = (path: string) => path.replace(/^\/+/, "");
const isAbsoluteUrl = (url: string) =>
  /^[a-z][a-z\d+\-.]*:|^\/\//i.test(url);

const normalizeAxiosError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const status = axiosError.response?.status;
    const payload = axiosError.response?.data;
    return {
      status,
      name: extractErrorName(payload),
      messages: normalizeMessages(payload),
    };
  }
  const message = error instanceof Error ? error.message : "Request failed.";
  return {
    messages: ["Unable to reach the server.", message],
  };
};

export const refreshTokens = async (): Promise<void> => {
  await refreshClient.post(normalizePath("/auth/refresh"));
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const config = error.config as ApiRequestConfig | undefined;

    if (!config || config._retry || config.skipAuthRefresh) {
      return Promise.reject(error);
    }
    if (status !== 401 && status !== 403) {
      return Promise.reject(error);
    }

    config._retry = true;

    if (!refreshPromise) {
      refreshPromise = refreshTokens().finally(() => {
        refreshPromise = null;
      });
    }

    try {
      await refreshPromise;
    } catch {
      return Promise.reject(error);
    }

    return apiClient.request(config);
  },
);

apiClient.interceptors.request.use((config) => {
  if (config.url && !isAbsoluteUrl(config.url)) {
    config.url = normalizePath(config.url);
  }
  return config;
});

export const clientPostJson = async <T>(
  path: string,
  body: unknown,
  options?: { skipAuthRefresh?: boolean; config?: AxiosRequestConfig },
): Promise<ApiResponse<T>> => {
  try {
    const requestConfig: ApiRequestConfig = {
      ...(options?.config ?? {}),
      skipAuthRefresh: options?.skipAuthRefresh,
    };
    const response = await apiClient.post<T>(
      normalizePath(path),
      body,
      requestConfig,
    );
    return { ok: true, data: response.data as T };
  } catch (error) {
    return { ok: false, error: normalizeAxiosError(error) };
  }
};

export { apiClient };
