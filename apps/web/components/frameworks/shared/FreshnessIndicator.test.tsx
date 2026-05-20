import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { FreshnessIndicator } from "./FreshnessIndicator";

describe("FreshnessIndicator", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows 期限なし when expiresAt is null", () => {
    render(
      <FreshnessIndicator expiresAt={null} collectedAt="2024-01-01T00:00:00.000Z" />
    );
    expect(screen.getByText("期限なし")).toBeInTheDocument();
  });

  it("shows 鮮度切れ when past expiration", () => {
    vi.setSystemTime(new Date("2024-06-02T00:00:00.000Z"));
    render(
      <FreshnessIndicator
        expiresAt="2024-06-01T00:00:00.000Z"
        collectedAt="2024-01-01T00:00:00.000Z"
      />
    );
    expect(screen.getByText("鮮度切れ")).toBeInTheDocument();
  });

  it("shows 鮮度切れ when expiresAt equals now", () => {
    const now = new Date("2024-06-01T12:00:00.000Z");
    vi.setSystemTime(now);
    render(
      <FreshnessIndicator
        expiresAt={now.toISOString()}
        collectedAt="2024-01-01T00:00:00.000Z"
      />
    );
    expect(screen.getByText("鮮度切れ")).toBeInTheDocument();
  });

  it("shows 鮮度良好 when remainRatio is at least 50%", () => {
    vi.setSystemTime(new Date("2024-01-11T00:00:00.000Z"));
    render(
      <FreshnessIndicator
        expiresAt="2024-01-21T00:00:00.000Z"
        collectedAt="2024-01-01T00:00:00.000Z"
      />
    );
    expect(screen.getByText("鮮度良好")).toBeInTheDocument();
  });

  it("shows 鮮度良好 at exactly 50% remaining boundary", () => {
    vi.setSystemTime(new Date("2024-01-11T00:00:00.000Z"));
    render(
      <FreshnessIndicator
        expiresAt="2024-01-21T00:00:00.000Z"
        collectedAt="2024-01-01T00:00:00.000Z"
      />
    );
    expect(screen.getByText("鮮度良好")).toBeInTheDocument();
  });

  it("shows 鮮度低下 when remainRatio is below 50%", () => {
    vi.setSystemTime(new Date("2024-01-16T00:00:00.000Z"));
    render(
      <FreshnessIndicator
        expiresAt="2024-01-21T00:00:00.000Z"
        collectedAt="2024-01-01T00:00:00.000Z"
      />
    );
    expect(screen.getByText("鮮度低下")).toBeInTheDocument();
  });
});
