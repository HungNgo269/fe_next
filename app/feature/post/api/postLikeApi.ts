import { ApiResponse } from "@/app/share/utils/api-types";
import { Like } from "../types/api.types";
import { clientDeleteJson, clientPostJson } from "@/app/share/utils/api";

export const createLikeRequest = async (
  postId: string,
  userId: string,
): Promise<ApiResponse<Like>> =>
  clientPostJson<Like>("/likes", { postId, userId });

export const deleteLikeRequest = async (
  likeId: string,
): Promise<ApiResponse<null>> => clientDeleteJson(`/likes/${likeId}`);
