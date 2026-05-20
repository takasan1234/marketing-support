import { BaseEntity } from "./base.entity";

export interface ProjectProps {
  id: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class ProjectEntity extends BaseEntity<string> {
  private constructor(private readonly props: ProjectProps) {
    super(props.id);
  }

  static create(params: { name: string; description?: string }): ProjectEntity {
    const now = new Date();
    return new ProjectEntity({
      id: globalThis.crypto.randomUUID(),
      name: params.name,
      description: params.description ?? null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstruct(props: ProjectProps): ProjectEntity {
    return new ProjectEntity(props);
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | null {
    return this.props.description ?? null;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  updateName(name: string): ProjectEntity {
    return ProjectEntity.reconstruct({ ...this.props, name, updatedAt: new Date() });
  }

  updateDescription(description: string | null): ProjectEntity {
    return ProjectEntity.reconstruct({ ...this.props, description, updatedAt: new Date() });
  }
}
