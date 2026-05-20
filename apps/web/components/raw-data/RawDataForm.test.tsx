import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { RawDataForm } from "./RawDataForm";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe("RawDataForm", () => {
  beforeEach(() => {
    mockPush.mockClear();
    vi.stubGlobal("confirm", vi.fn(() => true));
  });

  it("shows validation error when title is empty on submit", () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    const { container } = render(
      <RawDataForm projectId="proj-1" onSubmit={onSubmit} />
    );

    fireEvent.submit(container.querySelector("form")!);

    expect(screen.getByText("タイトルは必須です")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("calls onSubmit with form fields on valid submit", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <RawDataForm
        projectId="proj-1"
        onSubmit={onSubmit}
        submitLabel="登録"
      />
    );

    fireEvent.change(screen.getByLabelText(/タイトル/), {
      target: { value: "テストタイトル" },
    });
    fireEvent.change(screen.getByLabelText(/^内容/), {
      target: { value: "テスト内容" },
    });
    fireEvent.change(screen.getByLabelText(/情報ソース URL/), {
      target: { value: "https://example.com" },
    });
    fireEvent.change(screen.getByLabelText(/情報ソースメモ/), {
      target: { value: "出典メモ" },
    });
    fireEvent.change(screen.getByLabelText(/収集日/), {
      target: { value: "2024-06-15" },
    });
    fireEvent.change(screen.getByLabelText(/タグ/), {
      target: { value: "観光, 調査" },
    });

    fireEvent.click(screen.getByRole("button", { name: "登録" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    expect(onSubmit).toHaveBeenCalledWith({
      type: "MARKET_STATS",
      title: "テストタイトル",
      content: "テスト内容",
      sourceUrl: "https://example.com",
      sourceNote: "出典メモ",
      collectedAt: new Date("2024-06-15").toISOString(),
      tags: ["観光", "調査"],
    });
  });

  it("shows delete button when onDelete is provided", () => {
    render(
      <RawDataForm
        projectId="proj-1"
        onSubmit={vi.fn().mockResolvedValue(undefined)}
        onDelete={vi.fn().mockResolvedValue(undefined)}
      />
    );

    expect(screen.getByRole("button", { name: "削除" })).toBeInTheDocument();
  });

  it("does not show delete button when onDelete is omitted", () => {
    render(
      <RawDataForm
        projectId="proj-1"
        onSubmit={vi.fn().mockResolvedValue(undefined)}
      />
    );

    expect(screen.queryByRole("button", { name: "削除" })).not.toBeInTheDocument();
  });
});
