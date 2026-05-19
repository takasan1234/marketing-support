import Link from "next/link";
import { Separator } from "@workspace/ui/components/separator";
import {
  FRAMEWORK_DEPENDENCIES,
  FRAMEWORK_LABELS,
  RAW_DATA_TYPE_LABELS,
  type FrameworkType,
} from "@/lib/frameworks/dependencies";

type UpstreamPanelProps = {
  frameworkType: string;
  projectId: string;
};

export function UpstreamPanel({ frameworkType, projectId }: UpstreamPanelProps) {
  const dep = FRAMEWORK_DEPENDENCIES[frameworkType as FrameworkType];
  if (!dep) {
    return (
      <div className="p-4 rounded-lg border bg-muted/30">
        <p className="text-sm text-muted-foreground">依存情報がありません</p>
      </div>
    );
  }

  // Collect unique raw data types across all sub-elements
  const allRawDataTypes = Array.from(
    new Set(dep.subElements.flatMap((se) => se.rawDataTypes))
  );

  return (
    <div className="rounded-lg border bg-card p-4 flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold mb-2">参照すべき上流フレームワーク</h3>
        {dep.upstream.length === 0 ? (
          <p className="text-xs text-muted-foreground">なし（起点フレームワーク）</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {dep.upstream.map((fw) => (
              <li key={fw}>
                <Link
                  href={`/projects/${projectId}/frameworks/${fw.toLowerCase().replace(/_/g, "-")}`}
                  className="text-xs text-primary underline hover:opacity-70"
                >
                  {FRAMEWORK_LABELS[fw] ?? fw}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-semibold mb-2">参照すべき生データ種類</h3>
        {allRawDataTypes.length === 0 ? (
          <p className="text-xs text-muted-foreground">なし</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {allRawDataTypes.map((type) => (
              <li key={type}>
                <Link
                  href={`/projects/${projectId}/raw-data?type=${type}`}
                  className="text-xs text-primary underline hover:opacity-70"
                >
                  {RAW_DATA_TYPE_LABELS[type] ?? type}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-semibold mb-2">この分析の出力先</h3>
        {dep.downstream.length === 0 ? (
          <p className="text-xs text-muted-foreground">なし（終端フレームワーク）</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {dep.downstream.map((fw) => (
              <li key={fw}>
                <Link
                  href={`/projects/${projectId}/frameworks/${fw.toLowerCase().replace(/_/g, "-")}`}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  {FRAMEWORK_LABELS[fw] ?? fw}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
