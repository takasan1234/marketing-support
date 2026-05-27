import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import type { FrameworkType } from "@/lib/api-client";

vi.mock("@/lib/api-client", () => ({
  getProject: vi.fn(),
  listRawData: vi.fn(),
  getFrameworkEntry: vi.fn(),
}));

import { getProject, listRawData, getFrameworkEntry } from "@/lib/api-client";
import ProjectDashboardPage from "./page";

const projectId = "proj-1";

const baseProject = {
  id: projectId,
  name: "観光マーケ計画",
  description: "2025年度の観光地マーケティング",
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-01-01T00:00:00.000Z",
};

function mockFrameworkEntry(type: FrameworkType) {
  return {
    id: `entry-${type}`,
    projectId,
    frameworkType: type,
    version: 2,
    isLatest: true,
    data: { summary: "filled content" },
    note: null,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  };
}

async function renderPage() {
  const ui = await ProjectDashboardPage({
    params: Promise.resolve({ id: projectId }),
  });
  render(ui);
}

describe("ProjectDashboardPage", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getProject).mockResolvedValue(baseProject);
    vi.mocked(listRawData).mockResolvedValue([]);
    vi.mocked(getFrameworkEntry).mockRejectedValue(
      new Error("API Error 404: Not Found")
    );
  });

  it("shows project name and description", async () => {
    await renderPage();

    expect(screen.getByRole("heading", { name: "観光マーケ計画" })).toBeInTheDocument();
    expect(screen.getByText("2025年度の観光地マーケティング")).toBeInTheDocument();
  });

  it("does not show stale warning when all raw data is fresh", async () => {
    vi.mocked(listRawData).mockResolvedValue([
      {
        id: "rd-1",
        projectId,
        type: "MARKET_STATS",
        title: "市場統計",
        content: "content",
        sourceUrl: null,
        sourceNote: null,
        collectedAt: "2025-01-01T00:00:00.000Z",
        expiresAt: "2026-01-01T00:00:00.000Z",
        tags: [],
        isFresh: true,
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z",
      },
    ]);

    await renderPage();

    expect(screen.queryByText(/件の生データが期限切れです/)).not.toBeInTheDocument();
  });

  it("shows stale warning when raw data is not fresh", async () => {
    vi.mocked(listRawData).mockResolvedValue([
      {
        id: "rd-1",
        projectId,
        type: "MARKET_STATS",
        title: "市場統計",
        content: "content",
        sourceUrl: null,
        sourceNote: null,
        collectedAt: "2025-01-01T00:00:00.000Z",
        expiresAt: "2025-01-01T00:00:00.000Z",
        tags: [],
        isFresh: false,
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z",
      },
    ]);

    await renderPage();

    expect(screen.getByText(/1件の生データが期限切れです/)).toBeInTheDocument();
  });

  it("shows framework labels for all frameworks", async () => {
    await renderPage();

    expect(screen.getByText("PEST分析")).toBeInTheDocument();
    expect(screen.getByText("SWOT分析")).toBeInTheDocument();
  });

  it("treats 404 from getFrameworkEntry as unfilled (no warning badge without stale data)", async () => {
    await renderPage();

    expect(getFrameworkEntry).toHaveBeenCalled();
    expect(screen.queryByText("⚠")).not.toBeInTheDocument();
  });

  it("shows warning badge on filled framework when stale raw data affects it", async () => {
    vi.mocked(listRawData).mockResolvedValue([
      {
        id: "rd-1",
        projectId,
        type: "MARKET_STATS",
        title: "市場統計",
        content: "content",
        sourceUrl: null,
        sourceNote: null,
        collectedAt: "2025-01-01T00:00:00.000Z",
        expiresAt: "2025-01-01T00:00:00.000Z",
        tags: [],
        isFresh: false,
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z",
      },
    ]);
    vi.mocked(getFrameworkEntry).mockImplementation(async (_id, type) => {
      if (type === "PEST") {
        return mockFrameworkEntry("PEST");
      }
      throw new Error("API Error 404: Not Found");
    });

    await renderPage();

    const pestCard = screen.getByText("PEST分析").closest("a");
    expect(pestCard).toBeTruthy();
    expect(pestCard?.querySelector('[class*="border-yellow"]')).toBeTruthy();
  });
});
