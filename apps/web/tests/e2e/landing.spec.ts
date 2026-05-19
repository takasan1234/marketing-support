import { expect, test } from '@playwright/test';

test('project list page renders', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'マーケティング支援ツール' })).toBeVisible();
  await expect(page.getByRole('link', { name: '新規プロジェクト作成' })).toBeVisible();
});
