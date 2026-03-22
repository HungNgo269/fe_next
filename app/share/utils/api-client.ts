import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from "axios";
import type { ApiError } from "./api-types";
import { getApiErrorMessages, getApiErrorName, getUnknownApiError } from "./api-errors";

export type ApiRequestConfig = AxiosRequestConfig & {
  _retry?: boolean;
  skipAuthRefresh?: boolean;
};

const API_BASE_URL =
  (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api").replace(/\/+$/, "");

const JSON_HEADERS = {
  "Content-Type": "application/json",
} as const;

const stripLeadingSlash = (path: string) => path.replace(/^\/+/, "");
const isAbsoluteUrl = (url: string) => /^[a-z][a-z\d+\-.]*:|^\/\//i.test(url);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: JSON_HEADERS,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  headers: JSON_HEADERS,
  withCredentials: true,
});

let refreshPromise: Promise<void> | null = null;

export const toApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    return {
      status: error.response?.status,
      name: getApiErrorName(error.response?.data),
      messages: getApiErrorMessages(error.response?.data),
    };
  }

  return getUnknownApiError(error);
};

export const refreshTokens = async (): Promise<void> => {
  await refreshClient.post(stripLeadingSlash("/auth/refresh"));
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
      refreshPromise = (async () => {
        try {
          await refreshTokens();
        } finally {
          refreshPromise = null;
        }
      })();
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
    config.url = stripLeadingSlash(config.url);
  }

  if (config.data instanceof FormData) {
    const headers = config.headers as Record<string, unknown> | undefined;
    if (headers) {
      delete headers["Content-Type"];
      delete headers["content-type"];
    }
  }

  return config;
});

export const withFormDataHeaders = (requestConfig: ApiRequestConfig) => {
  const headers = { ...(requestConfig.headers ?? {}) } as Record<string, string>;
  delete headers["Content-Type"];
  delete headers["content-type"];

  return {
    ...requestConfig,
    headers: {
      ...headers,
      "Content-Type": undefined,
      "content-type": undefined,
    },
  };
};

export const toRequestPath = (path: string) => stripLeadingSlash(path);

export const getApiClient = (): AxiosInstance => apiClient;
