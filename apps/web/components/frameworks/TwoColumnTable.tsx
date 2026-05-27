"use client";

import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import type { RawDataType } from "@/lib/api-client";

export type ImpactSign = "+" | "-" | "±";

export type FrameworkItem = {
  text: string;
  impact: ImpactSign;
  sources: string[];
};

export type RowData = {
  items: FrameworkItem[];
  summary: string;
  informationSources: string;
};

export type RowDef = {
  id: string;
  label: string;
  description: string;
  rawDataTypes: RawDataType[];
};

type TwoColumnTableProps = {
  rows: RowDef[];
  data: Record<string, RowData>;
  onChange: (newData: Record<string, RowData>) => void;
  projectId: string;
};

function ImpactBadge({ impact }: { impact: ImpactSign }) {
  const classes: Record<ImpactSign, string> = {
    "+": "bg-green-100 text-green-800",
    "-": "bg-red-100 text-red-800",
    "±": "bg-yellow-100 text-yellow-800",
  };
  return (
    <span
      className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold ${classes[impact]}`}
    >
      {impact}
    </span>
  );
}

export function TwoColumnTable({
  rows,
  data,
  onChange,
  projectId: _projectId,
}: TwoColumnTableProps) {
  function getRowData(rowId: string): RowData {
    return (
      data[rowId] ?? {
        items: [],
        summary: "",
        informationSources: "",
      }
    );
  }

  function updateRowData(rowId: string, updater: (prev: RowData) => RowData) {
    onChange({ ...data, [rowId]: updater(getRowData(rowId)) });
  }

  function addItem(rowId: string) {
    updateRowData(rowId, (prev) => ({
      ...prev,
      items: [...prev.items, { text: "", impact: "±", sources: [] }],
    }));
  }

  function removeItem(rowId: string, index: number) {
    updateRowData(rowId, (prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  }

  function updateItem(
    rowId: string,
    index: number,
    field: keyof FrameworkItem,
    value: string
  ) {
    updateRowData(rowId, (prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-muted/50">
            <th className="border p-3 text-left font-semibold w-32">
              サブ要素
            </th>
            <th className="border p-3 text-left font-semibold w-1/3">
              分析結果（項目）
            </th>
            <th className="border p-3 text-left font-semibold">
              サマリー・情報ソース
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const rowData = getRowData(row.id);
            return (
              <tr key={row.id} className="align-top">
                <td className="border p-3">
                  <div className="font-medium">{row.label}</div>
                  {row.description && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {row.description}
                    </div>
                  )}
                </td>
                <td className="border p-3">
                  <div className="flex flex-col gap-2">
                    {rowData.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 group"
                      >
                        <Select
                          value={item.impact}
                          onValueChange={(val) =>
                            updateItem(row.id, idx, "impact", val as ImpactSign)
                          }
                        >
                          <SelectTrigger className="w-14 h-7 text-xs shrink-0">
                            <SelectValue>
                              <ImpactBadge impact={item.impact} />
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="+">+ (好機)</SelectItem>
                            <SelectItem value="-">- (脅威)</SelectItem>
                            <SelectItem value="±">± (中立)</SelectItem>
                          </SelectContent>
                        </Select>
                        <Textarea
                          value={item.text}
                          onChange={(e) =>
                            updateItem(row.id, idx, "text", e.target.value)
                          }
                          placeholder="分析結果を入力..."
                          className="text-xs min-h-[40px] resize-none flex-1"
                          rows={2}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-7 px-2 text-destructive hover:text-destructive"
                          onClick={() => removeItem(row.id, idx)}
                        >
                          削除
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="self-start text-xs h-7"
                      onClick={() => addItem(row.id)}
                    >
                      + 項目を追加
                    </Button>
                  </div>
                </td>
                <td className="border p-3">
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        サマリー
                      </label>
                      <Textarea
                        value={rowData.summary}
                        onChange={(e) =>
                          updateRowData(row.id, (prev) => ({
                            ...prev,
                            summary: e.target.value,
                          }))
                        }
                        placeholder="この要素のサマリーを記入..."
                        className="text-xs min-h-[60px]"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        情報ソース
                      </label>
                      <Textarea
                        value={rowData.informationSources}
                        onChange={(e) =>
                          updateRowData(row.id, (prev) => ({
                            ...prev,
                            informationSources: e.target.value,
                          }))
                        }
                        placeholder="参照した情報ソースを記入..."
                        className="text-xs min-h-[40px]"
                        rows={2}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
