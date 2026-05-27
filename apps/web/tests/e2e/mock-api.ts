import { readFileSync, writeFileSync } from 'node:fs';
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from '@playwright/test';

/** Single file so SSR (Next.js) and all Playwright workers share mock state */
const STORE_FILE = join(tmpdir(), 'marketing-support-e2e-store.json');

type SerializedStore = {
  projects: ProjectDto[];
  rawData: RawDataDto[];
  frameworks: [string, FrameworkEntryDto][];
  links: [string, LinkDto[]][];
};

export const API_BASE = 'http://localhost:8080/api/v1';

export const API_ROUTE = /https?:\/\/(localhost|127\.0\.0\.1):8080\/api\/v1\/.*/;

export type ProjectDto = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RawDataDto = {
  id: string;
  projectId: string;
  type: string;
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

export type FrameworkEntryDto = {
  id: string;
  projectId: string;
  frameworkType: string;
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
  createdAt: string;
};

export type E2eStore = {
  projects: ProjectDto[];
  rawData: RawDataDto[];
  frameworks: Map<string, FrameworkEntryDto>;
  links: Map<string, LinkDto[]>;
};

declare global {
  // eslint-disable-next-line no-var
  var __e2eServer: Server | undefined;
}

function deserializeStore(raw: SerializedStore): E2eStore {
  return {
    projects: raw.projects ?? [],
    rawData: raw.rawData ?? [],
    frameworks: new Map(raw.frameworks ?? []),
    links: new Map(raw.links ?? []),
  };
}

function serializeStore(store: E2eStore): SerializedStore {
  return {
    projects: store.projects,
    rawData: store.rawData,
    frameworks: Array.from(store.frameworks.entries()),
    links: Array.from(store.links.entries()),
  };
}

export function persistStore(store: E2eStore): void {
  writeFileSync(STORE_FILE, JSON.stringify(serializeStore(store)));
}

export function getStore(): E2eStore {
  try {
    const raw = JSON.parse(readFileSync(STORE_FILE, 'utf8')) as SerializedStore;
    return deserializeStore(raw);
  } catch {
    return {
      projects: [],
      rawData: [],
      frameworks: new Map(),
      links: new Map(),
    };
  }
}

export function resetStore(): void {
  persistStore({
    projects: [],
    rawData: [],
    frameworks: new Map(),
    links: new Map(),
  });
}

export function fwKey(projectId: string, frameworkType: string): string {
  return `${projectId}:${frameworkType}`;
}

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json', ...CORS_HEADERS });
  res.end(JSON.stringify(body));
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

export async function handleE2eApiRequest(
  method: string,
  pathname: string,
  body: string,
  defaultFrameworkData: Record<string, unknown> = {}
): Promise<{ status: number; body: unknown }> {
  const s = getStore();
  const path = pathname.replace(/^\/api\/v1/, '') || '/';

  if (method === 'GET' && path === '/__e2e/ping') {
    return { status: 200, body: { ok: true, mock: 'marketing-support-e2e' } };
  }

  if (method === 'GET' && path === '/projects') {
    return { status: 200, body: s.projects };
  }

  if (method === 'POST' && path === '/projects') {
    const payload = JSON.parse(body || '{}') as {
      id?: string;
      name?: string;
      description?: string;
    };
    const now = new Date().toISOString();
    const project: ProjectDto = {
      id: payload.id ?? `proj-${Date.now()}`,
      name: payload.name ?? 'Untitled',
      description: payload.description ?? null,
      createdAt: now,
      updatedAt: now,
    };
    s.projects.push(project);
    persistStore(s);
    return { status: 201, body: project };
  }

  const projectMatch = path.match(/^\/projects\/([^/]+)$/);
  if (method === 'GET' && projectMatch) {
    const project = s.projects.find((p) => p.id === projectMatch[1]);
    if (!project) return { status: 404, body: { message: 'Not found' } };
    return { status: 200, body: project };
  }

  const rawListMatch = path.match(/^\/projects\/([^/]+)\/raw-data$/);
  if (method === 'GET' && rawListMatch) {
    const projectId = rawListMatch[1]!;
    return { status: 200, body: s.rawData.filter((r) => r.projectId === projectId) };
  }

  if (method === 'POST' && rawListMatch) {
    const projectId = rawListMatch[1]!;
    const payload = JSON.parse(body || '{}') as {
      type?: string;
      title?: string;
      content?: string;
      collectedAt?: string;
    };
    const collected = new Date();
    collected.setDate(collected.getDate() - 10);
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    const now = new Date().toISOString();
    const item: RawDataDto = {
      id: `rd-${Date.now()}`,
      projectId,
      type: payload.type ?? 'MARKET_STATS',
      title: payload.title ?? 'Untitled',
      content: payload.content ?? '',
      sourceUrl: null,
      sourceNote: null,
      collectedAt: payload.collectedAt ?? collected.toISOString(),
      expiresAt: expires.toISOString(),
      tags: [],
      isFresh: true,
      createdAt: now,
      updatedAt: now,
    };
    s.rawData.push(item);
    persistStore(s);
    return { status: 201, body: item };
  }

  const fwMatch = path.match(/^\/projects\/([^/]+)\/frameworks\/([A-Z0-9_]+)$/);
  if (method === 'GET' && fwMatch) {
    const entry = s.frameworks.get(fwKey(fwMatch[1]!, fwMatch[2]!));
    if (!entry) return { status: 404, body: { message: 'Not found' } };
    return { status: 200, body: entry };
  }

  if (method === 'PUT' && fwMatch) {
    const payload = JSON.parse(body || '{}') as { data?: Record<string, unknown> };
    const now = new Date().toISOString();
    const key = fwKey(fwMatch[1]!, fwMatch[2]!);
    const existing = s.frameworks.get(key);
    const entry: FrameworkEntryDto = {
      id: existing?.id ?? `fe-${fwMatch[2]}`,
      projectId: fwMatch[1]!,
      frameworkType: fwMatch[2]!,
      version: existing?.version ?? 1,
      isLatest: true,
      data: payload.data ?? defaultFrameworkData,
      note: null,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    s.frameworks.set(key, entry);
    persistStore(s);
    return { status: 200, body: entry };
  }

  const versionMatch = path.match(
    /^\/projects\/([^/]+)\/frameworks\/([A-Z0-9_]+)\/versions$/
  );
  if (method === 'POST' && versionMatch) {
    const payload = JSON.parse(body || '{}') as { data?: Record<string, unknown> };
    const now = new Date().toISOString();
    const key = fwKey(versionMatch[1]!, versionMatch[2]!);
    const existing = s.frameworks.get(key);
    const nextVersion = (existing?.version ?? 1) + 1;
    const entry: FrameworkEntryDto = {
      id: `fe-${versionMatch[2]}-v${nextVersion}`,
      projectId: versionMatch[1]!,
      frameworkType: versionMatch[2]!,
      version: nextVersion,
      isLatest: true,
      data: payload.data ?? defaultFrameworkData,
      note: null,
      createdAt: now,
      updatedAt: now,
    };
    s.frameworks.set(key, entry);
    persistStore(s);
    return { status: 201, body: entry };
  }

  const linksMatch = path.match(
    /^\/projects\/([^/]+)\/frameworks\/([A-Z0-9_]+)\/links$/
  );
  if (method === 'GET' && linksMatch) {
    return {
      status: 200,
      body: s.links.get(fwKey(linksMatch[1]!, linksMatch[2]!)) ?? [],
    };
  }

  return { status: 404, body: { message: 'Not found' } };
}

async function routeApiRequest(req: IncomingMessage, res: ServerResponse) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    res.end();
    return;
  }
  const url = new URL(req.url ?? '/', API_BASE);
  const body = req.method === 'GET' || req.method === 'DELETE' ? '' : await readBody(req);
  const result = await handleE2eApiRequest(req.method ?? 'GET', url.pathname, body);
  json(res, result.status, result.body);
}

function startMockServer(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const server = createServer(routeApiRequest);
    server.on('error', (err: NodeJS.ErrnoException) => {
      reject(err);
    });
    server.listen(8080, 'localhost', () => {
      globalThis.__e2eServer = server;
      resolve();
    });
  });
}

async function isE2eMockRunning(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/__e2e/ping`);
    if (!res.ok) return false;
    const body = (await res.json()) as { mock?: string };
    return body.mock === 'marketing-support-e2e';
  } catch {
    return false;
  }
}

export async function ensureMockApiServer(): Promise<void> {
  if (globalThis.__e2eServer?.listening) return;

  if (await isE2eMockRunning()) return;

  if (globalThis.__e2eServer) {
    await new Promise<void>((resolve) => globalThis.__e2eServer!.close(() => resolve()));
    globalThis.__e2eServer = undefined;
  }

  try {
    await startMockServer();
  } catch (err) {
    const error = err as NodeJS.ErrnoException;
    if (error.code === 'EADDRINUSE' && (await isE2eMockRunning())) return;
    throw new Error(
      `E2E mock API failed to bind :8080 (${error.code ?? error.message}). Stop the local API server and retry.`
    );
  }
}

export async function setupPageApiRoute(
  page: Page,
  defaultFrameworkData: Record<string, unknown> = {}
) {
  await page.route('**/api/v1/**', async (route) => {
    const requestUrl = route.request().url();
    if (!API_ROUTE.test(requestUrl)) {
      await route.continue();
      return;
    }
    const request = route.request();
    if (request.method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: CORS_HEADERS });
      return;
    }
    const url = new URL(request.url());
    const result = await handleE2eApiRequest(
      request.method(),
      url.pathname,
      request.postData() ?? '',
      defaultFrameworkData
    );
    await route.fulfill({
      status: result.status,
      contentType: 'application/json',
      headers: CORS_HEADERS,
      body: JSON.stringify(result.body),
    });
  });
}

export function freshDates() {
  const collected = new Date();
  collected.setDate(collected.getDate() - 10);
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  return { collectedAt: collected.toISOString(), expiresAt: expires.toISOString() };
}

export function staleDates() {
  const collected = new Date();
  collected.setMonth(collected.getMonth() - 6);
  const expires = new Date();
  expires.setDate(expires.getDate() - 1);
  return { collectedAt: collected.toISOString(), expiresAt: expires.toISOString() };
}
