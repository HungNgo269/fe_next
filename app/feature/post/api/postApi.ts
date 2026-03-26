import type { ApiResponse } from "@/app/share/utils/api-types";
import { clientGetJson } from "@/app/share/utils/api";

import type { PaginatedPostsResponse } from "../types/api.types";

export const fetchPosts = async (
  page = 1,
  limit = 5,
): Promise<ApiResponse<PaginatedPostsResponse>> =>
  clientGetJson<PaginatedPostsResponse>(`/posts?page=${page}&limit=${limit}`);
