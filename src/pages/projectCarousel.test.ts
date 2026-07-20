import { describe, expect, it } from "vitest";

import { wrapCarouselIndex } from "./carouselIndex";

describe("wrapCarouselIndex", () => {
  it("wraps carousel navigation in both directions", () => {
    expect(wrapCarouselIndex(3, 3)).toBe(0);
    expect(wrapCarouselIndex(-1, 3)).toBe(2);
  });

  it("rejects an empty carousel", () => {
    expect(() => wrapCarouselIndex(0, 0)).toThrow(RangeError);
  });
});
