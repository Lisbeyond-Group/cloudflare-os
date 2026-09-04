export const MAX_GATEKEEPER_APP_PROMPT_LENGTH = 4_000;

export const GATEKEEPER_APP_ROUTES = {
  home: "/",
  properties: "/properties",
  portfolio: "/portfolio",
  "portfolio/revenue-management": "/portfolio/revenue-management",
  "portfolio/business-pulse": "/portfolio/business-pulse",
  "sales/new-leads": "/sales/new-leads",
  "ask-bifana": "/ask-bifana",
  workflows: "/workflows",
  connections: "/connections",
  settings: "/settings",
} as const;

export type GatekeeperAppRoute = keyof typeof GATEKEEPER_APP_ROUTES;

export const MAX_GATEKEEPER_APP_CONNECTIONS = 12;
export const MAX_GATEKEEPER_APP_CONNECTION_TEXT_LENGTH = 40;
const CONNECTION_REPORTING_GATEKEEPER_ID = "lisbeyond";

export type GatekeeperAppConnection = {
  id: string;
  name: string;
  state: "live" | "partial" | "off";
  detail: string;
};

export function gatekeeperAppCanReportConnections(gatekeeperVendorId: string): boolean {
  return gatekeeperVendorId === CONNECTION_REPORTING_GATEKEEPER_ID;
}

const CONNECTION_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CONNECTION_STATES = new Set<GatekeeperAppConnection["state"]>([
  "live",
  "partial",
  "off",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseGatekeeperAppConnection(value: unknown): GatekeeperAppConnection {
  if (!isRecord(value)) throw new TypeError("Invalid gatekeeper app connection report.");
  const { id, name, state, detail } = value;
  if (
    typeof id !== "string"
    || id.length > MAX_GATEKEEPER_APP_CONNECTION_TEXT_LENGTH
    || !CONNECTION_ID_PATTERN.test(id)
    || typeof name !== "string"
    || name.length === 0
    || name.length > MAX_GATEKEEPER_APP_CONNECTION_TEXT_LENGTH
    || typeof state !== "string"
    || !CONNECTION_STATES.has(state as GatekeeperAppConnection["state"])
    || typeof detail !== "string"
    || detail.length === 0
    || detail.length > MAX_GATEKEEPER_APP_CONNECTION_TEXT_LENGTH
  ) {
    throw new TypeError("Invalid gatekeeper app connection report.");
  }
  return { id, name, state: state as GatekeeperAppConnection["state"], detail };
}

/** Validates and reduces an untrusted connection summary reported by a sandboxed app. */
export function parseGatekeeperAppConnections(value: unknown): GatekeeperAppConnection[] {
  if (!Array.isArray(value) || value.length > MAX_GATEKEEPER_APP_CONNECTIONS) {
    throw new TypeError("Invalid gatekeeper app connection report.");
  }
  return value.map(parseGatekeeperAppConnection);
}

// A Durable Object ID string, which is what a workspace ID is.
const WORKSPACE_ID_PATTERN = /^[0-9a-f]{64}$/;

export type GatekeeperAppWorkspaceTarget = { workspaceId: string; gadgetId?: number };

/**
 * Validates a workspace target arriving from a sandboxed gatekeeper app before the host navigates
 * to it. The app is untrusted input, so the shape is checked here rather than at the router.
 */
export function parseGatekeeperAppWorkspaceTarget(
  workspaceId: unknown,
  gadgetId: unknown,
): GatekeeperAppWorkspaceTarget {
  if (typeof workspaceId !== "string" || !WORKSPACE_ID_PATTERN.test(workspaceId)) {
    throw new TypeError("Invalid gatekeeper app workspace target.");
  }
  if (gadgetId === undefined) return { workspaceId };
  if (typeof gadgetId !== "number" || !Number.isSafeInteger(gadgetId) || gadgetId < 0) {
    throw new TypeError("Invalid gatekeeper app workspace target.");
  }
  return { workspaceId, gadgetId };
}

export function normalizeGatekeeperAppPrompt(value: string): string {
  if (typeof value !== "string") throw new TypeError("Gatekeeper app prompt must be text.");
  const prompt = value.trim();
  if (!prompt) throw new TypeError("Gatekeeper app prompt cannot be empty.");
  if (prompt.length > MAX_GATEKEEPER_APP_PROMPT_LENGTH) {
    throw new RangeError("Gatekeeper app prompt is too long.");
  }
  return prompt;
}

/**
 * Gatekeeper apps are sandboxed and may only request one of the explicitly supported internal
 * destinations. They never supply an arbitrary path or external URL to the Workshop router.
 */
export function parseGatekeeperAppRoute(value: unknown): GatekeeperAppRoute {
  if (typeof value !== "string" || !(value in GATEKEEPER_APP_ROUTES)) {
    throw new TypeError("Invalid gatekeeper app route.");
  }
  return value as GatekeeperAppRoute;
}
