const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ProjectDto = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RawDataType =
  | "MARKET_STATS"
  | "INDUSTRY_REPORT"
  | "NEWS"
  | "CUSTOMER_RESEARCH"
  | "SNS_ANALYTICS"
  | "SEARCH_TRENDS"
  | "LOCATION_DATA"
  | "SALES_DATA"
  | "COMPETITOR_INFO"
  | "PARTNER_HEARING"
  | "FINANCIAL_DATA"
  | "EXPERT_HEARING";

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

export type FrameworkType =
  | "PEST"
  | "FIVE_FORCES"
  | "INTERNAL_ANALYSIS"
  | "VRIO"
  | "THREE_C_PLUS_C"
  | "SWOT"
  | "CROSS_SWOT"
  | "SEGMENTATION"
  | "TARGETING"
  | "POSITIONING"
  | "CONCEPT_SHEET"
  | "PRODUCT_4P"
  | "PRICE_4P"
  | "PLACE_4P"
  | "PROMOTION_4P"
  | "FOUR_C_SEVEN_P"
  | "BLUE_OCEAN"
  | "EXPERIENCE_VALUE"
  | "VALUE_ADD_METHODS"
  | "KGI_KSF_KPI"
  | "CUSTOMER_JOURNEY"
  | "CRM_OVERVIEW"
  | "CRM_ANALYSIS";

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

export type LinkDto = {
  id: string;
  frameworkEntryId: string;
  rawDataId: string;
  subElementId?: string | null;
  note?: string | null;
  createdAt: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error ${res.status}: ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ─── Projects ────────────────────────────────────────────────────────────────

export async function getProjects(): Promise<ProjectDto[]> {
  return apiFetch<ProjectDto[]>("/projects");
}

export async function createProject(
  name: string,
  description?: string
): Promise<ProjectDto> {
  return apiFetch<ProjectDto>("/projects", {
    method: "POST",
    body: JSON.stringify({ name, description }),
  });
}

export async function getProject(id: string): Promise<ProjectDto> {
  return apiFetch<ProjectDto>(`/projects/${id}`);
}

export async function updateProject(
  id: string,
  data: { name?: string; description?: string | null }
): Promise<ProjectDto> {
  return apiFetch<ProjectDto>(`/projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteProject(id: string): Promise<void> {
  return apiFetch<void>(`/projects/${id}`, { method: "DELETE" });
}

// ─── Raw Data ─────────────────────────────────────────────────────────────────

export async function listRawData(projectId: string, type?: RawDataType): Promise<RawDataDto[]> {
  const query = type ? `?type=${type}` : "";
  return apiFetch<RawDataDto[]>(`/projects/${projectId}/raw-data${query}`);
}

export async function createRawData(
  projectId: string,
  data: {
    type: RawDataType;
    title: string;
    content: string;
    sourceUrl?: string;
    sourceNote?: string;
    collectedAt?: string;
    tags?: string[];
  }
): Promise<RawDataDto> {
  return apiFetch<RawDataDto>(`/projects/${projectId}/raw-data`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getRawData(
  projectId: string,
  rawDataId: string
): Promise<RawDataDto> {
  return apiFetch<RawDataDto>(`/projects/${projectId}/raw-data/${rawDataId}`);
}

export async function updateRawData(
  projectId: string,
  rawDataId: string,
  data: {
    title?: string;
    content?: string;
    sourceUrl?: string | null;
    sourceNote?: string | null;
    collectedAt?: string;
    tags?: string[];
  }
): Promise<RawDataDto> {
  return apiFetch<RawDataDto>(
    `/projects/${projectId}/raw-data/${rawDataId}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

export async function deleteRawData(
  projectId: string,
  rawDataId: string
): Promise<void> {
  return apiFetch<void>(`/projects/${projectId}/raw-data/${rawDataId}`, {
    method: "DELETE",
  });
}

// ─── Frameworks ──────────────────────────────────────────────────────────────

export async function getFrameworkEntry(
  projectId: string,
  frameworkType: FrameworkType
): Promise<FrameworkEntryDto> {
  return apiFetch<FrameworkEntryDto>(
    `/projects/${projectId}/frameworks/${frameworkType}`
  );
}

export async function upsertFrameworkEntry(
  projectId: string,
  frameworkType: FrameworkType,
  data: { data: Record<string, unknown>; note?: string }
): Promise<FrameworkEntryDto> {
  return apiFetch<FrameworkEntryDto>(
    `/projects/${projectId}/frameworks/${frameworkType}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

export async function createFrameworkVersion(
  projectId: string,
  frameworkType: FrameworkType,
  data: { data: Record<string, unknown>; note?: string }
): Promise<FrameworkEntryDto> {
  return apiFetch<FrameworkEntryDto>(
    `/projects/${projectId}/frameworks/${frameworkType}/versions`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export async function listFrameworkVersions(
  projectId: string,
  frameworkType: FrameworkType
): Promise<FrameworkEntryDto[]> {
  return apiFetch<FrameworkEntryDto[]>(
    `/projects/${projectId}/frameworks/${frameworkType}/versions`
  );
}

// ─── Links ───────────────────────────────────────────────────────────────────

export async function listLinks(
  projectId: string,
  frameworkType: FrameworkType
): Promise<LinkDto[]> {
  return apiFetch<LinkDto[]>(
    `/projects/${projectId}/frameworks/${frameworkType}/links`
  );
}

export async function addLink(
  projectId: string,
  frameworkType: FrameworkType,
  data: { rawDataId: string; subElementId?: string; note?: string }
): Promise<LinkDto> {
  return apiFetch<LinkDto>(
    `/projects/${projectId}/frameworks/${frameworkType}/links`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export async function deleteLink(
  projectId: string,
  frameworkType: FrameworkType,
  linkId: string
): Promise<void> {
  return apiFetch<void>(
    `/projects/${projectId}/frameworks/${frameworkType}/links/${linkId}`,
    { method: "DELETE" }
  );
}
