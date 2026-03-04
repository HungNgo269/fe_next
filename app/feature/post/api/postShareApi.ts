import { ApiResponse } from "@/app/share/utils/api-types";
import { Share } from "../types/api.types";
import { clientPostJson } from "@/app/share/utils/api";

export const createShareRequest = async (
  postId: string,
): Promise<ApiResponse<Share>> => clientPostJson<Share>("/shares", { postId });
