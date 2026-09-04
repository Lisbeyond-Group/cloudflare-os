import { describe, expect, it } from "vitest";
import {
  GATEKEEPER_APP_ROUTES,
  MAX_GATEKEEPER_APP_PROMPT_LENGTH,
  normalizeGatekeeperAppPrompt,
  parseGatekeeperAppRoute,
  parseGatekeeperAppWorkspaceTarget,
} from "./gatekeeperAppNavigation";

const WORKSPACE_ID = "a".repeat(64);

describe("parseGatekeeperAppWorkspaceTarget", () => {
  it("accepts a workspace ID with an optional gadget", () => {
    expect(parseGatekeeperAppWorkspaceTarget(WORKSPACE_ID, undefined)).toEqual({
      workspaceId: WORKSPACE_ID,
    });
    expect(parseGatekeeperAppWorkspaceTarget(WORKSPACE_ID, 0)).toEqual({
      workspaceId: WORKSPACE_ID,
      gadgetId: 0,
    });
  });

  it.each([
    ["", undefined],
    ["../admin", undefined],
    [WORKSPACE_ID.toUpperCase(), undefined],
    [`${WORKSPACE_ID}a`, undefined],
    [WORKSPACE_ID, -1],
    [WORKSPACE_ID, 1.5],
    [WORKSPACE_ID, 9_007_199_254_740_992],
    [WORKSPACE_ID, "1"],
  ])("rejects (%s, %s)", (workspaceId, gadgetId) => {
    expect(() => parseGatekeeperAppWorkspaceTarget(workspaceId, gadgetId)).toThrow(
      "Invalid gatekeeper app workspace target",
    );
  });
});

describe("normalizeGatekeeperAppPrompt", () => {
  it("trims a bounded visible prompt", () => {
    expect(normalizeGatekeeperAppPrompt("  Set up a daily brief.  ")).toBe("Set up a daily brief.");
  });

  it("rejects empty and oversized prompts", () => {
    expect(() => normalizeGatekeeperAppPrompt("   ")).toThrow("cannot be empty");
    expect(() =>
      normalizeGatekeeperAppPrompt("x".repeat(MAX_GATEKEEPER_APP_PROMPT_LENGTH + 1)),
    ).toThrow("too long");
  });
});

describe("parseGatekeeperAppRoute", () => {
  it.each(Object.keys(GATEKEEPER_APP_ROUTES))("accepts %s", (route) => {
    expect(parseGatekeeperAppRoute(route)).toBe(route);
  });

  it.each([
    "",
    "/admin",
    "../properties",
    "portfolio/../admin",
    "portfolio/business-pulse?refresh=1",
    "portfolio/business-pulse#report",
    "portfolio%2Fbusiness-pulse",
    "portfolio/unknown",
    "sales/../admin",
    "sales/new-leads?write=1",
    "https://example.com",
    null,
    1,
  ])(
    "rejects %s",
    (route) => {
      expect(() => parseGatekeeperAppRoute(route)).toThrow(
        "Invalid gatekeeper app route",
      );
    },
  );
});
