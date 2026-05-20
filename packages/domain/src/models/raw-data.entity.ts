import { BaseEntity } from "./base.entity";
import { RawDataType } from "../shared/raw-data-type";
import { calcExpiresAt } from "../raw-data/ttl";

export interface RawDataProps {
  id: string;
  projectId: string;
  type: RawDataType;
  title: string;
  content: string;
  sourceUrl?: string | null;
  sourceNote?: string | null;
  collectedAt: Date;
  expiresAt?: Date | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class RawDataEntity extends BaseEntity<string> {
  private constructor(private readonly props: RawDataProps) {
    super(props.id);
  }

  static create(params: {
    projectId: string;
    type: RawDataType;
    title: string;
    content: string;
    sourceUrl?: string;
    sourceNote?: string;
    collectedAt?: Date;
    tags?: string[];
  }): RawDataEntity {
    const now = new Date();
    const collectedAt = params.collectedAt ?? now;
    const expiresAt = calcExpiresAt(params.type, collectedAt);
    return new RawDataEntity({
      id: globalThis.crypto.randomUUID(),
      projectId: params.projectId,
      type: params.type,
      title: params.title,
      content: params.content,
      sourceUrl: params.sourceUrl ?? null,
      sourceNote: params.sourceNote ?? null,
      collectedAt,
      expiresAt,
      tags: params.tags ?? [],
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstruct(props: RawDataProps): RawDataEntity {
    return new RawDataEntity(props);
  }

  get projectId(): string {
    return this.props.projectId;
  }

  get type(): RawDataType {
    return this.props.type;
  }

  get title(): string {
    return this.props.title;
  }

  get content(): string {
    return this.props.content;
  }

  get sourceUrl(): string | null {
    return this.props.sourceUrl ?? null;
  }

  get sourceNote(): string | null {
    return this.props.sourceNote ?? null;
  }

  get collectedAt(): Date {
    return this.props.collectedAt;
  }

  get expiresAt(): Date | null | undefined {
    return this.props.expiresAt;
  }

  get tags(): string[] {
    return this.props.tags;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  isFresh(): boolean {
    if (!this.props.expiresAt) return true;
    return this.props.expiresAt > new Date();
  }

  refreshCollectedAt(collectedAt: Date): RawDataEntity {
    const expiresAt = calcExpiresAt(this.props.type, collectedAt);
    return RawDataEntity.reconstruct({ ...this.props, collectedAt, expiresAt, updatedAt: new Date() });
  }
}
