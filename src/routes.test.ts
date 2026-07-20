import { describe, expect, it } from "vitest";
import { matchRoutes } from "react-router-dom";

import { routes } from "./routes";

describe("routes", () => {
  it("keeps the public route contract stable", () => {
    expect(routes.map((route) => route.path)).toEqual(["/", "/employer", "/privacy", "*"]);
  });

  it("matches the privacy policy route", () => {
    expect(matchRoutes(routes, "/privacy")?.at(-1)?.route.path).toBe("/privacy");
  });

  it("matches the dedicated employer route", () => {
    expect(matchRoutes(routes, "/employer")?.at(-1)?.route.path).toBe("/employer");
  });

  it("matches unknown locations with the not-found route", () => {
    expect(matchRoutes(routes, "/missing-page")?.at(-1)?.route.path).toBe("*");
  });
});
