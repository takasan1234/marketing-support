import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, within, cleanup } from "@testing-library/react";

vi.mock("@/lib/api-client", () => ({
  listRawData: vi.fn(),
}));

import { listRawData } from "@/lib/api-client";
import RawDataListPage from "./page";

const projectId = "proj-1";

async function renderPage(searchParams: { type?: string } = {}) {
  const ui = await RawDataListPage({
    params: Promise.resolve({ id: projectId }),
    searchParams: Promise.resolve(searchParams),
  });
  return render(ui);
}

describe("RawDataListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listRawData).mockResolvedValue([]);
  });

  afterEach(() => {
    cleanup();
  });

  it("shows empty state when no raw data", async () => {
    await renderPage();

    expect(screen.getByText("生データがありません。")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "最初の生データを追加する" })).toHaveAttribute(
      "href",
      `/projects/${projectId}/raw-data/new`
    );
  });

  it("shows new raw data link in header", async () => {
    await renderPage();

    const header = screen.getByRole("heading", { name: "生データ管理" }).parentElement!;
    expect(within(header).getByRole("link", { name: "新規追加" })).toHaveAttribute(
      "href",
      `/projects/${projectId}/raw-data/new`
    );
  });

  it("lists title, type label, and freshness indicator", async () => {
    const collectedAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    vi.mocked(listRawData).mockResolvedValue([
      {
        id: "rd-1",
        projectId,
        type: "MARKET_STATS",
        title: "観光統計2025",
        content: "統計の概要",
        sourceUrl: null,
        sourceNote: null,
        collectedAt,
        expiresAt,
        tags: [],
        isFresh: true,
        createdAt: collectedAt,
        updatedAt: collectedAt,
      },
    ]);

    await renderPage();

    const row = screen.getByRole("link", { name: /観光統計2025/ });
    expect(row).toBeInTheDocument();
    expect(row).toHaveTextContent("市場統計");
    expect(row).toHaveTextContent("鮮度良好");
    expect(screen.queryByText("生データがありません。")).not.toBeInTheDocument();
  });
});
