"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { Textarea } from "@workspace/ui/components/textarea";
import { Input } from "@workspace/ui/components/input";
import { VersionBadge } from "@/components/frameworks/shared/VersionBadge";
import { UpstreamPanel } from "@/components/frameworks/shared/UpstreamPanel";
import { ClaudeHint } from "@/components/frameworks/shared/ClaudeHint";
import { RawDataLinker } from "@/components/frameworks/shared/RawDataLinker";
import {
  getFrameworkEntry,
  upsertFrameworkEntry,
  createFrameworkVersion,
  listLinks,
  type FrameworkEntryDto,
  type LinkDto,
} from "@/lib/api-client";

type PromotionStep = {
  tactics: string[];
  budget: string;
  kpi: string;
  timeline: string;
  note: string;
};

type PromotionData = {
  overallStrategy: string;
  steps: Record<string, PromotionStep>;
};

const STEP_DEFS: { id: string; label: string; description: string }[] = [
  {
    id: "awareness",
    label: "認知形成",
    description: "ターゲットに商品・サービスの存在を知ってもらう",
  },
  {
    id: "lead_acquisition",
    label: "リード獲得",
    description: "興味を持った見込み顧客の情報を獲得する",
  },
  {
    id: "nurturing",
    label: "育成（ナーチャリング）",
    description: "関係を継続し、購買意欲を高める",
  },
  {
    id: "conversion",
    label: "転換（コンバージョン）",
    description: "見込み顧客を実際の顧客に転換する",
  },
  {
    id: "activation",
    label: "利用促進",
    description: "購入後の利用・活用を促し、価値を実感させる",
  },
  {
    id: "referral",
    label: "口コミ・紹介",
    description: "満足した顧客に口コミ・紹介を促す",
  },
  {
    id: "loyalty",
    label: "ロイヤリティ向上",
    description: "リピート購入・ブランドへの愛着を育む",
  },
  {
    id: "measurement",
    label: "効果測定",
    description: "各施策の効果を測定・改善サイクルを回す",
  },
];

function makeDefaultStep(): PromotionStep {
  return { tactics: [], budget: "", kpi: "", timeline: "", note: "" };
}

function makeDefaultData(): PromotionData {
  const steps: Record<string, PromotionStep> = {};
  for (const s of STEP_DEFS) {
    steps[s.id] = makeDefaultStep();
  }
  return { overallStrategy: "", steps };
}

const DEFAULT_PROMOTION_DATA: PromotionData = makeDefaultData();

type StepSectionProps = {
  stepDef: (typeof STEP_DEFS)[number];
  stepData: PromotionStep;
  isOpen: boolean;
  onToggle: () => void;
  onChange: (data: PromotionStep) => void;
  stepIndex: number;
};

function StepSection({
  stepDef,
  stepData,
  isOpen,
  onToggle,
  onChange,
  stepIndex,
}: StepSectionProps) {
  function patchStep(patch: Partial<PromotionStep>) {
    onChange({ ...stepData, ...patch });
  }

  function handleTacticChange(index: number, value: string) {
    const tactics = [...stepData.tactics];
    tactics[index] = value;
    patchStep({ tactics });
  }

  function addTactic() {
    patchStep({ tactics: [...stepData.tactics, ""] });
  }

  function removeTactic(index: number) {
    patchStep({ tactics: stepData.tactics.filter((_, i) => i !== index) });
  }

  const hasContent =
    stepData.tactics.length > 0 ||
    stepData.budget !== "" ||
    stepData.kpi !== "" ||
    stepData.timeline !== "" ||
    stepData.note !== "";

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
          {stepIndex + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{stepDef.label}</span>
            {hasContent && (
              <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                入力済
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {stepDef.description}
          </p>
        </div>
        <svg
          className={`w-4 h-4 text-muted-foreground transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-0 border-t bg-muted/10 flex flex-col gap-4">
          {/* Tactics */}
          <div className="flex flex-col gap-2 pt-4">
            <label className="text-sm font-medium">施策・タクティクス</label>
            {stepData.tactics.map((tactic, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={tactic}
                  onChange={(e) => handleTacticChange(i, e.target.value)}
                  placeholder={`施策 ${i + 1}`}
                  className="text-sm"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive h-9 px-2 text-xs shrink-0"
                  onClick={() => removeTactic(i)}
                >
                  削除
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="self-start text-xs"
              onClick={addTactic}
            >
              + 施策を追加
            </Button>
          </div>

          {/* Budget, KPI, Timeline in a grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                予算
              </label>
              <Input
                value={stepData.budget}
                onChange={(e) => patchStep({ budget: e.target.value })}
                placeholder="例：50万円/月"
                className="text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                KPI
              </label>
              <Input
                value={stepData.kpi}
                onChange={(e) => patchStep({ kpi: e.target.value })}
                placeholder="例：認知度 20% UP"
                className="text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                タイムライン
              </label>
              <Input
                value={stepData.timeline}
                onChange={(e) => patchStep({ timeline: e.target.value })}
                placeholder="例：Q1〜Q2"
                className="text-sm"
              />
            </div>
          </div>

          {/* Note */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              メモ・補足
            </label>
            <Textarea
              value={stepData.note}
              onChange={(e) => patchStep({ note: e.target.value })}
              placeholder="この施策ステップに関する補足情報・注意事項を記述してください。"
              className="min-h-[70px] resize-none text-sm"
              rows={3}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function Promotion4PPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [entry, setEntry] = useState<FrameworkEntryDto | null>(null);
  const [promotionData, setPromotionData] = useState<PromotionData>(
    DEFAULT_PROMOTION_DATA
  );
  const [links, setLinks] = useState<LinkDto[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const firstStepId = STEP_DEFS[0]?.id ?? "";
  const [openSteps, setOpenSteps] = useState<Set<string>>(
    new Set(firstStepId ? [firstStepId] : [])
  );

  useEffect(() => {
    async function load() {
      try {
        const [fetchedEntry, fetchedLinks] = await Promise.all([
          getFrameworkEntry(id, "PROMOTION_4P"),
          listLinks(id, "PROMOTION_4P"),
        ]);
        setEntry(fetchedEntry);
        setLinks(fetchedLinks);
        const raw = fetchedEntry.data as Partial<PromotionData>;
        const defaultData = makeDefaultData();
        const steps: Record<string, PromotionStep> = {};
        for (const s of STEP_DEFS) {
          const rawStep = raw.steps?.[s.id];
          steps[s.id] = rawStep
            ? {
                tactics: rawStep.tactics ?? [],
                budget: rawStep.budget ?? "",
                kpi: rawStep.kpi ?? "",
                timeline: rawStep.timeline ?? "",
                note: rawStep.note ?? "",
              }
            : (defaultData.steps[s.id] ?? makeDefaultStep());
        }
        setPromotionData({
          overallStrategy: raw.overallStrategy ?? "",
          steps,
        });
      } catch {
        setPromotionData(makeDefaultData());
      }
    }
    load();
  }, [id]);

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);
    try {
      const updated = await upsertFrameworkEntry(id, "PROMOTION_4P", {
        data: promotionData as unknown as Record<string, unknown>,
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
      const newVersion = await createFrameworkVersion(id, "PROMOTION_4P", {
        data: promotionData as unknown as Record<string, unknown>,
      });
      setEntry(newVersion);
      setMessage(`バージョン v${newVersion.version} を作成しました`);
    } catch {
      setMessage("バージョン作成に失敗しました");
    } finally {
      setIsCreatingVersion(false);
    }
  }

  function toggleStep(stepId: string) {
    setOpenSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  }

  function updateStep(stepId: string, stepData: PromotionStep) {
    setPromotionData((prev) => ({
      ...prev,
      steps: { ...prev.steps, [stepId]: stepData },
    }));
  }

  function expandAll() {
    setOpenSteps(new Set(STEP_DEFS.map((s) => s.id)));
  }

  function collapseAll() {
    setOpenSteps(new Set());
  }

  function getLinksForSubElement(subElementId: string): LinkDto[] {
    return links.filter((l) => l.subElementId === subElementId);
  }

  return (
    <div className="min-h-svh p-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <p className="text-sm text-muted-foreground mb-2">
          <Link href="/" className="hover:underline">
            プロジェクト一覧
          </Link>
          {" / "}
          <Link href={`/projects/${id}`} className="hover:underline">
            ダッシュボード
          </Link>
          {" / Promotion戦略（4P）"}
        </p>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Promotion戦略（4P）</h1>
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
          <div className="flex-1 min-w-0 flex flex-col gap-6">
            {/* Step progress indicator */}
            <div className="border rounded-lg p-4 bg-card overflow-x-auto">
              <div className="flex items-center gap-1 min-w-max">
                {STEP_DEFS.map((step, index) => {
                  const hasContent =
                    (promotionData.steps[step.id]?.tactics.length ?? 0) > 0 ||
                    promotionData.steps[step.id]?.budget !== "" ||
                    promotionData.steps[step.id]?.kpi !== "";
                  return (
                    <div key={step.id} className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (!openSteps.has(step.id)) toggleStep(step.id);
                          document
                            .getElementById(`step-${step.id}`)
                            ?.scrollIntoView({ behavior: "smooth", block: "center" });
                        }}
                        className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded text-xs transition-colors hover:bg-muted/50 ${
                          hasContent ? "opacity-100" : "opacity-60"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            hasContent
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <span className="text-xs whitespace-nowrap">
                          {step.label}
                        </span>
                      </button>
                      {index < STEP_DEFS.length - 1 && (
                        <div className="w-4 h-0.5 bg-border shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Overall strategy */}
            <div className="border rounded-lg p-4 bg-card">
              <h2 className="text-base font-semibold mb-2">プロモーション全体戦略</h2>
              <Textarea
                value={promotionData.overallStrategy}
                onChange={(e) =>
                  setPromotionData((prev) => ({
                    ...prev,
                    overallStrategy: e.target.value,
                  }))
                }
                placeholder="プロモーション戦略の全体方針・基本コンセプト・ターゲットへの訴求メッセージを記述してください。"
                className="min-h-[100px] resize-none text-sm"
                rows={4}
              />
            </div>

            {/* Step accordion */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">8ステップ施策設計</h2>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={expandAll}
                  >
                    すべて展開
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={collapseAll}
                  >
                    すべて折りたたむ
                  </Button>
                </div>
              </div>
              {STEP_DEFS.map((stepDef, index) => (
                <div key={stepDef.id} id={`step-${stepDef.id}`}>
                  <StepSection
                    stepDef={stepDef}
                    stepData={
                      promotionData.steps[stepDef.id] ?? makeDefaultStep()
                    }
                    isOpen={openSteps.has(stepDef.id)}
                    onToggle={() => toggleStep(stepDef.id)}
                    onChange={(data) => updateStep(stepDef.id, data)}
                    stepIndex={index}
                  />
                </div>
              ))}
            </div>

            {/* Raw data linker */}
            <div className="flex flex-col gap-4">
              <h2 className="text-base font-semibold">生データ紐付け</h2>
              {STEP_DEFS.map((step) => (
                <div key={step.id} className="border rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">{step.label}</p>
                  <RawDataLinker
                    projectId={id}
                    frameworkType="PROMOTION_4P"
                    subElementId={step.id}
                    existingLinks={getLinksForSubElement(step.id)}
                    onLinksChange={(updated) => {
                      const otherLinks = links.filter(
                        (l) => l.subElementId !== step.id
                      );
                      setLinks([...otherLinks, ...updated]);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right panel */}
          <aside className="w-64 shrink-0">
            <UpstreamPanel frameworkType="PROMOTION_4P" projectId={id} />
          </aside>
        </div>
      </div>
    </div>
  );
}
