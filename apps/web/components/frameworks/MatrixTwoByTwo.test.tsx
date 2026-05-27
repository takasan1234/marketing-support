import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  MatrixTwoByTwo,
  type MatrixData,
} from "./MatrixTwoByTwo";

const emptyCell = { items: [], summary: "" };

const emptyMatrix: MatrixData = {
  strengths: emptyCell,
  weaknesses: emptyCell,
  opportunities: emptyCell,
  threats: emptyCell,
};

describe("MatrixTwoByTwo", () => {
  it("renders four SWOT cells", () => {
    render(<MatrixTwoByTwo data={emptyMatrix} onChange={vi.fn()} />);

    expect(screen.getByText("Strengths")).toBeInTheDocument();
    expect(screen.getByText("Weaknesses")).toBeInTheDocument();
    expect(screen.getByText("Opportunities")).toBeInTheDocument();
    expect(screen.getByText("Threats")).toBeInTheDocument();
    expect(screen.getByText("強み")).toBeInTheDocument();
    expect(screen.getByText("弱み")).toBeInTheDocument();
    expect(screen.getByText("機会")).toBeInTheDocument();
    expect(screen.getByText("脅威")).toBeInTheDocument();
  });

  it("calls onChange when adding an item", () => {
    const onChange = vi.fn();
    render(<MatrixTwoByTwo data={emptyMatrix} onChange={onChange} />);

    const addButtons = screen.getAllByRole("button", { name: "+ 項目を追加" });
    fireEvent.click(addButtons[0]!);

    expect(onChange).toHaveBeenCalledWith({
      ...emptyMatrix,
      strengths: { items: [""], summary: "" },
    });
  });

  it("hides add and delete controls in readOnly mode", () => {
    render(
      <MatrixTwoByTwo data={emptyMatrix} onChange={vi.fn()} readOnly />
    );

    expect(
      screen.queryByRole("button", { name: "+ 項目を追加" })
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "×" })).not.toBeInTheDocument();
  });
});
