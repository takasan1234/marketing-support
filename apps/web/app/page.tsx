import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@workspace/ui/components/card";
import { getProjects } from "@/lib/api-client";

export default async function Page() {
  let projects: Awaited<ReturnType<typeof getProjects>> = [];
  try {
    projects = await getProjects();
  } catch {
    // API not running in build/typecheck — show empty list
  }

  return (
    <div className="min-h-svh p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">マーケティング支援ツール</h1>
            <p className="text-muted-foreground mt-1">
              プロジェクトを選択してフレームワーク分析を開始してください
            </p>
          </div>
          <Button asChild>
            <Link href="/projects/new">新規プロジェクト作成</Link>
          </Button>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p>プロジェクトがまだありません。</p>
            <p className="mt-2">
              <Link href="/projects/new" className="underline">
                最初のプロジェクトを作成する
              </Link>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="block"
              >
                <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="text-base">{project.name}</CardTitle>
                    {project.description && (
                      <CardDescription className="line-clamp-2">
                        {project.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      作成日:{" "}
                      {new Date(project.createdAt).toLocaleDateString("ja-JP")}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
