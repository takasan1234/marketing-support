import { BaseEntity } from "./base.entity";
import { FrameworkType } from "../shared/framework-type";

export interface FrameworkEntryProps {
  id: string;
  projectId: string;
  frameworkType: FrameworkType;
  version: number;
  isLatest: boolean;
  data: Record<string, unknown>;
  note?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class FrameworkEntryEntity extends BaseEntity<string> {
  private constructor(private readonly props: FrameworkEntryProps) {
    super(props.id);
  }

  static create(params: {
    projectId: string;
    frameworkType: FrameworkType;
    data: Record<string, unknown>;
    note?: string;
  }): FrameworkEntryEntity {
    const now = new Date();
    return new FrameworkEntryEntity({
      id: globalThis.crypto.randomUUID(),
      projectId: params.projectId,
      frameworkType: params.frameworkType,
      version: 1,
      isLatest: true,
      data: params.data,
      note: params.note ?? null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstruct(props: FrameworkEntryProps): FrameworkEntryEntity {
    return new FrameworkEntryEntity(props);
  }

  get projectId(): string {
    return this.props.projectId;
  }

  get frameworkType(): FrameworkType {
    return this.props.frameworkType;
  }

  get version(): number {
    return this.props.version;
  }

  get isLatest(): boolean {
    return this.props.isLatest;
  }

  get data(): Record<string, unknown> {
    return this.props.data;
  }

  get note(): string | null | undefined {
    return this.props.note;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  updateData(data: Record<string, unknown>): FrameworkEntryEntity {
    return FrameworkEntryEntity.reconstruct({ ...this.props, data, updatedAt: new Date() });
  }

  markNotLatest(): FrameworkEntryEntity {
    return FrameworkEntryEntity.reconstruct({ ...this.props, isLatest: false });
  }
}
