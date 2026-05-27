import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { VersionBadge } from "./VersionBadge";

describe("VersionBadge", () => {
  it("shows latest label when isLatest is true", () => {
    render(<VersionBadge version={3} isLatest />);
    expect(screen.getByText("v3 (最新)")).toBeInTheDocument();
  });

  it("shows version only when isLatest is false", () => {
    render(<VersionBadge version={2} isLatest={false} />);
    expect(screen.getByText("v2")).toBeInTheDocument();
    expect(screen.queryByText(/最新/)).not.toBeInTheDocument();
  });

  it("defaults isLatest to false", () => {
    render(<VersionBadge version={1} />);
    expect(screen.getByText("v1")).toBeInTheDocument();
  });
});
