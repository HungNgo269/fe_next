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

export type LoginResponse = {
  message: string;
};

export type RegisterResponse = {
  id: string;
  name: string;
  email: string;
  gender: Gender;
};
