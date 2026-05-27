import type { RawDataType } from "@/lib/api-client";

// data-collector スキルが対応する公開情報の型（自社固有データは対象外）
export const COLLECTABLE_TYPES = [
  "MARKET_STATS",
  "INDUSTRY_REPORT",
  "NEWS",
  "SEARCH_TRENDS",
  "COMPETITOR_INFO",
  "SNS_ANALYTICS",
] as const satisfies readonly RawDataType[];

export type CollectableType = (typeof COLLECTABLE_TYPES)[number];

// ─── 地域（JP / グローバル） ──────────────────────────────────────────────────

export type Region = "JP" | "GLOBAL" | "UNKNOWN";

export const REGION_LABELS: Record<Region, string> = {
  JP: "日本",
  GLOBAL: "グローバル",
  UNKNOWN: "地域未設定",
};

const REGION_TAG_PREFIX = "region:";

export function regionFromTags(tags: string[]): Region {
  for (const tag of tags) {
    const normalized = tag.trim().toLowerCase();
    if (normalized === "region:jp") return "JP";
    if (normalized === "region:global") return "GLOBAL";
  }
  return "UNKNOWN";
}

// region: プレフィックスを除いた、表示用のタグ配列を返す
export function displayTags(tags: string[]): string[] {
  return tags.filter(
    (tag) => !tag.trim().toLowerCase().startsWith(REGION_TAG_PREFIX)
  );
}

// ─── 鮮度状態 ────────────────────────────────────────────────────────────────

export type FreshnessState = "fresh" | "soon" | "stale" | "none";

export const FRESHNESS_LABELS: Record<FreshnessState, string> = {
  fresh: "鮮度良好",
  soon: "鮮度低下",
  stale: "鮮度切れ",
  none: "期限なし",
};

// 収集日から有効期限までの残存割合で鮮度を判定する
export function freshnessState(
  expiresAt: string | null,
  collectedAt: string
): FreshnessState {
  if (!expiresAt) return "none";

  const nowTs = Date.now();
  const expiresTs = new Date(expiresAt).getTime();
  const collectedTs = new Date(collectedAt).getTime();

  if (nowTs >= expiresTs) return "stale";

  const totalDuration = expiresTs - collectedTs;
  const elapsed = nowTs - collectedTs;
  const remainRatio = totalDuration > 0 ? 1 - elapsed / totalDuration : 1;

  return remainRatio >= 0.5 ? "fresh" : "soon";
}
