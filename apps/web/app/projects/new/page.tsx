"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { createProject } from "@/lib/api-client";

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("プロジェクト名は必須です");
      return;
    }

    setIsSubmitting(true);
    try {
      const project = await createProject(
        name.trim(),
        description.trim() || undefined
      );
      router.push(`/projects/${project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "作成に失敗しました");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-svh p-6">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-6">新規プロジェクト作成</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">
              プロジェクト名 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例：2025年度 観光地マーケティング計画"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">説明（任意）</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="プロジェクトの目的や概要を記入してください"
              rows={4}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "作成中..." : "作成する"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
