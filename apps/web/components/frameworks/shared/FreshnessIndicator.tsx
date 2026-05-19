import { Badge } from "@workspace/ui/components/badge";

type FreshnessIndicatorProps = {
  expiresAt: string | null;
  collectedAt: string;
};

export function FreshnessIndicator({
  expiresAt,
  collectedAt,
}: FreshnessIndicatorProps) {
  if (!expiresAt) {
    return <Badge variant="secondary">期限なし</Badge>;
  }

  const nowTs = new Date().getTime();
  const expiresTs = new Date(expiresAt).getTime();
  const collectedTs = new Date(collectedAt).getTime();
  const totalDuration = expiresTs - collectedTs;
  const elapsed = nowTs - collectedTs;

  if (nowTs >= expiresTs) {
    return (
      <Badge className="bg-destructive text-destructive-foreground hover:bg-destructive">
        鮮度切れ
      </Badge>
    );
  }

  const remainRatio = totalDuration > 0 ? 1 - elapsed / totalDuration : 1;

  if (remainRatio >= 0.5) {
    return (
      <Badge className="bg-green-600 text-primary-foreground hover:bg-green-700">
        鮮度良好
      </Badge>
    );
  }

  return (
    <Badge className="bg-yellow-500 text-primary-foreground hover:bg-yellow-600">
      鮮度低下
    </Badge>
  );
}
