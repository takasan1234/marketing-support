import { Badge } from "@workspace/ui/components/badge";

type VersionBadgeProps = {
  version: number;
  isLatest?: boolean;
};

export function VersionBadge({ version, isLatest = false }: VersionBadgeProps) {
  if (isLatest) {
    return (
      <Badge className="bg-green-600 text-primary-foreground hover:bg-green-700">
        v{version} (最新)
      </Badge>
    );
  }
  return (
    <Badge variant="secondary">v{version}</Badge>
  );
}
