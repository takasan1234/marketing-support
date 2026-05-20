import { expect, test } from '@playwright/test';
import {
  API_BASE,
  ensureMockApiServer,
  resetStore,
  setupPageApiRoute,
} from './mock-api';

test.describe.configure({ mode: 'serial' });

test.beforeAll(async () => {
  await ensureMockApiServer();
  const health = await fetch(`${API_BASE}/projects`);
  if (!health.ok) {
    throw new Error(`Mock API not ready: ${health.status}`);
  }
});

test.beforeEach(async ({ page }) => {
  resetStore();
  await setupPageApiRoute(page);
});

test.describe('Projects', () => {
  test('list page shows heading', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'マーケティング支援ツール' })
    ).toBeVisible();
  });

  test('create project flow: fill name, submit, appears in list', async ({ page }) => {
    const projectName = 'E2E テストプロジェクト';

    await page.goto('/projects/new');
    await page.getByLabel(/プロジェクト名/).fill(projectName);
    await page.getByRole('button', { name: '作成する' }).click();

    await expect(page).toHaveURL(/\/projects\/proj-/);
    await expect(page.getByRole('heading', { name: projectName })).toBeVisible();

    await page.goto('/');
    await expect(page.getByText(projectName)).toBeVisible();
  });

  test('navigate to project detail', async ({ page }) => {
    await page.request.post(`${API_BASE}/projects`, {
      data: {
        id: 'proj-detail-1',
        name: '詳細ページ検証',
        description: 'E2E用プロジェクト',
      },
    });

    await page.goto('/projects/proj-detail-1');

    await expect(page).toHaveURL('/projects/proj-detail-1');
    await expect(page.getByRole('heading', { name: '詳細ページ検証' })).toBeVisible();
    await expect(page.getByText('E2E用プロジェクト')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'フレームワーク一覧' })).toBeVisible();
  });
});
