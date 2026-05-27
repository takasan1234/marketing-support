import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const push = vi.fn();
const back = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, back }),
}));

vi.mock("@/lib/api-client", () => ({
  createProject: vi.fn(),
}));

import { createProject } from "@/lib/api-client";
import NewProjectPage from "./page";

describe("NewProjectPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows form fields", () => {
    render(<NewProjectPage />);

    expect(screen.getByLabelText(/プロジェクト名/)).toBeInTheDocument();
    expect(screen.getByLabelText(/説明（任意）/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "作成する" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "キャンセル" })).toBeInTheDocument();
  });

  it("shows validation error when name is empty on submit", async () => {
    render(<NewProjectPage />);

    // whitespace-only passes HTML5 required but fails app validation
    fireEvent.change(screen.getByLabelText(/プロジェクト名/), {
      target: { value: "   " },
    });
    fireEvent.click(screen.getByRole("button", { name: "作成する" }));

    expect(await screen.findByText("プロジェクト名は必須です")).toBeInTheDocument();
    expect(createProject).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  it("calls createProject and navigates on valid submit", async () => {
    vi.mocked(createProject).mockResolvedValue({
      id: "proj-1",
      name: "テストプロジェクト",
      description: null,
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-01T00:00:00.000Z",
    });

    render(<NewProjectPage />);

    fireEvent.change(screen.getByLabelText(/プロジェクト名/), {
      target: { value: "テストプロジェクト" },
    });
    fireEvent.change(screen.getByLabelText(/説明（任意）/), {
      target: { value: "説明文" },
    });
    fireEvent.click(screen.getByRole("button", { name: "作成する" }));

    await waitFor(() => {
      expect(createProject).toHaveBeenCalledWith("テストプロジェクト", "説明文");
    });
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/projects/proj-1");
    });
  });
});
