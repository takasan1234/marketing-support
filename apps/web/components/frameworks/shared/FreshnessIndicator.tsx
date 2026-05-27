import { Badge } from "@workspace/ui/components/badge";
import { FRESHNESS_LABELS, freshnessState } from "@/lib/raw-data";

type FreshnessIndicatorProps = {
  expiresAt: string | null;
  collectedAt: string;
};

export function FreshnessIndicator({
  expiresAt,
  collectedAt,
}: FreshnessIndicatorProps) {
  const state = freshnessState(expiresAt, collectedAt);

  if (state === "none") {
    return <Badge variant="secondary">{FRESHNESS_LABELS.none}</Badge>;
  }

  if (state === "stale") {
    return (
      <Badge className="bg-destructive text-destructive-foreground hover:bg-destructive">
        {FRESHNESS_LABELS.stale}
      </Badge>
    );
  }

  if (state === "fresh") {
    return (
      <Badge className="bg-green-600 text-primary-foreground hover:bg-green-700">
        {FRESHNESS_LABELS.fresh}
      </Badge>
    );
  }

  return (
    <Badge className="bg-yellow-500 text-primary-foreground hover:bg-yellow-600">
      {FRESHNESS_LABELS.soon}
    </Badge>
  );
}
