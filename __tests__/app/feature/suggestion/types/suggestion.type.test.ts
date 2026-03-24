import type { User } from "@/app/feature/post/types/api.types";
import { userToSuggestion } from "@/app/feature/suggestion/types/suggestion.type";

const createUser = (overrides: Partial<User> = {}): User => ({
  id: "user-1",
  name: "Hung Nguyen",
  email: "hung@example.com",
  ...overrides,
});

describe("userToSuggestion", () => {
  it("prefers the user handle when present", () => {
    expect(
      userToSuggestion(createUser({ handle: "hungng", avatarUrl: "avatar.png" })),
    ).toEqual({
      id: "user-1",
      name: "Hung Nguyen",
      handle: "hungng",
      avatar: "avatar.png",
      gender: undefined,
      note: "@hungng",
    });
  });

  it("falls back to the email prefix when handle is missing", () => {
    expect(userToSuggestion(createUser())).toEqual({
      id: "user-1",
      name: "Hung Nguyen",
      handle: "hung",
      avatar: undefined,
      gender: undefined,
      note: "@hung",
    });
  });

  it("falls back to the user id when neither handle nor email prefix is usable", () => {
    expect(
      userToSuggestion(
        createUser({
          id: "user-42",
          email: "@example.com",
        }),
      ),
    ).toEqual({
      id: "user-42",
      name: "Hung Nguyen",
      handle: "user-42",
      avatar: undefined,
      gender: undefined,
      note: "@user",
    });
  });
});
