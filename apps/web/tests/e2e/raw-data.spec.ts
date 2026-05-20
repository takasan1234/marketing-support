import { expect, test } from '@playwright/test';
import {
  ensureMockApiServer,
  freshDates,
  getStore,
  persistStore,
  resetStore,
  setupPageApiRoute,
  staleDates,
} from './mock-api';

const PROJECT_ID = 'proj-raw-1';

test.describe.configure({ mode: 'serial' });

test.beforeAll(async () => {
  await ensureMockApiServer();
  const store = getStore();
  store.projects = store.projects.filter((p) => p.id !== PROJECT_ID);
  store.rawData = store.rawData.filter((r) => r.projectId !== PROJECT_ID);
  persistStore(store);
});

test.beforeEach(async ({ page }) => {
  resetStore();
  const store = getStore();
  store.projects = [
    {
      id: PROJECT_ID,
      name: '生データE2Eプロジェクト',
      description: null,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
  ];
  store.rawData = [];
  store.frameworks.clear();
  store.links.clear();
  persistStore(store);
  await setupPageApiRoute(page);
});

test.describe('Raw data', () => {
  test('navigate to raw data list for a project', async ({ page }) => {
    const fresh = freshDates();
    const store = getStore();
    const now = new Date().toISOString();
    store.rawData.push({
      id: 'rd-existing-nav',
      projectId: PROJECT_ID,
      type: 'MARKET_STATS',
      title: '既存の市場統計',
      content: 'サンプルコンテンツ',
      sourceUrl: null,
      sourceNote: null,
      collectedAt: fresh.collectedAt,
      expiresAt: fresh.expiresAt,
      tags: [],
      isFresh: true,
      createdAt: now,
      updatedAt: now,
    });
    persistStore(store);

    await page.goto(`/projects/${PROJECT_ID}/raw-data`);

    await expect(page.getByRole('heading', { name: '生データ管理' })).toBeVisible();
    await expect(page.getByText('既存の市場統計')).toBeVisible();
  });

  test('create raw data shows in list', async ({ page }) => {
    await page.goto(`/projects/${PROJECT_ID}/raw-data/new`);

    await page.getByLabel(/タイトル/).fill('新規E2E生データ');
    await page.locator('#content').fill('E2Eで追加した内容です');
    await page.getByLabel(/情報ソース URL/).fill('https://example.com/report');
    await page.getByRole('button', { name: '追加する' }).click();

    await expect(page).toHaveURL(`/projects/${PROJECT_ID}/raw-data`);
    await page.reload();
    await expect(page.getByText('新規E2E生データ')).toBeVisible();
  });

  test('freshness badges for fresh and stale data', async ({ page }) => {
    const fresh = freshDates();
    const stale = staleDates();
    const store = getStore();
    const now = new Date().toISOString();
    store.rawData.push(
      {
        id: 'rd-fresh',
        projectId: PROJECT_ID,
        type: 'NEWS',
        title: '鮮度良好データ',
        content: 'fresh',
        sourceUrl: null,
        sourceNote: null,
        collectedAt: fresh.collectedAt,
        expiresAt: fresh.expiresAt,
        tags: [],
        isFresh: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'rd-stale',
        projectId: PROJECT_ID,
        type: 'NEWS',
        title: '鮮度切れデータ',
        content: 'stale',
        sourceUrl: null,
        sourceNote: null,
        collectedAt: stale.collectedAt,
        expiresAt: stale.expiresAt,
        tags: [],
        isFresh: false,
        createdAt: now,
        updatedAt: now,
      }
    );
    persistStore(store);

    await page.goto(`/projects/${PROJECT_ID}/raw-data`);

    await expect(page.getByText('鮮度良好データ')).toBeVisible();
    await expect(page.getByText('鮮度良好', { exact: true })).toBeVisible();
    await expect(page.getByText('鮮度切れデータ')).toBeVisible();
    await expect(page.getByText('鮮度切れ', { exact: true })).toBeVisible();
  });
});
