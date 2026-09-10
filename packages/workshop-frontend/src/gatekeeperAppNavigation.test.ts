import { describe, expect, it } from "vitest";
import {
  GATEKEEPER_APP_ROUTES,
  gatekeeperAppCanReportConnections,
  MAX_GATEKEEPER_APP_CONNECTIONS,
  MAX_GATEKEEPER_APP_CONNECTION_TEXT_LENGTH,
  MAX_GATEKEEPER_APP_PROMPT_LENGTH,
  normalizeGatekeeperAppPrompt,
  parseGatekeeperAppConnections,
  parseGatekeeperAppRoute,
  parseWorkflowRouteState,
  parsePropertyRouteState,
  parseGatekeeperAppWorkspaceTarget,
} from "./gatekeeperAppNavigation";

const WORKSPACE_ID = "a".repeat(64);

const VALID_CONNECTION = {
  id: "hostaway",
  name: "Hostaway",
  state: "live",
  detail: "Live",
} as const;

describe("gatekeeperAppCanReportConnections", () => {
  it("allows only the Lisbeyond app to publish host-rail status", () => {
    expect(gatekeeperAppCanReportConnections("lisbeyond")).toBe(true);
    expect(gatekeeperAppCanReportConnections("scheduler")).toBe(false);
    expect(gatekeeperAppCanReportConnections("context")).toBe(false);
  });
});

describe("parseGatekeeperAppConnections", () => {
  it("accepts and reduces a valid connection list", () => {
    expect(parseGatekeeperAppConnections([
      { ...VALID_CONNECTION, ignored: true },
      { id: "salesforce", name: "Salesforce", state: "partial", detail: "Needs access" },
      { id: "notion", name: "Notion", state: "off", detail: "Not connected" },
    ])).toEqual([
      VALID_CONNECTION,
      { id: "salesforce", name: "Salesforce", state: "partial", detail: "Needs access" },
      { id: "notion", name: "Notion", state: "off", detail: "Not connected" },
    ]);
  });

  it.each([
    null,
    {},
    "hostaway",
    Array.from({ length: MAX_GATEKEEPER_APP_CONNECTIONS + 1 }, () => VALID_CONNECTION),
  ])("rejects a non-list or oversized list: %s", (value) => {
    expect(() => parseGatekeeperAppConnections(value)).toThrow(
      "Invalid gatekeeper app connection report",
    );
  });

  it.each([
    {},
    { ...VALID_CONNECTION, id: undefined },
    { ...VALID_CONNECTION, id: "Hostaway" },
    { ...VALID_CONNECTION, id: "hostaway/calendar" },
    { ...VALID_CONNECTION, id: "x".repeat(MAX_GATEKEEPER_APP_CONNECTION_TEXT_LENGTH + 1) },
    { ...VALID_CONNECTION, name: "" },
    { ...VALID_CONNECTION, name: "x".repeat(MAX_GATEKEEPER_APP_CONNECTION_TEXT_LENGTH + 1) },
    { ...VALID_CONNECTION, state: "stale" },
    { ...VALID_CONNECTION, detail: "" },
    { ...VALID_CONNECTION, detail: "x".repeat(MAX_GATEKEEPER_APP_CONNECTION_TEXT_LENGTH + 1) },
  ])("rejects an invalid row: %s", (row) => {
    expect(() => parseGatekeeperAppConnections([row])).toThrow(
      "Invalid gatekeeper app connection report",
    );
  });
});

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

describe("workflow URL state", () => {
  it("retains the bounded pending invoice deep link and drops unrelated state", () => {
    expect(parseWorkflowRouteState({ workflow: "renovations-invoice-intake", tab: "invoices", status: "awaiting_approval", item: "item-123_abc", token: "private", url: "https://evil.example" })).toEqual({ workflow: "renovations-invoice-intake", tab: "invoices", status: "awaiting_approval", item: "item-123_abc" });
  });
  it.each(["to_review", "decided", "needs_help"] as const)("retains the reviewed invoice view %s", status => {
    expect(parseWorkflowRouteState({ workflow: "renovations-invoice-intake", tab: "invoices", status }))
      .toEqual({ workflow: "renovations-invoice-intake", tab: "invoices", status });
  });
  it("drops invalid, oversized and array values without accepting another path", () => {
    expect(parseWorkflowRouteState({ workflow: "../../settings", tab: "admin", status: ["approved"], item: "x".repeat(201) })).toEqual({});
    expect(parseWorkflowRouteState(null)).toEqual({});
    expect(parseWorkflowRouteState({ item: "<script>" })).toEqual({});
  });
});

describe("property URL state", () => {
  it("normalizes a bounded property workspace deep link", () => {
    expect(parsePropertyRouteState({
      property: " p0478 ",
      tab: "guide",
      q: "river",
      service: "property_management",
      region: "Lisbon",
      status: "active",
      scroll: "620",
      token: "private",
    })).toEqual({
      property: "P0478",
      tab: "guide",
      q: "river",
      service: "property_management",
      region: "Lisbon",
      status: "active",
      scroll: 620,
    });
  });

  it("retains an invalid marker across repeated boundary validation", () => {
    const once = parsePropertyRouteState({ property: "../../settings", tab: "activity" });
    expect(once).toEqual({ invalidProperty: "../../SETTINGS", tab: "activity" });
    expect(parsePropertyRouteState(once)).toEqual(once);
  });

  it("drops oversized and unsupported filter state", () => {
    expect(parsePropertyRouteState({
      property: "P12345",
      tab: "admin",
      q: "x".repeat(101),
      service: "finance",
      region: "x".repeat(101),
      status: "deleted",
      scroll: -1,
    })).toEqual({ invalidProperty: "P12345" });
  });
});
