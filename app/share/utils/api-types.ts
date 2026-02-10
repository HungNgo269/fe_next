export type ApiError = {
  status?: number;
  name?: string;
  messages: string[];
};

export type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };
