import { postJson } from "@/app/share/utils/api";
import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
} from "../types/auth";

export const login = (payload: LoginPayload) =>
  postJson<LoginResponse>("/auth/login", payload);

export const register = (payload: RegisterPayload) =>
  postJson<RegisterResponse>("/auth/register", payload);
