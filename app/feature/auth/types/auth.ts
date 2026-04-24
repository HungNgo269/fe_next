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
  emailVerificationCode: string;
};

export type RegisterCodeRequestPayload = {
  email: string;
};

export type RegisterCodeRequestResponse = {
  message: string;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  gender?: string | null;
  avatarUrl?: string | null;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type LoginResponse = {
  message: string;
  user: AuthUser;
  tokens: AuthTokens;
  otpTriggered: boolean;
};

export type RegisterResponse = {
  message: string;
  user: AuthUser;
};
