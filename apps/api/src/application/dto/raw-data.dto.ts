import { RawDataEntity } from "@workspace/domain";
import { RawDataType } from "@workspace/domain";

export type RawDataDto = {
  id: string;
  projectId: string;
  type: RawDataType;
  title: string;
  content: string;
  sourceUrl: string | null;
  sourceNote: string | null;
  collectedAt: string;
  expiresAt: string | null;
  tags: string[];
  isFresh: boolean;
  createdAt: string;
  updatedAt: string;
};

export function toRawDataDto(entity: RawDataEntity): RawDataDto {
  return {
    id: entity.id,
    projectId: entity.projectId,
    type: entity.type,
    title: entity.title,
    content: entity.content,
    sourceUrl: entity.sourceUrl ?? null,
    sourceNote: entity.sourceNote ?? null,
    collectedAt: entity.collectedAt.toISOString(),
    expiresAt: entity.expiresAt ? entity.expiresAt.toISOString() : null,
    tags: entity.tags,
    isFresh: entity.isFresh(),
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}
