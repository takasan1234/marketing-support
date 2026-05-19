import { FrameworkEntryEntity, FrameworkType } from "@workspace/domain";

export type FrameworkEntryDto = {
  id: string;
  projectId: string;
  frameworkType: FrameworkType;
  version: number;
  isLatest: boolean;
  data: Record<string, unknown>;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export function toFrameworkEntryDto(entity: FrameworkEntryEntity): FrameworkEntryDto {
  return {
    id: entity.id,
    projectId: entity.projectId,
    frameworkType: entity.frameworkType,
    version: entity.version,
    isLatest: entity.isLatest,
    data: entity.data,
    note: entity.note ?? null,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}
