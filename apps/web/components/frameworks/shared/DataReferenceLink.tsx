import Link from "next/link";

type DataReferenceLinkProps = {
  projectId: string;
  rawDataId: string;
  title: string;
};

export function DataReferenceLink({
  projectId,
  rawDataId,
  title,
}: DataReferenceLinkProps) {
  return (
    <Link
      href={`/projects/${projectId}/raw-data/${rawDataId}`}
      className="text-sm underline text-primary hover:opacity-70 transition-opacity"
    >
      {title}
    </Link>
  );
}
