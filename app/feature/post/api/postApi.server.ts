import "server-only";

import { serverGetJson } from "@/app/share/utils/api.server";
import type { ApiResponse } from "@/app/share/utils/api-types";
import type { Post } from "../types/api.types";

export const fetchPostByIdServer = async (
  postId: string,
): Promise<ApiResponse<Post>> => serverGetJson<Post>(`/posts/${postId}`);
