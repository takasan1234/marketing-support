import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { RawDataType } from "@/lib/api-client";
import { TwoColumnTable, type RowData, type RowDef } from "./TwoColumnTable";

const rows: RowDef[] = [
  {
    id: "row-1",
    label: "市場規模",
    description: "TAM/SAM/SOM",
    rawDataTypes: ["MARKET_STATS" as RawDataType],
  },
  {
    id: "row-2",
    label: "成長率",
    description: "",
    rawDataTypes: ["MARKET_STATS" as RawDataType],
  },
];

const emptyRow: RowData = {
  items: [],
  summary: "",
  informationSources: "",
};

describe("TwoColumnTable", () => {
  it("renders row labels", () => {
    render(
      <TwoColumnTable
        rows={rows}
        data={{ "row-1": emptyRow, "row-2": emptyRow }}
        onChange={vi.fn()}
        projectId="proj-1"
      />
    );

    expect(screen.getByText("市場規模")).toBeInTheDocument();
    expect(screen.getByText("TAM/SAM/SOM")).toBeInTheDocument();
    expect(screen.getByText("成長率")).toBeInTheDocument();
  });

  it("calls onChange when adding a row item", () => {
    const onChange = vi.fn();
    render(
      <TwoColumnTable
        rows={[rows[0]!]}
        data={{ "row-1": emptyRow }}
        onChange={onChange}
        projectId="proj-1"
      />
    );

    const addButtons = screen.getAllByRole("button", { name: "+ 項目を追加" });
    fireEvent.click(addButtons[0]!);

    expect(onChange).toHaveBeenCalledWith({
      "row-1": {
        items: [{ text: "", impact: "±", sources: [] }],
        summary: "",
        informationSources: "",
      },
    });
  });
});
