import { expect, test } from '@playwright/test';
import {
  ensureMockApiServer,
  fwKey,
  getStore,
  persistStore,
  resetStore,
  setupPageApiRoute,
} from './mock-api';

const PROJECT_ID = 'proj-fw-1';

const EMPTY_SWOT = {
  strengths: { items: [], summary: '' },
  weaknesses: { items: [], summary: '' },
  opportunities: { items: [], summary: '' },
  threats: { items: [], summary: '' },
};

test.describe.configure({ mode: 'serial' });

test.beforeAll(async () => {
  await ensureMockApiServer();
  const store = getStore();
  store.projects = store.projects.filter((p) => p.id !== PROJECT_ID);
  store.frameworks.delete(fwKey(PROJECT_ID, 'SWOT'));
  store.links.delete(fwKey(PROJECT_ID, 'SWOT'));
  persistStore(store);
});

test.beforeEach(async ({ page }) => {
  resetStore();
  const store = getStore();
  store.projects = [
    {
      id: PROJECT_ID,
      name: 'フレームワークE2E',
      description: null,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
  ];
  store.rawData = [];
  store.frameworks.clear();
  store.links.clear();

  const now = new Date().toISOString();
  store.frameworks.set(fwKey(PROJECT_ID, 'SWOT'), {
    id: 'fe-swot-1',
    projectId: PROJECT_ID,
    frameworkType: 'SWOT',
    version: 1,
    isLatest: true,
    data: EMPTY_SWOT,
    note: null,
    createdAt: now,
    updatedAt: now,
  });
  store.links.set(fwKey(PROJECT_ID, 'SWOT'), []);
  persistStore(store);

  await setupPageApiRoute(page, EMPTY_SWOT);
});

test.describe('Frameworks', () => {
  test('SWOT page navigation', async ({ page }) => {
    const entryLoaded = page.waitForResponse(
      (res) =>
        res.url().includes('/frameworks/SWOT') &&
        res.request().method() === 'GET' &&
        res.status() === 200
    );
    await page.goto(`/projects/${PROJECT_ID}/frameworks/swot`);
    await entryLoaded;

    await expect(page.getByRole('heading', { name: 'SWOT分析' })).toBeVisible();
    await expect(page.getByText('SWOT マトリックス')).toBeVisible();
    await expect(page.getByText('v1 (最新)')).toBeVisible();
  });

  test('save matrix item via upsert API', async ({ page }) => {
    await page.goto(`/projects/${PROJECT_ID}/frameworks/swot`);

    await page.getByRole('button', { name: '+ 項目を追加' }).first().click();
    await page.getByPlaceholder('項目を入力...').first().fill('強みのE2E項目');
    await page.getByRole('button', { name: '保存', exact: true }).click();

    await expect(page.getByText('保存しました')).toBeVisible();
    await expect(page.getByPlaceholder('項目を入力...').first()).toHaveValue(
      '強みのE2E項目'
    );
  });

  test('version badge v2 after create version', async ({ page }) => {
    await page.goto(`/projects/${PROJECT_ID}/frameworks/swot`);

    await page.getByRole('button', { name: '新バージョンとして保存' }).click();

    await expect(page.getByText('バージョン v2 を作成しました')).toBeVisible();
    await expect(page.getByText('v2 (最新)')).toBeVisible();
  });

  test('dependency graph page loads', async ({ page }) => {
    await page.goto(`/projects/${PROJECT_ID}/graph`);

    await expect(page.getByRole('heading', { name: '依存グラフ' })).toBeVisible();
    await expect(page.getByText('未入力', { exact: true })).toBeVisible();
    await expect(page.getByText('入力済み', { exact: true })).toBeVisible();
    await expect(page.getByText(/フレームワーク入力済み/)).toBeVisible();
    await expect(page.locator('svg')).toBeVisible();
  });
});
