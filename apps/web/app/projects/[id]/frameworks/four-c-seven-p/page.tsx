"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { Textarea } from "@workspace/ui/components/textarea";
import { Checklist, type ChecklistItem } from "@/components/frameworks/Checklist";
import { VersionBadge } from "@/components/frameworks/shared/VersionBadge";
import { UpstreamPanel } from "@/components/frameworks/shared/UpstreamPanel";
import { ClaudeHint } from "@/components/frameworks/shared/ClaudeHint";
import {
  getFrameworkEntry,
  upsertFrameworkEntry,
  createFrameworkVersion,
  type FrameworkEntryDto,
} from "@/lib/api-client";

// ─── Types ───────────────────────────────────────────────────────────────────

type SevenPEntry = {
  currentState: string;
  target: string;
  gap: string;
};

type FourCSevenPData = {
  fourC: ChecklistItem[];
  sevenPEnabled: boolean;
  sevenP: {
    people: SevenPEntry;
    process: SevenPEntry;
    physicalEvidence: SevenPEntry;
  };
};

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_FOUR_C: ChecklistItem[] = [
  {
    id: "customerValue",
    label: "Customer Value（顧客価値） ← Product",
    description: "顧客のニーズを捉えているか",
    checked: false,
    score: 3,
    note: "",
    category: "4C検証",
  },
  {
    id: "customerCost",
    label: "Customer Cost（顧客負担） ← Price",
    description: "顧客が払ってもよい金額か",
    checked: false,
    score: 3,
    note: "",
    category: "4C検証",
  },
  {
    id: "convenience",
    label: "Convenience（利便性） ← Place",
    description: "見つけやすく、買いやすいか",
    checked: false,
    score: 3,
    note: "",
    category: "4C検証",
  },
  {
    id: "communication",
    label: "Communication（双方向） ← Promotion",
    description: "選んでもらえる伝え方か",
    checked: false,
    score: 3,
    note: "",
    category: "4C検証",
  },
];

const DEFAULT_SEVEN_P_ENTRY: SevenPEntry = {
  currentState: "",
  target: "",
  gap: "",
};

const DEFAULT_DATA: FourCSevenPData = {
  fourC: DEFAULT_FOUR_C,
  sevenPEnabled: false,
  sevenP: {
    people: { ...DEFAULT_SEVEN_P_ENTRY },
    process: { ...DEFAULT_SEVEN_P_ENTRY },
    physicalEvidence: { ...DEFAULT_SEVEN_P_ENTRY },
  },
};

// ─── SevenP Section Item ─────────────────────────────────────────────────────

type SevenPItemProps = {
  title: string;
  subtitle: string;
  value: SevenPEntry;
  onChange: (v: SevenPEntry) => void;
};

function SevenPItem({ title, subtitle, value, onChange }: SevenPItemProps) {
  return (
    <div className="rounded-lg border p-4 flex flex-col gap-3">
      <div>
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">現状</label>
          <Textarea
            value={value.currentState}
            onChange={(e) => onChange({ ...value, currentState: e.target.value })}
            placeholder="現在の状態..."
            className="text-xs min-h-[72px] resize-none"
            rows={3}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">目指す姿</label>
          <Textarea
            value={value.target}
            onChange={(e) => onChange({ ...value, target: e.target.value })}
            placeholder="目標とする状態..."
            className="text-xs min-h-[72px] resize-none"
            rows={3}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">ギャップ</label>
          <Textarea
            value={value.gap}
            onChange={(e) => onChange({ ...value, gap: e.target.value })}
            placeholder="現状とのギャップ・課題..."
            className="text-xs min-h-[72px] resize-none"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FourCSevenPPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [entry, setEntry] = useState<FrameworkEntryDto | null>(null);
  const [formData, setFormData] = useState<FourCSevenPData>(DEFAULT_DATA);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const fetched = await getFrameworkEntry(id, "FOUR_C_SEVEN_P");
        setEntry(fetched);
        const raw = fetched.data as Partial<FourCSevenPData>;
        setFormData({
          fourC: raw.fourC ?? DEFAULT_FOUR_C,
          sevenPEnabled: raw.sevenPEnabled ?? false,
          sevenP: raw.sevenP ?? DEFAULT_DATA.sevenP,
        });
      } catch {
        setFormData(DEFAULT_DATA);
      }
    }
    load();
  }, [id]);

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);
    try {
      const updated = await upsertFrameworkEntry(id, "FOUR_C_SEVEN_P", {
        data: formData as unknown as Record<string, unknown>,
      });
      setEntry(updated);
      setMessage("保存しました");
    } catch {
      setMessage("保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCreateVersion() {
    setIsCreatingVersion(true);
    setMessage(null);
    try {
      const newVersion = await createFrameworkVersion(id, "FOUR_C_SEVEN_P", {
        data: formData as unknown as Record<string, unknown>,
      });
      setEntry(newVersion);
      setMessage(`バージョン v${newVersion.version} を作成しました`);
    } catch {
      setMessage("バージョン作成に失敗しました");
    } finally {
      setIsCreatingVersion(false);
    }
  }

  function updateSevenPField(
    key: keyof FourCSevenPData["sevenP"],
    value: SevenPEntry
  ) {
    setFormData((prev) => ({
      ...prev,
      sevenP: { ...prev.sevenP, [key]: value },
    }));
  }

  return (
    <div className="min-h-svh p-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <p className="text-sm text-muted-foreground mb-2">
          <Link href="/" className="hover:underline">プロジェクト一覧</Link>
          {" / "}
          <Link href={`/projects/${id}`} className="hover:underline">ダッシュボード</Link>
          {" / 4C/7P検証"}
        </p>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">4C/7P 検証</h1>
            {entry && (
              <VersionBadge version={entry.version} isLatest={entry.isLatest} />
            )}
          </div>
          <div className="flex items-center gap-2">
            {message && (
              <span className="text-sm text-muted-foreground">{message}</span>
            )}
            <Button
              variant="outline"
              onClick={handleCreateVersion}
              disabled={isCreatingVersion || isSaving}
            >
              {isCreatingVersion ? "作成中..." : "新バージョンとして保存"}
            </Button>
            <Button onClick={handleSave} disabled={isSaving || isCreatingVersion}>
              {isSaving ? "保存中..." : "保存"}
            </Button>
          </div>
        </div>

        <Separator className="mb-4" />
        <ClaudeHint projectId={id} />
        <div className="mb-2" />

        {/* Main layout */}
        <div className="flex gap-6">
          <div className="flex-1 min-w-0 flex flex-col gap-8">

            {/* 4C Section */}
            <section className="flex flex-col gap-4">
              <div>
                <h2 className="text-lg font-semibold">4C 検証</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  4P の各要素を顧客視点（4C）で検証します。スコアが高いほど顧客ニーズへの充足度が高いことを示します。
                </p>
              </div>
              <Checklist
                items={formData.fourC}
                onChange={(items) =>
                  setFormData((prev) => ({ ...prev, fourC: items }))
                }
                showScore={true}
              />
            </section>

            <Separator />

            {/* 7P Section */}
            <section className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">7P 拡張</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    サービス特化型ビジネス向けに、4P の 3 要素（People・Process・Physical Evidence）を追加します。
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={formData.sevenPEnabled}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        sevenPEnabled: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 cursor-pointer accent-primary"
                  />
                  <span className="text-sm font-medium">このプロジェクトはサービス特化型</span>
                </label>
              </div>

              {formData.sevenPEnabled ? (
                <div className="flex flex-col gap-4">
                  <SevenPItem
                    title="People（スタッフ）"
                    subtitle="接客・サービス提供者の質"
                    value={formData.sevenP.people}
                    onChange={(v) => updateSevenPField("people", v)}
                  />
                  <SevenPItem
                    title="Process（プロセス）"
                    subtitle="サービス提供の流れ・効率・体験"
                    value={formData.sevenP.process}
                    onChange={(v) => updateSevenPField("process", v)}
                  />
                  <SevenPItem
                    title="Physical Evidence（物的証拠）"
                    subtitle="サービス提供時の演出・物理的環境"
                    value={formData.sevenP.physicalEvidence}
                    onChange={(v) => updateSevenPField("physicalEvidence", v)}
                  />
                </div>
              ) : (
                <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground text-sm">
                  サービス特化型を有効にすると 3 つの拡張要素が表示されます
                </div>
              )}
            </section>
          </div>

          {/* Right panel */}
          <aside className="w-64 shrink-0">
            <UpstreamPanel frameworkType="FOUR_C_SEVEN_P" projectId={id} />
          </aside>
        </div>
      </div>
    </div>
  );
}
