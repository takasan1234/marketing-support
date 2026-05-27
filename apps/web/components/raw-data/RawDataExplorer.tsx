"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { FreshnessIndicator } from "@/components/frameworks/shared/FreshnessIndicator";
import type { RawDataDto, RawDataType } from "@/lib/api-client";
import { RAW_DATA_TYPE_LABELS } from "@/lib/frameworks/dependencies";
import {
  REGION_LABELS,
  type FreshnessState,
  type Region,
  displayTags,
  freshnessState,
  regionFromTags,
} from "@/lib/raw-data";

type SortKey = "collected-desc" | "collected-asc" | "freshness" | "type";

const SORT_LABELS: Record<SortKey, string> = {
  "collected-desc": "収集日（新しい順）",
  "collected-asc": "収集日（古い順）",
  freshness: "鮮度（低い順）",
  type: "種類順",
};

const REGION_ORDER: Region[] = ["JP", "GLOBAL", "UNKNOWN"];
const FRESHNESS_ORDER: FreshnessState[] = ["stale", "soon", "fresh", "none"];
const FRESHNESS_FILTER_LABELS: Record<FreshnessState, string> = {
  stale: "鮮度切れ",
  soon: "鮮度低下",
  fresh: "鮮度良好",
  none: "期限なし",
};

// 鮮度の緊急度（小さいほど要対応）。並べ替えに使用
const FRESHNESS_RANK: Record<FreshnessState, number> = {
  stale: 0,
  soon: 1,
  fresh: 2,
  none: 3,
};

const REGION_BADGE_CLASS: Record<Region, string> = {
  JP: "bg-rose-600 text-primary-foreground hover:bg-rose-700",
  GLOBAL: "bg-sky-600 text-primary-foreground hover:bg-sky-700",
  UNKNOWN: "",
};

type RawDataExplorerProps = {
  projectId: string;
  items: RawDataDto[];
};

export function RawDataExplorer({ projectId, items }: RawDataExplorerProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<RawDataType | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("collected-desc");
  const [regionFilter, setRegionFilter] = useState<Set<Region>>(new Set());
  const [freshnessFilter, setFreshnessFilter] = useState<Set<FreshnessState>>(
    new Set()
  );

  const presentTypes = useMemo(() => {
    const set = new Set<RawDataType>();
    for (const item of items) set.add(item.type);
    return [...set];
  }, [items]);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return items.filter((rd) => {
      if (typeFilter !== "all" && rd.type !== typeFilter) return false;
      if (
        keyword &&
        !rd.title.toLowerCase().includes(keyword) &&
        !rd.content.toLowerCase().includes(keyword)
      ) {
        return false;
      }
      if (
        regionFilter.size > 0 &&
        !regionFilter.has(regionFromTags(rd.tags))
      ) {
        return false;
      }
      if (
        freshnessFilter.size > 0 &&
        !freshnessFilter.has(freshnessState(rd.expiresAt, rd.collectedAt))
      ) {
        return false;
      }
      return true;
    });
  }, [items, search, typeFilter, regionFilter, freshnessFilter]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      switch (sortKey) {
        case "collected-asc":
          return (
            new Date(a.collectedAt).getTime() -
            new Date(b.collectedAt).getTime()
          );
        case "freshness":
          return (
            FRESHNESS_RANK[freshnessState(a.expiresAt, a.collectedAt)] -
            FRESHNESS_RANK[freshnessState(b.expiresAt, b.collectedAt)]
          );
        case "type":
          return a.type.localeCompare(b.type);
        case "collected-desc":
        default:
          return (
            new Date(b.collectedAt).getTime() -
            new Date(a.collectedAt).getTime()
          );
      }
    });
    return list;
  }, [filtered, sortKey]);

  // 種類ごとにグループ化（sorted の並びを維持）
  const groups = useMemo(() => {
    const map = new Map<RawDataType, RawDataDto[]>();
    for (const rd of sorted) {
      const arr = map.get(rd.type);
      if (arr) arr.push(rd);
      else map.set(rd.type, [rd]);
    }
    return [...map.entries()];
  }, [sorted]);

  function toggleRegion(region: Region) {
    setRegionFilter((prev) => {
      const next = new Set(prev);
      if (next.has(region)) next.delete(region);
      else next.add(region);
      return next;
    });
  }

  function toggleFreshness(state: FreshnessState) {
    setFreshnessFilter((prev) => {
      const next = new Set(prev);
      if (next.has(state)) next.delete(state);
      else next.add(state);
      return next;
    });
  }

  return (
    <div>
      {/* コントロール */}
      <div className="mb-4 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="タイトル・本文で検索"
            className="max-w-xs"
          />
          <div className="w-48">
            <Select
              value={typeFilter}
              onValueChange={(v) => setTypeFilter(v as RawDataType | "all")}
            >
              <SelectTrigger>
                <SelectValue placeholder="種類: すべて" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">種類: すべて</SelectItem>
                {presentTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {RAW_DATA_TYPE_LABELS[t] ?? t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-56">
            <Select
              value={sortKey}
              onValueChange={(v) => setSortKey(v as SortKey)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                  <SelectItem key={k} value={k}>
                    {SORT_LABELS[k]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            地域:
          </span>
          {REGION_ORDER.map((region) => (
            <Button
              key={region}
              type="button"
              size="xs"
              variant={regionFilter.has(region) ? "default" : "outline"}
              onClick={() => toggleRegion(region)}
            >
              {REGION_LABELS[region]}
            </Button>
          ))}
          <span className="ml-3 text-xs font-medium text-muted-foreground">
            鮮度:
          </span>
          {FRESHNESS_ORDER.map((state) => (
            <Button
              key={state}
              type="button"
              size="xs"
              variant={freshnessFilter.has(state) ? "default" : "outline"}
              onClick={() => toggleFreshness(state)}
            >
              {FRESHNESS_FILTER_LABELS[state]}
            </Button>
          ))}
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <p>該当する生データがありません。</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map(([type, list]) => (
            <section key={type}>
              <div className="mb-2 flex items-center gap-2">
                <h2 className="text-sm font-semibold">
                  {RAW_DATA_TYPE_LABELS[type] ?? type}
                </h2>
                <Badge variant="secondary" className="text-xs">
                  {list.length}件
                </Badge>
              </div>
              <div className="flex flex-col gap-2">
                {list.map((rd) => {
                  const region = regionFromTags(rd.tags);
                  const tags = displayTags(rd.tags);
                  return (
                    <Link
                      key={rd.id}
                      href={`/projects/${projectId}/raw-data/${rd.id}`}
                      className="block rounded-lg border p-4 transition-colors hover:border-primary"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium">
                              {rd.title}
                            </span>
                            {region !== "UNKNOWN" && (
                              <Badge
                                className={`text-xs ${REGION_BADGE_CLASS[region]}`}
                              >
                                {REGION_LABELS[region]}
                              </Badge>
                            )}
                            {tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <p className="line-clamp-1 text-xs text-muted-foreground">
                            {rd.content}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            収集日:{" "}
                            {new Date(rd.collectedAt).toLocaleDateString(
                              "ja-JP"
                            )}
                            {rd.expiresAt && (
                              <>
                                {" / "}有効期限:{" "}
                                {new Date(rd.expiresAt).toLocaleDateString(
                                  "ja-JP"
                                )}
                              </>
                            )}
                          </p>
                        </div>
                        <div className="shrink-0">
                          <FreshnessIndicator
                            expiresAt={rd.expiresAt}
                            collectedAt={rd.collectedAt}
                          />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
