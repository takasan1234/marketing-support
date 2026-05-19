import type { Project as PrismaProject } from "@prisma/client";
import { ProjectEntity } from "@workspace/domain";
import { IProjectRepository } from "@workspace/domain";
import { PrismaClient } from "@prisma/client";
import { BasePrismaRepository } from "./base.prisma-repository";

type ProjectCreateInput = {
  name: string;
  description?: string | null;
};

export class ProjectPrismaRepository
  extends BasePrismaRepository<ProjectEntity, string, PrismaProject, ProjectCreateInput>
  implements IProjectRepository
{
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  protected toDomain(model: PrismaProject): ProjectEntity {
    return ProjectEntity.reconstruct({
      id: model.id,
      name: model.name,
      description: model.description,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  protected toPersistence(entity: ProjectEntity): ProjectCreateInput {
    return {
      name: entity.name,
      description: entity.description ?? null,
    };
  }

  async findById(id: string): Promise<ProjectEntity | null> {
    const record = await this.prisma.project.findUnique({ where: { id } });
    if (!record) return null;
    return this.toDomain(record);
  }

  async save(entity: ProjectEntity): Promise<void> {
    const data = this.toPersistence(entity);
    if (!entity.id) {
      // insert — Prisma will assign a cuid
      await this.prisma.project.create({ data });
    } else {
      await this.prisma.project.upsert({
        where: { id: entity.id },
        create: { ...data, id: entity.id },
        update: data,
      });
    }
  }

  async delete(entity: ProjectEntity): Promise<void> {
    await this.prisma.project.delete({ where: { id: entity.id } });
  }

  async findAll(): Promise<ProjectEntity[]> {
    const records = await this.prisma.project.findMany({ orderBy: { createdAt: "desc" } });
    return records.map((r) => this.toDomain(r));
  }
}
