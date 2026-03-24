import {
  firstNonEmpty,
  normalizeArray,
  normalizeNullableText,
  normalizeText,
} from "@/app/share/utils/helper";

describe("helper utilities", () => {
  it("normalizes text with a fallback", () => {
    expect(normalizeText("  hello  ")).toBe("hello");
    expect(normalizeText("   ", "fallback")).toBe("fallback");
    expect(normalizeText(undefined, "fallback")).toBe("fallback");
  });

  it("normalizes nullable text", () => {
    expect(normalizeNullableText("  hello  ")).toBe("hello");
    expect(normalizeNullableText("   ")).toBeNull();
    expect(normalizeNullableText(null)).toBeNull();
  });

  it("returns the first non-empty value", () => {
    expect(firstNonEmpty(undefined, "   ", "value", "other")).toBe("value");
    expect(firstNonEmpty(undefined, null, "   ")).toBeNull();
  });

  it("normalizes arrays", () => {
    expect(normalizeArray([1, 2, 3])).toEqual([1, 2, 3]);
    expect(normalizeArray(null)).toEqual([]);
    expect(normalizeArray(undefined)).toEqual([]);
  });
});
