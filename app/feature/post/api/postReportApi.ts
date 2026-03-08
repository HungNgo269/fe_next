import type { ApiResponse } from "@/app/share/utils/api-types";
import { clientPostJson } from "@/app/share/utils/api";
import type { Report } from "../types/api.types";

export const createPostReportRequest = async (
  postId: string,
  text?: string,
): Promise<ApiResponse<Report>> =>
  clientPostJson<Report>("/reports", {
    postId,
    ...(text ? { text } : {}),
  });

export const createCommentReportRequest = async (
  commentId: string,
  text?: string,
): Promise<ApiResponse<Report>> =>
  clientPostJson<Report>("/reports", {
    commentId,
    ...(text ? { text } : {}),
  });
