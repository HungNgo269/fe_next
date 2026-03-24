import {
  getApiErrorMessages,
  getApiErrorName,
  getUnknownApiError,
} from "@/app/share/utils/api-errors";

describe("api-errors", () => {
  describe("getApiErrorMessages", () => {
    it("reads a direct string payload", () => {
      expect(getApiErrorMessages("Something went wrong")).toEqual([
        "Something went wrong",
      ]);
    });

    it("reads a response.message string payload", () => {
      expect(
        getApiErrorMessages({
          response: {
            message: "Forbidden",
          },
        }),
      ).toEqual(["Forbidden"]);
    });

    it("reads an array of messages", () => {
      expect(
        getApiErrorMessages({
          message: ["Email already exists", "Password too weak"],
        }),
      ).toEqual(["Email already exists", "Password too weak"]);
    });

    it("falls back to a default message when nothing usable exists", () => {
      expect(getApiErrorMessages({})).toEqual([
        "An unexpected error occurred.",
      ]);
    });
  });

  describe("getApiErrorName", () => {
    it("reads the error name from a response payload", () => {
      expect(
        getApiErrorName({
          response: {
            error: "Unauthorized",
          },
        }),
      ).toBe("Unauthorized");
    });

    it("returns undefined when the error name is missing", () => {
      expect(getApiErrorName("Unauthorized")).toBeUndefined();
      expect(getApiErrorName({ message: "Unauthorized" })).toBeUndefined();
    });
  });

  describe("getUnknownApiError", () => {
    it("includes the original error message for Error instances", () => {
      expect(getUnknownApiError(new Error("Socket timeout"))).toEqual({
        messages: ["Unable to reach the server.", "Socket timeout"],
      });
    });

    it("uses a generic fallback for non-Error values", () => {
      expect(getUnknownApiError("timeout")).toEqual({
        messages: ["Unable to reach the server.", "Request failed."],
      });
    });
  });
});
