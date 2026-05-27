import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  StrategyCanvas,
  type StrategyCanvasData,
} from "./StrategyCanvas";

const sampleData: StrategyCanvasData = {
  factors: ["品質", "価格"],
  curves: [
    {
      id: "curve-1",
      name: "自社",
      values: [3, 4],
      color: "#2563eb",
    },
  ],
};

describe("StrategyCanvas", () => {
  it("renders factors and curves", () => {
    render(<StrategyCanvas data={sampleData} onChange={vi.fn()} />);

    expect(screen.getByText("自社")).toBeInTheDocument();
    expect(screen.getAllByText("品質").length).toBeGreaterThan(0);
    expect(screen.getAllByText("価格").length).toBeGreaterThan(0);
    expect(screen.getByText("競争要素の編集")).toBeInTheDocument();
    expect(screen.getByText("スコア入力（1〜5）")).toBeInTheDocument();
  });

  it("calls onChange when a score value changes", () => {
    const onChange = vi.fn();
    render(<StrategyCanvas data={sampleData} onChange={onChange} />);

    const scoreInputs = screen.getAllByRole("spinbutton");
    fireEvent.change(scoreInputs[0]!, { target: { value: "5" } });

    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls.at(-1)?.[0] as StrategyCanvasData;
    expect(lastCall.curves[0]?.values[0]).toBe(5);
  });
});
