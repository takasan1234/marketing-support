"use client";

import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import { Separator } from "@workspace/ui/components/separator";

export type ConceptSheetData = {
  who: string;   // ターゲット顧客
  what: string;  // 提供価値
  how: string;   // 提供方法
  why: string;   // 選ばれる理由
  when: string;  // 利用場面・タイミング
  where: string; // 流通・チャネル
  price: string; // 価格帯・収益モデル
};

type ConceptSheetProps = {
  data: ConceptSheetData;
  onChange: (data: ConceptSheetData) => void;
};

type SectionDef = {
  key: keyof ConceptSheetData;
  label: string;
  description: string;
  placeholder: string;
};

const SECTIONS: SectionDef[] = [
  {
    key: "who",
    label: "WHO — ターゲット顧客",
    description: "誰に向けた商品・サービスか",
    placeholder: "例：30代の共働き夫婦で、週末に自然体験を求めている層",
  },
  {
    key: "what",
    label: "WHAT — 提供価値",
    description: "顧客に何を提供するか（便益・価値）",
    placeholder: "例：初心者でも安心して楽しめる本格アウトドア体験",
  },
  {
    key: "how",
    label: "HOW — 提供方法",
    description: "どのように価値を届けるか（仕組み・手段）",
    placeholder: "例：完全サポート付きのガイドツアー形式で提供",
  },
  {
    key: "why",
    label: "WHY — 選ばれる理由",
    description: "競合と比べて選ばれる差別化ポイント",
    placeholder: "例：地域密着のガイドによる唯一無二の体験と安全管理",
  },
  {
    key: "when",
    label: "WHEN — 利用場面・タイミング",
    description: "どんな場面・タイミングで使われるか",
    placeholder: "例：週末・連休の家族・カップルの特別な体験として",
  },
  {
    key: "where",
    label: "WHERE — 流通・チャネル",
    description: "どこで販売・提供するか",
    placeholder: "例：専用ECサイト・旅行代理店・SNS広告経由",
  },
  {
    key: "price",
    label: "PRICE — 価格帯・収益モデル",
    description: "価格設定と収益の仕組み",
    placeholder: "例：1人あたり5,000〜15,000円、オプション追加収益モデル",
  },
];

export function ConceptSheet({ data, onChange }: ConceptSheetProps) {
  function update(key: keyof ConceptSheetData, value: string) {
    onChange({ ...data, [key]: value });
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="flex flex-col gap-0">
      {/* Print button */}
      <div className="flex justify-end mb-4 print:hidden">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handlePrint}
          className="text-sm"
        >
          A4 印刷プレビュー
        </Button>
      </div>

      {/* Sheet */}
      <div className="border rounded-lg overflow-hidden print:border-none print:rounded-none">
        {SECTIONS.map((section, idx) => (
          <div key={section.key}>
            {idx > 0 && <Separator />}
            <div className="p-5 flex flex-col gap-2">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-sm font-bold text-foreground">
                  {section.label}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {section.description}
                </p>
              </div>
              <Textarea
                value={data[section.key]}
                onChange={(e) => update(section.key, e.target.value)}
                placeholder={section.placeholder}
                className="min-h-[80px] text-sm resize-none print:border-none print:shadow-none print:p-0"
                rows={3}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
