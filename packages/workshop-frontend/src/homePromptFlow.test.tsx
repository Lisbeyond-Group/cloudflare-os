// @vitest-environment jsdom
/* eslint-disable react/react-in-jsx-scope */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const storage = new Map<string, string>();
const localStorageStub = {
  clear: () => storage.clear(),
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
};

const testState = vi.hoisted(() => {
  const listModels = vi.fn<() => Promise<Array<{ type: "agent"; id: string; name: string }>>>(async () => []);
  const newGadget = vi.fn<() => never>();
  return {
    addToast: vi.fn<(toast: unknown) => void>(),
    authenticatedApi: { listModels, newGadget },
    currentUser: { id: "user-a", name: "User A" },
    listModels,
    navigate: vi.fn<(options: unknown) => void>(),
    newGadget,
    seeds: [] as Array<{ text?: string; nonce?: number }>,
    draftStorageKeys: [] as Array<string | undefined>,
    blockedReasons: [] as Array<string | undefined>,
    selectedModels: [] as Array<string | null>,
    submittedModels: [] as Array<string | null>,
  };
});

vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-router")>()),
  useNavigate: () => testState.navigate,
}));

// Fresh object per call, matching the real useKumoToastManager — a hoisted stable mock would
// hide effects that wrongly depend on the toast manager's identity.
vi.mock("@cloudflare/kumo", () => ({
  useKumoToastManager: () => ({ add: testState.addToast }),
}));

vi.mock("./AuthContext", () => ({
  useAuthenticatedApi: () => ({
    authenticatedApi: testState.authenticatedApi,
    currentUser: testState.currentUser,
  }),
}));

vi.mock("./ChatInterface", () => ({
  ChatInput: ({ seedText, seedNonce, draftStorageKey, selectedModel, blockedReason }: {
    seedText?: string;
    seedNonce?: number;
    draftStorageKey?: string;
    selectedModel: string | null;
    blockedReason?: string;
  }) => {
    testState.seeds.push({ text: seedText, nonce: seedNonce });
    testState.draftStorageKeys.push(draftStorageKey);
    testState.blockedReasons.push(blockedReason);
    testState.selectedModels.push(selectedModel);
    return <>
      <textarea aria-label="Prompt" readOnly value={seedText ?? ""} />
      <button
        type="button"
        aria-label="Send message"
        disabled={Boolean(blockedReason)}
        onClick={() => testState.submittedModels.push(selectedModel)}
      />
    </>;
  },
}));

vi.mock("./useDocumentTitle", () => ({ useDocumentTitle: () => {} }));

import { AskBifanaPageContent } from "./routes/ask-bifana";
import { persistSelectedModel } from "./modelSelection";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("Ask Bifana prompt route flow", () => {
  let container: HTMLDivElement | undefined;
  let root: Root | undefined;

  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: localStorageStub,
    });
  });

  afterEach(async () => {
    await act(async () => root?.unmount());
    container?.remove();
    window.localStorage.clear();
    testState.seeds.length = 0;
    testState.draftStorageKeys.length = 0;
    testState.blockedReasons.length = 0;
    testState.selectedModels.length = 0;
    testState.submittedModels.length = 0;
    vi.clearAllMocks();
  });

  it("seeds the composer once, clears route state, and does not create a workspace", async () => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    await act(async () => root!.render(<AskBifanaPageContent prompt="Create a daily brief." />));

    expect(container.querySelector<HTMLTextAreaElement>('[aria-label="Prompt"]')?.value).toBe(
      "Create a daily brief.",
    );
    expect(Math.max(...testState.seeds.map(({ nonce }) => nonce ?? 0))).toBe(1);
    expect(testState.navigate).toHaveBeenCalledWith({
      to: "/ask-bifana",
      search: {},
      replace: true,
    });
    expect(testState.newGadget).not.toHaveBeenCalled();
    expect(testState.draftStorageKeys).toContain(
      "gadgets:composer-draft:v1:user-a:ask-bifana",
    );
  });

  it("keeps the seeded draft blocked until the Home preference is restored", async () => {
    let resolveModels!: (models: Array<{ type: "agent"; id: string; name: string }>) => void;
    testState.listModels.mockReturnValueOnce(new Promise(resolve => { resolveModels = resolve; }));
    persistSelectedModel("model-b");
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    const rendered = container;

    await act(async () => root!.render(
      <AskBifanaPageContent prompt="Keep this seeded question" />,
    ));
    expect(rendered.querySelector<HTMLTextAreaElement>('[aria-label="Prompt"]')?.value).toBe(
      "Keep this seeded question",
    );
    expect(requiredButton(rendered, "Send message").disabled).toBe(true);
    expect(testState.blockedReasons).toContain("Loading AI models…");

    await act(async () => resolveModels([
      { type: "agent", id: "model-a", name: "Model A" },
      { type: "agent", id: "model-b", name: "Model B" },
    ]));
    await vi.waitFor(() => expect(requiredButton(rendered, "Send message").disabled).toBe(false));
    requiredButton(rendered, "Send message").click();

    expect(testState.submittedModels).toEqual(["model-b"]);
    expect(testState.listModels).toHaveBeenCalledTimes(1);
  });

  it("keeps sending blocked after a model error and retries without losing the seed", async () => {
    testState.listModels
      .mockRejectedValueOnce(new Error("Offline"))
      .mockResolvedValueOnce([
        { type: "agent", id: "model-a", name: "Model A" },
      ]);
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    const rendered = container;

    await act(async () => root!.render(<AskBifanaPageContent prompt="Keep this draft" />));
    await vi.waitFor(() => expect(rendered.querySelector('[role="alert"]')).not.toBeNull());
    expect(requiredButton(rendered, "Send message").disabled).toBe(true);
    expect(rendered.querySelector<HTMLTextAreaElement>('[aria-label="Prompt"]')?.value).toBe(
      "Keep this draft",
    );

    await act(async () => requiredButton(rendered, "Try again").click());
    await vi.waitFor(() => expect(requiredButton(rendered, "Send message").disabled).toBe(false));

    expect(testState.selectedModels).toContain("model-a");
    expect(testState.listModels).toHaveBeenCalledTimes(2);
  });
});

function requiredButton(container: HTMLElement, name: string): HTMLButtonElement {
  const button = Array.from(container.querySelectorAll<HTMLButtonElement>('button'))
    .find(candidate => candidate.getAttribute('aria-label') === name || candidate.textContent?.trim() === name);
  if (!button) throw new Error(`Missing ${name} button`);
  return button;
}
