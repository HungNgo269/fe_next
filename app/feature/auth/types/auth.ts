export const GENDER_VALUES = ["MALE", "FEMALE"] as const;

export type Gender = (typeof GENDER_VALUES)[number];

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  gender: Gender;
  password: string;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  gender?: string | null;
  avatarUrl?: string | null;
};

export type LoginResponse = {
  message: string;
  user: AuthUser;
};

export type RegisterResponse = LoginResponse;
