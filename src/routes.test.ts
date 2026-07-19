import { describe, expect, it } from "vitest";

import { routes } from "./routes";

describe("routes", () => {
  it("keeps the public route contract stable", () => {
    expect(routes.map((route) => route.path)).toEqual(["/", "/employer", "*"]);
  });
});
