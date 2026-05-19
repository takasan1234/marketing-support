import { ProjectEntity } from "@workspace/domain";

export type ProjectDto = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
};

export function toProjectDto(entity: ProjectEntity): ProjectDto {
  return {
    id: entity.id,
    name: entity.name,
    description: entity.description ?? null,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}
